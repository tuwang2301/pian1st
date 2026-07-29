'use client';

import React from 'react';
import { usePadStore } from '../../store/usePadStore';
import { padEngine } from '../../lib/audio/padEngine';
import { translations } from '../../lib/i18n/translations';
import { Volume2, Music } from 'lucide-react';

interface KeyConfig {
  midi: number;
  noteName: string;
  isBlack: boolean;
  leftOffset?: number;
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
  const { audioSettings, language } = usePadStore();
  const t = translations[language];

  const handleKeyClick = (midi: number) => {
    padEngine.playKeyNote(midi, audioSettings);
  };

  return (
    <div className="w-full bg-[#16181E] border border-[#2B2E38] rounded-2xl p-4 shadow-2xl overflow-hidden relative space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F2EB]">
            {t.keyboardTitle}
          </h2>
        </div>
        <div className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Octave {audioSettings.octave}</span>
        </div>
      </div>

      {/* Keyboard Bed Container */}
      <div className="w-full h-36 sm:h-44 bg-[#0B0C10] p-2 rounded-xl border border-[#2B2E38] relative flex justify-between select-none shadow-inner overflow-x-auto">
        <div className="w-full h-full relative flex min-w-[600px]">
          {/* White Keys */}
          {whiteKeys.map((key) => (
            <button
              key={key.midi}
              onPointerDown={() => handleKeyClick(key.midi)}
              className="flex-1 h-full bg-[#F5F2EB] hover:bg-[#EBE6DA] active:bg-[#D4AF37] border-r border-[#2B2E38] rounded-b-lg flex flex-col justify-end items-center pb-2 transition-all shadow-md group select-none active:scale-[0.98]"
            >
              <span className="text-[10px] font-mono font-bold text-gray-600 group-hover:text-[#0B0C10]">
                {key.noteName}
              </span>
            </button>
          ))}

          {/* Black Keys */}
          {blackKeys.map((key) => (
            <button
              key={key.midi}
              onPointerDown={() => handleKeyClick(key.midi)}
              style={{ left: `${key.leftOffset}%` }}
              className="absolute top-0 w-[5%] h-[60%] bg-[#121316] hover:bg-[#2B2E38] active:bg-[#D4AF37] rounded-b-md z-20 flex flex-col justify-end items-center pb-1.5 shadow-2xl transition-all border border-[#0B0C10] select-none active:scale-[0.96]"
            >
              <span className="text-[8px] font-mono font-bold text-gray-400">
                {key.noteName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
