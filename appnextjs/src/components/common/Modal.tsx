import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`
        relative w-full ${sizes[size]} transform overflow-hidden rounded-xl 
        bg-white dark:bg-gray-900 shadow-2xl transition-all
      `}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ backgroundColor: '#5A9CB5' }}>
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 dark:text-gray-300">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4 dark:bg-gray-800/50 dark:border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
