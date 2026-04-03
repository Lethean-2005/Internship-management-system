import React from 'react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, lastPage, onPageChange }) => {
  if (lastPage <= 1) return null;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      {/* Previous */}
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center justify-center w-[34px] h-[34px] rounded-[5px] border border-[#e5e7eb] text-[0.82rem] text-[#374151] hover:bg-[#eef8fd] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        &lsaquo;
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-[34px] h-[34px] flex items-center justify-center text-[#9ca3af] text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`flex items-center justify-center w-[34px] h-[34px] rounded-[5px] border text-[0.82rem] font-medium transition-colors ${
              currentPage === page
                ? 'bg-[#eef8fd] border-[#48B6E8] text-[#3a9fd4]'
                : 'border-[#e5e7eb] text-[#374151] hover:bg-[#eef8fd]'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center justify-center w-[34px] h-[34px] rounded-[5px] border border-[#e5e7eb] text-[0.82rem] text-[#374151] hover:bg-[#eef8fd] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        &rsaquo;
      </button>
    </div>
  );
};

export default Pagination;
