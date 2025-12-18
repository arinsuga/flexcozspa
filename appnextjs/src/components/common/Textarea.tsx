import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            id={inputId}
            ref={ref}
            rows={rows}
            className={`
              block w-full rounded-lg border px-3 py-2 shadow-sm outline-none transition-all
              disabled:bg-gray-50 disabled:text-gray-500
              dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100
              ${error 
                ? 'border-error ring-1 ring-error focus:border-error focus:ring-error' 
                : 'border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'}
              ${className}
            `}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p className={`mt-1 text-xs ${error ? 'text-error' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
