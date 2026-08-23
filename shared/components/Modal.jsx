import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  showClose = true
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#10213F]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Content Container */}
      <div className={`relative w-full ${maxWidth} bg-white border border-[#E6ECF5] rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col`}>
        {/* Header */}
        {(title || showClose) && (
          <div className="px-6 py-4 border-b border-[#E6ECF5] flex items-center justify-between shrink-0 bg-[#F8FAFC]">
            <div>
              {title && <h3 className="text-base sm:text-lg font-black text-[#10213F]">{title}</h3>}
              {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#10213F] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto grow">
          {children}
        </div>
      </div>
    </div>
  );
};
