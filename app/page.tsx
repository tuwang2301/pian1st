'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { usePadStore } from '../store/usePadStore';
import { SectionPadGroup } from '../components/pad/SectionPadGroup';
import { ChordSheetParser } from '../components/pad/ChordSheetParser';
import { AudioControls } from '../components/audio/AudioControls';
import { VirtualKeyboard } from '../components/piano/VirtualKeyboard';
import { MetronomeBar } from '../components/metronome/MetronomeBar';
import { ALL_KEYS, NoteName } from '../lib/music/chords';
import { Music, Plus, Keyboard, SlidersHorizontal } from 'lucide-react';

export default function Home() {
  const {
    songTitle,
    setSongTitle,
    key: currentKey,
    setKey,
    sections,
    activeSectionId,
    setActiveSection,
    triggerLeftHandHotkey,
    stepLine,
    loadTimEmPreset,
    loadVanLuonLaAnhPreset,
    loadKhongBietGiPreset,
  } = usePadStore();

  const [showAudio, setShowAudio] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showHints, setShowHints] = useState(true);

  // ── 2-HANDED GLOBAL KEYBOARD LISTENER (ASDF + ARROW KEYS) ──────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if focus is inside an input / textarea
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const key = e.key.toUpperCase();

    // Right Hand (Arrow Keys / Space / Enter): Line Navigation
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      stepLine('next');
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      stepLine('prev');
      return;
    }

    // Left Hand (Home Row ASDF G H J K): Chord Trigger
    const LEFT_HAND_KEYS = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'];
    if (LEFT_HAND_KEYS.includes(key)) {
      e.preventDefault();
      triggerLeftHandHotkey(key);
      return;
    }
  }, [triggerLeftHandHotkey, stepLine]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
              <p className="text-[10px] text-gray-500 font-mono">Live Piano Studio</p>
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
              onClick={loadVanLuonLaAnhPreset}
              className="px-3 py-2 rounded-xl bg-[#0B0C10] hover:bg-[#21242E] border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-mono font-bold transition-all hover:border-[#D4AF37] shadow-brass-glow"
            >
              Vẫn Luôn Là Anh
            </button>

            <button
              onClick={loadKhongBietGiPreset}
              className="px-3 py-2 rounded-xl bg-[#0B0C10] hover:bg-[#21242E] border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-mono font-bold transition-all hover:border-[#D4AF37] shadow-brass-glow"
            >
              Không Biết Gì (Jazz Pop)
            </button>

            <button
              onClick={loadTimEmPreset}
              className="px-3 py-2 rounded-xl bg-[#0B0C10] hover:bg-[#21242E] border border-[#2B2E38] text-gray-300 text-xs font-mono font-bold transition-all hover:border-gray-500"
            >
              Tìm Em
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

        {/* 2-Handed Keyboard Hints Banner */}
        {showHints && (
          <div className="bg-[#16181E] border border-[#2B2E38] rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4 flex-wrap text-xs font-mono text-gray-400">
              <span className="text-[#D4AF37] font-bold uppercase tracking-wider">Hướng dẫn đệm 2 tay:</span>
              <span><span className="text-[#F5F2EB] font-bold">Tay Trái:</span> <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#D4AF37] font-bold">A</kbd> <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#D4AF37] font-bold">S</kbd> <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#D4AF37] font-bold">D</kbd> <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#D4AF37] font-bold">F</kbd> Đập Hợp Âm trong dòng</span>
              <span><span className="text-[#F5F2EB] font-bold">Tay Phải:</span> <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#F5F2EB] font-bold">→</kbd> / <kbd className="bg-[#0B0C10] border border-[#2B2E38] px-2 py-0.5 rounded text-[#F5F2EB] font-bold">↓</kbd> Chuyển Dòng / Vòng tiếp theo</span>
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

        {/* ── Section Display ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionPadGroup
              key={section.id}
              sectionId={section.id}
              sectionName={section.name}
              lines={section.lines}
              isActive={section.id === activeSectionId}
              onSelect={() => setActiveSection(section.id)}
            />
          ))}
        </div>

      </div>
    </main>
  );
}
