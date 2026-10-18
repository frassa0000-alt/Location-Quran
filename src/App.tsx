/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab, AppTheme } from './components/Navbar';
import { SurahCatalog } from './components/SurahCatalog';
import { QuranReader } from './components/QuranReader';
import { FullMushafReader } from './components/FullMushafReader';
import { AdhkarSection } from './components/AdhkarSection';
import { DigitalTasbeeh } from './components/DigitalTasbeeh';
import { PrayerTimesSection } from './components/PrayerTimesSection';
import { QiblaCompass } from './components/QiblaCompass';
import { QuranRadioSection } from './components/QuranRadioSection';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { Footer } from './components/Footer';
import { QuranSplashIntro } from './components/QuranSplashIntro';
import { SURAHS_LIST } from './data/surahs';
import { ChevronUp } from 'lucide-react';

interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  timestamp: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(1);
  const [targetAyahNumber, setTargetAyahNumber] = useState<number>(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Theme & Typography settings
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('quran_app_theme');
      return (saved as AppTheme) || 'emerald';
    } catch {
      return 'emerald';
    }
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quran_app_font_size');
      return saved ? Number(saved) : 32;
    } catch {
      return 32;
    }
  });

  const [fontFamily, setFontFamily] = useState<'amiri' | 'scheherazade' | 'cairo'>('amiri');

  // Bookmark / Last Read position
  const [bookmark, setBookmark] = useState<Bookmark | null>(() => {
    try {
      const saved = localStorage.getItem('quran_last_read_bookmark');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist theme & font size
  useEffect(() => {
    try {
      localStorage.setItem('quran_app_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('quran_app_font_size', String(fontSize));
    } catch {
      // ignore
    }
  }, [fontSize]);

  // Track scroll position for back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectSurah = (surahNumber: number, startAyah: number = 1) => {
    setCurrentSurahNumber(surahNumber);
    setTargetAyahNumber(startAyah);
    setActiveTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickPlaySurah = (surahNumber: number) => {
    setCurrentSurahNumber(surahNumber);
    setTargetAyahNumber(1);
    setActiveTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveBookmark = (surahNumber: number, ayahNumber: number, surahName: string) => {
    const newBookmark: Bookmark = {
      surahNumber,
      ayahNumber,
      surahName,
      timestamp: Date.now(),
    };
    setBookmark(newBookmark);
    try {
      localStorage.setItem('quran_last_read_bookmark', JSON.stringify(newBookmark));
    } catch {
      // ignore
    }
  };

  const currentSurahMeta = SURAHS_LIST.find((s) => s.number === currentSurahNumber);

  // Determine root theme styles
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return 'dark bg-[#050C0A] text-[#EAEFEA]';
    }
    if (theme === 'emerald') {
      return 'dark bg-gradient-to-b from-[#060D0A] via-[#091612] to-[#050C0A] text-[#EAEFEA]';
    }
    // warm night mus'haf
    return 'dark bg-gradient-to-b from-[#0B1512] via-[#0E1B17] to-[#08120F] text-[#EAEFEA]';
  };

  return (
    <div className={`min-h-screen flex flex-col font-cairo transition-colors duration-300 relative ${getThemeClasses()}`} dir="rtl">
      {/* Ambient Luxury Islamic Lighting in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14),transparent_70%)] blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.07),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.09),transparent_70%)] blur-3xl" />
      </div>

      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        onOpenSearch={() => setIsSearchOpen(true)}
        currentSurahName={currentSurahMeta?.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'catalog' && (
          <SurahCatalog
            onSelectSurah={handleSelectSurah}
            onQuickPlaySurah={handleQuickPlaySurah}
            onOpenFullMushaf={() => {
              setActiveTab('full-quran');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            lastReadBookmark={bookmark}
          />
        )}

        {activeTab === 'full-quran' && (
          <FullMushafReader onNavigateSurahDetail={handleSelectSurah} />
        )}

        {activeTab === 'reader' && (
          <QuranReader
            surahNumber={currentSurahNumber}
            initialAyah={targetAyahNumber}
            onNavigateSurah={(num) => {
              setCurrentSurahNumber(num);
              setTargetAyahNumber(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontFamily={fontFamily}
            onSaveBookmark={handleSaveBookmark}
            currentBookmark={bookmark}
          />
        )}

        {activeTab === 'adhkar' && <AdhkarSection />}

        {activeTab === 'tasbeeh' && <DigitalTasbeeh />}

        {activeTab === 'prayer' && <PrayerTimesSection />}

        {activeTab === 'qibla' && <QiblaCompass />}

        {activeTab === 'radio' && <QuranRadioSection />}
      </main>

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSurah={(num) => handleSelectSurah(num, 1)}
      />

      {/* Footer */}
      <Footer
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateSurah={(num) => handleSelectSurah(num, 1)}
      />

      {/* Floating Back-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-40 p-3 rounded-2xl bg-[#132821]/90 hover:bg-[#1B382E] text-amber-300 border border-amber-500/30 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 group"
          title="العودة لأعلى الصفحة"
          aria-label="العودة لأعلى الصفحة"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Website Entrance Splash Screen */}
      {showSplash && (
        <QuranSplashIntro onFinish={() => setShowSplash(false)} />
      )}
    </div>
  );
}
