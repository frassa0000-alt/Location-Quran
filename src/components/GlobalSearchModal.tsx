import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { SURAHS_LIST } from '../data/surahs';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSurah: (surahNumber: number) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSurah,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = SURAHS_LIST.filter((s) => {
    if (!query.trim()) return false;
    const q = query.trim().toLowerCase();
    const cleanName = s.name.replace(/[ًٌٍَُِّْ]/g, '');
    const cleanQuery = q.replace(/[ًٌٍَُِّْ]/g, '');
    return (
      String(s.number) === q ||
      s.name.includes(q) ||
      cleanName.includes(cleanQuery) ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q)
    );
  }).slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#142520] w-full max-w-xl rounded-2xl shadow-2xl border border-[#274B3F] overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#213C33] bg-[#101D19]">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="ابحث باسم السورة، رقمها، أو معناها..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-[#EAEFEA] placeholder:text-[#7A988E] font-cairo"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#7A988E] hover:text-[#EAEFEA] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#1B352D]">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-xs text-[#8FA89E] space-y-2">
              <p>جرّب البحث عن: «الفاتحة»، «الكهف»، «يس»، «الملك»، أو رقم السورة</p>
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                {[1, 18, 36, 67].map((num) => {
                  const s = SURAHS_LIST.find((item) => item.number === num);
                  if (!s) return null;
                  return (
                    <button
                      key={num}
                      onClick={() => {
                        onSelectSurah(num);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#1B322B] text-amber-200 border border-[#28493E] hover:bg-[#23453B] transition-colors"
                    >
                      سورة {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8FA89E]">
              لم نعثر على سورة مطابقة لـ «{query}»
            </div>
          ) : (
            results.map((surah) => (
              <button
                key={surah.number}
                onClick={() => {
                  onSelectSurah(surah.number);
                  onClose();
                }}
                className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-[#1A312B] transition-colors text-right group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#1B322B] text-amber-300 group-hover:bg-amber-500 group-hover:text-stone-950 flex items-center justify-center font-mono text-xs tabular-nums font-bold transition-colors border border-[#2A4C40]">
                    {surah.number}
                  </span>
                  <div>
                    <span className="font-amiri font-bold text-base text-amber-200 group-hover:text-amber-300 block">
                      سُورَةُ {surah.name}
                    </span>
                    <span className="text-[11px] text-[#8FA89E] font-cairo">
                      {surah.englishName} · {surah.ayahCount} آية · الجزء {surah.juz}
                    </span>
                  </div>
                </div>

                <span className="text-xs text-amber-400 group-hover:translate-x-1 transition-transform">
                  انتقال ←
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
