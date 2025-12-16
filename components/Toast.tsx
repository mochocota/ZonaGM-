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
          TOAST CONTAINER
          - Position: Fixed at the TOP of the VIEWPORT (z-index 10000).
          - Layout: Centered horizontally.
          - Behavior: Floats above all content (Header), no scroll needed.
      */}
      <div className="fixed inset-x-0 top-0 p-4 z-[10000] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id}
            className="
                pointer-events-auto 
                relative 
                flex items-center gap-3 
                w-full max-w-[90vw] md:max-w-md
                bg-[#18181b] text-white 
                border-l-4 
                px-4 py-3 rounded-r-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
                animate-slide-in-down
            "
            style={{
                borderLeftColor: 
                    t.type === 'success' ? '#22c55e' : // Green 500
                    t.type === 'error' ? '#ef4444' :   // Red 500
                    t.type === 'warning' ? '#eab308' : // Yellow 500
                    '#3b82f6'                          // Blue 500
            }}
          >
            {/* Icon */}
            <div className="shrink-0">
               {t.type === 'success' && <CheckCircle2 size={20} className="text-green-500" />}
               {t.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
               {t.type === 'warning' && <AlertTriangle size={20} className="text-yellow-500" />}
               {t.type === 'info' && <Info size={20} className="text-blue-500" />}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm leading-tight">{t.title}</h4>
                {t.message && (
                    <p className="text-xs text-gray-300 mt-0.5 leading-snug font-medium line-clamp-2">
                        {t.message}
                    </p>
                )}
            </div>

            {/* Close Button */}
            <button 
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};