'use client';

import React, { useState } from 'react';
import { usePadStore, LEFT_HAND_HOTKEYS } from '../../store/usePadStore';
import { parseChord } from '../../lib/music/chords';

interface ChordPadProps {
  chordStr: string;
  index: number;
  lineIndex: number;
  isActive: boolean;
  onRemove?: () => void;
}

export const ChordPad: React.FC<ChordPadProps> = ({
  chordStr,
  index,
  lineIndex,
  isActive,
}) => {
  const { triggerChordInLine } = usePadStore();
  const [isPressed, setIsPressed] = useState(false);
  const parsed = parseChord(chordStr);

  const hotkey = LEFT_HAND_HOTKEYS[index] || null;

  const handlePress = (e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsPressed(true);
    triggerChordInLine(lineIndex, index);
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <div className="relative group flex-1 min-w-[95px] max-w-[145px]">
      <button
        id={`pad-line-${lineIndex}-chord-${index}`}
        onPointerDown={handlePress}
        className={`
          relative w-full h-24 sm:h-28 rounded-2xl border-2 transition-all duration-150 select-none
          flex flex-col items-center justify-between p-3.5 overflow-hidden transform active:scale-95
          ${isActive
            ? 'bg-[#D4AF37] border-[#F3E197] scale-[0.97] shadow-brass-glow-lg text-[#0B0C10]'
            : isPressed
            ? 'bg-[#21242E] border-[#D4AF37] scale-[0.95]'
            : 'bg-[#F5F2EB] border-[#2B2E38] text-[#121316] hover:border-[#D4AF37] hover:shadow-brass-glow hover:scale-[1.03] active:scale-[0.96]'
          }
        `}
      >
        {/* Active glow overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#F3E197]/40 via-transparent to-[#0B0C10]/10 rounded-2xl pointer-events-none" />
        )}

        {/* Top Row: Hotkey Badge (A S D F G H J K) */}
        <div className="w-full flex items-center justify-between z-10">
          {hotkey ? (
            <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg shadow-sm ${
              isActive ? 'bg-[#0B0C10] text-[#D4AF37]' : 'bg-[#2B2E38] text-[#D4AF37]'
            }`}>
              {hotkey}
            </span>
          ) : <span />}
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${
            isActive ? 'bg-[#0B0C10] scale-110 animate-ping' : 'bg-[#D4AF37]'
          }`} />
        </div>

        {/* Center: Big Clean Chord Name */}
        <div className="flex items-baseline gap-0.5 z-10 my-auto">
          <span className={`font-display font-black tracking-tight ${
            isActive ? 'text-[#0B0C10] text-3xl sm:text-4xl' : 'text-[#121316] text-2xl sm:text-3xl'
          }`}>
            {parsed.rootDisplay}
          </span>
          {parsed.quality && (
            <span className={`font-mono font-bold text-sm sm:text-base ${isActive ? 'text-[#0B0C10]/90' : 'text-gray-600'}`}>
              {parsed.quality}
            </span>
          )}
          {parsed.bassDisplay && (
            <span className={`font-mono text-xs sm:text-sm ml-0.5 ${isActive ? 'text-[#0B0C10]/80' : 'text-gray-400'}`}>
              /{parsed.bassDisplay}
            </span>
          )}
        </div>

        {/* Bottom Bar Accent */}
        <div className={`w-8 h-1 rounded-full opacity-70 z-10 ${
          isActive ? 'bg-[#0B0C10]' : 'bg-[#2B2E38]'
        }`} />
      </button>
    </div>
  );
};
