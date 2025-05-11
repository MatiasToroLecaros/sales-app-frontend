// src/components/common/Input.tsx (versión mejorada)
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className, ...props }, ref) => {
    const inputStyles = clsx(
      'block rounded-lg border shadow-md px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      {
        'border-red-500 bg-red-900 bg-opacity-10 text-white': error,
        'border-secondary-600 bg-secondary-700 text-white': !error,
        'w-full': fullWidth,
        'hover:border-secondary-500': !error,
      },
      className
    );

    return (
      <div className={clsx('flex flex-col', { 'w-full': fullWidth })}>
        {label && (
          <label className="mb-2 text-sm font-medium text-secondary-300">
            {label}
          </label>
        )}
        <input ref={ref} className={inputStyles} {...props} />
        {error && (
          <p className="mt-2 text-sm text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';