import React, { forwardRef } from 'react';

export const Select = forwardRef(({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-neutral-800 mb-1.5">
          {label} {required && <span className="text-[#D71920]">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        <select
          ref={ref}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg border text-sm py-2.5 px-3.5 bg-white transition-colors duration-150 appearance-none
            ${error 
              ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-[#D71920] focus:border-[#D71920]'
            }
            ${disabled ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : ''}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
          </svg>
        </div>
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
