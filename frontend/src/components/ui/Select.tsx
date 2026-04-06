import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({ label, error, options, value, onChange, required, className = '', disabled, id }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  const activeLabel = options.find((o) => String(o.value) === String(value))?.label || options[0]?.label || '';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const select = (v: string) => {
    onChange?.({ target: { value: v } });
    setOpen(false);
  };

  return (
    <div className={`w-full relative ${className}`} ref={ref}>
      {label && (
        <label htmlFor={selectId} className="block text-[0.85rem] font-medium text-[#374151] mb-1">
          {label}{required && <span className="text-[#dc2626] ml-0.5">*</span>}
        </label>
      )}
      <button
        type="button"
        id={selectId}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`flex items-center gap-2 w-full rounded-[5px] border bg-white text-[#374151] px-[14px] py-[10px] text-[0.88rem] font-medium transition-all hover:border-[#48B6E8] disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-[#fecaca]' : open ? 'border-[#48B6E8] ring-[3px] ring-[rgba(72,182,232,0.08)]' : 'border-[#e0e0e0]'
        }`}
      >
        <span className="flex-1 text-left truncate">{activeLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-[#9ca3af] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[5px] overflow-hidden overflow-y-auto z-50"
          style={{ animation: 'slideDown 0.15s ease-out', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', maxHeight: '220px' }}
        >
          {options.map((opt) => {
            const isActive = String(value) === String(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => select(String(opt.value))}
                className={`flex items-center gap-2 w-full px-[14px] py-[10px] text-[0.85rem] font-medium text-left transition-colors ${
                  isActive
                    ? 'bg-[#f0f9ff] text-[#48B6E8]'
                    : 'text-[#374151] hover:bg-[#f5f5f7]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-1 text-[0.8rem] text-[#dc2626]">{error}</p>}
    </div>
  );
};

export default Select;
