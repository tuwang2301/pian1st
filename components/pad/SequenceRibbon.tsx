'use client';

import React from 'react';
import { usePadStore, SequenceItem } from '../../store/usePadStore';
import { ChevronRight } from 'lucide-react';

interface SequenceRibbonProps {
  sequence: SequenceItem[];
  activeIdx: number;
}

export const SequenceRibbon: React.FC<SequenceRibbonProps> = ({
  sequence,
  activeIdx,
}) => {
  const { triggerPadByHotkey, sections, activeSectionId } = usePadStore();
  const section = sections.find(s => s.id === activeSectionId);

  const handleStepClick = (chord: string, idx: number) => {
    if (!section) return;
    const uniquePadIdx = section.uniquePads.findIndex(p => p.chord === chord);
    if (uniquePadIdx !== -1) {
      usePadStore.getState().triggerPad(activeSectionId, uniquePadIdx);
    }
  };

  if (!sequence || sequence.length === 0) return null;

  return (
    <div className="w-full bg-[#0B0C10] border border-[#2B2E38] rounded-2xl p-3.5 space-y-2 overflow-hidden">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
          Bản Đồ Tiến Trình Hợp Âm (Sequence Ribbon)
        </span>
        <span className="text-[10px] font-mono text-gray-500">
          Bước {activeIdx + 1} / {sequence.length}
        </span>
      </div>

      {/* Horizontal Scrollable Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#2B2E38]">
        {sequence.map((item, idx) => {
          const isActive = idx === activeIdx;
          return (
            <React.Fragment key={`${item.id}-${idx}`}>
              <button
                onClick={() => handleStepClick(item.chord, idx)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl border transition-all text-left flex flex-col items-start gap-0.5 select-none ${
                  isActive
                    ? 'bg-[#D4AF37] border-[#F3E197] text-[#0B0C10] scale-105 shadow-brass-glow font-bold'
                    : 'bg-[#16181E] border-[#2B2E38] text-gray-300 hover:border-gray-500'
                }`}
              >
                <span className={`font-display font-black text-sm ${isActive ? 'text-[#0B0C10]' : 'text-[#F5F2EB]'}`}>
                  {item.chord}
                </span>
                {item.lyric && (
                  <span className={`text-[10px] font-sans truncate max-w-[110px] ${
                    isActive ? 'text-[#0B0C10]/90 font-semibold' : 'text-gray-400'
                  }`}>
                    {item.lyric}
                  </span>
                )}
              </button>

              {idx < sequence.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
