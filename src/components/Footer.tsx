import React from 'react';
import { ActiveTab } from './Navbar';

interface FooterProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onNavigateSurah: (num: number) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, onNavigateSurah }) => {
  return (
    <footer className="border-t border-[#1C362F] bg-[#0A1612] text-[#8FA89E] py-10 px-4 sm:px-8 text-right font-cairo">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-amiri font-bold text-sm shadow-xs border border-[#234A3C]">
              ق
            </div>
            <span className="font-amiri font-bold text-xl text-amber-200">
              القرآن الكريم (Quran)
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[#7C978D] max-w-md">
            موقع إسلامي متكامل وخفيف مصمم ليكون رفيق المسلم اليومي في تلاوة كتاب الله وتدبر آياته، مع التفسير الميسر المعتمد، أذكار الصباح والمساء، السبحة التفاعلية، ومواقيت الصلاة الدقيقة.
          </p>
        </div>

        {/* Quick Sections */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            أقسام الموقع
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button
                onClick={() => onNavigateTab('catalog')}
                className="hover:text-amber-200 transition-colors"
              >
                فهرس السور (١١٤ سورة)
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('full-quran')}
                className="hover:text-amber-200 transition-colors text-amber-300 font-semibold"
              >
                المصحف الشريف (٦٠٤ صفحة)
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('adhkar')}
                className="hover:text-amber-200 transition-colors"
              >
                الأذكار اليومية
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('tasbeeh')}
                className="hover:text-amber-200 transition-colors"
              >
                السبحة الإلكترونية
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('prayer')}
                className="hover:text-amber-200 transition-colors"
              >
                الصلاة
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('qibla')}
                className="hover:text-amber-200 transition-colors"
              >
                القبلة
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('radio')}
                className="hover:text-amber-200 transition-colors"
              >
                إذاعات القرآن الكريم المباشرة
              </button>
            </li>
          </ul>
        </div>

        {/* Popular Surahs */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
            سور مباركة للقراءة
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button
                onClick={() => onNavigateSurah(18)}
                className="hover:text-amber-200 transition-colors"
              >
                سورة الكهف
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateSurah(36)}
                className="hover:text-amber-200 transition-colors"
              >
                سورة يس
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateSurah(67)}
                className="hover:text-amber-200 transition-colors"
              >
                سورة الملك
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateSurah(55)}
                className="hover:text-amber-200 transition-colors"
              >
                سورة الرحمن
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateSurah(56)}
                className="hover:text-amber-200 transition-colors"
              >
                سورة الواقعة
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* شريط الحقوق والعلامة: من فريق Location Studio */}
      <div className="max-w-7xl mx-auto mt-8 pt-5 border-t border-[#1C362F] flex flex-col md:flex-row items-center justify-between text-xs text-[#647F75] gap-4">
        <p className="text-center md:text-right">صدقة جارية لكل مسلم ومسلمة · نسألكم الدعاء بظهر الغيب</p>

        {/* كتابة جديدة عصرية وأنيقة: من فريق Location Studio */}
        <div className="flex items-center gap-2">
          <span className="text-[#8FA89E] text-xs font-medium">من فريق</span>
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-gradient-to-r from-[#142C23] via-[#1A382D] to-[#142C23] border border-amber-500/30 text-amber-200 shadow-sm hover:border-amber-400/60 transition-colors">
            <span className="font-bold font-sans tracking-wider text-xs text-amber-200">
              Location Studio
            </span>
          </div>
        </div>

        <p className="text-center md:text-left text-[11px] text-[#556F66]">
          © القرآن الكريم · Quran Platform
        </p>
      </div>
    </footer>
  );
};
