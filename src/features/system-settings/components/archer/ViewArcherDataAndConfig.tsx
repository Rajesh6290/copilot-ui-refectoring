"use client";
import { ClickAwayListener, Tooltip } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Hash,
  Link2,
  Package,
  Search,
  Shield,
  X
} from "lucide-react";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage
} from "@/shared/utils";
import SyncStatusBanner from "./SyncStatusBanner";

interface ApplicationRecord extends Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Applications_Id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Entity_Name: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Entity_Description: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Last_Updated: string;
}

interface ControlProcedureRecord extends Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Control_Procedures_Id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Procedure_Name: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Procedure_ID: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Control_Design: string | string[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Type: string | string[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Last_Updated: string;
}
type CheckResult = { exists: boolean; docId: string | null };
const SYNC_STATUS_KEY = "archer_sync_status";
const SYNC_TASK_ID_KEY = "archer_sync_task_id";

const CustomToolbar = ({
  onSyncClick,
  onSyncCVClick,
  isSyncing,
  isSyncingCV,
  disabled,
  allDataMapped
}: {
  onSyncClick: () => void;
  onSyncCVClick: () => void;
  isSyncing: boolean;
  isSyncingCV: boolean;
  disabled?: boolean;
  allDataMapped: boolean;
}) => {
  const syncCVButton = (
    <CustomButton
      className="!text-[0.7rem]"
      onClick={onSyncCVClick}
      disabled={!allDataMapped || isSyncingCV || (disabled ?? false)}
      loading={isSyncingCV}
      loadingText="Syncing CV..."
    >
      <div className="flex items-center gap-2">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        {"Sync Archer CV"}
      </div>
    </CustomButton>
  );

  return (
    <div className="flex w-full items-center justify-between px-5 py-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Verify archer fields for smooth data sync
      </h3>
      <div className="flex items-center gap-8">
        <div className="w-fit">
          <CustomButton
            className="!text-[0.7rem]"
            onClick={onSyncClick}
            disabled={isSyncing || (disabled ?? false)}
            loading={isSyncing}
            loadingText="Syncing..."
          >
            Sync Now
          </CustomButton>
        </div>
        <div className="w-fit">
          {!allDataMapped ? (
            <Tooltip
              title="Please map all connected files first before syncing to Archer CV"
              arrow
              placement="top"
            >
              <div>{syncCVButton}</div>
            </Tooltip>
          ) : (
            syncCVButton
          )}
        </div>
      </div>
    </div>
  );
};

const ViewArcherDataAndConfig = () => {
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [tab, setTab] = useState<string>("Applications");
  const [syncTaskId, setSyncTaskId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const { isLoading, mutation } = useMutation();
  const { isLoading: isLoadingNew, mutation: newMutation } = useMutation();
  const { isLoading: isSyncingCV, mutation: syncCVMutation } = useMutation();
  const { isLoading: isConnecting, mutation: connectMutation } = useMutation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState<{ [key: string]: string }>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const { data, isValidating, mutate } = useSwr(
    `levels?level_alias=${tab}&limit=${pageSize}&page=${page + 1}`,
    {
      keepPreviousData: true
    }
  );
  const {
    data: mappedData,
    isValidating: mappedDataLoading,
    mutate: mappedDataMutate
  } = useSwr(
    !isValidating && data?.data?.length > 0
      ? `get_mapped_archer_data?core_application_name=${tab}`
      : null,
    {
      keepPreviousData: true
    }
  );

  // Fetch dropdown data for mapping
  const { data: dropdownData, isValidating: dropdownLoading } = useSwr(
    tab ? `existing_cv_data_dropdown?core_application_name=${tab}` : null,
    {
      keepPreviousData: true
    }
  );

  function mappedChecker(mappedDataa: Record<string, string>) {
    // Convert to Map for fastest lookup
    const map = new Map<string, string>(Object.entries(mappedDataa));

    // The main checker function
    const checker = ((key: string): CheckResult => {
      const docId = map.get(key);
      return docId ? { exists: true, docId } : { exists: false, docId: null };
    }) as {
      (key: string): CheckResult;
      [key: string]: CheckResult;
    };

    // Copy dynamic keys onto the function itself (O(n) only once)
    for (const [key, docId] of map) {
      checker[key] = { exists: true, docId };
    }

    return checker;
  }

  const isMapped = mappedChecker(
    !mappedDataLoading && mappedData ? mappedData.mapped_data : {}
  );

  // Handle dropdown toggle
  const toggleDropdown = (id: string) => {
    setDropdownOpen((prev) => {
      // Close all other dropdowns and toggle current one
      const allClosed = Object.keys(prev).reduce(
        (acc, key) => {
          acc[key] = false;
          return acc;
        },
        {} as { [key: string]: boolean }
      );

      return {
        ...allClosed,
        [id]: !prev[id]
      };
    });
  };

  // Calculate dropdown position
  const getDropdownPosition = (id: string) => {
    const button = document.querySelector(
      `[data-dropdown-id="${id}"]`
    ) as HTMLElement;
    if (!button) {
      return { top: 0, left: 0 };
    }

    const rect = button.getBoundingClientRect();
    const dropdownHeight = 250;
    const dropdownWidth = 320;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Check available space below button
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top: number;

    // Prefer opening below if there's enough space (like a proper select)
    if (spaceBelow >= dropdownHeight + 10) {
      // Open below
      top = rect.bottom + 5;
    } else if (spaceAbove >= dropdownHeight + 10) {
      // Open above
      top = rect.top - dropdownHeight - 5;
    } else {
      // Not enough space either way, use the side with more space
      if (spaceBelow > spaceAbove) {
        // Open below but limit height
        top = rect.bottom + 5;
      } else {
        // Open above but limit height
        top = Math.max(10, rect.top - dropdownHeight - 5);
      }
    }

    // Adjust horizontal position if it goes off screen
    let left = rect.left;
    if (left + dropdownWidth > viewportWidth - 20) {
      left = viewportWidth - dropdownWidth - 20;
    }
    if (left < 20) {
      left = 20;
    }

    return { top, left };
  };

  // Handle dropdown close
  const closeDropdown = (id: string) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [id]: false
    }));
    setSearchQuery((prev) => ({
      ...prev,
      [id]: ""
    }));
  };

  // Handle search query change
  const updateSearchQuery = (id: string, query: string) => {
    setSearchQuery((prev) => ({
      ...prev,
      [id]: query
    }));
  };

  // Handle connection
  const handleConnect = async (archerId: string, cvId: string) => {
    try {
      const res = await connectMutation(
        `connect_archer_existing_to_cv?core_application_name=${tab}&archer_id=${archerId}&cv_id=${cvId}`,
        {
          method: "POST",
          isAlert: false
        }
      );
      if (res?.status === 200 || res?.status === 201) {
        toast.success(res?.results?.message || "Connected successfully.");
        setSelectedItemId(null);
        mappedDataMutate();
        mutate();
        closeDropdown(archerId);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while connecting."
      );
    }
  };

  // Get filtered dropdown data for a specific item
  const getFilteredDropdownData = (id: string) => {
    const items = dropdownData?.drop_down_data ?? [];
    const query = searchQuery[id]?.toLowerCase() || "";

    if (!query.trim()) {
      return items;
    }

    return items.filter(
      (item: {
        name: string;
        doc_id: string;
        id: string;
        purpose: string;
        description: string;
        use_case_type: string;
        category: string;
        sub_type: string;
        control_type: string;
      }) => {
        const searchableFields = [
          item?.name,
          item?.doc_id,
          item?.id,
          item?.purpose,
          item?.description,
          item?.use_case_type,
          item?.category,
          item?.sub_type,
          item?.control_type
        ];

        return searchableFields.some(
          (field) => field && field.toString().toLowerCase().includes(query)
        );
      }
    );
  };

  // Get mapped item details
  const getMappedItemDetails = (id: string) => {
    const mappedDocId = isMapped[id]?.docId;
    if (!mappedDocId) {
      return null;
    }

    const dataa = dropdownData?.drop_down_data ?? [];
    return dataa.find(
      (item: { name: string; doc_id: string; id: string }) =>
        item?.doc_id === mappedDocId || item?.id === mappedDocId
    );
  };

  // Map Dropdown Component
  const MapDropdown = ({
    row,
    isApplication
  }: {
    row: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Applications_Id?: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Control_Procedures_Id?: string;
    };
    isApplication: boolean;
  }) => {
    const id = isApplication
      ? row?.Applications_Id
      : row?.Control_Procedures_Id;
    const mappedItem = getMappedItemDetails(id || "");
    const isOpen = dropdownOpen[id || ""] || false;
    const filteredData = getFilteredDropdownData(id || "");
    const currentSearchQuery = searchQuery[id || ""] || "";
    const isItemMapped = isMapped[id || ""]?.exists;

    if (isItemMapped && mappedItem) {
      return (
        <div className="relative">
          <ClickAwayListener onClickAway={() => closeDropdown(id || "")}>
            <div>
              <button
                onClick={() => toggleDropdown(id || "")}
                data-dropdown-id={id}
                className="flex w-full max-w-[200px] items-center justify-between gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-left text-xs font-medium text-green-800 hover:bg-green-100"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex h-2 w-2 items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="truncate">
                    {mappedItem?.name || "Mapped"}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen &&
                createPortal(
                  <div
                    className="fixed z-[9999] max-h-60 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                    style={{
                      top: `${getDropdownPosition(id || "").top}px`,
                      left: `${getDropdownPosition(id || "").left}px`,
                      maxWidth: "min(320px, calc(100vw - 40px))"
                    }}
                  >
                    {/* Search */}
                    <div className="border-b border-gray-100 p-3">
                      <div className="relative">
                        <Search
                          size={14}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={currentSearchQuery}
                          onChange={(e) =>
                            updateSearchQuery(id || "", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-8 text-sm focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
                        />
                        {currentSearchQuery && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateSearchQuery(id || "", "");
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-gray-100"
                          >
                            <X size={12} className="text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dropdown Items */}
                    <div className="max-h-48 overflow-y-auto">
                      {dropdownLoading ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Loading...
                        </div>
                      ) : filteredData.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No items found
                        </div>
                      ) : (
                        filteredData.map(
                          (item: {
                            name: string;
                            doc_id: string;
                            id: string;
                            description: string;
                          }) => {
                            const itemId = item?.doc_id || item?.id;
                            const isCurrentlyMapped =
                              mappedItem?.doc_id === itemId ||
                              mappedItem?.id === itemId;

                            return (
                              <button
                                key={itemId}
                                onClick={() => {
                                  if (!isCurrentlyMapped) {
                                    setSelectedItemId(itemId);
                                    handleConnect(id || "", itemId);
                                  }
                                }}
                                disabled={
                                  isConnecting && selectedItemId === itemId
                                }
                                className={`w-full border-b border-gray-50 p-3 text-left text-xs transition-colors hover:bg-gray-50 ${
                                  isCurrentlyMapped ? "bg-green-50" : ""
                                } ${isConnecting && selectedItemId === itemId ? "opacity-50" : ""}`}
                              >
                                <div className="flex items-center gap-2">
                                  {isApplication ? (
                                    <Package
                                      size={14}
                                      className="flex-shrink-0 text-tertiary"
                                    />
                                  ) : (
                                    <Shield
                                      size={14}
                                      className="flex-shrink-0 text-tertiary"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <span className="truncate font-medium text-gray-900">
                                        {item?.name}
                                      </span>
                                      {isCurrentlyMapped && (
                                        <span className="text-[10px] font-medium text-green-600">
                                          (Current)
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Hash
                                        size={10}
                                        className="text-gray-400"
                                      />
                                      <span className="font-mono text-gray-600">
                                        {itemId}
                                      </span>
                                    </div>
                                    {item?.description && (
                                      <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-gray-500">
                                        {item.description}
                                      </p>
                                    )}
                                  </div>
                                  {isConnecting &&
                                    selectedItemId === itemId && (
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-tertiary border-t-transparent" />
                                    )}
                                </div>
                              </button>
                            );
                          }
                        )
                      )}
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </ClickAwayListener>
        </div>
      );
    }

    // Not mapped - show Map button
    return (
      <div className="relative">
        <ClickAwayListener onClickAway={() => closeDropdown(id || "")}>
          <div>
            <button
              onClick={() => toggleDropdown(id || "")}
              data-dropdown-id={id}
              className="flex w-full max-w-[120px] items-center justify-center gap-2 rounded-lg border border-tertiary bg-tertiary px-3 py-2 text-xs font-medium text-white hover:bg-tertiary/90"
            >
              <Link2 size={14} />
              Map
            </button>

            {isOpen &&
              createPortal(
                <div
                  className="fixed z-[9999] max-h-60 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                  style={{
                    top: `${getDropdownPosition(id || "").top}px`,
                    left: `${getDropdownPosition(id || "").left}px`,
                    maxWidth: "min(320px, calc(100vw - 40px))"
                  }}
                >
                  {/* Search */}
                  <div className="border-b border-gray-100 p-3">
                    <div className="relative">
                      <Search
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={currentSearchQuery}
                        onChange={(e) =>
                          updateSearchQuery(id || "", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-8 text-sm focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
                      />
                      {currentSearchQuery && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSearchQuery(id || "", "");
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-gray-100"
                        >
                          <X size={12} className="text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Items */}
                  <div className="max-h-48 overflow-y-auto">
                    {dropdownLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Loading...
                      </div>
                    ) : filteredData.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No items found
                      </div>
                    ) : (
                      filteredData.map(
                        (item: {
                          name: string;
                          doc_id: string;
                          id: string;
                          description: string;
                        }) => {
                          const itemId = item?.doc_id || item?.id;

                          return (
                            <button
                              key={itemId}
                              onClick={() => {
                                setSelectedItemId(itemId);
                                handleConnect(id || "", itemId);
                              }}
                              disabled={
                                isConnecting && selectedItemId === itemId
                              }
                              className={`w-full border-b border-gray-50 p-3 text-left text-xs transition-colors hover:bg-gray-50 ${
                                isConnecting && selectedItemId === itemId
                                  ? "opacity-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isApplication ? (
                                  <Package
                                    size={14}
                                    className="flex-shrink-0 text-tertiary"
                                  />
                                ) : (
                                  <Shield
                                    size={14}
                                    className="flex-shrink-0 text-tertiary"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="truncate font-medium text-gray-900">
                                      {item?.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Hash size={10} className="text-gray-400" />
                                    <span className="font-mono text-gray-600">
                                      {itemId}
                                    </span>
                                  </div>
                                  {item?.description && (
                                    <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-gray-500">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                {isConnecting && selectedItemId === itemId && (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-tertiary border-t-transparent" />
                                )}
                              </div>
                            </button>
                          );
                        }
                      )
                    )}
                  </div>
                </div>,
                document.body
              )}
          </div>
        </ClickAwayListener>
      </div>
    );
  };
  // Check if all current page data is mapped
  const allDataMapped = useMemo(() => {
    if (!data?.data || data.data.length === 0) {
      return false;
    }

    const identifierField =
      tab === "Applications" ? "Applications_Id" : "Control_Procedures_Id";

    return data.data.every(
      (item: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Applications_Id: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Control_Procedures_Id: string;
      }) => {
        const id = item[identifierField];
        return isMapped[id]?.exists;
      }
    );
  }, [data?.data, isMapped, tab]);

  // Poll sync status when task ID exists
  const { data: statusData } = useSwr(
    syncTaskId && syncStatus !== "completed"
      ? `check_sync_status?task_id=${syncTaskId}`
      : null,
    {
      refreshInterval: 2000, // Poll every 2 seconds
      revalidateOnFocus: false
    }
  );

  // Load sync state from localStorage on mount
  useEffect(() => {
    const storedTaskId = getFromLocalStorage(SYNC_TASK_ID_KEY);
    const storedStatus = getFromLocalStorage(SYNC_STATUS_KEY);
    if (storedTaskId) {
      setSyncTaskId(storedTaskId);
    }
    if (storedStatus) {
      setSyncStatus(storedStatus);
    }

    // Handle window resize to close dropdowns
    const handleResize = () => {
      setDropdownOpen({});
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, []);

  // Update sync status based on API response
  useEffect(() => {
    if (statusData?.task_status) {
      const newStatus = statusData?.task_status?.task_status;
      setSyncStatus(newStatus);
      saveToLocalStorage(SYNC_STATUS_KEY, "in_progress");
      saveToLocalStorage(SYNC_STATUS_KEY, newStatus);

      if (newStatus === "completed") {
        toast.success("Sync completed successfully!");
        mutate(); // Refresh the main data

        // Clean up localStorage
        setTimeout(() => {
          removeFromLocalStorage(SYNC_TASK_ID_KEY);
          removeFromLocalStorage(SYNC_STATUS_KEY);
          setSyncTaskId(null);
          setSyncStatus(null);
        }, 3000); // Show completed status for 3 seconds
      }
    }
  }, [statusData, mutate]);

  const syncDataNow = async () => {
    try {
      const res = await mutation(
        `sync_archer_applications?level_alias=${tab}&limit=1`,
        {
          method: "POST",
          isAlert: false
        }
      );

      if (res?.status === 200) {
        const taskId = res?.results?.task_id;
        if (taskId) {
          // Store task ID and initial status
          setSyncTaskId(taskId);
          setSyncStatus("in_progress");
          saveToLocalStorage(SYNC_TASK_ID_KEY, taskId);
          saveToLocalStorage(SYNC_STATUS_KEY, "in_progress");
          toast.info("Sync process started in the background");
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during sync."
      );
    }
  };

  const syncCVData = async () => {
    try {
      const res = await syncCVMutation(
        `sync_cv_data_to_archer?core_application_name=${tab}`,
        {
          method: "POST",
          isAlert: false
        }
      );

      if (res?.status === 200) {
        toast.success(
          res?.results?.message || "CV data synced to Archer successfully!"
        );
        mutate(); // Refresh the main data
        mappedDataMutate(); // Refresh mapped data
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during CV data sync."
      );
    }
  };

  const handleCreateNew = async (id: string) => {
    try {
      const res = await newMutation(
        `create_control_record_in_cv?archer_control_id=${id}`,
        {
          method: "POST",
          isAlert: false
        }
      );
      if (res?.status === 200 || res?.status === 201) {
        toast.success(
          res?.results?.message || "Control Procedure created successfully"
        );
        setSelectedId(null);
        mappedDataMutate();
        mutate();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during creation."
      );
    }
  };
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ApplicationColumn = [
    {
      field: "Applications_Id",
      title: "Application ID",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <span className="flex w-full items-center justify-center capitalize">
          {(row as ApplicationRecord)?.Applications_Id ?? "Not Provided"}
        </span>
      )
    },
    {
      field: "Entity_Name",
      title: "Entity Name",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <span className="flex w-full items-center justify-center capitalize">
          {(row as ApplicationRecord)?.Entity_Name ?? "Not Provided"}
        </span>
      )
    },
    {
      field: "Entity_Description",
      title: "Entity Description",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <span className="flex w-full items-center justify-center capitalize">
          {(row as ApplicationRecord)?.Entity_Description ?? "Not Provided"}
        </span>
      )
    },
    {
      field: "status",
      title: "Status",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <div className="flex w-full items-center justify-center">
          {isMapped[(row as ApplicationRecord)?.Applications_Id as string]
            ?.exists ? (
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/20">
              <div className="flex h-2 w-2 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                Mapped
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 dark:bg-red-900/20">
              <div className="flex h-2 w-2 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
              </div>
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                Not Connected
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      field: "Last_Updated",
      title: "Last Updated",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <span className="flex w-full items-center justify-center capitalize">
          {moment(row?.Last_Updated).format("lll") ?? "Not Provided"}
        </span>
      )
    },
    {
      field: "action",
      title: "Actions",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <div className="flex w-full items-center justify-center">
          <MapDropdown row={row as ApplicationRecord} isApplication={true} />
        </div>
      )
    }
  ];
  const ControlProcedureColumn = [
    {
      field: "Control_Procedures_Id",
      title: "Control Procedure ID",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <span className="flex w-full items-center justify-center capitalize">
          {(row as ControlProcedureRecord)?.Control_Procedures_Id ??
            "Not Provided"}
        </span>
      )
    },
    {
      field: "Procedure_Name",
      title: "Procedure Name",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <span className="flex w-full items-center justify-center capitalize">
          {(row as ControlProcedureRecord)?.Procedure_Name ?? "Not Provided"}
        </span>
      )
    },
    {
      field: "Procedure_ID",
      title: "Procedure ID",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <span className="flex w-full items-center justify-center capitalize">
          {(row as ControlProcedureRecord)?.Procedure_ID ?? "Not Provided"}
        </span>
      )
    },
    {
      field: "Control_Design",
      title: "Control Design",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <div className="flex w-full items-center justify-center">
          {(row as ControlProcedureRecord)?.Control_Design ? (
            <ul className="text-left text-sm">
              {(Array.isArray((row as ControlProcedureRecord).Control_Design)
                ? ((row as ControlProcedureRecord).Control_Design as string[])
                : [(row as ControlProcedureRecord).Control_Design as string]
              ).map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
                  <span className="capitalize">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">Not Provided</span>
          )}
        </div>
      )
    },
    {
      field: "Type",
      title: "Type",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <div className="flex w-full items-center justify-center">
          {(row as ControlProcedureRecord)?.Type ? (
            <ul className="text-left text-sm">
              {(Array.isArray((row as ControlProcedureRecord).Type)
                ? ((row as ControlProcedureRecord).Type as string[])
                : [(row as ControlProcedureRecord).Type as string]
              ).map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></span>
                  <span className="capitalize">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">Not Provided</span>
          )}
        </div>
      )
    },
    {
      field: "status",
      title: "Status",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <div className="flex w-full items-center justify-center">
          {isMapped[
            (row as ControlProcedureRecord)?.Control_Procedures_Id as string
          ]?.exists ? (
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/20">
              <div className="flex h-2 w-2 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                Mapped
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 dark:bg-red-900/20">
              <div className="flex h-2 w-2 items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
              </div>
              <span className="text-nowrap text-xs font-semibold text-red-700 dark:text-red-300">
                Not Connected
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      field: "Last_Updated",
      title: "Last Updated",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <span className="flex w-full items-center justify-center capitalize">
          {moment(row?.Last_Updated).format("lll") ?? "Not Provided"}
        </span>
      )
    },
    {
      field: "action",
      title: "Actions",
      sortable: false,
      filterable: false,
      render: (row: ApplicationRecord | ControlProcedureRecord) => (
        <div className="flex w-full items-center justify-center gap-3">
          <div className="w-fit">
            <CustomButton
              onClick={() => {
                setSelectedId(
                  (row as ControlProcedureRecord)?.Control_Procedures_Id
                );
                handleCreateNew(
                  (row as ControlProcedureRecord)?.Control_Procedures_Id
                );
              }}
              loading={
                isLoadingNew &&
                selectedId ===
                  (row as ControlProcedureRecord)?.Control_Procedures_Id
              }
              loadingText="Creating...."
              className="!text-nowrap !text-[0.6rem]"
            >
              Create New
            </CustomButton>
          </div>
          <div className="w-fit">
            <MapDropdown
              row={row as ControlProcedureRecord}
              isApplication={false}
            />
          </div>
        </div>
      )
    }
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-fit w-full"
    >
      <div className="h-fit w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Archer Data Configuration
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Configure and verify data mappings per Application
              </p>
            </div>
          </div>
        </div>

        {/* Sync Status Banner */}
        <AnimatePresence>
          {syncStatus && syncStatus !== "completed" && (
            <SyncStatusBanner status={syncStatus} taskId={syncTaskId} />
          )}
          {syncStatus === "completed" && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 overflow-hidden rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
                    Sync Completed Successfully
                  </h3>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    All data has been synchronized
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative w-full space-y-3">
          {/* Scrollable Tab Header */}
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide flex gap-1 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {["Applications", "Control_Procedures"].map((tabName) => {
              const isActive = tab === tabName;

              return (
                <button
                  key={tabName}
                  data-tab={tabName}
                  onClick={() => setTab(tabName)}
                  className={`relative flex items-center gap-2.5 whitespace-nowrap rounded-lg px-5 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-tertiary-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  } `}
                >
                  <span>{tabName?.replace(/_/g, " ")}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`archer-config-table-${tab}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <CustomTable<ApplicationRecord | ControlProcedureRecord>
                columns={
                  tab === "Applications"
                    ? ApplicationColumn
                    : ControlProcedureColumn
                }
                data={data?.data || []}
                customToolbar={
                  <CustomToolbar
                    onSyncClick={syncDataNow}
                    onSyncCVClick={syncCVData}
                    isSyncing={isLoading || syncStatus === "in_progress"}
                    isSyncingCV={isSyncingCV}
                    disabled={isValidating}
                    allDataMapped={allDataMapped}
                  />
                }
                isLoading={isValidating || mappedDataLoading}
                page={page}
                pageSize={pageSize}
                totalCount={data?.pagination?.total_records}
                onPageChange={setPage}
                onRowsPerPageChange={setPageSize}
                title=""
                selection={false}
                filtering={false}
                options={{
                  toolbar: false,
                  search: false,
                  filtering: true,
                  sorting: true,
                  pagination: true
                }}
                className="flex-1"
                localization={{
                  body: {
                    emptyDataSourceMessage: "No field mappings configured."
                  }
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewArcherDataAndConfig;
