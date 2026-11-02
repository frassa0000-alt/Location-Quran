import React from 'react';
import { BookOpen, Sparkles, Clock, Radio, Search, Compass, BookMarked, Award } from 'lucide-react';

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
  onOpenKhatmah?: () => void;
  onOpenBookmarks?: () => void;
  currentSurahName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenKhatmah,
  onOpenBookmarks,
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
    <header className="sticky top-0 sm:top-2 z-40 px-2 sm:px-4 lg:px-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto rounded-2xl sm:rounded-3xl ios-liquid-glass-dock relative overflow-hidden text-slate-100">
          {/* Top Liquid Specular Bevel Highlight (Apple Glass Light Catch) */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          {/* Bottom subtle golden caustic rim */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/25 to-transparent pointer-events-none" />

          <div className="px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
            {/* Zone 1: Brand title wordmark */}
            <button
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-2 sm:gap-2.5 text-right group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl transition-all"
              aria-label="الرئيسية - المصحف الشريف"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-400/20 via-emerald-900/40 to-slate-900/80 text-amber-300 flex items-center justify-center shadow-md border border-white/20 group-hover:scale-105 group-hover:border-amber-300/80 transition-all ios-glass-pill">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-400/20" />
              </div>
              <span className="hidden sm:inline font-amiri font-bold text-base text-amber-200/90 group-hover:text-amber-100 transition-colors">
                المصحف الشريف
              </span>
            </button>

          {/* Zone 2: Navigation links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium bg-black/20 p-1 rounded-full border border-white/5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'ios-glass-pill-active text-amber-200 font-bold shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenBookmarks && (
              <button
                onClick={onOpenBookmarks}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold ios-glass-pill hover:bg-white/15 text-slate-200 hover:text-amber-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs border border-white/15"
                title="العلامات المرجعية وآخر موضع قراءة"
              >
                <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">العلامات</span>
              </button>
            )}

            {onOpenKhatmah && (
              <button
                onClick={onOpenKhatmah}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold ios-glass-pill hover:bg-white/15 text-amber-200 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs border border-amber-400/30"
                title="متابعة ختمة القرآن الكريم وإحصائيات القراءة"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>ختمة</span>
              </button>
            )}

            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold ios-glass-pill hover:bg-white/15 text-amber-200 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs border border-amber-400/30"
              title="بحث"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>بحث</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden border-t border-white/10 bg-black/25 px-3 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'ios-glass-pill-active text-amber-200 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
