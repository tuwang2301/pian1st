'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePadStore } from '../../store/usePadStore';
import { parseChord } from '../../lib/music/chords';
import { Trash2, Plus } from 'lucide-react';

interface ChordPadProps {
  chordStr: string;
  lyric?: string;
  index: number;
  sectionId: string;
  isActive: boolean;
  onRemove: () => void;
}

export const ChordPad: React.FC<ChordPadProps> = ({
  chordStr,
  lyric,
  index,
  sectionId,
  isActive,
  onRemove,
}) => {
  const { triggerPad } = usePadStore();
  const [isPressed, setIsPressed] = useState(false);
  const parsed = parseChord(chordStr);

  const HOTKEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const hotkey = HOTKEYS[index] || null;

  const handlePress = (e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsPressed(true);
    triggerPad(sectionId, index);
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <div className="relative group">
      <button
        id={`pad-${sectionId}-${index}`}
        onPointerDown={handlePress}
        className={`
          relative w-full min-h-[96px] rounded-2xl border-2 transition-all duration-150 select-none
          flex flex-col items-center justify-between px-3 py-3 overflow-hidden
          ${isActive
            ? 'bg-[#D4AF37] border-[#F3E197] scale-[0.97] shadow-brass-glow-lg text-[#0B0C10]'
            : isPressed
            ? 'bg-[#21242E] border-[#D4AF37] scale-[0.96]'
            : 'bg-[#F5F2EB] border-[#2B2E38] text-[#121316] hover:border-[#D4AF37] hover:shadow-brass-glow hover:scale-[1.02] active:scale-[0.97]'
          }
        `}
      >
        {/* Active glow overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#F3E197]/30 to-transparent rounded-2xl pointer-events-none" />
        )}

        {/* Top Row: Hotkey badge & Lyric snippet */}
        <div className="w-full flex items-center justify-between gap-1 z-10">
          {hotkey ? (
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
              isActive ? 'bg-[#0B0C10]/20 text-[#0B0C10]' : 'bg-[#2B2E38] text-[#D4AF37]'
            }`}>
              {hotkey}
            </span>
          ) : <span />}

          {lyric && (
            <span className={`text-[10px] font-sans font-medium truncate max-w-[80%] ${
              isActive ? 'text-[#0B0C10] font-bold' : 'text-gray-600'
            }`} title={lyric}>
              {lyric}
            </span>
          )}
        </div>

        {/* Center: Chord Name */}
        <div className="flex items-baseline gap-0.5 my-1 z-10">
          <span className={`font-display font-black tracking-tight ${
            isActive ? 'text-[#0B0C10] text-3xl' : 'text-[#121316] text-2xl'
          }`}>
            {parsed.rootDisplay}
          </span>
          {parsed.quality && (
            <span className={`font-mono font-bold text-sm ${isActive ? 'text-[#0B0C10]/80' : 'text-gray-600'}`}>
              {parsed.quality}
            </span>
          )}
          {parsed.bassDisplay && (
            <span className={`font-mono text-xs ml-0.5 ${isActive ? 'text-[#0B0C10]/70' : 'text-gray-400'}`}>
              /{parsed.bassDisplay}
            </span>
          )}
        </div>

        {/* Bottom indicator dots */}
        <div className="flex gap-0.5 z-10">
          {[0, 1, 2].map(d => (
            <div key={d} className={`w-1 h-1 rounded-full ${
              isActive ? 'bg-[#0B0C10]/40' : 'bg-[#2B2E38]'
            }`} />
          ))}
        </div>
      </button>

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
        title="Xóa hợp âm"
      >
        ×
      </button>
    </div>
  );
};
