import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
}

export default function Button({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  leftIcon,
  rightIcon,
  children, 
  disabled,
  iconOnly = false,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-[#4A8CA5] focus:ring-primary",
    secondary: "bg-secondary text-gray-900 hover:bg-[#EAC058] focus:ring-secondary",
    danger: "bg-error text-white hover:bg-[#DA5858] focus:ring-error",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
    outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-primary dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800",
    warning: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5"
  };

  const iconOnlyStyles = iconOnly ? "px-2" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${iconOnlyStyles} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : leftIcon ? (
         <span className="material-icons text-[1.2em]">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon ? (
         <span className="material-icons text-[1.2em]">{rightIcon}</span>
      ) : null}
    </button>
  );
}
