import React, { useState, useEffect } from 'react';
import {
  X,
  BookMarked,
  Trash2,
  Calendar,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Tag,
  Clock,
} from 'lucide-react';
import {
  QuranBookmark,
  getBookmarks,
  removeBookmark,
  getLastReadBookmark,
} from '../services/quranFeaturesService';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookmark: (surahNumber: number, ayahNumber: number) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  onSelectBookmark,
}) => {
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);
  const [selectedTag, setSelectedTag] = useState<'all' | 'daily' | 'memorization' | 'contemplation' | 'general'>('all');
  const [lastRead, setLastRead] = useState(() => getLastReadBookmark());

  useEffect(() => {
    if (isOpen) {
      setBookmarks(getBookmarks());
      setLastRead(getLastReadBookmark());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBookmark(id);
    setBookmarks(getBookmarks());
  };

  const filtered = bookmarks.filter((b) => {
    if (selectedTag === 'all') return true;
    return b.tag === selectedTag;
  });

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case 'daily':
        return 'الورد اليومي';
      case 'memorization':
        return 'حفظ وتثبيت';
      case 'contemplation':
        return 'تدبر وتأمل';
      default:
        return 'علامة مرجعية';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'daily':
        return 'bg-amber-500/20 text-amber-200 border-amber-500/30';
      case 'memorization':
        return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30';
      case 'contemplation':
        return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-200 border-slate-500/30';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="w-full max-w-lg max-h-[85vh] rounded-3xl ios-liquid-glass-dock border border-white/20 shadow-2xl flex flex-col text-slate-100 relative animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Specular Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300/60 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#0A1813]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center shadow-sm">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-amiri font-bold text-amber-200 leading-tight">
                العلامات المرجعية والمواضع المحفوظة
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                الوصول السريع لآياتك المحفوظة وآخر موضع قراءة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Last Read Quick Resume Bar */}
        {lastRead && (
          <div className="px-4 py-3 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <div className="text-xs truncate">
                <span className="text-slate-400 font-sans">آخر موضع قراءة: </span>
                <strong className="text-amber-200 font-bold">سورة {lastRead.surahName} (الآية {lastRead.ayahNumber})</strong>
              </div>
            </div>
            <button
              onClick={() => {
                onSelectBookmark(lastRead.surahNumber, lastRead.ayahNumber);
                onClose();
              }}
              className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold shrink-0 transition-all shadow-sm hover:scale-105 active:scale-95 flex items-center gap-1"
            >
              <span>متابعة</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        )}

        {/* Tag Filters */}
        <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedTag === 'all'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            الكل ({bookmarks.length})
          </button>
          <button
            onClick={() => setSelectedTag('daily')}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedTag === 'daily'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            الورد اليومي
          </button>
          <button
            onClick={() => setSelectedTag('memorization')}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedTag === 'memorization'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            حفظ وتثبيت
          </button>
          <button
            onClick={() => setSelectedTag('contemplation')}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedTag === 'contemplation'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            تدبر وتأمل
          </button>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <BookMarked className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-medium">لا توجد علامات مرجعية محفوظة بعد</p>
              <p className="text-xs text-slate-500 font-sans max-w-xs mx-auto">
                أثناء قراءة أي سورة، اضغط على زر العلامة المرجعية (🔖) بجوار أي آية لحفظ موضعك والرجوع إليه لاحقاً.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectBookmark(item.surahNumber, item.ayahNumber);
                  onClose();
                }}
                className="group p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-200">
                      سورة {item.surahName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-slate-300">
                      الآية {item.ayahNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getTagColor(item.tag)}`}>
                      {getTagLabel(item.tag)}
                    </span>
                    {item.pageNumber && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        صـ {item.pageNumber}
                      </span>
                    )}
                  </div>

                  {item.ayahText && (
                    <p className="text-xs text-slate-300 font-amiri line-clamp-2 leading-relaxed">
                      {item.ayahText}
                    </p>
                  )}

                  <div className="text-[10px] text-slate-500 flex items-center gap-1 font-sans">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.timestamp).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-1">
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/10 transition-colors"
                    title="حذف العلامة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-amber-300 group-hover:translate-x-[-2px] transition-all">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
