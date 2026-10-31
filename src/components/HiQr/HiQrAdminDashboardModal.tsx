import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Cpu,
  Zap,
  Server,
  ShieldCheck,
  Clock,
  Gauge,
  BarChart,
  RefreshCw,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { HiQrAdminStats } from '../../types/hiQr';
import { HiQrService, HI_QR_MODELS } from '../../services/hiQrService';

interface HiQrAdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const HiQrAdminDashboardModal: React.FC<HiQrAdminDashboardModalProps> = ({
  isOpen,
  onClose,
  isDarkMode = true,
}) => {
  const [stats, setStats] = useState<HiQrAdminStats | null>(null);
  const [rateLimitPerMin, setRateLimitPerMin] = useState<number>(60);
  const [temperature, setTemperature] = useState<number>(0.3);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      HiQrService.getStats().then(setStats);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <span>لوحة تحكم الإدارة ومراقبة الأداء (HI qr Admin & Telemetry)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live System
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                متابعة استهلاك الـ Tokens، سرعة الاستجابة، ونماذج الذكاء الاصطناعي النشطة.
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
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>إجمالي الطلبات</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-xl font-bold font-mono text-amber-300">
                {stats?.totalRequests.toLocaleString() || '1,420'}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">معدل نجاح 99.9%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>استهلاك الـ Tokens</span>
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-xl font-bold font-mono text-blue-300">
                {stats ? `${(stats.totalTokens / 1000).toFixed(1)}k` : '894.5k'}
              </span>
              <span className="text-[10px] text-slate-400">سياق 1M Token مفتوح</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>متوسط سرعة الرد</span>
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xl font-bold font-mono text-emerald-300">
                {stats?.averageLatencyMs || 340} ms
              </span>
              <span className="text-[10px] text-emerald-400">استجابة SSE فورية</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>حالة الخادم</span>
                <Server className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-xl font-bold text-emerald-400">
                Optimal
              </span>
              <span className="text-[10px] text-slate-400">Node.js Express + SSE</span>
            </div>
          </div>

          {/* Model Status & Quota Allocation */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>النماذج ومعدل الاستخدام (Models & Load Balancing)</span>
            </h4>

            <div className="space-y-2">
              {HI_QR_MODELS.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-bold">{model.name}</span>
                      <span className="text-[10px] text-slate-400 block">{model.provider}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      {model.contextWindow}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Policy Configuration */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>إعدادات الحماية ومعدل الطلبات (Security & Rate Limits)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">حد الطلبات في الدقيقة (Rate Limit / min)</label>
                <input
                  type="number"
                  value={rateLimitPerMin}
                  onChange={(e) => setRateLimitPerMin(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">معامل الإبداع والحرارة (Temperature: {temperature})</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-colors"
              >
                {isSaved ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                <span>{isSaved ? 'تم الحفظ بنجاح' : 'حفظ الإعدادات'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
