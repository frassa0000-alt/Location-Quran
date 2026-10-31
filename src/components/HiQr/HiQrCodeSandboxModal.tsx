import React, { useState } from 'react';
import { X, Play, Copy, Check, RotateCcw, Terminal, Code2 } from 'lucide-react';
import { HiQrService } from '../../services/hiQrService';

interface HiQrCodeSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLanguage?: string;
  isDarkMode?: boolean;
}

export const HiQrCodeSandboxModal: React.FC<HiQrCodeSandboxModalProps> = ({
  isOpen,
  onClose,
  initialCode = `// خوارزمية ذكية بلغة JavaScript
function calculateFibonacci(n) {
  const sequence = [0, 1];
  for (let i = 2; i <= n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  return sequence;
}

console.log("Fibonacci Series (10):", calculateFibonacci(10));
console.log("المنصة الذكية HI qr - تشغيل الأكواد الفوري بنجاح ⚡");`,
  initialLanguage = 'javascript',
  isDarkMode = true,
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('جاري تشغيل الكود في بيئة الحماية (Sandbox)...');
    try {
      const res = await HiQrService.executeCode(language, code);
      if (res.stderr) {
        setOutput(`[Error]:\n${res.stderr}\n\n${res.stdout ? `[Output]:\n${res.stdout}` : ''}`);
      } else {
        setOutput(res.stdout || '(تم التنفيذ بنجاح دون مخرجات console)');
      }
      setExecutionTime(res.executionTimeMs);
    } catch (err: any) {
      setOutput(`خطأ في التنفيذ: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <span>مفسر ومحرر الأكواد الحي (HI qr Code Sandbox)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-mono">
                  v2.0
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                تشغيل وفحص أكواد JavaScript / TypeScript / Python مع مخرجات حية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-black/40 border border-white/10 focus:border-emerald-400/50 focus:outline-hidden"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="نسخ الكود"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 p-3 overflow-hidden min-h-[360px]">
          {/* Code Editor */}
          <div className="flex flex-col rounded-xl overflow-hidden border border-white/10 bg-black/50">
            <div className="px-3 py-1.5 bg-black/40 border-b border-white/10 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>source_code.{language === 'python' ? 'py' : 'js'}</span>
              <button
                onClick={() => setCode('')}
                className="hover:text-amber-300 flex items-center gap-1 text-[10px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط</span>
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="اكتب أو الصق الكود هنا..."
              className="flex-1 p-3.5 bg-transparent font-mono text-xs leading-relaxed text-emerald-300 resize-none focus:outline-hidden scrollbar-thin"
              spellCheck={false}
              dir="ltr"
            />
          </div>

          {/* Console Output */}
          <div className="flex flex-col rounded-xl overflow-hidden border border-white/10 bg-black/70">
            <div className="px-3 py-1.5 bg-black/60 border-b border-white/10 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Terminal Output</span>
              </span>
              {executionTime !== null && (
                <span className="text-[10px] text-emerald-400">
                  {executionTime} ms
                </span>
              )}
            </div>
            <pre
              className="flex-1 p-3.5 font-mono text-xs text-amber-200/90 whitespace-pre-wrap overflow-y-auto scrollbar-thin"
              dir="ltr"
            >
              {output || '// اضغط على زر "تشغيل الكود الآن" لرؤية المخرجات...'}
            </pre>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between bg-black/20">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>بيئة معزولة وآمنة (Protected Sandbox)</span>
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>{isRunning ? 'جاري التنفيذ...' : 'تشغيل الكود الآن (Run)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
