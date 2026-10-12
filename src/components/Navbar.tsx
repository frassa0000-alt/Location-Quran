import React from 'react';
import { BookOpen, Sparkles, Clock, Radio, Palette, Search, Compass } from 'lucide-react';

export type ActiveTab = 'catalog' | 'full-quran' | 'reader' | 'adhkar' | 'tasbeeh' | 'prayer' | 'qibla' | 'radio';
export type AppTheme = 'parchment' | 'emerald' | 'dark';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  fontSize: number;
  setFontSize: (size: number | ((prev: number) => number)) => void;
  fontFamily: 'amiri' | 'scheherazade' | 'cairo';
  setFontFamily: (font: 'amiri' | 'scheherazade' | 'cairo') => void;
  onOpenSearch: () => void;
  currentSurahName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  onOpenSearch,
  currentSurahName,
}) => {
  const [showSettings, setShowSettings] = React.useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'catalog', label: 'فهرس السور', icon: BookOpen },
    { id: 'full-quran', label: 'المصحف الشريف', icon: BookOpen },
    { id: 'reader', label: currentSurahName ? `سورة ${currentSurahName}` : 'تلاوة وتفسير', icon: BookOpen },
    { id: 'adhkar', label: 'أذكار المسلم', icon: Sparkles },
    { id: 'tasbeeh', label: 'السبحة', icon: Sparkles },
    { id: 'prayer', label: 'مواقيت الصلاة والأذان', icon: Clock },
    { id: 'qibla', label: 'اتجاه القبلة', icon: Compass },
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
        <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-150 ${
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

          {/* Settings & Appearance Popover */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg text-amber-300 hover:bg-[#1A332C] border border-[#203C34] bg-[#142621] transition-colors"
              title="تخصيص الخط والمظهر"
              aria-label="تخصيص الخط والمظهر"
            >
              <Palette className="w-4 h-4 text-amber-400" />
            </button>

            {showSettings && (
              <div
                className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 p-4 rounded-xl shadow-2xl bg-[#142520] border border-[#26483E] z-50 text-right space-y-4"
                dir="rtl"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-[#8FA89E]">
                    <span>حجم خط المصحف</span>
                    <span className="font-mono tabular-nums text-amber-300">{fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFontSize((s) => Math.max(18, s - 2))}
                      className="px-2.5 py-1 text-xs bg-[#1C362F] text-amber-200 rounded-md font-bold hover:bg-[#23453C]"
                    >
                      A-
                    </button>
                    <input
                      type="range"
                      min={18}
                      max={42}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <button
                      onClick={() => setFontSize((s) => Math.min(44, s + 2))}
                      className="px-2.5 py-1 text-xs bg-[#1C362F] text-amber-200 rounded-md font-bold hover:bg-[#23453C]"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8FA89E] block mb-1.5">
                    نوع الخط
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setFontFamily('amiri')}
                      className={`px-2 py-1.5 text-xs rounded-md font-amiri transition-colors ${
                        fontFamily === 'amiri'
                          ? 'bg-[#1C362F] text-amber-300 font-bold border border-[#2B5246]'
                          : 'bg-[#101D19] text-[#8FA89E] hover:text-[#EAEFEA]'
                      }`}
                    >
                      الأميري
                    </button>
                    <button
                      onClick={() => setFontFamily('scheherazade')}
                      className={`px-2 py-1.5 text-xs rounded-md font-scheherazade transition-colors ${
                        fontFamily === 'scheherazade'
                          ? 'bg-[#1C362F] text-amber-300 font-bold border border-[#2B5246]'
                          : 'bg-[#101D19] text-[#8FA89E] hover:text-[#EAEFEA]'
                      }`}
                    >
                      شهرزاد
                    </button>
                    <button
                      onClick={() => setFontFamily('cairo')}
                      className={`px-2 py-1.5 text-xs rounded-md font-cairo transition-colors ${
                        fontFamily === 'cairo'
                          ? 'bg-[#1C362F] text-amber-300 font-bold border border-[#2B5246]'
                          : 'bg-[#101D19] text-[#8FA89E] hover:text-[#EAEFEA]'
                      }`}
                    >
                      القاهرة
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1F3C34] flex justify-end">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-xs text-amber-400 font-semibold hover:underline"
                  >
                    إغلاق الإعدادات
                  </button>
                </div>
              </div>
            )}
          </div>
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
