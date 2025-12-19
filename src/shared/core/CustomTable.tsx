import { AnimatePresence, motion } from "framer-motion";
import * as lodash from "lodash";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Search,
  SortAsc,
  SortDesc
} from "lucide-react";
import React, {
  CSSProperties,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState
} from "react";

// Base types and interfaces
export type RecordId = string | number;
export type RowIdentifier = string | number;
export interface RecordWithId {
  id?: RecordId;
  [key: string]: unknown;
}

export type Field<T> = keyof T;

export interface ExpandableConfig {
  enabled: boolean;
  maxLines?: number;
  maxCharacters?: number;
  showMoreText?: string;
  showLessText?: string;
}

export interface Column<T> {
  field: Field<T>;
  title: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  expandable?: ExpandableConfig;
}

export interface Action<T> {
  icon?: React.ReactNode | ((row: T) => React.ReactNode);
  tooltip?: string;
  onClick: (row: T) => void;
  className?: string;
  hidden?: (row: T) => boolean;
}

export interface TableThemeColors {
  headerBg?: string;
  headerText?: string;
  headerBorder?: string;
  headerHover?: string;
  sortIconColor?: string;
}

export interface TableOptions {
  toolbar?: boolean;
  search?: boolean;
  filtering?: boolean;
  sorting?: boolean;
  selection?: boolean;
  export?: boolean;
  pagination?: boolean;
  detailPanel?: boolean;
  detailPanelPosition?: "left" | "right";
  detailPanelHeader?: string;
  tableColor?: string;
  padding?: "normal" | "compact" | "wide";
  pageSize?: number;
  pageSizeOptions?: number[];
  responsive?: boolean;
  stickyHeader?: boolean;
  verticalScroll?: boolean;
  maxHeight?: string;
  theme?: TableThemeColors;
  containerHeight?: string;
  fixedHeight?: boolean;
}

export interface Localization {
  toolbar?: {
    searchPlaceholder?: string;
    exportTitle?: string;
    exportCSV?: string;
    exportPDF?: string;
  };
  pagination?: {
    labelRowsSelect?: string;
    labelDisplayedRows?: string;
  };
  header?: {
    actions?: string;
  };
  body?: {
    emptyDataSourceMessage?: string;
    filterRow?: {
      filterPlaceholder?: string;
    };
  };
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  options?: {
    fixedHeight?: boolean;
    containerHeight?: string;
  };
}

export interface ToolbarProps {
  title?: string | undefined;
  onSearch?: (value: string) => void;
  onExport?: (type: "csv" | "pdf") => void;
  searchValue?: string;
  className?: string;
}

export interface PaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (pageSize: number) => void;
  className?: string;
}

export interface TableComponents {
  container?: React.ComponentType<ContainerProps>;
  toolbar?: React.ComponentType<ToolbarProps>;
  pagination?: React.ComponentType<PaginationProps>;
  loadingOverlay?: React.ComponentType;
  emptyState?: React.ComponentType;
  customToolbar?: React.ComponentType<{ children: React.ReactNode }>;
  detailPanel?: React.ComponentType<{ row: RecordWithId }>;
}

// Ref interface for imperative methods
export interface CVTableRef {
  resetSelection: () => void;
}

export interface CVTableProps<T extends RecordWithId> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  customToolbar?: React.ReactNode;
  isLoading?: boolean;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (pageSize: number) => void;
  selection?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  defaultOrderBy?: Field<T>;
  defaultOrderDirection?: "asc" | "desc";
  filtering?: boolean;
  actions?: Action<T>[];
  detailPanel?: ((row: T) => React.ReactNode) | React.ReactNode;
  components?: TableComponents;
  options?: TableOptions;
  localization?: Localization;
  className?: string;
  containerClassName?: string;
}

// Default options
const defaultOptions: TableOptions = {
  toolbar: true,
  search: true,
  filtering: false,
  sorting: true,
  selection: false,
  export: true,
  pagination: true,
  detailPanel: false,
  detailPanelPosition: "left",
  detailPanelHeader: "Details",
  tableColor: "bg-tertiary/70",
  padding: "normal",
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 50],
  responsive: true,
  stickyHeader: false,
  verticalScroll: true,
  containerHeight: "400px",
  fixedHeight: false,
  theme: {
    headerBg: "bg-gray-50 dark:bg-darkSidebarBackground",
    headerText: "text-tertiary",
    headerBorder: "border-gray-200",
    headerHover: "hover:bg-gray-100 dark:hover:bg-gray-900",
    sortIconColor: "text-gray-400"
  }
};

// Localization
const defaultLocalization: Localization = {
  toolbar: {
    searchPlaceholder: "Search",
    exportTitle: "Export",
    exportCSV: "Export as CSV",
    exportPDF: "Export as PDF"
  },
  pagination: {
    labelRowsSelect: "rows",
    labelDisplayedRows: "{from}-{to} of {count}"
  },
  header: {
    actions: "Actions"
  },
  body: {
    emptyDataSourceMessage: "No records to display",
    filterRow: {
      filterPlaceholder: "Filter"
    }
  }
};

// Helper function to get unique identifier
const getRowIdentifier = <T extends Record<string, unknown>>(
  row: T,
  index: number
): RowIdentifier => {
  const idFields = ["id", "ID", "_id", "uid", "key"] as const;
  for (const field of idFields) {
    const value = row[field];
    if (
      value !== undefined &&
      value !== null &&
      (typeof value === "string" || typeof value === "number")
    ) {
      return value as RowIdentifier;
    }
  }
  return `${Object.values(row)
    .map((val) => (val !== undefined ? String(val) : ""))
    .join("_")}_${index}`;
};

// Selection hook
const useSelection = <T extends Record<string, unknown>>(
  _: T[],
  onSelectionChange?: (selected: T[]) => void
) => {
  const [selected, setSelected] = useState<Map<RowIdentifier, T>>(new Map());
  const [expandedTextRows, setExpandedTextRows] = useState<Set<string>>(
    new Set()
  );

  const isSelected = useCallback(
    (row: T, index: number) => selected.has(getRowIdentifier(row, index)),
    [selected]
  );

  const toggleTextExpansion = useCallback((rowId: string, field: string) => {
    setExpandedTextRows((prev) => {
      const newSet = new Set(prev);
      const key = `${rowId}-${field}`;
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        // Close all other expanded rows
        const fieldKeys = Array.from(newSet).filter((k) =>
          k.endsWith(`-${field}`)
        );
        fieldKeys.forEach((k) => newSet.delete(k));
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const isTextExpanded = useCallback(
    (rowId: string, field: string) => {
      return expandedTextRows.has(`${rowId}-${field}`);
    },
    [expandedTextRows]
  );

  const toggleSelection = useCallback(
    (row: T, index: number) => {
      setSelected((prev) => {
        const newMap = new Map(prev);
        const id = getRowIdentifier(row, index);
        if (newMap.has(id)) {
          newMap.delete(id);
        } else {
          newMap.set(id, row);
        }
        onSelectionChange?.(Array.from(newMap.values()));
        return newMap;
      });
    },
    [onSelectionChange]
  );

  const toggleAll = useCallback(
    (rows: T[]) => {
      setSelected((prev) => {
        const newMap = new Map(prev);
        const allSelected = rows.every((row, idx) =>
          newMap.has(getRowIdentifier(row, idx))
        );
        if (allSelected) {
          rows.forEach((row, idx) => newMap.delete(getRowIdentifier(row, idx)));
        } else {
          rows.forEach((row, idx) =>
            newMap.set(getRowIdentifier(row, idx), row)
          );
        }
        onSelectionChange?.(Array.from(newMap.values()));
        return newMap;
      });
    },
    [onSelectionChange]
  );

  const isAllSelected = useCallback(
    (rows: T[]) =>
      rows.length > 0 &&
      rows.every((row, idx) => selected.has(getRowIdentifier(row, idx))),
    [selected]
  );

  const clearSelection = useCallback(() => {
    setSelected(new Map());
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  return {
    selected,
    isSelected,
    toggleSelection,
    toggleAll,
    isAllSelected,
    clearSelection,
    expandedTextRows,
    toggleTextExpansion,
    isTextExpanded
  };
};

// Memoized components
const DefaultContainer = React.memo<ContainerProps>(
  ({ children, className = "", options }) => {
    const containerStyle: CSSProperties | undefined = options?.fixedHeight
      ? {
          height: options.containerHeight || "400px",
          display: "flex",
          flexDirection: "column"
        }
      : undefined;

    return (
      <div
        className={`flex flex-col rounded-lg bg-white shadow dark:bg-darkSidebarBackground ${className}`}
        style={containerStyle}
      >
        {children}
      </div>
    );
  }
);
DefaultContainer.displayName = "DefaultContainer";

const DefaultToolbar = React.memo<ToolbarProps>(
  ({ onSearch, onExport, searchValue, className = "" }) => (
    <div
      className={`flex flex-col border-b p-4 dark:border-gray-700 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between">
        <div className="mb-2 flex items-center space-x-2 sm:mb-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchValue}
              placeholder="Search"
              className="w-full rounded-lg border bg-white py-2 pl-10 pr-4 dark:border-gray-700 dark:bg-darkMainBackground dark:text-gray-200 dark:placeholder-gray-400 sm:w-auto"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExport?.("csv")}
            className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
);
DefaultToolbar.displayName = "DefaultToolbar";

const CustomToolbarSection = React.memo<{ children: React.ReactNode }>(
  ({ children }) => <div className="h-fit w-full">{children}</div>
);
CustomToolbarSection.displayName = "CustomToolbarSection";

const CustomPagination = React.memo<PaginationProps>(
  ({
    count,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    className = ""
  }) => {
    const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));

    const getPageNumbers = useCallback(() => {
      const delta = 2;
      const range: number[] = [];
      const rangeWithDots: (number | string)[] = [];
      let l: number | undefined;

      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 ||
          i === totalPages ||
          (i >= page - delta && i <= page + delta)
        ) {
          range.push(i);
        }
      }

      range.sort((a, b) => a - b);

      for (const i of range) {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push("...");
          }
        }
        rangeWithDots.push(i);
        l = i;
      }

      return rangeWithDots;
    }, [page, totalPages]);

    const pageNumbers = useMemo(() => getPageNumbers(), [getPageNumbers]);

    return (
      <div
        className={`mt-auto flex flex-wrap items-center justify-between px-4 py-3 dark:border-gray-700 ${className}`}
      >
        <div className="mb-2 flex items-center sm:mb-0">
          <select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(0);
            }}
            className="cursor-pointer rounded-lg border px-2 py-1 dark:border-gray-700 dark:bg-darkMainBackground dark:text-gray-200"
          >
            {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-lg border p-1 enabled:hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:enabled:hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex space-x-1">
            {pageNumbers.map((num, index) => (
              <button
                key={index}
                onClick={() =>
                  typeof num === "number" ? onPageChange(num - 1) : undefined
                }
                disabled={num === "..."}
                className={`rounded-lg border px-3 py-1 ${
                  num === page + 1
                    ? "border-tertiary bg-tertiary text-white"
                    : "enabled:hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:enabled:hover:bg-gray-800"
                } ${num === "..." ? "cursor-default" : ""}`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border p-1 enabled:hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:enabled:hover:bg-gray-800"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
          {count > 0
            ? `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, count)} of ${count}`
            : "0 of 0"}
        </div>
      </div>
    );
  }
);
CustomPagination.displayName = "CustomPagination";

const DefaultDetailPanel = React.memo<{ row: RecordWithId }>(({ row }) => (
  <div className="bg-gray-50 p-4 dark:bg-gray-800">
    <pre className="text-sm text-gray-700 dark:text-gray-300">
      {JSON.stringify(row, null, 2)}
    </pre>
  </div>
));
DefaultDetailPanel.displayName = "DefaultDetailPanel";

// Main component implementation with forwardRef
const CustomTable = forwardRef(
  <T extends Record<string, unknown>>(
    {
      columns,
      data = [],
      title,
      customToolbar,
      isLoading = false,
      page = 0,
      pageSize,
      totalCount,
      onPageChange,
      onRowsPerPageChange,
      selection = false,
      onSelectionChange,
      defaultOrderBy,
      defaultOrderDirection = "asc",
      filtering = false,
      actions = [],
      detailPanel,
      components = {},
      options: userOptions = {},
      localization: userLocalization = {},
      className = "",
      containerClassName = ""
    }: CVTableProps<T>,
    ref: React.Ref<CVTableRef>
  ) => {
    // Memoized options and localization
    const options = useMemo(
      () => ({ ...defaultOptions, ...userOptions }),
      [userOptions]
    );
    const localization = useMemo(
      () => lodash.merge({}, defaultLocalization, userLocalization),
      [userLocalization]
    );

    // State management
    const [orderBy, setOrderBy] = useState<Field<T> | undefined>(
      defaultOrderBy
    );
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">(
      defaultOrderDirection
    );
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [searchText, setSearchText] = useState("");
    const [expandedRows, setExpandedRows] = useState<Set<RowIdentifier>>(
      new Set()
    );
    const [visibleColumns] = useState<Record<string, boolean>>(() =>
      columns.reduce(
        (acc, col) => ({ ...acc, [col.field as string]: !col.hidden }),
        {}
      )
    );

    // Selection handling
    const {
      isSelected,
      toggleSelection,
      toggleAll,
      isAllSelected,
      clearSelection,
      toggleTextExpansion,
      isTextExpanded
    } = useSelection(data, onSelectionChange);

    const [currentPage, setCurrentPage] = useState(page);
    const [currentPageSize, setCurrentPageSize] = useState<number>(() => {
      if (pageSize !== undefined) {
        return pageSize;
      }
      if (options.fixedHeight) {
        const rowHeight =
          options.padding === "compact"
            ? 48
            : options.padding === "wide"
              ? 72
              : 56;
        const availableHeight =
          parseInt(options.containerHeight || "400") - 176;
        return Math.max(1, Math.floor(availableHeight / rowHeight));
      }
      return options.pageSize ?? defaultOptions.pageSize ?? 10;
    });

    // Expose resetSelection method via ref
    useImperativeHandle(ref, () => ({
      resetSelection: () => {
        clearSelection();
      }
    }));

    // Event handlers
    const handleSearch = useCallback((value: string) => {
      setSearchText(value);
    }, []);

    const handlePageChange = useCallback(
      (newPage: number) => {
        setCurrentPage(newPage);
        onPageChange?.(newPage);
      },
      [onPageChange]
    );

    const handleRowsPerPageChange = useCallback(
      (newPageSize: number) => {
        setCurrentPageSize(newPageSize);
        setCurrentPage(0);
        onRowsPerPageChange?.(newPageSize);
      },
      [onRowsPerPageChange]
    );

    const handleSort = useCallback((field: Field<T>) => {
      setOrderBy(field);
      setOrderDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    }, []);

    const handleFilter = useCallback((field: string, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [field]: value
      }));
    }, []);

    const handleExport = useCallback((_type: "csv" | "pdf") => {
      // Implement export functionality
    }, []);

    const toggleRowExpansion = useCallback((rowId: RowIdentifier) => {
      setExpandedRows((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(rowId)) {
          newSet.delete(rowId);
        } else {
          newSet.add(rowId);
        }
        return newSet;
      });
    }, []);

    // Memoized data processing
    const processData = useCallback(
      (inputData: T[]): T[] => {
        let processed = [...inputData];

        if (totalCount === undefined) {
          if (searchText) {
            processed = processed.filter((row) =>
              columns.some((column) => {
                const value = row[column.field];
                return value
                  ?.toString()
                  .toLowerCase()
                  .includes(searchText.toLowerCase());
              })
            );
          }

          Object.entries(filters).forEach(([field, value]) => {
            if (value) {
              processed = processed.filter((row) => {
                const cellValue = row[field as keyof T];
                return cellValue
                  ?.toString()
                  .toLowerCase()
                  .includes(value.toLowerCase());
              });
            }
          });

          if (orderBy) {
            processed = lodash.orderBy(processed, [orderBy], [orderDirection]);
          }
        }

        return processed;
      },
      [columns, filters, orderBy, orderDirection, searchText, totalCount]
    );

    const processedData = useMemo(() => processData(data), [data, processData]);
    const displayData = useMemo(() => {
      if (totalCount !== undefined) {
        return processedData;
      }
      if (!options.pagination) {
        return processedData;
      }
      return processedData.slice(
        currentPage * currentPageSize,
        (currentPage + 1) * currentPageSize
      );
    }, [
      currentPage,
      currentPageSize,
      options.pagination,
      processedData,
      totalCount
    ]);

    const effectiveTotalCount =
      totalCount !== undefined ? totalCount : processedData.length;

    // Component resolution
    const {
      container: Container = DefaultContainer,
      toolbar: Toolbar = DefaultToolbar,
      customToolbar: CustomToolbar = CustomToolbarSection,
      pagination: Pagination = CustomPagination,
      loadingOverlay: LoadingOverlay = () => (
        <div className="flex w-full items-center justify-center py-12">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-tertiary border-t-transparent"></div>
        </div>
      ),
      emptyState: EmptyState = () => (
        <div className="py-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {localization.body?.emptyDataSourceMessage}
          </p>
        </div>
      ),
      detailPanel: DetailPanel = DefaultDetailPanel
    } = components;

    // Animation variants for Framer Motion
    const detailVariants = {
      hidden: { height: 0, opacity: 0 },
      visible: { height: "auto", opacity: 1 }
    };

    // Render
    return (
      <div className={`relative h-fit ${containerClassName}`}>
        <span
          className={`absolute left-0 top-0 z-10 h-full w-1.5 rounded-l-2xl ${options.tableColor}`}
        ></span>
        <Container className={className} options={options}>
          {title && (
            <h2 className="py-3 pl-5 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
          )}

          {options.toolbar && (
            <Toolbar
              title={title}
              onSearch={handleSearch}
              searchValue={searchText}
              onExport={handleExport}
              className="border-b dark:border-gray-700"
            />
          )}

          {customToolbar && <CustomToolbar>{customToolbar}</CustomToolbar>}

          <div className="relative flex-1">
            {/* Loader - Shows in center over table when loading with previous data */}
            {isLoading && data.length > 0 && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-darkSidebarBackground/60">
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-tertiary border-t-transparent"></div>
                </div>
              </div>
            )}
            <div
              className={`w-full ${options.verticalScroll ? "overflow-y-auto" : ""} overflow-x-auto`}
              style={
                options.fixedHeight
                  ? {
                      flex: "1 1 0%",
                      overflow: "auto",
                      maxHeight: options.maxHeight || "unset"
                    }
                  : {}
              }
            >
              <table className="w-full table-auto border-collapse border border-gray-200 dark:border-white/10">
                <thead
                  className={`${options.theme?.headerBg || "bg-gray-50 dark:bg-gray-800"} ${options.stickyHeader ? "sticky top-0 z-10" : ""}`}
                >
                  <tr>
                    {selection && (
                      <th className="w-12 border border-gray-200 p-2 dark:border-white/10">
                        <input
                          type="checkbox"
                          checked={isAllSelected(displayData)}
                          onChange={() => toggleAll(displayData)}
                          className="size-4 cursor-pointer rounded border-gray-300 dark:border-white/10 dark:bg-gray-700"
                        />
                      </th>
                    )}
                    {options.detailPanel &&
                      options.detailPanelPosition === "left" && (
                        <th
                          className={`border border-gray-200 px-4 py-2 text-center text-sm font-bold uppercase tracking-wider dark:border-white/10 ${options.theme?.headerText}`}
                        >
                          {options.detailPanelHeader}
                        </th>
                      )}
                    {columns.map(
                      (column) =>
                        visibleColumns[column.field as string] && (
                          <th
                            key={column.field as string}
                            className={`p-2 text-center text-xs font-medium ${
                              options.theme?.headerText ||
                              "text-gray-500 dark:text-gray-300"
                            } select-none border border-gray-200 uppercase tracking-wider dark:border-white/10 ${
                              column.sortable !== false && options.sorting
                                ? `cursor-pointer ${options.theme?.headerHover || "hover:bg-gray-100 dark:hover:bg-gray-700"}`
                                : ""
                            } ${column.headerClassName || ""}`}
                            onClick={() =>
                              column.sortable !== false &&
                              options.sorting &&
                              handleSort(column.field)
                            }
                            style={{
                              width: column.width,
                              minWidth: column.minWidth,
                              maxWidth: column.maxWidth
                            }}
                          >
                            <div className="flex w-full items-center justify-center space-x-1">
                              <span className="text-nowrap text-sm font-bold">
                                {column.title}
                              </span>
                              {column.sortable !== false &&
                                options.sorting &&
                                orderBy === column.field &&
                                (orderDirection === "asc" ? (
                                  <SortAsc
                                    className={`h-4 w-4 ${options.theme?.sortIconColor || "text-gray-400"}`}
                                  />
                                ) : (
                                  <SortDesc
                                    className={`h-4 w-4 ${options.theme?.sortIconColor || "text-gray-400"}`}
                                  />
                                ))}
                            </div>
                          </th>
                        )
                    )}
                    {actions.length > 0 && (
                      <th className="w-fit text-nowrap border border-gray-200 p-2 text-center text-sm font-bold uppercase tracking-wider text-tertiary dark:border-white/10">
                        {localization.header?.actions || "Actions"}
                      </th>
                    )}
                    {options.detailPanel &&
                      options.detailPanelPosition === "right" && (
                        <th
                          className={`text-nowrap border border-gray-200 px-4 py-2 text-center text-sm font-bold uppercase tracking-wider dark:border-white/10 ${options.theme?.headerText}`}
                        >
                          {options.detailPanelHeader}
                        </th>
                      )}
                  </tr>

                  {filtering && (
                    <tr>
                      {selection && <th />}
                      {options.detailPanel &&
                        options.detailPanelPosition === "left" && <th />}
                      {columns.map(
                        (column) =>
                          visibleColumns[column.field as string] &&
                          column.filterable !== false && (
                            <th
                              key={column.field as string}
                              className="W:border-white/10 dark flex size-full items-center justify-center border border-gray-200 px-6 py-2"
                            >
                              <input
                                type="text"
                                placeholder={
                                  localization.body?.filterRow
                                    ?.filterPlaceholder
                                }
                                className="w-full rounded border px-2 py-1 text-sm dark:border-white/10 dark:bg-darkMainBackground dark:text-gray-200"
                                onChange={(e) =>
                                  handleFilter(
                                    column.field as string,
                                    e.target.value
                                  )
                                }
                                value={filters[column.field as string] || ""}
                              />
                            </th>
                          )
                      )}
                      {actions.length > 0 && <th />}
                      {options.detailPanel &&
                        options.detailPanelPosition === "right" && <th />}
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-darkSidebarBackground">
                  {isLoading && data?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          columns.length +
                          (selection ? 1 : 0) +
                          (actions.length > 0 ? 1 : 0) +
                          (options.detailPanel ? 1 : 0)
                        }
                        className="border border-gray-200 dark:border-white/10"
                      >
                        <LoadingOverlay />
                      </td>
                    </tr>
                  ) : displayData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          columns.length +
                          (selection ? 1 : 0) +
                          (actions.length > 0 ? 1 : 0) +
                          (options.detailPanel ? 1 : 0)
                        }
                        className="border border-gray-200 dark:border-gray-700"
                      >
                        <EmptyState />
                      </td>
                    </tr>
                  ) : (
                    displayData.map((row, rowIndex) => {
                      const rowId = getRowIdentifier(row, rowIndex);
                      const isExpanded = expandedRows.has(rowId);

                      return (
                        <React.Fragment key={rowId}>
                          <tr className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {selection && (
                              <td
                                className={`w-12 border border-gray-200 p-2 text-center dark:border-white/10 ${isExpanded ? "blur-sm" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected(row, rowIndex)}
                                  onChange={() =>
                                    toggleSelection(row, rowIndex)
                                  }
                                  className="mx-auto block size-4 cursor-pointer rounded border-gray-100 dark:border-gray-600 dark:bg-gray-700"
                                />
                              </td>
                            )}
                            {options.detailPanel &&
                              options.detailPanelPosition === "left" && (
                                <td className="w-12 border border-gray-200 p-2 text-center dark:border-white/10">
                                  <div
                                    tabIndex={0}
                                    role="button"
                                    onClick={() => toggleRowExpansion(rowId)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        toggleRowExpansion(rowId);
                                      }
                                    }}
                                    className="flex cursor-pointer items-center justify-center text-gray-400 dark:text-gray-400 dark:hover:text-gray-200"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="size-6 -rotate-180" />
                                    ) : (
                                      <ChevronDown className="size-6 -rotate-90" />
                                    )}
                                  </div>
                                </td>
                              )}
                            {columns.map((column, columnIndex) => {
                              const visibleColumnCount =
                                Object.values(visibleColumns).filter(
                                  Boolean
                                ).length;
                              const isLastVisibleColumn =
                                columnIndex === visibleColumnCount - 1;
                              return visibleColumns[column.field as string] ? (
                                <td
                                  key={column.field as string}
                                  className={`border border-gray-200 p-2 ${isExpanded ? "blur-sm" : ""} text-center text-sm text-gray-900 dark:border-white/10 dark:text-gray-100 ${
                                    column.cellClassName || ""
                                  } ${
                                    options.detailPanel &&
                                    ((options.detailPanelPosition === "left" &&
                                      columnIndex === 0) ||
                                      (options.detailPanelPosition ===
                                        "right" &&
                                        isLastVisibleColumn))
                                      ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                      : ""
                                  }`}
                                  onClick={
                                    options.detailPanel &&
                                    ((options.detailPanelPosition === "left" &&
                                      columnIndex === 0) ||
                                      (options.detailPanelPosition ===
                                        "right" &&
                                        isLastVisibleColumn))
                                      ? () => toggleRowExpansion(rowId)
                                      : undefined
                                  }
                                >
                                  <div>
                                    {column.expandable?.enabled
                                      ? (() => {
                                          const fieldKey = String(column.field);
                                          const text = column.render
                                            ? String(
                                                column.render(row) ||
                                                  "Not Provided"
                                              )
                                            : String(
                                                row[column.field] ||
                                                  "Not Provided"
                                              );
                                          const expanded = isTextExpanded(
                                            String(rowId),
                                            fieldKey
                                          );
                                          const lines = text.split("\n");
                                          const maxLines =
                                            column.expandable.maxLines || 0;
                                          const maxChars =
                                            column.expandable.maxCharacters ||
                                            150;
                                          const shouldShowMore =
                                            lines.length > maxLines ||
                                            text.length > maxChars;
                                          const truncatedText = shouldShowMore
                                            ? lines
                                                .slice(0, maxLines)
                                                .join("\n")
                                                .substring(0, maxChars) + "... "
                                            : text;

                                          return (
                                            <div className="text-left">
                                              <motion.span
                                                key={`${rowId}-${fieldKey}-${expanded}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="whitespace-pre-wrap"
                                              >
                                                {expanded
                                                  ? text
                                                  : truncatedText}
                                              </motion.span>
                                              {shouldShowMore && (
                                                <motion.button
                                                  whileHover={{ scale: 1.05 }}
                                                  whileTap={{ scale: 0.95 }}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTextExpansion(
                                                      String(rowId),
                                                      fieldKey
                                                    );
                                                  }}
                                                  className="ml-1 text-sm font-medium text-tertiary-600 underline hover:text-tertiary-800 dark:text-tertiary-400 dark:hover:text-tertiary-300"
                                                >
                                                  {expanded
                                                    ? column.expandable
                                                        .showLessText ||
                                                      "Show Less"
                                                    : column.expandable
                                                        .showMoreText ||
                                                      "Show More"}
                                                </motion.button>
                                              )}
                                            </div>
                                          );
                                        })()
                                      : column.render
                                        ? column.render(row)
                                        : String(row[column.field] ?? "")}
                                  </div>
                                </td>
                              ) : null;
                            })}
                            {actions.length > 0 && (
                              <td
                                className={`w-fit border border-gray-200 p-2 text-right text-sm font-medium dark:border-gray-700 ${isExpanded ? "blur-sm" : ""}`}
                              >
                                <div className="flex w-full items-center justify-center space-x-2">
                                  {actions.map(
                                    (action, actionIndex) =>
                                      !action.hidden?.(row) && (
                                        <div
                                          key={actionIndex}
                                          tabIndex={0}
                                          role="button"
                                          onClick={() => action.onClick(row)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                              action.onClick(row);
                                            }
                                          }}
                                          className={
                                            action.className ||
                                            "cursor-pointer text-tertiary-600 hover:text-tertiary-900 dark:text-tertiary-400 dark:hover:text-tertiary-300"
                                          }
                                          title={action.tooltip}
                                        >
                                          {typeof action.icon === "function"
                                            ? action.icon(row)
                                            : action.icon}
                                        </div>
                                      )
                                  )}
                                </div>
                              </td>
                            )}
                            {options.detailPanel &&
                              options.detailPanelPosition === "right" && (
                                <td className="w-12 border border-gray-200 p-2 text-center dark:border-gray-700">
                                  <div
                                    tabIndex={0}
                                    role="button"
                                    onClick={() => toggleRowExpansion(rowId)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        toggleRowExpansion(rowId);
                                      }
                                    }}
                                    className="flex cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="size-6 -rotate-180" />
                                    ) : (
                                      <ChevronDown className="size-6 -rotate-90" />
                                    )}
                                  </div>
                                </td>
                              )}
                          </tr>

                          {options.detailPanel && expandedRows.has(rowId) && (
                            <tr key={`${rowId}-detail`}>
                              <td
                                colSpan={
                                  columns.length +
                                  (selection ? 1 : 0) +
                                  (actions.length > 0 ? 1 : 0) +
                                  (options.detailPanel ? 1 : 0)
                                }
                                className="border border-gray-200 dark:border-gray-700"
                              >
                                <AnimatePresence>
                                  <motion.div
                                    key={`${rowId}-motion`}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={detailVariants}
                                    transition={{
                                      duration: 0.3,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    {detailPanel ? (
                                      typeof detailPanel === "function" ? (
                                        <div className="p-4">
                                          {detailPanel(row)}
                                        </div>
                                      ) : (
                                        <div className="p-4">{detailPanel}</div>
                                      )
                                    ) : (
                                      <DetailPanel row={row} />
                                    )}
                                  </motion.div>
                                </AnimatePresence>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {options.pagination && effectiveTotalCount > 0 && (
            <Pagination
              count={effectiveTotalCount}
              page={currentPage}
              rowsPerPage={currentPageSize}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          )}
        </Container>
      </div>
    );
  }
);

CustomTable.displayName = "CustomTable";

export default CustomTable as <T extends Record<string, unknown>>(
  props: CVTableProps<T> & { ref?: React.Ref<CVTableRef> }
) => React.ReactElement;
