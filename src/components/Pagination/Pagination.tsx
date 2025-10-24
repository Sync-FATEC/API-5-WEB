import { FC } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  canGoPrev,
  canGoNext,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-center items-center gap-1 mt-4">
      <button
        className="btn btn-sm btn-outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
      >
        ‹
      </button>

      {visiblePages.map((page, index) => (
        <span key={index}>
          {page === '...' ? (
            <span className="px-2 text-base-content/50">...</span>
          ) : (
            <button
              className={`btn btn-sm ${
                currentPage === page ? 'btn-primary' : 'btn-outline'
              }`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </button>
          )}
        </span>
      ))}

      <button
        className="btn btn-sm btn-outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
      >
        ›
      </button>
    </div>
  );
};