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
import { AppSettings } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { QuranSplashIntro } from './components/QuranSplashIntro';
import { SpiritualWaveCanvas } from './components/SpiritualWaveCanvas';
import { ElAiAssistant } from './components/ElAiAssistant';
import { HiQrWorkspace } from './components/HiQr/HiQrWorkspace';
import { SURAHS_LIST } from './data/surahs';
import { WifiOff } from 'lucide-react';

interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  timestamp: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('hi-qr');
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(1);
  const [targetAyahNumber, setTargetAyahNumber] = useState<number>(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

  // Network online / offline status listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Centralized Application & Reader Settings with LocalStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedTheme = (localStorage.getItem('quran_app_theme') as AppTheme) || 'emerald';
      const savedFontSize = Number(localStorage.getItem('quran_app_font_size')) || 32;
      const savedFontFamily = (localStorage.getItem('quran_app_font_family') as 'amiri' | 'scheherazade' | 'cairo') || 'amiri';
      const savedTextTone = (localStorage.getItem('quran_app_text_tone') as any) || 'ivory';
      const savedGoldTone = (localStorage.getItem('quran_app_gold_tone') as any) || 'classic';
      const savedBlackDepth = (localStorage.getItem('quran_app_black_depth') as any) || 'emerald';
      const savedSoftGlow = localStorage.getItem('quran_soft_glow_enabled') !== 'false';
      const savedGlowIntensity = (localStorage.getItem('quran_soft_glow_intensity') as 'subtle' | 'normal' | 'vivid') || 'normal';
      const savedSpiritualWaves = localStorage.getItem('quran_spiritual_waves_enabled') !== 'false';
      const savedSpiritualWavesIntensity = (localStorage.getItem('quran_spiritual_waves_intensity') as 'subtle' | 'normal' | 'vivid') || 'normal';
      const savedReciter = localStorage.getItem('quran_default_reciter') || 'alafasy';
      const savedSpeed = Number(localStorage.getItem('quran_playback_speed')) || 1;
      const savedAutoAdvance = localStorage.getItem('quran_auto_advance_ayah') !== 'false';
      const savedRepeat = Number(localStorage.getItem('quran_ayah_repeat_count')) || 1;
      const savedShowTafsir = localStorage.getItem('quran_show_tafsir_under_ayah') !== 'false';
      const savedHighlightActive = localStorage.getItem('quran_highlight_active_ayah') !== 'false';

      return {
        fontSize: savedFontSize,
        fontFamily: savedFontFamily,
        theme: savedTheme,
        textTone: savedTextTone,
        goldTone: savedGoldTone,
        blackDepth: savedBlackDepth,
        softGlowEnabled: savedSoftGlow,
        softGlowIntensity: savedGlowIntensity,
        spiritualWavesEnabled: savedSpiritualWaves,
        spiritualWavesIntensity: savedSpiritualWavesIntensity,
        defaultReciterId: savedReciter,
        playbackSpeed: savedSpeed,
        autoAdvanceAyah: savedAutoAdvance,
        ayahRepeatCount: savedRepeat,
        showTafsirUnderAyah: savedShowTafsir,
        highlightActiveAyah: savedHighlightActive,
      };
    } catch {
      return {
        fontSize: 32,
        fontFamily: 'amiri',
        theme: 'emerald',
        textTone: 'ivory',
        goldTone: 'classic',
        blackDepth: 'emerald',
        softGlowEnabled: true,
        softGlowIntensity: 'normal',
        spiritualWavesEnabled: true,
        spiritualWavesIntensity: 'normal',
        defaultReciterId: 'alafasy',
        playbackSpeed: 1,
        autoAdvanceAyah: true,
        ayahRepeatCount: 1,
        showTafsirUnderAyah: true,
        highlightActiveAyah: true,
      };
    }
  });

  const handleUpdateSettings = (updater: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)) => {
    setSettings((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem('quran_app_theme', next.theme);
        localStorage.setItem('quran_app_font_size', String(next.fontSize));
        localStorage.setItem('quran_app_font_family', next.fontFamily);
        localStorage.setItem('quran_app_text_tone', next.textTone);
        localStorage.setItem('quran_app_gold_tone', next.goldTone);
        localStorage.setItem('quran_app_black_depth', next.blackDepth);
        localStorage.setItem('quran_soft_glow_enabled', String(next.softGlowEnabled));
        localStorage.setItem('quran_soft_glow_intensity', next.softGlowIntensity);
        if (next.spiritualWavesEnabled !== undefined) {
          localStorage.setItem('quran_spiritual_waves_enabled', String(next.spiritualWavesEnabled));
        }
        if (next.spiritualWavesIntensity !== undefined) {
          localStorage.setItem('quran_spiritual_waves_intensity', next.spiritualWavesIntensity);
        }
        localStorage.setItem('quran_default_reciter', next.defaultReciterId);
        localStorage.setItem('quran_playback_speed', String(next.playbackSpeed));
        localStorage.setItem('quran_auto_advance_ayah', String(next.autoAdvanceAyah));
        localStorage.setItem('quran_ayah_repeat_count', String(next.ayahRepeatCount));
        localStorage.setItem('quran_show_tafsir_under_ayah', String(next.showTafsirUnderAyah));
        localStorage.setItem('quran_highlight_active_ayah', String(next.highlightActiveAyah));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleResetSettings = () => {
    const defaults: AppSettings = {
      fontSize: 32,
      fontFamily: 'amiri',
      theme: 'emerald',
      textTone: 'ivory',
      goldTone: 'classic',
      blackDepth: 'emerald',
      softGlowEnabled: true,
      softGlowIntensity: 'normal',
      spiritualWavesEnabled: true,
      spiritualWavesIntensity: 'normal',
      defaultReciterId: 'alafasy',
      playbackSpeed: 1,
      autoAdvanceAyah: true,
      ayahRepeatCount: 1,
      showTafsirUnderAyah: true,
      highlightActiveAyah: true,
    };
    handleUpdateSettings(defaults);
  };

  // Bookmark / Last Read position
  const [bookmark, setBookmark] = useState<Bookmark | null>(() => {
    try {
      const saved = localStorage.getItem('quran_last_read_bookmark');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

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

  // Precise text white tone and golden accent mapping
  const textToneHex = {
    ivory: '#F5EFE6',
    white: '#F8FAFC',
    sand: '#FEF3C7',
    silver: '#E2E8F0',
  }[settings.textTone] || '#F5EFE6';

  const goldToneHex = {
    classic: '#F59E0B',
    radiant: '#FBBF24',
    bronze: '#D97706',
  }[settings.goldTone] || '#F59E0B';

  // Determine root theme styles based on blackDepth and theme settings
  const getThemeClasses = () => {
    if (settings.blackDepth === 'pure-black') {
      return 'dark bg-[#000000] text-[#F1F5F9]';
    }
    if (settings.blackDepth === 'parchment') {
      return 'dark bg-[#0F141C] text-[#F1F5F9]';
    }
    return 'dark bg-[#0A0E13] text-[#F1F5F9]';
  };

  if (activeTab === 'hi-qr') {
    return (
      <HiQrWorkspace
        onOpenQuranHub={() => {
          setActiveTab('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-cairo transition-colors duration-200 relative ${getThemeClasses()}`} dir="rtl">
      {/* Ambient Soft Glow with High-Performance Color Shift */}
      {/* Static Lightweight Ambient Atmosphere (Zero-CPU, Silky Smooth) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 ambient-glow-static" aria-hidden="true" />

      {/* Interactive Spiritual Luminous Waves Canvas (موجات ضوئية خافتة وتفاعلية بالكانفاس) */}
      <SpiritualWaveCanvas
        enabled={settings.spiritualWavesEnabled !== false}
        intensity={settings.spiritualWavesIntensity || 'normal'}
        theme={settings.theme}
      />

      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={settings.theme}
        setTheme={(t) => handleUpdateSettings({ theme: t })}
        fontSize={settings.fontSize}
        setFontSize={(sz) =>
          handleUpdateSettings({
            fontSize: typeof sz === 'function' ? sz(settings.fontSize) : sz,
          })
        }
        fontFamily={settings.fontFamily}
        setFontFamily={(f) => handleUpdateSettings({ fontFamily: f })}
        onOpenSearch={() => setIsSearchOpen(true)}
        currentSurahName={currentSurahMeta?.name}
      />

      {/* Offline Mode Indicator Banner */}
      {isOffline && (
        <div className="bg-[#11271F] border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 font-medium flex items-center justify-center gap-2 shadow-sm animate-in fade-in select-none">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>أنت الآن في وضع عدم الاتصال (أوفلاين) · يمكنك قراءة السور المحفوظة مسبقاً، استخدام السبحة الإلكترونية، وتلاوة الأذكار بدون إنترنت.</span>
        </div>
      )}

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
            fontSize={settings.fontSize}
            setFontSize={(sz) =>
              handleUpdateSettings({
                fontSize: typeof sz === 'function' ? sz(settings.fontSize) : sz,
              })
            }
            fontFamily={settings.fontFamily}
            onSaveBookmark={handleSaveBookmark}
            currentBookmark={bookmark}
            defaultReciterId={settings.defaultReciterId}
            playbackSpeedDefault={settings.playbackSpeed}
            autoAdvanceAyah={settings.autoAdvanceAyah}
            ayahRepeatCount={settings.ayahRepeatCount}
            textToneColor={textToneHex}
            goldToneColor={goldToneHex}
            showTafsirUnderAyah={settings.showTafsirUnderAyah}
          />
        )}

        {activeTab === 'adhkar' && <AdhkarSection />}

        {activeTab === 'tasbeeh' && <DigitalTasbeeh />}

        {activeTab === 'prayer' && <PrayerTimesSection />}

        {activeTab === 'qibla' && <QiblaCompass />}

        {activeTab === 'radio' && <QuranRadioSection />}
      </main>

      {/* Floating Suspended Chat ("شات متعلق في الهوا") */}
      <ElAiAssistant onNavigateSurah={handleSelectSurah} />

      {/* Global Advanced Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSurah={(num, ayah) => handleSelectSurah(num, ayah || 1)}
      />

      {/* Footer */}
      <Footer
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateSurah={(num) => handleSelectSurah(num, 1)}
      />

      {/* Website Entrance Splash Screen */}
      {showSplash && (
        <QuranSplashIntro onFinish={() => setShowSplash(false)} />
      )}
    </div>
  );
}
