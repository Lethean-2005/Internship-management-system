import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  total?: number;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
}

const PER_PAGE_OPTIONS = [10, 20, 50];

export const Pagination: React.FC<PaginationProps> = ({ currentPage, lastPage, onPageChange, total, perPage = 20, onPerPageChange }) => {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const pages: (number | string)[] = [];
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-between h-[48px] px-4 bg-white -mt-[1px]">
      {/* Left: results with per-page selector */}
      <div className="relative" ref={dropRef}>
        <button
          type="button"
          onClick={() => setDropOpen(!dropOpen)}
          className="flex items-center gap-[3px] text-[12px] text-[#999] hover:text-[#666] transition-colors cursor-pointer"
        >
          {total || 0} results · {perPage}/page
          <ChevronDown className={`w-[11px] h-[11px] transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropOpen && (
          <div className="absolute bottom-full left-0 mb-1 bg-white border border-[#e5e7eb] rounded-[5px] overflow-hidden z-50" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            {PER_PAGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { localStorage.setItem('perPage', String(opt)); onPerPageChange?.(opt); setDropOpen(false); }}
                className={`block w-full px-4 py-1.5 text-[12px] text-left whitespace-nowrap transition-colors ${perPage === opt ? 'bg-[#f0f0ff] text-[#1e1b4b] font-semibold' : 'text-[#555] hover:bg-[#f5f5f5]'}`}
              >
                {opt} / page
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: nav */}
      <div className="flex items-center gap-[2px]">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-[3px] h-[28px] px-[8px] text-[12px] text-[#999] hover:text-[#333] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-[13px] h-[13px]" />
          Prev
        </button>

        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`e-${idx}`} className="w-[28px] h-[28px] flex items-center justify-center text-[12px] text-[#ccc]">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-[28px] h-[28px] flex items-center justify-center rounded-[5px] text-[12px] font-medium transition-all ${
                currentPage === page
                  ? 'bg-[#1e1b4b] text-white'
                  : 'text-[#666] hover:bg-[#eee]'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-[3px] h-[28px] px-[8px] text-[12px] text-[#666] font-medium hover:text-[#111] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-[13px] h-[13px]" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
