// Voice Leading: Find closest voicing to minimize hand movement between chords

/**
 * Given a set of target MIDI notes and the previous chord's MIDI notes,
 * returns a reordered/octave-shifted version of targetMidi that minimizes
 * total voice movement distance.
 */
export function findClosestVoicing(
  targetMidi: number[],
  previousMidi: number[],
  octave: number = 3
): number[] {
  if (previousMidi.length === 0 || targetMidi.length === 0) return targetMidi;

  // Work with treble notes only (ignore bass for voicing)
  const result: number[] = [];

  targetMidi.forEach((midi, i) => {
    const notePitchClass = midi % 12;

    // Find octave of this note that is closest to the corresponding previous note
    const prevMidi = previousMidi[Math.min(i, previousMidi.length - 1)];
    const prevOctave = Math.floor(prevMidi / 12);

    // Try octaves prevOctave-1, prevOctave, prevOctave+1
    const candidates = [
      notePitchClass + (prevOctave - 1) * 12,
      notePitchClass + prevOctave * 12,
      notePitchClass + (prevOctave + 1) * 12,
    ];

    // Pick the candidate closest to prevMidi, within the allowed range
    const minOctaveMidi = (octave) * 12; // e.g. Octave 3 = MIDI 36
    const maxOctaveMidi = (octave + 3) * 12; // e.g. Octave 6 = MIDI 72

    let best = candidates[1]; // default: same octave
    let bestDiff = Math.abs(candidates[1] - prevMidi);

    candidates.forEach(c => {
      if (c >= minOctaveMidi && c <= maxOctaveMidi) {
        const diff = Math.abs(c - prevMidi);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = c;
        }
      }
    });

    result.push(best);
  });

  return result;
}
