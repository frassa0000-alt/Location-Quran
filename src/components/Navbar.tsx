import React from 'react';
import { BookOpen, Sparkles, Clock, Radio, Search, Compass } from 'lucide-react';

export type ActiveTab = 'catalog' | 'full-quran' | 'reader' | 'adhkar' | 'tasbeeh' | 'prayer' | 'qibla' | 'radio';
export type AppTheme = 'parchment' | 'emerald' | 'dark';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme?: AppTheme;
  setTheme?: (theme: AppTheme) => void;
  fontSize?: number;
  setFontSize?: (size: number | ((prev: number) => number)) => void;
  fontFamily?: 'amiri' | 'scheherazade' | 'cairo';
  setFontFamily?: (font: 'amiri' | 'scheherazade' | 'cairo') => void;
  onOpenSearch: () => void;
  currentSurahName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  currentSurahName,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'catalog', label: 'فهرس السور', icon: BookOpen },
    { id: 'full-quran', label: 'المصحف الشريف', icon: BookOpen },
    { id: 'reader', label: currentSurahName ? `سورة ${currentSurahName}` : 'تلاوة وتفسير', icon: BookOpen },
    { id: 'adhkar', label: 'أذكار', icon: Sparkles },
    { id: 'tasbeeh', label: 'السبحة', icon: Sparkles },
    { id: 'prayer', label: 'الصلاة', icon: Clock },
    { id: 'qibla', label: 'القبلة', icon: Compass },
    { id: 'radio', label: 'إذاعة القرآن', icon: Radio },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-amber-500/20 bg-[#07130F]/90 text-[#EAEFEA] shadow-xl relative">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title wordmark */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="flex items-center gap-3 text-right group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl transition-all"
          aria-label="الرئيسية - القرآن الكريم"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 text-amber-300 flex items-center justify-center shadow-lg border border-amber-400/40 group-hover:scale-105 group-hover:border-amber-300 transition-all">
            <BookOpen className="w-5 h-5 text-amber-300 fill-amber-400/25" />
          </div>
          <span className="font-amiri font-bold text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-200 group-hover:from-white group-hover:to-amber-200 transition-all">
            القرآن الكريم
          </span>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-200 hover-pulse-slow ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 via-[#18392F] to-emerald-500/20 text-amber-300 border border-amber-500/60 shadow-inner font-bold'
                    : 'text-[#92AAA1] hover:text-[#EAEFEA] hover:bg-[#122821]/80 hover:border-amber-500/30 border border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#10241E]/90 hover:bg-[#17372D] text-amber-200 hover:text-white border border-amber-500/30 hover:border-amber-400/60 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 hover-pulse-slow"
            title="بحث في السور والآيات"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">بحث سريع</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-amber-500/15 bg-[#091712]/95 backdrop-blur-md px-3 py-2.5 overflow-x-auto flex items-center gap-2 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap transition-all shrink-0 hover-pulse-slow ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 via-[#18392F] to-emerald-500/20 text-amber-300 font-bold border border-amber-500/60 shadow-inner'
                  : 'text-[#8FA89E] hover:text-[#EAEFEA] hover:bg-[#122821]/60'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
