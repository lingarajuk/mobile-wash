import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#1264F5] shrink-0" />
  };

  const borders = {
    success: 'border-[#BBF7D0] bg-white text-[#15803D] shadow-lg',
    error: 'border-[#FECACA] bg-white text-[#B91C1C] shadow-lg',
    warning: 'border-[#FDE68A] bg-white text-[#B45309] shadow-lg',
    info: 'border-[#BFDBFE] bg-white text-[#1D4ED8] shadow-lg'
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg transform transition-all duration-300 animate-slideDown ${borders[toast.type] || borders.info}`}
        >
          {icons[toast.type] || icons.info}
          <div className="flex-1 text-xs">
            {toast.title && <h5 className="font-bold text-[#10213F] mb-0.5">{toast.title}</h5>}
            <p className="text-[#10213F] font-semibold leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#94A3B8] hover:text-[#10213F] p-0.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
