// Web Audio API Engine & Lookahead Scheduler for Piano Backing Track

import { getPianoVoicing, midiToFrequency } from '../music/chords';
import { getPatternById, AccompanimentPattern } from './patterns';

export interface ActiveBeatInfo {
  sectionIndex: number;
  chordIndex: number;
  chordName: string;
  beatIndex: number;
  totalBeats: number;
  activeMidiNotes: number[];
}

export type BeatCallback = (info: ActiveBeatInfo) => void;

class PianoAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private lookaheadTimer: number | null = null;

  // Timing tracking
  private bpm: number = 90;
  private nextBeatTime: number = 0;
  private currentSectionIdx: number = 0;
  private currentChordIdx: number = 0;
  private currentBeatInChord: number = 0;

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
      chords: { chord: string; beats: number }[];
    }[];
  } | null = null;

  constructor() {
    // AudioContext will be initialized on user gesture
  }

  // Ensure AudioContext is unlocked
  public async initAudio(): Promise<AudioContext> {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  // Play a single piano note (e.g. for user clicking keys on VirtualKeyboard)
  public playSingleNote(midi: number, duration: number = 1.0, velocity: number = 0.8) {
    this.initAudio().then(ctx => {
      this.triggerPianoSynthesis(midi, ctx.currentTime, duration, velocity);
    });
  }

  // Play an entire chord immediately (for previewing chord selection)
  public playChordPreview(chordStr: string) {
    this.initAudio().then(ctx => {
      const voicing = getPianoVoicing(chordStr);
      voicing.allMidi.forEach(midi => {
        const isBass = voicing.bassMidi.includes(midi);
        this.triggerPianoSynthesis(midi, ctx.currentTime, 1.2, isBass ? 0.9 : 0.75);
      });
    });
  }

  // Synthesize realistic acoustic grand piano tone with warm body lowpass filter
  private triggerPianoSynthesis(midi: number, startTime: number, duration: number, velocity: number) {
    if (!this.audioCtx || !this.masterGain) return;

    const ctx = this.audioCtx;
    const freq = midiToFrequency(midi);

    // Acoustic Piano Cabinet Lowpass Filter (eliminates harsh high frequencies)
    const cabinetFilter = ctx.createBiquadFilter();
    cabinetFilter.type = 'lowpass';
    // Dynamically adjust cutoff frequency: lower MIDI notes get lower cutoff for deep bass
    const cutoffFreq = Math.min(1600, Math.max(600, freq * 3.5));
    cabinetFilter.frequency.setValueAtTime(cutoffFreq, startTime);
    cabinetFilter.Q.setValueAtTime(1.2, startTime); // Gentle warm resonance

    cabinetFilter.connect(this.masterGain);

    // RMS volume scaling
    const vol = Math.max(0.1, Math.min(1.0, velocity * 0.65));

    // Acoustic piano harmonics: fundamental sine + soft warm triangle + sub bass
    const harmonics = [
      { type: 'sine' as OscillatorType, mult: 1, gain: 1.0 },      // Warm fundamental
      { type: 'triangle' as OscillatorType, mult: 1, gain: 0.35 },  // Body warmth
      { type: 'sine' as OscillatorType, mult: 2, gain: 0.20 },      // 2nd Harmonic (Octave)
      { type: 'triangle' as OscillatorType, mult: 3, gain: 0.08 },  // 3rd Harmonic (Fifth)
    ];

    harmonics.forEach(h => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = h.type;
      osc.frequency.setValueAtTime(freq * h.mult, startTime);

      // Natural Piano Envelope: Instant attack + exponential smooth dampening decay
      const attackTime = 0.006;
      const decayTime = Math.min(duration, 3.0);

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

    // Calculate beat duration in seconds
    const secondsPerBeat = 60 / this.bpm;

    // Check pattern steps that occur on this beat
    pattern.steps.forEach(step => {
      // Offset matches beat position in chord
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
          this.triggerPianoSynthesis(midi, stepTime, step.durationBeats * secondsPerBeat, step.velocity);
        });
      }
    });

    // Notify UI of active beat and playing notes
    if (this.onBeatUpdateCallback) {
      const delayMs = Math.max(0, (time - this.audioCtx!.currentTime) * 1000);
      setTimeout(() => {
        if (this.isPlaying && this.onBeatUpdateCallback) {
          this.onBeatUpdateCallback({
            sectionIndex: this.currentSectionIdx,
            chordIndex: this.currentChordIdx,
            chordName: chordItem.chord,
            beatIndex: this.currentBeatInChord,
            totalBeats: chordItem.beats,
            activeMidiNotes: voicing.allMidi,
          });
        }
      }, delayMs);
    }
  }

  // Advance beat pointer
  private advanceToNextBeat() {
    if (!this.songData) return;

    const secondsPerBeat = 60 / this.bpm;
    // Step by half beats (0.5) to allow 8th-note resolution arpeggios
    const stepSize = 0.5;

    this.nextBeatTime += secondsPerBeat * stepSize;
    this.currentBeatInChord += stepSize;

    const currentSection = this.songData.sections[this.currentSectionIdx];
    const currentChord = currentSection?.chords[this.currentChordIdx];

    if (currentChord && this.currentBeatInChord >= currentChord.beats) {
      this.currentBeatInChord = 0;
      this.currentChordIdx++;

      if (this.currentChordIdx >= currentSection.chords.length) {
        this.currentChordIdx = 0;
        this.currentSectionIdx = (this.currentSectionIdx + 1) % this.songData.sections.length;
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
