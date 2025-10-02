import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, icon, ...props }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-2 ml-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted-dark">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-background-light dark:bg-white/5 border-2 border-border-light dark:border-border-dark rounded-2xl py-3.5 text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${icon ? 'pl-12' : 'px-4'}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;