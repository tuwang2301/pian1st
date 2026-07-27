// Web Audio Metronome Engine & Live Pad Loop Recorder

import { padEngine } from './padEngine';

export interface RecordedPadEvent {
  offsetMs: number;
  sectionId: string;
  padIdx: number;
}

export type MetronomeBeatCallback = (beat: number, isAccented: boolean) => void;

class MetronomeEngine {
  private audioCtx: AudioContext | null = null;
  private isMetronomeRunning: boolean = false;
  private isRecording: boolean = false;
  private isLooping: boolean = false;

  private bpm: number = 85;
  private timeSignatureBeats: number = 4;
  private currentBeat: number = 0;
  private nextBeatTime: number = 0;
  private timerId: number | null = null;

  // Recording state
  private recordStartTime: number = 0;
  private recordedEvents: RecordedPadEvent[] = [];
  private loopLengthMs: number = 0;
  private loopTimerId: number | null = null;

  private onBeatCallback: MetronomeBeatCallback | null = null;
  private triggerPadCallback: ((sectionId: string, padIdx: number) => void) | null = null;

  public async initAudio(): Promise<AudioContext> {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // ─── Metronome Controls ────────────────────────────────────────────────────

  public setBpm(bpm: number) {
    this.bpm = bpm;
  }

  public setBeatCallback(cb: MetronomeBeatCallback | null) {
    this.onBeatCallback = cb;
  }

  public setTriggerPadCallback(cb: (sectionId: string, padIdx: number) => void) {
    this.triggerPadCallback = cb;
  }

  public startMetronome() {
    this.initAudio().then(ctx => {
      this.isMetronomeRunning = true;
      this.currentBeat = 0;
      this.nextBeatTime = ctx.currentTime + 0.05;
      this.schedulerLoop();
    });
  }

  public stopMetronome() {
    this.isMetronomeRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggleMetronome(): boolean {
    if (this.isMetronomeRunning) {
      this.stopMetronome();
      return false;
    } else {
      this.startMetronome();
      return true;
    }
  }

  private schedulerLoop = () => {
    if (!this.isMetronomeRunning || !this.audioCtx) return;

    const lookahead = 0.1; // 100ms lookahead
    const interval = 25;   // 25ms interval

    while (this.nextBeatTime < this.audioCtx.currentTime + lookahead) {
      this.playClick(this.nextBeatTime, this.currentBeat === 0);

      // Notify UI
      if (this.onBeatCallback) {
        const delay = Math.max(0, (this.nextBeatTime - this.audioCtx.currentTime) * 1000);
        const beatNum = this.currentBeat + 1;
        const isAcc = this.currentBeat === 0;
        setTimeout(() => {
          if (this.isMetronomeRunning && this.onBeatCallback) {
            this.onBeatCallback(beatNum, isAcc);
          }
        }, delay);
      }

      // Advance beat
      const secondsPerBeat = 60 / this.bpm;
      this.nextBeatTime += secondsPerBeat;
      this.currentBeat = (this.currentBeat + 1) % this.timeSignatureBeats;
    }

    this.timerId = window.setTimeout(this.schedulerLoop, interval);
  };

  // High-pitched woodblock click generator
  private playClick(time: number, isAccented: boolean) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccented ? 1200 : 800, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(isAccented ? 0.35 : 0.2, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + 0.04);
  }

  // ─── Live Loop Recorder ────────────────────────────────────────────────────

  public startRecording() {
    this.initAudio().then(() => {
      this.recordedEvents = [];
      this.isRecording = true;
      this.recordStartTime = performance.now();

      // Ensure metronome is running for rhythm sync
      if (!this.isMetronomeRunning) {
        this.startMetronome();
      }
    });
  }

  public recordPadEvent(sectionId: string, padIdx: number) {
    if (!this.isRecording) return;
    const offsetMs = performance.now() - this.recordStartTime;
    this.recordedEvents.push({ offsetMs, sectionId, padIdx });
  }

  public stopRecordingAndStartLoop() {
    if (!this.isRecording) return;
    this.isRecording = false;

    if (this.recordedEvents.length === 0) return;

    this.loopLengthMs = performance.now() - this.recordStartTime;
    this.startLoopPlayback();
  }

  public startLoopPlayback() {
    if (this.recordedEvents.length === 0) return;
    this.stopLoopPlayback();

    this.isLooping = true;
    this.playLoopIteration();
  }

  private playLoopIteration = () => {
    if (!this.isLooping || this.recordedEvents.length === 0) return;

    // Schedule all events in this loop iteration
    this.recordedEvents.forEach(evt => {
      setTimeout(() => {
        if (this.isLooping && this.triggerPadCallback) {
          this.triggerPadCallback(evt.sectionId, evt.padIdx);
        }
      }, evt.offsetMs);
    });

    // Schedule next iteration at loopLengthMs
    this.loopTimerId = window.setTimeout(() => {
      if (this.isLooping) {
        this.playLoopIteration();
      }
    }, this.loopLengthMs);
  };

  public stopLoopPlayback() {
    this.isLooping = false;
    if (this.loopTimerId !== null) {
      window.clearTimeout(this.loopTimerId);
      this.loopTimerId = null;
    }
  }

  public clearLoop() {
    this.stopLoopPlayback();
    this.recordedEvents = [];
    this.isRecording = false;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getIsLooping(): boolean {
    return this.isLooping;
  }

  public getIsMetronomeRunning(): boolean {
    return this.isMetronomeRunning;
  }
}

export const metronomeEngine = new MetronomeEngine();
