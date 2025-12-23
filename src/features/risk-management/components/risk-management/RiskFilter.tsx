"use client";
import useSwr from "@/shared/hooks/useSwr";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

interface RiskFilterProps {
  baseUrl: string;
  onUrlChange: (url: string) => void;
  showApplication?: boolean;
}
const FilterDropdown = memo<{
  filterKey: string;
  values: string[];
  selectedValue: string;
  formatLabel: (key: string) => string;
  onFilterChange: (key: string, value: string) => void;
}>(({ filterKey, values, selectedValue, formatLabel, onFilterChange }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFilterChange(filterKey, e.target.value);
    },
    [filterKey, onFilterChange]
  );

  const handleClear = useCallback(() => {
    onFilterChange(filterKey, "");
  }, [filterKey, onFilterChange]);

  return (
    <motion.div
      className="flex flex-col gap-1.5"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {formatLabel(filterKey)}
        <AnimatePresence>
          {selectedValue && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
            >
              1
            </motion.span>
          )}
        </AnimatePresence>
      </label>
      <div className="relative">
        <select
          value={selectedValue}
          onChange={handleChange}
          className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm capitalize text-gray-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-darkMainBackground dark:bg-darkMainBackground dark:text-white"
        >
          <option value="">Select {formatLabel(filterKey)}</option>
          {values.map((value) => (
            <option key={value} value={value}>
              {value?.replace(/_/g, " ") || "None"}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      <AnimatePresence>
        {selectedValue && (
          <motion.button
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClear}
            className="text-left text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
            whileHover={{ scale: 1.02 }}
            type="button"
          >
            Clear selection
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

FilterDropdown.displayName = "FilterDropdown";
const RiskFilter: React.FC<RiskFilterProps> = memo(
  ({ baseUrl, onUrlChange, showApplication = false }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});
    const { data: filterOptions, isValidating } = useSwr("risk-filters");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
      }, 500); // 500ms delay

      return () => clearTimeout(timer);
    }, [searchTerm]);

    // Replace searchTerm with debouncedSearchTerm in the finalUrl calculation
    const finalUrl = useMemo(() => {
      const params: string[] = [];

      if (debouncedSearchTerm.trim().length > 0) {
        params.push(
          `keywords=${encodeURIComponent(debouncedSearchTerm.trim())}`
        );
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim().length > 0) {
          params.push(`${key}=${encodeURIComponent(value)}`);
        }
      });

      if (params.length > 0) {
        return `${baseUrl}&${params.join("&")}`;
      }

      return baseUrl;
    }, [baseUrl, debouncedSearchTerm, filters]);
    useEffect(() => {
      onUrlChange(finalUrl);
    }, [finalUrl]);

    const handleSearchChange = useCallback((value: string) => {
      setSearchTerm(value);
    }, []);

    const handleFilterChange = useCallback((key: string, value: string) => {
      setFilters((prev) => {
        const newFilters = { ...prev };
        if (value) {
          newFilters[key] = value;
        } else {
          delete newFilters[key];
        }
        return newFilters;
      });
    }, []);

    const clearAllFilters = useCallback(() => {
      setSearchTerm("");
      setFilters({});
    }, []);

    const clearSearchTerm = useCallback(() => {
      setSearchTerm("");
    }, []);

    const toggleFilter = useCallback(() => {
      setIsFilterOpen((prev) => !prev);
    }, []);

    const activeFiltersCount = useMemo(
      () => Object.keys(filters).length,
      [filters]
    );

    const formatLabel = useCallback((key: string) => {
      return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }, []);

    const availableFilters = useMemo(() => {
      if (!filterOptions?.filters) {
        return [];
      }
      return Object.entries(filterOptions.filters).filter(([key, values]) => {
        if (key === "application_name" && !showApplication) {
          return false;
        }
        return Array.isArray(values) && values.length > 0;
      });
    }, [filterOptions, showApplication]);
    const containerVariants = useMemo(
      () => ({
        hidden: {
          opacity: 0,
          height: 0,
          transition: { duration: 0.3, ease: "easeInOut" }
        },
        visible: {
          opacity: 1,
          height: "auto",
          transition: {
            duration: 0.3,
            ease: "easeInOut",
            staggerChildren: 0.1,
            delayChildren: 0.1
          }
        }
      }),
      []
    );

    const itemVariants = useMemo(
      () => ({
        hidden: { opacity: 0, y: -20, transition: { duration: 0.2 } },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: "easeOut" }
        }
      }),
      []
    );

    const badgeVariants = useMemo(
      () => ({
        initial: { scale: 0, opacity: 0 },
        animate: {
          scale: 1,
          opacity: 1,
          transition: { type: "spring", stiffness: 500, damping: 25 }
        },
        exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } }
      }),
      []
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-none dark:bg-darkSidebarBackground"
      >
        <motion.div
          className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-none"
          whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </motion.div>
            <h3 className="text-balance font-semibold text-gray-900 dark:text-white lg:text-lg">
              Use Filter for Better Search
            </h3>
            <AnimatePresence mode="wait">
              {activeFiltersCount > 0 && (
                <motion.span
                  key={activeFiltersCount}
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
                >
                  {activeFiltersCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={toggleFilter}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition-colors dark:bg-darkMainBackground dark:text-gray-400"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter className="h-4 w-4" />
            Filter
            <motion.div
              animate={{ rotate: isFilterOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.button>
        </motion.div>
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              key="filter-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="overflow-hidden"
            >
              <div className="p-6">
                {isValidating ? (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col gap-1.5"
                    >
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    </motion.div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex flex-col gap-1.5"
                        >
                          <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                          <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <motion.div
                      variants={itemVariants}
                      className="flex flex-col gap-1.5"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Search Risk
                      </span>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <motion.input
                          type="text"
                          placeholder="Search by keywords..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-darkMainBackground dark:bg-darkMainBackground dark:text-white"
                          whileFocus={{ scale: 1.01 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                          }}
                        />
                        <AnimatePresence>
                          {searchTerm && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              onClick={clearSearchTerm}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter keywords to filter results
                      </p>
                    </motion.div>
                    {availableFilters.length > 0 && (
                      <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                      >
                        {availableFilters.map(([key, values]) => (
                          <FilterDropdown
                            key={key}
                            filterKey={key}
                            values={values as string[]}
                            selectedValue={filters[key] || ""}
                            formatLabel={formatLabel}
                            onFilterChange={handleFilterChange}
                          />
                        ))}
                      </motion.div>
                    )}
                    <AnimatePresence>
                      {activeFiltersCount > 0 && (
                        <motion.div
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="flex justify-end"
                        >
                          <motion.button
                            onClick={clearAllFilters}
                            className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25
                            }}
                          >
                            <X className="h-4 w-4" />
                            Clear All Filters ({activeFiltersCount})
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

RiskFilter.displayName = "RiskFilter";

export default RiskFilter;
