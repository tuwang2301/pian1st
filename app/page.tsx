'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { usePadStore } from '../store/usePadStore';
import { SectionPadGroup } from '../components/pad/SectionPadGroup';
import { ChordSheetParser } from '../components/pad/ChordSheetParser';
import { AudioControls } from '../components/audio/AudioControls';
import { VirtualKeyboard } from '../components/piano/VirtualKeyboard';
import { ALL_KEYS, NoteName } from '../lib/music/chords';
import {
  Music, Plus, Keyboard, ChevronDown, ChevronUp, SlidersHorizontal
} from 'lucide-react';

import { MetronomeBar } from '../components/metronome/MetronomeBar';

const SECTION_HOTKEYS = ['Q', 'W', 'E', 'R', 'T'];

export default function Home() {
  const {
    songTitle,
    setSongTitle,
    key: currentKey,
    setKey,
    sections,
    activeSectionId,
    setActiveSection,
    addSection,
    triggerPad,
    loadTimEmPreset,
    audioSettings,
  } = usePadStore();

  const [showAudio, setShowAudio] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showHints, setShowHints] = useState(true);

  // ── Global Keyboard Listener ───────────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if focus is inside an input / textarea
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const key = e.key.toUpperCase();

    // ArrowUp / ArrowDown: Switch Section (Verse <-> Chorus <-> Bridge)
    const currentSectionIdx = sections.findIndex(s => s.id === activeSectionId);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextSecIdx = (currentSectionIdx + 1) % sections.length;
      setActiveSection(sections[nextSecIdx].id);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevSecIdx = currentSectionIdx <= 0 ? sections.length - 1 : currentSectionIdx - 1;
      setActiveSection(sections[prevSecIdx].id);
      return;
    }

    // Space or ArrowRight: Advance Sequence Timeline
    if (e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault();
      usePadStore.getState().stepSequence('next');
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      usePadStore.getState().stepSequence('prev');
      return;
    }

    // Direct Ergonomic Key Trigger (QWER / ASDF / ZXCV)
    const ERGONOMIC_KEYS = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V'];
    if (ERGONOMIC_KEYS.includes(key)) {
      e.preventDefault();
      usePadStore.getState().triggerPadByHotkey(key);
      return;
    }
  }, [sections, activeSectionId, setActiveSection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Active section ─────────────────────────────────────────────────────────
  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0];

  return (
    <main className="min-h-screen bg-[#0B0C10] flex flex-col font-sans">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#16181E]/95 border-b border-[#2B2E38] backdrop-blur-md shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center shadow-brass-glow">
              <Music className="w-5 h-5 text-[#0B0C10] stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-[#F5F2EB] leading-none">Pian1st</h1>
              <p className="text-[10px] text-gray-500 font-mono">Live Chord Pad Studio</p>
            </div>
          </div>

          {/* Title + Key */}
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <input
              type="text"
              value={songTitle}
              onChange={e => setSongTitle(e.target.value)}
              placeholder="Tên bài hát..."
              className="flex-1 bg-[#0B0C10] text-[#F5F2EB] border border-[#2B2E38] focus:border-[#D4AF37] rounded-xl px-4 py-2 font-display font-bold text-sm focus:outline-none placeholder:text-gray-600 transition-all"
            />
            <div className="flex items-center gap-2 bg-[#0B0C10] border border-[#2B2E38] px-3 py-2 rounded-xl">
              <span className="text-xs font-mono text-gray-400">Tone:</span>
              <select
                value={currentKey}
                onChange={e => setKey(e.target.value as NoteName)}
                className="bg-transparent text-[#D4AF37] font-mono font-bold text-sm focus:outline-none cursor-pointer"
              >
                {ALL_KEYS.map(k => <option key={k} value={k} className="bg-[#16181E]">{k}</option>)}
              </select>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Presets */}
            <button
              onClick={() => usePadStore.getState().loadTimEmPreset()}
              className="px-3 py-2 rounded-xl bg-[#0B0C10] hover:bg-[#21242E] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono font-bold transition-all hover:border-[#D4AF37]"
            >
              Tìm Em
            </button>

            <button
              onClick={() => usePadStore.getState().loadNeuNhuTaChangConPreset()}
              className="px-3 py-2 rounded-xl bg-[#0B0C10] hover:bg-[#21242E] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono font-bold transition-all hover:border-[#D4AF37]"
            >
              Nếu Như Ta Chẳng Còn (#86874)
            </button>

            {/* Audio Settings toggle */}
            <button
              onClick={() => setShowAudio(v => !v)}
              className={`p-2.5 rounded-xl border transition-all ${showAudio ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]' : 'bg-[#0B0C10] border-[#2B2E38] text-gray-400 hover:border-gray-600'}`}
              title="Điều chỉnh âm thanh"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Virtual keyboard toggle */}
            <button
              onClick={() => setShowKeyboard(v => !v)}
              className={`p-2.5 rounded-xl border transition-all ${showKeyboard ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]' : 'bg-[#0B0C10] border-[#2B2E38] text-gray-400 hover:border-gray-600'}`}
              title="Hiển thị bàn phím ảo"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">

        {/* Keyboard Hints Banner */}
        {showHints && (
          <div className="bg-[#16181E] border border-[#2B2E38] rounded-2xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap text-xs font-mono text-gray-400">
              <span className="text-[#D4AF37] font-bold">Phím tắt:</span>
              <span><kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#F5F2EB]">Q W E R</kbd> / <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#F5F2EB]">A S D F</kbd> Gõ trực tiếp Pad</span>
              <span><kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#F5F2EB]">Space</kbd> / <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#F5F2EB]">→</kbd> Tiến phách bài hát</span>
              <span><kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#F5F2EB]">↑</kbd> / <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#F5F2EB]">↓</kbd> Đổi đoạn</span>
            </div>
            <button
              onClick={() => setShowHints(false)}
              className="text-gray-500 hover:text-gray-300 transition-colors ml-3 text-xs font-mono"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Audio Controls (collapsible) */}
        {showAudio && <AudioControls />}

        {/* Virtual Keyboard (collapsible) */}
        {showKeyboard && <VirtualKeyboard />}

        {/* Metronome & Live Loop Recorder */}
        <MetronomeBar />

        {/* Chord Sheet Parser */}
        <ChordSheetParser />

        {/* ── Section Tab Bar ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {sections.map((section, idx) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-bold transition-all ${
                activeSectionId === section.id
                  ? 'bg-[#D4AF37] text-[#0B0C10] border-[#D4AF37] shadow-brass-glow'
                  : 'bg-[#16181E] text-gray-300 border-[#2B2E38] hover:border-[#D4AF37]/50'
              }`}
            >
              <span className="text-[10px] opacity-60">{SECTION_HOTKEYS[idx] || ''}</span>
              <span>{section.name}</span>
              <span className="text-[10px] opacity-60">{section.uniquePads.length} Hợp Âm Độc Nhất</span>
            </button>
          ))}

          {/* Add Section */}
          <button
            onClick={addSection}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-[#2B2E38] hover:border-[#D4AF37] text-gray-400 hover:text-[#D4AF37] font-mono text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm Đoạn
          </button>
        </div>

        {/* ── Section Pad Groups ───────────────────────────────────────────── */}
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <SectionPadGroup
              key={section.id}
              sectionId={section.id}
              sectionName={section.name}
              sequence={section.sequence}
              uniquePads={section.uniquePads}
              isActive={section.id === activeSectionId}
              onSelect={() => setActiveSection(section.id)}
            />
          ))}
        </div>

      </div>
    </main>
  );
}
