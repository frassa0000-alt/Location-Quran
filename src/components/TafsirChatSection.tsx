import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareQuote,
  Send,
  Sparkles,
  BookOpen,
  Play,
  Pause,
  Copy,
  Check,
  BadgeCheck,
  Trash2,
  HelpCircle,
  ChevronLeft,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { SURAHS_LIST, SurahMeta } from '../data/surahs';
import { RECITERS, getAyahAudioUrl } from '../data/reciters';

interface MatchItem {
  surahNumber: number;
  surahName: string;
  ayahNumberInSurah: number;
  ayahNumberInQuran: number;
  snippetText: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  text?: string;
  // If assistant response with an ayah & tafsir
  ayahData?: {
    surahNumber: number;
    surahName: string;
    surahEnglishName: string;
    ayahNumberInSurah: number;
    ayahNumberInQuran: number;
    juzNumber?: number;
    pageNumber?: number;
    uthmaniText: string;
    tafsirText: string;
    source: string;
  };
  otherMatches?: MatchItem[];
  error?: string;
}

interface TafsirChatSectionProps {
  onNavigateSurahDetail?: (surahNumber: number, startAyah?: number) => void;
}

const STORAGE_KEY = 'quran_tafsir_chat_history_v1';

// Famous special queries map
const FAMOUS_AYAT: Record<string, { surah: number; ayah: number }> = {
  'اية الكرسي': { surah: 2, ayah: 255 },
  'آية الكرسي': { surah: 2, ayah: 255 },
  'الكرسي': { surah: 2, ayah: 255 },
  'خواتيم البقرة': { surah: 2, ayah: 285 },
  'خواتيم سورة البقرة': { surah: 2, ayah: 285 },
  'آخر آيتين من البقرة': { surah: 2, ayah: 285 },
  'آمن الرسول': { surah: 2, ayah: 285 },
  'امن الرسول': { surah: 2, ayah: 285 },
  'اية الدين': { surah: 2, ayah: 282 },
  'آية الدين': { surah: 2, ayah: 282 },
  'اية النور': { surah: 24, ayah: 35 },
  'آية النور': { surah: 24, ayah: 35 },
  'الله نور السماوات': { surah: 24, ayah: 35 },
  'اية السيف': { surah: 9, ayah: 5 },
  'آية السيف': { surah: 9, ayah: 5 },
};

export const TafsirChatSection: React.FC<TafsirChatSectionProps> = ({
  onNavigateSurahDetail,
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // storage safe
    }
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        timestamp: Date.now(),
        text: 'مرحباً بك في «التفسير بالكتابة». اكتب أي آية كريمة، أو جزءاً منها، أو اسم السورة ورقم الآية (مثل: «آية الكرسي» أو «البقرة 255» أو «إنا أعطيناك الكوثر»)، وسأوافيك فوراً بنص الآية وتفسيرها الميسر المعتمد.',
      },
    ];
  });

  // Audio player state for ayah audio inside chat
  const [playingAyah, setPlayingAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage safe
    }
  }, [messages]);

  // Clean diacritics for flexible text matching
  const removeDiacritics = (str: string): string => {
    return str
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .trim();
  };

  // Helper to fetch Ayah Uthmani text + Muyassar Tafsir
  const fetchAyahDualEdition = async (identifier: string | number) => {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${identifier}/editions/quran-uthmani,ar.muyassar`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
      const uthmani = json.data[0];
      const tafsir = json.data[1];
      return {
        surahNumber: uthmani.surah.number,
        surahName: uthmani.surah.name.replace(/^سُورَةُ\s*/, ''),
        surahEnglishName: uthmani.surah.englishName,
        ayahNumberInSurah: uthmani.numberInSurah,
        ayahNumberInQuran: uthmani.number,
        juzNumber: uthmani.juz,
        pageNumber: uthmani.page,
        uthmaniText: uthmani.text,
        tafsirText: tafsir.text || 'التفسير متاح في النسخة الورقية للمصحف الشريف.',
        source: 'التفسير الميسر (مجمع الملك فهد لطباعة المصحف الشريف)',
      };
    }
    throw new Error('Ayah not found');
  };

  // Core lookup logic
  const handleQuery = async (queryText: string) => {
    const raw = queryText.trim();
    if (!raw) return;

    const userMsgId = 'msg-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: Date.now(),
      text: raw,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const cleanInput = removeDiacritics(raw).toLowerCase();

      // 1. Check famous queries (like Ayat Al-Kursi)
      for (const [key, target] of Object.entries(FAMOUS_AYAT)) {
        if (cleanInput.includes(removeDiacritics(key))) {
          const data = await fetchAyahDualEdition(`${target.surah}:${target.ayah}`);
          const assistantMsg: ChatMessage = {
            id: 'resp-' + Date.now(),
            sender: 'assistant',
            timestamp: Date.now(),
            ayahData: data,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setLoading(false);
          return;
        }
      }

      // 2. Check Surah name + number pattern, e.g. "البقرة 255" or "الكهف آية 10" or "سورة يس 1"
      let foundSurah: SurahMeta | undefined;
      let targetAyahNum: number | undefined;

      // Clean out common prefixes
      const strippedInput = raw
        .replace(/^(?:تفسير|ما\s*معنى|معنى|اية|آية|سورة|في\s*سورة)\s+/i, '')
        .trim();

      // Check each surah
      for (const s of SURAHS_LIST) {
        const sClean = removeDiacritics(s.name);
        const sRaw = s.name;
        if (
          cleanInput.startsWith(sClean) ||
          cleanInput.includes(`سورة ${sClean}`) ||
          strippedInput.startsWith(sClean) ||
          strippedInput.startsWith(sRaw)
        ) {
          // Look for number in input
          const matchNum = raw.match(/\d+/);
          if (matchNum) {
            foundSurah = s;
            targetAyahNum = parseInt(matchNum[0], 10);
            break;
          } else {
            // User typed just the surah name, e.g. "سورة الكوثر"
            foundSurah = s;
            targetAyahNum = 1;
            break;
          }
        }
      }

      if (foundSurah && targetAyahNum && targetAyahNum >= 1 && targetAyahNum <= foundSurah.ayahCount) {
        const data = await fetchAyahDualEdition(`${foundSurah.number}:${targetAyahNum}`);
        const assistantMsg: ChatMessage = {
          id: 'resp-' + Date.now(),
          sender: 'assistant',
          timestamp: Date.now(),
          ayahData: data,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setLoading(false);
        return;
      }

      // 3. Search via Al-Quran Cloud keyword search
      // Filter out non-search words
      const cleanedSearchKeyword = raw
        .replace(/(?:تفسير|ما\s*معنى|معنى\s*قوله\s*تعالى|قوله\s*تعالى|آية|اية|سورة)\s*/gi, '')
        .trim();

      const searchParam = cleanedSearchKeyword || raw;
      const searchRes = await fetch(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(searchParam)}/all/quran-simple-clean`
      );

      if (searchRes.ok) {
        const searchJson = await searchRes.json();
        if (searchJson.code === 200 && searchJson.data && searchJson.data.matches && searchJson.data.matches.length > 0) {
          const topMatch = searchJson.data.matches[0];
          const data = await fetchAyahDualEdition(topMatch.number);

          // Additional matches if multiple
          const otherMatches: MatchItem[] = searchJson.data.matches.slice(1, 4).map((m: any) => ({
            surahNumber: m.surah.number,
            surahName: m.surah.name.replace(/^سُورَةُ\s*/, ''),
            ayahNumberInSurah: m.numberInSurah,
            ayahNumberInQuran: m.number,
            snippetText: m.text,
          }));

          const assistantMsg: ChatMessage = {
            id: 'resp-' + Date.now(),
            sender: 'assistant',
            timestamp: Date.now(),
            ayahData: data,
            otherMatches: otherMatches.length > 0 ? otherMatches : undefined,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setLoading(false);
          return;
        }
      }

      // 4. Fallback: Not found
      const assistantMsg: ChatMessage = {
        id: 'resp-' + Date.now(),
        sender: 'assistant',
        timestamp: Date.now(),
        text: `لم نتمكن من العثور على آية مطابقة بدقة للعبارة «${raw}».`,
        error: 'يرجى كتابة نص الآية بدقة بدون أخطاء إملائية، أو تحديد اسم السورة ورقم الآية مثل: «البقرة 255» أو «الكهف 10» أو «قل هو الله أحد».',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error fetching tafsir in chat:', err);
      const assistantMsg: ChatMessage = {
        id: 'resp-' + Date.now(),
        sender: 'assistant',
        timestamp: Date.now(),
        text: 'تعذر الاتصال بخادم التفسير في الوقت الراهن. يرجى التحقق من اتصالك بالإنترنت وإعادة المحاولة.',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Play audio for verse in chat
  const handleToggleAyahAudio = (surahNumber: number, ayahNumber: number) => {
    if (playingAyah && playingAyah.surah === surahNumber && playingAyah.ayah === ayahNumber) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAyah(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const reciter = RECITERS[0]; // Mishary Al-Afasy
    const url = getAyahAudioUrl(reciter, surahNumber, ayahNumber);
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingAyah({ surah: surahNumber, ayah: ayahNumber });

    audio.play().catch(() => {
      setPlayingAyah(null);
    });

    audio.onended = () => {
      setPlayingAyah(null);
    };
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        timestamp: Date.now(),
        text: 'تم مسح المحادثة. يمكنك كتابة أي آية كريمة أو سؤال عن تفسير أي آية في القرآن الكريم.',
      },
    ]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // safe
    }
  };

  const QUICK_PROMPTS = [
    'آية الكرسي',
    'إنا أعطيناك الكوثر',
    'قل هو الله أحد',
    'البقرة 285',
    'الكهف 10',
    'اهدنا الصراط المستقيم',
    'وقل رب زدني علما',
  ];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#12241F] via-[#0F1E19] to-[#0A1512] border border-[#234338] p-6 sm:p-8 text-right shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center font-bold shadow-md">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-amiri font-bold text-amber-200 tracking-wide">
                التفسير بالكتابة
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#A8C4B8] max-w-xl leading-relaxed">
              اكتب في المحادثة أي آية أو جزءاً منها، أو اسم السورة ورقم الآية، لتحصل فوراً على نصها القرآني وتفسيرها الميسر المعتمد.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 text-xs font-bold shadow-xs">
              <BadgeCheck className="w-4 h-4 text-blue-400" />
              <span>توثيق معتمد (مجمع الملك فهد)</span>
            </span>
            {messages.length > 1 && (
              <button
                onClick={handleClearHistory}
                className="p-2 rounded-xl bg-[#162C24] hover:bg-[#1E3B31] text-[#93B0A4] hover:text-rose-300 transition-colors border border-[#28493D]"
                title="مسح سجل المحادثة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-5 mt-5 border-t border-[#1C362C] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-[#7B9A8F] shrink-0 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            اقتراحات سريعة:
          </span>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleQuery(prompt)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#162C24] hover:bg-[#1F3D32] text-amber-200/90 hover:text-amber-200 border border-[#28493D] transition-colors shrink-0 shadow-xs active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-3xl bg-[#0D1815] border border-[#1E3930] p-4 sm:p-6 shadow-inner min-h-[420px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 flex-1 overflow-y-auto max-h-[62vh] pr-1 pl-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* User Bubble */}
              {msg.sender === 'user' && (
                <div className="max-w-[85%] sm:max-w-md rounded-2xl rounded-tr-xs bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 shadow-md text-right text-sm sm:text-base font-cairo">
                  {msg.text}
                </div>
              )}

              {/* Assistant Plain Text Response */}
              {msg.sender === 'assistant' && msg.text && !msg.ayahData && (
                <div className="max-w-[90%] sm:max-w-2xl rounded-2xl rounded-tl-xs bg-[#13231E] border border-[#234237] text-[#DCEAE3] p-4 text-right text-xs sm:text-sm font-cairo shadow-sm space-y-2">
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.error && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{msg.error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Assistant Ayah + Tafsir Full Card */}
              {msg.sender === 'assistant' && msg.ayahData && (
                <div className="max-w-full sm:max-w-2xl w-full rounded-2xl rounded-tl-xs bg-[#11211C] border border-[#26493D] p-4 sm:p-5 text-right shadow-lg space-y-3.5">
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1E3A30]">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-900/80 border border-emerald-600/40 text-amber-300 flex items-center justify-center font-bold text-xs">
                        {msg.ayahData.ayahNumberInSurah}
                      </span>
                      <div>
                        <h3 className="font-amiri font-bold text-amber-200 text-base sm:text-lg">
                          سورة {msg.ayahData.surahName}
                        </h3>
                        <span className="text-[11px] text-[#7E9E91]">
                          الآية {msg.ayahData.ayahNumberInSurah} · {msg.ayahData.surahEnglishName}
                          {msg.ayahData.juzNumber && ` · الجزء ${msg.ayahData.juzNumber}`}
                        </span>
                      </div>
                    </div>

                    {/* Small Blue Verification Badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/80 border border-blue-500/40 text-blue-400 text-[10px] font-bold shadow-xs">
                      <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>توثيق معتمد</span>
                    </span>
                  </div>

                  {/* Sacred Quranic Text */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#091511] border border-amber-500/30 shadow-inner">
                    <p
                      className="font-quran text-lg sm:text-xl text-amber-100 font-bold text-right select-text"
                      style={{ lineHeight: '2.5' }}
                    >
                      ﴿{msg.ayahData.uthmaniText}﴾
                      <span className="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-1.5 mx-2 rounded-full border border-amber-500/70 bg-[#142B24] text-amber-300 font-mono text-[11px] font-bold">
                        {msg.ayahData.ayahNumberInSurah}
                      </span>
                    </p>
                  </div>

                  {/* Tafsir Block with Source */}
                  <div className="rounded-xl bg-[#08120E] border border-[#1C362D] p-3.5 text-right font-cairo space-y-1.5 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-1 pb-1 border-b border-[#152B24]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>التفسير الميسر:</span>
                      </div>
                      <span className="text-[10px] text-[#84A598]">
                        المصدر: مجمع الملك فهد لطباعة المصحف الشريف
                      </span>
                    </div>

                    <p className="text-xs sm:text-[13px] text-[#DCEAE3] leading-relaxed font-normal select-text">
                      {msg.ayahData.tafsirText}
                    </p>
                  </div>

                  {/* Other matches if any */}
                  {msg.otherMatches && msg.otherMatches.length > 0 && (
                    <div className="pt-2 border-t border-[#1A332B] space-y-1.5">
                      <span className="text-[11px] text-[#86A699] font-medium block">
                        مواضع أخرى ورد فيها نفس النص، انقر لعرض تفسيرها:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.otherMatches.map((m) => (
                          <button
                            key={m.ayahNumberInQuran}
                            onClick={() => handleQuery(`${m.surahName} ${m.ayahNumberInSurah}`)}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-[#162D24] hover:bg-[#203F33] text-amber-300 border border-[#274A3D] transition-colors"
                          >
                            سورة {m.surahName} ({m.ayahNumberInSurah})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-[#1C362E] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Play recitation */}
                      <button
                        onClick={() =>
                          handleToggleAyahAudio(
                            msg.ayahData!.surahNumber,
                            msg.ayahData!.ayahNumberInSurah
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          playingAyah &&
                          playingAyah.surah === msg.ayahData.surahNumber &&
                          playingAyah.ayah === msg.ayahData.ayahNumberInSurah
                            ? 'bg-amber-400 text-stone-950 font-bold animate-pulse'
                            : 'bg-[#183127] hover:bg-[#204034] text-amber-300 border border-[#2C5243]'
                        }`}
                        title="استماع لتلاوة الآية"
                      >
                        {playingAyah &&
                        playingAyah.surah === msg.ayahData.surahNumber &&
                        playingAyah.ayah === msg.ayahData.ayahNumberInSurah ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>إيقاف التلاوة</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>استماع للآية</span>
                          </>
                        )}
                      </button>

                      {/* Copy Tafsir */}
                      <button
                        onClick={() =>
                          handleCopyText(
                            msg.id,
                            `﴿${msg.ayahData!.uthmaniText}﴾ [سورة ${msg.ayahData!.surahName}: ${msg.ayahData!.ayahNumberInSurah}]\n\nالتفسير الميسر: ${msg.ayahData!.tafsirText}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-[#90AD9F] hover:text-[#EAEFEA] bg-[#142921] hover:bg-[#1B362C] border border-[#264538] transition-colors"
                        title="نسخ نص الآية والتفسير"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-300 text-[11px]">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">نسخ</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Open in Quran Reader */}
                    {onNavigateSurahDetail && (
                      <button
                        onClick={() =>
                          onNavigateSurahDetail(
                            msg.ayahData!.surahNumber,
                            msg.ayahData!.ayahNumberInSurah
                          )
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
                        title="فتح السورة في قارئ القرآن"
                      >
                        <span>فتح في المصحف</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing/Loading indicator */}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="rounded-2xl rounded-tl-xs bg-[#13231E] border border-[#234237] text-[#A6C4B8] px-4 py-3 text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>جاري البحث في المصحف الشريف واستخراج التفسير المعتمد...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery(input);
          }}
          className="pt-2 border-t border-[#1A332B] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="اكتب آية أو كلمات منها أو اسم السورة ورقم الآية (مثال: آية الكرسي، البقرة 255)..."
            className="flex-1 bg-[#091410] border border-[#213C32] focus:border-amber-500/70 focus:outline-none rounded-2xl px-4 py-3 text-sm text-[#EAEFEA] placeholder:text-[#6E8E81] font-cairo shadow-inner"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            title="إرسال"
          >
            <Send className="w-4 h-4 -scale-x-100" />
            <span className="hidden sm:inline text-xs font-bold">إرسال</span>
          </button>
        </form>
      </div>
    </div>
  );
};
