'use client';

import React from 'react';
import { useSongStore } from '../../store/useSongStore';
import { ALL_KEYS, NoteName } from '../../lib/music/chords';
import { TimeSignature } from '../../lib/audio/patterns';
import { Music, Play, Square, Volume2, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    title,
    key: currentKey,
    bpm,
    timeSignature,
    isPlaying,
    setKey,
    setBpm,
    setTimeSignature,
    togglePlay,
  } = useSongStore();

  return (
    <header className="w-full bg-[#16181E] border-b border-[#2B2E38] px-4 py-3 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl z-20 sticky top-0 backdrop-blur-md bg-opacity-95">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center shadow-brass-glow">
          <Music className="w-5 h-5 text-[#0B0C10] stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl tracking-tight text-[#F5F2EB] flex items-center gap-2">
            Pian1st
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#21242E] text-[#D4AF37] border border-[#2B2E38]">
              Pro Studio
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-sans">Steinway Accompaniment Studio</p>
        </div>
      </div>

      {/* Global Song Controls (Tone, BPM, Nhịp) */}
      <div className="flex flex-wrap items-center gap-3 md:gap-6 bg-[#0B0C10] px-4 py-2 rounded-2xl border border-[#2B2E38]">
        {/* Tone / Key Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-gray-400">Tone:</span>
          <select
            value={currentKey}
            onChange={(e) => setKey(e.target.value as NoteName)}
            className="bg-[#16181E] text-[#D4AF37] font-mono font-bold text-sm px-3 py-1.5 rounded-lg border border-[#2B2E38] focus:border-[#D4AF37] focus:outline-none cursor-pointer hover:bg-[#21242E] transition-all"
          >
            {ALL_KEYS.map((k) => (
              <option key={k} value={k}>
                Tone {k}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-[1px] bg-[#2B2E38] hidden sm:block" />

        {/* BPM Slider & Input */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-gray-400">BPM:</span>
          <input
            type="range"
            min="40"
            max="180"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-20 sm:w-28 accent-[#D4AF37] cursor-pointer"
          />
          <span className="font-mono text-sm font-bold text-[#F5F2EB] min-w-[36px]">
            {bpm}
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#2B2E38] hidden sm:block" />

        {/* Time Signature */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase text-gray-400">Nhịp:</span>
          <select
            value={timeSignature}
            onChange={(e) => setTimeSignature(e.target.value as TimeSignature)}
            className="bg-[#16181E] text-[#F5F2EB] font-mono text-sm px-2.5 py-1.5 rounded-lg border border-[#2B2E38] focus:border-[#D4AF37] focus:outline-none cursor-pointer hover:bg-[#21242E] transition-all"
          >
            <option value="4/4">4/4 (Pop)</option>
            <option value="3/4">3/4 (Valse)</option>
            <option value="6/8">6/8 (Ballad)</option>
          </select>
        </div>
      </div>

      {/* Main Play CTA Button */}
      <button
        onClick={togglePlay}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold font-sans transition-all duration-300 shadow-lg ${
          isPlaying
            ? 'bg-[#16181E] text-[#F3E197] border-2 border-[#D4AF37] shadow-brass-glow animate-pulse-brass'
            : 'bg-[#D4AF37] text-[#0B0C10] hover:bg-[#F3E197] hover:shadow-brass-glow hover:scale-105 active:scale-95'
        }`}
      >
        {isPlaying ? (
          <>
            <Square className="w-5 h-5 fill-current" />
            <span>DỪNG LẠI</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            <span>PHÁT NHẠC</span>
          </>
        )}
      </button>
    </header>
  );
};
