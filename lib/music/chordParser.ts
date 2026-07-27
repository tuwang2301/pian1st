// Chord Sheet & Lyrics Parser — extract chords and lyrics from hopamchuan / raw text

export interface ChordLyricPair {
  chord: string;
  lyric?: string;
}

export interface ParsedSection {
  name: string;
  chords: ChordLyricPair[];
}

/**
 * Parse raw chord sheet text into sections containing Chord + Lyric pairs.
 * Supported formats:
 *   1. Hopamchuan inline bracket: [C]Nếu như ta [Am]chẳng còn [F]bên nhau
 *   2. Pipe-separated: | C | G/B | Am | F |
 *   3. Space-separated: C G Am F
 *   4. Multi-line with section headers like "Verse:" or "Chorus:"
 */
export function parseChordSheet(raw: string): ParsedSection[] {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection = { name: 'Verse 1', chords: [] };

  const SECTION_HEADER_REGEX = /^(verse|chorus|điệp khúc|phiên khúc|hook|bridge|intro|outro|pre-chorus|refrain|coda|rap|c-section|đoạn \w+)[:\s\d]*/i;
  const CHORD_TOKEN_REGEX = /\b([A-Ga-g][#b]?(?:m(?:aj)?7?|maj7?|M7|7|9|11|13|dim7?|aug|sus[24]?|add9|6|m6|\+)?(?:\/[A-Ga-g][#b]?)?)\b/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

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

    // Format 1: Hopamchuan Inline Bracket format: [C]Nếu như ta [Am]chẳng còn...
    if (line.includes('[') && line.includes(']')) {
      const pairs = parseBracketLine(line);
      currentSection.chords.push(...pairs);
      continue;
    }

    // Format 2: Pipe-separated: | C | G/B | Am | F |
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      parts.forEach(part => {
        const match = part.match(/^([A-Ga-g][#b]?(?:m(?:aj)?7?|maj7?|M7|7|9|dim7?|aug|sus[24]?|add9|\+)?(?:\/[A-Ga-g][#b]?)?)$/);
        if (match) {
          currentSection.chords.push({ chord: match[1] });
        }
      });
      continue;
    }

    // Format 3: Chords line with Lyrics on next line (Chords above lyrics)
    const matches = [...line.matchAll(CHORD_TOKEN_REGEX)];
    const lineHasChords = matches.length > 0;
    const lyricsRatio = getLyricsRatio(line);

    if (lineHasChords && lyricsRatio < 0.4) {
      const nextLine = (i + 1 < lines.length && getLyricsRatio(lines[i + 1]) > 0.5) ? lines[i + 1] : '';

      matches.forEach((m, idx) => {
        const chord = m[1];
        const colStart = m.index ?? 0;
        const colEnd = idx < matches.length - 1 ? (matches[idx + 1].index ?? nextLine.length) : nextLine.length;

        let lyricSnippet = nextLine.substring(colStart, colEnd).trim();
        // Clean up punctuation
        lyricSnippet = lyricSnippet.replace(/^[-–—,.:;!|]+/g, '').trim();

        currentSection.chords.push({ chord, lyric: lyricSnippet || undefined });
      });

      if (nextLine) i++; // skip next line since it was consumed as lyrics
    }
  }

  if (currentSection.chords.length > 0) {
    sections.push(currentSection);
  }

  // If no sections found, fallback to parsing all chords in raw text
  if (sections.length === 0) {
    const allMatches = [...raw.matchAll(CHORD_TOKEN_REGEX)];
    const allPairs: ChordLyricPair[] = allMatches.map(m => ({ chord: m[1] }));
    if (allPairs.length > 0) {
      sections.push({ name: 'Hợp Âm', chords: allPairs });
    }
  }

  return sections;
}

/**
 * Parse Hopamchuan bracket format: [C]Nếu như ta [Am]chẳng còn [F]bên nhau
 */
function parseBracketLine(line: string): ChordLyricPair[] {
  const pairs: ChordLyricPair[] = [];
  const segments = line.split(/(\[[^\]]+\])/).filter(Boolean);

  let currentChord = '';
  for (const seg of segments) {
    if (seg.startsWith('[') && seg.endsWith(']')) {
      const candidate = seg.slice(1, -1).trim();
      if (isChordName(candidate)) {
        if (currentChord) {
          pairs.push({ chord: currentChord, lyric: '' });
        }
        currentChord = candidate;
      }
    } else {
      const lyricText = seg.trim();
      if (currentChord) {
        pairs.push({ chord: currentChord, lyric: lyricText });
        currentChord = '';
      }
    }
  }

  if (currentChord) {
    pairs.push({ chord: currentChord, lyric: '' });
  }

  return pairs;
}

function isChordName(str: string): boolean {
  return /^[A-Ga-g][#b]?(?:m(?:aj)?7?|maj7?|M7|7|9|11|13|dim7?|aug|sus[24]?|add9|6|m6|\+)?(?:\/[A-Ga-g][#b]?)?$/.test(str.trim());
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getLyricsRatio(line: string): number {
  const chordChars = (line.match(/[A-Ga-g#b/\s|0-9]+/g) || []).join('').length;
  return 1 - chordChars / Math.max(1, line.length);
}
