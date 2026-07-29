'use client';

import React from 'react';
import { usePadStore } from '../../store/usePadStore';
import { AudioSettings } from '../../lib/audio/padEngine';
import { translations } from '../../lib/i18n/translations';
import { SlidersHorizontal } from 'lucide-react';

export const AudioControls: React.FC = () => {
  const { audioSettings, updateAudioSettings, language } = usePadStore();
  const t = translations[language];

  const playingStyleOptions: { value: AudioSettings['playingStyle']; key: 'arpeggio' | 'pop' | 'bassFirst' | 'block' }[] = [
    { value: 'arpeggio', key: 'arpeggio' },
    { value: 'pop', key: 'pop' },
    { value: 'bassFirst', key: 'bassFirst' },
    { value: 'block', key: 'block' },
  ];

  const pianoTypeOptions: { value: AudioSettings['pianoType']; key: 'grand' | 'upright' | 'electric' }[] = [
    { value: 'grand', key: 'grand' },
    { value: 'upright', key: 'upright' },
    { value: 'electric', key: 'electric' },
  ];

  return (
    <div className="w-full bg-[#16181E] border border-[#2B2E38] rounded-2xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#2B2E38] pb-3">
        <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
        <h3 className="text-sm font-mono font-bold text-[#F5F2EB] uppercase tracking-wider">{t.audioTitle}</h3>
      </div>

      {/* Playing Style Switcher */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">{t.playingStyleLabel}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {playingStyleOptions.map(s => {
            const item = t.playingStyles[s.key];
            const isSelected = audioSettings.playingStyle === s.value;
            return (
              <button
                key={s.value}
                onClick={() => updateAudioSettings({ playingStyle: s.value })}
                className={`py-3 px-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#D4AF37] border-[#F3E197] text-[#0B0C10] font-bold shadow-brass-glow scale-[1.02]'
                    : 'bg-[#0B0C10] border-[#2B2E38] text-gray-300 hover:border-gray-500'
                }`}
              >
                <p className="font-mono font-bold text-xs">{item.label}</p>
                <p className={`font-mono text-[10px] ${isSelected ? 'text-[#0B0C10]/80' : 'text-gray-500'}`}>
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Piano Type */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{t.pianoTypeLabel}</label>
        <div className="grid grid-cols-3 gap-2">
          {pianoTypeOptions.map(p => {
            const item = t.pianoTypes[p.key];
            const isSelected = audioSettings.pianoType === p.value;
            return (
              <button
                key={p.value}
                onClick={() => updateAudioSettings({ pianoType: p.value })}
                className={`py-2.5 px-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                    : 'bg-[#0B0C10] border-[#2B2E38] text-gray-300 hover:border-gray-600'
                }`}
              >
                <p className="font-mono font-bold text-xs">{item.label}</p>
                <p className="font-mono text-[10px] opacity-60">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Octave + Reverb Row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Octave */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{t.octaveLabel}</label>
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
            <span>{t.octaveLow}</span>
            <span>{t.octaveHigh}</span>
          </div>
        </div>

        {/* Reverb */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{t.reverbLabel}</label>
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
            <span>{t.reverbDry}</span>
            <span>{t.reverbHall}</span>
          </div>
        </div>
      </div>

      {/* Velocity + Sustain Row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Velocity */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{t.velocityLabel}</label>
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
                {v === 'soft' ? t.velocitySoft : v === 'medium' ? t.velocityMedium : t.velocityStrong}
              </button>
            ))}
          </div>
        </div>

        {/* Sustain */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{t.sustainLabel}</label>
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
