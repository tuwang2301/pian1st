# Pian1st

Pian1st is a web-based interactive piano accompaniment application for vocalists and musicians. It provides zero-latency chord pad triggering, song progression parsing from chord sheets, ergonomic two-handed keyboard controls, and multiple piano playing styles.

## Features

- **Two-Handed Live Accompaniment Controls**: Left-hand home row key mapping (`A`, `S`, `D`, `F`, `G`, `H`, `J`, `K`) for chord triggering and right-hand arrow key navigation (`ArrowRight`, `ArrowDown`, `ArrowLeft`, `ArrowUp`) for switching progression lines.
- **Hopamchuan Chord Sheet Parser**: Progression mining engine that extracts section headers, chord-lyric alignment, and deduplicates repeated progression lines into clean UI blocks.
- **Multiple Accompaniment Playing Styles**: Supports four distinct timing algorithms for chord voicing:
  - Ballad Arpeggio (fingerpicking roll with 38-45ms spread)
  - Pop / R&B Syncopation (65ms offset timing)
  - Bass-First Split (45ms low-end Quinta lead offset)
  - Block Chord (simultaneous strike)
- **Acoustic Sound Engine**: Web Audio API synthesis engine using multi-velocity soundfont samples, synthetic convolver reverb, dynamic range compression, and a 220ms smooth acoustic decay release tail.
- **Live Recording and Loop Recorder**: Integrated Web Audio metronome with real-time pad event recording and loop playback.
- **Key Transposition**: Full support for Major and Minor key selections (`C`, `Cm`, `D`, `Dm`, `G`, `Gm`, etc.) with automatic interval transposition across all sections.

## Tech Stack

- **Framework**: Next.js 15.1 (App Router)
- **UI Library**: React 19, Tailwind CSS 3.4, Lucide React
- **State Management**: Zustand 5.0
- **Audio Engine**: Web Audio API (AudioBufferSourceNode, ConvolverNode, DynamicsCompressorNode)
- **Language**: TypeScript 5.7

## Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tuwang2301/pian1st.git
cd pian1st
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

## Usage

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Key Bindings

| Control | Key | Action |
| --- | --- | --- |
| Left Hand | `A`, `S`, `D`, `F`, `G`, `H`, `J`, `K` | Trigger chords 1 through 8 in active line |
| Right Hand | `ArrowRight`, `ArrowDown`, `Space`, `Enter` | Advance to next progression line or section |
| Right Hand | `ArrowLeft`, `ArrowUp` | Move to previous progression line or section |

## Configuration

Audio parameters and global state are managed via `store/usePadStore.ts` and `lib/audio/padEngine.ts`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `octave` | `number` | `3` | Base octave range for chord voicings (2-5) |
| `pianoType` | `string` | `'grand'` | Sample soundfont preset (`grand`, `upright`, `electric`) |
| `reverb` | `number` | `0.25` | Convolver reverb mix ratio (0.0 - 1.0) |
| `velocity` | `string` | `'medium'` | Velocity gain curve (`soft`, `medium`, `strong`) |
| `sustain` | `number` | `2.5` | Note decay sustain duration in seconds |
| `masterVolume` | `number` | `0.9` | Master gain volume level (0.0 - 1.0) |
| `playingStyle` | `string` | `'arpeggio'` | Accompaniment timing (`arpeggio`, `pop`, `bassFirst`, `block`) |

## Project Structure

```text
pian1st/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── audio/
│   │   └── AudioControls.tsx
│   ├── chords/
│   │   └── ChordSelectorModal.tsx
│   ├── metronome/
│   │   └── MetronomeBar.tsx
│   ├── pad/
│   │   ├── ChordPad.tsx
│   │   ├── ChordSheetParser.tsx
│   │   └── SectionPadGroup.tsx
│   └── piano/
│       └── VirtualKeyboard.tsx
├── lib/
│   ├── audio/
│   │   ├── metronomeEngine.ts
│   │   ├── padEngine.ts
│   │   ├── patterns.ts
│   │   └── voiceleading.ts
│   └── music/
│       ├── chordParser.ts
│       └── chords.ts
├── store/
│   └── usePadStore.ts
├── package.json
└── tsconfig.json
```

## License

Private repository.
