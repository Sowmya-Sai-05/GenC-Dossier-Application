import React from 'react';

/**
 * Build the page-number sequence shown in the pagination bar.
 * Always renders: first page, last page, the current page, and ±siblings
 * around it. Inserts an "ellipsis" marker between non-contiguous groups so
 * the control fits on one row regardless of total count.
 *
 *   1 page                 → [1]
 *   ≤ 7 pages              → [1, 2, 3, ..., total]   (no ellipsis)
 *   current near start     → [1, 2, 3, 4, 5, '…', total]
 *   current in the middle  → [1, '…', c-1, c, c+1, '…', total]
 *   current near end       → [1, '…', total-4, total-3, total-2, total-1, total]
 *
 * Inputs use 1-based page numbers (page = currentPage + 1 in the caller).
 */
const buildRange = (current, total, siblings = 1) => {
  if (total <= 1) return [1];

  const totalShown = siblings * 2 + 5; // first + last + current + 2*siblings + 2 dots
  if (total <= totalShown) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  if (!showLeftDots && showRightDots) {
    const leftCount = 3 + 2 * siblings;
    const leftRange = Array.from({ length: leftCount }, (_, i) => i + 1);
    return [...leftRange, '…', total];
  }
  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + 2 * siblings;
    const rightRange = Array.from(
      { length: rightCount },
      (_, i) => total - rightCount + i + 1
    );
    return [1, '…', ...rightRange];
  }
  // both sides truncated
  const middle = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i
  );
  return [1, '…', ...middle, '…', total];
};

/**
 * Compact pagination with Prev / page numbers (with ellipses) / Next.
 *
 * @param {number} currentPage  zero-indexed current page
 * @param {number} totalPages   total number of pages (>= 0)
 * @param {(page:number) => void} onPageChange  fires with the new zero-indexed page
 * @param {boolean} [isLast]    if provided, drives the Next button's disabled state
 */
const Pagination = ({ currentPage, totalPages, onPageChange, isLast }) => {
  if (!totalPages || totalPages <= 1) return null;

  const current = currentPage + 1;
  const range = buildRange(current, totalPages, 1);
  const atFirst = currentPage <= 0;
  const atLast = isLast !== undefined ? isLast : currentPage >= totalPages - 1;

  return (
    <div className="flex flex-wrap gap-2 items-center justify-end">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={atFirst}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {range.map((item, idx) =>
        item === '…' ? (
          <span
            key={`dots-${idx}`}
            className="px-2 py-2 text-gray-500 select-none"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item - 1)}
            aria-current={current === item ? 'page' : undefined}
            className={`px-3 py-2 rounded-md min-w-[2.5rem] ${
              current === item
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={atLast}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
