'use client';

import React from 'react';
import { useSongStore } from '../../store/useSongStore';
import { audioEngine } from '../../lib/audio/engine';
import { Sparkles, Volume2 } from 'lucide-react';

interface KeyConfig {
  midi: number;
  noteName: string;
  isBlack: boolean;
  leftOffset?: number; // percentage offset for black keys
}

// Generate 2 Octaves of Piano Keys (C3 to B4, MIDI 48 to 71)
const generateKeys = (): { whiteKeys: KeyConfig[]; blackKeys: KeyConfig[] } => {
  const notePattern = [
    { name: 'C', isBlack: false },
    { name: 'C#', isBlack: true },
    { name: 'D', isBlack: false },
    { name: 'D#', isBlack: true },
    { name: 'E', isBlack: false },
    { name: 'F', isBlack: false },
    { name: 'F#', isBlack: true },
    { name: 'G', isBlack: false },
    { name: 'G#', isBlack: true },
    { name: 'A', isBlack: false },
    { name: 'A#', isBlack: true },
    { name: 'B', isBlack: false },
  ];

  const whiteKeys: KeyConfig[] = [];
  const blackKeys: KeyConfig[] = [];

  let whiteCount = 0;
  const startMidi = 48; // C3

  for (let octave = 3; octave <= 4; octave++) {
    notePattern.forEach((item) => {
      const midiIndex = (octave + 1) * 12 + notePattern.findIndex(n => n.name === item.name);
      const noteLabel = `${item.name}${octave}`;

      if (!item.isBlack) {
        whiteKeys.push({
          midi: midiIndex,
          noteName: noteLabel,
          isBlack: false,
        });
        whiteCount++;
      } else {
        // Position black key relative to white keys count
        // Total 14 white keys in 2 octaves
        const whiteWidthPercent = 100 / 14;
        const leftOffsetPercent = (whiteCount - 0.35) * whiteWidthPercent;

        blackKeys.push({
          midi: midiIndex,
          noteName: noteLabel,
          isBlack: true,
          leftOffset: leftOffsetPercent,
        });
      }
    });
  }

  return { whiteKeys, blackKeys };
};

const { whiteKeys, blackKeys } = generateKeys();

export const VirtualKeyboard: React.FC = () => {
  const { activeMidiNotes, isPlaying } = useSongStore();

  const handleKeyClick = (midi: number) => {
    audioEngine.playSingleNote(midi, 1.2, 0.85);
  };

  return (
    <div className="w-full bg-[#16181E] border border-[#2B2E38] rounded-2xl p-4 shadow-2xl overflow-hidden relative">
      {/* Visual Header / Title */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F2EB]">
            Steinway Virtual Piano Visualizer
          </h2>
        </div>
        <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Bấm phím để nghe thử âm thanh</span>
        </div>
      </div>

      {/* Keyboard Bed Container */}
      <div className="w-full h-36 sm:h-44 bg-[#0B0C10] p-2 rounded-xl border border-[#2B2E38] relative flex justify-between select-none shadow-inner overflow-x-auto">
        <div className="w-full h-full relative flex min-w-[600px]">
          {/* White Keys */}
          {whiteKeys.map((key) => {
            const isActive = activeMidiNotes.includes(key.midi);
            return (
              <button
                key={key.midi}
                onClick={() => handleKeyClick(key.midi)}
                className={`flex-1 h-full rounded-b-md border border-[#2B2E38] flex flex-col justify-end items-center pb-2 transition-all duration-150 relative ${
                  isActive
                    ? 'bg-gradient-to-b from-[#F3E197] to-[#D4AF37] text-[#0B0C10] font-bold shadow-brass-glow translate-y-0.5'
                    : 'bg-[#F5F2EB] text-[#121316] hover:bg-[#E2DCCF] active:translate-y-0.5'
                }`}
              >
                {/* Note Label */}
                <span className={`text-[10px] font-mono font-medium opacity-75 ${isActive ? 'text-[#0B0C10]' : 'text-gray-600'}`}>
                  {key.noteName}
                </span>

                {/* Active Glow Accent */}
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#0B0C10] mb-1 animate-ping" />
                )}
              </button>
            );
          })}

          {/* Black Keys (Overlayed absolutely) */}
          {blackKeys.map((key) => {
            const isActive = activeMidiNotes.includes(key.midi);
            return (
              <button
                key={key.midi}
                onClick={() => handleKeyClick(key.midi)}
                style={{ left: `${key.leftOffset}%` }}
                className={`absolute top-0 w-[4.5%] h-[60%] rounded-b-md z-10 transition-all duration-150 border border-[#0B0C10] flex flex-col justify-end items-center pb-1 ${
                  isActive
                    ? 'bg-gradient-to-b from-[#F3E197] to-[#D4AF37] text-[#0B0C10] shadow-brass-glow'
                    : 'bg-[#121316] text-[#F5F2EB] hover:bg-[#21242E] active:h-[59%]'
                }`}
              >
                <span className={`text-[8px] font-mono opacity-80 ${isActive ? 'text-[#0B0C10] font-bold' : 'text-gray-400'}`}>
                  {key.noteName.replace(/\d/, '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
