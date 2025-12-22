"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useSwr from "@/shared/hooks/useSwr";
import { generateRandomColor, useCurrentMenuItem } from "@/shared/utils";
import { CircularProgress } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AppWindow,
  ArrowRight,
  Filter,
  HeartPulse,
  Layers,
  LayoutGrid,
  Search,
  TableOfContents,
  X
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import React, { useEffect, useMemo, useState } from "react";

// Type definitions
interface FilterOption {
  label: string;
  value: string;
}

interface Application {
  label: string;
  value: string;
}

interface ControlItem extends Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  doc_id: string;
  control_id?: string;
  id?: string;
  control_name?: string;
  name?: string;
  description?: string;
  domain?: string;
  control_type?: string;
  sub_type?: string;
  framework?: string;
  implementation_status?: string;
  readiness_status?: string;
  compliance_status?: string;
  scope?: string;
  health?: {
    implementation?: string;
    testing_status?: string;
  };
  applications?: Application[];
  application_ids?: string[];
}
interface SelectedFilters {
  [key: string]: string[];
}

const Control = () => {
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [view, setView] = useState<"table" | "card">("table");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const currentAccess = useCurrentMenuItem();
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: filterData, isValidating: filterValidating } =
    useSwr("control-filters");

  const buildQueryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", (page + 1).toString());
    params.set("limit", pageSize.toString());

    if (debouncedSearchTerm.trim()) {
      params.set("keywords", debouncedSearchTerm.trim());
    }

    Object.entries(selectedFilters).forEach(([filterKey, selectedValues]) => {
      if (Array.isArray(selectedValues) && selectedValues.length > 0) {
        if (filterKey === "application_ids") {
          selectedValues.forEach((value) => {
            params.append("application_id", value);
          });
        } else {
          selectedValues.forEach((value) => {
            params.append(filterKey, value);
          });
        }
      }
    });

    return params.toString();
  }, [page, pageSize, debouncedSearchTerm, selectedFilters]);

  const { data, isValidating } = useSwr(`controls?${buildQueryString}`);

  const getFilterDisplayName = (key: string): string => {
    const displayNames: { [key: string]: string } = {
      control_type: "Control Type",
      sub_type: "Sub Type",
      compliance_status: "Compliance Status",
      scope: "Scope",
      readiness_status: "Readiness Status",
      implementation_status: "Implementation Status",
      framework: "Framework",
      application_ids: "Applications"
    };
    return (
      displayNames[key] ||
      key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const formatOptionLabel = (value: string): string => {
    return value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Handle filter change
  const handleFilterChange = (filterKey: string, value: string) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[filterKey] || [];
      let newValues: string[];

      if (currentValues.includes(value)) {
        newValues = currentValues.filter((v) => v !== value);
      } else {
        newValues = [...currentValues, value];
      }

      if (newValues.length === 0) {
        const { [filterKey]: removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [filterKey]: newValues
      };
    });

    setPage(0);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({});
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setPage(0);
  };

  // Clear specific filter
  const clearFilter = (filterKey: string) => {
    setSelectedFilters((prev) => {
      const { [filterKey]: removed, ...rest } = prev;
      return rest;
    });
    setPage(0);
  };

  // Get count of active filters
  const activeFiltersCount = useMemo(() => {
    return (
      Object.values(selectedFilters).reduce((count, values) => {
        return count + (Array.isArray(values) ? values.length : 0);
      }, 0) + (debouncedSearchTerm.trim() ? 1 : 0)
    );
  }, [selectedFilters, debouncedSearchTerm]);

  const getStatusStyles = (status: string): string => {
    const styles: { [key: string]: string } = {
      completed:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:border-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400",
      not_started:
        "bg-tertiary-50 text-tertiary-700 border-tertiary-200 dark:border-tertiary-600/20 dark:bg-tertiary-900/30 dark:text-tertiary-400",
      in_progress:
        "bg-amber-50 text-amber-700 border-amber-200 dark:border-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400",
      effective:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:border-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400",
      not_tested:
        "bg-slate-50 text-slate-700 border-slate-200 dark:border-slate-600/20 dark:bg-slate-900/30 dark:text-slate-400",
      ineffective:
        "bg-red-50 text-red-700 border-red-200 dark:border-red-600/20 dark:bg-red-900/30 dark:text-red-400",
      complete:
        "bg-green-50 text-green-700 border-green-200 dark:border-green-600/20 dark:bg-green-900/30 dark:text-green-400",
      ready:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:border-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400",
      not_ready:
        "bg-orange-50 text-orange-700 border-orange-200 dark:border-orange-600/20 dark:bg-orange-900/30 dark:text-orange-400",
      not_compliant:
        "bg-red-50 text-red-700 border-red-200 dark:border-red-600/20 dark:bg-red-900/30 dark:text-red-400",
      compliant:
        "bg-green-50 text-green-700 border-green-200 dark:border-green-600/20 dark:bg-green-900/30 dark:text-green-400",
      in_scope:
        "bg-blue-50 text-blue-700 border-blue-200 dark:border-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400",
      out_of_scope:
        "bg-gray-50 text-gray-700 border-gray-200 dark:border-gray-600/20 dark:bg-gray-900/30 dark:text-gray-400"
    };
    return (
      styles[status] ||
      "bg-gray-50 text-gray-700 border-gray-200 dark:border-gray-600/20 dark:bg-gray-800/50 dark:text-gray-400"
    );
  };

  interface StatusBadgeProps {
    status: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const StatusBadge: React.FC<StatusBadgeProps> = ({ status, icon: Icon }) => (
    <span
      className={`inline-flex items-center gap-2 text-nowrap rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-all duration-200 hover:shadow-sm ${getStatusStyles(status)}`}
    >
      <Icon className="h-4 w-4" />
      {formatOptionLabel(status)}
    </span>
  );

  // Applications Display Component
  interface ApplicationsDisplayProps {
    applications?: Application[] | undefined;
    maxVisible?: number;
  }

  const ApplicationsDisplay: React.FC<ApplicationsDisplayProps> = ({
    applications
  }) => {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-1">
        {applications && applications?.length > 0 ? (
          applications?.map((app, index) => (
            <span
              key={index + 1}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
            >
              <span className="h-1.5 w-1.5 text-nowrap rounded-full bg-indigo-500"></span>
              {app.label}
            </span>
          ))
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            Not Provided
          </span>
        )}
      </div>
    );
  };

  // Dynamic Select Filter Component
  interface DynamicFilterSelectProps {
    filterKey: string;
    options: FilterOption[];
  }

  const DynamicFilterSelect: React.FC<DynamicFilterSelectProps> = ({
    filterKey,
    options
  }) => {
    const selectedValues = selectedFilters[filterKey] || [];
    const displayName = getFilterDisplayName(filterKey);

    const availableOptions = options.filter(
      (option) =>
        option.value &&
        option.value.trim() !== "" &&
        !selectedValues.includes(option.value)
    );

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value) {
        handleFilterChange(filterKey, value);
      }
    };

    const getSelectedOptionLabel = (value: string): string => {
      const option = options.find((opt) => opt.value === value);
      return option?.label || value;
    };

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {displayName}
          {selectedValues.length > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-tertiary-500 text-xs font-bold text-white">
              {selectedValues.length}
            </span>
          )}
        </label>

        <div className="relative">
          <select
            value=""
            onChange={handleSelectChange}
            disabled={availableOptions.length === 0}
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-600 dark:bg-darkMainBackground dark:text-white dark:disabled:bg-gray-700"
          >
            <option value="">
              {availableOptions.length === 0
                ? `No ${displayName} available`
                : `Select ${displayName}`}
            </option>
            {availableOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label || formatOptionLabel(option.value)}
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

        {selectedValues.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedValues.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 rounded-md bg-tertiary-100 px-2 py-1 text-xs font-medium text-tertiary-700 dark:bg-tertiary-900/40 dark:text-tertiary-300"
              >
                {getSelectedOptionLabel(value)}
                <button
                  onClick={() => handleFilterChange(filterKey, value)}
                  className="hover:text-tertiary-800 dark:hover:text-tertiary-200"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {selectedValues.length > 0 && (
          <button
            onClick={() => clearFilter(filterKey)}
            className="text-left text-xs text-tertiary-600 hover:text-tertiary-700 dark:text-tertiary-400"
            type="button"
          >
            Clear all {displayName} filters
          </button>
        )}
      </div>
    );
  };

  // Active Filters Display
  const ActiveFiltersDisplay: React.FC = () => {
    if (activeFiltersCount === 0) {
      return null;
    }

    const getFilterValueLabel = (filterKey: string, value: string): string => {
      if (!filterData?.filters?.[filterKey]) {
        return formatOptionLabel(value);
      }

      const option = filterData.filters[filterKey].find(
        (opt: FilterOption) => opt.value === value
      );
      return option?.label || formatOptionLabel(value);
    };

    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Active Filters:
        </span>

        {debouncedSearchTerm.trim() && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-tertiary-100 px-2 py-1 text-xs font-medium text-tertiary-700 dark:bg-tertiary-900/40 dark:text-tertiary-300">
            {` Keywords: "${debouncedSearchTerm}"`}
            <button
              onClick={() => {
                setSearchTerm("");
                setDebouncedSearchTerm("");
                setPage(0);
              }}
              className="hover:text-tertiary-800 dark:hover:text-tertiary-200"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        {Object.entries(selectedFilters).map(([filterKey, values]) =>
          values.map((value) => (
            <span
              key={`${filterKey}-${value}`}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            >
              {getFilterDisplayName(filterKey)}:{" "}
              {getFilterValueLabel(filterKey, value)}
              <button
                onClick={() => handleFilterChange(filterKey, value)}
                className="hover:text-blue-800 dark:hover:text-blue-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}

        <button
          onClick={clearAllFilters}
          className="text-xs text-red-600 underline hover:text-red-700 dark:text-red-400"
        >
          Clear All
        </button>
      </div>
    );
  };

  interface CardProps {
    item: ControlItem;
  }

  const Card: React.FC<CardProps> = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-tertiary-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-tertiary-600"
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${generateRandomColor()}, ${generateRandomColor()}20)`
        }}
        className="h-2 w-full"
      />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-tertiary-600 dark:text-white dark:group-hover:text-tertiary-400">
            {item.control_name || item.name || "Unnamed Control"}
          </h3>
          {item.framework && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                {item.framework}
              </span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {item.description || "No description available"}
          </p>
        </div>

        <div className="mb-6 space-y-4">
          {/* Type (Sub Type) */}
          {item.sub_type && (
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Type
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-600/20 dark:bg-violet-900/30 dark:text-violet-400">
                <Layers className="h-4 w-4" />
                {formatOptionLabel(item.sub_type)}
              </span>
            </div>
          )}

          {/* Applications */}
          {item.applications && item.applications.length > 0 && (
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <AppWindow className="mb-1 inline h-3.5 w-3.5" /> Applications
              </span>
              <ApplicationsDisplay
                applications={item.applications}
                maxVisible={2}
              />
            </div>
          )}

          {/* Implementation Status */}
          {item.implementation_status && (
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Implementation Status
              </span>
              <StatusBadge
                status={item.implementation_status}
                icon={Activity}
              />
            </div>
          )}

          {/* Readiness Status */}
          {item.readiness_status && (
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Readiness Status
              </span>
              <StatusBadge status={item.readiness_status} icon={HeartPulse} />
            </div>
          )}

          {/* Compliance Status */}
          {item.compliance_status && (
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Compliance Status
              </span>
              <StatusBadge status={item.compliance_status} icon={Activity} />
            </div>
          )}
        </div>
        {currentAccess?.permission?.is_shown && (
          <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
            <CustomButton
              onClick={() =>
                router.push(
                  `/controls/${item?.doc_id}?_name=${item?.control_name || item?.name}&checkId=${item?.doc_id}`
                )
              }
              disabled={!currentAccess?.permission?.actions?.read}
              className="group flex w-full items-center justify-center gap-2 border-none bg-gradient-to-r from-tertiary-600 to-tertiary-700 !px-4 !py-2.5 !text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-tertiary-700 hover:to-tertiary-800 hover:shadow-md"
            >
              VIEW DETAILS
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </CustomButton>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-tertiary-600/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );

  const TableView: React.FC = () => (
    <CustomTable<ControlItem>
      columns={[
        {
          field: "control_id",
          title: "Control ID",
          sortable: true,
          filterable: true,
          render: (row: ControlItem) => (
            <span className="text-nowrap px-3 font-medium">
              {row?.control_id || row?.id || "Not Provided"}
            </span>
          )
        },
        {
          field: "control_name",
          title: "Control Name",
          sortable: true,
          filterable: true,
          cellClassName: "w-fit",
          render: (row: ControlItem) => (
            <span className="flex w-fit items-center justify-start text-nowrap text-left font-medium">
              {row?.control_name || row?.name || "Not Provided"}
            </span>
          )
        },
        {
          field: "sub_type",
          title: "Type",
          sortable: true,
          filterable: true,
          render: (row: ControlItem) =>
            row?.sub_type ? (
              <span className="inline-flex items-center gap-1.5 text-nowrap rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:border-violet-600/20 dark:bg-violet-900/30 dark:text-violet-400">
                <Layers className="h-3.5 w-3.5" />
                {formatOptionLabel(row.sub_type)}
              </span>
            ) : (
              <span className="text-nowrap text-gray-500 dark:text-gray-400">
                Not Provided
              </span>
            )
        },
        {
          field: "applications",
          title: "Applications",
          sortable: false,
          cellClassName: "w-fit",
          render: (row: ControlItem) => (
            <div className="flex w-full items-center justify-center text-nowrap">
              <ApplicationsDisplay
                applications={row?.applications}
                maxVisible={1}
              />
            </div>
          )
        },
        {
          field: "description",
          title: "Description",
          sortable: true,
          filterable: true,
          cellClassName: "max-w-lg",
          render: (row: ControlItem) => (
            <span className="line-clamp-2 flex w-[400px] items-center justify-start text-left font-medium">
              {row?.description || "Not Provided"}
            </span>
          )
        },
        {
          field: "implementation",
          title: "Implementation",
          sortable: true,
          render: (row: ControlItem) => {
            const status =
              row?.health?.implementation || row?.implementation_status;
            return status ? (
              <StatusBadge status={status} icon={Activity} />
            ) : (
              <span className="text-nowrap text-gray-500 dark:text-gray-400">
                Not Provided
              </span>
            );
          }
        },
        {
          field: "readiness_status",
          title: "Status",
          sortable: true,
          render: (row: ControlItem) => {
            const status = row?.health?.testing_status || row?.readiness_status;
            return status ? (
              <StatusBadge status={status} icon={HeartPulse} />
            ) : (
              <span className="text-nowrap text-gray-500 dark:text-gray-400">
                Not Provided
              </span>
            );
          }
        },
        {
          field: "view",
          title: "Actions",
          sortable: false,
          render: (row: ControlItem) => (
            <div className="flex w-full items-center justify-center">
              {currentAccess?.permission?.is_shown && (
                <div className="w-fit">
                  <CustomButton
                    onClick={() => {
                      router.push(
                        `/controls/${row?.doc_id}?_name=${row?.control_name || row?.name}&checkId=${row?.doc_id}`
                      );
                    }}
                    disabled={!currentAccess?.permission?.actions?.read}
                    className="w-fit !text-[0.7rem]"
                  >
                    VIEW
                  </CustomButton>
                </div>
              )}
            </div>
          )
        }
      ]}
      data={data?.controls || []}
      isLoading={isValidating}
      page={page}
      pageSize={pageSize}
      totalCount={data?.pagination?.total_records}
      onPageChange={setPage}
      onRowsPerPageChange={setPageSize}
      title="All Controls"
      selection={false}
      filtering={false}
      customToolbar={<></>}
      options={{
        toolbar: false,
        search: false,
        filtering: true,
        sorting: true,
        pagination: true,
        detailPanel: false,
        detailPanelPosition: "left",
        detailPanelHeader: "Details"
      }}
      className="flex-1"
    />
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl 2xl:text-3xl">
              Controls Overview
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage and monitor your security controls
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative rounded-lg border border-gray-300 p-2.5 transition-all duration-200 dark:border-gray-600 ${
                showFilters
                  ? "border-tertiary-200 bg-tertiary-50 text-tertiary-600 dark:border-tertiary-600 dark:bg-tertiary-900/30"
                  : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              <Filter className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
              <button
                onClick={() => setView("table")}
                className={`rounded-lg p-2.5 transition-all duration-200 ${
                  view === "table"
                    ? "bg-tertiary-50 text-tertiary-600 dark:bg-tertiary-900/30 dark:text-tertiary-400"
                    : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                <TableOfContents className="h-5 w-5" />
              </button>
              <button
                onClick={() => setView("card")}
                className={`rounded-lg p-2.5 transition-all duration-200 ${
                  view === "card"
                    ? "bg-tertiary-50 text-tertiary-600 dark:bg-tertiary-900/30 dark:text-tertiary-400"
                    : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        <ActiveFiltersDisplay />

        {/* Enhanced Search and Dynamic Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-darkSidebarBackground">
                {filterValidating ? (
                  <div className="flex items-center justify-center py-8">
                    <CircularProgress size={24} />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Loading filters...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Search Bar with Debouncing */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Search Controls
                        {searchTerm !== debouncedSearchTerm && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            (typing...)
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by keywords..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500/20 dark:border-gray-600 dark:bg-darkMainBackground dark:text-white"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setDebouncedSearchTerm("");
                              setPage(0);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {/* Search hint */}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Search will be performed automatically after you stop
                        typing
                      </p>
                    </div>

                    {/* Dynamic Filters Grid */}
                    {filterData?.filters && (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Object.entries(filterData.filters)
                          .filter(
                            ([_key, values]) =>
                              Array.isArray(values) && values.length > 0
                          )
                          .map(([filterKey, options]) => (
                            <DynamicFilterSelect
                              key={filterKey}
                              filterKey={filterKey}
                              options={options as FilterOption[]}
                            />
                          ))}
                      </div>
                    )}

                    {/* Clear All Filters Button */}
                    {activeFiltersCount > 0 && (
                      <div className="flex justify-end">
                        <button
                          onClick={clearAllFilters}
                          className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                        >
                          <X className="h-4 w-4" />
                          Clear All Filters ({activeFiltersCount})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="h-fit">
        {view === "table" ? (
          <TableView />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {isValidating ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-4 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mb-2 h-6 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mb-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-3">
                    <div className="h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))
            ) : data?.controls?.length && data.controls.length > 0 ? (
              data.controls.map((item: ControlItem, index: number) => (
                <Card key={item._id || index} item={item} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No controls found
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {activeFiltersCount > 0
                    ? "Try adjusting your search or filters"
                    : "No controls available at the moment"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Control;

// interface DeleteControlProps {
//   item: ControlItem;
//   mutate: () => void;
// }

// const DeleteControl: React.FC<DeleteControlProps> = ({ item, mutate }) => {
//   const { isLoading, mutation } = useMutation();

//   const handleDelete = () => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const res = await mutation(
//             `control/?control_id=${item?.control_id}&tenant_id=T-12345678&client_id=C-12345678`,
//             {
//               method: "DELETE",
//               isAlert: false,
//             },
//           );
//           if (res?.status === 200) {
//             toast.success("Control deleted successfully");
//             mutate();
//           } else {
//             toast.error("Failed to delete control");
//           }
//         } catch (error) {
//           toast.error("An error occurred while deleting the control");
//         }
//       }
//     });
//   };

//   return isLoading ? (
//     <CircularProgress size={15} />
//   ) : (
//     <Trash2
//       className="h-5 w-5 cursor-pointer text-red-600 transition-colors hover:text-red-700"
//       onClick={handleDelete}
//     />
//   );
// };
