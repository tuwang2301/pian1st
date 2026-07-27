'use client';

import React, { useState } from 'react';
import { usePadStore, UniquePad } from '../../store/usePadStore';
import { parseChord } from '../../lib/music/chords';

interface ChordPadProps {
  uniquePad: UniquePad;
  index: number;
  sectionId: string;
  isActive: boolean;
  onRemove: () => void;
}

export const ChordPad: React.FC<ChordPadProps> = ({
  uniquePad,
  index,
  sectionId,
  isActive,
  onRemove,
}) => {
  const { triggerPad } = usePadStore();
  const [isPressed, setIsPressed] = useState(false);
  const parsed = parseChord(uniquePad.chord);

  const handlePress = (e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsPressed(true);
    triggerPad(sectionId, index);
    setTimeout(() => setIsPressed(false), 150);
  };

  // Category visual styles
  const categoryStyles = {
    primary: {
      border: 'border-[#D4AF37]/50 hover:border-[#D4AF37]',
      badgeBg: 'bg-[#D4AF37] text-[#0B0C10]',
      dotBg: 'bg-[#D4AF37]',
    },
    secondary: {
      border: 'border-blue-500/40 hover:border-blue-400',
      badgeBg: 'bg-blue-500 text-white',
      dotBg: 'bg-blue-400',
    },
    passing: {
      border: 'border-purple-500/40 hover:border-purple-400',
      badgeBg: 'bg-purple-500 text-white',
      dotBg: 'bg-purple-400',
    },
  }[uniquePad.category];

  return (
    <div className="relative group">
      <button
        id={`pad-${sectionId}-${index}`}
        onPointerDown={handlePress}
        className={`
          relative w-full h-24 sm:h-28 rounded-2xl border-2 transition-all duration-150 select-none
          flex flex-col items-center justify-between p-3.5 overflow-hidden
          ${isActive
            ? 'bg-[#D4AF37] border-[#F3E197] scale-[0.97] shadow-brass-glow-lg text-[#0B0C10]'
            : isPressed
            ? 'bg-[#21242E] border-[#D4AF37] scale-[0.96]'
            : `bg-[#F5F2EB] ${categoryStyles.border} text-[#121316] hover:shadow-brass-glow hover:scale-[1.02] active:scale-[0.97]`
          }
        `}
      >
        {/* Active glow overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#F3E197]/30 to-transparent rounded-2xl pointer-events-none" />
        )}

        {/* Top Row: Hotkey Badge */}
        <div className="w-full flex items-center justify-between z-10">
          <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg ${
            isActive ? 'bg-[#0B0C10] text-[#D4AF37]' : categoryStyles.badgeBg
          }`}>
            {uniquePad.hotkey}
          </span>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#0B0C10]' : categoryStyles.dotBg}`} />
        </div>

        {/* Center: Big Clean Chord Name */}
        <div className="flex items-baseline gap-0.5 z-10 my-auto">
          <span className={`font-display font-black tracking-tight ${
            isActive ? 'text-[#0B0C10] text-3xl sm:text-4xl' : 'text-[#121316] text-2xl sm:text-3xl'
          }`}>
            {parsed.rootDisplay}
          </span>
          {parsed.quality && (
            <span className={`font-mono font-bold text-sm sm:text-base ${isActive ? 'text-[#0B0C10]/80' : 'text-gray-600'}`}>
              {parsed.quality}
            </span>
          )}
          {parsed.bassDisplay && (
            <span className={`font-mono text-xs sm:text-sm ml-0.5 ${isActive ? 'text-[#0B0C10]/70' : 'text-gray-400'}`}>
              /{parsed.bassDisplay}
            </span>
          )}
        </div>

        {/* Bottom Bar Indicator */}
        <div className={`w-8 h-1 rounded-full opacity-60 z-10 ${
          isActive ? 'bg-[#0B0C10]' : 'bg-[#2B2E38]'
        }`} />
      </button>

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20"
        title="Xóa hợp âm"
      >
        ×
      </button>
    </div>
  );
};
