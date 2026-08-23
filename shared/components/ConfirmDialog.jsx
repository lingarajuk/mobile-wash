import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant,
  variant = 'danger',
  isLoading = false
}) => {
  const actualVariant = confirmVariant || variant;
  const actualDesc = message || description;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
          actualVariant === 'danger' ? 'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]' : 'bg-[#FFFBEB] text-[#F59E0B] border border-[#FDE68A]'
        }`}>
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-black text-[#10213F] mb-1">{title}</h4>
        <p className="text-xs text-[#64748B] mb-6">{actualDesc}</p>
        <div className="flex items-center gap-3 w-full">
          <Button onClick={onClose} variant="secondary" fullWidth isDisabled={isLoading}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm} variant={actualVariant} fullWidth isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
