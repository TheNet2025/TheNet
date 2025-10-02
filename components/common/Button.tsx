import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // FIX: Make children optional to allow for icon-only buttons.
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', icon, ...props }) => {
  const baseClasses = "flex items-center justify-center font-semibold py-3 px-5 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 text-base disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: 'bg-primary hover:brightness-110 text-black font-bold focus:ring-primary shadow-lg shadow-primary/30',
    secondary: 'bg-secondary hover:bg-opacity-80 text-white focus:ring-secondary',
    danger: 'bg-danger hover:brightness-110 text-white focus:ring-danger shadow-lg shadow-danger/30',
    ghost: 'bg-white/10 hover:bg-white/20 text-text-dark focus:ring-primary'
  };

  const lightVariantClasses = {
     primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-lg shadow-blue-500/30',
     secondary: 'bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-800',
     danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
     ghost: 'bg-gray-200 hover:bg-gray-300 text-text-light focus:ring-blue-500'
  }

  return (
    <button className={`${baseClasses} dark:${variantClasses[variant]} ${lightVariantClasses[variant]} ${className}`} {...props}>
      {/* FIX: Conditionally apply margin to the icon only when children are present, improving layout for icon-only buttons. */}
      {icon && <span className={`h-5 w-5 ${children ? 'mr-2' : ''}`}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
