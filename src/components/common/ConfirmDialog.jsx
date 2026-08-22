import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          variant === 'danger' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-white mb-1">{title}</h4>
        <p className="text-xs text-slate-400 mb-6">{description}</p>
        <div className="flex items-center gap-3 w-full">
          <Button onClick={onClose} variant="secondary" fullWidth isDisabled={isLoading}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm} variant={variant} fullWidth isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
