import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  icon: Icon,
  name,
  id,
  required = false,
  className = '',
  placeholder = 'Select an option'
}) => {
  const selectId = id || name || `select-${Math.random()}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-bold text-[#10213F] flex items-center gap-1">
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

        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full bg-[#F8FAFC] text-[#10213F] text-xs sm:text-sm rounded-xl border transition-all duration-200
            py-2.5 px-3.5 pr-10 outline-none appearance-none cursor-pointer
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20' : 'border-[#E6ECF5] focus:border-[#1264F5] focus:bg-white focus:ring-2 focus:ring-[#1264F5]/10'}
          `}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-[#10213F]">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3.5 text-[#94A3B8] pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && <span className="text-xs text-[#EF4444] font-medium">{error}</span>}
    </div>
  );
};
