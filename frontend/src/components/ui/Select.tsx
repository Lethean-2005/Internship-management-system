import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', id, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-[0.85rem] font-medium text-[#374151] mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)] ${
          error ? 'border-[#fecaca]' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-[0.8rem] text-[#dc2626]">{error}</p>}
    </div>
  );
};

export default Select;
