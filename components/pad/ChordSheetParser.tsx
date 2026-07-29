'use client';

import React, { useState } from 'react';
import { usePadStore } from '../../store/usePadStore';
import { parseChordSheet, ParsedSection } from '../../lib/music/chordParser';
import { translations } from '../../lib/i18n/translations';
import { ClipboardPaste, Wand2, X, Music2 } from 'lucide-react';

export const ChordSheetParser: React.FC = () => {
  const { chordSheetText, setChordSheetText, parseAndLoadChordSheet, language } = usePadStore();
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<ParsedSection[]>([]);
  const t = translations[language];

  const handleTextChange = (text: string) => {
    setChordSheetText(text);
    if (text.trim()) {
      const parsed = parseChordSheet(text);
      setPreview(parsed);
    } else {
      setPreview([]);
    }
  };

  const handleLoad = () => {
    parseAndLoadChordSheet();
    setIsOpen(false);
    setPreview([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#16181E] hover:bg-[#21242E] border border-[#2B2E38] hover:border-[#D4AF37] text-[#D4AF37] rounded-xl text-xs font-mono font-bold transition-all shadow-md hover:scale-105"
      >
        <ClipboardPaste className="w-4 h-4" />
        <span>{t.parserTitle}</span>
      </button>
    );
  }

  return (
    <div className="w-full bg-[#16181E] border border-[#D4AF37] rounded-2xl p-5 shadow-brass-glow space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="font-display font-bold text-[#F5F2EB]">{t.parserTitle}</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={chordSheetText}
        onChange={e => handleTextChange(e.target.value)}
        placeholder={t.parserPlaceholder}
        rows={8}
        className="w-full bg-[#0B0C10] text-[#F5F2EB] border border-[#2B2E38] focus:border-[#D4AF37] rounded-xl p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
      />

      {/* Preview */}
      {preview.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-mono text-gray-400 uppercase">{t.parserPreviewTitle}</p>
          {preview.map((section, i) => (
            <div key={i} className="bg-[#0B0C10] rounded-xl p-3 border border-[#2B2E38] space-y-2">
              <p className="text-[#D4AF37] font-mono text-xs font-bold">{section.name}</p>
              {section.lines.map((line, lIdx) => (
                <div key={lIdx} className="space-y-1">
                  <span className="text-[10px] font-mono text-gray-500">{line.lineName}</span>
                  <div className="flex flex-wrap gap-2">
                    {line.chords.map((item, j) => (
                      <div key={j} className="px-3 py-1.5 bg-[#F5F2EB] text-[#121316] rounded-xl border border-[#2B2E38] flex flex-col items-center">
                        <span className="font-display font-black text-sm">{item.chord}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => { setIsOpen(false); setPreview([]); }}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors font-mono"
        >
          {t.cancel}
        </button>
        <button
          onClick={handleLoad}
          disabled={preview.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3E197] text-[#0B0C10] font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shadow-brass-glow"
        >
          <Wand2 className="w-4 h-4" />
          <span>{t.parserButton}</span>
        </button>
      </div>
    </div>
  );
};
