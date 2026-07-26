// Comprehensive Music Theory Engine for Piano Backing Track

export const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
] as const;

export type NoteName = typeof NOTE_NAMES[number];

// Flat to Sharp map for standardizing input
const FLAT_TO_SHARP_MAP: Record<string, NoteName> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Fb': 'E',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
  'Cb': 'B',
  'B#': 'C',
  'E#': 'F'
};

// Standardize note name to Sharp notation
export function normalizeNoteName(noteStr: string): NoteName {
  const clean = noteStr.trim();
  if (FLAT_TO_SHARP_MAP[clean]) {
    return FLAT_TO_SHARP_MAP[clean];
  }
  const match = NOTE_NAMES.find(n => n.toLowerCase() === clean.toLowerCase());
  return match || 'C';
}

// Convert Note Name + Octave to MIDI note number (e.g. C4 -> 60)
export function getMidiFromNote(note: NoteName, octave: number = 4): number {
  const noteIndex = NOTE_NAMES.indexOf(note);
  return (octave + 1) * 12 + noteIndex;
}

// Convert MIDI note number to Frequency in Hz (A4 = 440Hz, MIDI 69)
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Quality semitone interval maps
const CHORD_FORMULAS: Record<string, number[]> = {
  '': [0, 4, 7],            // Major triad
  'm': [0, 3, 7],           // Minor triad
  'min': [0, 3, 7],
  '7': [0, 4, 7, 10],       // Dominant 7th
  'maj7': [0, 4, 7, 11],    // Major 7th
  'M7': [0, 4, 7, 11],
  'm7': [0, 3, 7, 10],      // Minor 7th
  'min7': [0, 3, 7, 10],
  'dim': [0, 3, 6],         // Diminished
  'dim7': [0, 3, 6, 9],     // Diminished 7th
  'm7b5': [0, 3, 6, 10],    // Half-diminished 7th
  'aug': [0, 4, 8],         // Augmented
  '+': [0, 4, 8],
  'sus2': [0, 2, 7],        // Suspended 2nd
  'sus4': [0, 5, 7],        // Suspended 4th
  'sus': [0, 5, 7],
  'add9': [0, 4, 7, 14],     // Add 9
  'madd9': [0, 3, 7, 14],    // Minor add 9
  '9': [0, 4, 7, 10, 14],   // Dominant 9th
  'maj9': [0, 4, 7, 11, 14], // Major 9th
  '6': [0, 4, 7, 9],        // Major 6th
  'm6': [0, 3, 7, 9],       // Minor 6th
};

export interface ParsedChord {
  raw: string;
  root: NoteName;
  quality: string;
  bass?: NoteName;
  displayName: string;
}

// Parse string like "C", "Am", "F#m7", "Bb/D", "Gsus4"
export function parseChord(chordStr: string): ParsedChord {
  const str = chordStr.trim();
  if (!str) {
    return { raw: '', root: 'C', quality: '', displayName: 'C' };
  }

  // Check for slash bass (e.g. C/E)
  const parts = str.split('/');
  const mainPart = parts[0].trim();
  const bassPart = parts[1] ? normalizeNoteName(parts[1].trim()) : undefined;

  // Regex to extract Root (A-G with optional # or b) and Quality
  const match = mainPart.match(/^([A-Ga-g][#b]?)(.*)$/);
  if (!match) {
    return { raw: str, root: 'C', quality: '', displayName: str };
  }

  const root = normalizeNoteName(match[1]);
  let quality = match[2].trim();

  // Standardize quality key
  let normalizedQuality = quality;
  if (!CHORD_FORMULAS[quality]) {
    // Try lowercase or common aliases
    const lower = quality.toLowerCase();
    if (CHORD_FORMULAS[lower]) {
      normalizedQuality = lower;
    } else if (lower === 'maj' || lower === 'M') {
      normalizedQuality = '';
    } else {
      normalizedQuality = ''; // Default fallback to major
    }
  }

  return {
    raw: str,
    root,
    quality: normalizedQuality,
    bass: bassPart,
    displayName: str,
  };
}

export interface PianoNotes {
  bassMidi: number[];    // Left hand bass notes (Octave 2 or 3)
  trebleMidi: number[];  // Right hand chord notes (Octave 3 or 4)
  allMidi: number[];     // Combined unique sorted MIDI notes
}

// Get full piano voicing for a chord (Default octave = 3 for warm acoustic tone)
export function getPianoVoicing(chordStr: string, octave: number = 3): PianoNotes {
  const parsed = parseChord(chordStr);
  const rootIndex = NOTE_NAMES.indexOf(parsed.root);
  const rootBaseMidi = (octave + 1) * 12 + rootIndex; // Octave 4 for right hand (MIDI 60)

  // Get quality intervals
  const intervals = CHORD_FORMULAS[parsed.quality] || CHORD_FORMULAS[''];

  // Treble notes (Right Hand) around octave 3-4 (MIDI 48-60)
  const trebleMidi = intervals.map(semitone => rootBaseMidi + semitone);

  // Bass note (Left Hand) around octave 2 (MIDI 36-48)
  const bassRoot = parsed.bass ? parsed.bass : parsed.root;
  const bassIndex = NOTE_NAMES.indexOf(bassRoot);
  const bassMidi1 = (octave - 1) * 12 + bassIndex; // Octave 2
  const bassMidi2 = bassMidi1 - 12;                 // Octave 1

  const bassMidi = [bassMidi2, bassMidi1];

  const allMidiSet = new Set([...bassMidi, ...trebleMidi]);
  const allMidi = Array.from(allMidiSet).sort((a, b) => a - b);

  return {
    bassMidi,
    trebleMidi,
    allMidi,
  };
}


// Transpose a chord string by semitones (+/-)
export function transposeChord(chordStr: string, semitones: number): string {
  if (semitones === 0 || !chordStr.trim()) return chordStr;

  const parsed = parseChord(chordStr);

  const rootIndex = NOTE_NAMES.indexOf(parsed.root);
  let newRootIndex = (rootIndex + semitones) % 12;
  if (newRootIndex < 0) newRootIndex += 12;
  const newRoot = NOTE_NAMES[newRootIndex];

  let newBass: string | undefined;
  if (parsed.bass) {
    const bassIndex = NOTE_NAMES.indexOf(parsed.bass);
    let newBassIndex = (bassIndex + semitones) % 12;
    if (newBassIndex < 0) newBassIndex += 12;
    newBass = NOTE_NAMES[newBassIndex];
  }

  return `${newRoot}${parsed.quality}${newBass ? `/${newBass}` : ''}`;
}

// Key signatures list for dropdown
export const ALL_KEYS: NoteName[] = [...NOTE_NAMES];
