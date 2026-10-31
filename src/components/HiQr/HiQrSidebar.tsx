import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Code2,
  FileText,
  Image as ImageIcon,
  BarChart3,
  BookOpen,
  Sun,
  Moon,
  Globe,
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { HiQrChatSession } from '../../types/hiQr';

interface HiQrSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: HiQrChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  onOpenCodeSandbox: () => void;
  onOpenDocumentRag: () => void;
  onOpenImageStudio: () => void;
  onOpenAdminStats: () => void;
  onOpenQuranHub: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isEnglish: boolean;
  onToggleLanguage: () => void;
}

export const HiQrSidebar: React.FC<HiQrSidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePinSession,
  onOpenCodeSandbox,
  onOpenDocumentRag,
  onOpenImageStudio,
  onOpenAdminStats,
  onOpenQuranHub,
  isDarkMode,
  onToggleDarkMode,
  isEnglish,
  onToggleLanguage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered chats
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.isPinned);

  // Group unpinned sessions by time
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const todaySessions = unpinnedSessions.filter((s) => now - s.updatedAt < oneDay);
  const yesterdaySessions = unpinnedSessions.filter(
    (s) => now - s.updatedAt >= oneDay && now - s.updatedAt < 2 * oneDay
  );
  const olderSessions = unpinnedSessions.filter((s) => now - s.updatedAt >= 2 * oneDay);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 ${
          isEnglish ? 'left-0' : 'right-0'
        } z-50 w-72 sm:w-80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0'
            : isEnglish
            ? '-translate-x-full lg:translate-x-0'
            : 'translate-x-full lg:translate-x-0'
        } ${
          isDarkMode
            ? 'bg-[#0B1311] border-white/10 text-slate-100'
            : 'bg-stone-50 border-stone-200 text-stone-900'
        } border-${isEnglish ? 'r' : 'l'} shadow-2xl lg:shadow-none select-none`}
      >
        {/* Brand & New Chat Header */}
        <div className="p-4 border-b border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-stone-950 font-black text-sm tracking-wider">
                HI
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-wide bg-gradient-to-r from-amber-300 via-amber-200 to-white bg-clip-text text-transparent">
                    HI qr
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                    Pro
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {isEnglish ? 'Universal AI Platform' : 'منصة الذكاء الاصطناعي'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs flex items-center justify-between shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              <span>{isEnglish ? 'New Conversation' : 'محادثة جديدة'}</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] bg-stone-950/20 rounded font-mono">⌘N</kbd>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEnglish ? 'Search chats...' : 'بحث في المحادثات...'}
              className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-400/50 focus:outline-hidden text-xs placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {/* Pinned Chats */}
          {pinnedSessions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 px-2 mb-1.5">
                <Pin className="w-3 h-3" />
                <span>{isEnglish ? 'Pinned' : 'المثبتة'}</span>
              </div>
              <div className="space-y-1">
                {pinnedSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    onTogglePin={() => onTogglePinSession(session.id)}
                    onDelete={() => onDeleteSession(session.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Today */}
          {todaySessions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 px-2 mb-1.5">
                {isEnglish ? 'Today' : 'اليوم'}
              </div>
              <div className="space-y-1">
                {todaySessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    onTogglePin={() => onTogglePinSession(session.id)}
                    onDelete={() => onDeleteSession(session.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {yesterdaySessions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 px-2 mb-1.5">
                {isEnglish ? 'Yesterday' : 'أمس'}
              </div>
              <div className="space-y-1">
                {yesterdaySessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    onTogglePin={() => onTogglePinSession(session.id)}
                    onDelete={() => onDeleteSession(session.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Older */}
          {olderSessions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 px-2 mb-1.5">
                {isEnglish ? 'Previous 7 Days' : 'المحادثات السابقة'}
              </div>
              <div className="space-y-1">
                {olderSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    onSelect={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    onTogglePin={() => onTogglePinSession(session.id)}
                    onDelete={() => onDeleteSession(session.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredSessions.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              {isEnglish ? 'No conversations found' : 'لا توجد محادثات مطابقة'}
            </div>
          )}
        </div>

        {/* Feature Tools Strip */}
        <div className="p-3 border-t border-white/10 space-y-1 text-xs">
          <div className="text-[10px] font-bold text-slate-400 px-2 mb-1">
            {isEnglish ? 'Specialized Tools' : 'أدوات منصة HI qr'}
          </div>

          <button
            onClick={() => {
              onOpenCodeSandbox();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="truncate">{isEnglish ? 'Code Sandbox & Runner' : 'مفسر الأكواد والبرمجة'}</span>
          </button>

          <button
            onClick={() => {
              onOpenDocumentRag();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="truncate">{isEnglish ? 'Document RAG & PDF' : 'فحص المستندات والـ PDF'}</span>
          </button>

          <button
            onClick={() => {
              onOpenImageStudio();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-purple-400" />
            <span className="truncate">{isEnglish ? 'AI Image Studio' : 'استوديو توليد الصور'}</span>
          </button>

          <button
            onClick={() => {
              onOpenAdminStats();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span className="truncate">{isEnglish ? 'Admin & Telemetry' : 'لوحة المؤشرات والأداء'}</span>
          </button>

          <button
            onClick={() => {
              onOpenQuranHub();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="truncate">{isEnglish ? 'Quran & Islamic Hub' : 'المصحف والعلوم الإسلامية'}</span>
          </button>
        </div>

        {/* Bottom Utility Controls */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-[11px]"
            title="تبديل اللغة / Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEnglish ? 'العربية' : 'English'}</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-[11px]"
            title="الوضع الليلي / النهاري"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{isDarkMode ? (isEnglish ? 'Light' : 'نهاري') : (isEnglish ? 'Dark' : 'ليلي')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

interface SessionItemProps {
  session: HiQrChatSession;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onTogglePin,
  onDelete,
}) => {
  return (
    <div
      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-all ${
        isActive
          ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30 font-semibold'
          : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
        <span className="truncate">{session.title || 'محادثة بلا عنوان'}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded-md hover:bg-white/10 ${
            session.isPinned ? 'text-amber-400' : 'text-slate-400'
          }`}
          title={session.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
              onDelete();
            }
          }}
          className="p-1 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400"
          title="حذف المحادثة"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
