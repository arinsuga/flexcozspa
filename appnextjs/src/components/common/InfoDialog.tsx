import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
  okLabel?: string;
}

export default function InfoDialog({
  isOpen,
  onClose,
  title,
  message,
  variant = 'info',
  okLabel = 'OK',
}: InfoDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <span className="material-icons text-green-600 dark:text-green-400">check_circle</span>
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <span className="material-icons text-red-600 dark:text-red-400">error</span>
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <span className="material-icons text-yellow-600 dark:text-yellow-400">warning</span>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <span className="material-icons text-blue-600 dark:text-blue-400">info</span>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <Button 
          variant={variant === 'error' ? 'danger' : variant === 'warning' ? 'warning' : 'primary'} 
          onClick={onClose}
          className="w-full sm:w-auto"
        >
          {okLabel}
        </Button>
      }
    >
      <div className="text-center">
        {getIcon()}
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    </Modal>
  );
}
