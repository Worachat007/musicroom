import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-fadeIn ${
            t.type === 'success'
              ? 'bg-slate-900/95 border-emerald-500/50 text-slate-100'
              : t.type === 'error'
              ? 'bg-slate-900/95 border-rose-500/50 text-slate-100'
              : 'bg-slate-900/95 border-indigo-500/50 text-slate-100'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-indigo-400" />}
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <h5 className="font-semibold text-white">{t.title}</h5>
            {t.message && <p className="text-slate-400 mt-0.5">{t.message}</p>}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-500 hover:text-slate-300 p-0.5 rounded shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
