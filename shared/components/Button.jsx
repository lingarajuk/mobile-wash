import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1264F5]/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none rounded-xl cursor-pointer select-none';

  const variants = {
    primary: 'bg-[#1264F5] hover:bg-[#0F52CC] text-white shadow-sm shadow-[#1264F5]/25 border border-transparent',
    secondary: 'bg-white hover:bg-[#F8FAFC] text-[#10213F] border border-[#E6ECF5] shadow-sm hover:border-[#CBD5E1]',
    outline: 'border border-[#1264F5] text-[#1264F5] hover:bg-[#F0F6FF] bg-transparent',
    ghost: 'text-[#64748B] hover:text-[#10213F] hover:bg-[#F1F5F9] bg-transparent',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-sm shadow-[#EF4444]/20 border border-transparent',
    success: 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm shadow-[#16A34A]/20 border border-transparent'
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4.5 py-2.5 text-sm gap-2 min-h-[42px]',
    lg: 'px-6 py-3 text-base gap-2.5 min-h-[48px]'
  };

  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
