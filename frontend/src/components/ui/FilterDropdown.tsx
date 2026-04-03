import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

export function FilterDropdown({ value, onChange, options }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeLabel = options.find((o) => o.value === value)?.label || options[0]?.label || '';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="relative w-[200px] shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full rounded-[5px] border border-[#e0e0e0] bg-[#1e1e2d] text-white px-3 py-[9px] text-[0.82rem] font-medium transition-all hover:bg-[#252a3e]"
      >
        <SlidersHorizontal className="w-4 h-4 shrink-0 text-white/60" />
        <span className="flex-1 text-left">{activeLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e2d] border border-white/10 rounded-[5px] overflow-hidden z-50"
          style={{ animation: 'slideDown 0.15s ease-out', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
        >
          {options.map((opt) => {
            const isActive = value === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => select(opt.value)}
                className={`flex items-center gap-2 w-full px-3 py-[10px] text-[0.82rem] font-medium text-left transition-colors ${
                  isActive
                    ? 'bg-[rgba(72,182,232,0.12)] text-white'
                    : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-[#48B6E8]" />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
