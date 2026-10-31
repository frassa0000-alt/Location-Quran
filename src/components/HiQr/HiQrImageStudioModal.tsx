import React, { useState } from 'react';
import { X, Sparkles, Download, MessageSquare, RefreshCw, Wand2 } from 'lucide-react';
import { HiQrService } from '../../services/hiQrService';

interface HiQrImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachImageToChat: (dataUrl: string, prompt: string) => void;
  isDarkMode?: boolean;
}

export const HiQrImageStudioModal: React.FC<HiQrImageStudioModalProps> = ({
  isOpen,
  onClose,
  onAttachImageToChat,
  isDarkMode = true,
}) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('سينمائي واقعي (Cinematic Realistic)');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedDesc, setGeneratedDesc] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await HiQrService.generateImage(prompt, style, aspectRatio);
      setGeneratedImageUrl(res.imageUrl);
      setGeneratedDesc(res.description);
    } catch (err: any) {
      alert(`خطأ في توليد الصورة: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePrompts = [
    'مسجد فخم ذو قبة ذهبية وحدائق مائية في ضوء الشفق بتفاصيل سينمائية 8K',
    'مدينة مستقبلية بتكنولوجيا الذكاء الاصطناعي مع خطوط عربية مضيئة بالنيون',
    'رائد فضاء يقرأ كتاباً عتيقاً في محطة فضائية تدور حول الأرض',
    'مخطوطة قرآنية مذهبة بزخارف نباتية دقيقة على ورق بردي قديم',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-3xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border ${
          isDarkMode
            ? 'bg-[#0E1715] border-white/10 text-slate-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <span>استوديو توليد الصور بالذكاء الاصطناعي (HI qr Image Studio)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300 font-mono">
                  v2.0
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                توليد صور فنية وتصميمات فائقة الدقة من الوصف النصي مباشرة.
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>الوصف الفني للصورة (Prompt)</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="صف المشهد بتفصيل... مثال: مشهد فضائي سينمائي، مسجد في الغروب، تصميم روبوت متطور..."
              rows={3}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-400 focus:outline-hidden text-xs resize-none"
            />
          </div>

          {/* Quick Ideas */}
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(s)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 transition-colors"
              >
                {s.slice(0, 36)}...
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                الأسلوب الفني (Style)
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs focus:border-purple-400 focus:outline-hidden"
              >
                <option value="سينمائي واقعي (Cinematic Realistic)">سينمائي واقعي (Cinematic Realistic)</option>
                <option value="رسم ثلاثي الأبعاد (3D Render)">رسم ثلاثي الأبعاد (3D Render)</option>
                <option value="فن وزخرفة إسلامية (Islamic Calligraphy & Art)">فن وزخرفة إسلامية (Islamic Calligraphy & Art)</option>
                <option value="أنمي وخيال علمي (Anime Sci-Fi)">أنمي وخيال علمي (Anime Sci-Fi)</option>
                <option value="لوحة زيتية كلاسيكية (Oil Painting)">لوحة زيتية كلاسيكية (Oil Painting)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                نسبة الأبعاد (Aspect Ratio)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-1.5 rounded-lg text-xs font-mono border transition-all ${
                      aspectRatio === ratio
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-98 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري إبداع وتوليد الصورة بواسطة AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>توليد الصورة الآن (Generate Image)</span>
              </>
            )}
          </button>

          {/* Generated Result Preview */}
          {generatedImageUrl && (
            <div className="p-3 rounded-2xl bg-black/60 border border-purple-400/30 flex flex-col items-center gap-3 animate-fadeIn">
              <div className="w-full max-h-[380px] rounded-xl overflow-hidden flex items-center justify-center bg-black/80">
                <img
                  src={generatedImageUrl}
                  alt={prompt}
                  className="w-full h-auto max-h-[380px] object-contain rounded-xl shadow-lg"
                />
              </div>

              {generatedDesc && (
                <p className="text-xs text-purple-200/90 leading-relaxed text-center">
                  {generatedDesc}
                </p>
              )}

              <div className="flex items-center gap-2">
                <a
                  href={generatedImageUrl}
                  download="hi-qr-artwork.png"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الصورة</span>
                </a>

                <button
                  onClick={() => {
                    onAttachImageToChat(generatedImageUrl, prompt);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-stone-950 text-xs font-bold transition-colors shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>إرسال الصورة للمحادثة للتحليل</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
