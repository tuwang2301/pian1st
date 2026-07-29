'use client';

import React, { useState } from 'react';
import { NOTE_NAMES, NoteName } from '../../lib/music/chords';
import { usePadStore } from '../../store/usePadStore';
import { padEngine } from '../../lib/audio/padEngine';
import { translations } from '../../lib/i18n/translations';
import { Volume2, X, Music2 } from 'lucide-react';

interface ChordSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chordStr: string, beats: number) => void;
  initialChord?: string;
  initialBeats?: number;
}

const QUALITIES = [
  { label: 'Major', value: '' },
  { label: 'Minor (m)', value: 'm' },
  { label: 'Dominant 7', value: '7' },
  { label: 'Major 7 (maj7)', value: 'maj7' },
  { label: 'Minor 7 (m7)', value: 'm7' },
  { label: 'Diminished (dim)', value: 'dim' },
  { label: 'Augmented (aug)', value: 'aug' },
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
  const { audioSettings, language } = usePadStore();
  const t = translations[language];

  const [root, setRoot] = useState<NoteName>('C');
  const [quality, setQuality] = useState<string>('');
  const [bass, setBass] = useState<string>('');
  const [beats] = useState<number>(initialBeats);

  if (!isOpen) return null;

  const currentChordString = `${root}${quality}${bass ? `/${bass}` : ''}`;

  const handlePreview = () => {
    padEngine.triggerChordPad(currentChordString, audioSettings);
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
              {t.selectChordTitle}
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
              {t.selectChordTitle}
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
            <span>Test</span>
          </button>
        </div>

        {/* Root Note Picker */}
        <div>
          <label className="text-xs font-mono text-gray-400 block mb-2 uppercase">
            1. {t.rootNote}
          </label>
          <div className="grid grid-cols-6 gap-2">
            {NOTE_NAMES.map((n) => (
              <button
                key={n}
                onClick={() => setRoot(n)}
                className={`py-2 rounded-xl font-mono font-bold text-sm border transition-all ${
                  root === n
                    ? 'bg-[#D4AF37] text-[#0B0C10] border-[#F3E197] shadow-brass-glow'
                    : 'bg-[#0B0C10] text-gray-300 border-[#2B2E38] hover:border-gray-500'
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
            2. {t.chordQuality}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {QUALITIES.map((q) => (
              <button
                key={q.value}
                onClick={() => setQuality(q.value)}
                className={`py-2 px-3 rounded-xl font-mono text-xs border text-left transition-all ${
                  quality === q.value
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                    : 'bg-[#0B0C10] text-gray-400 border-[#2B2E38] hover:border-gray-600'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slash Bass Picker */}
        <div>
          <label className="text-xs font-mono text-gray-400 block mb-2 uppercase">
            3. {t.bassNote}
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setBass('')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs border flex-shrink-0 transition-all ${
                !bass
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                  : 'bg-[#0B0C10] text-gray-500 border-[#2B2E38]'
              }`}
            >
              None
            </button>
            {NOTE_NAMES.map((n) => (
              <button
                key={n}
                onClick={() => setBass(n)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs border flex-shrink-0 transition-all ${
                  bass === n
                    ? 'bg-[#D4AF37] text-[#0B0C10] border-[#F3E197] font-bold shadow-brass-glow'
                    : 'bg-[#0B0C10] text-gray-400 border-[#2B2E38]'
                }`}
              >
                /{n}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#2B2E38] pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-mono text-gray-400 hover:text-white transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#F3E197] text-[#0B0C10] font-bold text-sm shadow-brass-glow transition-all hover:scale-105"
          >
            {t.saveChord}
          </button>
        </div>
      </div>
    </div>
  );
};
