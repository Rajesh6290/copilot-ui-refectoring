"use client";
import CustomButton from "@/shared/core/CustomButton";
import useSwr from "@/shared/hooks/useSwr";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ChevronDown,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Shield,
  X,
  XCircle
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface MetricThreshold {
  min?: number;
  max?: number;
  better_high?: boolean;
}

interface OldControlDetails {
  risk_id?: string;
  metric_name?: string;
  metric_score?: number;
  metric_threshold?: MetricThreshold;
  risk_status?: string;
}

interface NewControlDetails {
  name?: string;
  description?: string;
  doc_id?: string;
}

interface ControlResult {
  control_details?: NewControlDetails;
  status?: "pass" | "fail" | "error";
  message?: string;
  details?: OldControlDetails | Record<string, unknown>;
}

interface TestRunResultProps {
  status: string;
  lastRunDate?: string;
  testId: string;
  type?: string;
}

// Logic Constants
const INTERVAL_PENDING = 30; // 30 Seconds
const INTERVAL_COMPLETE = 300; // 5 Minutes (300 seconds)

const SkeletonLine: React.FC<{ w?: string; h?: string }> = ({
  w = "100%",
  h = "h-5"
}) => (
  <div
    className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${w} ${h}`}
  />
);

const SkeletonCard = () => (
  <div className="space-y-8">
    <div className="rounded-xl border-2 border-gray-200 p-6 shadow-lg">
      <div className="flex items-center gap-5">
        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-3">
          <SkeletonLine h="h-8" w="w-48" />
          <SkeletonLine h="h-4" w="w-64" />
        </div>
        <div className="space-y-2 text-right">
          <SkeletonLine h="h-12" w="w-24" />
          <SkeletonLine h="h-4" w="w-32" />
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-3">
          <SkeletonLine h="h-8" w="w-64" />
          <SkeletonLine h="h-5" w="w-96" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <SkeletonLine h="h-12" w="w-20" />
            </div>
            <SkeletonLine h="h-5" w="w-32" />
          </div>
        ))}
      </div>
    </div>

    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md"
      >
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div className="space-y-3">
            <SkeletonLine h="h-4" w="w-32" />
            <SkeletonLine h="h-7" w="w-80" />
            <SkeletonLine h="h-5" w="w-full" />
          </div>
          <SkeletonLine h="h-10" w="w-32" />
        </div>
      </div>
    ))}
  </div>
);

const TestRunResult: React.FC<TestRunResultProps> = ({
  status,
  testId,
  lastRunDate,
  type
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [expandedControl, setExpandedControl] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  // NEW: Filter State
  const [filter, setFilter] = useState<"all" | "pass" | "fail">("all");

  // Logic: Timer State
  const [secondsLeft, setSecondsLeft] = useState(INTERVAL_PENDING);

  // Logic: Draft Mode Check (Prevent API calls if draft)
  const isDraftMode = status === "draft" && !lastRunDate;
  // Logic: Should we be fetching? (Active status)
  const shouldFetch = !isDraftMode && status === "active";

  // Logic: API Call 1 - Get Latest Result ID
  const {
    data: latestResultData,
    isLoading: latestLoading,
    mutate: mutateLatest
  } = useSwr(shouldFetch ? `tests/latest_result?test_id=${testId}` : null, {
    refreshInterval: 0, // We control polling manually
    revalidateOnFocus: false
  });

  const latestResultId = latestResultData?.latest_result_id;

  // Logic: API Call 2 - Get Report Data (Only if ID exists)
  const {
    data: resultData,
    isLoading: reportLoading,
    mutate: mutateReport
  } = useSwr(
    latestResultId ? `tests/report?result_id=${latestResultId}` : null,
    {
      keepPreviousData: true,
      refreshInterval: 0, // We control polling manually
      revalidateOnFocus: false
    }
  );

  const isPending =
    resultData?.status === "pending" || resultData?.outcome === "pending";

  // Logic: Determine current target interval
  const targetInterval =
    latestResultId && resultData && !isPending
      ? INTERVAL_COMPLETE
      : INTERVAL_PENDING;

  // Logic: Immediate Interval Update
  useEffect(() => {
    setSecondsLeft(targetInterval);
  }, [targetInterval]);
  // Manual Sync Function
  const syncNow = useCallback(async () => {
    if (isSyncing) {
      return;
    }
    setIsSyncing(true);
    try {
      mutateLatest();
      if (latestResultId) {
        await mutateReport();
      }
      setSecondsLeft(targetInterval); // Reset timer after sync
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "An error occurred during sync."
      );
    } finally {
      setIsSyncing(false);
    }
  }, [mutateLatest, mutateReport, isSyncing, targetInterval]);

  // Logic: Countdown Timer
  useEffect(() => {
    if (!shouldFetch) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          syncNow();
          return targetInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shouldFetch, targetInterval]);

  // Update URL
  useEffect(() => {
    if (latestResultId && !latestLoading && !reportLoading) {
      const currentParam = searchParams.get("resultId");
      if (currentParam !== latestResultId) {
        router.replace(`?resultId=${latestResultId}`, { scroll: false });
      }
    }
  }, [latestResultId, latestLoading, reportLoading, router, searchParams]);

  const toggleControl = useCallback((id: string) => {
    setExpandedControl((prev) => (prev === id ? null : id));
  }, []);

  const getNextSyncText = () => {
    if (isSyncing) {
      return "Syncing now...";
    }
    if (secondsLeft < 60) {
      return `Next sync in ${secondsLeft}s`;
    }
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `Next sync in ${mins}m ${secs}s`;
  };
  // 4. MAIN RESULT UI (DATA EXISTS)
  const getOutcomeConfig = (outcome?: string) => {
    switch (outcome) {
      case "pass":
        return {
          icon: (
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          ),
          text: (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Test Result Outcome
              </p>
              <p className="text-2xl font-bold">Passed</p>
            </div>
          ),
          bgColor: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",
          darkBg:
            "dark:bg-gradient-to-br dark:from-green-900/30 dark:via-emerald-900/20 dark:to-teal-900/20",
          borderColor: "border-green-200",
          darkBorder: "dark:border-green-800",
          textColor: "text-green-900",
          darkTextColor: "dark:text-green-300"
        };
      case "fail":
        return {
          icon: <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />,
          text: (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Test Result Outcome
              </p>
              <p className="text-2xl font-bold">Failed</p>
            </div>
          ),
          bgColor: "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50",
          darkBg:
            "dark:bg-gradient-to-br dark:from-red-900/30 dark:via-rose-900/20 dark:to-pink-900/20",
          borderColor: "border-red-200",
          darkBorder: "dark:border-red-800",
          textColor: "text-red-900",
          darkTextColor: "dark:text-red-300"
        };
      case "error":
        return {
          icon: (
            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          ),
          text: (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Test Result Outcome
              </p>
              <p className="text-2xl font-bold">Error</p>
            </div>
          ),
          bgColor: "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
          darkBg:
            "dark:bg-gradient-to-br dark:from-amber-900/30 dark:via-orange-900/20 dark:to-yellow-900/20",
          borderColor: "border-amber-200",
          darkBorder: "dark:border-amber-800",
          textColor: "text-amber-900",
          darkTextColor: "dark:text-amber-300"
        };
      case "pending":
        return {
          icon: (
            <Loader2 className="h-8 w-8 animate-spin text-tertiary-600 dark:text-tertiary-400" />
          ),
          text: (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-tertiary-700 dark:text-tertiary-300">
                Test Result Outcome
              </p>
              <p className="text-2xl font-bold">Pending</p>
            </div>
          ),
          bgColor:
            "bg-gradient-to-br from-tertiary-50 via-tertiary-50 to-purple-50",
          darkBg:
            "dark:bg-gradient-to-br dark:from-tertiary-900/30 dark:via-tertiary-900/20 dark:to-purple-900/20",
          borderColor: "border-tertiary-200",
          darkBorder: "dark:border-tertiary-800",
          textColor: "text-tertiary-900",
          darkTextColor: "dark:text-tertiary-300"
        };
      default:
        return {
          icon: (
            <AlertCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          ),
          text: (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Test Result Outcome
              </p>
              <p className="text-2xl font-bold">Unknown</p>
            </div>
          ),
          bgColor: "bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50",
          darkBg:
            "dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-black",
          borderColor: "border-gray-200",
          darkBorder: "dark:border-gray-700",
          textColor: "text-gray-900",
          darkTextColor: "dark:text-gray-300"
        };
    }
  };

  const getStatusBadge = (s?: string) => {
    switch (s) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm ring-1 ring-green-600/20 dark:bg-green-900/40 dark:text-green-300 dark:ring-green-700/30">
            <CheckCircle className="h-3.5 w-3.5" />
            Passed
          </span>
        );
      case "fail":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-600/20 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-700/30">
            <XCircle className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm ring-1 ring-amber-600/20 dark:bg-amber-900/40 dark:text-amber-300 dark:ring-amber-700/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Unknown
          </span>
        );
    }
  };

  const getRiskBadge = (s?: string) => {
    if (!s) {
      return null;
    }
    const r = s.toLowerCase();
    if (r === "low") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/10 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400" />
          Low Risk
        </span>
      );
    }
    if (r === "med" || r === "medium") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-600/10 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
          Medium Risk
        </span>
      );
    }
    if (r === "high") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-red-400" />
          High Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
        {s}
      </span>
    );
  };

  const formatDate = (ts?: string) =>
    ts
      ? new Date(ts).toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "Unknown Date";
  const formatMetricName = (name?: string) =>
    name
      ? name
          .replace(/Metric$/, "")
          .replace(/([A-Z])/g, " $1")
          .trim()
      : "Unknown Metric";
  const handleViewControl = (docId?: string, name?: string) =>
    docId && router.push(`/compliance/controls/${docId}?_name=${name}`);

  const outcomeConfig = getOutcomeConfig(resultData?.outcome);
  const score = resultData?.score ?? 0;
  const summary = resultData?.summary ?? {};
  const timestamp = resultData?.timestamp;
  const controlResults = useMemo(() => {
    return (resultData?.control_results ?? {}) as Record<string, ControlResult>;
  }, [resultData?.control_results]);
  const totalControls = summary?.total ?? 0;
  const passedControls = summary?.passed ?? 0;
  const failedControls = summary?.failed ?? 0;

  // Filter Logic using useMemo
  const filteredControls = useMemo(() => {
    const entries = Object.entries(controlResults);
    if (filter === "all") {
      return entries;
    }
    return entries.filter(([_, control]) => control.status === filter);
  }, [controlResults, filter]);

  // --- RENDER LOGIC ORDER ---

  // 1. DRAFT MODE
  if (isDraftMode) {
    return (
      <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-10 shadow-lg dark:border-amber-800 dark:from-amber-900/40 dark:to-yellow-900/40">
        <div className="flex items-start gap-5">
          <AlertTriangle className="h-12 w-12 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-300">
              Test is in Draft Mode
            </h3>
            <p className="mt-3 text-lg leading-relaxed text-amber-800 dark:text-amber-200">
              The test is currently in draft. Please send the required metrics
              and then proceed to activate the test.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOADING (SKELETON)
  if ((latestLoading || reportLoading) && !resultData) {
    return (
      <div className="relative">
        <div className="absolute right-4 top-4 z-10">
          <button
            disabled
            className="flex items-center gap-2 rounded-lg bg-tertiary-600 px-4 py-2 text-sm font-medium text-white opacity-50 shadow-lg"
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading...
          </button>
        </div>
        <SkeletonCard />
      </div>
    );
  }

  // 3. IN PROGRESS (NO DATA YET)
  if (shouldFetch && (!latestResultId || !resultData)) {
    return (
      <div className="rounded-xl border-2 border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-50 p-10 shadow-lg dark:border-tertiary-800 dark:from-tertiary-900/40 dark:to-tertiary-900/40">
        <div className="flex items-start gap-5">
          <Loader2 className="h-12 w-12 flex-shrink-0 animate-spin text-tertiary-600 dark:text-tertiary-400" />
          <div className="w-full">
            <h3 className="text-2xl font-bold text-tertiary-900 dark:text-tertiary-300">
              Test Execution in Progress
            </h3>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-lg leading-relaxed text-tertiary-800 dark:text-tertiary-200">
                Your test is currently being processed. Results will appear
                automatically once execution completes.
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-white/50 px-3 py-1 text-sm font-semibold text-tertiary-700 dark:bg-black/20 dark:text-tertiary-300">
                <RefreshCw
                  className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                />
                {getNextSyncText()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-fit space-y-8 text-gray-900 dark:text-gray-100">
      {/* Sync Controls */}
      <div className="flex items-center justify-between rounded-lg border border-tertiary-200 bg-gradient-to-r from-tertiary-50 to-tertiary-50 px-6 py-4 shadow-md dark:border-tertiary-800 dark:from-tertiary-900/40 dark:to-tertiary-900/40">
        <div className="flex items-center gap-3">
          <RefreshCw
            className={`h-5 w-5 text-tertiary-600 dark:text-tertiary-400 ${isSyncing ? "animate-spin" : ""}`}
          />
          <div>
            <p className="text-sm font-semibold text-tertiary-900 dark:text-tertiary-200">
              Auto-sync enabled
            </p>
            <p className="text-xs text-tertiary-700 dark:text-tertiary-300">
              {getNextSyncText()}
            </p>
          </div>
        </div>
        <button
          onClick={syncNow}
          disabled={isSyncing}
          className="flex items-center gap-2 rounded-lg bg-tertiary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-tertiary-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Latest Data"}
        </button>
      </div>

      {/* Pending State Banner */}
      {isPending && (
        <div className="rounded-xl border-2 border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-50 p-6 shadow-lg dark:border-tertiary-800 dark:from-tertiary-900/40 dark:to-tertiary-900/40">
          <div className="flex items-start gap-5">
            <Loader2 className="h-10 w-10 flex-shrink-0 animate-spin text-tertiary-600 dark:text-tertiary-400" />
            <div>
              <h3 className="text-xl font-bold text-tertiary-900 dark:text-tertiary-300">
                Test Execution in Progress
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-tertiary-800 dark:text-tertiary-200">
                Your test is currently being processed. Results will appear
                automatically once execution completes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Banner */}
      <div
        className={`${outcomeConfig.bgColor} ${outcomeConfig.darkBg} ${outcomeConfig.borderColor} ${outcomeConfig.darkBorder} rounded-xl border-2 p-6 shadow-lg`}
      >
        <div className="flex items-center gap-5">
          {outcomeConfig.icon}
          <div className="flex-1">
            <div
              className={`text-2xl font-bold ${outcomeConfig.textColor} ${outcomeConfig.darkTextColor}`}
            >
              {outcomeConfig.text}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {isPending
                ? "Test execution is in progress..."
                : "Quality control validation completed"}
            </p>
          </div>
          {!isPending && (
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {(score * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Controls Passed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl ring-1 ring-gray-900/5 dark:border-neutral-800 dark:bg-darkSidebarBackground dark:ring-0">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-tertiary-100 to-tertiary-200 p-3 shadow-md dark:from-tertiary-900/50 dark:to-tertiary-800/50">
            <BarChart3 className="h-6 w-6 text-tertiary-700 dark:text-tertiary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Test Execution Summary</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comprehensive overview of control evaluations
            </p>
          </div>
        </div>

        {/* CLICKABLE SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <button
            onClick={() => setFilter("all")}
            className={`relative rounded-2xl border-2 bg-gradient-to-br from-gray-50 to-slate-100 p-6 shadow-md transition-all hover:scale-105 hover:shadow-xl dark:from-gray-800 dark:to-gray-900 ${
              filter === "all"
                ? "border-tertiary-400 ring-2 ring-tertiary-400 ring-offset-2 dark:border-tertiary-600 dark:ring-offset-black"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <BarChart3 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {totalControls}
              </div>
            </div>
            <p className="mt-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
              Total Controls
            </p>
          </button>

          <button
            onClick={() => setFilter("pass")}
            className={`relative rounded-2xl border-2 bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-md transition-all hover:scale-105 hover:shadow-xl dark:from-green-900/30 dark:to-emerald-900/30 ${
              filter === "pass"
                ? "border-green-500 ring-2 ring-green-500 ring-offset-2 dark:border-green-600 dark:ring-offset-black"
                : "border-green-200 dark:border-green-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="text-4xl font-bold text-green-700 dark:text-green-400">
                {passedControls}
              </div>
            </div>
            <p className="mt-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
              Passed Controls
            </p>
          </button>

          <button
            onClick={() => setFilter("fail")}
            className={`relative rounded-2xl border-2 bg-gradient-to-br from-red-50 to-rose-100 p-6 shadow-md transition-all hover:scale-105 hover:shadow-xl dark:from-red-900/30 dark:to-rose-900/30 ${
              filter === "fail"
                ? "border-red-500 ring-2 ring-red-500 ring-offset-2 dark:border-red-600 dark:ring-offset-black"
                : "border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              <div className="text-4xl font-bold text-red-700 dark:text-red-400">
                {failedControls}
              </div>
            </div>
            <p className="mt-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
              Failed Controls
            </p>
          </button>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-tertiary-200 bg-gradient-to-r from-tertiary-50 to-tertiary-50 px-6 py-4 text-sm font-medium shadow-sm dark:border-tertiary-800 dark:from-tertiary-900/40 dark:to-tertiary-900/40">
          <Clock className="h-5 w-5 text-tertiary-600 dark:text-tertiary-400" />
          <span className="font-semibold">Executed on:</span>
          <span className="text-gray-700 dark:text-gray-300">
            {formatDate(timestamp)}
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-tertiary-50 px-6 py-4 shadow-sm dark:border-purple-800 dark:from-purple-900/40 dark:to-tertiary-900/40">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />

            <div className="text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-300">
              <span className="font-semibold text-purple-700 dark:text-purple-400">
                Summary:
              </span>{" "}
              This test execution reviewed all included controls. A total of{" "}
              {totalControls}{" "}
              {totalControls === 1 ? "control was" : "controls were"} evaluated.
              Based on the results,{" "}
              <span className="font-semibold text-green-700 dark:text-green-400">
                {passedControls}
              </span>{" "}
              {passedControls === 1 ? "control" : "controls"} passed the
              evaluation
              {failedControls > 0 && (
                <>
                  {" "}
                  and{" "}
                  <span className="font-semibold text-red-700 dark:text-red-400">
                    {failedControls}
                  </span>{" "}
                  {failedControls === 1 ? "control" : "controls"} did not pass
                  the evaluation
                </>
              )}
              . For detailed information on each control evaluation, view the
              control details below.
            </div>
          </div>
        </div>

        {/* Control Details Section */}
        <div className="mt-10">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-100 to-tertiary-200 p-3 shadow-md dark:from-purple-900/40 dark:to-tertiary-900/40">
                <Shield className="h-6 w-6 text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Control Details</h2>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {filteredControls.length} controls{" "}
                  {filter !== "all" && `(${filter})`}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {filter !== "all" && (
                <CustomButton
                  onClick={() => setFilter("all")}
                  startIcon={<X className="h-4 w-4" />}
                  className="!h-9 !px-3 !text-xs"
                >
                  Clear Filter
                </CustomButton>
              )}
              {type !== "predefined" && (
                <div className="group relative">
                  <div className="flex h-8 w-8 cursor-help items-center justify-center rounded-full bg-gradient-to-br from-tertiary-100 to-purple-100 transition-all hover:from-tertiary-200 hover:to-purple-200 dark:from-tertiary-900/50 dark:to-purple-900/50 dark:hover:from-tertiary-800/50 dark:hover:to-purple-800/50">
                    <AlertCircle className="h-4 w-4 text-tertiary-600 dark:text-tertiary-400" />
                  </div>
                  <div className="pointer-events-none absolute right-0 top-10 z-50 w-80 scale-95 rounded-xl border border-gray-200 bg-white p-4 opacity-0 shadow-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-800">
                    <div className="space-y-3">
                      <div>
                        <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-tertiary-600 dark:text-tertiary-400">
                          <BarChart3 className="h-4 w-4" />
                          Metric Score
                        </h4>
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                          {
                            "It's a numerical measure that tells you exactly how well the AI application performed on a specific metric."
                          }
                        </p>
                      </div>
                      <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                        <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
                          <Shield className="h-4 w-4" />
                          Acceptable Range
                        </h4>
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                          {
                            'This is the minimum standard or the "passing grade" required for the AI application to be considered reliable for the metric.'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="absolute -top-2 right-4 h-4 w-4 rotate-45 border-l border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {filteredControls.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-16 text-center dark:border-gray-700 dark:bg-darkMainBackground">
              <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600" />
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                {isPending
                  ? "Controls are being evaluated..."
                  : "No controls matching the current filter"}
              </p>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="mt-2 text-sm text-tertiary-600 hover:underline dark:text-tertiary-400"
                >
                  Clear filter to view all
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredControls.map(
                ([controlId, control]: [string, ControlResult]) => {
                  const hasMetricScore =
                    control?.details &&
                    typeof control.details === "object" &&
                    "metric_score" in control.details;
                  const controlName =
                    control?.control_details?.name ||
                    formatMetricName(
                      (control?.details as OldControlDetails)?.metric_name
                    ) ||
                    "Unnamed Control";
                  const metricScore = hasMetricScore
                    ? ((control?.details as OldControlDetails)?.metric_score ??
                      0)
                    : null;
                  const minThreshold = hasMetricScore
                    ? ((control?.details as OldControlDetails)?.metric_threshold
                        ?.min ?? 0)
                    : null;
                  const maxThreshold = hasMetricScore
                    ? ((control?.details as OldControlDetails)?.metric_threshold
                        ?.max ?? 0)
                    : null;
                  const riskStatus = hasMetricScore
                    ? (control?.details as OldControlDetails)?.risk_status
                    : null;
                  const isExpanded = expandedControl === controlId;

                  // --- COMPACT CARD DESIGN (Same visuals, optimized layout) ---
                  return (
                    <div
                      key={controlId}
                      className={`overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-white to-gray-50/50 shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 dark:from-gray-800 dark:to-gray-900 ${
                        isExpanded
                          ? "border-tertiary-300 ring-1 ring-tertiary-300 dark:border-tertiary-700"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      {/* Click header to toggle */}
                      <div
                        tabIndex={0}
                        role="button"
                        onClick={() => toggleControl(controlId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            toggleControl(controlId);
                          }
                        }}
                        className="cursor-pointer p-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                  control?.status === "pass"
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                                    : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                                }`}
                              >
                                {control?.status === "pass" ? (
                                  <CheckCircle className="h-6 w-6" />
                                ) : (
                                  <XCircle className="h-6 w-6" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {controlName}
                                  </h3>
                                  {getStatusBadge(control?.status)}
                                </div>
                              </div>
                            </div>
                            {/* Reason Box (Moved Inside) */}
                            {hasMetricScore && metricScore !== null && (
                              <div className="mb-6 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-tertiary-50 p-5 shadow-sm dark:border-purple-800 dark:from-purple-900/40 dark:to-tertiary-900/40">
                                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-400">
                                  <BarChart3 className="h-4 w-4" />
                                  Reason
                                </div>
                                <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-300">
                                  This control{" "}
                                  {control?.status === "pass"
                                    ? "passed"
                                    : "failed"}{" "}
                                  the test because its Metric Score (Actual
                                  Performance) of{" "}
                                  <span className="font-semibold text-tertiary-600 dark:text-tertiary-400">
                                    {(metricScore * 100).toFixed(1)}%
                                  </span>{" "}
                                  {control?.status === "pass"
                                    ? "fell within"
                                    : "fell outside"}{" "}
                                  the Acceptable Range (Required Performance) of{" "}
                                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                                    {minThreshold !== null
                                      ? (minThreshold * 100).toFixed(0)
                                      : "N/A"}
                                    % -{" "}
                                    {maxThreshold !== null
                                      ? (maxThreshold * 100).toFixed(0)
                                      : "N/A"}
                                    %
                                  </span>
                                  .
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Show small metric score preview in collapsed state if available */}
                            {!isExpanded &&
                              hasMetricScore &&
                              metricScore !== null && (
                                <div className="hidden items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-800 sm:flex">
                                  <span className="text-xs font-semibold text-gray-500">
                                    Score:
                                  </span>
                                  <span
                                    className={`font-bold ${
                                      control?.status === "pass"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {(metricScore * 100).toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            <ChevronDown
                              className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content (Details, Reason, Metrics) */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          isExpanded
                            ? "max-h-[2000px] border-t border-gray-100 opacity-100 dark:border-gray-700"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="p-6">
                          {/* Control Description & View Button */}
                          <div className="mb-6 flex items-start justify-between gap-4">
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                              {control?.control_details?.description ||
                                "No description provided for this control."}
                            </p>
                            {control?.control_details?.doc_id && (
                              <div className="w-fit">
                                <CustomButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewControl(
                                      control.control_details?.doc_id,
                                      control.control_details?.name
                                    );
                                  }}
                                  className="shrink-0 !text-xs"
                                  endIcon={<ExternalLink className="h-4 w-4" />}
                                >
                                  View Control
                                </CustomButton>
                              </div>
                            )}
                          </div>

                          {/* Metric Evaluation Grid */}
                          {hasMetricScore && metricScore !== null && (
                            <div className="mb-6">
                              <p className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Metric Evaluation
                              </p>
                              <div className="grid grid-cols-1 gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-inner dark:border-gray-700 dark:bg-gray-800/70 md:grid-cols-4">
                                <div className="text-center">
                                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Metric
                                  </div>
                                  <div className="text-lg font-bold text-tertiary-600 dark:text-tertiary-400">
                                    {formatMetricName(
                                      (control?.details as OldControlDetails)
                                        ?.metric_name
                                    )}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Score
                                  </div>
                                  <div className="text-3xl font-bold text-tertiary-600 dark:text-tertiary-400">
                                    {(metricScore * 100).toFixed(1)}%
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Range
                                  </div>
                                  <div className="text-lg font-bold text-gray-900 dark:text-gray-200">
                                    {minThreshold !== null
                                      ? (minThreshold * 100).toFixed(0)
                                      : "N/A"}
                                    % -{" "}
                                    {maxThreshold !== null
                                      ? (maxThreshold * 100).toFixed(0)
                                      : "N/A"}
                                    %
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Risk
                                  </div>
                                  <div className="mt-3">
                                    {getRiskBadge(riskStatus ?? undefined)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {control?.message && (
                            <div className="rounded-xl border-2 border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-50 p-5 shadow-sm dark:border-tertiary-800 dark:from-tertiary-900/40 dark:to-tertiary-900/40">
                              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-tertiary-700 dark:text-tertiary-400">
                                <AlertCircle className="h-4 w-4" />
                                Control Test Result
                              </div>
                              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-300">
                                {control.message}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRunResult;
