// Piano Accompaniment Pattern Definitions

export type TimeSignature = '4/4' | '3/4' | '6/8';

export interface PatternStep {
  beatOffset: number;    // Beat offset within the chord duration (e.g., 0, 0.5, 1.0, 1.5, etc.)
  type: 'bass' | 'chord' | 'arpeggio-note' | 'full';
  noteIndex?: number;    // Index into trebleMidi array for arpeggio
  velocity: number;      // 0.0 to 1.0
  durationBeats: number; // How long note sustains in beats
}

export interface AccompanimentPattern {
  id: string;
  name: string;
  description: string;
  timeSignature: TimeSignature;
  steps: PatternStep[];
}

export const PATTERN_LIBRARY: AccompanimentPattern[] = [
  {
    id: 'block-44',
    name: 'Đệm nhẹ nhàng (Block Chord)',
    description: 'Bấm nguyên hợp âm ở phách 1 và phách 3, vang tự nhiên.',
    timeSignature: '4/4',
    steps: [
      { beatOffset: 0, type: 'full', velocity: 0.85, durationBeats: 2.0 },
      { beatOffset: 2, type: 'chord', velocity: 0.65, durationBeats: 2.0 },
    ],
  },
  {
    id: 'arpeggio-44',
    name: 'Đệm rải (Arpeggio 4/4)',
    description: 'Rải mượt mà lần lượt từ phím trầm lên các phím cao theo nhịp.',
    timeSignature: '4/4',
    steps: [
      { beatOffset: 0.0, type: 'bass', velocity: 0.85, durationBeats: 1.0 },
      { beatOffset: 0.5, type: 'arpeggio-note', noteIndex: 0, velocity: 0.60, durationBeats: 0.8 },
      { beatOffset: 1.0, type: 'arpeggio-note', noteIndex: 1, velocity: 0.65, durationBeats: 0.8 },
      { beatOffset: 1.5, type: 'arpeggio-note', noteIndex: 2, velocity: 0.70, durationBeats: 0.8 },
      { beatOffset: 2.0, type: 'bass', velocity: 0.75, durationBeats: 1.0 },
      { beatOffset: 2.5, type: 'arpeggio-note', noteIndex: 2, velocity: 0.65, durationBeats: 0.8 },
      { beatOffset: 3.0, type: 'arpeggio-note', noteIndex: 1, velocity: 0.65, durationBeats: 0.8 },
      { beatOffset: 3.5, type: 'arpeggio-note', noteIndex: 0, velocity: 0.60, durationBeats: 0.8 },
    ],
  },
  {
    id: 'waltz-34',
    name: 'Đệm Valse (Waltz 3/4)',
    description: 'Nhịp 3/4 nhịp nhàng: Phách 1 nốt trầm Bùm, phách 2 & 3 Chát Chát.',
    timeSignature: '3/4',
    steps: [
      { beatOffset: 0, type: 'bass', velocity: 0.85, durationBeats: 1.0 },
      { beatOffset: 1, type: 'chord', velocity: 0.65, durationBeats: 0.9 },
      { beatOffset: 2, type: 'chord', velocity: 0.65, durationBeats: 0.9 },
    ],
  },
  {
    id: 'slowrock-68',
    name: 'Đệm Slow Rock (Ballad 6/8)',
    description: 'Rải 6 phách sóng đôi tha thiết dành riêng cho các bài Ballad.',
    timeSignature: '6/8',
    steps: [
      { beatOffset: 0.0, type: 'bass', velocity: 0.85, durationBeats: 1.0 },
      { beatOffset: 0.5, type: 'arpeggio-note', noteIndex: 0, velocity: 0.60, durationBeats: 0.8 },
      { beatOffset: 1.0, type: 'arpeggio-note', noteIndex: 1, velocity: 0.65, durationBeats: 0.8 },
      { beatOffset: 1.5, type: 'arpeggio-note', noteIndex: 2, velocity: 0.70, durationBeats: 0.8 },
      { beatOffset: 2.0, type: 'arpeggio-note', noteIndex: 1, velocity: 0.65, durationBeats: 0.8 },
      { beatOffset: 2.5, type: 'arpeggio-note', noteIndex: 0, velocity: 0.60, durationBeats: 0.8 },
    ],
  },
];

export function getPatternById(id: string): AccompanimentPattern {
  const match = PATTERN_LIBRARY.find(p => p.id === id);
  return match || PATTERN_LIBRARY[0];
}

export function getPatternsByTimeSignature(ts: TimeSignature): AccompanimentPattern[] {
  return PATTERN_LIBRARY.filter(p => p.timeSignature === ts);
}
