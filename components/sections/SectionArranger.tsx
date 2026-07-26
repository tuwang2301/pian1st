'use client';

import React, { useState } from 'react';
import { useSongStore, SectionItem, ChordItem } from '../../store/useSongStore';
import { PATTERN_LIBRARY, getPatternsByTimeSignature, getPatternById } from '../../lib/audio/patterns';
import { ChordSelectorModal } from '../chords/ChordSelectorModal';
import { Plus, Trash2, Edit3, Music, Layers, Play, Sparkles } from 'lucide-react';

export const SectionArranger: React.FC = () => {
  const {
    sections,
    timeSignature,
    isPlaying,
    activeSectionIdx,
    activeChordIdx,
    activeBeatIdx,
    addSection,
    removeSection,
    updateSectionPattern,
    updateSectionName,
    addChordToSection,
    removeChordFromSection,
    updateChord,
  } = useSongStore();

  // Modal State for Chord Editing
  const [modalOpen, setModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [targetChord, setTargetChord] = useState<ChordItem | null>(null);

  const availablePatterns = getPatternsByTimeSignature(timeSignature);

  const handleOpenAddChord = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setTargetChord(null);
    setModalOpen(true);
  };

  const handleOpenEditChord = (sectionId: string, chord: ChordItem) => {
    setTargetSectionId(sectionId);
    setTargetChord(chord);
    setModalOpen(true);
  };

  const handleSaveChord = (chordStr: string, beats: number) => {
    if (!targetSectionId) return;

    if (targetChord) {
      updateChord(targetSectionId, targetChord.id, chordStr, beats);
    } else {
      addChordToSection(targetSectionId, chordStr, beats);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Section List Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-display font-bold text-xl text-[#F5F2EB]">
            Phối Bài Theo Section
          </h2>
        </div>

        <button
          onClick={() => addSection()}
          className="flex items-center gap-2 px-4 py-2 bg-[#16181E] hover:bg-[#21242E] text-[#D4AF37] border border-[#2B2E38] hover:border-[#D4AF37] rounded-xl font-mono text-xs font-bold transition-all shadow-md hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Đoạn Mới</span>
        </button>
      </div>

      {/* Sections Cards */}
      <div className="space-y-6">
        {sections.map((section, sIdx) => {
          const isActiveSection = isPlaying && activeSectionIdx === sIdx;
          const currentPattern = getPatternById(section.patternId);

          return (
            <div
              key={section.id}
              className={`bg-[#16181E] border rounded-2xl p-5 md:p-6 transition-all duration-300 relative shadow-xl ${
                isActiveSection
                  ? 'border-[#D4AF37] shadow-brass-glow bg-gradient-to-r from-[#16181E] via-[#1E232F] to-[#16181E]'
                  : 'border-[#2B2E38] hover:border-gray-700'
              }`}
            >
              {/* Section Active Glow Line */}
              {isActiveSection && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent rounded-t-2xl animate-pulse" />
              )}

              {/* Section Header: Name & Pattern Picker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-[#2B2E38] pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#0B0C10] border border-[#2B2E38] text-[#D4AF37] font-mono text-xs font-bold flex items-center justify-center">
                    {sIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => updateSectionName(section.id, e.target.value)}
                    className="font-display font-bold text-lg bg-transparent text-[#F5F2EB] border-b border-transparent hover:border-[#2B2E38] focus:border-[#D4AF37] focus:outline-none px-1 transition-all"
                  />
                  {isActiveSection && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-mono text-[10px] uppercase font-bold flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      Đang Đệm
                    </span>
                  )}
                </div>

                {/* Accompaniment Pattern Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">Kiểu Đệm:</span>
                  <select
                    value={section.patternId}
                    onChange={(e) => updateSectionPattern(section.id, e.target.value)}
                    className="bg-[#0B0C10] text-[#D4AF37] font-mono text-xs px-3 py-1.5 rounded-lg border border-[#2B2E38] focus:border-[#D4AF37] focus:outline-none cursor-pointer hover:bg-[#21242E] transition-all"
                  >
                    {availablePatterns.length > 0 ? (
                      availablePatterns.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))
                    ) : (
                      PATTERN_LIBRARY.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.timeSignature})
                        </option>
                      ))
                    )}
                  </select>

                  {/* Remove Section Button */}
                  {sections.length > 1 && (
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Xóa đoạn này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Pattern Info Badge */}
              <div className="mb-4 text-xs font-mono text-gray-400 bg-[#0B0C10] px-3 py-2 rounded-lg border border-[#2B2E38] flex items-center justify-between">
                <span>💡 {currentPattern.description}</span>
                <span className="text-[#D4AF37] font-bold">{currentPattern.timeSignature}</span>
              </div>

              {/* Chord Timeline Chips */}
              <div className="flex flex-wrap items-center gap-3">
                {section.chords.map((chordItem, cIdx) => {
                  const isActiveChord = isActiveSection && activeChordIdx === cIdx;

                  return (
                    <div
                      key={chordItem.id}
                      onClick={() => handleOpenEditChord(section.id, chordItem)}
                      className={`group relative px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 select-none flex flex-col items-center min-w-[76px] ${
                        isActiveChord
                          ? 'bg-[#D4AF37] text-[#0B0C10] border-[#F3E197] shadow-brass-glow font-bold scale-105 -translate-y-1'
                          : 'bg-[#F5F2EB] text-[#121316] border-[#2B2E38] hover:bg-[#E2DCCF] hover:scale-102'
                      }`}
                    >
                      {/* Delete Chord Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChordFromSection(section.id, chordItem.id);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        title="Xóa hợp âm"
                      >
                        ×
                      </button>

                      {/* Chord Name */}
                      <span className={`font-display text-xl font-extrabold ${isActiveChord ? 'text-[#0B0C10]' : 'text-[#121316]'}`}>
                        {chordItem.chord}
                      </span>

                      {/* Beats Badge */}
                      <span className={`text-[10px] font-mono mt-1 ${isActiveChord ? 'text-[#0B0C10]/80 font-bold' : 'text-gray-600'}`}>
                        {chordItem.beats} phách
                      </span>
                    </div>
                  );
                })}

                {/* Add Chord Button */}
                <button
                  onClick={() => handleOpenAddChord(section.id)}
                  className="px-4 py-3 rounded-xl border border-dashed border-[#2B2E38] hover:border-[#D4AF37] bg-[#0B0C10] hover:bg-[#21242E] text-[#D4AF37] flex flex-col items-center justify-center min-w-[76px] min-h-[64px] transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-mono uppercase">Thêm Hợp Âm</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chord Selector Modal */}
      <ChordSelectorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveChord}
        initialChord={targetChord ? targetChord.chord : 'C'}
        initialBeats={targetChord ? targetChord.beats : 4}
      />
    </div>
  );
};
