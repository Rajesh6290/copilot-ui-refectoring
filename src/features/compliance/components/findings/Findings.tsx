"use client";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  XCircle
} from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
const AddNewFinding = dynamic(() => import("./AddNewFinding"), {
  ssr: false
});
const UpdateFinding = dynamic(() => import("./UpdateFinding"), {
  ssr: false
});

interface Finding extends Record<string, unknown> {
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
  severity?: string;
  finding_category?: string;
  finding_id: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  client_id: string;
}

interface ISAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
    };
  }[];
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
}
// Skeleton Card Component
const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
    <div className="animate-pulse space-y-4">
      <div className="flex justify-between">
        <div className="h-4 w-20 rounded-full bg-slate-200"></div>
        <div className="h-6 w-16 rounded-full bg-slate-200"></div>
      </div>
      <div className="h-6 w-3/4 rounded bg-slate-200"></div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-200"></div>
        <div className="h-4 w-5/6 rounded bg-slate-200"></div>
      </div>
      <div className="flex gap-3 pt-2">
        <div className="h-10 flex-1 rounded-xl bg-slate-200"></div>
        <div className="h-10 flex-1 rounded-xl bg-slate-200"></div>
      </div>
    </div>
  </div>
);

const Findings = ({
  controlId,
  isAccess
}: {
  controlId: string;
  isAccess: ISAccess;
}) => {
  const params = useSearchParams();
  const openAdd = params.get("openAdd") === "true";
  const referedFrom = params.get("referedFrom");
  const [page, setPage] = useState<number>(0);
  const [allFindings, setAllFindings] = useState<Finding[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [findingOpen, setFindingOpen] = useState<boolean>(false);
  const [updateOpen, setUpdateOpen] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
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
  const limit: number = 8;
  const { data, isValidating, mutate } = useSwr(
    `findings?page=${page}&limit=${limit}&control_id=${controlId}`
  );

  useEffect(() => {
    if (openAdd && referedFrom === "risk-control") {
      setFindingOpen(true);
    }
  }, []);
  // Function to refresh findings list without showing skeleton
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
            !prev.some((item) => item._id === newItem._id)
        );
        return [...prev, ...newFindings];
      });

      const totalRecords = data.pagination?.total_records || 0;
      const loadedRecords = (page + 1) * limit;
      setHasMore(loadedRecords < totalRecords);

      // Mark initial load as complete
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
      reverseButtons: true
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pass":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-700",
          icon: CheckCircle,
          label: "PASS",
          gradient: "from-emerald-500 to-green-500"
        };
      case "fail":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          icon: XCircle,
          label: "FAIL",
          gradient: "from-red-500 to-rose-500"
        };
      case "other":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-500",
          icon: HelpCircle,
          label: "OTHER",
          gradient: "from-amber-500 to-orange-500"
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          text: "text-slate-700",
          icon: AlertCircle,
          label: "UNKNOWN",
          gradient: "from-slate-500 to-gray-500"
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="flex h-fit w-full flex-col gap-6 p-4">
      <AddNewFinding
        open={findingOpen}
        item={{ ...findingData, control_id: controlId }}
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

      {/* Header */}
      <motion.div variants={headerVariants} initial="hidden" animate="visible">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-slate-950 bg-clip-text text-3xl font-bold text-transparent dark:bg-white sm:text-4xl">
              Audit Findings
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-white">
              Manage and track your audit findings with ease
            </p>
          </div>
          {isAccess?.buttons?.[0]?.permission?.is_shown && (
            <motion.button
              onClick={() => {
                if (isAccess?.buttons?.[0]?.permission?.actions.create) {
                  setFindingOpen(true);
                } else {
                  toast.error(
                    "You don't have permission to perform this action."
                  );
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-tertiary-600 to-tertiary-700 px-6 py-3 font-semibold text-white shadow-lg shadow-tertiary-500/30 transition-all hover:shadow-xl hover:shadow-tertiary-500/40"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-5 w-5" />
              <span>Add Finding</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Show skeleton only on initial load */}
      {isInitialLoad && isValidating ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Findings Grid */}
          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {allFindings?.map((finding) => {
                const statusConfig = getStatusConfig(finding.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={finding._id}
                    layout
                    variants={cardVariants}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all hover:shadow-2xl"
                    whileHover={{ y: -6 }}
                  >
                    {/* Gradient accent bar */}
                    <div
                      className={`h-1.5 w-full bg-gradient-to-r ${statusConfig.gradient}`}
                    />

                    <div className="flex flex-1 flex-col p-6">
                      {/* Header with Status */}
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(finding.created_at)}</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 rounded-full border ${statusConfig.border} ${statusConfig.bg} px-3 py-1.5`}
                        >
                          <StatusIcon
                            className={`h-3.5 w-3.5 ${statusConfig.text}`}
                          />
                          <span
                            className={`text-xs font-bold ${statusConfig.text}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="mb-3 line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-tertiary-700">
                        {finding.heading}
                      </h3>

                      {/* Description */}
                      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                        {finding.message}
                      </p>

                      {/* Severity and Category Tags */}
                      {(finding.severity || finding.finding_category) && (
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          {finding.severity && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900 dark:text-purple-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                              Severity:{" "}
                              {finding.severity.charAt(0).toUpperCase() +
                                finding.severity.slice(1)}
                            </span>
                          )}
                          {finding.finding_category && (
                            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Category: {finding.finding_category}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {isAccess?.buttons?.[1]?.permission?.is_shown && (
                          <motion.button
                            onClick={() => {
                              if (
                                isAccess?.buttons?.[1]?.permission?.actions
                                  ?.update
                              ) {
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
                              } else {
                                toast.error(
                                  "You don't have permission to perform this action."
                                );
                              }
                            }}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 font-medium text-slate-700 transition-all hover:bg-slate-200"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Edit</span>
                          </motion.button>
                        )}
                        {isAccess?.buttons?.[2]?.permission?.is_shown && (
                          <motion.button
                            onClick={() => {
                              if (
                                isAccess?.buttons?.[2]?.permission?.actions
                                  ?.delete
                              ) {
                                setFindingId(finding.finding_id);
                                handleDelete(
                                  finding.finding_id,
                                  finding.heading
                                );
                              } else {
                                toast.error(
                                  "You don't have permission to perform this action."
                                );
                              }
                            }}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 font-medium text-red-600 transition-all hover:bg-red-100"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {isLoading && findingId === finding.finding_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            {isLoading && findingId === finding.finding_id ? (
                              <span>Deleting...</span>
                            ) : (
                              <span>Delete</span>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Loading more indicator (not skeleton) */}
          {!isInitialLoad && isValidating && hasMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-3">
                <motion.div
                  className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-tertiary-600"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-sm font-medium text-slate-600">
                  Loading more...
                </span>
              </div>
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          {hasMore && <div ref={observerTarget} className="h-10"></div>}

          {/* Empty State */}
          {!isValidating && allFindings.length === 0 && (
            <motion.div
              className="py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                <AlertCircle className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-800">
                No findings yet
              </h3>
              <p className="mb-6 text-slate-500">
                Start by adding your first audit finding
              </p>
              {isAccess?.buttons?.[0]?.permission?.is_shown && (
                <motion.button
                  onClick={() => {
                    if (isAccess?.buttons?.[0]?.permission?.actions?.create) {
                      setFindingOpen(true);
                    } else {
                      toast.error(
                        "You don't have permission to perform this action."
                      );
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-tertiary-600 to-tertiary-700 px-8 py-4 font-semibold text-white shadow-xl shadow-tertiary-500/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="h-5 w-5" />
                  <span>Add New Finding</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Findings;
