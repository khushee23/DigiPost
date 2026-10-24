import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message, title = 'Success') => addToast(message, 'success', title), [addToast]);
  const error = useCallback((message, title = 'Error') => addToast(message, 'error', title), [addToast]);
  const warning = useCallback((message, title = 'Warning') => addToast(message, 'warning', title), [addToast]);
  const info = useCallback((message, title = 'Information') => addToast(message, 'info', title), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div 
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          let icon = <Info className="w-5 h-5 text-blue-500" />;
          let border = 'border-l-4 border-blue-500';
          if (toast.type === 'success') {
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            border = 'border-l-4 border-emerald-500';
          } else if (toast.type === 'error') {
            icon = <AlertCircle className="w-5 h-5 text-red-600" />;
            border = 'border-l-4 border-[#D71920]';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
            border = 'border-l-4 border-amber-500';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-[#1C1C1C] text-white p-4 rounded-lg shadow-xl border border-neutral-800 ${border} flex items-start justify-between gap-3 transform transition-all duration-300 animate-slide-in`}
              role="alert"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="mt-0.5 shrink-0">{icon}</span>
                <div className="flex-1 text-sm">
                  {toast.title && <p className="font-semibold text-neutral-100">{toast.title}</p>}
                  <p className="text-neutral-300 text-xs sm:text-sm mt-0.5 leading-relaxed">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (msg) => console.log('Toast success:', msg),
      error: (msg) => console.error('Toast error:', msg),
      warning: (msg) => console.warn('Toast warning:', msg),
      info: (msg) => console.info('Toast info:', msg),
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return context;
};
