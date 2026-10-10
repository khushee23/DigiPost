import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const icons = {
    danger: <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0"><AlertCircle className="w-6 h-6" /></div>,
    warning: <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><AlertTriangle className="w-6 h-6" /></div>,
    info: <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Info className="w-6 h-6" /></div>,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={false}>
      <div className="flex items-start gap-4 mb-5">
        {icons[variant] || icons.danger}
        <div>
          <h4 className="text-base font-semibold text-neutral-900">{title}</h4>
          <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
