"use client";
import CustomButton from "@/shared/core/CustomButton";
import useSwr from "@/shared/hooks/useSwr";
import { Drawer } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  X,
  XCircle
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import React, { useState } from "react";

// Types
interface MetricThreshold {
  min: number;
  max: number;
  better_high: boolean;
}

interface ControlDetailsInfo {
  doc_id?: string;
  control_name?: string;
  control_description?: string;
  name?: string;
  description?: string;
}

interface ControlDetails {
  risk_id: string;
  metric_name: string;
  metric_score: number;
  metric_threshold: MetricThreshold;
  risk_status: "low" | "medium" | "high" | "critical";
}

interface ControlResult {
  status: "pass" | "fail" | "error";
  message: string;
  details?: ControlDetails;
  evaluated_at: string;
  control_details?: ControlDetailsInfo;
  control_type?: "automated" | "manual";
}

interface Summary {
  total: number;
  passed: number;
  failed: number;
  errors: number;
}

interface TestResultData {
  result_id: string;
  test_id: string;
  outcome: "pass" | "fail" | "error";
  score: number;
  summary: Summary;
  control_results: Record<string, ControlResult>;
  timestamp: string;
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  resultId: string;
}

// Skeleton Loader
const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="animate-pulse space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 rounded-lg bg-gray-100 dark:bg-gray-700/50"></div>
          <div className="h-20 rounded-lg bg-gray-100 dark:bg-gray-700/50"></div>
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
          >
            <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-700/50"></div>
              <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-700/50"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Utility Functions
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "Invalid Date";
  }
};

const getRiskStatusColor = (status: string): string => {
  switch (status) {
    case "low":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "high":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "critical":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const getOutcomeIcon = (outcome: string) => {
  switch (outcome) {
    case "pass":
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    case "fail":
      return <XCircle className="h-6 w-6 text-red-500" />;
    case "error":
      return <AlertCircle className="h-6 w-6 text-orange-500" />;
    default:
      return <Activity className="h-6 w-6 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  const config = {
    pass: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      icon: CheckCircle2
    },
    fail: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      icon: XCircle
    },
    error: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-400",
      icon: AlertCircle
    }
  };

  const {
    bg,
    text,
    icon: Icon
  } = config[status as keyof typeof config] || config.error;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${bg} ${text}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="capitalize">{status}</span>
    </div>
  );
};

// Overall Test Reason
const OverallTestReason = ({ data }: { data: TestResultData }) => {
  //
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mt-6 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 shadow-sm dark:border-purple-800 dark:from-purple-900/40 dark:to-indigo-900/40"
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-400">
        <BarChart3 className="h-4 w-4" />
        Summary
      </div>
      <p className="text-sm font-normal leading-relaxed text-gray-800 dark:text-gray-300">
        This test execution reviewed all included controls. A total of{" "}
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
          {data.summary.total}
        </span>{" "}
        {data.summary.total === 1 ? "control was" : "controls were"} evaluated.
        Based on the results,{" "}
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
          {data.summary.failed + data.summary.errors}
        </span>{" "}
        {data.summary.failed + data.summary.errors === 1
          ? "control"
          : "controls"}{" "}
        did not pass the evaluation. For detailed information on each control
        evaluation, view the control details below.
      </p>
    </motion.div>
  );
};

// Main Component
const TestResultDrawer = ({ open, onClose, resultId }: DrawerProps) => {
  const router = useRouter();
  const { data, isValidating } = useSwr(
    open ? `tests/report?result_id=${resultId}` : null
  );
  const [openControlKey, setOpenControlKey] = useState<string | null>(null);

  const controlEntries = data?.control_results
    ? Object.entries(data.control_results)
    : [];

  const toggleControl = (key: string) => {
    setOpenControlKey((prev) => (prev === key ? null : key));
  };

  const handleViewControl = (docId?: string, controlName?: string) => {
    if (docId) {
      router.push(
        `/controls/${docId}?_name=${encodeURIComponent(controlName || "")}`
      );
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="relative flex h-screen w-full flex-col overflow-y-auto bg-gray-50 dark:bg-darkMainBackground sm:w-[32rem] lg:w-[42rem]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-tertiary-600 to-tertiary-600 px-5 py-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-white" />
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Test Result Details
            </h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            <X className="h-5 w-5 text-white" />
          </motion.button>
        </motion.div>

        {/* Content */}
        {isValidating ? (
          <SkeletonLoader />
        ) : (
          <div className="space-y-6 p-4 sm:p-6">
            {/* Test Outcome */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <Target className="h-5 w-5 text-indigo-600" />
                Test Outcome
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    {getOutcomeIcon(data?.outcome ?? "error")}
                  </div>
                  <p className="mt-2 text-2xl font-bold capitalize text-gray-900 dark:text-white">
                    {data?.outcome ?? "Unknown"}
                  </p>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Score
                    </span>
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {data?.score ?? 0}%
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 px-5 py-4 text-sm font-medium text-gray-700 shadow-sm">
                <Clock className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold text-gray-900">
                  Executed on:
                </span>
                <span>
                  {data?.timestamp ? formatDate(data.timestamp) : "N/A"}
                </span>
              </div>

              {data && <OverallTestReason data={data} />}
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800"
            >
              <h3 className="mb-4 flex items-start gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <Activity className="mt-2 h-5 w-5 text-indigo-600" />
                <div>
                  <h2 className="text-2xl font-bold">Test Execution Summary</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Comprehensive overview of control evaluations
                  </p>
                </div>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-700/50">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {data?.summary?.total ?? 0}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Passed
                  </p>
                  <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-400">
                    {data?.summary?.passed ?? 0}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Failed
                  </p>
                  <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-400">
                    {data?.summary?.failed ?? 0}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Control Results - Accordion Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <Shield className="h-5 w-5 text-indigo-600" />
                Control Results
              </h3>

              <div className="space-y-3">
                {controlEntries.length > 0 ? (
                  controlEntries.map(([key, results]) => {
                    const isOpen = openControlKey === key;
                    const result = results as ControlResult;
                    // const controlName =
                    //   result.control_details?.control_name ||
                    //   result.control_details?.name ||
                    //   "Unnamed Control";

                    return (
                      <div
                        key={key}
                        className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50"
                      >
                        {/* Collapsible Header */}
                        <div className="flex w-full flex-col p-5 text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-700">
                          {/* Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {getStatusBadge(result.status)}
                              {result.control_type === "automated" &&
                                result.details?.risk_status && (
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getRiskStatusColor(result.details.risk_status)}`}
                                  >
                                    Risk Level: {result.details.risk_status}{" "}
                                    Risk
                                  </span>
                                )}
                            </div>
                            <div className="w-fit">
                              <CustomButton
                                onClick={() =>
                                  handleViewControl(
                                    result.control_details?.doc_id,
                                    result.control_details?.control_name ||
                                      result.control_details?.name
                                  )
                                }
                                className="!text-[0.7rem]"
                                endIcon={<ExternalLink className="h-4 w-4" />}
                              >
                                View Control
                              </CustomButton>
                            </div>
                          </div>

                          {/* Control Info */}
                          {result.control_details && (
                            <div className="mb-4 space-y-3 rounded-lg bg-white p-4 dark:bg-gray-800">
                              <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  Control Name:
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                  {result.control_details.control_name ||
                                    result.control_details.name ||
                                    "N/A"}
                                </p>
                              </div>
                              {result.control_details.control_description ||
                              result.control_details.description ? (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Description:
                                  </p>
                                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                    {result.control_details
                                      .control_description ||
                                      result.control_details.description}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          )}
                          <button
                            onClick={() => toggleControl(key)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gradient-to-r from-indigo-50 to-tertiary-50 px-5 py-3 text-sm font-medium text-gray-700 transition-all hover:shadow-md dark:border-gray-600 dark:from-indigo-900/40 dark:to-tertiary-900/40 dark:text-gray-300"
                          >
                            {isOpen ? "Hide" : "Show"} Details
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>

                        {/* Collapsible Content */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="border-t border-gray-200 dark:border-gray-700"
                            >
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-5 p-5"
                              >
                                {/* Metric Details (Automated Only) */}
                                {result?.control_type === "automated" &&
                                  result?.details?.metric_name && (
                                    <div className="space-y-3 rounded-lg bg-white p-4 dark:bg-gray-800">
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                          Metric
                                        </span>
                                        <span className="font-medium">
                                          {result?.details?.metric_name}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                          Score
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg font-bold">
                                            {(
                                              result?.details?.metric_score *
                                              100
                                            ).toFixed(1)}
                                            %
                                          </span>
                                          {result?.details?.metric_threshold
                                            ?.better_high ? (
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                          Acceptable Range
                                        </span>
                                        <span className="font-medium">
                                          {(
                                            result?.details?.metric_threshold
                                              ?.min * 100
                                          ).toFixed(0)}
                                          % -{" "}
                                          {(
                                            result?.details?.metric_threshold
                                              ?.max * 100
                                          ).toFixed(0)}
                                          %
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                {/* Reason */}
                                {result?.control_type === "automated" &&
                                  result?.details?.metric_name && (
                                    <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-5 dark:border-purple-800 dark:from-purple-900/40 dark:to-indigo-900/40">
                                      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-400">
                                        <BarChart3 className="h-4 w-4" />
                                        Reason
                                      </div>
                                      <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-300">
                                        This control{" "}
                                        <strong className="text-indigo-600 dark:text-indigo-400">
                                          {result?.status === "pass"
                                            ? "passed"
                                            : "failed"}
                                        </strong>{" "}
                                        because its actual performance of{" "}
                                        <strong className="text-indigo-600 dark:text-indigo-400">
                                          {(
                                            result?.details?.metric_score * 100
                                          )?.toFixed(1)}
                                          %
                                        </strong>{" "}
                                        {result?.status === "pass"
                                          ? "met"
                                          : "did not meet"}{" "}
                                        the required range of{" "}
                                        <strong>
                                          {(
                                            result?.details.metric_threshold
                                              ?.min * 100
                                          ).toFixed(0)}
                                          % -{" "}
                                          {(
                                            result?.details?.metric_threshold
                                              ?.max * 100
                                          ).toFixed(0)}
                                          %
                                        </strong>
                                        .
                                      </p>
                                    </div>
                                  )}

                                {/* Original Message */}
                                {result?.message && (
                                  <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-5">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-700">
                                      <AlertCircle className="h-4 w-4" />
                                      Control Test Result
                                    </div>
                                    <p className="text-sm text-gray-800 dark:text-gray-300">
                                      {result?.message}
                                    </p>
                                  </div>
                                )}
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      No control results available
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default TestResultDrawer;
