import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(totalItems, safePage * pageSize);

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    if (start > 2) pages.push('...');
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
      <div className="text-slate-600 font-medium">
        Menampilkan <strong>{startIdx}–{endIdx}</strong> dari <strong>{totalItems}</strong> data
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-2 text-slate-600">
            <span>Baris:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2.5 py-1 border border-slate-200 rounded-lg bg-white font-semibold text-slate-800 outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            className={`px-2.5 py-1 rounded-lg border font-semibold inline-flex items-center gap-1 ${
              safePage <= 1
                ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {getPageNumbers().map((item, idx) =>
            item === '...' ? (
              <span key={`dots-${idx}`} className="px-2 text-slate-400 font-semibold">
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`min-w-9 px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                  item === safePage
                    ? 'bg-sky-700 border-sky-700 text-white shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            className={`px-2.5 py-1 rounded-lg border font-semibold inline-flex items-center gap-1 ${
              safePage >= totalPages
                ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed'
                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
