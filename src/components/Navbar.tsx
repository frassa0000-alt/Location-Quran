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
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[#1C362F] bg-[#101E1A]/95 text-[#EAEFEA] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title wordmark */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="flex items-center gap-2.5 text-right group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
          aria-label="الرئيسية - القرآن الكريم"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 text-amber-300 flex items-center justify-center shadow-md border border-[#274E41]">
            <span className="font-amiri font-bold text-lg select-none">ق</span>
          </div>
          <span className="font-amiri font-bold text-2xl tracking-wide text-amber-200 group-hover:text-amber-300 transition-colors">
            القرآن الكريم
          </span>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-[#18352C] text-amber-300 border border-amber-500/60 shadow-xs font-bold'
                    : 'text-[#92AAA1] hover:text-[#EAEFEA] hover:bg-[#142621]'
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#142621] text-[#92AAA1] hover:text-[#EAEFEA] hover:bg-[#1A332C] border border-[#203C34] transition-colors"
            title="بحث في السور والآيات"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">بحث سريع</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-[#1C362F] bg-[#101E1A] px-3 py-2 overflow-x-auto flex items-center gap-2 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-[#18352C] text-amber-300 font-bold border border-amber-500/60 shadow-xs'
                  : 'text-[#8FA89E] hover:text-[#EAEFEA]'
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
