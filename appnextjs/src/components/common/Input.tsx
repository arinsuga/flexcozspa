import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    const isNumberInput = props.type === 'number';
    const isDateInput = props.type === 'date';

    // Handler to validate number input - only allow numbers, comma, and period
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isNumberInput) {
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
        const isNumber = /^[0-9]$/.test(e.key);
        const isCommaOrPeriod = e.key === ',' || e.key === '.';
        const isCtrlCmd = e.ctrlKey || e.metaKey;
        
        if (!isNumber && !isCommaOrPeriod && !allowedKeys.includes(e.key) && !isCtrlCmd) {
          e.preventDefault();
        }
      }
      
      // Call original onKeyDown if provided
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    };

    // Handler to validate paste content
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (isNumberInput) {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        // Filter to only allow numbers, comma, and period
        const filteredText = pastedText.replace(/[^0-9,.]/g, '');
        
        // Insert the filtered text
        const input = e.currentTarget;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const currentValue = input.value;
        const newValue = currentValue.substring(0, start) + filteredText + currentValue.substring(end);
        
        // Update the input value
        input.value = newValue;
        
        // Trigger onChange event
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
        
        // Set cursor position
        const newCursorPos = start + filteredText.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }
      
      // Call original onPaste if provided
      if (props.onPaste) {
        props.onPaste(e);
      }
    };

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
          <input
            id={inputId}
            ref={ref}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className={`
              block w-full rounded-lg border px-3 py-2 shadow-sm outline-none transition-all
              disabled:bg-gray-50 disabled:text-gray-500
              dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100
              ${error 
                ? 'border-error ring-1 ring-error focus:border-error focus:ring-error' 
                : 'border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary'}
              ${isNumberInput ? 'text-right' : ''}
              ${isDateInput ? 'cursor-pointer hover:cursor-pointer' : ''}
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

Input.displayName = 'Input';

export default Input;
