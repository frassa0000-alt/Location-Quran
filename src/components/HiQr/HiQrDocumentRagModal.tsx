import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, Search, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { HiQrDocumentAttachment } from '../../types/hiQr';
import { HiQrService } from '../../services/hiQrService';

interface HiQrDocumentRagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachToChat: (doc: HiQrDocumentAttachment) => void;
  isDarkMode?: boolean;
}

export const HiQrDocumentRagModal: React.FC<HiQrDocumentRagModalProps> = ({
  isOpen,
  onClose,
  onAttachToChat,
  isDarkMode = true,
}) => {
  const [documents, setDocuments] = useState<HiQrDocumentAttachment[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const parsedDocs: HiQrDocumentAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const doc = await HiQrService.parseFile(files[i]);
        parsedDocs.push(doc);
      }
      setDocuments((prev) => [...parsedDocs, ...prev]);
      if (parsedDocs.length > 0) {
        setSelectedDocId(parsedDocs[0].id);
      }
    } catch (err: any) {
      alert(`خطأ في قراءة الملف: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border ${
          isDarkMode
            ? 'bg-[#0E1715] border-white/10 text-slate-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <span>نظام الاسترجاع الدلالي وفحص الملفات (HI qr RAG Engine)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-300 font-mono">
                  RAG v2.0
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                رفع ملفات PDF، Word، Excel، نصوص وأكواد للبحث الدلالي والتلخيص الذكي.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 p-4 overflow-hidden min-h-[400px]">
          {/* Upload and Documents List */}
          <div className="flex flex-col gap-3 md:border-l md:border-white/10 md:pl-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.csv,.json,.md,.js,.ts,.py,.html"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-4 border-2 border-dashed border-blue-400/40 hover:border-blue-400 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 flex flex-col items-center justify-center gap-1.5 text-xs text-blue-300 transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              <span className="font-bold">
                {isUploading ? 'جاري قراءة واستخراج البيانات...' : 'اضغط لرفع ملف (PDF, Word, TXT, CSV)'}
              </span>
              <span className="text-[10px] text-slate-400">يدعم حتى 25 ميجابايت</span>
            </button>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
              <span className="text-[11px] font-bold text-slate-400 px-1">
                الملفات المرفوعة ({documents.length})
              </span>
              {documents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  لم يتم رفع ملفات بعد. ارفع ملفك لبدء الفحص والاسترجاع الدلالي.
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-2.5 rounded-xl cursor-pointer text-xs flex items-center justify-between border transition-all ${
                      selectedDoc?.id === doc.id
                        ? 'bg-blue-500/20 border-blue-400/40 text-blue-200'
                        : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <FileText className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                      <div className="truncate">
                        <p className="font-semibold truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {(doc.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      title="حذف"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Document Content & Query preview */}
          <div className="md:col-span-2 flex flex-col rounded-xl overflow-hidden border border-white/10 bg-black/40">
            {selectedDoc ? (
              <>
                <div className="p-3 bg-black/50 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs truncate max-w-[260px]">
                      {selectedDoc.name}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onAttachToChat(selectedDoc);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-stone-950 text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <span>إرسال للمحادثة وتوجيه الأسئلة</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 border-b border-white/10">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث دلالياً داخل هذا المستند..."
                      className="w-full pr-8 pl-3 py-1.5 rounded-xl bg-black/50 border border-white/10 focus:border-blue-400 focus:outline-hidden text-xs"
                    />
                  </div>
                </div>

                <div className="flex-1 p-3.5 overflow-y-auto text-xs leading-relaxed text-slate-200 font-mono whitespace-pre-wrap scrollbar-thin">
                  {selectedDoc.fullText || selectedDoc.textSnippet}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-2">
                <Sparkles className="w-8 h-8 text-blue-400/50" />
                <p className="text-xs">اختر أو ارفع ملفاً لبدء التحليل الدلالي والبحث RAG</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
