import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  FileText,
  Globe,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Play,
  RotateCcw,
  Download,
  Share2,
  Trash2,
  Menu,
  ChevronDown,
  X,
  Cpu,
  Zap,
  Brain,
  Code2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import {
  HiQrChatSession,
  HiQrMessage,
  HiQrModelId,
  HiQrDocumentAttachment,
  HiQrImageAttachment,
} from '../../types/hiQr';
import { HI_QR_MODELS, HiQrService } from '../../services/hiQrService';

interface HiQrChatAreaProps {
  session: HiQrChatSession;
  onSendMessage: (
    text: string,
    images?: HiQrImageAttachment[],
    documents?: HiQrDocumentAttachment[],
    searchGrounding?: boolean
  ) => void;
  onClearSession: () => void;
  onChangeModel: (modelId: HiQrModelId) => void;
  onOpenSidebar: () => void;
  onOpenCodeSandboxWithCode?: (code: string, lang: string) => void;
  isStreaming: boolean;
  isDarkMode: boolean;
  isEnglish: boolean;
}

export const HiQrChatArea: React.FC<HiQrChatAreaProps> = ({
  session,
  onSendMessage,
  onClearSession,
  onChangeModel,
  onOpenSidebar,
  onOpenCodeSandboxWithCode,
  isStreaming,
  isDarkMode,
  isEnglish,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImages, setAttachedImages] = useState<HiQrImageAttachment[]>([]);
  const [attachedDocuments, setAttachedDocuments] = useState<HiQrDocumentAttachment[]>([]);
  const [searchGrounding, setSearchGrounding] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isStreaming]);

  // Handle Speech-to-Text via Web Speech API
  const handleToggleVoiceRecording = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(isEnglish ? 'Speech recognition is not supported in this browser.' : 'خاصية التعرف على الصوت غير مدعومة في هذا المتصفح.');
      return;
    }

    if (isRecordingVoice) {
      recognitionRef.current?.stop();
      setIsRecordingVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isEnglish ? 'en-US' : 'ar-SA';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecordingVoice(true);
    } catch {
      setIsRecordingVoice(false);
    }
  };

  const handleSend = () => {
    if ((!inputText.trim() && attachedImages.length === 0 && attachedDocuments.length === 0) || isStreaming) {
      return;
    }
    onSendMessage(inputText.trim(), attachedImages, attachedDocuments, searchGrounding);
    setInputText('');
    setAttachedImages([]);
    setAttachedDocuments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImages((prev) => [
          ...prev,
          {
            id: `img_${Date.now()}`,
            name: file.name,
            size: file.size,
            dataUrl: reader.result as string,
            mimeType: file.type || 'image/jpeg',
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDocFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const doc = await HiQrService.parseFile(file);
      setAttachedDocuments((prev) => [...prev, doc]);
    } catch (err: any) {
      alert(`خطأ في رفع الملف: ${err.message}`);
    }
    e.target.value = '';
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      HiQrService.stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      HiQrService.speakText(text, isEnglish ? 'en-US' : 'ar-SA', () => {
        setSpeakingMsgId(null);
      });
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleExportChat = (format: 'markdown' | 'json' | 'text') => {
    let content = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'markdown') {
      content = `# ${session.title}\n\n` + session.messages.map((m) => `**${m.role === 'user' ? 'المستخدم' : 'HI qr'}:**\n${m.content}\n`).join('\n---\n\n');
      mimeType = 'text/markdown';
      ext = 'md';
    } else if (format === 'json') {
      content = JSON.stringify(session, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    } else {
      content = session.messages.map((m) => `${m.role === 'user' ? 'User' : 'HI qr'}: ${m.content}`).join('\n\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hi-qr-chat-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentModel = HI_QR_MODELS.find((m) => m.id === session.modelId) || HI_QR_MODELS[0];

  const quickPrompts = [
    {
      title: 'شرح مفهوم فيزيائي معقد',
      desc: 'اشرح نظرية النسبية العامة بتبسيط مع أمثلة واقعية دقيقة',
    },
    {
      title: 'خوارزمية برمجية بالذكاء الاصطناعي',
      desc: 'اكتب كود بايثون متكامل لبناء نموذج تصنيف نصوص باستخدام خوارزمية ذكية',
    },
    {
      title: 'تحليل دلالي وبحث قرآني',
      desc: 'استخرج المعاني البلاغية والدروس المستفادة من سورة الكهف برؤية معاصرة',
    },
    {
      title: 'خطة استراتيجية لتطوير منصة رقمية',
      desc: 'ضع خطة عمل معمارية متكاملة لربط خادم Node.js مع ذكاء اصطناعي فائق السرعة',
    },
  ];

  return (
    <div
      className={`flex-1 flex flex-col h-full relative overflow-hidden select-text ${
        isDarkMode ? 'bg-[#0A100E] text-slate-100' : 'bg-white text-stone-900'
      }`}
    >
      {/* Top Navbar */}
      <header className="h-14 px-3 sm:px-5 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors lg:hidden"
            title="القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Model Selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setModelDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all active:scale-95 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEnglish ? currentModel.nameEn : currentModel.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {modelDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setModelDropdownOpen(false)}
                />
                <div
                  className={`absolute top-full mt-1.5 ${
                    isEnglish ? 'left-0' : 'right-0'
                  } w-72 rounded-2xl bg-[#0F1715] border border-white/15 shadow-2xl p-2 z-30 space-y-1 animate-fadeIn`}
                >
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400">
                    {isEnglish ? 'Choose AI Engine' : 'اختر نموذج الذكاء الاصطناعي'}
                  </div>
                  {HI_QR_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onChangeModel(model.id);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full text-right p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                        session.modelId === model.id
                          ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-black/40 text-amber-400 shrink-0 mt-0.5">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between font-bold">
                          <span>{model.name}</span>
                          <span className="text-[9px] text-amber-300/80 font-mono">
                            {model.contextWindow}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {model.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Web Search toggle */}
          <button
            onClick={() => setSearchGrounding((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
              searchGrounding
                ? 'bg-blue-500/20 text-blue-300 border-blue-400/50 shadow-xs'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
            title="بحث الويب الحي / Web Search Grounding"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">
              {searchGrounding ? (isEnglish ? 'Search ON' : 'بحث الويب مفعل') : (isEnglish ? 'Web Search' : 'بحث الويب')}
            </span>
          </button>

          {/* Export dropdown / button */}
          <button
            onClick={() => handleExportChat('markdown')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="تصدير المحادثة (Markdown)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clear chat */}
          <button
            onClick={() => {
              if (session.messages.length > 0 && confirm('مسح رسائل هذه المحادثة؟')) {
                onClearSession();
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-5 scrollbar-thin">
        {session.messages.length === 0 ? (
          /* Empty state / Welcome Splash */
          <div className="max-w-3xl mx-auto py-8 sm:py-16 flex flex-col items-center text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 flex items-center justify-center shadow-2xl shadow-amber-500/30 text-stone-950 font-black text-2xl tracking-wider mb-4 animate-float-levitate">
              HI
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-100 to-white bg-clip-text text-transparent">
              {isEnglish ? 'How can HI qr help you today?' : 'كيف يمكن لـ HI qr مساعدتك اليوم؟'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mt-2 leading-relaxed">
              {isEnglish
                ? 'Universal AI workspace for deep reasoning, full-stack coding, RAG document analysis, multimodal vision, and comprehensive knowledge.'
                : 'منصة الذكاء الاصطناعي الشاملة: تفكير واستدلال عميق، برمجة وكتابة أكواد، فحص ملفات RAG، رؤية حاسوبية، ومعارف متكاملة.'}
            </p>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8 text-right">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(p.desc, undefined, undefined, searchGrounding)}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-right transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                    <span>{p.title}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {p.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages list */
          <div className="max-w-4xl mx-auto space-y-4">
            {session.messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 animate-message-fade ${
                    isUser ? 'flex-row-reverse text-left' : 'text-right'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-md ${
                      isUser
                        ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950'
                        : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                    }`}
                  >
                    {isUser ? 'U' : 'HI'}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-50 font-medium'
                        : 'bg-[#101B17]/90 border border-white/10 text-slate-100 shadow-xl'
                    }`}
                  >
                    {/* Attached Image Preview */}
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.images.map((img) => (
                          <div
                            key={img.id}
                            className="rounded-xl overflow-hidden border border-white/20 bg-black/40 max-w-[240px]"
                          >
                            <img
                              src={img.dataUrl}
                              alt={img.name}
                              className="w-full h-auto max-h-48 object-cover rounded-xl"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Attached Document Badges */}
                    {msg.documents && msg.documents.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-300" />
                            <span className="truncate max-w-[200px]">{doc.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Content with Code Blocks and Markdown rendering */}
                    <div className="leading-relaxed font-cairo whitespace-pre-wrap select-text">
                      {renderFormattedContent(msg.content, onOpenCodeSandboxWithCode)}
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-amber-400 mr-1 animate-pulse align-middle" />
                      )}
                    </div>

                    {/* Assistant Message Actions & Telemetry Footer */}
                    {!isUser && !msg.isStreaming && (
                      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="p-1 rounded-md hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1"
                            title="نسخ الرد"
                          >
                            {copiedMsgId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px]">نسخ</span>
                          </button>

                          <button
                            onClick={() => handleSpeak(msg.id, msg.content)}
                            className={`p-1 rounded-md hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1 ${
                              speakingMsgId === msg.id ? 'text-amber-400 font-bold' : ''
                            }`}
                            title="قراءة صوتية (TTS)"
                          >
                            {speakingMsgId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px]">
                              {speakingMsgId === msg.id ? 'إيقاف' : 'استماع'}
                            </span>
                          </button>
                        </div>

                        {/* Latency and Token indicator */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          {msg.latencyMs && (
                            <span>{msg.latencyMs} ms</span>
                          )}
                          {msg.tokensEstimated && (
                            <span>• ~{msg.tokensEstimated} tokens</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Dock Area */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Attachment Preview Tray */}
          {(attachedImages.length > 0 || attachedDocuments.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-black/60 border border-white/10 animate-fadeIn">
              {attachedImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-lg overflow-hidden border border-amber-400/40 w-12 h-12 shrink-0 bg-stone-900"
                >
                  <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setAttachedImages((prev) => prev.filter((i) => i.id !== img.id))}
                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}

              {attachedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-300" />
                  <span className="truncate max-w-[150px]">{doc.name}</span>
                  <button
                    onClick={() => setAttachedDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="relative rounded-2xl bg-black/60 border border-white/15 focus-within:border-amber-400/60 focus-within:ring-2 focus-within:ring-amber-400/20 shadow-2xl transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isRecordingVoice
                  ? 'جاري الاستماع لصوتك وتسجيل الكلام...'
                  : isEnglish
                  ? 'Ask anything: code, science, documents, math, religion...'
                  : 'اسأل عن أي شيء: برمجة، علوم، تلخيص ملفات، حساب، شريعة...'
              }
              rows={2}
              className="w-full p-3.5 pb-12 bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 resize-none focus:outline-hidden font-cairo leading-relaxed"
            />

            {/* Hidden File Inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFile}
            />
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.csv,.json,.md,.js,.ts,.py"
              className="hidden"
              onChange={handleDocFile}
            />

            {/* Input Bar Tool Buttons */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Upload Image */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors"
                  title="إرفاق صورة للتحليل البصري"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Upload Document */}
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-blue-300 transition-colors"
                  title="إرفاق مستند (PDF, Word, Code, TXT)"
                >
                  <FileText className="w-4 h-4" />
                </button>

                {/* Voice Input */}
                <button
                  type="button"
                  onClick={handleToggleVoiceRecording}
                  className={`p-1.5 rounded-xl transition-all ${
                    isRecordingVoice
                      ? 'bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse'
                      : 'hover:bg-white/10 text-slate-400 hover:text-emerald-300'
                  }`}
                  title={isRecordingVoice ? 'إيقاف التسجيل' : 'إملاء صوتي (Speech-to-Text)'}
                >
                  {isRecordingVoice ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Web Search Grounding indicator */}
                {searchGrounding && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-400 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                    <Globe className="w-3 h-3" />
                    <span>Live Search</span>
                  </span>
                )}
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={(!inputText.trim() && attachedImages.length === 0 && attachedDocuments.length === 0) || isStreaming}
                className={`p-2 rounded-xl transition-all ${
                  (inputText.trim() || attachedImages.length > 0 || attachedDocuments.length > 0) && !isStreaming
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 shadow-md shadow-amber-400/20 scale-100 cursor-pointer'
                    : 'text-slate-600 cursor-not-allowed scale-95'
                }`}
                title="إرسال"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-2">
            <span>HI qr Pro Universal AI Engine</span>
            <span>•</span>
            <span>استجابة فورية ونماذج متعددة</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: Rich formatting for code blocks and text
function renderFormattedContent(
  text: string,
  onOpenCodeSandboxWithCode?: (code: string, lang: string) => void
) {
  if (!text) return null;

  // Split code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text_${lastIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    const language = match[1] || 'code';
    const code = match[2];

    parts.push(
      <div
        key={`code_${match.index}`}
        className="my-3 rounded-xl overflow-hidden border border-white/15 bg-black/80 font-mono text-xs"
        dir="ltr"
      >
        <div className="px-3.5 py-1.5 bg-white/5 border-b border-white/10 flex items-center justify-between text-slate-400 text-[11px]">
          <span className="font-bold text-amber-300">{language}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>نسخ</span>
            </button>

            {onOpenCodeSandboxWithCode && (
              <button
                onClick={() => onOpenCodeSandboxWithCode(code, language)}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>تشغيل</span>
              </button>
            )}
          </div>
        </div>
        <pre className="p-3.5 overflow-x-auto text-emerald-300 leading-relaxed scrollbar-thin">
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={`text_end`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return parts;
}
