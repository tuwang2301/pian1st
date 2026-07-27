'use client';

import React from 'react';
import { usePadStore } from '../../store/usePadStore';
import { Activity, Disc, Play, Square, RefreshCw, Volume2, Sparkles, Radio } from 'lucide-react';

export const MetronomeBar: React.FC = () => {
  const {
    bpm,
    setBpm,
    isMetronomeRunning,
    activeBeat,
    isRecording,
    isLooping,
    toggleMetronome,
    startRecording,
    stopRecordingAndLoop,
    stopLoop,
    clearLoop,
  } = usePadStore();

  return (
    <div className="w-full bg-[#16181E] border border-[#2B2E38] rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Left: Metronome Toggle & BPM */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button
          onClick={toggleMetronome}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
            isMetronomeRunning
              ? 'bg-[#D4AF37] text-[#0B0C10] border-[#D4AF37] shadow-brass-glow animate-pulse'
              : 'bg-[#0B0C10] text-gray-300 border-[#2B2E38] hover:border-[#D4AF37]'
          }`}
        >
          <Radio className={`w-4 h-4 ${isMetronomeRunning ? 'animate-spin' : ''}`} />
          <span>{isMetronomeRunning ? 'Metronome: Bật' : 'Metronome: Tắt'}</span>
        </button>

        {/* 4-Beat Pulse Visualizer */}
        <div className="flex items-center gap-1.5 bg-[#0B0C10] px-3 py-1.5 rounded-xl border border-[#2B2E38]">
          {[1, 2, 3, 4].map(b => (
            <div
              key={b}
              className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all ${
                activeBeat === b
                  ? b === 1
                    ? 'bg-red-500 text-white shadow-lg scale-110'
                    : 'bg-[#D4AF37] text-[#0B0C10] shadow-brass-glow scale-110'
                  : 'bg-[#16181E] text-gray-600'
              }`}
            >
              {b}
            </div>
          ))}
        </div>

        {/* BPM Adjuster */}
        <div className="flex items-center gap-2 bg-[#0B0C10] px-3 py-1.5 rounded-xl border border-[#2B2E38]">
          <span className="text-xs font-mono text-gray-400">BPM:</span>
          <input
            type="range"
            min="40"
            max="180"
            value={bpm}
            onChange={e => setBpm(Number(e.target.value))}
            className="w-20 sm:w-28 accent-[#D4AF37] cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-[#D4AF37] min-w-[32px]">{bpm}</span>
        </div>
      </div>

      {/* Right: Live Loop Recorder Controls */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {!isRecording && !isLooping && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/50 font-mono text-xs font-bold transition-all shadow-lg hover:scale-105"
          >
            <Disc className="w-4 h-4 animate-pulse" />
            <span>Ghi Nhạc & Loop</span>
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecordingAndLoop}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B0C10] font-mono text-xs font-bold transition-all shadow-brass-glow animate-bounce hover:scale-105"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Hoàn Thành & Loop Ngay</span>
          </button>
        )}

        {isLooping && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Đang Loop Bài Đệm</span>
            </span>

            <button
              onClick={stopLoop}
              className="p-2 rounded-xl bg-[#0B0C10] hover:bg-[#21242E] text-gray-400 hover:text-white border border-[#2B2E38] transition-all"
              title="Tạm dừng Loop"
            >
              <Square className="w-4 h-4" />
            </button>

            <button
              onClick={clearLoop}
              className="px-3 py-2 rounded-xl bg-[#0B0C10] hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-[#2B2E38] font-mono text-xs transition-all"
              title="Xóa bản Loop"
            >
              Xóa Loop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
