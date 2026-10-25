import React, { forwardRef } from 'react';

export const Textarea = forwardRef(({
  id,
  label,
  name,
  value,
  onChange,
  rows = 4,
  placeholder = '',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-800 mb-1.5">
          {label} {required && <span className="text-[#D71920]">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`block w-full rounded-lg border text-sm p-3 transition-colors duration-150 resize-y
          ${error 
            ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
            : 'border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-[#D71920] focus:border-[#D71920] bg-white'
          }
          ${disabled ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : ''}
        `}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
