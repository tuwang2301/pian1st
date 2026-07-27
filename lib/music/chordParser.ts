// Chord Sheet Parser & Progression Mining Engine
// Automatically parses Hopamchuan text and extracts Pattern Blocks (Verse, Pre-Chorus, Chorus, Outro)

export interface ChordLyricPair {
  chord: string;
  lyric?: string;
}

export interface ParsedLine {
  id: string;
  lineName: string;
  chords: ChordLyricPair[];
}

export interface ParsedSection {
  name: string;
  lines: ParsedLine[];
}

/**
 * Parse raw Hopamchuan text into structured Sections & Lines using Progression Mining.
 */
export function parseChordSheet(raw: string): ParsedSection[] {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  const sections: ParsedSection[] = [];
  let currentSectionName = 'Verse';
  let currentLines: ParsedLine[] = [];

  const SECTION_HEADER_REGEX = /^(verse|chorus|điệp khúc|phiên khúc|hook|bridge|intro|outro|pre-chorus|pre chorus|refrain|coda|rap|lên nửa tone|đoạn \w+)[:\s\d]*/i;
  const CHORD_TOKEN_REGEX = /\b([A-Ga-g][#b]?(?:m(?:aj)?7?|maj7?|M7|7|9|11|13|dim7?|aug|sus[24]?|add9|6|m6|\+)?(?:\/[A-Ga-g][#b]?)?)\b/g;

  let lineCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Section Header (e.g. Verse:, Chorus:, Pre-Chorus:, Lên nửa tone [Ebm]:)
    const headerMatch = line.match(SECTION_HEADER_REGEX);
    if (headerMatch) {
      if (currentLines.length > 0) {
        sections.push({ name: currentSectionName, lines: currentLines });
        currentLines = [];
        lineCounter = 1;
      }
      currentSectionName = capitalize(line.replace(/:/g, '').trim());
      continue;
    }

    let lineChords: ChordLyricPair[] = [];

    // Format 1: Hopamchuan Inline Bracket format: [Gmaj7]em nói cái chi [Em]cũng...
    if (line.includes('[') && line.includes(']')) {
      lineChords = parseBracketLine(line);
    }
    // Format 2: Pipe-separated: | C | G/B | Am | F |
    else if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      parts.forEach(part => {
        const match = part.match(/^([A-Ga-g][#b]?(?:m(?:aj)?7?|maj7?|M7|7|9|dim7?|aug|sus[24]?|add9|\+)?(?:\/[A-Ga-g][#b]?)?)$/);
        if (match) {
          lineChords.push({ chord: match[1] });
        }
      });
    }
    // Format 3: Chords line above Lyrics line
    else {
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
          lyricSnippet = lyricSnippet.replace(/^[-–—,.:;!|]+/g, '').trim();

          lineChords.push({ chord, lyric: lyricSnippet || undefined });
        });

        if (nextLine) i++; // skip next line since it was consumed as lyrics
      }
    }

    if (lineChords.length > 0) {
      currentLines.push({
        id: `l-${Date.now()}-${lineCounter}`,
        lineName: `Vòng ${lineCounter}`,
        chords: lineChords,
      });
      lineCounter++;
    }
  }

  if (currentLines.length > 0) {
    sections.push({ name: currentSectionName, lines: currentLines });
  }

  // Fallback: If no sections found, extract all chords into a single section
  if (sections.length === 0) {
    const allMatches = [...raw.matchAll(CHORD_TOKEN_REGEX)];
    const allPairs: ChordLyricPair[] = allMatches.map(m => ({ chord: m[1] }));
    if (allPairs.length > 0) {
      sections.push({
        name: 'Hợp Âm Bài Hát',
        lines: [{ id: 'l-fallback', lineName: 'Vòng 1', chords: allPairs }],
      });
    }
  }

  return sections;
}

/**
 * Parse Hopamchuan bracket line: [Gmaj7]em nói cái chi [Em]cũng [B]đều đồng ý
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
