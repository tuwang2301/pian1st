// Zustand store for Pian1st — 2-Handed Live Chord Pad Mode (ASDF + Arrow Keys)

import { create } from 'zustand';
import { NoteName, transposeChord } from '../lib/music/chords';
import { padEngine, AudioSettings, DEFAULT_AUDIO_SETTINGS } from '../lib/audio/padEngine';
import { metronomeEngine } from '../lib/audio/metronomeEngine';
import { parseChordSheet } from '../lib/music/chordParser';

export const LEFT_HAND_HOTKEYS = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'];

export interface PadItem {
  id: string;
  chord: string;
  lyric?: string;
}

export interface LineProgression {
  id: string;
  lineName: string;
  chords: PadItem[];
}

export interface PadSection {
  id: string;
  name: string;
  lines: LineProgression[];
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

  // Sections & Line Navigation
  sections: PadSection[];
  activeSectionId: string;
  activeLineIndex: number;
  activeChordIndex: number;

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

  // Section & Line Management
  setActiveSection: (id: string) => void;
  setActiveLineIndex: (idx: number) => void;
  stepLine: (direction: 'next' | 'prev') => void;
  updateSectionName: (id: string, name: string) => void;
  addChordToSection: (sectionId: string, chord: string, lyric?: string) => void;
  removeChordFromSection: (sectionId: string, idx: number) => void;
  removeSection: (id: string) => void;

  // Triggering
  triggerChordInLine: (lineIdx: number, chordIdx: number) => void;
  triggerLeftHandHotkey: (key: string) => void;

  // Chord sheet parser
  setChordSheetText: (text: string) => void;
  parseAndLoadChordSheet: () => void;

  // Audio settings
  updateAudioSettings: (partial: Partial<AudioSettings>) => void;

  // Presets
  loadTimEmPreset: () => void;
  loadVanLuonLaAnhPreset: () => void;
  loadKhongBietGiPreset: () => void;
}

// Preset data for "Vẫn Luôn Là Anh"
const PRESET_VAN_LUON_LA_ANH_SECTION: PadSection = {
  id: 'sec-vanluonlaanh',
  name: 'Bài Hát: Vẫn Luôn Là Anh',
  lines: [
    {
      id: 'l1',
      lineName: 'Vòng A (Verse 1 - Nửa đầu)',
      chords: [
        { id: '1', chord: 'Gm', lyric: 'Vẫn luôn là' },
        { id: '2', chord: 'A', lyric: 'Bây giờ muốn nói' },
        { id: '3', chord: 'Dm', lyric: 'với em sau' },
        { id: '4', chord: 'Bb', lyric: 'này' },
      ],
    },
    {
      id: 'l2',
      lineName: 'Vòng B (Verse 1 - Nửa sau)',
      chords: [
        { id: '5', chord: 'Gm', lyric: 'Dẫu có dối' },
        { id: '6', chord: 'C', lyric: 'gian, em' },
        { id: '7', chord: 'F', lyric: 'đừng trách' },
        { id: '8', chord: 'Bb', lyric: 'than mùa' },
        { id: '9', chord: 'Gm', lyric: 'đông đã' },
        { id: '10', chord: 'A', lyric: 'làm ta' },
        { id: '11', chord: 'Dm', lyric: 'tan vỡ' },
      ],
    },
    {
      id: 'l3',
      lineName: 'Chorus (Điệp Khúc)',
      chords: [
        { id: '12', chord: 'Gm', lyric: 'Nếu mai sau này' },
        { id: '13', chord: 'C', lyric: 'nhớ đến nhau' },
        { id: '14', chord: 'F', lyric: 'quay về giây' },
        { id: '15', chord: 'Bb', lyric: 'phút đầu' },
        { id: '16', chord: 'Gm', lyric: 'Hãy nói với' },
        { id: '17', chord: 'A', lyric: 'anh ở bên' },
        { id: '18', chord: 'Dm', lyric: 'nhau...' },
      ],
    },
  ],
};

// Preset data for "Không Biết Gì"
const PRESET_KHONG_BIET_GI_SECTION: PadSection = {
  id: 'sec-khongbietgi',
  name: 'Bài Hát: Không Biết Gì',
  lines: [
    {
      id: 'k-l1',
      lineName: 'Verse (Vòng 1)',
      chords: [
        { id: 'k1', chord: 'Gmaj7', lyric: 'Giờ này em nói' },
        { id: 'k2', chord: 'Em', lyric: 'cái chi' },
        { id: 'k3', chord: 'B', lyric: 'cũng đồng ý' },
        { id: 'k4', chord: 'Gmaj7', lyric: 'Kể cả không nghe' },
        { id: 'k5', chord: 'Em', lyric: 'thấy chi' },
        { id: 'k6', chord: 'Dm7', lyric: 'cũng đều' },
        { id: 'k7', chord: 'G7', lyric: 'đồng ý' },
      ],
    },
    {
      id: 'k-l2',
      lineName: 'Verse (Vòng 2 - II-V-I Jazz)',
      chords: [
        { id: 'k8', chord: 'C', lyric: 'Mỗi khi' },
        { id: 'k9', chord: 'D', lyric: 'anh bên em' },
        { id: 'k10', chord: 'Bm7', lyric: 'chẳng cần biết' },
        { id: 'k11', chord: 'E7', lyric: 'mình biết cái gì' },
        { id: 'k12', chord: 'Am7', lyric: 'Mất bao lâu' },
        { id: 'k13', chord: 'D7', lyric: 'để biết chi' },
      ],
    },
    {
      id: 'k-l3',
      lineName: 'Chorus (Vòng Cao Trào)',
      chords: [
        { id: 'k14', chord: 'Cmaj7', lyric: 'Nhưng trái tim' },
        { id: 'k15', chord: 'Bm7', lyric: 'choán lý trí' },
        { id: 'k16', chord: 'E7', lyric: 'mỗi thứ đều' },
        { id: 'k17', chord: 'Am7', lyric: 'quên một tí' },
        { id: 'k18', chord: 'D7', lyric: 'chẳng giải quyết' },
        { id: 'k19', chord: 'Gmaj7', lyric: 'được gì' },
      ],
    },
  ],
};

const PRESET_TIM_EM_SECTION: PadSection = {
  id: 'sec-timem',
  name: 'Bài Hát: Tìm Em',
  lines: [
    {
      id: 'te-l1',
      lineName: 'Verse (Phiên Khúc)',
      chords: [
        { id: 't1', chord: 'C', lyric: 'Tìm em giữa' },
        { id: 't2', chord: 'G/B', lyric: 'đêm dài' },
        { id: 't3', chord: 'Am', lyric: 'côi cút' },
        { id: 't4', chord: 'Em/G', lyric: 'bóng hình' },
        { id: 't5', chord: 'F', lyric: 'Dù biết em' },
        { id: 't6', chord: 'C/E', lyric: 'xa rồi' },
        { id: 't7', chord: 'Dm7', lyric: 'mãi mãi' },
        { id: 't8', chord: 'G7', lyric: 'không về...' },
      ],
    },
    {
      id: 'te-l2',
      lineName: 'Chorus (Điệp Khúc)',
      chords: [
        { id: 'tc1', chord: 'C', lyric: 'Tìm em ở đâu' },
        { id: 'tc2', chord: 'G', lyric: 'trong ký ức' },
        { id: 'tc3', chord: 'Am', lyric: 'ngàn nỗi nhớ' },
        { id: 'tc4', chord: 'Em', lyric: 'đong đầy' },
        { id: 'tc5', chord: 'F', lyric: 'Đành buông tay' },
        { id: 'tc6', chord: 'C', lyric: 'nhau người ơi' },
        { id: 'tc7', chord: 'Dm7', lyric: 'từ đây...' },
        { id: 'tc8', chord: 'G7', lyric: '...' },
      ],
    },
  ],
};

export const usePadStore = create<PadState>((set, get) => ({
  songTitle: 'Vẫn Luôn Là Anh',
  key: 'D',
  bpm: 85,
  isMetronomeRunning: false,
  activeBeat: 0,
  isRecording: false,
  isLooping: false,

  sections: [PRESET_VAN_LUON_LA_ANH_SECTION],
  activeSectionId: 'sec-vanluonlaanh',
  activeLineIndex: 0,
  activeChordIndex: -1,

  audioSettings: DEFAULT_AUDIO_SETTINGS,
  chordSheetText: '',

  setKey: (key: NoteName) => {
    const oldKey = get().key;
    if (oldKey === key) return;

    const noteOrder: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const diff = noteOrder.indexOf(key) - noteOrder.indexOf(oldKey);

    const sections = get().sections.map(s => ({
      ...s,
      lines: s.lines.map(line => ({
        ...line,
        chords: line.chords.map(c => ({
          ...c,
          chord: transposeChord(c.chord, diff),
        })),
      })),
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
      const lineIdx = get().activeLineIndex;
      get().triggerChordInLine(lineIdx, padIdx);
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
    set({ activeSectionId: id, activeLineIndex: 0, activeChordIndex: -1 });
    padEngine.resetPreviousChord();
  },

  setActiveLineIndex: (idx: number) => {
    set({ activeLineIndex: idx, activeChordIndex: -1 });
    padEngine.resetPreviousChord();
  },

  stepLine: (direction: 'next' | 'prev') => {
    const section = get().sections.find(s => s.id === get().activeSectionId);
    if (!section || section.lines.length === 0) return;

    const currentLineIdx = get().activeLineIndex;
    const nextLineIdx = direction === 'next'
      ? (currentLineIdx + 1) % section.lines.length
      : (currentLineIdx <= 0 ? section.lines.length - 1 : currentLineIdx - 1);

    set({ activeLineIndex: nextLineIdx, activeChordIndex: -1 });
    padEngine.resetPreviousChord();
  },

  updateSectionName: (id, name) => {
    set({ sections: get().sections.map(s => s.id === id ? { ...s, name } : s) });
  },

  addChordToSection: (sectionId, chord, lyric) => {
    set({
      sections: get().sections.map(s => {
        if (s.id !== sectionId) return s;
        const targetLineIdx = get().activeLineIndex;
        const lines = s.lines.map((line, lIdx) => {
          if (lIdx !== targetLineIdx) return line;
          return {
            ...line,
            chords: [...line.chords, { id: `c-${Date.now()}`, chord, lyric }],
          };
        });
        return { ...s, lines };
      }),
    });
  },

  removeChordFromSection: (sectionId, idx) => {
    set({
      sections: get().sections.map(s => {
        if (s.id !== sectionId) return s;
        const targetLineIdx = get().activeLineIndex;
        const lines = s.lines.map((line, lIdx) => {
          if (lIdx !== targetLineIdx) return line;
          return {
            ...line,
            chords: line.chords.filter((_, cIdx) => cIdx !== idx),
          };
        });
        return { ...s, lines };
      }),
    });
  },

  removeSection: (id) => {
    const sections = get().sections.filter(s => s.id !== id);
    set({ sections, activeSectionId: sections[0]?.id ?? '', activeLineIndex: 0, activeChordIndex: -1 });
  },

  triggerChordInLine: (lineIdx: number, chordIdx: number) => {
    const section = get().sections.find(s => s.id === get().activeSectionId);
    if (!section || lineIdx < 0 || lineIdx >= section.lines.length) return;

    const line = section.lines[lineIdx];
    if (chordIdx < 0 || chordIdx >= line.chords.length) return;

    const item = line.chords[chordIdx];
    const settings = get().audioSettings;

    if (get().isRecording) {
      metronomeEngine.recordPadEvent(section.id, chordIdx);
    }

    set({
      activeLineIndex: lineIdx,
      activeChordIndex: chordIdx,
    });

    padEngine.triggerChordPad(item.chord, settings);
  },

  triggerLeftHandHotkey: (key: string) => {
    const hotkeyIdx = LEFT_HAND_HOTKEYS.indexOf(key.toUpperCase());
    if (hotkeyIdx === -1) return;

    const currentLineIdx = get().activeLineIndex;
    get().triggerChordInLine(currentLineIdx, hotkeyIdx);
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
      lines: s.lines.map(l => ({
        id: l.id,
        lineName: l.lineName,
        chords: l.chords.map((c, j) => ({
          id: `c-${i}-${j}-${Date.now()}`,
          chord: c.chord,
          lyric: c.lyric,
        })),
      })),
    }));

    padEngine.resetPreviousChord();
    set({
      sections,
      activeSectionId: sections[0].id,
      activeLineIndex: 0,
      activeChordIndex: -1,
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

  loadTimEmPreset: () => {
    padEngine.resetPreviousChord();
    set({
      songTitle: 'Tìm Em',
      key: 'C',
      sections: [PRESET_TIM_EM_SECTION],
      activeSectionId: 'sec-timem',
      activeLineIndex: 0,
      activeChordIndex: -1,
    });
  },

  loadVanLuonLaAnhPreset: () => {
    padEngine.resetPreviousChord();
    set({
      songTitle: 'Vẫn Luôn Là Anh',
      key: 'D',
      sections: [PRESET_VAN_LUON_LA_ANH_SECTION],
      activeSectionId: 'sec-vanluonlaanh',
      activeLineIndex: 0,
      activeChordIndex: -1,
    });
  },

  loadKhongBietGiPreset: () => {
    padEngine.resetPreviousChord();
    set({
      songTitle: 'Không Biết Gì',
      key: 'G',
      sections: [PRESET_KHONG_BIET_GI_SECTION],
      activeSectionId: 'sec-khongbietgi',
      activeLineIndex: 0,
      activeChordIndex: -1,
    });
  },
}));
