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
  return context;
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
      
      {/* 
          TOAST CONTAINER - FIXED BOTTOM
          - z-index: 99999 (Highest possible)
          - bottom-4: Safe distance from bottom edge
          - pointer-events-none: Allows clicking through the container area
      */}
      <div className="fixed inset-x-0 bottom-4 z-[99999] flex flex-col items-center justify-end gap-3 pointer-events-none px-4">
        {toasts.map((t) => (
          <div 
            key={t.id}
            className="
                pointer-events-auto 
                flex items-center gap-3 
                w-full max-w-sm
                bg-[#09090b] text-white 
                border border-white/10
                p-3 rounded-2xl 
                shadow-[0_8px_30px_rgb(0,0,0,0.5)]
                animate-slide-in-up
            "
          >
            {/* Icon Circle */}
            <div className={`
                shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${
                    t.type === 'success' ? 'bg-green-500 text-black' :
                    t.type === 'error' ? 'bg-red-500 text-white' :
                    t.type === 'warning' ? 'bg-yellow-400 text-black' :
                    'bg-blue-500 text-white'
                }
            `}>
               {t.type === 'success' && <CheckCircle2 size={20} strokeWidth={2.5} />}
               {t.type === 'error' && <AlertCircle size={20} strokeWidth={2.5} />}
               {t.type === 'warning' && <AlertTriangle size={20} strokeWidth={2.5} />}
               {t.type === 'info' && <Info size={20} strokeWidth={2.5} />}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-white leading-tight">{t.title}</h4>
                {t.message && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug font-medium line-clamp-2">
                        {t.message}
                    </p>
                )}
            </div>

            {/* Close Button */}
            <button 
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};