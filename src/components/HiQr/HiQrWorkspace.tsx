import React, { useState, useEffect } from 'react';
import { HiQrSidebar } from './HiQrSidebar';
import { HiQrChatArea } from './HiQrChatArea';
import { HiQrCodeSandboxModal } from './HiQrCodeSandboxModal';
import { HiQrDocumentRagModal } from './HiQrDocumentRagModal';
import { HiQrImageStudioModal } from './HiQrImageStudioModal';
import { HiQrAdminDashboardModal } from './HiQrAdminDashboardModal';
import {
  HiQrChatSession,
  HiQrMessage,
  HiQrModelId,
  HiQrDocumentAttachment,
  HiQrImageAttachment,
} from '../../types/hiQr';
import { HiQrService } from '../../services/hiQrService';

interface HiQrWorkspaceProps {
  onOpenQuranHub: () => void;
}

export const HiQrWorkspace: React.FC<HiQrWorkspaceProps> = ({ onOpenQuranHub }) => {
  const [sessions, setSessions] = useState<HiQrChatSession[]>(() => HiQrService.getSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const active = HiQrService.getActiveSessionId();
    const existing = HiQrService.getSessions().find((s) => s.id === active);
    return existing ? existing.id : HiQrService.getSessions()[0]?.id || '';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isEnglish, setIsEnglish] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Modals
  const [codeSandboxOpen, setCodeSandboxOpen] = useState(false);
  const [codeToRun, setCodeToRun] = useState<string | undefined>();
  const [codeLangToRun, setCodeLangToRun] = useState<string | undefined>();
  const [documentRagOpen, setDocumentRagOpen] = useState(false);
  const [imageStudioOpen, setImageStudioOpen] = useState(false);
  const [adminStatsOpen, setAdminStatsOpen] = useState(false);

  // Active Session
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ||
    sessions[0] ||
    HiQrService.createDefaultSession();

  // Save sessions on change
  useEffect(() => {
    HiQrService.saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    HiQrService.setActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Actions
  const handleNewSession = () => {
    const newSession = HiQrService.createDefaultSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh = HiQrService.createDefaultSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const handleChangeModel = (modelId: HiQrModelId) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, modelId } : s))
    );
  };

  const handleClearSession = () => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, messages: [] } : s))
    );
  };

  const handleSendMessage = (
    text: string,
    images?: HiQrImageAttachment[],
    documents?: HiQrDocumentAttachment[],
    searchGrounding?: boolean
  ) => {
    const userMsgId = `user_${Date.now()}`;
    const userMsg: HiQrMessage = {
      id: userMsgId,
      role: 'user',
      content: text || (images?.length ? '📷 تحليل ومراجعة صورة' : '📄 فحص مستند مرفق'),
      timestamp: Date.now(),
      images,
      documents,
    };

    const aiMsgId = `ai_${Date.now()}`;
    const aiMsg: HiQrMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelId: activeSession.modelId,
      isStreaming: true,
    };

    // Auto title if first message
    const shouldUpdateTitle = activeSession.messages.length === 0 && text;
    const autoTitle = text ? text.slice(0, 30) : 'محادثة ذكية';

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        return {
          ...s,
          title: shouldUpdateTitle ? autoTitle : s.title,
          updatedAt: Date.now(),
          messages: [...s.messages, userMsg, aiMsg],
        };
      })
    );

    setIsStreaming(true);

    HiQrService.streamChat(
      {
        message: text,
        modelId: activeSession.modelId,
        images,
        documents,
        searchGrounding,
        history: activeSession.messages.slice(-6).map((m) => ({
          role: m.role as 'user' | 'assistant',
          text: m.content,
        })),
      },
      (chunkText) => {
        // Progressive token updates
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSession.id) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === aiMsgId ? { ...m, content: chunkText } : m
              ),
            };
          })
        );
      },
      (fullText, meta) => {
        setIsStreaming(false);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSession.id) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === aiMsgId
                  ? {
                      ...m,
                      content: fullText,
                      isStreaming: false,
                      latencyMs: meta?.latencyMs,
                      tokensEstimated: meta?.tokens,
                    }
                  : m
              ),
            };
          })
        );
      },
      (err) => {
        setIsStreaming(false);
        console.error('Chat error:', err);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSession.id) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === aiMsgId
                  ? {
                      ...m,
                      content:
                        'عذراً، حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى أو اختيار نموذج آخر من القائمة العلوية.',
                      isStreaming: false,
                    }
                  : m
              ),
            };
          })
        );
      }
    );
  };

  const handleOpenCodeSandboxWithCode = (code: string, lang: string) => {
    setCodeToRun(code);
    setCodeLangToRun(lang);
    setCodeSandboxOpen(true);
  };

  return (
    <div
      dir={isEnglish ? 'ltr' : 'rtl'}
      className={`fixed inset-0 flex overflow-hidden ${
        isDarkMode ? 'dark bg-[#0A100E] text-slate-100' : 'bg-white text-stone-900'
      }`}
    >
      {/* Sidebar */}
      <HiQrSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSession.id}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onTogglePinSession={handleTogglePinSession}
        onOpenCodeSandbox={() => setCodeSandboxOpen(true)}
        onOpenDocumentRag={() => setDocumentRagOpen(true)}
        onOpenImageStudio={() => setImageStudioOpen(true)}
        onOpenAdminStats={() => setAdminStatsOpen(true)}
        onOpenQuranHub={onOpenQuranHub}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        isEnglish={isEnglish}
        onToggleLanguage={() => setIsEnglish((prev) => !prev)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <HiQrChatArea
          session={activeSession}
          onSendMessage={handleSendMessage}
          onClearSession={handleClearSession}
          onChangeModel={handleChangeModel}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenCodeSandboxWithCode={handleOpenCodeSandboxWithCode}
          isStreaming={isStreaming}
          isDarkMode={isDarkMode}
          isEnglish={isEnglish}
        />
      </main>

      {/* Modals */}
      <HiQrCodeSandboxModal
        isOpen={codeSandboxOpen}
        onClose={() => setCodeSandboxOpen(false)}
        initialCode={codeToRun}
        initialLanguage={codeLangToRun}
        isDarkMode={isDarkMode}
      />

      <HiQrDocumentRagModal
        isOpen={documentRagOpen}
        onClose={() => setDocumentRagOpen(false)}
        onAttachToChat={(doc) => {
          handleSendMessage(
            `حلل واستخرج أهم الأفكار والبيانات من هذا المستند:\n[ملف: ${doc.name}]\n${doc.fullText || doc.textSnippet}`,
            undefined,
            [doc]
          );
        }}
        isDarkMode={isDarkMode}
      />

      <HiQrImageStudioModal
        isOpen={imageStudioOpen}
        onClose={() => setImageStudioOpen(false)}
        onAttachImageToChat={(dataUrl, prompt) => {
          handleSendMessage(
            `حلل هذه الصورة المولدة بعنوان: "${prompt}" واشرح عناصرها الفنية والتفصيلية.`,
            [
              {
                id: `img_${Date.now()}`,
                name: 'generated-artwork.png',
                size: 1024,
                dataUrl,
                mimeType: 'image/png',
              },
            ]
          );
        }}
        isDarkMode={isDarkMode}
      />

      <HiQrAdminDashboardModal
        isOpen={adminStatsOpen}
        onClose={() => setAdminStatsOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
