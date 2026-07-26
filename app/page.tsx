'use client';

import React from 'react';
import { Header } from '../components/header/Header';
import { VirtualKeyboard } from '../components/piano/VirtualKeyboard';
import { SectionArranger } from '../components/sections/SectionArranger';
import { PlaybackControls } from '../components/playback/PlaybackControls';
import { useSongStore } from '../store/useSongStore';
import { Music, Sparkles, HelpCircle, Heart, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0C10] flex flex-col font-sans pb-32">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 space-y-8 flex-1">
        {/* Hero Banner / Instructions */}
        <div className="bg-gradient-to-r from-[#16181E] via-[#1E232F] to-[#16181E] border border-[#2B2E38] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phòng Đệm Piano Tự Động</span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#F5F2EB] tracking-tight leading-tight">
              Không có nhạc cụ bên cạnh? <br />
              <span className="text-[#D4AF37]">Tự tạo backing track piano & tập hát ngay.</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed">
              Chọn Tone bài hát, chọn vòng hợp âm theo đoạn (Verse / Chorus), chọn kiểu đệm tự động và bấm phát nhạc. Âm thanh piano chân thực được tính toán chuẩn bán âm lý thuyết nhạc.
            </p>

            {/* Preset Demo Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono text-gray-400">Thử ngay bài mẫu:</span>
              <button
                onClick={() => useSongStore.getState().loadTimEmPreset()}
                className="px-3.5 py-1.5 rounded-xl bg-[#0B0C10] hover:bg-[#21242E] border border-[#D4AF37] text-[#D4AF37] text-xs font-mono font-bold transition-all shadow-md hover:scale-105 flex items-center gap-1.5"
              >
                <Music className="w-3.5 h-3.5" />
                <span>Tải bài "Tìm Em" (Hopamchuan #86897)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Virtual Piano Visualizer */}
        <VirtualKeyboard />

        {/* Section Arranger Workbench */}
        <SectionArranger />
      </div>

      {/* Floating Playback Controls Bar */}
      <PlaybackControls />
    </main>
  );
}
