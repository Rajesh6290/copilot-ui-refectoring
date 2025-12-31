"use client";
import useSwr from "@/shared/hooks/useSwr";
import { useCurrentMenuItem } from "@/shared/utils";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  XCircle
} from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import FrameworkCard from "./FrameworkCard";
import Header from "./Header";
import States from "./States";
const AddNewFinding = dynamic(() => import("../findings/AddNewFinding"), {
  ssr: false
});
const FindingDrawerView = dynamic(
  () => import("../findings/FindingDrawerView"),
  {
    ssr: false
  }
);
export interface Control {
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

export interface Requirement {
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

export interface Framework {
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

export interface IsAccess {
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
// Status Badge Component
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
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
export const FrameworkStatusBadge: React.FC<{ status: string }> = ({
  status
}) => {
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

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

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
        <Header data={data} startDate={startDate} endDate={endDate} />
        <div className="h-fit w-full space-y-6">
          {/* Timeline & Progress Overview */}
          <States data={data} startDate={startDate} endDate={endDate} />

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
              <FrameworkCard
                key={framework?.framework_id}
                framework={framework}
                currentMenuAccessButton={
                  currentMenuAccessButton as IsAccess | null
                }
                setFindingData={setFindingData}
                setFindingOpen={setFindingOpen}
                setDrawerOpen={setDrawerOpen}
                id={id as string}
                mutate={mutate}
              />
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
