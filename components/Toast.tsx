import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Container - Bottom Right with stacking effect */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[380px] w-full px-4 md:px-0">
        {toasts.map((t, index) => (
          <div 
            key={t.id}
            className={`
                pointer-events-auto relative overflow-hidden
                bg-surface/95 backdrop-blur-xl border border-border-color 
                shadow-2xl rounded-2xl p-4 flex gap-4 items-start 
                animate-in slide-in-from-right-full fade-in duration-500
                transition-all hover:translate-x-[-4px]
            `}
            style={{
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }}
          >
            {/* Left Accent Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                t.type === 'success' ? 'bg-green-500' :
                t.type === 'error' ? 'bg-red-500' :
                t.type === 'warning' ? 'bg-orange-500' :
                'bg-blue-500'
            }`} />

            {/* Icon */}
            <div className={`mt-0.5 shrink-0 p-1.5 rounded-full ${
                t.type === 'success' ? 'bg-green-500/10 text-green-600' :
                t.type === 'error' ? 'bg-red-500/10 text-red-600' :
                t.type === 'warning' ? 'bg-orange-500/10 text-orange-600' :
                'bg-blue-500/10 text-blue-600'
            }`}>
                {t.type === 'success' && <CheckCircle2 size={18} strokeWidth={2.5} />}
                {t.type === 'error' && <AlertCircle size={18} strokeWidth={2.5} />}
                {t.type === 'warning' && <AlertTriangle size={18} strokeWidth={2.5} />}
                {t.type === 'info' && <Info size={18} strokeWidth={2.5} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 py-0.5">
                <h4 className="font-bold text-sm text-text-main leading-tight tracking-tight">{t.title}</h4>
                {t.message && (
                    <p className="text-xs text-text-muted mt-1.5 leading-relaxed font-medium">{t.message}</p>
                )}
            </div>

            {/* Close */}
            <button 
                onClick={() => removeToast(t.id)}
                className="text-text-muted hover:text-text-main transition-colors shrink-0 p-1.5 hover:bg-black/5 rounded-lg -mr-1"
            >
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};