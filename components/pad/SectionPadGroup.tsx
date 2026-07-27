'use client';

import React, { useState } from 'react';
import { usePadStore, UniquePad, SequenceItem } from '../../store/usePadStore';
import { ChordPad } from './ChordPad';
import { SequenceRibbon } from './SequenceRibbon';
import { ChordSelectorModal } from '../chords/ChordSelectorModal';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface SectionPadGroupProps {
  sectionId: string;
  sectionName: string;
  sequence: SequenceItem[];
  uniquePads: UniquePad[];
  isActive: boolean;
  onSelect: () => void;
}

export const SectionPadGroup: React.FC<SectionPadGroupProps> = ({
  sectionId,
  sectionName,
  sequence,
  uniquePads,
  isActive,
  onSelect,
}) => {
  const {
    activePadKey,
    activeSequenceIndex,
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

  // Group unique pads by category/row (Primary = QWER, Secondary = ASDF, Passing = ZXCV)
  const primaryPads = uniquePads.filter(p => p.category === 'primary');
  const secondaryPads = uniquePads.filter(p => p.category === 'secondary');
  const passingPads = uniquePads.filter(p => p.category === 'passing');

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
            {uniquePads.length} Hợp Âm Độc Nhất · {sequence.length} Phách Tiến Trình
          </span>
        </div>
      </div>

      <div className={`p-4 space-y-5 ${!isActive ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* 1. Sequence Ribbon (Song Progression Timeline) */}
        <SequenceRibbon sequence={sequence} activeIdx={activeSequenceIndex} />

        {/* 2. Ergonomic 12-Key Pad Grid (QWER / ASDF / ZXCV) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              Dàn Phím Đệm Tự Nhiên (12-Key Ergonomic Pads)
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              Gõ QWER · ASDF · ZXCV
            </span>
          </div>

          {/* Row 1: Primary Pads (Q W E R) */}
          {primaryPads.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {primaryPads.map((pad, idx) => {
                const uniqueIdx = uniquePads.indexOf(pad);
                const padKey = `${sectionId}:${uniqueIdx}`;
                return (
                  <ChordPad
                    key={`${pad.chord}-${uniqueIdx}`}
                    uniquePad={pad}
                    index={uniqueIdx}
                    sectionId={sectionId}
                    isActive={activePadKey === padKey}
                    onRemove={() => removeChordFromSection(sectionId, uniqueIdx)}
                  />
                );
              })}
            </div>
          )}

          {/* Row 2: Secondary Pads (A S D F) */}
          {secondaryPads.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {secondaryPads.map((pad, idx) => {
                const uniqueIdx = uniquePads.indexOf(pad);
                const padKey = `${sectionId}:${uniqueIdx}`;
                return (
                  <ChordPad
                    key={`${pad.chord}-${uniqueIdx}`}
                    uniquePad={pad}
                    index={uniqueIdx}
                    sectionId={sectionId}
                    isActive={activePadKey === padKey}
                    onRemove={() => removeChordFromSection(sectionId, uniqueIdx)}
                  />
                );
              })}
            </div>
          )}

          {/* Row 3: Passing Pads (Z X C V) */}
          {passingPads.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {passingPads.map((pad, idx) => {
                const uniqueIdx = uniquePads.indexOf(pad);
                const padKey = `${sectionId}:${uniqueIdx}`;
                return (
                  <ChordPad
                    key={`${pad.chord}-${uniqueIdx}`}
                    uniquePad={pad}
                    index={uniqueIdx}
                    sectionId={sectionId}
                    isActive={activePadKey === padKey}
                    onRemove={() => removeChordFromSection(sectionId, uniqueIdx)}
                  />
                );
              })}
            </div>
          )}

          {/* Add Chord Button */}
          {uniquePads.length < 12 && (
            <button
              onClick={e => { e.stopPropagation(); setModalOpen(true); }}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-[#2B2E38] hover:border-[#D4AF37] bg-[#0B0C10] hover:bg-[#21242E] text-[#D4AF37] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase">Thêm Hợp Âm Vào Vòng</span>
            </button>
          )}
        </div>
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
