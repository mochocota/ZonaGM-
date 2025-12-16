import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
    }, 5000);
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
      
      {/* Toast Container - Bottom Right for elegance */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-[400px] w-full px-4 md:px-0">
        {toasts.map((t) => (
          <div 
            key={t.id}
            className="pointer-events-auto bg-surface/95 backdrop-blur-md border border-border-color shadow-lg rounded-xl p-4 flex gap-3 items-start animate-in slide-in-from-right-full fade-in duration-300 transform transition-all hover:scale-[1.02]"
          >
            {/* Icon */}
            <div className={`mt-0.5 shrink-0 ${
                t.type === 'success' ? 'text-green-500' :
                t.type === 'error' ? 'text-red-500' :
                t.type === 'warning' ? 'text-orange-500' :
                'text-blue-500'
            }`}>
                {t.type === 'success' && <CheckCircle2 size={20} />}
                {t.type === 'error' && <AlertCircle size={20} />}
                {t.type === 'warning' && <AlertTriangle size={20} />}
                {t.type === 'info' && <Info size={20} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-text-main leading-tight">{t.title}</h4>
                {t.message && (
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{t.message}</p>
                )}
            </div>

            {/* Close */}
            <button 
                onClick={() => removeToast(t.id)}
                className="text-text-muted hover:text-text-main transition-colors shrink-0 p-1 hover:bg-black/5 rounded-md"
            >
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};