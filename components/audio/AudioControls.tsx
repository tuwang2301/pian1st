'use client';

import React from 'react';
import { usePadStore } from '../../store/usePadStore';
import { AudioSettings } from '../../lib/audio/padEngine';
import { Volume2, Music, SlidersHorizontal } from 'lucide-react';

const PIANO_TYPES: { value: AudioSettings['pianoType']; label: string; desc: string }[] = [
  { value: 'grand', label: 'Grand Piano', desc: 'Steinway concert' },
  { value: 'upright', label: 'Upright Piano', desc: 'Acoustic upright' },
  { value: 'electric', label: 'Electric Piano', desc: 'Rhodes-style' },
];

export const AudioControls: React.FC = () => {
  const { audioSettings, updateAudioSettings } = usePadStore();

  return (
    <div className="w-full bg-[#16181E] border border-[#2B2E38] rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#2B2E38] pb-3">
        <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
        <h3 className="text-sm font-mono font-bold text-[#F5F2EB] uppercase tracking-wider">Điều Chỉnh Âm Thanh</h3>
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
                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all ${
                  audioSettings.velocity === v
                    ? 'bg-[#D4AF37] border-[#D4AF37] text-[#0B0C10]'
                    : 'bg-[#0B0C10] border-[#2B2E38] text-gray-400 hover:border-gray-500'
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
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Ngân Dài (Sustain)</label>
            <span className="font-mono text-sm font-bold text-[#D4AF37]">{audioSettings.sustain.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={audioSettings.sustain}
            onChange={e => updateAudioSettings({ sustain: Number(e.target.value) })}
            className="w-full accent-[#D4AF37] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-gray-500">
            <span>Ngắn</span>
            <span>Ngân dài</span>
          </div>
        </div>
      </div>

      {/* Master Volume */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Âm Lượng Tổng (Master Volume)</label>
          </div>
          <span className="font-mono text-sm font-bold text-[#D4AF37]">{Math.round(audioSettings.masterVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={audioSettings.masterVolume}
          onChange={e => updateAudioSettings({ masterVolume: Number(e.target.value) })}
          className="w-full accent-[#D4AF37] cursor-pointer"
        />
      </div>
    </div>
  );
};
