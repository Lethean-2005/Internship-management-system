import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({ label, value, onChange, error, required, placeholder = 'Choose Date' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const today = new Date();
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const [viewMonth, setViewMonth] = useState(selected ? selected.getMonth() : today.getMonth());
  const [viewYear, setViewYear] = useState(selected ? selected.getFullYear() : today.getFullYear());

  const updatePos = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left });
    }
  }, []);

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

  useEffect(() => {
    if (open) updatePos();
  }, [open, updatePos]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const cells: number[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(0);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const isSelected = (day: number) =>
    selected && selected.getDate() === day && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;

  const displayValue = selected
    ? `${selected.getDate()} ${MONTH_NAMES[selected.getMonth()].slice(0, 3)}, ${selected.getFullYear()}`
    : '';

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
        <Calendar className="w-[18px] h-[18px] text-[#667085] shrink-0" />
        <span className={`text-[0.88rem] ${displayValue ? 'text-[#101828] font-medium' : 'text-[#98A2B3]'}`}>
          {displayValue || placeholder}
        </span>
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] w-[280px] bg-[#1e1e2d] border border-white/10 rounded-[5px] p-4"
          style={{ top: pos.top, left: pos.left, animation: 'slideDown 0.15s ease-out', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
            <span className="text-[13px] font-semibold text-white tracking-wide">
              {MONTH_NAMES[viewMonth]} / {viewYear}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-[5px] border border-white/15 text-white/60 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-[5px] border border-white/15 text-white/60 hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES.map((d) => (
              <span key={d} className="text-center text-[11px] font-semibold text-white/40 py-1">{d}</span>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-[2px]">
            {cells.map((cell, i) =>
              cell === 0 ? (
                <span key={`e-${i}`} className="aspect-square" />
              ) : (
                <button
                  key={cell}
                  type="button"
                  onClick={() => selectDay(cell)}
                  className={`aspect-square flex items-center justify-center rounded-[5px] text-[12px] font-medium transition-all ${
                    isSelected(cell)
                      ? 'bg-[#48B6E8] text-white font-bold'
                      : isToday(cell)
                      ? 'border border-white/25 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cell}
                </button>
              )
            )}
          </div>
        </div>,
        document.body
      )}

      {error && <p className="mt-1 text-[0.8rem] text-[#dc2626]">{error}</p>}
    </div>
  );
}
