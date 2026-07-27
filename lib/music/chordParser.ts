// Chord Sheet Parser — extract chords from raw hopamchuan / plain text

export interface ParsedSection {
  name: string;
  chords: string[];
}

/**
 * Parse raw chord text into sections.
 * Supported formats:
 *   1. Pipe-separated:  | C | G/B | Am | F |
 *   2. Inline bracket:  [C]lời [G/B]lời [Am]lời  (hopamchuan format)
 *   3. Space-separated: C G Am F
 *   4. Multi-line with section headers like "Verse:" or "Chorus:"
 */
export function parseChordSheet(raw: string): ParsedSection[] {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection = { name: 'Verse 1', chords: [] };

  const SECTION_HEADER_REGEX = /^(verse|chorus|điệp khúc|phiên khúc|hook|bridge|intro|outro|pre-chorus|refrain|coda|rap|c-section|đoạn \w+)[:\s\d]*/i;

  // Chord name pattern: root note + optional quality + optional slash bass
  const CHORD_TOKEN_REGEX = /\b([A-Ga-g][#b]?(?:m(?:aj)?7?|maj7?|M7|7|9|11|13|dim7?|aug|sus[24]?|add9|6|m6|\+)?(?:\/[A-Ga-g][#b]?)?)\b/g;

  // Bracket inline format: [C] or [Am7] etc
  const BRACKET_REGEX = /\[([A-Ga-g][#b]?(?:[^[\]]*)?)\]/g;

  for (const line of lines) {
    // Detect section headers
    const headerMatch = line.match(SECTION_HEADER_REGEX);
    if (headerMatch) {
      if (currentSection.chords.length > 0) {
        sections.push(currentSection);
      }
      const rawName = line.replace(/:/g, '').trim();
      currentSection = { name: capitalize(rawName), chords: [] };
      continue;
    }

    let chordsInLine: string[] = [];

    // Try bracket format first (hopamchuan inline)
    const bracketMatches = [...line.matchAll(BRACKET_REGEX)];
    if (bracketMatches.length > 0) {
      bracketMatches.forEach(m => {
        const chord = m[1].trim();
        if (chord && !isLyric(chord)) {
          chordsInLine.push(chord);
        }
      });
    } else {
      // Try pipe-separated format: | C | G/B |
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        parts.forEach(part => {
          const chordMatch = part.match(/^([A-Ga-g][#b]?(?:m(?:aj)?7?|maj7?|M7|7|9|dim7?|aug|sus[24]?|add9|\+)?(?:\/[A-Ga-g][#b]?)?)$/);
          if (chordMatch) chordsInLine.push(chordMatch[1]);
        });
      } else {
        // Space-separated or inline chord line
        const matches = [...line.matchAll(CHORD_TOKEN_REGEX)];
        const lineHasChords = matches.length > 0;
        const lyricsRatio = getLyricsRatio(line);

        // Only parse as chord line if it looks chord-heavy (few non-chord chars)
        if (lineHasChords && lyricsRatio < 0.5) {
          matches.forEach(m => chordsInLine.push(m[1]));
        }
      }
    }

    // Deduplicate consecutive same chords
    const deduped = chordsInLine.filter((c, i) => i === 0 || c !== chordsInLine[i - 1]);
    currentSection.chords.push(...deduped);
  }

  if (currentSection.chords.length > 0) {
    sections.push(currentSection);
  }

  // If no sections found, try parsing entire text as flat chords
  if (sections.length === 0) {
    const allMatches = [...raw.matchAll(CHORD_TOKEN_REGEX)];
    const allChords = allMatches.map(m => m[1]).filter((c, i, arr) => i === 0 || c !== arr[i - 1]);
    if (allChords.length > 0) {
      sections.push({ name: 'Hợp Âm', chords: allChords.slice(0, 12) });
    }
  }

  // Limit to 8 chords per section for pad layout
  return sections.map(s => ({
    ...s,
    chords: deduplicate(s.chords).slice(0, 8),
  }));
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function isLyric(str: string): boolean {
  // If it contains Vietnamese or common lyric characters, it's not a chord
  return /[àáâãèéêìíòóôõùúýăđơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(str);
}

function getLyricsRatio(line: string): number {
  const chordChars = (line.match(/[A-Ga-g#b/\s|0-9]+/g) || []).join('').length;
  return 1 - chordChars / Math.max(1, line.length);
}

function deduplicate(chords: string[]): string[] {
  const seen = new Set<string>();
  return chords.filter(c => {
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });
}
