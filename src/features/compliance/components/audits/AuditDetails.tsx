"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useCurrentMenuItem } from "@/shared/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Info,
  Layers,
  Search,
  Shield,
  TrendingUp,
  Users,
  XCircle
} from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import React, { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
const AddNewFinding = dynamic(() => import("../findings/AddNewFinding"), {
  ssr: false
});
const FindingDrawerView = dynamic(
  () => import("../findings/FindingDrawerView"),
  {
    ssr: false
  }
);
interface Control {
  control_id: string;
  control_doc_ids?: string[];
  name: string;
  description: string;
  category: string;
  control_type: string;
  audit_status: string;
  actual_status: string;
  evidence_count: number;
  last_updated: string;
  findings_count: number;
  sub_type?: string;
}

interface Requirement {
  requirement_id: string;
  requirement_doc_id?: string;
  section: string;
  requirement_name: string;
  description: string;
  audit_status: string;
  actual_status: string;
  controls: Control[];
  controls_count: number;
  completed_controls_count: number;
  controls_completion_percentage: number;
}

interface Framework {
  framework_id: string;
  framework_doc_id?: string;
  name: string;
  short_name: string;
  description: string;
  publisher: string;
  audit_status: string;
  actual_status: string;
  requirements: Requirement[];
  requirements_count: number;
  completed_requirements_count: number;
  requirements_completion_percentage: number;
}

interface IsAccess {
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
  tabs: {
    metadata: {
      reference: string;
    };
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
  buttons: {
    metadata: {
      reference: string;
    };
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
    };
    buttons: {
      metadata: {
        reference: string;
      };
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
  }[];
}
const AuditDetails: React.FC = () => {
  const { id } = useParams();
  const currentMenuAccess = useCurrentMenuItem();
  const currentMenuAccessTab = currentMenuAccess?.tabs?.find(
    (tab) => tab.metadata?.reference === "audits-register"
  ) as IsAccess | undefined;
  const currentMenuAccessButton =
    currentMenuAccessTab?.buttons?.find(
      (btn) => btn.metadata?.reference === "view-audit"
    ) || null;

  const { data, error, isValidating, mutate } = useSwr(
    id ? `audit-breakdown?audit_id=${id}` : null
  );
  const router = useRouter();
  const { isLoading, mutation } = useMutation();
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [expandedFramework, setExpandedFramework] = useState<string | null>(
    null
  );
  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(
    null
  );
  const [findingOpen, setFindingOpen] = useState<boolean>(false);
  const [findingData, setFindingData] = useState<{
    application_id?: string;
    finding_type: string;
    framework_id?: string;
    control_id?: string;
    test_id?: string;
    test_run_id?: string;
    result_id?: string;
    requirement_id?: string;
  }>({ finding_type: "audit" });
  const [expandedControl, setExpandedControl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  // Safe date formatter
  const formatDate = (dateString?: string): string => {
    if (!dateString) {
      return "N/A";
    }
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Invalid Date"
        : date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          });
    } catch {
      return "Invalid Date";
    }
  };

  // Status Badge Component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; border: string; icon: React.ReactNode }
    > = {
      not_complete: {
        bg: "bg-rose-50 dark:bg-rose-500/10",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-100 dark:border-rose-500/20",
        icon: <XCircle className="h-3.5 w-3.5" />
      },
      complete: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-100 dark:border-emerald-500/20",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />
      },
      in_progress: {
        bg: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-100 dark:border-amber-500/20",
        icon: <Clock className="h-3.5 w-3.5" />
      },
      invited: {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-100 dark:border-blue-500/20",
        icon: <AlertCircle className="h-3.5 w-3.5" />
      },
      active: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-100 dark:border-emerald-500/20",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />
      },
      draft: {
        bg: "bg-slate-50 dark:bg-slate-500/10",
        text: "text-slate-600 dark:text-slate-400",
        border: "border-slate-100 dark:border-slate-500/20",
        icon: <FileText className="h-3.5 w-3.5" />
      }
    };

    const config = statusConfig[status] || statusConfig["not_complete"];

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config?.bg || ""} ${config?.text || ""} ${config?.border || ""}`}
      >
        {config?.icon}
        AUDIT : {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };
  // Framework Status Badge Component
  const FrameworkStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; border: string; icon: React.ReactNode }
    > = {
      not_complete: {
        bg: "bg-rose-50 dark:bg-rose-500/10",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-100 dark:border-rose-500/20",
        icon: <XCircle className="h-3.5 w-3.5" />
      },
      complete: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-100 dark:border-emerald-500/20",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />
      },
      in_progress: {
        bg: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-100 dark:border-amber-500/20",
        icon: <Clock className="h-3.5 w-3.5" />
      },
      invited: {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-100 dark:border-blue-500/20",
        icon: <AlertCircle className="h-3.5 w-3.5" />
      },
      active: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-100 dark:border-emerald-500/20",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />
      },
      draft: {
        bg: "bg-slate-50 dark:bg-slate-500/10",
        text: "text-slate-600 dark:text-slate-400",
        border: "border-slate-100 dark:border-slate-500/20",
        icon: <FileText className="h-3.5 w-3.5" />
      }
    };

    const config = statusConfig[status] || statusConfig["not_complete"];

    return (
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 shadow-sm dark:bg-slate-900">
        <h1 className="text-sm font-semibold text-gray-700 dark:text-white">
          Audit Status :
        </h1>
        <span
          className={`inline-flex items-center gap-1.5 text-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config?.bg || ""} ${config?.text || ""} ${config?.border || ""}`}
        >
          {config?.icon}
          {status.replace("_", " ").toUpperCase()}
        </span>
      </div>
    );
  };
  // Accordion Toggles
  const toggleFramework = (ids: string) => {
    setExpandedFramework(expandedFramework === ids ? null : ids);
    setExpandedRequirement(null);
    setExpandedControl(null);
  };

  const toggleRequirement = (ide: string) => {
    setExpandedRequirement(expandedRequirement === ide ? null : ide);
    setExpandedControl(null);
  };

  const toggleControl = (idd: string) => {
    setExpandedControl(expandedControl === idd ? null : idd);
  };

  // === STATES ===
  if (!data || isValidating) {
    return (
      <div className="font-sans h-fit p-4 text-slate-800">
        <div className="mx-auto w-full max-w-[1600px] space-y-6">
          {/* HEADER SKELETON */}
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
            <div className="px-8 py-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-6">
                  <div className="flex h-16 w-16 shrink-0 animate-pulse items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1 space-y-3">
                    <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                    <div className="h-5 w-96 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
                <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>

              <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 w-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="h-fit w-full space-y-6">
            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Timeline Skeleton */}
              <div className="h-full w-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                  <div className="h-6 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="space-y-6 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-6 w-6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Overview Skeleton */}
              <div className="h-full w-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 md:col-span-2">
                <div className="border-b border-slate-100 px-8 py-6 dark:border-slate-800">
                  <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="p-8">
                  <div className="mb-8 h-4 w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Search & Filter Skeleton */}
            <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-6 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>

            {/* Frameworks Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                      <div className="space-y-2">
                        <div className="h-6 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 w-96 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <div className="max-w-md rounded-2xl bg-white p-12 text-center shadow-sm dark:border dark:border-slate-800 dark:bg-slate-900">
          <AlertTriangle className="mx-auto mb-6 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            Failed to Load Audit
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Something went wrong. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <div className="max-w-md rounded-2xl bg-white p-12 text-center shadow-sm dark:border dark:border-slate-800 dark:bg-slate-900">
          <FileText className="mx-auto mb-6 h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            Audit Not Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            The requested audit does not exist.
          </p>
        </div>
      </div>
    );
  }

  // Safe date calculations
  const startDate = data?.audit_window?.start_date
    ? new Date(data?.audit_window.start_date)
    : null;
  const endDate = data?.audit_window?.end_date
    ? new Date(data?.audit_window.end_date)
    : null;
  const today = new Date();

  const daysUntilStart =
    startDate && !isNaN(startDate.getTime())
      ? Math.ceil(
          (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

  const totalDuration =
    startDate &&
    endDate &&
    !isNaN(startDate.getTime()) &&
    !isNaN(endDate.getTime())
      ? Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

  // Search & Filter
  const filteredFrameworks = (data?.frameworks || [])
    .map((framework: Framework) => ({
      ...framework,
      requirements: (framework.requirements || []).filter((req) => {
        const searchMatch =
          (req.requirement_name ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (req.description ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const statusMatch =
          filterStatus === "all" || (req.audit_status ?? "") === filterStatus;
        return searchMatch && statusMatch;
      })
    }))
    .filter((f: Framework) => f.requirements.length > 0);

  const handleUpdateControl = async (updatedControl: Control) => {
    try {
      const result = await Swal.fire({
        title: "Mark Control as Complete?",
        text: `Are you sure you want to mark "${updatedControl.name}" as complete?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, mark complete",
        cancelButtonText: "Cancel"
      });

      if (result.isConfirmed) {
        // Handle control_doc_ids as an array with Promise.all for concurrent calls
        const controlDocIds = Array.isArray(updatedControl.control_doc_ids)
          ? updatedControl.control_doc_ids
          : [updatedControl.control_doc_ids];

        const promises = controlDocIds.map((controlDocId) =>
          mutation(
            `audits/control-mapping?audit_id=${id}&control_doc_id=${controlDocId}&status=complete`,
            {
              method: "PATCH",
              isAlert: false
            }
          )
        );

        const responses = await Promise.all(promises);

        // Check if all requests were successful
        const allSuccessful = responses.every((res) => res?.status === 200);

        if (allSuccessful) {
          toast.success("Status updated successfully for all controls.");
          setSelectedControl(null);
          mutate();
        } else {
          toast.error("Some controls could not be updated. Please try again.");
        }
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while updating the control."
      );
    }
  };
  return (
    <div className="font-sans h-fit p-4 text-slate-800">
      <AddNewFinding
        item={findingData}
        mutate={mutate}
        open={findingOpen}
        onClose={() => {
          setFindingOpen(false);
          setFindingData({ finding_type: "audit" });
        }}
      />
      <FindingDrawerView
        item={findingData}
        onClose={() => {
          setDrawerOpen(false);
          setFindingData({ finding_type: "audit" });
        }}
        open={drawerOpen}
      />
      <div className="mx-auto w-full space-y-6">
        {/* HEADER */}
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground">
          <div className="px-8 py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                  <Shield className="h-8 w-8" />
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {data?.title || "Untitled Audit"}
                    </h1>
                    <StatusBadge status={data?.status || "draft"} />
                  </div>
                  <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
                    {data?.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4" />
                Export Report
              </motion.button> */}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <Clock className="h-5 w-5 text-amber-500" />
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                    {daysUntilStart !== null && daysUntilStart > 0
                      ? "Starts In :"
                      : "Started :"}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {daysUntilStart !== null && daysUntilStart > 0
                      ? `${daysUntilStart} days`
                      : formatDate(data?.audit_window?.start_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <Calendar className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                    Duration :
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {totalDuration !== null ? `${totalDuration} days` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <Award className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                    Type :
                  </p>
                  <p className="font-bold capitalize text-slate-900 dark:text-white">
                    {data?.assessment_type || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <Users className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                    Auditors :
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {data?.invited_auditors?.length ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-fit w-full space-y-6">
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-full w-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground"
            >
              <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                  <Calendar className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  Timeline
                </h2>
              </div>
              <div className="p-6">
                <div className="relative pl-2">
                  <div className="absolute bottom-6 left-5 top-3 z-0 w-[2px] bg-slate-100 dark:bg-slate-800" />
                  <div className="space-y-8">
                    <div className="relative z-10 pl-10">
                      <div className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white bg-indigo-500 shadow-sm dark:border-slate-900" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          Created
                        </p>
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {formatDate(data?.created_at)}
                        </p>
                      </div>
                    </div>
                    {startDate && (
                      <div className="relative z-10 pl-10">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500 shadow-sm dark:border-slate-900" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            Audit Begins
                          </p>
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {formatDate(data?.audit_window?.start_date)}
                          </p>
                        </div>
                      </div>
                    )}
                    {endDate && (
                      <div className="relative z-10 pl-10">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white bg-slate-300 shadow-sm dark:border-slate-900 dark:bg-slate-700" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            Audit Closes
                          </p>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
                            {formatDate(data?.audit_window?.end_date)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full w-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground md:col-span-2"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 dark:border-slate-800">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                  <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  Audit Progress Overview
                </h2>
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {data?.summary?.completed_controls ?? 0} /{" "}
                  {data?.summary?.total_controls ?? 0} Controls Complete
                </div>
              </div>
              <div className="p-8">
                <div className="mb-8 h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${data?.summary?.overall_completion_percentage ?? 0}%`
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {data?.summary?.completed_controls ?? 0}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-emerald-600/60 dark:text-emerald-400/60">
                      Completed Controls
                    </p>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
                    <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                      {(data?.summary?.total_controls ?? 0) -
                        (data?.summary?.completed_controls ?? 0)}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-rose-600/60 dark:text-rose-400/60">
                      Remaining Controls
                    </p>
                  </div>
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center dark:border-indigo-500/20 dark:bg-indigo-500/10">
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {data?.summary?.total_requirements ?? 0}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-indigo-600/60 dark:text-indigo-400/60">
                      Total Requirements
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-800/50">
                    <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                      {Math.round(
                        data?.summary?.overall_completion_percentage ?? 0
                      )}
                      %
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-600/60 dark:text-slate-400/60">
                      Audit Progress
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Award className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Frameworks
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-64 rounded-xl border-none bg-white py-2 pl-10 pr-4 text-sm font-medium shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-darkSidebarBackground dark:text-white dark:ring-neutral-700"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 cursor-pointer rounded-xl border-none bg-white py-2 pl-10 pr-8 text-sm font-medium shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-darkSidebarBackground dark:text-white dark:ring-neutral-700"
              >
                <option value="all">All Status</option>
                <option value="complete">Complete</option>
                <option value="not_complete">Not Complete</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
          </div>

          {/* Frameworks List */}
          <div className="space-y-4">
            {filteredFrameworks?.map((framework: Framework) => (
              <div
                key={framework.framework_id}
                className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm hover:shadow-md dark:border-neutral-800 dark:bg-darkSidebarBackground"
              >
                <button
                  onClick={() => toggleFramework(framework.framework_id)}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                        expandedFramework === framework.framework_id
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                          : "bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      }`}
                    >
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {framework.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {framework.short_name}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="text-slate-500 dark:text-slate-400">
                          {framework.publisher}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                        <span className="text-slate-500 dark:text-slate-400">
                          {framework.requirements.length} Requirements
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {Math.round(
                          framework.requirements_completion_percentage ?? 0
                        )}
                        %
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Complete
                      </div>
                    </div>
                    <FrameworkStatusBadge
                      status={framework.audit_status || "not_complete"}
                    />
                    <ChevronRight
                      className={`text-slate-400 transition-transform duration-300 ${
                        expandedFramework === framework.framework_id
                          ? "rotate-90"
                          : ""
                      }`}
                    />
                  </div>
                </button>
                {expandedFramework === framework.framework_id && (
                  <motion.div className="border-t border-slate-100 bg-slate-50/50 dark:border-neutral-800 dark:bg-darkSidebarBackground">
                    <div className="p-6">
                      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-neutral-900 dark:bg-darkSidebarBackground">
                        <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          <Info className="h-3 w-3" /> Description
                        </p>
                        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                          {framework.description || "No description available."}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                          <Layers className="h-4 w-4" />
                          Requirements ({framework.requirements.length})
                        </h4>

                        {framework.requirements.map((requirement) => (
                          <motion.div
                            layout
                            key={requirement.requirement_id}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-neutral-900 dark:bg-darkSidebarBackground"
                          >
                            <motion.button
                              layout="position"
                              onClick={() =>
                                toggleRequirement(requirement.requirement_id)
                              }
                              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <div className="flex items-center gap-3">
                                <ChevronRight
                                  className={`h-4 w-4 text-slate-300 transition-transform duration-300 ${
                                    expandedRequirement ===
                                    requirement.requirement_id
                                      ? "rotate-90 text-indigo-500"
                                      : ""
                                  } dark:text-slate-600`}
                                />
                                <div>
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-white">
                                      {requirement.requirement_id}
                                    </span>
                                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                      {requirement.section}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-slate-900 dark:text-white">
                                    {requirement.requirement_name}
                                  </h5>
                                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span>
                                      {requirement.controls_count} Controls
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {Math.round(
                                        requirement.controls_completion_percentage ??
                                          0
                                      )}
                                      % Complete
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <StatusBadge
                                status={
                                  requirement.audit_status || "not_complete"
                                }
                              />
                            </motion.button>
                            {expandedRequirement ===
                              requirement.requirement_id && (
                              <motion.div className="border-t border-slate-100 bg-slate-50/50 dark:border-neutral-900 dark:bg-darkSidebarBackground">
                                <div className="space-y-4 p-5">
                                  <div>
                                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                                      Description
                                    </p>
                                    <p className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-neutral-800 dark:bg-darkSidebarBackground dark:text-slate-300">
                                      {requirement.description ||
                                        "No description available."}
                                    </p>
                                  </div>

                                  {requirement.controls?.length > 0 && (
                                    <div className="flex w-full flex-col gap-5">
                                      {requirement?.controls?.filter(
                                        (ctl) =>
                                          ctl?.sub_type === "Compliance Control"
                                      )?.length > 0 && (
                                        <div className="rounded-xl bg-white p-5 shadow dark:border dark:border-neutral-900 dark:bg-darkSidebarBackground">
                                          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                                            Organizational level controls (
                                            {
                                              requirement?.controls?.filter(
                                                (ctl) =>
                                                  ctl?.sub_type ===
                                                  "Compliance Control"
                                              ).length
                                            }
                                            )
                                          </p>
                                          <div className="space-y-2">
                                            {requirement?.controls
                                              ?.filter(
                                                (ctl) =>
                                                  ctl?.sub_type ===
                                                  "Compliance Control"
                                              )
                                              ?.map((control) => (
                                                <motion.div
                                                  layout
                                                  key={control.control_id}
                                                  className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-neutral-900 dark:bg-darkSidebarBackground"
                                                >
                                                  <motion.div
                                                    layout="position"
                                                    onClick={() =>
                                                      toggleControl(
                                                        control.control_id
                                                      )
                                                    }
                                                    className="flex w-full cursor-pointer items-center justify-between p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <ChevronRight
                                                        className={`h-3 w-3 text-slate-300 transition-transform duration-300 ${
                                                          expandedControl ===
                                                          control.control_id
                                                            ? "rotate-90 text-indigo-500"
                                                            : ""
                                                        } dark:text-slate-600`}
                                                      />
                                                      <div>
                                                        <div className="flex items-center gap-2">
                                                          <span className="font-mono text-xs text-slate-400 dark:text-white">
                                                            {control.control_id}
                                                          </span>
                                                          <h6 className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {control.name}
                                                          </h6>
                                                        </div>
                                                        <div className="mt-0.5 flex items-center gap-2 text-xs">
                                                          <span className="rounded bg-purple-50 px-1.5 py-0.5 font-semibold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                                                            {control.category}
                                                          </span>
                                                          <span className="capitalize text-slate-400 dark:text-white">
                                                            {
                                                              control.control_type
                                                            }
                                                          </span>
                                                          {control.evidence_count >
                                                            0 && (
                                                            <>
                                                              <span>•</span>
                                                              <span className="text-emerald-600 dark:text-emerald-400">
                                                                {
                                                                  control.evidence_count
                                                                }{" "}
                                                                Evidence
                                                              </span>
                                                            </>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                      {currentMenuAccessButton
                                                        ?.buttons?.[0]
                                                        ?.permission
                                                        ?.is_shown && (
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (
                                                              currentMenuAccessButton
                                                                ?.buttons?.[0]
                                                                ?.permission
                                                                ?.actions
                                                                ?.create
                                                            ) {
                                                              setFindingData({
                                                                finding_type:
                                                                  "audit",
                                                                ...(framework.framework_doc_id && {
                                                                  framework_id:
                                                                    framework.framework_doc_id
                                                                }),
                                                                ...(requirement.requirement_doc_id && {
                                                                  requirement_id:
                                                                    requirement.requirement_doc_id
                                                                }),
                                                                ...(control
                                                                  .control_doc_ids?.[0] && {
                                                                  control_id:
                                                                    control
                                                                      .control_doc_ids[0]
                                                                })
                                                              });
                                                              setFindingOpen(
                                                                true
                                                              );
                                                            } else {
                                                              toast.error(
                                                                "You do not have permission to perform this action."
                                                              );
                                                            }
                                                          }}
                                                          className="w-fit text-nowrap rounded-full border border-tertiary px-3 py-1.5 text-xs font-medium text-tertiary duration-200 hover:bg-tertiary hover:text-white"
                                                        >
                                                          Add Finding
                                                        </button>
                                                      )}

                                                      {control?.findings_count >
                                                        0 &&
                                                        currentMenuAccessButton
                                                          ?.buttons?.[1]
                                                          ?.permission
                                                          ?.is_shown && (
                                                          <button
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.preventDefault();
                                                              e.stopPropagation();
                                                              if (
                                                                currentMenuAccessButton
                                                                  ?.buttons?.[0]
                                                                  ?.permission
                                                                  ?.actions
                                                                  ?.read
                                                              ) {
                                                                setFindingData({
                                                                  finding_type:
                                                                    "audit",
                                                                  ...(framework.framework_doc_id && {
                                                                    framework_id:
                                                                      framework.framework_doc_id
                                                                  }),
                                                                  ...(requirement.requirement_doc_id && {
                                                                    requirement_id:
                                                                      requirement.requirement_doc_id
                                                                  }),
                                                                  ...(control
                                                                    .control_doc_ids?.[0] && {
                                                                    control_id:
                                                                      control
                                                                        .control_doc_ids[0]
                                                                  })
                                                                });
                                                                setDrawerOpen(
                                                                  true
                                                                );
                                                              } else {
                                                                toast.error(
                                                                  "You do not have permission to perform this action."
                                                                );
                                                              }
                                                            }}
                                                            className="w-fit text-nowrap rounded-full border border-tertiary px-3 py-1.5 text-xs font-medium text-tertiary duration-200 hover:bg-tertiary hover:text-white"
                                                          >
                                                            View Findings (
                                                            {
                                                              control?.findings_count
                                                            }
                                                            )
                                                          </button>
                                                        )}
                                                      {currentMenuAccessButton
                                                        ?.buttons?.[2]
                                                        ?.permission
                                                        ?.is_shown && (
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (
                                                              currentMenuAccessButton
                                                                ?.buttons?.[2]
                                                                ?.permission
                                                                ?.actions?.read
                                                            ) {
                                                              router.push(
                                                                `/controls/${control?.control_doc_ids?.[0]}?_name=${control?.name}`
                                                              );
                                                            } else {
                                                              toast.error(
                                                                "You do not have permission to perform this action."
                                                              );
                                                            }
                                                          }}
                                                          className="w-fit text-nowrap rounded-full border border-tertiary px-3 py-1.5 text-xs font-medium text-tertiary duration-200 hover:bg-tertiary hover:text-white"
                                                        >
                                                          Go to control
                                                        </button>
                                                      )}

                                                      <StatusBadge
                                                        status={
                                                          control.audit_status ||
                                                          "not_complete"
                                                        }
                                                      />
                                                      {control?.actual_status ===
                                                        "complete" &&
                                                        control?.audit_status !==
                                                          "complete" &&
                                                        currentMenuAccessButton
                                                          ?.buttons?.[3]
                                                          ?.permission
                                                          ?.is_shown && (
                                                          <div className="w-fit">
                                                            <CustomButton
                                                              loading={
                                                                selectedControl?.control_id ===
                                                                  control.control_id &&
                                                                isLoading
                                                              }
                                                              loadingText="Updating..."
                                                              onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setSelectedControl(
                                                                  control
                                                                );
                                                                handleUpdateControl(
                                                                  control
                                                                );
                                                              }}
                                                              disabled={
                                                                !currentMenuAccessButton
                                                                  ?.buttons?.[3]
                                                                  ?.permission
                                                                  ?.actions
                                                                  ?.update
                                                              }
                                                              className="w-fit !text-[0.7rem]"
                                                            >
                                                              Mark as complete
                                                            </CustomButton>
                                                          </div>
                                                        )}
                                                    </div>
                                                  </motion.div>

                                                  {expandedControl ===
                                                    control.control_id && (
                                                    <motion.div className="border-t border-slate-100 dark:border-neutral-900 dark:bg-darkSidebarBackground">
                                                      <div className="p-4">
                                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                          Description
                                                        </p>
                                                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                                          {control.description ||
                                                            "No description."}
                                                        </p>

                                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                                          <div className="rounded-lg bg-slate-50 p-3 dark:bg-darkMainBackground">
                                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                              Control
                                                              Implementation
                                                              Status
                                                            </p>
                                                            <p className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
                                                              {control.actual_status.replace(
                                                                "_",
                                                                " "
                                                              )}
                                                            </p>
                                                          </div>
                                                          <div className="rounded-lg bg-slate-50 p-3 dark:bg-darkMainBackground">
                                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                              Evidence Count
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                              {
                                                                control.evidence_count
                                                              }
                                                            </p>
                                                          </div>
                                                        </div>

                                                        <div className="mt-3">
                                                          <p className="text-xs text-slate-400 dark:text-slate-500">
                                                            Last Updated:{" "}
                                                            {formatDate(
                                                              control.last_updated
                                                            )}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </motion.div>
                                              ))}
                                          </div>
                                        </div>
                                      )}
                                      {requirement?.controls?.filter(
                                        (ctl) =>
                                          ctl?.sub_type === "Risk Control"
                                      )?.length > 0 && (
                                        <div className="rounded-xl bg-white p-5 shadow dark:border dark:border-neutral-900 dark:bg-darkSidebarBackground">
                                          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                                            Application level controls (
                                            {
                                              requirement?.controls?.filter(
                                                (ctl) =>
                                                  ctl?.sub_type ===
                                                  "Risk Control"
                                              ).length
                                            }
                                            )
                                          </p>
                                          <div className="space-y-2">
                                            {requirement?.controls
                                              ?.filter(
                                                (ctl) =>
                                                  ctl?.sub_type ===
                                                  "Risk Control"
                                              )
                                              ?.map((control) => (
                                                <motion.div
                                                  layout
                                                  key={control.control_id}
                                                  className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-neutral-900 dark:bg-darkSidebarBackground"
                                                >
                                                  <motion.div
                                                    layout="position"
                                                    onClick={() =>
                                                      toggleControl(
                                                        control.control_id
                                                      )
                                                    }
                                                    className="flex w-full cursor-pointer items-center justify-between p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <ChevronRight
                                                        className={`h-3 w-3 text-slate-300 transition-transform duration-300 ${
                                                          expandedControl ===
                                                          control.control_id
                                                            ? "rotate-90 text-indigo-500"
                                                            : ""
                                                        } dark:text-slate-600`}
                                                      />
                                                      <div>
                                                        <div className="flex items-center gap-2">
                                                          <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                                                            {control.control_id}
                                                          </span>
                                                          <h6 className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {control.name}
                                                          </h6>
                                                        </div>
                                                        <div className="mt-0.5 flex items-center gap-2 text-xs">
                                                          <span className="rounded bg-purple-50 px-1.5 py-0.5 font-semibold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                                                            {control.category}
                                                          </span>
                                                          <span className="capitalize text-slate-400 dark:text-white">
                                                            {
                                                              control.control_type
                                                            }
                                                          </span>
                                                          {control.evidence_count >
                                                            0 && (
                                                            <>
                                                              <span>•</span>
                                                              <span className="text-emerald-600 dark:text-emerald-400">
                                                                {
                                                                  control.evidence_count
                                                                }{" "}
                                                                Evidence
                                                              </span>
                                                            </>
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                      {/* {currentMenuAccessButton
                                                        ?.buttons?.[0]
                                                        ?.permission
                                                        ?.is_shown && (
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (
                                                              currentMenuAccessButton
                                                                ?.buttons?.[0]
                                                                ?.permission
                                                                ?.actions
                                                                ?.create
                                                            ) {
                                                              setFindingData({
                                                                framework_id:
                                                                  framework.framework_doc_id,
                                                                finding_type:
                                                                  "audit",
                                                                requirement_id:
                                                                  requirement.requirement_doc_id,
                                                                control_id:
                                                                  control.control_doc_ids,
                                                              });
                                                              setFindingOpen(
                                                                true,
                                                              );
                                                            } else {
                                                              toast.error(
                                                                "You do not have permission to perform this action.",
                                                              );
                                                            }
                                                          }}
                                                          className="w-fit text-nowrap rounded-full border border-tertiary px-3 py-1.5 text-xs font-medium text-tertiary duration-200 hover:bg-tertiary hover:text-white"
                                                        >
                                                          Add Finding
                                                        </button>
                                                      )} */}

                                                      {/* {control?.findings_count >
                                                        0 &&
                                                        currentMenuAccessButton
                                                          ?.buttons?.[1]
                                                          ?.permission
                                                          ?.is_shown && (
                                                          <button
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.preventDefault();
                                                              e.stopPropagation();
                                                              if (
                                                                currentMenuAccessButton
                                                                  ?.buttons?.[0]
                                                                  ?.permission
                                                                  ?.actions
                                                                  ?.read
                                                              ) {
                                                                setFindingData({
                                                                  framework_id:
                                                                    framework.framework_doc_id,
                                                                  finding_type:
                                                                    "audit",
                                                                  requirement_id:
                                                                    requirement.requirement_doc_id,
                                                                  control_id:
                                                                    control.control_doc_ids,
                                                                });
                                                                setDrawerOpen(
                                                                  true,
                                                                );
                                                              } else {
                                                                toast.error(
                                                                  "You do not have permission to perform this action.",
                                                                );
                                                              }
                                                            }}
                                                            className="w-fit text-nowrap rounded-full border border-tertiary px-3 py-1.5 text-xs font-medium text-tertiary duration-200 hover:bg-tertiary hover:text-white"
                                                          >
                                                            View Findings (
                                                            {
                                                              control?.findings_count
                                                            }
                                                            )
                                                          </button>
                                                        )} */}
                                                      {currentMenuAccessButton
                                                        ?.buttons?.[2]
                                                        ?.permission
                                                        ?.is_shown && (
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (
                                                              currentMenuAccessButton
                                                                ?.buttons?.[2]
                                                                ?.permission
                                                                ?.actions?.read
                                                            ) {
                                                              router.push(
                                                                `/audits/${id}/risk-control/${control?.control_id}?_name=${control?.name}`
                                                              );
                                                            } else {
                                                              toast.error(
                                                                "You do not have permission to perform this action."
                                                              );
                                                            }
                                                          }}
                                                          className="w-fit text-nowrap rounded-full border border-tertiary px-3 py-1.5 text-xs font-medium text-tertiary duration-200 hover:bg-tertiary hover:text-white"
                                                        >
                                                          Go to control
                                                        </button>
                                                      )}

                                                      <StatusBadge
                                                        status={
                                                          control.audit_status ||
                                                          "not_complete"
                                                        }
                                                      />
                                                      {control?.actual_status ===
                                                        "complete" &&
                                                        control?.audit_status !==
                                                          "complete" &&
                                                        currentMenuAccessButton
                                                          ?.buttons?.[3]
                                                          ?.permission
                                                          ?.is_shown && (
                                                          <div className="w-fit">
                                                            <CustomButton
                                                              loading={
                                                                selectedControl?.control_id ===
                                                                  control.control_id &&
                                                                isLoading
                                                              }
                                                              loadingText="Updating..."
                                                              onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setSelectedControl(
                                                                  control
                                                                );
                                                                handleUpdateControl(
                                                                  control
                                                                );
                                                              }}
                                                              disabled={
                                                                !currentMenuAccessButton
                                                                  ?.buttons?.[3]
                                                                  ?.permission
                                                                  ?.actions
                                                                  ?.update
                                                              }
                                                              className="w-fit !text-[0.7rem]"
                                                            >
                                                              Mark as complete
                                                            </CustomButton>
                                                          </div>
                                                        )}
                                                    </div>
                                                  </motion.div>

                                                  {expandedControl ===
                                                    control.control_id && (
                                                    <motion.div className="border-t border-slate-100 dark:border-neutral-900 dark:bg-darkSidebarBackground">
                                                      <div className="p-4">
                                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                          Description
                                                        </p>
                                                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                                          {control.description ||
                                                            "No description."}
                                                        </p>

                                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                                          <div className="rounded-lg bg-slate-50 p-3 dark:bg-darkMainBackground">
                                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                              Control
                                                              Implementation
                                                              Status
                                                            </p>
                                                            <p className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
                                                              {control.actual_status.replace(
                                                                "_",
                                                                " "
                                                              )}
                                                            </p>
                                                          </div>
                                                          <div className="rounded-lg bg-slate-50 p-3 dark:bg-darkMainBackground">
                                                            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                              Evidence Count
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                              {
                                                                control.evidence_count
                                                              }
                                                            </p>
                                                          </div>
                                                        </div>

                                                        <div className="mt-3">
                                                          <p className="text-xs text-slate-400 dark:text-slate-500">
                                                            Last Updated:{" "}
                                                            {formatDate(
                                                              control.last_updated
                                                            )}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </motion.div>
                                              ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}

            {filteredFrameworks.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
                <Search className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                  No Results Found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditDetails;
