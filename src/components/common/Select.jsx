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
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
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
            w-full bg-slate-900/90 text-slate-100 text-sm rounded-xl border transition-all duration-200
            py-2.5 px-3.5 pr-10 outline-none appearance-none cursor-pointer
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'}
          `}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3.5 text-slate-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
    </div>
  );
};
