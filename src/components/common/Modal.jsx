import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) => {
  // Lock body scroll when modal open & close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className={`relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidth} border border-neutral-200 animate-scale-up`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4.5 bg-neutral-50/50">
              <div>
                {title && <h3 className="text-lg font-semibold text-neutral-900" id="modal-title">{title}</h3>}
                {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
              </div>
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">Close</span>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5 max-h-[calc(85vh-120px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
