import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/notificationService.ts';

// Register service worker for web notifications in production
registerServiceWorker();

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-[#0A0E13] text-[#F1F5F9] flex flex-col items-center justify-center p-6 text-center font-cairo"
        >
          <div className="max-w-md w-full bg-[#142520] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-2xl font-bold border border-amber-400/40">
              📖
            </div>
            <h1 className="text-xl sm:text-2xl font-amiri font-bold text-amber-200">
              القرآن الكريم
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              حدث خطأ غير متوقع أثناء تحميل الصفحة. يرجى الضغط على الزر أدناه لإعادة تشغيل الموقع.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold text-sm shadow-lg hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
