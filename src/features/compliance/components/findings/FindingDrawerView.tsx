"use client";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { Drawer } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  Search,
  Shield,
  Tag,
  Trash2,
  X,
  XCircle,
  Zap
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import AddNewFinding from "./AddNewFinding";
import UpdateFinding from "./UpdateFinding";

interface Finding {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  finding_type: string;
  incident_id: string;
  application_id: string;
  framework_id: string;
  requirement_id: string;
  control_id: string;
  test_id: string;
  test_run_id: string;
  result_id: string;
  auditor_user_id: string;
  heading: string;
  message: string;
  status: "pass" | "fail" | "other";
  severity?: "low" | "medium" | "high" | "critical" | "other";
  finding_category?: string;
  finding_id: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  client_id: string;
}

interface FindingDrawerProps {
  open: boolean;
  onClose: () => void;
  item: {
    application_id?: string;
    finding_type: string;
    framework_id?: string;
    control_id?: string;
    test_id?: string;
    test_run_id?: string;
    result_id?: string;
    requirement_id?: string;
  };
}

const SkeletonCard = () => (
  <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
    <div className="animate-pulse p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div className="h-6 w-4/5 rounded bg-slate-200 dark:bg-slate-700"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
          <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>
      <div className="mt-4 h-px bg-slate-200 dark:bg-slate-700"></div>
      <div className="mt-3 flex gap-3">
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>
    </div>
  </div>
);

const FindingDrawerView: React.FC<FindingDrawerProps> = ({
  open,
  onClose,
  item
}) => {
  const [page, setPage] = useState<number>(0);
  const [allFindings, setAllFindings] = useState<Finding[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [findingOpen, setFindingOpen] = useState<boolean>(false);
  const [updateOpen, setUpdateOpen] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { isLoading, mutation } = useMutation();
  const [findingId, setFindingId] = useState<string>("");
  const [findingData, setFindingData] = useState<{
    finding_type: string;
    control_id?: string;
    titel?: string;
    message?: string;
    status?: string;
    severity?: string;
    finding_category?: string;
    id?: string;
  }>({ finding_type: "audit" });

  const observerTarget = useRef<HTMLDivElement | null>(null);
  const limit: number = 20;

  const { data, isValidating, mutate } = useSwr(
    open
      ? `findings?page=${page}&limit=${limit}&control_id=${item.control_id}`
      : null
  );

  const refreshFindings = useCallback(async () => {
    setPage(0);
    setAllFindings([]);
    setHasMore(true);
    await mutate();
  }, [mutate]);

  useEffect(() => {
    if (data?.data) {
      setAllFindings((prev) => {
        if (page === 0) {
          return data.data;
        }
        const newFindings = data.data.filter(
          // eslint-disable-next-line @typescript-eslint/naming-convention
          (newItem: { _id: string }) =>
            !prev.some((items) => items._id === newItem._id)
        );
        return [...prev, ...newFindings];
      });

      const totalRecords = data.pagination?.total_records || 0;
      const loadedRecords = (page + 1) * limit;
      setHasMore(loadedRecords < totalRecords);

      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [data, page, limit, isInitialLoad]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target && target.isIntersecting && !isValidating && hasMore) {
        setPage((prev) => prev + 1);
      }
    },
    [isValidating, hasMore]
  );

  useEffect(() => {
    const element = observerTarget.current;
    const option: IntersectionObserverInit = { threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (element) {
      observer.observe(element);
    }
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  useEffect(() => {
    if (open) {
      setPage(0);
      setAllFindings([]);
      setHasMore(true);
      setIsInitialLoad(true);
      setSearchQuery("");
    }
  }, [open]);

  const handleDelete = async (id: string, heading: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `You are about to delete:<br/><strong>"${heading}"</strong>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        container: "high-z-index-swal"
      },
      didOpen: () => {
        const swalContainer = document.querySelector(
          ".swal2-container.high-z-index-swal"
        ) as HTMLElement;
        const swalOverlay = document.querySelector(
          ".swal2-backdrop-show"
        ) as HTMLElement;

        if (swalContainer) {
          swalContainer.style.zIndex = "10000";
        }
        if (swalOverlay) {
          swalOverlay.style.zIndex = "9999";
        }
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await mutation(`finding?finding_id=${id}`, {
          method: "DELETE",
          isAlert: false
        });
        if (res?.status === 200) {
          toast.success(
            res?.results?.message || "Finding deleted successfully"
          );
          setFindingId("");
          await refreshFindings();
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    }
  };

  const getSeverityConfig = useMemo(
    () => (severity: string) => {
      switch (severity?.toLowerCase()) {
        case "critical":
          return {
            bg: "bg-red-50 dark:bg-red-950/30",
            text: "text-red-700 dark:text-red-400",
            border: "border-red-200 dark:border-red-800/50",
            icon: Zap,
            label: "Critical",
            dotColor: "bg-red-500"
          };
        case "high":
          return {
            bg: "bg-orange-50 dark:bg-orange-950/30",
            text: "text-orange-700 dark:text-orange-400",
            border: "border-orange-200 dark:border-orange-800/50",
            icon: AlertTriangle,
            label: "High",
            dotColor: "bg-orange-500"
          };
        case "medium":
          return {
            bg: "bg-yellow-50 dark:bg-yellow-950/30",
            text: "text-yellow-700 dark:text-yellow-400",
            border: "border-yellow-200 dark:border-yellow-800/50",
            icon: AlertCircle,
            label: "Medium",
            dotColor: "bg-yellow-500"
          };
        case "low":
          return {
            bg: "bg-blue-50 dark:bg-blue-950/30",
            text: "text-blue-700 dark:text-blue-400",
            border: "border-blue-200 dark:border-blue-800/50",
            icon: Shield,
            label: "Low",
            dotColor: "bg-blue-500"
          };
        default:
          return {
            bg: "bg-gray-50 dark:bg-gray-800/30",
            text: "text-gray-700 dark:text-gray-400",
            border: "border-gray-200 dark:border-gray-700/50",
            icon: HelpCircle,
            label: "Other",
            dotColor: "bg-gray-500"
          };
      }
    },
    []
  );

  const getStatusConfig = useMemo(
    () => (status: string) => {
      switch (status) {
        case "pass":
          return {
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
            text: "text-emerald-700 dark:text-emerald-400",
            border: "border-emerald-200 dark:border-emerald-800/50",
            icon: CheckCircle,
            label: "Pass"
          };
        case "fail":
          return {
            bg: "bg-rose-50 dark:bg-rose-950/30",
            text: "text-rose-700 dark:text-rose-400",
            border: "border-rose-200 dark:border-rose-800/50",
            icon: XCircle,
            label: "Fail"
          };
        case "other":
          return {
            bg: "bg-amber-50 dark:bg-amber-950/30",
            text: "text-amber-700 dark:text-amber-400",
            border: "border-amber-200 dark:border-amber-800/50",
            icon: HelpCircle,
            label: "Other"
          };
        default:
          return {
            bg: "bg-slate-50 dark:bg-slate-800",
            text: "text-slate-700 dark:text-slate-400",
            border: "border-slate-200 dark:border-slate-700",
            icon: AlertCircle,
            label: "Unknown"
          };
      }
    },
    []
  );

  const filteredFindings = useMemo(() => {
    if (!searchQuery.trim()) {
      return allFindings;
    }

    const query = searchQuery.toLowerCase();
    return allFindings.filter(
      (finding) =>
        finding.heading.toLowerCase().includes(query) ||
        finding.message.toLowerCase().includes(query) ||
        finding.status.toLowerCase().includes(query) ||
        finding.severity?.toLowerCase().includes(query) ||
        finding.finding_category?.toLowerCase().includes(query)
    );
  }, [allFindings, searchQuery]);

  return (
    <>
      <AddNewFinding
        open={findingOpen}
        item={findingData}
        mutate={refreshFindings}
        onClose={() => {
          setFindingData({ finding_type: "audit" });
          setFindingOpen(false);
        }}
      />
      <UpdateFinding
        item={findingData}
        findingData={{
          id: findingData.id || "",
          heading: findingData.titel || "",
          message: findingData.message || "",
          status: findingData.status || "",
          severity: findingData.severity || "",
          finding_category: findingData.finding_category || ""
        }}
        open={updateOpen}
        mutate={refreshFindings}
        onClose={() => {
          setFindingData({ finding_type: "audit" });
          setUpdateOpen(false);
        }}
      />

      <Drawer anchor="right" open={open} onClose={onClose}>
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:w-[32rem] lg:w-[42rem]">
          {/* Header - Original Colors Restored */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-10 border-b border-slate-200/50 bg-tertiary backdrop-blur-xl dark:border-slate-700/50"
          >
            <div className="px-6 py-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Test Result Details
                  </h2>
                  <p className="text-sm text-slate-100">
                    Review and manage audit findings
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Search Bar and Add Button */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search findings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                </div>
                {/* <motion.button
                  onClick={() => setFindingOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 dark:from-blue-500 dark:to-blue-600"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add</span>
                </motion.button> */}
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {isInitialLoad && isValidating ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {filteredFindings?.map((finding) => {
                    const statusConfig = getStatusConfig(finding.status);
                    const severityConfig = getSeverityConfig(
                      finding.severity || "other"
                    );
                    const StatusIcon = statusConfig.icon;
                    const SeverityIcon = severityConfig.icon;

                    return (
                      <motion.div
                        key={finding._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="group relative mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="p-6 pl-7">
                          {/* Top Section: Status, Severity, Actions */}
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Status Badge */}
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-lg border ${statusConfig.border} ${statusConfig.bg} px-2.5 py-1 text-xs font-medium ${statusConfig.text}`}
                              >
                                <StatusIcon className="h-3.5 w-3.5" />
                                {statusConfig.label}
                              </span>

                              {/* Severity Badge */}
                              {finding.severity && (
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-lg border ${severityConfig.border} ${severityConfig.bg} px-2.5 py-1 text-xs font-medium ${severityConfig.text}`}
                                >
                                  <SeverityIcon className="h-3.5 w-3.5" />
                                  {severityConfig.label}
                                </span>
                              )}

                              {/* Category Badge */}
                              {finding.finding_category && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:border-purple-800/50 dark:bg-purple-950/30 dark:text-purple-400">
                                  <Tag className="h-3.5 w-3.5" />
                                  {finding.finding_category}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex shrink-0 gap-2">
                              <motion.button
                                onClick={() => {
                                  setFindingData({
                                    finding_type: "audit",
                                    control_id: finding.control_id,
                                    titel: finding.heading,
                                    message: finding.message,
                                    status: finding.status,
                                    ...(finding.severity && {
                                      severity: finding.severity
                                    }),
                                    ...(finding.finding_category && {
                                      finding_category: finding.finding_category
                                    }),
                                    id: finding.finding_id
                                  });
                                  setUpdateOpen(true);
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                title="Edit Finding"
                              >
                                <Pencil className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => {
                                  setFindingId(finding.finding_id);
                                  handleDelete(
                                    finding.finding_id,
                                    finding.heading
                                  );
                                }}
                                disabled={
                                  isLoading && findingId === finding.finding_id
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-sm shadow-red-500/25 transition-all hover:shadow-lg hover:shadow-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                title="Delete Finding"
                              >
                                {isLoading &&
                                findingId === finding.finding_id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </motion.button>
                            </div>
                          </div>

                          {/* Heading */}
                          <h3 className="mb-3 text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
                            {finding.heading}
                          </h3>

                          {/* Message */}
                          <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            {finding.message}
                          </p>

                          {/* Footer: Date */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-700/60 dark:text-slate-500">
                            <span className="font-medium">
                              {new Date(finding.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* No Results from Search */}
                {searchQuery &&
                  filteredFindings.length === 0 &&
                  !isValidating && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-20 text-center"
                    >
                      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                        <Search className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                        No results found
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Try adjusting your search query
                      </p>
                    </motion.div>
                  )}

                {/* Loading more */}
                {!isInitialLoad && isValidating && hasMore && (
                  <div className="flex justify-center py-8">
                    <div className="border-3 h-8 w-8 animate-spin rounded-full border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500"></div>
                  </div>
                )}

                {/* Infinite Scroll Trigger */}
                {hasMore && !searchQuery && (
                  <div ref={observerTarget} className="h-10"></div>
                )}

                {/* Empty State */}
                {!isValidating && allFindings.length === 0 && !searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-24 text-center"
                  >
                    <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                      <AlertCircle className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-200">
                      No findings yet
                    </h3>
                    <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                      Start by adding your first audit finding
                    </p>
                    <motion.button
                      onClick={() => setFindingOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 dark:from-blue-500 dark:to-blue-600"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="h-5 w-5" />
                      Add New Finding
                    </motion.button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default FindingDrawerView;
