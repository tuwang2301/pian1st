'use client';

import React, { useState } from 'react';
import { usePadStore, LineProgression } from '../../store/usePadStore';
import { ChordPad } from './ChordPad';
import { ChordSelectorModal } from '../chords/ChordSelectorModal';
import { Plus, Trash2, Edit2, Check, X, ArrowRight, ArrowDown, ChevronRight } from 'lucide-react';

interface SectionPadGroupProps {
  sectionId: string;
  sectionName: string;
  lines: LineProgression[];
  isActive: boolean;
  onSelect: () => void;
}

export const SectionPadGroup: React.FC<SectionPadGroupProps> = ({
  sectionId,
  sectionName,
  lines,
  isActive,
  onSelect,
}) => {
  const {
    activeLineIndex,
    activeChordIndex,
    setActiveLineIndex,
    removeChordFromSection,
    addChordToSection,
    updateSectionName,
    removeSection,
    sections,
  } = usePadStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(sectionName);

  const handleSaveChord = (chordStr: string) => {
    addChordToSection(sectionId, chordStr);
    setModalOpen(false);
  };

  const handleSaveName = () => {
    updateSectionName(sectionId, nameInput);
    setEditingName(false);
  };

  const activeLine = lines[activeLineIndex] || lines[0];

  return (
    <div
      className={`rounded-3xl border-2 transition-all duration-200 overflow-hidden ${
        isActive
          ? 'border-[#D4AF37] shadow-brass-glow bg-[#16181E]'
          : 'border-[#2B2E38] bg-[#16181E] hover:border-gray-600 cursor-pointer'
      }`}
      onClick={() => !isActive && onSelect()}
    >
      {/* Top Gold Accent */}
      {isActive && (
        <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2B2E38]">
        <div className="flex items-center gap-3">
          {editingName ? (
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="bg-[#0B0C10] text-[#F5F2EB] border border-[#D4AF37] rounded-lg px-3 py-1 text-sm font-display font-bold focus:outline-none"
              />
              <button onClick={handleSaveName} className="p-1 text-[#D4AF37] hover:text-white"><Check className="w-4 h-4" /></button>
              <button onClick={() => setEditingName(false)} className="p-1 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className={`font-display font-bold text-base ${isActive ? 'text-[#F5F2EB]' : 'text-gray-400'}`}>
                {sectionName}
              </h3>
              {isActive && (
                <button
                  onClick={e => { e.stopPropagation(); setEditingName(true); setNameInput(sectionName); }}
                  className="p-1 text-gray-500 hover:text-[#D4AF37] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {isActive && (
            <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30 font-bold">
              ĐANG CHỌN
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isActive && sections.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); removeSection(sectionId); }}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Xóa đoạn"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-xs font-mono text-gray-400">
            {lines.length} Vòng Hợp Âm
          </span>
        </div>
      </div>

      <div className={`p-5 space-y-6 ${!isActive ? 'opacity-50 pointer-events-none' : ''}`}>

        {/* 1. SONG PROGRESSION LINES (Timeline Viewer) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              Danh Sách Vòng Hợp Âm Bài Hát
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              Dùng phím → / ↓ (Tay Phải) để chuyển vòng
            </span>
          </div>

          <div className="space-y-2">
            {lines.map((line, lineIdx) => {
              const isLineActive = lineIdx === activeLineIndex;
              return (
                <div
                  key={line.id}
                  onClick={() => setActiveLineIndex(lineIdx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isLineActive
                      ? 'bg-[#0B0C10] border-[#D4AF37] shadow-brass-glow'
                      : 'bg-[#16181E] border-[#2B2E38] hover:border-gray-600 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isLineActive ? 'text-[#D4AF37]' : 'text-gray-400'}`}>
                      {line.lineName}
                    </span>
                    {isLineActive && (
                      <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/20 px-2 py-0.5 rounded-md font-bold">
                        ĐANG ĐỆM TAY TRÁI (A S D F G H J K)
                      </span>
                    )}
                  </div>

                  {/* Chord sequence preview */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {line.chords.map((item, chordIdx) => {
                      const isChordActive = isLineActive && chordIdx === activeChordIndex;
                      return (
                        <React.Fragment key={`${item.id}-${chordIdx}`}>
                          <div
                            className={`px-3 py-1.5 rounded-xl border text-left flex flex-col transition-all ${
                              isChordActive
                                ? 'bg-[#D4AF37] border-[#F3E197] text-[#0B0C10] font-bold scale-105 shadow-brass-glow'
                                : 'bg-[#16181E] border-[#2B2E38] text-gray-200'
                            }`}
                          >
                            <span className="font-display font-black text-sm">{item.chord}</span>
                            {item.lyric && (
                              <span className={`text-[10px] font-sans truncate max-w-[100px] ${isChordActive ? 'text-[#0B0C10]/90 font-semibold' : 'text-gray-400'}`}>
                                {item.lyric}
                              </span>
                            )}
                          </div>
                          {chordIdx < line.chords.length - 1 && (
                            <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. ACTIVE LINE PADS (Left Hand Home Row ASDF G H J K) */}
        {activeLine && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider">
                Tay Trái Gõ Hợp Âm ({activeLine.lineName})
              </span>
              <span className="text-xs font-mono text-gray-400">
                Gõ phím Tay Trái: <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-1.5 py-0.5 rounded text-[#D4AF37]">A</kbd> <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-1.5 py-0.5 rounded text-[#D4AF37]">S</kbd> <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-1.5 py-0.5 rounded text-[#D4AF37]">D</kbd> <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-1.5 py-0.5 rounded text-[#D4AF37]">F</kbd>
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {activeLine.chords.map((item, chordIdx) => {
                const isChordActive = chordIdx === activeChordIndex;
                return (
                  <ChordPad
                    key={`${item.id}-${chordIdx}`}
                    chordStr={item.chord}
                    index={chordIdx}
                    lineIndex={activeLineIndex}
                    isActive={isChordActive}
                  />
                );
              })}

              {/* Add Chord Button */}
              {activeLine.chords.length < 8 && (
                <button
                  onClick={e => { e.stopPropagation(); setModalOpen(true); }}
                  className="min-h-[96px] min-w-[90px] rounded-2xl border-2 border-dashed border-[#2B2E38] hover:border-[#D4AF37] bg-[#0B0C10] hover:bg-[#21242E] text-[#D4AF37] flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold uppercase">Thêm Nốt</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Chord Selector Modal */}
      <ChordSelectorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(chordStr) => handleSaveChord(chordStr)}
        initialChord="C"
        initialBeats={4}
      />
    </div>
  );
};
