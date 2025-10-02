
import React from 'react';

interface ToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, enabled, onChange }) => {
  return (
    <label htmlFor={label} className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          id={label}
          type="checkbox"
          className="sr-only"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block ${enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-secondary'} w-14 h-8 rounded-full transition-colors`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${enabled ? 'transform translate-x-6' : ''}`}></div>
      </div>
      <div className="ml-3 text-text-light dark:text-text-dark font-medium sr-only">{label}</div>
    </label>
  );
};

export default Toggle;