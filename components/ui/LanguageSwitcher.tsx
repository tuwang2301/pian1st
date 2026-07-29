'use client';

import React from 'react';
import { usePadStore } from '../../store/usePadStore';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = usePadStore();

  return (
    <div className="flex items-center bg-[#0B0C10] border border-[#2B2E38] rounded-xl p-1 shadow-inner">
      <div className="px-2 text-gray-500">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
          language === 'en'
            ? 'bg-[#D4AF37] text-[#0B0C10] shadow-brass-glow'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('vi')}
        className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
          language === 'vi'
            ? 'bg-[#D4AF37] text-[#0B0C10] shadow-brass-glow'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        VI
      </button>
    </div>
  );
};
