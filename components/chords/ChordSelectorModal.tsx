'use client';

import React, { useState } from 'react';
import { NOTE_NAMES, NoteName } from '../../lib/music/chords';
import { audioEngine } from '../../lib/audio/engine';
import { Volume2, X, Check, Music2 } from 'lucide-react';

interface ChordSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chordStr: string, beats: number) => void;
  initialChord?: string;
  initialBeats?: number;
}

const QUALITIES = [
  { label: 'Trưởng (Major)', value: '' },
  { label: 'Thứ (Minor)', value: 'm' },
  { label: 'Bảy (7)', value: '7' },
  { label: 'Major 7 (Maj7)', value: 'maj7' },
  { label: 'Minor 7 (m7)', value: 'm7' },
  { label: 'Giảm (Dim)', value: 'dim' },
  { label: 'Tăng (Aug)', value: 'aug' },
  { label: 'Sus 2', value: 'sus2' },
  { label: 'Sus 4', value: 'sus4' },
  { label: 'Add 9', value: 'add9' },
];

export const ChordSelectorModal: React.FC<ChordSelectorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialChord = 'C',
  initialBeats = 4,
}) => {
  // Parse initial chord
  const [root, setRoot] = useState<NoteName>('C');
  const [quality, setQuality] = useState<string>('');
  const [bass, setBass] = useState<string>('');
  const [beats, setBeats] = useState<number>(initialBeats);

  if (!isOpen) return null;

  const currentChordString = `${root}${quality}${bass ? `/${bass}` : ''}`;

  const handlePreview = () => {
    audioEngine.playChordPreview(currentChordString);
  };

  const handleSave = () => {
    onSave(currentChordString, beats);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0C10]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#16181E] border border-[#2B2E38] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2B2E38] pb-4">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-display font-bold text-lg text-[#F5F2EB]">
              Chọn Hợp Âm Piano
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#21242E] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Preview Banner */}
        <div className="bg-[#0B0C10] border border-[#2B2E38] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-gray-400 block uppercase">
              Hợp Âm Đang Chọn
            </span>
            <span className="font-display font-bold text-3xl text-[#D4AF37]">
              {currentChordString}
            </span>
          </div>

          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 bg-[#21242E] hover:bg-[#2B2E38] text-[#F3E197] rounded-xl font-mono text-xs border border-[#2B2E38] transition-all hover:scale-105"
          >
            <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            Nghe Thử
          </button>
        </div>

        {/* Root Note Picker */}
        <div>
          <label className="text-xs font-mono text-gray-400 block mb-2 uppercase">
            1. Chọn Nốt Gốc (Root)
          </label>
          <div className="grid grid-cols-6 gap-2">
            {NOTE_NAMES.map((n) => (
              <button
                key={n}
                onClick={() => setRoot(n)}
                className={`py-2 rounded-lg font-mono font-bold text-sm transition-all border ${
                  root === n
                    ? 'bg-[#D4AF37] text-[#0B0C10] border-[#D4AF37] shadow-brass-glow'
                    : 'bg-[#0B0C10] text-[#F5F2EB] border-[#2B2E38] hover:border-[#D4AF37]/50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Picker */}
        <div>
          <label className="text-xs font-mono text-gray-400 block mb-2 uppercase">
            2. Chọn Loại Hợp Âm (Quality)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
            {QUALITIES.map((q) => (
              <button
                key={q.value}
                onClick={() => setQuality(q.value)}
                className={`py-2 px-3 rounded-lg text-xs font-mono text-left transition-all border flex items-center justify-between ${
                  quality === q.value
                    ? 'bg-[#21242E] text-[#D4AF37] border-[#D4AF37]'
                    : 'bg-[#0B0C10] text-gray-300 border-[#2B2E38] hover:border-[#2B2E38]'
                }`}
              >
                <span>{q.label}</span>
                {quality === q.value && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Beats Picker */}
        <div>
          <label className="text-xs font-mono text-gray-400 block mb-2 uppercase">
            3. Độ Dài Phách (Beats)
          </label>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 6].map((b) => (
              <button
                key={b}
                onClick={() => setBeats(b)}
                className={`flex-1 py-2 rounded-lg font-mono font-bold text-sm border transition-all ${
                  beats === b
                    ? 'bg-[#D4AF37] text-[#0B0C10] border-[#D4AF37]'
                    : 'bg-[#0B0C10] text-gray-300 border-[#2B2E38]'
                }`}
              >
                {b} Phách
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-[#2B2E38] pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-mono text-gray-400 hover:text-white hover:bg-[#21242E] transition-all"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#D4AF37] text-[#0B0C10] hover:bg-[#F3E197] transition-all shadow-brass-glow hover:scale-105"
          >
            Xác Nhận Hợp Âm
          </button>
        </div>
      </div>
    </div>
  );
};
