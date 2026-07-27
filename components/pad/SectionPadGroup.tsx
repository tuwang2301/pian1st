'use client';

import React, { useState } from 'react';
import { usePadStore } from '../../store/usePadStore';
import { ChordPad } from './ChordPad';
import { ChordSelectorModal } from '../chords/ChordSelectorModal';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface SectionPadGroupProps {
  sectionId: string;
  sectionName: string;
  chords: string[];
  isActive: boolean;
  hotkey: string;
  onSelect: () => void;
}

export const SectionPadGroup: React.FC<SectionPadGroupProps> = ({
  sectionId,
  sectionName,
  chords,
  isActive,
  hotkey,
  onSelect,
}) => {
  const {
    activePadKey,
    removeChordFromSection,
    addChordToSection,
    updateSectionName,
    removeSection,
    sections,
    triggerPad,
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

  return (
    <div
      className={`rounded-3xl border-2 transition-all duration-200 overflow-hidden ${
        isActive
          ? 'border-[#D4AF37] shadow-brass-glow bg-[#16181E]'
          : 'border-[#2B2E38] bg-[#16181E] hover:border-gray-600 cursor-pointer'
      }`}
      onClick={() => !isActive && onSelect()}
    >
      {/* Active top bar */}
      {isActive && (
        <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#2B2E38]">
        <div className="flex items-center gap-3">
          {/* Hotkey badge */}
          <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border ${
            isActive
              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
              : 'bg-[#0B0C10] border-[#2B2E38] text-gray-400'
          }`}>
            {hotkey}
          </span>

          {/* Section Name Edit */}
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
            <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
              ĐANG CHỌN
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isActive && sections.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); removeSection(sectionId); }}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Xóa đoạn"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-xs font-mono text-gray-500">
            {chords.length}/8 hợp âm
          </span>
        </div>
      </div>

      {/* Pad Grid */}
      <div className={`p-4 ${!isActive ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {chords.map((chord, idx) => {
            const padKey = `${sectionId}:${idx}`;
            return (
              <ChordPad
                key={`${chord}-${idx}`}
                chordStr={chord}
                index={idx}
                sectionId={sectionId}
                isActive={activePadKey === padKey}
                onRemove={() => removeChordFromSection(sectionId, idx)}
              />
            );
          })}

          {/* Add Chord Button */}
          {chords.length < 8 && (
            <button
              onClick={e => { e.stopPropagation(); setModalOpen(true); }}
              className="min-h-[90px] rounded-2xl border-2 border-dashed border-[#2B2E38] hover:border-[#D4AF37] bg-[#0B0C10] hover:bg-[#21242E] text-[#D4AF37] flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-6 h-6" />
              <span className="text-[10px] font-mono uppercase">Thêm</span>
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
