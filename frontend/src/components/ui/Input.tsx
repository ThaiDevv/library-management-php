import React from 'react';
import { cn } from '../../layouts/MainLayout';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-notion-textSecondary mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'block w-full rounded border-[#dddddd] shadow-sm focus:border-notion-focus focus:ring-notion-focus focus:ring-1 outline-none text-notion-text placeholder-notion-textMuted sm:text-sm py-1.5 px-2 border transition-colors',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
