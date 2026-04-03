import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-[0.85rem] font-medium text-[#374151] mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`block w-full rounded-[5px] border px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)] ${
          error ? 'border-[#fecaca] focus:border-[#dc2626] focus:ring-[rgba(220,38,38,0.08)]' : 'border-[#e0e0e0]'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-[0.8rem] text-[#dc2626]">{error}</p>}
    </div>
  );
};

export default Input;
