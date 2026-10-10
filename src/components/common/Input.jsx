import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  icon: Icon = null,
  rightElement = null,
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
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-colors duration-150 py-2.5 
            ${Icon ? 'pl-9' : 'pl-3.5'} 
            ${rightElement ? 'pr-10' : 'pr-3.5'}
            ${error 
              ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50/20' 
              : 'border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-[#D71920] focus:border-[#D71920] bg-white'
            }
            ${disabled ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : ''}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
