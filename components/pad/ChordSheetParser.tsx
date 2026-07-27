'use client';

import React, { useState } from 'react';
import { usePadStore } from '../../store/usePadStore';
import { parseChordSheet, ParsedSection } from '../../lib/music/chordParser';
import { ClipboardPaste, Wand2, X, Music2 } from 'lucide-react';

export const ChordSheetParser: React.FC = () => {
  const { chordSheetText, setChordSheetText, parseAndLoadChordSheet } = usePadStore();
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<ParsedSection[]>([]);

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
        <span>Dán Hợp Âm & Lời Từ Bài Hát</span>
      </button>
    );
  }

  return (
    <div className="w-full bg-[#16181E] border border-[#D4AF37] rounded-2xl p-5 shadow-brass-glow space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="font-display font-bold text-[#F5F2EB]">Dán Hợp Âm Từ Hopamchuan (Kèm Lời Hát)</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-400 font-mono leading-relaxed">
        Dán nguyên bản bài hát từ <a href="https://hopamchuan.com" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] underline">hopamchuan.com</a>.<br />
        Tự động tách <span className="text-[#D4AF37] font-bold">[Hợp âm]</span> và <span className="text-[#F5F2EB] font-bold">Lời hát đi kèm</span> vào các Pad đệm hát!
      </p>

      {/* Textarea */}
      <textarea
        value={chordSheetText}
        onChange={e => handleTextChange(e.target.value)}
        placeholder={`Ví dụ hopamchuan:\nVerse:\n[C]Nếu như ta [E7/G#]chẳng còn [Am]gặp lại nhau [C/G]sau vỡ tan\n[F]Liệu anh có [C/E]tiếc nuối [Dm7]những dở dang [G7]ngày qua...\n\nChorus:\n[C]Nếu như ta [G/B]chẳng còn bên nhau [Am]xin hãy giữ [Em]kỷ niệm`}
        rows={8}
        className="w-full bg-[#0B0C10] text-[#F5F2EB] border border-[#2B2E38] focus:border-[#D4AF37] rounded-xl p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
      />

      {/* Preview */}
      {preview.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-mono text-gray-400 uppercase">Xem trước kết quả Pad & Lời:</p>
          {preview.map((section, i) => (
            <div key={i} className="bg-[#0B0C10] rounded-xl p-3 border border-[#2B2E38]">
              <p className="text-[#D4AF37] font-mono text-xs font-bold mb-2">{section.name}</p>
              <div className="flex flex-wrap gap-2">
                {section.chords.map((item, j) => (
                  <div key={j} className="px-3 py-1.5 bg-[#F5F2EB] text-[#121316] rounded-xl border border-[#2B2E38] flex flex-col items-center">
                    <span className="font-display font-black text-sm">{item.chord}</span>
                    {item.lyric && <span className="font-sans text-[10px] text-gray-600">{item.lyric}</span>}
                  </div>
                ))}
              </div>
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
          Hủy
        </button>
        <button
          onClick={handleLoad}
          disabled={preview.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3E197] text-[#0B0C10] font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shadow-brass-glow"
        >
          <Wand2 className="w-4 h-4" />
          <span>Tải Hợp Âm Vào Pad</span>
        </button>
      </div>
    </div>
  );
};
