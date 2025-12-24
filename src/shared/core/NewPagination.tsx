import React from "react";
import { Select, MenuItem, FormControl } from "@mui/material";

interface PaginationProps {
  totalCount: number;
  currentPage: number;
  limit: number;
  setPageNumber: (page: number) => void;
  setLimit: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalCount,
  currentPage,
  limit,
  setPageNumber,
  setLimit
}) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const getPageNumbers = () => {
    const pages = [];
    if (totalCount === 0) {
      return [1];
    }

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav
      className="flex w-full items-center justify-between gap-4"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-2">
        {/* First Page Button */}
        <button
          type="button"
          className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700 dark:disabled:text-gray-600"
          onClick={() => setPageNumber(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Previous Button */}
        <button
          type="button"
          className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700 dark:disabled:text-gray-600"
          onClick={() => setPageNumber(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <button
                key={index}
                type="button"
                className={`flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg px-3 py-2 text-sm focus:outline-none ${
                  currentPage === page
                    ? "text-primary-foreground bg-tertiary-100 dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                }`}
                onClick={() => setPageNumber(page)}
              >
                {page}
              </button>
            ) : (
              <span
                key={index}
                className="px-2 text-gray-500 dark:text-gray-400"
              >
                {page}
              </span>
            )
          )}
        </div>

        {/* Next Button */}
        <button
          type="button"
          className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700 dark:disabled:text-gray-600"
          onClick={() => setPageNumber(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700 dark:disabled:text-gray-600"
          onClick={() => setPageNumber(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Material UI Select for items per page */}
      <FormControl size="small" className="min-w-[130px]">
        <Select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="h-[38px] dark:bg-gray-800 dark:text-gray-200"
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 200
              },
              className: "dark:bg-gray-800 dark:text-gray-200"
            }
          }}
        >
          {[5, 10, 20, 50].map((value) => (
            <MenuItem
              key={value}
              value={value}
              className="dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {value} page
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </nav>
  );
};

export default Pagination;
