'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePadStore } from '../../store/usePadStore';
import { parseChord } from '../../lib/music/chords';
import { Trash2, Plus } from 'lucide-react';

interface ChordPadProps {
  chordStr: string;
  index: number;
  sectionId: string;
  isActive: boolean;
  onRemove: () => void;
}

export const ChordPad: React.FC<ChordPadProps> = ({
  chordStr,
  index,
  sectionId,
  isActive,
  onRemove,
}) => {
  const { triggerPad } = usePadStore();
  const [isPressed, setIsPressed] = useState(false);
  const parsed = parseChord(chordStr);

  const hotkey = index < 8 ? String(index + 1) : null;

  const handlePress = () => {
    setIsPressed(true);
    triggerPad(sectionId, index);
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <div className="relative group">
      <button
        id={`pad-${sectionId}-${index}`}
        onClick={handlePress}
        className={`
          relative w-full min-h-[90px] rounded-2xl border-2 transition-all duration-150 select-none
          flex flex-col items-center justify-center gap-1 px-3 py-4 overflow-hidden
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

        {/* Hotkey badge */}
        {hotkey && (
          <span className={`absolute top-2 left-2.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
            isActive ? 'bg-[#0B0C10]/20 text-[#0B0C10]' : 'bg-[#2B2E38] text-[#D4AF37]'
          }`}>
            {hotkey}
          </span>
        )}

        {/* Chord Name */}
        <div className="flex items-baseline gap-0.5 mt-2">
          <span className={`font-display font-black tracking-tight ${
            isActive ? 'text-[#0B0C10] text-3xl' : 'text-[#121316] text-2xl'
          }`}>
            {parsed.root}
          </span>
          {parsed.quality && (
            <span className={`font-mono font-bold text-sm ${isActive ? 'text-[#0B0C10]/80' : 'text-gray-600'}`}>
              {parsed.quality}
            </span>
          )}
          {parsed.bass && (
            <span className={`font-mono text-xs ml-0.5 ${isActive ? 'text-[#0B0C10]/70' : 'text-gray-400'}`}>
              /{parsed.bass}
            </span>
          )}
        </div>

        {/* Piano type indicator dots (octave accent) */}
        <div className="flex gap-0.5">
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
