// Zustand store for Pian1st — Chord Pad Live Play Mode

import { create } from 'zustand';
import { NoteName, transposeChord } from '../lib/music/chords';
import { padEngine, AudioSettings, DEFAULT_AUDIO_SETTINGS } from '../lib/audio/padEngine';
import { metronomeEngine } from '../lib/audio/metronomeEngine';
import { parseChordSheet, ParsedSection } from '../lib/music/chordParser';

export interface PadSection {
  id: string;
  name: string;
  chords: string[]; // max 8
}

export interface PadState {
  // Song info
  songTitle: string;
  key: NoteName;

  // Metronome & Loop State
  bpm: number;
  isMetronomeRunning: boolean;
  activeBeat: number;
  isRecording: boolean;
  isLooping: boolean;

  // Sections / Pads
  sections: PadSection[];
  activeSectionId: string;
  activePadKey: string | null; // `${sectionId}:${chordIndex}`

  // Audio Settings
  audioSettings: AudioSettings;

  // Raw chord sheet
  chordSheetText: string;

  // UI state
  isLoaded: boolean;

  // Actions
  setKey: (key: NoteName) => void;
  setSongTitle: (title: string) => void;
  setBpm: (bpm: number) => void;

  // Metronome & Loop Controls
  toggleMetronome: () => void;
  startRecording: () => void;
  stopRecordingAndLoop: () => void;
  stopLoop: () => void;
  clearLoop: () => void;

  // Section management
  setActiveSection: (id: string) => void;
  updateSectionName: (id: string, name: string) => void;
  addChordToSection: (sectionId: string, chord: string) => void;
  removeChordFromSection: (sectionId: string, idx: number) => void;
  addSection: () => void;
  removeSection: (id: string) => void;

  // Chord sheet parser
  setChordSheetText: (text: string) => void;
  parseAndLoadChordSheet: () => void;

  // Audio
  updateAudioSettings: (partial: Partial<AudioSettings>) => void;

  // Pad trigger (the core action)
  triggerPad: (sectionId: string, padIdx: number) => void;

  // Presets
  loadTimEmPreset: () => void;
}

const DEFAULT_SECTIONS: PadSection[] = [
  {
    id: 'sec-verse',
    name: 'Verse (Phiên Khúc)',
    chords: ['C', 'G/B', 'Am', 'Em/G', 'F', 'C/E', 'Dm7', 'G7'],
  },
  {
    id: 'sec-chorus',
    name: 'Chorus (Điệp Khúc)',
    chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'Dm7', 'G7'],
  },
];

export const usePadStore = create<PadState>((set, get) => ({
  songTitle: 'Tìm Em',
  key: 'C',
  bpm: 85,
  isMetronomeRunning: false,
  activeBeat: 0,
  isRecording: false,
  isLooping: false,
  sections: DEFAULT_SECTIONS,
  activeSectionId: 'sec-verse',
  activePadKey: null,
  audioSettings: DEFAULT_AUDIO_SETTINGS,
  chordSheetText: '',
  isLoaded: false,

  setKey: (key: NoteName) => {
    const oldKey = get().key;
    if (oldKey === key) return;

    const noteOrder: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const diff = noteOrder.indexOf(key) - noteOrder.indexOf(oldKey);

    const sections = get().sections.map(s => ({
      ...s,
      chords: s.chords.map(c => transposeChord(c, diff)),
    }));
    set({ key, sections });
  },

  setSongTitle: (title) => set({ songTitle: title }),

  setBpm: (bpm: number) => {
    set({ bpm });
    metronomeEngine.setBpm(bpm);
  },

  toggleMetronome: () => {
    const isRunning = metronomeEngine.toggleMetronome();
    set({ isMetronomeRunning: isRunning });

    if (isRunning) {
      metronomeEngine.setBeatCallback((beat) => {
        set({ activeBeat: beat });
      });
    } else {
      set({ activeBeat: 0 });
    }
  },

  startRecording: () => {
    metronomeEngine.setTriggerPadCallback((sectionId, padIdx) => {
      get().triggerPad(sectionId, padIdx);
    });
    metronomeEngine.startRecording();
    set({ isRecording: true, isLooping: false, isMetronomeRunning: true });
    metronomeEngine.setBeatCallback((beat) => {
      set({ activeBeat: beat });
    });
  },

  stopRecordingAndLoop: () => {
    metronomeEngine.stopRecordingAndStartLoop();
    set({ isRecording: false, isLooping: true });
  },

  stopLoop: () => {
    metronomeEngine.stopLoopPlayback();
    set({ isLooping: false });
  },

  clearLoop: () => {
    metronomeEngine.clearLoop();
    set({ isRecording: false, isLooping: false });
  },

  setActiveSection: (id) => {
    set({ activeSectionId: id, activePadKey: null });
    padEngine.resetPreviousChord();
  },

  updateSectionName: (id, name) => {
    set({ sections: get().sections.map(s => s.id === id ? { ...s, name } : s) });
  },

  addChordToSection: (sectionId, chord) => {
    set({
      sections: get().sections.map(s => {
        if (s.id !== sectionId || s.chords.length >= 8) return s;
        return { ...s, chords: [...s.chords, chord] };
      }),
    });
  },

  removeChordFromSection: (sectionId, idx) => {
    set({
      sections: get().sections.map(s => {
        if (s.id !== sectionId) return s;
        return { ...s, chords: s.chords.filter((_, i) => i !== idx) };
      }),
    });
  },

  addSection: () => {
    const id = `sec-${Date.now()}`;
    const n = get().sections.length + 1;
    set({
      sections: [...get().sections, { id, name: `Đoạn ${n}`, chords: ['C', 'G', 'Am', 'F'] }],
      activeSectionId: id,
    });
  },

  removeSection: (id) => {
    const sections = get().sections.filter(s => s.id !== id);
    set({ sections, activeSectionId: sections[0]?.id ?? '' });
  },

  setChordSheetText: (text) => set({ chordSheetText: text }),

  parseAndLoadChordSheet: () => {
    const text = get().chordSheetText;
    if (!text.trim()) return;

    const parsed = parseChordSheet(text);
    if (parsed.length === 0) return;

    const sections: PadSection[] = parsed.map((s, i) => ({
      id: `sec-parsed-${i}-${Date.now()}`,
      name: s.name,
      chords: s.chords,
    }));

    padEngine.resetPreviousChord();
    set({
      sections,
      activeSectionId: sections[0].id,
      activePadKey: null,
    });
  },

  updateAudioSettings: (partial) => {
    const merged = { ...get().audioSettings, ...partial };
    set({ audioSettings: merged });

    // Apply live audio changes
    if (partial.reverb !== undefined) padEngine.updateReverb(partial.reverb);
    if (partial.masterVolume !== undefined) padEngine.updateMasterVolume(partial.masterVolume);
    if (partial.pianoType !== undefined) {
      padEngine.ensureSamplesLoaded(partial.pianoType);
      padEngine.resetPreviousChord();
    }
    if (partial.octave !== undefined) {
      padEngine.resetPreviousChord();
    }
  },

  triggerPad: (sectionId: string, padIdx: number) => {
    const section = get().sections.find(s => s.id === sectionId);
    if (!section || padIdx < 0 || padIdx >= section.chords.length) return;

    const chordStr = section.chords[padIdx];
    const settings = get().audioSettings;

    // Record pad event if live recording is active
    if (get().isRecording) {
      metronomeEngine.recordPadEvent(sectionId, padIdx);
    }

    // Reset pad key briefly to force UI pulse effect even when clicking the same pad repeatedly
    set({ activePadKey: null });
    requestAnimationFrame(() => {
      set({ activePadKey: `${sectionId}:${padIdx}` });
    });

    padEngine.triggerChordPad(chordStr, settings);
  },

  loadTimEmPreset: () => {
    padEngine.resetPreviousChord();
    set({
      songTitle: 'Tìm Em',
      key: 'C',
      sections: [
        { id: 'te-verse', name: 'Verse (Phiên Khúc)', chords: ['C', 'G/B', 'Am', 'Em/G', 'F', 'C/E', 'Dm7', 'G7'] },
        { id: 'te-chorus', name: 'Chorus (Điệp Khúc)', chords: ['C', 'G', 'Am', 'Em', 'F', 'C', 'Dm7', 'G7'] },
      ],
      activeSectionId: 'te-verse',
      activePadKey: null,
    });
  },
}));
