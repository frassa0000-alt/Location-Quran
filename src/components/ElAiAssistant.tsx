import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  X,
  Copy,
  Check,
  RotateCcw,
  EyeOff,
  Eye,
  Mail,
  ShieldAlert,
  FileText,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface ElAiAssistantProps {
  onNavigateSurah?: (surahNumber: number, ayahNumber?: number) => void;
}

const OWNER_EMAIL = 'frassa0000@gmail.com';

const PROFANITY_REGEX = /(?:شتم|شتيمة|سب|قحب|شرموط|عرص|خول|منيك|قذر|وسخ|كلب|حمار|متخلف|ابن الكلب|يلعن|لعنة|كس|طيز|زب|فاحش|منحط|زبالة|حيوان|سافل|واطي|حقير|ابن العاهرة|عاهرة|عاهر|علق|منيوك|سكس|نيك|طياز|شرمطة|fuck|shit|bitch|bastard|asshole|cunt|dick|pussy|whore|slut|motherfucker|fucker|damn)/i;

export const ElAiAssistant: React.FC<ElAiAssistantProps> = ({ onNavigateSurah }) => {
  // Option to show or hide the floating button on screen
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quran_el_ai_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Floating chat window open/closed state
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Direct issue reporting to site owner
  const [isReportingIssue, setIsReportingIssue] = useState<boolean>(false);
  const [issueText, setIssueText] = useState<string>('');
  const [issueContact, setIssueContact] = useState<string>('');
  const [isSubmittingIssue, setIsSubmittingIssue] = useState<boolean>(false);
  const [issueFeedback, setIssueFeedback] = useState<string | null>(null);

  // User Ban & Appeal State
  const [isBanned, setIsBanned] = useState<boolean>(() => {
    try {
      return localStorage.getItem('assistant_banned_user') === 'true';
    } catch {
      return false;
    }
  });
  const [isAppealing, setIsAppealing] = useState<boolean>(false);
  const [appealReason, setAppealReason] = useState<string>('');
  const [appealContact, setAppealContact] = useState<string>('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState<boolean>(false);
  const [appealFeedback, setAppealFeedback] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('quran_assistant_history_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        text: 'أهلاً بك. أنا مساعد ذكي مستعد للإجابة عن أسئلتك في الدين أو خارجه بدقة وإيجاز.',
        timestamp: Date.now(),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Toggle widget visibility on screen
  const toggleEnabled = () => {
    setIsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('quran_el_ai_enabled', String(next));
      } catch {
        // ignore
      }
      if (!next) setIsOpen(false);
      return next;
    });
  };

  // Persist conversation
  useEffect(() => {
    try {
      if (messages.length > 1) {
        localStorage.setItem('quran_assistant_history_v4', JSON.stringify(messages.slice(-8)));
      }
    } catch {
      // ignore
    }
  }, [messages]);

  // Scroll to bottom on new message or open
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    if (isBanned) return;

    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    // Check for abusive or profanity words
    if (PROFANITY_REGEX.test(text)) {
      setIsBanned(true);
      try {
        localStorage.setItem('assistant_banned_user', 'true');
      } catch {
        // ignore
      }
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        text,
        timestamp: Date.now(),
      };
      const banMsg: ChatMessage = {
        id: `ban_${Date.now()}`,
        role: 'model',
        text: `⚠️ تم حظرك من استخدام المساعد الذكي بسبب استخدام ألفاظ غير لائقة أو مسيئة. يمكنك تقديم طعن رسمي وسيتم إرساله مباشرة لصاحب الموقع (${OWNER_EMAIL}) للمراجعة.`,
        timestamp: Date.now(),
      };
      setMessages([...messages, userMsg, banMsg]);
      setInputMessage('');
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/el-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();

      if (res.status === 403 || data.banned) {
        setIsBanned(true);
        try {
          localStorage.setItem('assistant_banned_user', 'true');
        } catch {
          // ignore
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `ban_${Date.now()}`,
            role: 'model',
            text: `⚠️ تم حظرك من استخدام المساعد الذكي بسبب استخدام ألفاظ غير لائقة. يمكنك تقديم طعن رسمي إلى صاحب الموقع (${OWNER_EMAIL}).`,
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const replyText = data.reply || 'الحمد لله، نفعك الله بالعلم النافع.';

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'model',
          text: replyText,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'model',
          text: '﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾ [الرعد: 28]. تفضل بسؤالك حول أي مسألة دينية أو معرفية.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSubmitIssueToOwner = async () => {
    if (!issueText.trim() || isSubmittingIssue) return;
    setIsSubmittingIssue(true);
    setIssueFeedback(null);
    try {
      const res = await fetch('/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: issueText.trim(),
          contact: issueContact.trim(),
        }),
      });
      if (res.ok) {
        setIssueFeedback('تم إرسال رسالتك لصاحب الموقع بنجاح. جزاك الله خيراً.');
        setIssueText('');
        setIssueContact('');
        setMessages((prev) => [
          ...prev,
          {
            id: `report_${Date.now()}`,
            role: 'model',
            text: 'تم إرسال رسالتك وملاحظتك إلى صاحب الموقع بنجاح وسيتم الاطلاع عليها.',
            timestamp: Date.now(),
          },
        ]);
        setTimeout(() => {
          setIsReportingIssue(false);
          setIssueFeedback(null);
        }, 2200);
      } else {
        setIssueFeedback('تعذر الإرسال تلقائياً، يمكنك المراسلة عبر البريد أدناه.');
      }
    } catch {
      setIssueFeedback('تعذر الإرسال تلقائياً، يمكنك المراسلة عبر البريد أدناه.');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const handleSubmitAppeal = async () => {
    if (!appealReason.trim() || isSubmittingAppeal) return;
    setIsSubmittingAppeal(true);
    setAppealFeedback(null);
    try {
      const res = await fetch('/api/submit-appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: appealReason.trim(),
          contact: appealContact.trim(),
        }),
      });
      if (res.ok) {
        setAppealFeedback(`تم استلام طعنك بنجاح وسيتم إرساله ومراجعته من قِبل صاحب الموقع (${OWNER_EMAIL}).`);
        setMessages((prev) => [
          ...prev,
          {
            id: `appeal_${Date.now()}`,
            role: 'model',
            text: `تم استلام طعنك وسيتم مراجعته من قِبل صاحب الموقع (${OWNER_EMAIL}).`,
            timestamp: Date.now(),
          },
        ]);
        setTimeout(() => {
          setIsAppealing(false);
          setAppealFeedback(null);
        }, 2500);
      } else {
        setAppealFeedback('تعذر الإرسال تلقائياً، يرجى المراسلة المباشرة عبر البريد أدناه.');
      }
    } catch {
      setAppealFeedback('تعذر الإرسال تلقائياً، يرجى المراسلة المباشرة عبر البريد أدناه.');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const handleResetChat = () => {
    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'model',
      text: 'مرحباً بك. تفضل بسؤالك حول القرآن الكريم وتدبره.',
      timestamp: Date.now(),
    };
    setMessages([welcome]);
    try {
      localStorage.removeItem('quran_assistant_history_v4');
      localStorage.removeItem('quran_el_ai_history_v3');
    } catch {
      // ignore
    }
  };

  // If user chose to hide the assistant from screen: show subtle restore toggle
  if (!isEnabled) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={toggleEnabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full ios-liquid-glass text-xs font-bold text-amber-200/90 hover:text-amber-100 shadow-xl hover:scale-105 active:scale-95 transition-all border border-amber-400/40"
          title="إظهار ™✓"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span className="flex items-center gap-0.5" dir="ltr">
            <span className="text-amber-300 font-mono text-[11px] font-bold">™</span>
            <span className="text-emerald-400 font-bold">✓</span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Suspended Chat Window ("شات متعلق في الهوا بأنيميشن جميل") */}
      {isOpen && (
        <div
          className="fixed bottom-16 sm:bottom-20 left-3 sm:left-6 z-50 w-[275px] sm:w-[295px] max-w-[92vw] h-[360px] sm:h-[390px] max-h-[72vh] rounded-3xl ios-liquid-glass-dock shadow-2xl flex flex-col overflow-hidden text-right border border-white/20 animate-spring-popup"
          dir="rtl"
        >
          {/* Top Liquid Specular Rim with subtle gradient */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/60 to-transparent pointer-events-none" />

          {/* Minimalist Header: strictly '™✓' + compact actions */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#0C221A] via-[#0E2C22] to-[#0A1A14] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 text-sm font-bold" dir="ltr">
                <span className="text-amber-300 font-mono text-xs font-bold">™</span>
                <span className="text-emerald-400 font-bold text-sm drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]">✓</span>
              </div>
              {isBanned && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500/30 border border-red-500/40 text-red-300 font-bold">
                  محظور
                </span>
              )}
            </div>

            {/* Actions: Report Issue to Owner, Reset, Hide, Close */}
            <div className="flex items-center gap-1">
              {isBanned ? (
                <button
                  onClick={() => {
                    setIsAppealing(true);
                    setIsReportingIssue(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                  title="تقديم طعن"
                >
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  <span>طعن</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsReportingIssue((prev) => !prev);
                    setIsAppealing(false);
                  }}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                    isReportingIssue
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'text-amber-300/80 hover:text-amber-200 hover:bg-white/10'
                  }`}
                  title="إرسال مشكلة لصاحب الموقع"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-[10px] hidden sm:inline">إبلاغ</span>
                </button>
              )}
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/10 transition-colors"
                title="محادثة جديدة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleEnabled}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="إخفاء من الشاشة"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View 1: Ban Appeal Form */}
          {isAppealing ? (
            <div className="flex-1 overflow-y-auto p-3 flex flex-col justify-between bg-black/30">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-1 text-red-300 text-xs font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>تقديم طعن على الحظر</span>
                  </div>
                  <button
                    onClick={() => setIsAppealing(false)}
                    className="text-slate-400 hover:text-white text-[11px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-[11px] text-red-200 leading-relaxed">
                  تم حظر حسابك لمخالفة الآداب. سيصل طعنك إلى صاحب الموقع على:
                  <div className="font-mono text-amber-300 font-bold text-[10px] mt-0.5">
                    {OWNER_EMAIL}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-300 font-medium mb-1">
                    سبب الطعن والاعتذار:
                  </label>
                  <textarea
                    rows={3}
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    placeholder="اكتب اعتذارك أو سبب رفع الطعن ليتم مراجعته..."
                    className="w-full p-2 rounded-xl bg-black/40 border border-white/15 focus:border-red-400 focus:outline-none text-xs text-slate-100 placeholder:text-slate-500 font-cairo resize-none"
                    disabled={isSubmittingAppeal}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-300 font-medium mb-1">
                    بريدك للتواصل (اختياري):
                  </label>
                  <input
                    type="text"
                    value={appealContact}
                    onChange={(e) => setAppealContact(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full px-2.5 py-1 rounded-xl bg-black/40 border border-white/15 focus:border-red-400 focus:outline-none text-xs text-slate-100 placeholder:text-slate-500 font-mono"
                    disabled={isSubmittingAppeal}
                  />
                </div>

                {appealFeedback && (
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-[11px] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{appealFeedback}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-2">
                <button
                  onClick={handleSubmitAppeal}
                  disabled={!appealReason.trim() || isSubmittingAppeal}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    appealReason.trim() && !isSubmittingAppeal
                      ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 scale-100'
                      : 'bg-white/10 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3 h-3 rotate-180" />
                  <span>{isSubmittingAppeal ? 'جاري إرسال الطعن...' : 'إرسال الطعن لصاحب الموقع'}</span>
                </button>

                <a
                  href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(
                    'طعن على حظر استخدام المساعد الذكي'
                  )}&body=${encodeURIComponent(
                    appealReason
                      ? `السلام عليكم، أود تقديم طعن بخصوص حظر استخدام المساعد:\n${appealReason}`
                      : 'السلام عليكم، أود تقديم طعن والاعتذار بخصوص حظر استخدام المساعد.'
                  )}`}
                  className="w-full py-1.5 px-2 rounded-xl text-[10px] text-slate-300 hover:text-amber-200 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1 transition-colors"
                >
                  <Mail className="w-3 h-3 text-amber-400" />
                  <span>مراسلة {OWNER_EMAIL} مباشرة</span>
                </a>
              </div>
            </div>
          ) : isReportingIssue ? (
            /* View 2: Issue Reporting Form to Site Owner */
            <div className="flex-1 overflow-y-auto p-3 flex flex-col justify-between bg-black/30">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>إرسال لصاحب الموقع</span>
                  </div>
                  <button
                    onClick={() => setIsReportingIssue(false)}
                    className="text-slate-400 hover:text-white text-[11px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10"
                  >
                    رجوع
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-300 font-medium mb-1">
                    صف المشكلة أو الاقتراح:
                  </label>
                  <textarea
                    rows={4}
                    value={issueText}
                    onChange={(e) => setIssueText(e.target.value)}
                    placeholder="اكتب ملاحظتك ليتم إرسالها مباشرة لصاحب الموقع..."
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-amber-400 focus:outline-none text-xs text-slate-100 placeholder:text-slate-500 font-cairo resize-none"
                    disabled={isSubmittingIssue}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-300 font-medium mb-1">
                    بريدك للتواصل (اختياري):
                  </label>
                  <input
                    type="text"
                    value={issueContact}
                    onChange={(e) => setIssueContact(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full px-2.5 py-1 rounded-xl bg-black/40 border border-white/15 focus:border-amber-400 focus:outline-none text-xs text-slate-100 placeholder:text-slate-500 font-mono"
                    disabled={isSubmittingIssue}
                  />
                </div>

                {issueFeedback && (
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-[11px] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{issueFeedback}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-2">
                <button
                  onClick={handleSubmitIssueToOwner}
                  disabled={!issueText.trim() || isSubmittingIssue}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    issueText.trim() && !isSubmittingIssue
                      ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 scale-100'
                      : 'bg-white/10 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3 h-3 rotate-180" />
                  <span>{isSubmittingIssue ? 'جاري الإرسال...' : 'إرسال لصاحب الموقع'}</span>
                </button>

                <a
                  href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(
                    'رسالة أو مشكلة في الموقع'
                  )}&body=${encodeURIComponent(issueText || 'السلام عليكم، لدي استفسار أو مشكلة في الموقع.')}`}
                  className="w-full py-1.5 px-2 rounded-xl text-[10px] text-slate-300 hover:text-amber-200 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1 transition-colors"
                >
                  <Mail className="w-3 h-3 text-amber-400" />
                  <span>مراسلة {OWNER_EMAIL} بالإيميل</span>
                </a>
              </div>
            </div>
          ) : (
            /* View 3: Clean, Compact Chat (No Pills) */
            <>
              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-black/10">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isBanMsg = msg.text.includes('حظرك') || msg.text.includes('حظر');
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-1.5 animate-message-fade ${
                        isUser ? 'flex-row-reverse text-left' : 'text-right'
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl p-2.5 text-xs leading-relaxed select-text ${
                          isUser
                            ? 'bg-amber-500/20 border border-amber-500/35 text-amber-100 font-medium'
                            : isBanMsg
                            ? 'bg-red-950/60 border border-red-500/40 text-red-200'
                            : 'bg-[#0B1A14]/90 border border-white/10 text-slate-100 shadow-md'
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/10 text-[9px] text-slate-400">
                            <span className="flex items-center gap-0.5 text-[10px] font-bold" dir="ltr">
                              <span className="text-amber-300 font-mono text-[9px]">™</span>
                              <span className="text-emerald-400">✓</span>
                            </span>
                            <button
                              onClick={() => handleCopy(msg.id, msg.text)}
                              className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
                              title="نسخ"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap select-text leading-relaxed font-cairo">
                          {msg.text}
                        </p>
                        {!isUser && isBanMsg && (
                          <button
                            onClick={() => setIsAppealing(true)}
                            className="mt-2 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-500/30 hover:bg-red-500/40 text-red-100 border border-red-500/50 text-[10px] font-bold transition-all"
                          >
                            <ShieldAlert className="w-3 h-3 text-red-300" />
                            <span>تقديم طعن لصاحب الموقع ({OWNER_EMAIL})</span>
                          </button>
                        )}
                        {!isUser && !isBanMsg && msg.text.includes('صاحب الموقع') && (
                          <button
                            onClick={() => setIsReportingIssue(true)}
                            className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/35 text-[10px] font-bold transition-all"
                          >
                            <Mail className="w-3 h-3 text-amber-300" />
                            <span>إرسال لصاحب الموقع الآن</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-1.5 pt-1 animate-message-fade">
                    <div className="rounded-2xl p-2 bg-[#0B1A14] border border-white/10 text-xs text-amber-300 flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                      <span className="flex items-center gap-0.5 text-[9px] mr-1 font-bold" dir="ltr">
                        <span className="text-amber-300 font-mono text-[8px]">™</span>
                        <span className="text-emerald-400">✓</span>
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer: Normal or Banned */}
              {isBanned ? (
                <div className="p-2.5 bg-red-950/80 border-t border-red-500/30 flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-red-200 text-[11px] font-medium truncate">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>تم حظر الحساب لمخالفة الآداب</span>
                  </div>
                  <button
                    onClick={() => setIsAppealing(true)}
                    className="shrink-0 px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-[10px] font-bold transition-all shadow-sm"
                  >
                    تقديم طعن
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-2 bg-[#0A1713]/95 border-t border-white/10 flex items-center gap-1 shrink-0"
                >
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="اكتب سؤالك في الدين أو خارجه..."
                      className="w-full px-3 py-1.5 rounded-2xl bg-black/40 border border-white/15 focus:border-amber-400 focus:outline-none text-xs text-slate-100 placeholder:text-slate-400 font-cairo pl-8"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className={`absolute left-1 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all ${
                        inputMessage.trim() && !isLoading
                          ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-sm scale-100'
                          : 'text-slate-500 cursor-not-allowed scale-90'
                      }`}
                      title="إرسال"
                    >
                      <Send className="w-3 h-3 rotate-180" />
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Trigger Button: Beautiful physics float & aurora halo animation, strictly '™✓' */}
      <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative overflow-hidden group flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-2xl transition-all duration-300 border animate-float-levitate animate-aurora-halo ${
            isOpen
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 border-amber-300 font-bold scale-105 shadow-amber-400/40'
              : 'ios-liquid-glass text-amber-200 border-amber-400/40 hover:border-amber-300 hover:scale-110 active:scale-95'
          }`}
          title="™✓"
          aria-label="™✓"
        >
          {/* Shimmer light sweep passing across the glass surface */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-shimmer-sweep" />

          {/* Strictly '™✓' */}
          <div className="flex items-center gap-0.5 text-xs sm:text-sm font-bold" dir="ltr">
            <span
              className={`font-mono text-xs font-bold ${
                isOpen ? 'text-stone-900' : 'text-amber-300'
              }`}
            >
              ™
            </span>
            <span
              className={`font-black ${
                isOpen
                  ? 'text-stone-950'
                  : 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]'
              }`}
            >
              ✓
            </span>
          </div>
        </button>
      </div>
    </>
  );
};
