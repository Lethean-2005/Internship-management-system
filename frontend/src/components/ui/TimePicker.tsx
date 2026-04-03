import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { createPortal } from 'react-dom';

interface TimePickerProps {
  label?: string;
  value: string;
  period: 'AM' | 'PM';
  onChange: (value: string) => void;
  onPeriodChange: (period: 'AM' | 'PM') => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export function TimePicker({ label, value, period, onChange, onPeriodChange, error, required, placeholder = 'Choose Time' }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const displayValue = value ? `${value} ${period}` : '';

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left });
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        panelRef.current && !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const inputId = label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-[0.85rem] font-medium text-[#374151] mb-1">
          {label}{required && <span className="text-[#dc2626] ml-0.5">*</span>}
        </label>
      )}
      <button
        type="button"
        ref={triggerRef}
        id={inputId}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2.5 w-full rounded-[5px] border bg-white px-[14px] py-[11px] text-left transition-all ${
          error ? 'border-[#fecaca]' : open ? 'border-[#48B6E8] ring-[3px] ring-[rgba(72,182,232,0.08)]' : 'border-[#e0e0e0]'
        }`}
      >
        <Clock className="w-[18px] h-[18px] text-[#667085] shrink-0" />
        <span className={`text-[0.88rem] ${displayValue ? 'text-[#101828] font-medium' : 'text-[#98A2B3]'}`}>
          {displayValue || placeholder}
        </span>
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] bg-[#1e1e2d] border border-white/10 rounded-[5px] p-4"
          style={{ top: pos.top, left: pos.left, animation: 'slideDown 0.15s ease-out', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', width: 220 }}
        >
          {/* Time Input */}
          <div className="mb-3">
            <p className="text-[11px] font-semibold text-white/40 uppercase mb-2">Enter time</p>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. 9:00"
              className="w-full rounded-[5px] border border-white/15 bg-transparent text-white text-[1rem] font-medium px-3 py-2 outline-none focus:border-[#48B6E8] text-center"
              autoFocus
            />
          </div>

          {/* AM/PM Toggle */}
          <div className="flex rounded-[5px] overflow-hidden border border-white/15">
            <button
              type="button"
              onClick={() => onPeriodChange('AM')}
              className={`flex-1 py-2 text-[0.82rem] font-semibold transition-colors ${
                period === 'AM' ? 'bg-[#48B6E8] text-white' : 'text-white/50 hover:bg-white/10'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => onPeriodChange('PM')}
              className={`flex-1 py-2 text-[0.82rem] font-semibold transition-colors ${
                period === 'PM' ? 'bg-[#48B6E8] text-white' : 'text-white/50 hover:bg-white/10'
              }`}
            >
              PM
            </button>
          </div>
        </div>,
        document.body
      )}

      {error && <p className="mt-1 text-[0.8rem] text-[#dc2626]">{error}</p>}
    </div>
  );
}
