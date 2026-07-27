'use client';

import React from 'react';
import { usePadStore } from '../../store/usePadStore';
import { AudioSettings } from '../../lib/audio/padEngine';
import { SlidersHorizontal, Music } from 'lucide-react';

const PIANO_TYPES: { value: AudioSettings['pianoType']; label: string; desc: string }[] = [
  { value: 'grand', label: 'Grand Piano', desc: 'Steinway concert' },
  { value: 'upright', label: 'Upright Piano', desc: 'Acoustic upright' },
  { value: 'electric', label: 'Electric Piano', desc: 'Rhodes-style' },
];

const PLAYING_STYLES: { value: AudioSettings['playingStyle']; label: string; desc: string }[] = [
  { value: 'arpeggio', label: 'Ballad Rải Ngón', desc: 'Sâu lắng, rải ngón mượt' },
  { value: 'pop', label: 'Pop / R&B Nảy Nhịp', desc: 'Bắt tai, nảy phách 65ms' },
  { value: 'bassFirst', label: 'Bass Nổ Trước', desc: 'Trầm Quinta trước 45ms' },
  { value: 'block', label: 'Dập Khối Chuẩn', desc: 'Nổ đồng thời cả khối' },
];

export const AudioControls: React.FC = () => {
  const { audioSettings, updateAudioSettings } = usePadStore();

  return (
    <div className="w-full bg-[#16181E] border border-[#2B2E38] rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#2B2E38] pb-3">
        <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
        <h3 className="text-sm font-mono font-bold text-[#F5F2EB] uppercase tracking-wider">Điều Chỉnh Âm Thanh & Kiểu Đệm</h3>
      </div>

      {/* Playing Style Switcher */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">Kiểu Đệm Piano (Playing Style)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PLAYING_STYLES.map(s => (
            <button
              key={s.value}
              onClick={() => updateAudioSettings({ playingStyle: s.value })}
              className={`py-3 px-3.5 rounded-xl border text-left transition-all ${
                audioSettings.playingStyle === s.value
                  ? 'bg-[#D4AF37] border-[#F3E197] text-[#0B0C10] font-bold shadow-brass-glow scale-[1.02]'
                  : 'bg-[#0B0C10] border-[#2B2E38] text-gray-300 hover:border-gray-500'
              }`}
            >
              <p className="font-mono font-bold text-xs">{s.label}</p>
              <p className={`font-mono text-[10px] ${audioSettings.playingStyle === s.value ? 'text-[#0B0C10]/80' : 'text-gray-500'}`}>
                {s.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Piano Type */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Kiểu Đàn (Piano Type)</label>
        <div className="grid grid-cols-3 gap-2">
          {PIANO_TYPES.map(p => (
            <button
              key={p.value}
              onClick={() => updateAudioSettings({ pianoType: p.value })}
              className={`py-2.5 px-3 rounded-xl border text-left transition-all ${
                audioSettings.pianoType === p.value
                  ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                  : 'bg-[#0B0C10] border-[#2B2E38] text-gray-300 hover:border-gray-600'
              }`}
            >
              <p className="font-mono font-bold text-xs">{p.label}</p>
              <p className="font-mono text-[10px] opacity-60">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Octave + Reverb Row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Octave */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Quãng Đàn (Octave)</label>
            <span className="font-mono text-sm font-bold text-[#D4AF37]">Oct {audioSettings.octave}</span>
          </div>
          <input
            type="range"
            min={2}
            max={5}
            step={1}
            value={audioSettings.octave}
            onChange={e => updateAudioSettings({ octave: Number(e.target.value) })}
            className="w-full accent-[#D4AF37] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-gray-500">
            <span>Trầm (2)</span>
            <span>Cao (5)</span>
          </div>
        </div>

        {/* Reverb */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Độ Vang (Reverb)</label>
            <span className="font-mono text-sm font-bold text-[#D4AF37]">{Math.round(audioSettings.reverb * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={audioSettings.reverb}
            onChange={e => updateAudioSettings({ reverb: Number(e.target.value) })}
            className="w-full accent-[#D4AF37] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-gray-500">
            <span>Khô</span>
            <span>Phòng HN</span>
          </div>
        </div>
      </div>

      {/* Velocity + Sustain Row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Velocity */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Độ Mạnh (Velocity)</label>
          <div className="flex gap-2">
            {(['soft', 'medium', 'strong'] as const).map(v => (
              <button
                key={v}
                onClick={() => updateAudioSettings({ velocity: v })}
                className={`flex-1 py-1.5 rounded-lg border font-mono text-xs capitalize transition-all ${
                  audioSettings.velocity === v
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] font-bold'
                    : 'bg-[#0B0C10] border-[#2B2E38] text-gray-400 hover:border-gray-600'
                }`}
              >
                {v === 'soft' ? 'Nhẹ' : v === 'medium' ? 'Vừa' : 'Mạnh'}
              </button>
            ))}
          </div>
        </div>

        {/* Sustain */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Độ Ngân (Sustain)</label>
            <span className="font-mono text-sm font-bold text-[#D4AF37]">{audioSettings.sustain.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min={0.8}
            max={4.5}
            step={0.1}
            value={audioSettings.sustain}
            onChange={e => updateAudioSettings({ sustain: Number(e.target.value) })}
            className="w-full accent-[#D4AF37] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
