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
      'block rounded-md border shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      {
        'border-red-300 focus:border-red-500 focus:ring-red-500': error,
        'border-secondary-300': !error,
        'w-full': fullWidth,
      },
      className
    );

    return (
      <div className={clsx('flex flex-col', { 'w-full': fullWidth })}>
        {label && (
          <label className="mb-1 text-sm font-medium text-secondary-700">
            {label}
          </label>
        )}
        <input ref={ref} className={inputStyles} {...props} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';