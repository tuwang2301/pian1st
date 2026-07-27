// Zustand store for Pian1st — Chord Pad Live Play Mode with Pattern Tracker

import { create } from 'zustand';
import { NoteName, transposeChord } from '../lib/music/chords';
import { padEngine, AudioSettings, DEFAULT_AUDIO_SETTINGS } from '../lib/audio/padEngine';
import { metronomeEngine } from '../lib/audio/metronomeEngine';
import { parseChordSheet } from '../lib/music/chordParser';

export const ERGONOMIC_HOTKEYS = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V'];

export interface SequenceItem {
  id: string;
  chord: string;
  lyric?: string;
}

export interface UniquePad {
  chord: string;
  hotkey: string;
  category: 'primary' | 'secondary' | 'passing';
}

export interface PadSection {
  id: string;
  name: string;
  sequence: SequenceItem[];
  uniquePads: UniquePad[];
}

export function buildUniquePads(sequence: SequenceItem[]): UniquePad[] {
  const seen = new Set<string>();
  const uniquePads: UniquePad[] = [];

  for (const item of sequence) {
    if (!seen.has(item.chord)) {
      seen.add(item.chord);
      const idx = uniquePads.length;
      if (idx >= ERGONOMIC_HOTKEYS.length) break;

      const hotkey = ERGONOMIC_HOTKEYS[idx];
      const category: UniquePad['category'] =
        idx < 4 ? 'primary' : idx < 8 ? 'secondary' : 'passing';

      uniquePads.push({ chord: item.chord, hotkey, category });
    }
  }

  return uniquePads;
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
  activePadKey: string | null;         // `${sectionId}:${uniquePadIndex}`
  activeSequenceIndex: number;          // Current step in Sequence Ribbon

  // Audio Settings
  audioSettings: AudioSettings;

  // Raw chord sheet
  chordSheetText: string;

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
  addChordToSection: (sectionId: string, chord: string, lyric?: string) => void;
  removeChordFromSection: (sectionId: string, idx: number) => void;
  addSection: () => void;
  removeSection: (id: string) => void;

  // Chord sheet parser
  setChordSheetText: (text: string) => void;
  parseAndLoadChordSheet: () => void;

  // Audio
  updateAudioSettings: (partial: Partial<AudioSettings>) => void;

  // Pad trigger (by unique pad index 0-11 or hotkey)
  triggerPad: (sectionId: string, padIdx: number) => void;
  triggerPadByHotkey: (hotkey: string) => void;
  stepSequence: (direction: 'next' | 'prev') => void;

  // Presets
  loadTimEmPreset: () => void;
  loadNeuNhuTaChangConPreset: () => void;
}

const DEFAULT_TIM_EM_SEQUENCE: SequenceItem[] = [
  { id: 'te-1', chord: 'C', lyric: 'Tìm em giữa' },
  { id: 'te-2', chord: 'G/B', lyric: 'đêm dài' },
  { id: 'te-3', chord: 'Am', lyric: 'côi cút' },
  { id: 'te-4', chord: 'Em/G', lyric: 'bóng hình' },
  { id: 'te-5', chord: 'F', lyric: 'Dù biết em' },
  { id: 'te-6', chord: 'C/E', lyric: 'xa rồi' },
  { id: 'te-7', chord: 'Dm7', lyric: 'mãi mãi' },
  { id: 'te-8', chord: 'G7', lyric: 'không về...' },
  { id: 'te-9', chord: 'C', lyric: 'Tìm em giữa' },
  { id: 'te-10', chord: 'G/B', lyric: 'đêm dài' },
  { id: 'te-11', chord: 'Am', lyric: 'côi cút' },
  { id: 'te-12', chord: 'Em/G', lyric: 'bóng hình' },
  { id: 'te-13', chord: 'F', lyric: 'Dù biết em' },
  { id: 'te-14', chord: 'C/E', lyric: 'xa rồi' },
  { id: 'te-15', chord: 'Dm7', lyric: 'mãi mãi' },
  { id: 'te-16', chord: 'G7', lyric: 'không về...' },
];

const DEFAULT_NEU_NHU_TA_SEQUENCE: SequenceItem[] = [
  { id: 'nn-1', chord: 'C', lyric: 'Nếu như ta' },
  { id: 'nn-2', chord: 'E7/G#', lyric: 'chẳng còn' },
  { id: 'nn-3', chord: 'Am', lyric: 'gặp lại nhau' },
  { id: 'nn-4', chord: 'C/G', lyric: 'sau vỡ tan' },
  { id: 'nn-5', chord: 'F', lyric: 'Liệu anh có' },
  { id: 'nn-6', chord: 'C/E', lyric: 'tiếc nuối' },
  { id: 'nn-7', chord: 'Dm7', lyric: 'những dở dang' },
  { id: 'nn-8', chord: 'G7', lyric: 'ngày qua...' },
  { id: 'nn-9', chord: 'C', lyric: 'Nếu như ta' },
  { id: 'nn-10', chord: 'E7/G#', lyric: 'chẳng còn' },
  { id: 'nn-11', chord: 'Am', lyric: 'gặp lại nhau' },
  { id: 'nn-12', chord: 'C/G', lyric: 'sau vỡ tan' },
  { id: 'nn-13', chord: 'F', lyric: 'Liệu anh có' },
  { id: 'nn-14', chord: 'C/E', lyric: 'tiếc nuối' },
  { id: 'nn-15', chord: 'Dm7', lyric: 'những dở dang' },
  { id: 'nn-16', chord: 'G7', lyric: 'ngày qua...' },
];

export const usePadStore = create<PadState>((set, get) => ({
  songTitle: 'Tìm Em',
  key: 'C',
  bpm: 85,
  isMetronomeRunning: false,
  activeBeat: 0,
  isRecording: false,
  isLooping: false,
  sections: [
    {
      id: 'te-verse',
      name: 'Verse (Phiên Khúc)',
      sequence: DEFAULT_TIM_EM_SEQUENCE,
      uniquePads: buildUniquePads(DEFAULT_TIM_EM_SEQUENCE),
    },
  ],
  activeSectionId: 'te-verse',
  activePadKey: null,
  activeSequenceIndex: 0,
  audioSettings: DEFAULT_AUDIO_SETTINGS,
  chordSheetText: '',

  setKey: (key: NoteName) => {
    const oldKey = get().key;
    if (oldKey === key) return;

    const noteOrder: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const diff = noteOrder.indexOf(key) - noteOrder.indexOf(oldKey);

    const sections = get().sections.map(s => {
      const newSeq = s.sequence.map(item => ({
        ...item,
        chord: transposeChord(item.chord, diff),
      }));
      return {
        ...s,
        sequence: newSeq,
        uniquePads: buildUniquePads(newSeq),
      };
    });
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
    set({ isRecording: true, isLooping: false });
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
    set({ activeSectionId: id, activePadKey: null, activeSequenceIndex: 0 });
    padEngine.resetPreviousChord();
  },

  updateSectionName: (id, name) => {
    set({ sections: get().sections.map(s => s.id === id ? { ...s, name } : s) });
  },

  addChordToSection: (sectionId, chord, lyric) => {
    set({
      sections: get().sections.map(s => {
        if (s.id !== sectionId) return s;
        const newSeq = [...s.sequence, { id: `item-${Date.now()}`, chord, lyric }];
        return {
          ...s,
          sequence: newSeq,
          uniquePads: buildUniquePads(newSeq),
        };
      }),
    });
  },

  removeChordFromSection: (sectionId, idx) => {
    set({
      sections: get().sections.map(s => {
        if (s.id !== sectionId) return s;
        const newSeq = s.sequence.filter((_, i) => i !== idx);
        return {
          ...s,
          sequence: newSeq,
          uniquePads: buildUniquePads(newSeq),
        };
      }),
    });
  },

  addSection: () => {
    const id = `sec-${Date.now()}`;
    const n = get().sections.length + 1;
    const defaultSeq = [{ id: '1', chord: 'C' }, { id: '2', chord: 'G' }, { id: '3', chord: 'Am' }, { id: '4', chord: 'F' }];
    set({
      sections: [...get().sections, {
        id,
        name: `Đoạn ${n}`,
        sequence: defaultSeq,
        uniquePads: buildUniquePads(defaultSeq),
      }],
      activeSectionId: id,
      activeSequenceIndex: 0,
    });
  },

  removeSection: (id) => {
    const sections = get().sections.filter(s => s.id !== id);
    set({ sections, activeSectionId: sections[0]?.id ?? '', activeSequenceIndex: 0 });
  },

  setChordSheetText: (text) => set({ chordSheetText: text }),

  parseAndLoadChordSheet: () => {
    const text = get().chordSheetText;
    if (!text.trim()) return;

    const parsed = parseChordSheet(text);
    if (parsed.length === 0) return;

    const sections: PadSection[] = parsed.map((s, i) => {
      const sequence: SequenceItem[] = s.chords.map((c, j) => ({
        id: `item-${i}-${j}-${Date.now()}`,
        chord: c.chord,
        lyric: c.lyric,
      }));
      return {
        id: `sec-parsed-${i}-${Date.now()}`,
        name: s.name,
        sequence,
        uniquePads: buildUniquePads(sequence),
      };
    });

    padEngine.resetPreviousChord();
    set({
      sections,
      activeSectionId: sections[0].id,
      activePadKey: null,
      activeSequenceIndex: 0,
    });
  },

  updateAudioSettings: (partial) => {
    const merged = { ...get().audioSettings, ...partial };
    set({ audioSettings: merged });

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

  triggerPad: (sectionId: string, uniquePadIdx: number) => {
    const section = get().sections.find(s => s.id === sectionId);
    if (!section || uniquePadIdx < 0 || uniquePadIdx >= section.uniquePads.length) return;

    const uniquePad = section.uniquePads[uniquePadIdx];
    const settings = get().audioSettings;

    if (get().isRecording) {
      metronomeEngine.recordPadEvent(sectionId, uniquePadIdx);
    }

    // Advance sequence timeline index to next matching chord in sequence
    const currentSeqIdx = get().activeSequenceIndex;
    let nextSeqIdx = currentSeqIdx;
    for (let offset = 1; offset <= section.sequence.length; offset++) {
      const candidateIdx = (currentSeqIdx + offset) % section.sequence.length;
      if (section.sequence[candidateIdx].chord === uniquePad.chord) {
        nextSeqIdx = candidateIdx;
        break;
      }
    }

    set({
      activePadKey: null,
      activeSequenceIndex: nextSeqIdx,
    });

    requestAnimationFrame(() => {
      set({ activePadKey: `${sectionId}:${uniquePadIdx}` });
    });

    padEngine.triggerChordPad(uniquePad.chord, settings);
  },

  triggerPadByHotkey: (hotkey: string) => {
    const sectionId = get().activeSectionId;
    const section = get().sections.find(s => s.id === sectionId);
    if (!section) return;

    const padIdx = section.uniquePads.findIndex(p => p.hotkey.toUpperCase() === hotkey.toUpperCase());
    if (padIdx !== -1) {
      get().triggerPad(sectionId, padIdx);
    }
  },

  stepSequence: (direction: 'next' | 'prev') => {
    const sectionId = get().activeSectionId;
    const section = get().sections.find(s => s.id === sectionId);
    if (!section || section.sequence.length === 0) return;

    const currentSeqIdx = get().activeSequenceIndex;
    const nextSeqIdx = direction === 'next'
      ? (currentSeqIdx + 1) % section.sequence.length
      : (currentSeqIdx <= 0 ? section.sequence.length - 1 : currentSeqIdx - 1);

    const targetChord = section.sequence[nextSeqIdx].chord;
    const uniquePadIdx = section.uniquePads.findIndex(p => p.chord === targetChord);

    if (uniquePadIdx !== -1) {
      get().triggerPad(sectionId, uniquePadIdx);
    }
  },

  loadTimEmPreset: () => {
    padEngine.resetPreviousChord();
    set({
      songTitle: 'Tìm Em',
      key: 'C',
      sections: [
        {
          id: 'te-verse',
          name: 'Verse (Phiên Khúc)',
          sequence: DEFAULT_TIM_EM_SEQUENCE,
          uniquePads: buildUniquePads(DEFAULT_TIM_EM_SEQUENCE),
        },
      ],
      activeSectionId: 'te-verse',
      activePadKey: null,
      activeSequenceIndex: 0,
    });
  },

  loadNeuNhuTaChangConPreset: () => {
    padEngine.resetPreviousChord();
    set({
      songTitle: 'Nếu Như Ta Chẳng Còn (#86874)',
      key: 'C',
      sections: [
        {
          id: 'nn-verse',
          name: 'Verse (Nếu Như Ta Chẳng Còn)',
          sequence: DEFAULT_NEU_NHU_TA_SEQUENCE,
          uniquePads: buildUniquePads(DEFAULT_NEU_NHU_TA_SEQUENCE),
        },
      ],
      activeSectionId: 'nn-verse',
      activePadKey: null,
      activeSequenceIndex: 0,
    });
  },
}));
