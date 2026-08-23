import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  type = 'text',
  error,
  helperText,
  icon: Icon,
  placeholder,
  value,
  onChange,
  name,
  id,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || `input-${Math.random()}`;

  const isPassword = type === 'password';
  const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-[#10213F] flex items-center gap-1">
          {label}
          {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 text-[#94A3B8] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={computedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full bg-[#F8FAFC] text-[#10213F] text-xs sm:text-sm rounded-xl border transition-all duration-200
            py-2.5 px-3.5 outline-none placeholder:text-[#94A3B8]
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20' : 'border-[#E6ECF5] focus:border-[#1264F5] focus:bg-white focus:ring-2 focus:ring-[#1264F5]/10'}
            ${disabled ? 'opacity-60 cursor-not-allowed bg-[#F1F5F9]' : ''}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-[#94A3B8] hover:text-[#10213F] p-1 focus:outline-none cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error ? (
        <span className="text-xs text-[#EF4444] font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-[#64748B]">{helperText}</span>
      ) : null}
    </div>
  );
};
