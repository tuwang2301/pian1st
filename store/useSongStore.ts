// Zustand Global State Management for Piano Backing Track App

import { create } from 'zustand';
import { NoteName, transposeChord } from '../lib/music/chords';
import { TimeSignature } from '../lib/audio/patterns';
import { audioEngine, ActiveBeatInfo } from '../lib/audio/engine';

export interface ChordItem {
  id: string;
  chord: string;
  beats: number;
}

export interface SectionItem {
  id: string;
  name: string;
  patternId: string;
  repeatCount?: number; // Default 1
  chords: ChordItem[];
}

export interface SongState {
  // Song Settings
  title: string;
  key: NoteName;
  bpm: number;
  timeSignature: TimeSignature;
  sections: SectionItem[];

  // Playback Realtime State
  isPlaying: boolean;
  activeSectionIdx: number;
  activeChordIdx: number;
  activeBeatIdx: number;
  activeMidiNotes: number[];

  // Actions
  setKey: (newKey: NoteName) => void;
  setBpm: (bpm: number) => void;
  setTimeSignature: (ts: TimeSignature) => void;

  // Section Management
  addSection: (name?: string) => void;
  removeSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  updateSectionPattern: (sectionId: string, patternId: string) => void;
  updateSectionName: (sectionId: string, name: string) => void;
  updateSectionRepeatCount: (sectionId: string, count: number) => void;

  // Chord Management
  addChordToSection: (sectionId: string, chord: string, beats?: number) => void;
  removeChordFromSection: (sectionId: string, chordId: string) => void;
  updateChord: (sectionId: string, chordId: string, newChord: string, beats?: number) => void;

  // Preset Management
  loadTimEmPreset: () => void;

  // Playback Controls
  startPlay: () => void;
  stopPlay: () => void;
  togglePlay: () => void;
  updatePlaybackBeat: (info: ActiveBeatInfo) => void;
}

const DEFAULT_SECTIONS: SectionItem[] = [
  {
    id: 'sec-verse',
    name: 'Verse 1',
    patternId: 'arpeggio-44',
    chords: [
      { id: 'c1', chord: 'C', beats: 4 },
      { id: 'c2', chord: 'G', beats: 4 },
      { id: 'c3', chord: 'Am', beats: 4 },
      { id: 'c4', chord: 'F', beats: 4 },
    ],
  },
  {
    id: 'sec-chorus',
    name: 'Chorus',
    patternId: 'block-44',
    chords: [
      { id: 'c5', chord: 'C', beats: 4 },
      { id: 'c6', chord: 'G', beats: 4 },
      { id: 'c7', chord: 'Am', beats: 2 },
      { id: 'c8', chord: 'F', beats: 2 },
      { id: 'c9', chord: 'G', beats: 4 },
    ],
  },
];

export const useSongStore = create<SongState>((set, get) => ({
  title: 'Bài Hát Mới',
  key: 'C',
  bpm: 85,
  timeSignature: '4/4',
  sections: DEFAULT_SECTIONS,

  isPlaying: false,
  activeSectionIdx: -1,
  activeChordIdx: -1,
  activeBeatIdx: 0,
  activeMidiNotes: [],

  setKey: (newKey: NoteName) => {
    const oldKey = get().key;
    if (oldKey === newKey) return;

    // Calculate transpose semitones difference
    const noteOrder: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const oldIdx = noteOrder.indexOf(oldKey);
    const newIdx = noteOrder.indexOf(newKey);
    let diff = newIdx - oldIdx;

    // Automatically transpose all chords across all sections
    const transposedSections = get().sections.map(section => ({
      ...section,
      chords: section.chords.map(c => ({
        ...c,
        chord: transposeChord(c.chord, diff),
      })),
    }));

    set({ key: newKey, sections: transposedSections });
  },

  setBpm: (bpm: number) => {
    set({ bpm });
    audioEngine.setBpm(bpm);
  },

  setTimeSignature: (timeSignature: TimeSignature) => {
    set({ timeSignature });
  },

  addSection: (name?: string) => {
    const sections = get().sections;
    const newId = `sec-${Date.now()}`;
    const newSection: SectionItem = {
      id: newId,
      name: name || `Section ${sections.length + 1}`,
      patternId: get().timeSignature === '3/4' ? 'waltz-34' : 'block-44',
      chords: [
        { id: `c-${Date.now()}-1`, chord: 'C', beats: 4 },
        { id: `c-${Date.now()}-2`, chord: 'G', beats: 4 },
      ],
    };
    set({ sections: [...sections, newSection] });
  },

  removeSection: (sectionId: string) => {
    const sections = get().sections.filter(s => s.id !== sectionId);
    set({ sections });
  },

  duplicateSection: (sectionId: string) => {
    const sections = get().sections;
    const targetIdx = sections.findIndex(s => s.id === sectionId);
    if (targetIdx === -1) return;

    const source = sections[targetIdx];
    const newSection: SectionItem = {
      id: `sec-${Date.now()}`,
      name: `${source.name} (Bản sao)`,
      patternId: source.patternId,
      repeatCount: source.repeatCount || 1,
      chords: source.chords.map(c => ({
        id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        chord: c.chord,
        beats: c.beats,
      })),
    };

    const newSections = [...sections];
    newSections.splice(targetIdx + 1, 0, newSection);
    set({ sections: newSections });
  },

  updateSectionRepeatCount: (sectionId: string, count: number) => {
    const sections = get().sections.map(s => (s.id === sectionId ? { ...s, repeatCount: Math.max(1, count) } : s));
    set({ sections });
  },

  updateSectionPattern: (sectionId: string, patternId: string) => {
    const sections = get().sections.map(s => (s.id === sectionId ? { ...s, patternId } : s));
    set({ sections });
  },

  updateSectionName: (sectionId: string, name: string) => {
    const sections = get().sections.map(s => (s.id === sectionId ? { ...s, name } : s));
    set({ sections });
  },

  addChordToSection: (sectionId: string, chord: string, beats: number = 4) => {
    const sections = get().sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          chords: [...s.chords, { id: `c-${Date.now()}`, chord, beats }],
        };
      }
      return s;
    });
    set({ sections });
  },

  removeChordFromSection: (sectionId: string, chordId: string) => {
    const sections = get().sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          chords: s.chords.filter(c => c.id !== chordId),
        };
      }
      return s;
    });
    set({ sections });
  },

  updateChord: (sectionId: string, chordId: string, newChord: string, beats?: number) => {
    const sections = get().sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          chords: s.chords.map(c => (c.id === chordId ? { ...c, chord: newChord, beats: beats ?? c.beats } : c)),
        };
      }
      return s;
    });
    set({ sections });
  },

  loadTimEmPreset: () => {
    get().stopPlay();
    set({
      title: 'Tìm Em (Hợp Âm Chuẩn)',
      key: 'C',
      bpm: 78,
      timeSignature: '4/4',
      sections: [
        {
          id: 'sec-verse-timem',
          name: 'Verse (Phiên Khúc)',
          patternId: 'arpeggio-44',
          repeatCount: 2,
          chords: [
            { id: 'te-1', chord: 'C', beats: 4 },
            { id: 'te-2', chord: 'G/B', beats: 4 },
            { id: 'te-3', chord: 'Am', beats: 4 },
            { id: 'te-4', chord: 'Em/G', beats: 4 },
            { id: 'te-5', chord: 'F', beats: 4 },
            { id: 'te-6', chord: 'C/E', beats: 4 },
            { id: 'te-7', chord: 'Dm7', beats: 4 },
            { id: 'te-8', chord: 'G7', beats: 4 },
          ],
        },
        {
          id: 'sec-chorus-timem',
          name: 'Chorus (Điệp Khúc)',
          patternId: 'block-44',
          repeatCount: 2,
          chords: [
            { id: 'te-9', chord: 'C', beats: 4 },
            { id: 'te-10', chord: 'G', beats: 4 },
            { id: 'te-11', chord: 'Am', beats: 4 },
            { id: 'te-12', chord: 'Em', beats: 4 },
            { id: 'te-13', chord: 'F', beats: 4 },
            { id: 'te-14', chord: 'C', beats: 4 },
            { id: 'te-15', chord: 'Dm7', beats: 4 },
            { id: 'te-16', chord: 'G7', beats: 4 },
          ],
        },
      ],
    });
  },

  startPlay: () => {
    const { key, bpm, sections } = get();
    set({ isPlaying: true });

    audioEngine.startPlayback(
      { key, bpm, sections },
      (info: ActiveBeatInfo) => {
        get().updatePlaybackBeat(info);
      }
    );
  },

  stopPlay: () => {
    audioEngine.stopPlayback();
    set({
      isPlaying: false,
      activeSectionIdx: -1,
      activeChordIdx: -1,
      activeBeatIdx: 0,
      activeMidiNotes: [],
    });
  },

  togglePlay: () => {
    if (get().isPlaying) {
      get().stopPlay();
    } else {
      get().startPlay();
    }
  },

  updatePlaybackBeat: (info: ActiveBeatInfo) => {
    set({
      activeSectionIdx: info.sectionIndex,
      activeChordIdx: info.chordIndex,
      activeBeatIdx: Math.floor(info.beatIndex),
      activeMidiNotes: info.activeMidiNotes,
    });
  },
}));
