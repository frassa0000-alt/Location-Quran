import React, { useState, useRef } from 'react';
import {
  X,
  Type,
  Palette,
  Volume2,
  Sparkles,
  RotateCcw,
  Check,
  Settings,
  Eye,
  Sliders,
  Sun,
  Moon,
  BookOpen,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { AppTheme } from './Navbar';
import { RECITERS } from '../data/reciters';

export type TextTone = 'ivory' | 'white' | 'sand' | 'silver';
export type GoldTone = 'classic' | 'radiant' | 'bronze';
export type BlackDepth = 'emerald' | 'pure-black' | 'parchment';

export interface AppSettings {
  fontSize: number;
  fontFamily: 'amiri' | 'scheherazade' | 'cairo';
  theme: AppTheme;
  textTone: TextTone;
  goldTone: GoldTone;
  blackDepth: BlackDepth;
  softGlowEnabled: boolean;
  softGlowIntensity: 'subtle' | 'normal' | 'vivid';
  spiritualWavesEnabled?: boolean;
  spiritualWavesIntensity?: 'subtle' | 'normal' | 'vivid';
  defaultReciterId: string;
  playbackSpeed: number;
  autoAdvanceAyah: boolean;
  ayahRepeatCount: number;
  showTafsirUnderAyah: boolean;
  highlightActiveAyah: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updater: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'font' | 'audio' | 'display'>('colors');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const fontOptions: { id: 'amiri' | 'scheherazade' | 'cairo'; name: string; styleName: string }[] = [
    { id: 'amiri', name: 'الخط العثماني المصحفي', styleName: 'font-amiri' },
    { id: 'scheherazade', name: 'خط شهرزاد النسخي', styleName: 'font-scheherazade' },
    { id: 'cairo', name: 'خط الرقعة المعاصر (كايرو)', styleName: 'font-cairo' },
  ];

  // خيارات درجات بياض نصوص الآيات المتناسقة لمنع إجهاد العين
  const textToneOptions: { id: TextTone; name: string; hex: string; desc: string; ratio: string }[] = [
    {
      id: 'ivory',
      name: 'عاجي دافئ مريح',
      hex: '#F5EFE6',
      desc: 'بياض عاجي هادئ يمنع إجهاد العين في القراءة الطويلة',
      ratio: '92% بياض هادئ',
    },
    {
      id: 'white',
      name: 'أبيض ناصع متناسق',
      hex: '#F8FAFC',
      desc: 'أبيض صافٍ بتباين عالٍ وواضح دون وهج مفرط',
      ratio: '100% ناصع',
    },
    {
      id: 'sand',
      name: 'أصفر رملي مصحفي',
      hex: '#FEF3C7',
      desc: 'مستوحى من خطوط المصاحف الشريفة والمخطوطات القديمة',
      ratio: '88% كلاسيكي',
    },
    {
      id: 'silver',
      name: 'فضي لؤلؤي وقور',
      hex: '#E2E8F0',
      desc: 'درجة لؤلؤية هادئة تخفف وهج الشاشة كلياً بالظلام',
      ratio: '85% راحة تامة',
    },
  ];

  // درجات عمق سواد الخلفية
  const blackDepthOptions: { id: BlackDepth; name: string; hex: string; desc: string }[] = [
    {
      id: 'emerald',
      name: 'سواد ليلي زمردي فاخر',
      hex: '#0A0E13',
      desc: 'التوليفة الملكية الهادئة المتناسقة مع طابع الموقع',
    },
    {
      id: 'pure-black',
      name: 'أسود كاحل عميق 100%',
      hex: '#000000',
      desc: 'سواد تام متباين فائق وموفر لطاقة الشاشة',
    },
    {
      id: 'parchment',
      name: 'سواد ورقي دافئ',
      hex: '#0F141C',
      desc: 'درجات دافئة كصفحات المصاحف الورقية الفاخرة',
    },
  ];

  // طابع درجات اللون الذهبي والزخارف
  const goldToneOptions: { id: GoldTone; name: string; hex: string; desc: string }[] = [
    {
      id: 'classic',
      name: 'ذهب إسلامي عتيق',
      hex: '#F59E0B',
      desc: 'ذهب عنبري دافئ ووقور، متناسق ومريح للبصر',
    },
    {
      id: 'radiant',
      name: 'ذهب ملكي وهاج',
      hex: '#FBBF24',
      desc: 'بريق ذهبي مشرق وفاخر يبرز الأرقام والفواصل',
    },
    {
      id: 'bronze',
      name: 'ذهب برونزي هادئ',
      hex: '#D97706',
      desc: 'لمسة برونزية خافتة رصينة للأعصاب الهادئة',
    },
  ];

  const fontSizes = [
    { label: 'صغير', size: 24 },
    { label: 'متوسط', size: 30 },
    { label: 'كبير', size: 36 },
    { label: 'كبير جداً', size: 42 },
  ];

  // الحصول على كود لون بياض النص الفعلي
  const currentTextHex =
    textToneOptions.find((t) => t.id === settings.textTone)?.hex || '#F5EFE6';
  // الحصول على كود لون الذهب الفعلي
  const currentGoldHex =
    goldToneOptions.find((g) => g.id === settings.goldTone)?.hex || '#F59E0B';
  // الحصول على كود لون السواد الفعلي
  const currentBlackHex =
    blackDepthOptions.find((b) => b.id === settings.blackDepth)?.hex || '#0A0E13';

  const handleScrollModalUp = () => {
    scrollContainerRef.current?.scrollBy({ top: -240, behavior: 'smooth' });
  };

  const handleScrollModalDown = () => {
    scrollContainerRef.current?.scrollBy({ top: 240, behavior: 'smooth' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col ios-liquid-glass rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden text-slate-100 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-xs shrink-0">
              <Settings className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-200 font-amiri tracking-wide flex items-center gap-2">
                <span>إعدادات المصحف والموقع</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-sans">
                  مرتبة وشاملة
                </span>
              </h2>
              <p className="text-[11px] text-emerald-400/90 font-cairo">
                تناسق الألوان والأبيض والأسود والذهب · الخط · مشغل الصوت
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* أزرار سهم طلوع ونزول سريعة داخل الإعدادات */}
            <div className="flex items-center gap-0.5 bg-black/20 p-1 rounded-2xl border border-white/10">
              <button
                onClick={handleScrollModalUp}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-amber-300 hover:text-white hover:bg-white/10 transition-colors"
                title="تحريك لأعلى داخل الإعدادات"
                aria-label="تحريك لأعلى"
              >
                <ChevronUp className="w-4 h-4 stroke-[2.5]" />
              </button>
              <div className="w-px h-3.5 bg-white/10" />
              <button
                onClick={handleScrollModalDown}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-amber-300 hover:text-white hover:bg-white/10 transition-colors"
                title="تحريك لأسفل داخل الإعدادات"
                aria-label="تحريك لأسفل"
              >
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* زر الإغلاق */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-2xl ios-glass-pill text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="إغلاق الإعدادات"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar - شريط تبويبات مرتب ومنظم */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-black/20 border-b border-white/10 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'colors'
                ? 'ios-glass-pill-active font-bold'
                : 'ios-glass-pill text-slate-300 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>الألوان والأبيض والأسود والذهب</span>
          </button>

          <button
            onClick={() => setActiveTab('font')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'font'
                ? 'ios-glass-pill-active font-bold'
                : 'ios-glass-pill text-slate-300 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span>الخط القرآني والحجم</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'audio'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs font-bold'
                : 'text-slate-400 hover:text-white hover:bg-[#10221B]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>مشغل صوت الآيات</span>
          </button>

          <button
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'display'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs font-bold'
                : 'text-slate-400 hover:text-white hover:bg-[#10221B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>التوهج والراحة البصرية</span>
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scroll-smooth"
        >
          {/* TAB 1: تناسق الألوان وتوازن الأبيض والأسود والذهب */}
          {activeTab === 'colors' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* البطاقة التفاعلية الحية للمعاينة */}
              <div
                className="p-4 rounded-xl border border-amber-500/40 shadow-inner space-y-2 select-none"
                style={{ backgroundColor: currentBlackHex }}
              >
                <div className="flex items-center justify-between text-xs pb-1 border-b border-amber-500/20">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-amber-300">معاينة فورية لتناسق الألوان والتباين:</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    تباين متناسق ومريح للعين 15.4:1
                  </span>
                </div>

                <div className="text-center py-2">
                  <p
                    className="font-amiri transition-colors duration-200"
                    style={{
                      color: currentTextHex,
                      fontSize: `${Math.min(settings.fontSize, 32)}px`,
                      lineHeight: 1.9,
                    }}
                  >
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ{' '}
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold align-middle border"
                      style={{
                        borderColor: currentGoldHex,
                        color: currentGoldHex,
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      }}
                    >
                      ١
                    </span>
                  </p>
                  <p
                    className="font-amiri transition-colors duration-200"
                    style={{
                      color: currentTextHex,
                      fontSize: `${Math.min(settings.fontSize, 32)}px`,
                      lineHeight: 1.9,
                    }}
                  >
                    الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ{' '}
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold align-middle border"
                      style={{
                        borderColor: currentGoldHex,
                        color: currentGoldHex,
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      }}
                    >
                      ٢
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#1C362F]/60 text-slate-400">
                  <span style={{ color: currentTextHex }}>درجة بياض النص: {currentTextHex}</span>
                  <span style={{ color: currentGoldHex }}>اللون الذهبي: {currentGoldHex}</span>
                  <span>عمق السواد: {currentBlackHex}</span>
                </div>
              </div>

              {/* 1. نسبة ودرجة بياض نص الآيات */}
              <div className="bg-[#091310] border border-amber-500/20 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-amber-200">درجة بياض نصوص الآيات (توازن الأبيض)</span>
                    <p className="text-[10px] text-slate-400">تجنب البياض الساطع المؤذي للعين مع الحفاظ على وضوح القراءة</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {textToneOptions.map((opt) => {
                    const isSelected = settings.textTone === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onUpdateSettings({ textTone: opt.id })}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 text-white shadow-xs'
                            : 'bg-[#10221B] border-[#1C362F] text-slate-300 hover:border-amber-500/40'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-slate-600 shrink-0 mt-0.5 shadow-xs"
                          style={{ backgroundColor: opt.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold" style={{ color: opt.hex }}>
                              {opt.name}
                            </span>
                            <span className="text-[9px] text-amber-400 font-mono px-1.5 py-0.5 rounded bg-[#091511]">
                              {opt.ratio}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{opt.desc}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. عمق سواد الخلفية والتباين */}
              <div className="bg-[#091310] border border-amber-500/20 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-amber-200">عمق سواد الخلفية (توازن الأسود)</span>
                    <p className="text-[10px] text-slate-400">اختر درجة قتامة الخلفية لتناسب إضاءة غرفتك وشاشتك</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {blackDepthOptions.map((b) => {
                    const isSelected = settings.blackDepth === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => onUpdateSettings({ blackDepth: b.id })}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 text-white shadow-xs'
                            : 'bg-[#10221B] border-[#1C362F] text-slate-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-200">{b.name}</span>
                          <span
                            className="w-4 h-4 rounded-full border border-slate-600"
                            style={{ backgroundColor: b.hex }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{b.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. درجة اللون الذهبي وزخارف المصحف */}
              <div className="bg-[#091310] border border-amber-500/20 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-amber-200">اللون الذهبي وزخارف المصحف</span>
                    <p className="text-[10px] text-slate-400">تناسق ألوان أرقام الآيات والإطارات والرموز القرآنية</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {goldToneOptions.map((g) => {
                    const isSelected = settings.goldTone === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => onUpdateSettings({ goldTone: g.id })}
                        className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-400 text-white shadow-xs'
                            : 'bg-[#10221B] border-[#1C362F] text-slate-300 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold" style={{ color: g.hex }}>
                            {g.name}
                          </span>
                          <span
                            className="w-4 h-4 rounded-full border border-amber-300/40"
                            style={{ backgroundColor: g.hex }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">{g.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. الموجات الضوئية الروحانية التفاعلية (Canvas) */}
              <div className="bg-[#091310] border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-amber-200">الموجات الضوئية الروحانية (Canvas)</span>
                      <p className="text-[10px] text-slate-400">موجات خافتة تتفاعل ببطء ونعومة مع حركة اللمس والمؤشر لتعزيز السكينة</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ spiritualWavesEnabled: !(settings.spiritualWavesEnabled !== false) })}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      settings.spiritualWavesEnabled !== false
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xs'
                        : 'bg-white/10 text-slate-400 border border-white/10'
                    }`}
                  >
                    {settings.spiritualWavesEnabled !== false ? 'مُفعّلة' : 'مُعطّلة'}
                  </button>
                </div>

                {settings.spiritualWavesEnabled !== false && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[#1C362F]/60">
                    <span className="text-[11px] text-slate-400 shrink-0 ml-1">شدة التوهج:</span>
                    {(['subtle', 'normal', 'vivid'] as const).map((level) => {
                      const isSelected = (settings.spiritualWavesIntensity || 'normal') === level;
                      const label = level === 'subtle' ? 'خافتة جداً' : level === 'normal' ? 'هادئة متزنة' : 'واضحة';
                      return (
                        <button
                          key={level}
                          onClick={() => onUpdateSettings({ spiritualWavesIntensity: level })}
                          className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                            isSelected
                              ? 'bg-amber-400 text-stone-950 shadow-xs'
                              : 'bg-[#10221B] text-slate-300 hover:text-white border border-[#1C362F]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: الخط القرآني والحجم */}
          {activeTab === 'font' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Font Family Selection */}
              <div className="bg-[#091310] border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Type className="w-4 h-4 text-amber-400" />
                  <span>نوع الخط العربي للآيات</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {fontOptions.map((opt) => {
                    const selected = settings.fontFamily === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onUpdateSettings({ fontFamily: opt.id })}
                        className={`px-3 py-2.5 text-right rounded-xl border text-xs transition-all ${
                          selected
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-xs'
                            : 'bg-[#10221B] border-[#1C362F] text-slate-300 hover:border-amber-500/40 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{opt.name}</span>
                          {selected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <span className={`${opt.styleName} text-sm text-slate-300 block`}>
                          ﴿الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ﴾
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Slider and Controls */}
              <div className="bg-[#091310] border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-200 font-bold">حجم خط الآيات:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateSettings({ fontSize: Math.max(20, settings.fontSize - 2) })}
                      className="px-2.5 py-1 rounded-lg bg-[#142A23] hover:bg-[#1B382F] text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95"
                      title="تصغير الخط"
                    >
                      - تصغير
                    </button>
                    <span className="font-mono font-bold text-amber-300 px-2.5 py-0.5 rounded-md bg-[#132822] border border-amber-500/30">
                      {settings.fontSize}px
                    </span>
                    <button
                      onClick={() => onUpdateSettings({ fontSize: Math.min(48, settings.fontSize + 2) })}
                      className="px-2.5 py-1 rounded-lg bg-[#142A23] hover:bg-[#1B382F] text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95"
                      title="تكبير الخط"
                    >
                      + تكبير
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="20"
                  max="48"
                  step="2"
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-[#12251F] rounded-lg"
                />

                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {fontSizes.map((preset) => (
                    <button
                      key={preset.size}
                      onClick={() => onUpdateSettings({ fontSize: preset.size })}
                      className={`py-1.5 text-xs rounded-xl border text-center transition-colors font-medium ${
                        settings.fontSize === preset.size
                          ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-xs'
                          : 'bg-[#10221B] text-slate-300 hover:text-white border-[#1C362F]'
                      }`}
                    >
                      {preset.label} ({preset.size}px)
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Verse Preview */}
              <div className="p-4 bg-[#060D0B] rounded-xl border border-amber-500/30 text-center select-none overflow-hidden space-y-1">
                <div className="text-[11px] text-slate-400 mb-2">معاينة بالخط والحجم الحالي:</div>
                <p
                  className={`transition-all ${
                    settings.fontFamily === 'scheherazade'
                      ? 'font-scheherazade'
                      : settings.fontFamily === 'cairo'
                      ? 'font-cairo'
                      : 'font-amiri'
                  }`}
                  style={{
                    color: currentTextHex,
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: 2.0,
                  }}
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾
                </p>
                <p
                  className={`transition-all ${
                    settings.fontFamily === 'scheherazade'
                      ? 'font-scheherazade'
                      : settings.fontFamily === 'cairo'
                      ? 'font-cairo'
                      : 'font-amiri'
                  }`}
                  style={{
                    color: currentTextHex,
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: 2.0,
                  }}
                >
                  الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: مشغل صوت الآيات */}
          {activeTab === 'audio' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#091310] border border-amber-500/20 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>إعدادات مشغل صوت الآيات وتلاوة القراء</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Default Reciter */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-medium">القارئ المفضل لتلاوة الآيات:</label>
                    <select
                      value={settings.defaultReciterId}
                      onChange={(e) => onUpdateSettings({ defaultReciterId: e.target.value })}
                      className="w-full text-xs bg-[#10221B] border border-amber-500/30 rounded-xl px-3 py-2 text-amber-200 focus:outline-none focus:border-amber-400 cursor-pointer font-bold"
                    >
                      {RECITERS.map((r) => (
                        <option key={r.id} value={r.id} className="bg-[#0B1512] text-amber-200">
                          {r.name} ({r.style})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Default Playback Speed */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-medium">سرعة الصوت الافتراضية:</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[0.75, 1, 1.25, 1.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => onUpdateSettings({ playbackSpeed: speed })}
                          className={`py-2 text-xs rounded-xl font-mono font-bold border transition-colors ${
                            settings.playbackSpeed === speed
                              ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-xs'
                              : 'bg-[#10221B] text-slate-300 border-[#1C362F] hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Auto Advance & Repeat Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Auto Advance */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#10221B] border border-[#1C362F]">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">الانتقال التلقائي للآية التالية</div>
                      <div className="text-[10px] text-slate-400">تلاوة متصلة آية تلو الأخرى تلقائياً</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ autoAdvanceAyah: !settings.autoAdvanceAyah })}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                        settings.autoAdvanceAyah ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                      aria-label="تفعيل الانتقال التلقائي"
                    >
                      <span
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          settings.autoAdvanceAyah ? '-translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Ayah Repeat for Memorization */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#10221B] border border-[#1C362F]">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">تكرار الآية (للتحفيظ)</div>
                      <div className="text-[10px] text-slate-400">مرات تشغيل كل آية قبل الانتقال</div>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      {[1, 2, 3].map((count) => (
                        <button
                          key={count}
                          onClick={() => onUpdateSettings({ ayahRepeatCount: count })}
                          className={`w-7 h-7 rounded-lg font-bold border transition-colors ${
                            settings.ayahRepeatCount === count
                              ? 'bg-amber-500 text-stone-950 border-amber-400'
                              : 'bg-[#0E1E19] text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Highlight Active Ayah toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#10221B] border border-[#1C362F]">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">تظليل الآية التي يتم الاستماع إليها</div>
                    <div className="text-[10px] text-slate-400">إبراز الآية الجاري تلاوتها بإطار ذهبي أنيق وتمرير الشاشة إليها</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ highlightActiveAyah: !settings.highlightActiveAyah })}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                      settings.highlightActiveAyah ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    aria-label="تفعيل تظليل الآية النشطة"
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.highlightActiveAyah ? '-translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: التوهج والراحة البصرية وعرض التفسير */}
          {activeTab === 'display' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Soft Glow */}
              <div className="bg-[#091310] border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-semibold text-slate-200">تأثير التوهج الروحاني الناعم (Soft Glow)</div>
                      <div className="text-[10px] text-slate-400">تدرج ضوئي روحاني هادئ وسلس في خلفية الموقع يمنح راحة وجمالاً</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ softGlowEnabled: !settings.softGlowEnabled })}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                      settings.softGlowEnabled ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                    aria-label="تفعيل التوهج الناعم"
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-stone-950 transition-transform ${
                        settings.softGlowEnabled ? '-translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {settings.softGlowEnabled && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#1C362F]">
                    <span className="text-xs text-slate-300">كثافة الإضاءة الهادئة:</span>
                    <div className="flex items-center gap-1.5 text-xs">
                      {(['subtle', 'normal', 'vivid'] as const).map((intensity) => {
                        const labels = { subtle: 'هادئ (40%)', normal: 'متوازن (70%)', vivid: 'وهاج (90%)' };
                        return (
                          <button
                            key={intensity}
                            onClick={() => onUpdateSettings({ softGlowIntensity: intensity })}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                              settings.softGlowIntensity === intensity
                                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-xs'
                                : 'bg-[#10221B] text-slate-300 border-[#1C362F] hover:text-white'
                            }`}
                          >
                            {labels[intensity]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Show Tafsir under Ayah */}
              <div className="bg-[#091310] border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">إظهار التفسير الميسر المعتمد تحت كل آية</div>
                    <div className="text-[10px] text-slate-400">تفسير مجمع الملك فهد لطباعة المصحف الشريف موثق ومختصر</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ showTafsirUnderAyah: !settings.showTafsirUnderAyah })}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                    settings.showTafsirUnderAyah ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  aria-label="تفعيل التفسير الميسر تحت الآية"
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.showTafsirUnderAyah ? '-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>


            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-t border-amber-500/25 bg-[#0E1E19]/95 shrink-0">
          <button
            onClick={onResetSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors rounded-xl hover:bg-[#132822] border border-transparent hover:border-amber-500/20"
            title="إعادة ضبط كافة الإعدادات إلى الوضع الافتراضي القياسي"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة الضبط الافتراضي</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>تم وحفظ الإعدادات</span>
          </button>
        </div>
      </div>
    </div>
  );
};
