// Chord Pad Live Play Audio Engine
// Real recorded grand piano samples + ConvolutionReverb + DynamicsCompressor

import { getPianoVoicing, midiToFrequency } from '../music/chords';
import { findClosestVoicing } from './voiceleading';

export interface AudioSettings {
  octave: number;           // 2–5, default 3
  pianoType: 'grand' | 'upright' | 'electric';
  reverb: number;           // 0.0–1.0
  velocity: 'soft' | 'medium' | 'strong';
  sustain: number;          // 0.5–5.0 seconds
  masterVolume: number;     // 0.0–1.0
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  octave: 3,
  pianoType: 'grand',
  reverb: 0.25,
  velocity: 'medium',
  sustain: 2.5,
  masterVolume: 0.9,
};

// Piano Type → Soundfont preset name
const PIANO_TYPE_PRESET: Record<AudioSettings['pianoType'], string> = {
  grand: 'acoustic_grand_piano',
  upright: 'bright_acoustic_piano',
  electric: 'electric_grand_piano',
};

const SOUNDFONT_NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function midiToSoundfontName(midi: number): string {
  const noteIdx = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${SOUNDFONT_NOTE_NAMES[noteIdx]}${octave}`;
}

// Sample key notes to preload (covering octave 2-5 range)
const PRELOAD_MIDIS = [
  36, 40, 43, 45, 48, 52, 55, 57, 60, 64, 67, 69, 72, 76, 79
];

class ChordPadEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;

  // Per-type sample cache
  private sampleCaches: Map<string, Map<number, AudioBuffer>> = new Map();
  private loadingNotes: Set<string> = new Set();

  // Currently playing notes (for fade-out on chord change)
  private activeNodes: Array<{ source: AudioBufferSourceNode; gain: GainNode }> = [];
  private activeSynthNodes: Array<{ osc: OscillatorNode; gain: GainNode }> = [];

  // Previous chord for voice leading
  private previousTrebleMidi: number[] = [];

  // ─── Initialization ───────────────────────────────────────────────────────

  public async initAudio(): Promise<AudioContext> {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      this.setupAudioGraph();
      this.preloadSamples('grand');
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  private setupAudioGraph() {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    // Dynamics Compressor (fixes "too quiet" + prevents clipping)
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-18, ctx.currentTime);
    this.compressor.knee.setValueAtTime(10, ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4, ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, ctx.currentTime);
    this.compressor.connect(ctx.destination);

    // Master Gain (louder than before)
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.2, ctx.currentTime);
    this.masterGain.connect(this.compressor);

    // Dry path
    this.dryGain = ctx.createGain();
    this.dryGain.gain.setValueAtTime(1.0, ctx.currentTime);
    this.dryGain.connect(this.masterGain);

    // Wet (Reverb) path
    this.reverbNode = ctx.createConvolver();
    this.reverbNode.buffer = this.createReverbIR(ctx, 2.4, 3.0);

    this.wetGain = ctx.createGain();
    this.wetGain.gain.setValueAtTime(0.25, ctx.currentTime); // Default reverb mix
    this.reverbNode.connect(this.wetGain);
    this.wetGain.connect(this.masterGain);
  }

  // Synthetic Impulse Response for Reverb (no external file needed)
  private createReverbIR(ctx: AudioContext, durationSec: number, decay: number): AudioBuffer {
    const sr = ctx.sampleRate;
    const length = Math.floor(sr * durationSec);
    const buffer = ctx.createBuffer(2, length, sr);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        // Exponential decay noise (concert hall impulse response approximation)
        const env = Math.pow(1 - i / length, decay);
        data[i] = (Math.random() * 2 - 1) * env;
      }
    }
    return buffer;
  }

  // ─── Sample Loading ────────────────────────────────────────────────────────

  private async preloadSamples(pianoType: AudioSettings['pianoType']) {
    PRELOAD_MIDIS.forEach(midi => this.loadSample(midi, pianoType));
  }

  private async loadSample(midi: number, pianoType: AudioSettings['pianoType']): Promise<AudioBuffer | null> {
    const preset = PIANO_TYPE_PRESET[pianoType];
    const cacheKey = `${preset}:${midi}`;

    if (!this.sampleCaches.has(preset)) {
      this.sampleCaches.set(preset, new Map());
    }
    const cache = this.sampleCaches.get(preset)!;

    if (cache.has(midi)) return cache.get(midi)!;
    if (this.loadingNotes.has(cacheKey)) return null;

    this.loadingNotes.add(cacheKey);
    const noteName = midiToSoundfontName(midi);
    const url = `https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/${preset}-mp3/${noteName}.mp3`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      const arrayBuf = await res.arrayBuffer();
      const audioBuf = await this.audioCtx!.decodeAudioData(arrayBuf);
      cache.set(midi, audioBuf);
      this.loadingNotes.delete(cacheKey);
      return audioBuf;
    } catch {
      this.loadingNotes.delete(cacheKey);
      return null;
    }
  }

  private getCachedBuffer(midi: number, pianoType: AudioSettings['pianoType']): AudioBuffer | null {
    const preset = PIANO_TYPE_PRESET[pianoType];
    return this.sampleCaches.get(preset)?.get(midi) ?? null;
  }

  private findClosestCachedMidi(midi: number, pianoType: AudioSettings['pianoType']): number {
    const preset = PIANO_TYPE_PRESET[pianoType];
    const cache = this.sampleCaches.get(preset);
    if (!cache || cache.size === 0) return -1;

    let closest = -1;
    let minDiff = 999;
    for (const cachedMidi of cache.keys()) {
      const diff = Math.abs(cachedMidi - midi);
      if (diff < minDiff && diff <= 7) {
        minDiff = diff;
        closest = cachedMidi;
      }
    }
    return closest;
  }

  // ─── Reverb Control ────────────────────────────────────────────────────────

  public updateReverb(amount: number) {
    // amount: 0.0 (dry) → 1.0 (max wet)
    if (!this.wetGain || !this.audioCtx) return;
    this.wetGain.gain.setTargetAtTime(amount * 0.8, this.audioCtx.currentTime, 0.05);
  }

  public updateMasterVolume(volume: number) {
    if (!this.masterGain || !this.audioCtx) return;
    this.masterGain.gain.setTargetAtTime(volume * 1.4, this.audioCtx.currentTime, 0.02);
  }

  // ─── Core Pad Trigger ─────────────────────────────────────────────────────

  public async triggerChordPad(chordStr: string, settings: AudioSettings) {
    const ctx = await this.initAudio();

    // Preload samples for this piano type if not already done
    if (!this.sampleCaches.has(PIANO_TYPE_PRESET[settings.pianoType])) {
      this.preloadSamples(settings.pianoType);
    }

    // Fade out all currently playing nodes
    this.fadeOutCurrentNotes(ctx);

    // Calculate voicing
    const voicing = getPianoVoicing(chordStr, settings.octave);

    // Apply voice leading to treble notes
    const ledTreble = this.previousTrebleMidi.length > 0
      ? findClosestVoicing(voicing.trebleMidi, this.previousTrebleMidi, settings.octave)
      : voicing.trebleMidi;

    this.previousTrebleMidi = ledTreble;

    const velocityGain = { soft: 0.6, medium: 0.88, strong: 1.05 }[settings.velocity];
    const now = ctx.currentTime + 0.01;

    // 1. Play Bass notes (Left Hand - Root + 5th Quinta) with punchy warm attack
    const bassStagger = 0.025; // 25ms delay between root and 5th
    voicing.bassMidi.forEach((midi, i) => {
      const delay = i * bassStagger;
      this.playNote(midi, now + delay, settings.sustain * 1.1, velocityGain * 0.95, settings.pianoType);
    });

    // 2. Play Treble notes (Right Hand - Voice Led) with natural fingerpicking roll
    const bassTotalDuration = voicing.bassMidi.length * bassStagger;
    const trebleRollSpread = 0.03; // 30ms natural roll between treble notes
    ledTreble.forEach((midi, i) => {
      const delay = bassTotalDuration + (i * trebleRollSpread);
      this.playNote(midi, now + delay, settings.sustain, velocityGain * (1.0 - i * 0.04), settings.pianoType);
    });

    // Preload any un-cached notes asynchronously for seamless future plays
    [...voicing.bassMidi, ...ledTreble].forEach(midi => {
      this.loadSample(midi, settings.pianoType);
    });
  }

  // Single note for virtual keyboard clicks
  public async playKeyNote(midi: number, settings: AudioSettings) {
    const ctx = await this.initAudio();
    const velocityGain = { soft: 0.6, medium: 0.85, strong: 1.0 }[settings.velocity];
    this.playNote(midi, ctx.currentTime + 0.01, Math.min(settings.sustain, 2.0), velocityGain, settings.pianoType);
  }

  private playNote(
    midi: number,
    startTime: number,
    durationSec: number,
    velocity: number,
    pianoType: AudioSettings['pianoType']
  ) {
    if (!this.audioCtx || !this.dryGain || !this.reverbNode) return;
    const ctx = this.audioCtx;

    const closestMidi = this.findClosestCachedMidi(midi, pianoType);
    const buffer = closestMidi !== -1 ? this.getCachedBuffer(closestMidi, pianoType) : null;

    if (buffer) {
      // Real recorded sample playback
      const source = ctx.createBufferSource();
      const noteGain = ctx.createGain();
      source.buffer = buffer;

      const semitoneDiff = midi - closestMidi;
      if (semitoneDiff !== 0) {
        source.playbackRate.setValueAtTime(Math.pow(2, semitoneDiff / 12), startTime);
      }

      noteGain.gain.setValueAtTime(velocity, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

      source.connect(noteGain);
      noteGain.connect(this.dryGain);
      noteGain.connect(this.reverbNode);

      source.start(startTime);
      source.stop(startTime + durationSec + 0.1);

      this.activeNodes.push({ source, gain: noteGain });
    } else {
      // Warm synth fallback while samples load
      this.synthFallback(midi, startTime, durationSec, velocity);
    }
  }

  private synthFallback(midi: number, startTime: number, duration: number, velocity: number) {
    if (!this.audioCtx || !this.dryGain || !this.reverbNode) return;
    const ctx = this.audioCtx;
    const freq = midiToFrequency(midi);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(1400, freq * 3.2), startTime);
    filter.Q.setValueAtTime(1.0, startTime);
    filter.connect(this.dryGain);
    filter.connect(this.reverbNode);

    const vol = velocity * 0.6;
    [
      { type: 'sine' as OscillatorType, mult: 1, g: 1.0 },
      { type: 'triangle' as OscillatorType, mult: 1, g: 0.28 },
      { type: 'sine' as OscillatorType, mult: 2, g: 0.15 },
    ].forEach(h => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = h.type;
      osc.frequency.setValueAtTime(freq * h.mult, startTime);
      g.gain.setValueAtTime(0.0001, startTime);
      g.gain.exponentialRampToValueAtTime(vol * h.g, startTime + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration, 2.5));
      osc.connect(g);
      g.connect(filter);
      osc.start(startTime);
      osc.stop(startTime + Math.min(duration, 2.5) + 0.05);
      this.activeSynthNodes.push({ osc, gain: g });
    });
  }

  // Fade out all currently playing notes (on chord change)
  private fadeOutCurrentNotes(ctx: AudioContext) {
    const now = ctx.currentTime;
    const fadeTime = 0.08; // 80ms fade-out

    this.activeNodes.forEach(({ gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setTargetAtTime(0.0001, now, fadeTime / 3);
      } catch { /* node already disconnected */ }
    });

    this.activeSynthNodes.forEach(({ gain }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setTargetAtTime(0.0001, now, fadeTime / 3);
      } catch { /* node already disconnected */ }
    });

    this.activeNodes = [];
    this.activeSynthNodes = [];
  }

  public resetPreviousChord() {
    this.previousTrebleMidi = [];
  }

  public async ensureSamplesLoaded(pianoType: AudioSettings['pianoType']) {
    await this.initAudio();
    if (!this.sampleCaches.has(PIANO_TYPE_PRESET[pianoType])) {
      await this.preloadSamples(pianoType);
    }
  }
}

export const padEngine = new ChordPadEngine();
