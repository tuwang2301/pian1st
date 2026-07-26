'use client';

import React from 'react';
import { useSongStore } from '../../store/useSongStore';
import { Play, Square, Volume2, Mic, Activity, RefreshCw } from 'lucide-react';

export const PlaybackControls: React.FC = () => {
  const {
    sections,
    isPlaying,
    activeSectionIdx,
    activeChordIdx,
    activeBeatIdx,
    bpm,
    key: currentKey,
    setBpm,
    togglePlay,
    stopPlay,
  } = useSongStore();

  const currentSection = activeSectionIdx >= 0 ? sections[activeSectionIdx] : null;
  const currentChord = currentSection && activeChordIdx >= 0 ? currentSection.chords[activeChordIdx] : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#16181E]/95 border-t border-[#2B2E38] p-4 backdrop-blur-lg shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Active Sing-Along Banner */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#0B0C10] border border-[#2B2E38] flex items-center justify-center text-[#D4AF37]">
            {isPlaying ? (
              <Activity className="w-6 h-6 animate-bounce text-[#D4AF37]" />
            ) : (
              <Mic className="w-6 h-6 text-gray-500" />
            )}
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase text-gray-400 flex items-center gap-2">
              <span>Tone: <strong className="text-[#D4AF37]">{currentKey}</strong></span>
              <span>•</span>
              <span>{currentSection ? currentSection.name : 'Chờ phát nhạc...'}</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display font-black text-3xl sm:text-4xl text-[#F5F2EB] tracking-tight">
                {currentChord ? currentChord.chord : '—'}
              </span>

              {isPlaying && currentChord && (
                <span className="font-mono text-xs text-[#D4AF37] font-bold bg-[#0B0C10] px-2 py-0.5 rounded border border-[#2B2E38]">
                  Phách {activeBeatIdx + 1}/{currentChord.beats}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center Controls (Play/Stop & BPM) */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center">
          <button
            onClick={togglePlay}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold font-sans transition-all duration-300 shadow-xl ${
              isPlaying
                ? 'bg-[#16181E] text-[#F3E197] border-2 border-[#D4AF37] shadow-brass-glow scale-105'
                : 'bg-[#D4AF37] text-[#0B0C10] hover:bg-[#F3E197] hover:shadow-brass-glow hover:scale-105'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-5 h-5 fill-current" />
                <span>TẠM DỪNG</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>BẮT ĐẦU ĐỆM</span>
              </>
            )}
          </button>

          {isPlaying && (
            <button
              onClick={stopPlay}
              className="p-3 rounded-2xl bg-[#0B0C10] hover:bg-[#21242E] text-gray-400 hover:text-white border border-[#2B2E38] transition-all"
              title="Dừng lại & về đầu"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Right Tempo Adjuster */}
        <div className="hidden lg:flex items-center gap-3 bg-[#0B0C10] px-4 py-2 rounded-xl border border-[#2B2E38]">
          <span className="text-xs font-mono text-gray-400 uppercase">Tốc Độ:</span>
          <input
            type="range"
            min="40"
            max="180"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-24 accent-[#D4AF37] cursor-pointer"
          />
          <span className="font-mono text-sm font-bold text-[#D4AF37]">{bpm} BPM</span>
        </div>
      </div>
    </div>
  );
};
