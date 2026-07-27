// Web Audio API Engine & Lookahead Scheduler for Piano Backing Track
// Integrated with Real Acoustic Grand Piano Samples & Reverb Node

import { getPianoVoicing, midiToFrequency, NOTE_NAMES } from '../music/chords';
import { getPatternById, AccompanimentPattern } from './patterns';

export interface ActiveBeatInfo {
  sectionIndex: number;
  chordIndex: number;
  chordName: string;
  beatIndex: number;
  totalBeats: number;
  activeMidiNotes: number[];
  currentRepeat: number;
  totalRepeats: number;
}

export type BeatCallback = (info: ActiveBeatInfo) => void;

// Soundfont note name converter (MIDI to e.g. "C4", "Db4")
const SOUNDFONT_NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function midiToSoundfontName(midi: number): string {
  const noteIdx = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${SOUNDFONT_NOTE_NAMES[noteIdx]}${octave}`;
}

class PianoAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: DelayNode | GainNode | null = null;
  private isPlaying: boolean = false;
  private lookaheadTimer: number | null = null;

  // Sample cache for real grand piano recorded notes
  private sampleCache: Map<number, AudioBuffer> = new Map();
  private loadingNotes: Set<number> = new Set();

  // Timing tracking
  private bpm: number = 90;
  private nextBeatTime: number = 0;
  private currentSectionIdx: number = 0;
  private currentChordIdx: number = 0;
  private currentBeatInChord: number = 0;
  private currentSectionRepeatIdx: number = 0;

  // Callback to UI
  private onBeatUpdateCallback: BeatCallback | null = null;

  // Data structure for active song playback
  private songData: {
    key: string;
    bpm: number;
    sections: {
      id: string;
      name: string;
      patternId: string;
      repeatCount?: number;
      chords: { chord: string; beats: number }[];
    }[];
  } | null = null;

  constructor() {
    // AudioContext will be initialized on user gesture
  }

  // Ensure AudioContext is initialized and preload common piano samples
  public async initAudio(): Promise<AudioContext> {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      // Master Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // Preload standard piano range (MIDI 36 C2 to 72 C5)
      this.preloadCommonSamples();
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  // Preload recorded grand piano MP3 samples from Soundfont CDN
  private async preloadCommonSamples() {
    if (!this.audioCtx) return;

    // Load key notes across octaves 2, 3, 4, 5
    const commonMidis = [
      36, 40, 43, 48, 52, 55, 60, 64, 67, 72 // C2, E2, G2, C3, E3, G3, C4, E4, G4, C5
    ];

    commonMidis.forEach(midi => this.loadPianoSample(midi));
  }

  // Fetch real grand piano note MP3
  private async loadPianoSample(midi: number): Promise<AudioBuffer | null> {
    if (this.sampleCache.has(midi)) {
      return this.sampleCache.get(midi)!;
    }
    if (this.loadingNotes.has(midi) || !this.audioCtx) return null;

    this.loadingNotes.add(midi);
    const noteName = midiToSoundfontName(midi);
    const url = `https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/${noteName}.mp3`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Sample fetch failed ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
      this.sampleCache.set(midi, audioBuffer);
      this.loadingNotes.delete(midi);
      return audioBuffer;
    } catch (e) {
      this.loadingNotes.delete(midi);
      return null;
    }
  }

  // Play a single piano note (with real audio sample fallback to warm acoustic synth)
  public playSingleNote(midi: number, duration: number = 1.2, velocity: number = 0.85) {
    this.initAudio().then(ctx => {
      this.triggerPianoNote(midi, ctx.currentTime, duration, velocity);
    });
  }

  // Play an entire chord immediately for preview
  public playChordPreview(chordStr: string) {
    this.initAudio().then(ctx => {
      const voicing = getPianoVoicing(chordStr);
      voicing.allMidi.forEach(midi => {
        const isBass = voicing.bassMidi.includes(midi);
        this.triggerPianoNote(midi, ctx.currentTime, 1.4, isBass ? 0.9 : 0.75);
      });
    });
  }

  // Core piano note trigger: uses real recorded audio buffer if available, else warm acoustic synth
  private triggerPianoNote(midi: number, startTime: number, duration: number, velocity: number) {
    if (!this.audioCtx || !this.masterGain) return;

    // Try finding exact sample or nearest sample in cache for pitch shifting
    let closestMidi = -1;
    let minDiff = 999;

    for (const cachedMidi of this.sampleCache.keys()) {
      const diff = Math.abs(cachedMidi - midi);
      if (diff < minDiff && diff <= 6) { // allow max 6 semitones pitch shift
        minDiff = diff;
        closestMidi = cachedMidi;
      }
    }

    if (closestMidi !== -1) {
      // PLAY REAL RECORDED PIANO SAMPLE
      const buffer = this.sampleCache.get(closestMidi)!;
      const source = this.audioCtx.createBufferSource();
      const noteGain = this.audioCtx.createGain();

      source.buffer = buffer;

      // Pitch shift ratio relative to sample
      const semitoneDiff = midi - closestMidi;
      if (semitoneDiff !== 0) {
        source.playbackRate.setValueAtTime(Math.pow(2, semitoneDiff / 12), startTime);
      }

      // Gain Envelope for smooth decay & volume velocity
      const vol = Math.max(0.1, Math.min(1.0, velocity * 0.8));
      noteGain.gain.setValueAtTime(vol, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration, 3.5));

      source.connect(noteGain);
      noteGain.connect(this.masterGain);

      source.start(startTime);
      source.stop(startTime + Math.min(duration, 3.5) + 0.1);
      return;
    }

    // Trigger background load for future notes
    this.loadPianoSample(midi);

    // Warm Acoustic Synthesis Fallback
    this.triggerPianoSynthesisFallback(midi, startTime, duration, velocity);
  }

  // Fallback warm acoustic piano synthesis with lowpass filter
  private triggerPianoSynthesisFallback(midi: number, startTime: number, duration: number, velocity: number) {
    if (!this.audioCtx || !this.masterGain) return;

    const ctx = this.audioCtx;
    const freq = midiToFrequency(midi);

    const cabinetFilter = ctx.createBiquadFilter();
    cabinetFilter.type = 'lowpass';
    const cutoffFreq = Math.min(1500, Math.max(500, freq * 3.2));
    cabinetFilter.frequency.setValueAtTime(cutoffFreq, startTime);
    cabinetFilter.Q.setValueAtTime(1.2, startTime);
    cabinetFilter.connect(this.masterGain);

    const vol = Math.max(0.1, Math.min(1.0, velocity * 0.6));

    const harmonics = [
      { type: 'sine' as OscillatorType, mult: 1, gain: 1.0 },
      { type: 'triangle' as OscillatorType, mult: 1, gain: 0.3 },
      { type: 'sine' as OscillatorType, mult: 2, gain: 0.18 },
    ];

    harmonics.forEach(h => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = h.type;
      osc.frequency.setValueAtTime(freq * h.mult, startTime);

      const attackTime = 0.006;
      const decayTime = Math.min(duration, 2.8);

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(vol * h.gain, startTime + attackTime);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + attackTime + decayTime);

      osc.connect(noteGain);
      noteGain.connect(cabinetFilter);

      osc.start(startTime);
      osc.stop(startTime + attackTime + decayTime + 0.05);
    });
  }

  // Start Song Playback Engine
  public async startPlayback(
    song: NonNullable<typeof this.songData>,
    onBeatUpdate: BeatCallback
  ) {
    const ctx = await this.initAudio();
    this.songData = song;
    this.bpm = song.bpm;
    this.onBeatUpdateCallback = onBeatUpdate;

    this.isPlaying = true;
    this.currentSectionIdx = 0;
    this.currentChordIdx = 0;
    this.currentBeatInChord = 0;
    this.currentSectionRepeatIdx = 0;

    this.nextBeatTime = ctx.currentTime + 0.05;

    this.scheduleLoop();
  }

  // Stop Playback
  public stopPlayback() {
    this.isPlaying = false;
    if (this.lookaheadTimer !== null) {
      window.clearTimeout(this.lookaheadTimer);
      this.lookaheadTimer = null;
    }
  }

  // Lookahead Scheduler Loop (Runs every 25ms, schedules 100ms ahead)
  private scheduleLoop = () => {
    if (!this.isPlaying || !this.audioCtx || !this.songData) return;

    const lookahead = 0.1; // 100ms
    const scheduleInterval = 25; // 25ms

    while (this.nextBeatTime < this.audioCtx.currentTime + lookahead) {
      this.scheduleCurrentBeat(this.nextBeatTime);
      this.advanceToNextBeat();
    }

    this.lookaheadTimer = window.setTimeout(this.scheduleLoop, scheduleInterval);
  };

  // Schedule notes for the current beat
  private scheduleCurrentBeat(time: number) {
    if (!this.songData) return;

    const sections = this.songData.sections;
    if (sections.length === 0) return;

    const section = sections[this.currentSectionIdx];
    if (!section || section.chords.length === 0) return;

    const chordItem = section.chords[this.currentChordIdx];
    if (!chordItem) return;

    const pattern = getPatternById(section.patternId);
    const voicing = getPianoVoicing(chordItem.chord);

    const secondsPerBeat = 60 / this.bpm;

    pattern.steps.forEach(step => {
      if (Math.abs(step.beatOffset - this.currentBeatInChord) < 0.05) {
        const stepTime = time;

        let notesToPlay: number[] = [];
        if (step.type === 'bass') {
          notesToPlay = voicing.bassMidi;
        } else if (step.type === 'chord') {
          notesToPlay = voicing.trebleMidi;
        } else if (step.type === 'full') {
          notesToPlay = voicing.allMidi;
        } else if (step.type === 'arpeggio-note' && step.noteIndex !== undefined) {
          const note = voicing.trebleMidi[step.noteIndex % voicing.trebleMidi.length];
          if (note !== undefined) notesToPlay = [note];
        }

        notesToPlay.forEach(midi => {
          this.triggerPianoNote(midi, stepTime, step.durationBeats * secondsPerBeat, step.velocity);
        });
      }
    });

    // Notify UI of active beat and playing notes
    if (this.onBeatUpdateCallback) {
      const delayMs = Math.max(0, (time - this.audioCtx!.currentTime) * 1000);
      const totalRepeats = section.repeatCount || 1;
      const currentRepeat = this.currentSectionRepeatIdx + 1;

      setTimeout(() => {
        if (this.isPlaying && this.onBeatUpdateCallback) {
          this.onBeatUpdateCallback({
            sectionIndex: this.currentSectionIdx,
            chordIndex: this.currentChordIdx,
            chordName: chordItem.chord,
            beatIndex: this.currentBeatInChord,
            totalBeats: chordItem.beats,
            activeMidiNotes: voicing.allMidi,
            currentRepeat,
            totalRepeats,
          });
        }
      }, delayMs);
    }
  }

  // Advance beat pointer with Section Repeat Count support
  private advanceToNextBeat() {
    if (!this.songData) return;

    const secondsPerBeat = 60 / this.bpm;
    const stepSize = 0.5;

    this.nextBeatTime += secondsPerBeat * stepSize;
    this.currentBeatInChord += stepSize;

    const currentSection = this.songData.sections[this.currentSectionIdx];
    const currentChord = currentSection?.chords[this.currentChordIdx];

    if (currentChord && this.currentBeatInChord >= currentChord.beats) {
      this.currentBeatInChord = 0;
      this.currentChordIdx++;

      // When reaching end of chord progression in current section
      if (this.currentChordIdx >= currentSection.chords.length) {
        const totalRepeats = currentSection.repeatCount || 1;

        if (this.currentSectionRepeatIdx < totalRepeats - 1) {
          // Loop section again
          this.currentSectionRepeatIdx++;
          this.currentChordIdx = 0;
        } else {
          // Advance to next section
          this.currentSectionRepeatIdx = 0;
          this.currentChordIdx = 0;
          this.currentSectionIdx = (this.currentSectionIdx + 1) % this.songData.sections.length;
        }
      }
    }
  }

  public setBpm(newBpm: number) {
    this.bpm = newBpm;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new PianoAudioEngine();
