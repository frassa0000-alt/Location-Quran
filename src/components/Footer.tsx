import React, { useState } from 'react';
import { ActiveTab } from './Navbar';
import {
  Heart,
  Share2,
  Copy,
  Check,
  X,
  Sparkles,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
  Video,
  Gift,
  ShieldCheck,
  Send,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onNavigateSurah: (num: number) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, onNavigateSurah }) => {
  const [showKhatmahRewardModal, setShowKhatmahRewardModal] = useState(false);

  // Form states for Khatmah Reward
  const [readerName, setReaderName] = useState('');
  const [readerPhone, setReaderPhone] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [readerNotes, setReaderNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleKhatmahSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readerName.trim()) {
      setFormError('يرجى كتابة اسم القارئ الكريم.');
      return;
    }
    if (!readerPhone.trim()) {
      setFormError('يرجى إدخال رقم الهاتف أو الواتساب للتواصل وتأكيد المكافأة.');
      return;
    }
    if (!videoLink.trim()) {
      setFormError('يرجى وضع رابط مقطع فيديو التوثيق (Google Drive, YouTube, Telegram أو أي رابط سحابي).');
      return;
    }

    setFormError('');
    // Store in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('khatmah_submissions') || '[]');
      const newSubmission = {
        id: 'KH-' + Math.floor(100000 + Math.random() * 900000),
        name: readerName.trim(),
        phone: readerPhone.trim(),
        videoLink: videoLink.trim(),
        notes: readerNotes.trim(),
        date: new Date().toLocaleDateString('ar-EG'),
      };
      existing.unshift(newSubmission);
      localStorage.setItem('khatmah_submissions', JSON.stringify(existing));
    } catch (err) {
      console.error(err);
    }
    setFormSubmitted(true);
  };

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
                أذكار المسلم (حصن المسلم)
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
                مواقيت الصلاة والأذان
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('qibla')}
                className="hover:text-amber-200 transition-colors"
              >
                اتجاه القبلة (البوصلة التفاعلية)
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
            <li>
              <a
                href="https://whatsapp.com/channel/0029Vb9A6zHF1YlNYIcxac0k"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 text-emerald-400 transition-colors font-bold flex items-center gap-1.5 pt-1"
                title="قناة الواتساب الرسمية"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>قناة الواتساب الرسمية 🟢</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </a>
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

      <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-[#1C362F] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#647F75] gap-3">
        <p>صدقة جارية لكل مسلم ومسلمة · نسألكم الدعاء بظهر الغيب</p>
        <p>© القرآن الكريم · Quran Platform</p>
      </div>

      {/* صنع الموقع & دعم صاحب */}
      <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-[#152923] flex flex-wrap items-center justify-center gap-3 text-xs text-[#7F9C90]">
        <div className="flex items-center gap-2">
          <span>صنع الموقع:</span>
          <span className="font-bold text-amber-300 font-sans tracking-wide px-3 py-1 rounded-lg bg-[#142921] border border-[#244A3D] shadow-xs">
            Location Studio
          </span>
        </div>

        <span className="text-[#244A3D] hidden sm:inline">•</span>

        {/* زر مكافأة ختم القرآن */}
        <button
          onClick={() => {
            setShowKhatmahRewardModal(!showKhatmahRewardModal);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-950/90 via-amber-900/70 to-amber-950/90 hover:from-amber-900 hover:to-amber-800 text-amber-300 hover:text-amber-100 border border-amber-500/70 hover:border-amber-400 shadow-md transition-all cursor-pointer font-bold active:scale-95 group"
          title="مكافأة ختم القرآن الكريم والشروط"
          aria-expanded={showKhatmahRewardModal}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>مكافأة ختم القرآن 🎁</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-amber-300 transition-transform duration-300 ${
              showKhatmahRewardModal ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* قسم تفاصيل مكافأة ختم القرآن الكريم */}
      {showKhatmahRewardModal && (
        <div className="max-w-2xl mx-auto mt-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#11231D] to-[#0A1612] border-2 border-amber-500/50 shadow-2xl text-right text-[#E5EFE9] space-y-5 animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#234A3C] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-xs">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-amber-200 flex items-center gap-2">
                  <span>مكافأة ختم القرآن الكريم</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-normal">
                    تكريم وتشجيع
                  </span>
                </h3>
                <p className="text-[11px] text-[#8FA89E]">
                  جائزة وشهادة تكريم لكل قارئ يتم ختم المصحف الشريف عبر الموقع
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowKhatmahRewardModal(false)}
              className="px-2.5 py-1 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs cursor-pointer border border-[#1E3B30]"
              title="إغلاق وطي النافذة"
            >
              <span>إغلاق</span>
              <ChevronUp className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>

          {/* البنر التحفيزي */}
          <div className="p-3.5 rounded-xl bg-[#142A22] border border-[#244E3F] text-xs leading-relaxed space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>مكافأة وهدية مباركة لأهل القرآن الكريم:</span>
            </div>
            <p className="text-[12px] text-[#CBE1D7]">
              قال رسول الله ﷺ: <em>«خيْرُكُم مَن تعلَّمَ القُرْآنَ وعلَّمَهُ»</em>. تحفيزاً على تلاوة كتاب الله عز وجل ومدارسته وإتمام الختمات، يسر الموقع تقديم مكافأة تشجيعية وشهادة ختم إلكترونية مباركة لكل من يختم القرآن الكريم كاملاً.
            </p>
          </div>

          {/* الشروط الأساسية (الشرط الإلزامي: تصوير فيديو وهو بيختمه) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>شروط استحقاق المكافأة:</span>
            </div>

            {/* بطاقة الشرط الإلزامي البارزة */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-[#1C1608] to-amber-950/60 border-2 border-amber-500/70 shadow-md space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Video className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                <span className="text-amber-200">
                  الشرط الإلزامي: تصوير مقطع فيديو واضح أثناء الختم 📹
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-amber-500/30 text-xs text-[#EAEFEA] leading-relaxed space-y-2">
                <p className="font-semibold text-amber-300">
                  لضمان الأمانة والمصداقية، يجب توثيق الختمة بفيديو يحتوي على:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded-lg bg-[#142721] border border-[#234A3C] space-y-1">
                    <span className="font-bold text-amber-300 block">١. تلاوة الختام</span>
                    <span className="text-[#95AEA3]">
                      قراءة آخر آيات المصحف (سورة الناس) ودعاء الختام بصوت القارئ.
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#142721] border border-[#234A3C] space-y-1">
                    <span className="font-bold text-amber-300 block">٢. ظهور الموقع</span>
                    <span className="text-[#95AEA3]">
                      إظهار شاشة الهاتف أو الكمبيوتر وهو يقرأ من داخل هذا الموقع مباشرة.
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#142721] border border-[#234A3C] space-y-1">
                    <span className="font-bold text-amber-300 block">٣. وضوح الفيديو</span>
                    <span className="text-[#95AEA3]">
                      تسجيل حقيقي بصوت واضح دون تسريع أو مونتاج للتأكد من تمام الختمة.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* نموذج تقديم وتوثيق الختمة */}
          <div className="p-4 rounded-xl bg-[#0F201A] border border-[#224638] space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-amber-200 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>نموذج إرسال التوثيق واستلام المكافأة:</span>
              </h4>
              <span className="text-[10px] text-[#8FA89E]">
                مراجعة وتواصل مباشر
              </span>
            </div>

            {formSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-center space-y-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="font-bold text-sm text-emerald-200">
                  مبارك ختم كتاب الله عز وجل! تقبل الله طاعتكم 🤲
                </h5>
                <p className="text-xs text-[#B7D8CA] max-w-md mx-auto leading-relaxed">
                  تم تسجيل توثيق الختمة بنجاح باسم <strong>({readerName})</strong>. سيتم التحقق من مقطع الفيديو والتواصل معكم عبر رقم الهاتف/الواتساب <strong>({readerPhone})</strong> لتسليم المكافأة والتكريم بإذن الله.
                </p>
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setReaderName('');
                    setReaderPhone('');
                    setVideoLink('');
                    setReaderNotes('');
                  }}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-xs font-bold text-white transition-colors"
                >
                  تقديم ختمة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleKhatmahSubmit} className="space-y-3 text-xs">
                {formError && (
                  <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[11px]">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-amber-300/90 mb-1">
                      اسم القارئ / القارئة (الاسم الكريم): *
                    </label>
                    <input
                      type="text"
                      value={readerName}
                      onChange={(e) => setReaderName(e.target.value)}
                      placeholder="مثال: عبد الله أحمد"
                      className="w-full px-3 py-2 rounded-lg bg-[#142A22] border border-[#244E3F] text-[#EAEFEA] placeholder-[#5A786D] focus:outline-hidden focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-amber-300/90 mb-1">
                      رقم الواتساب أو الهاتف للتواصل واستلام المكافأة: *
                    </label>
                    <input
                      type="tel"
                      value={readerPhone}
                      onChange={(e) => setReaderPhone(e.target.value)}
                      placeholder="مثال: 01012345678 أو مع كود الدولة"
                      className="w-full px-3 py-2 rounded-lg bg-[#142A22] border border-[#244E3F] text-[#EAEFEA] placeholder-[#5A786D] focus:outline-hidden focus:border-amber-400 transition-colors"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-amber-300/90 mb-1">
                    رابط مقطع الفيديو الموثّق (Google Drive, YouTube, Telegram, DropBox، إلخ): *
                  </label>
                  <input
                    type="url"
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    placeholder="ضع رابط الفيديو هنا (تأكد من فتح صلاحية المشاهدة)"
                    className="w-full px-3 py-2 rounded-lg bg-[#142A22] border border-[#244E3F] text-[#EAEFEA] placeholder-[#5A786D] focus:outline-hidden focus:border-amber-400 transition-colors"
                    dir="ltr"
                    required
                  />
                  <span className="text-[10px] text-[#78968A] mt-0.5 block">
                    يمكنك رفع الفيديو على جوجل درايف أو يوتيوب (غير مدرج) ونسخ رابطه هنا.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#8FA89E] mb-1">
                    ملاحظات أو انطباعك عن تلاوتك في الموقع (اختياري):
                  </label>
                  <input
                    type="text"
                    value={readerNotes}
                    onChange={(e) => setReaderNotes(e.target.value)}
                    placeholder="أي ملاحظة أو تاريخ الختم..."
                    className="w-full px-3 py-2 rounded-lg bg-[#142A22] border border-[#244E3F] text-[#EAEFEA] placeholder-[#5A786D] focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="submit"
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 fill-stone-950" />
                    <span>إرسال التوثيق لاستلام المكافأة 🏆</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `السلام عليكم ورحمة الله، أتممت ختم القرآن الكريم عبر الموقع وأرغب بتسليم توثيق الختم ونيل المكافأة.\nالاسم: ${readerName || '---'}\nالهاتف: ${readerPhone || '---'}\nرابط الفيديو: ${videoLink || '---'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-600/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    title="مشاركة التوثيق عبر تطبيق الواتساب"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
                    <span>إرسال عبر الواتساب</span>
                    <ExternalLink className="w-3 h-3 text-emerald-300" />
                  </a>

                  <a
                    href="https://whatsapp.com/channel/0029Vb9A6zHF1YlNYIcxac0k"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-[#142A22] hover:bg-[#1C3D32] text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    title="متابعة قناة الواتساب الرسمية"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>قناة الواتساب</span>
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
