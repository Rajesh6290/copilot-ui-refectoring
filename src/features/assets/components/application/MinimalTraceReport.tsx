"use client";
import { ApiData } from "@/features/risk-management/components/responsible-ai-report/ResposibleAiReport";
import useSwr from "@/shared/hooks/useSwr";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Building,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Layers,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  XCircle,
  Zap
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import React from "react";
interface FailedItem {
  framework: string;
  [key: string]: unknown;
}

interface TopFramework {
  framework: string;
  high?: number;
  med?: number;
  low?: number;
}
const isValidApiData = (data: ApiData): data is ApiData => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.health_index === "number" &&
    Array.isArray(data.pillar_metrics)
  );
};

// Animation Variants for smooth entry
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 15 }
  }
};

interface MinimalTraceReportProps {
  onViewFullReport?: () => void;
}

const MinimalTraceReport: React.FC<MinimalTraceReportProps> = () => {
  const router = useRouter();
  const { data, isValidating } = useSwr("responsible-ai/report");

  // Enhanced loading state with skeleton
  if (isValidating && !data) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-100 p-8 dark:border-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30">
          <div className="animate-pulse">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-200 dark:bg-blue-700"></div>
                <div>
                  <div className="mb-2 h-6 w-48 rounded bg-blue-200 dark:bg-blue-700"></div>
                  <div className="h-4 w-32 rounded bg-blue-100 dark:bg-blue-800"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-lg bg-white/50 p-4 dark:bg-gray-800/50"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Sections Skeleton */}
        {[...Array(3)].map((_, sectionIndex) => (
          <div
            key={sectionIndex}
            className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  // No data state
  if (!data || !isValidApiData(data)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-gray-200 bg-white p-12 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 p-6 dark:bg-gray-700">
            <Shield className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
            No Trace Report Available
          </h3>
          <p className="mx-auto max-w-md text-gray-500 dark:text-gray-400">
            Responsible AI report not found for this application. Please ensure
            the application has been analyzed.
          </p>
        </div>
      </motion.div>
    );
  }

  // Helper functions for data calculations
  const getPerformanceData = () => {
    const sortedPillars = [...data.pillar_metrics].sort(
      (a, b) => b.score - a.score
    );
    const avgScore =
      data.pillar_metrics.reduce((sum, pillar) => sum + pillar.score, 0) /
      data.pillar_metrics.length;
    const totalMetrics = data.pillar_metrics.reduce(
      (sum, pillar) => sum + pillar.metrics_count,
      0
    );

    const excellentPillars = data.pillar_metrics.filter(
      (p) => p.score >= 80
    ).length;
    const goodPillars = data.pillar_metrics.filter(
      (p) => p.score >= 60 && p.score < 80
    ).length;
    const criticalPillars = data.pillar_metrics.filter(
      (p) => p.score < 60
    ).length;
    const areasForImprovement = sortedPillars.slice(-2).reverse();
    const metricQuality = data.pillar_metrics.every((p) => p.metrics_count > 0)
      ? "high"
      : data.pillar_metrics.some((p) => p.metrics_count > 5)
        ? "medium"
        : "low";

    return {
      healthIndex: data.health_index,
      avgScore: Math.round(avgScore),
      topPillars: sortedPillars.slice(0, 3),
      areasForImprovement,
      totalPillars: data.pillar_metrics.length,
      totalMetrics,
      excellentPillars,
      goodPillars,
      criticalPillars,
      metricQuality,
      status:
        data.health_index >= 80
          ? "excellent"
          : data.health_index >= 60
            ? "good"
            : "critical",
      trend: data.health_index >= avgScore ? "improving" : "declining"
    };
  };

  const getComplianceData = () => {
    const summaryFrameworks = data?.compliance_summary || [];
    const failedFrameworks = data?.compliance_failed || [];

    if (
      (!summaryFrameworks || summaryFrameworks.length === 0) &&
      (!failedFrameworks || failedFrameworks.length === 0)
    ) {
      return {
        topFrameworks: [],
        totalFrameworks: 0,
        totalIssues: 0,
        criticalIssues: 0,
        status: "no-data" as const,
        hasFailedData: false,
        hasSummaryData: false
      };
    }

    let topFrameworks: TopFramework[] = [];
    let criticalIssues = 0;
    let totalIssues = 0;
    let totalFrameworks = 0;

    if (summaryFrameworks && summaryFrameworks.length > 0) {
      const sortedSummaryFrameworks = [...summaryFrameworks].sort(
        (a, b) => (b.high || 0) + (b.med || 0) - ((a.high || 0) + (a.med || 0))
      );
      topFrameworks = sortedSummaryFrameworks.slice(0, 3);
      criticalIssues = summaryFrameworks.reduce(
        (sum, f) => sum + (f.high || 0) + (f.med || 0),
        0
      );
      totalIssues = summaryFrameworks.reduce(
        (sum, f) => sum + (f.high || 0) + (f.med || 0) + (f.low || 0),
        0
      );
      totalFrameworks = summaryFrameworks.length;
    }

    const failedCount = failedFrameworks.length;
    if (failedCount > 0) {
      criticalIssues += failedCount;
      totalIssues += failedCount;
    }

    const failedByFramework = (failedFrameworks as FailedItem[]).reduce(
      (acc: Record<string, FailedItem[]>, item: FailedItem) => {
        if (!acc[item.framework]) {
          acc[item.framework] = [];
        }
        acc[item.framework]!.push(item);
        return acc;
      },
      {} as Record<string, FailedItem[]>
    );

    const failedFrameworkNames = Object.keys(failedByFramework) as string[];

    return {
      topFrameworks,
      totalFrameworks: Math.max(totalFrameworks, failedFrameworkNames.length),
      totalIssues,
      criticalIssues,
      status:
        criticalIssues > 0
          ? "critical"
          : totalIssues > 0
            ? "warning"
            : "compliant",
      hasFailedData: failedCount > 0,
      hasSummaryData: summaryFrameworks.length > 0,
      failedByFramework: failedByFramework as Record<string, FailedItem[]>
    };
  };

  const getRiskData = () => {
    const allMetrics = data.pillar_metrics.flatMap((pillar) => pillar.metrics);
    const highRiskMetrics = allMetrics
      .filter((m) => m.risk_band === "high")
      .slice(0, 3);
    const medRiskMetrics = allMetrics
      .filter((m) => m.risk_band === "med")
      .slice(0, 3);
    const lowRiskMetrics = allMetrics
      .filter((m) => m.risk_band === "low")
      .slice(0, 3);
    const highCount = allMetrics.filter((m) => m.risk_band === "high").length;
    const medCount = allMetrics.filter((m) => m.risk_band === "med").length;
    const lowCount = allMetrics.filter((m) => m.risk_band === "low").length;
    const topRiskMetrics = [
      ...highRiskMetrics,
      ...medRiskMetrics,
      ...lowRiskMetrics
    ].slice(0, 3);

    return {
      topRiskMetrics,
      highCount,
      medCount,
      lowCount,
      totalMetrics: allMetrics.length,
      status: highCount > 0 ? "high" : medCount > 0 ? "medium" : "low"
    };
  };

  const getActionsData = () => {
    const allActions = data.pillar_metrics.flatMap((pillar) =>
      pillar.metrics.flatMap((metric) =>
        (metric.action_details || []).map((action) => ({
          ...action,
          pillarName: pillar.pillar,
          metricName: metric.metric_name
        }))
      )
    );

    const sortedActions = allActions.sort((a, b) => {
      const aUrgent = a.source?.some(
        (s) => s.includes("high") || s.includes("critical")
      )
        ? 1
        : 0;
      const bUrgent = b.source?.some(
        (s) => s.includes("high") || s.includes("critical")
      )
        ? 1
        : 0;
      return bUrgent - aUrgent;
    });

    const urgentActions = allActions.filter((action) =>
      action.source?.some(
        (src) => src.includes("high") || src.includes("critical")
      )
    );

    return {
      topActions: sortedActions.slice(0, 3),
      totalActions: allActions.length,
      urgentCount: urgentActions.length,
      mlActions: allActions.filter((a) => a.ml_engineer_action?.length > 0)
        .length,
      bmActions: allActions.filter((a) => a.business_manager_action?.length > 0)
        .length,
      cmActions: allActions.filter(
        (a) => a.compliance_manager_action?.length > 0
      ).length
    };
  };

  const performanceData = getPerformanceData();
  const complianceData = getComplianceData();
  const riskData = getRiskData();
  const actionsData = getActionsData();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ========================================================================
        HEADER SECTION
        Preserved your exact structure, enhanced with animations and glass-morphism
        ========================================================================
      */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-black/30 sm:p-6 lg:p-8"
      >
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex items-center gap-5">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="flex-shrink-0"
                  >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary-500 via-purple-600 to-indigo-700 text-xl font-bold text-white shadow-lg shadow-purple-500/20 sm:h-16 sm:w-16 sm:text-2xl lg:rounded-2xl">
                      {data?.application_name?.substring(0, 2)?.toUpperCase() ||
                        "AI"}
                    </div>
                  </motion.div>
                  <div className="flex w-fit items-center gap-5">
                    <h1 className="text-nowrap text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
                      Responsible AI Score
                    </h1>
                    {/* View Full Report Button - Desktop */}
                    <div className="hidden w-fit sm:block">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          router.push("/risk-management/responsible-ai-report")
                        }
                        className="group flex items-center space-x-2 text-nowrap rounded-lg bg-gradient-to-r from-tertiary-500 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:from-tertiary-600 hover:to-indigo-700 hover:shadow-indigo-500/30"
                      >
                        <Eye className="text-sm transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-sm">View Full Report</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
                {/* Mobile Button */}
                <div className="flex w-full items-center gap-5 sm:hidden">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      router.push("/risk-management/responsible-ai-report")
                    }
                    className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-tertiary-500 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg"
                  >
                    <Eye className="text-sm" />
                    <span>View Full Report</span>
                  </motion.button>
                </div>
              </div>

              {/* Info Grid - With Hover Effects */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                {[
                  {
                    icon: Building,
                    label: "Application Name",
                    value:
                      data?.application_name?.replace(/_/g, " ") ||
                      "Unknown Application"
                  },
                  {
                    icon: Layers,
                    label: "Report ID",
                    value: data?.report_id || "Unknown Type"
                  },
                  {
                    icon: FileText,
                    label: "Use Case",
                    value:
                      data?.use_case?.replace(/_/g, " ") || "AI Application"
                  },
                  {
                    icon: Layers,
                    label: "Framework",
                    value:
                      data?.provider?.replace(/_/g, " ") || "Unknown Provider"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{
                      y: -2,
                      backgroundColor: "rgba(255,255,255, 0.8)"
                    }}
                    className="rounded-lg border border-gray-100 bg-gray-50/80 p-3 backdrop-blur-sm dark:border-gray-800 dark:bg-white/5 sm:p-4"
                  >
                    <div className="mb-2 flex items-center space-x-2">
                      <item.icon className="h-4 w-4 flex-shrink-0 text-tertiary-600" />
                      <span className="text-nowrap text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                        {item.label}
                      </span>
                    </div>
                    <p className="truncate text-sm font-semibold capitalize text-gray-900 dark:text-white sm:text-lg">
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------
            RIGHT SIDE - HEADER CARD (HEALTH INDEX)
            Preserved exact structure, added smooth animations
            --------------------------------------------------------
          */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <motion.div
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
              className="w-full rounded-2xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-black/40 sm:w-80 sm:p-8"
            >
              <div className="flex flex-col space-y-6">
                {/* Score Labels */}
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                      Current Score
                    </div>
                    <span
                      className={`text-2xl font-bold sm:text-3xl ${
                        (data?.health_index || 0) >= 75
                          ? "text-green-600"
                          : (data?.health_index || 0) >= 50
                            ? "text-orange-600"
                            : "text-red-600"
                      }`}
                    >
                      {Math.round(data?.health_index || 0)}%
                    </span>
                  </div>
                  {/* Vertical Divider */}
                  <div className="h-10 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
                  <div className="text-center">
                    <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                      Target Score
                    </div>
                    <span className="text-2xl font-bold text-green-600 sm:text-3xl">
                      75%
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="relative w-full">
                  {/* Progress Bar Track */}
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700">
                    {/* Progress Bar Fill - Animated */}
                    <motion.div
                      className={`relative h-full rounded-full shadow-sm ${
                        (data?.health_index || 0) >= 75
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : (data?.health_index || 0) >= 50
                            ? "bg-gradient-to-r from-orange-500 to-orange-600"
                            : "bg-gradient-to-r from-red-500 to-red-600"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.health_index || 0}%` }}
                      transition={{ duration: 1.2, ease: "circOut" }}
                    >
                      {/* Shimmer Overlay */}
                      <div className="absolute inset-0 h-full w-full animate-[shimmer_2s_infinite] bg-white/30"></div>
                    </motion.div>
                  </div>

                  {/* 75% Position Indicator (Preserved) */}
                  <div className="absolute left-3/4 top-0 -translate-x-1/2 transform">
                    <div className="relative z-10 h-4 w-1 bg-green-500 shadow-sm"></div>
                    <div className="absolute left-1/2 top-5 -translate-x-1/2 transform">
                      <div className="rounded-md bg-green-500 px-2 py-1 text-xs font-medium text-white shadow-md">
                        Target
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Labels */}
                  <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================
        PERFORMANCE SECTION
        ========================================================================
      */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 dark:border-gray-700 dark:bg-gray-800/80"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Performance Overview
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {performanceData.totalMetrics} metrics across{" "}
                {performanceData.totalPillars} pillars •
                <span
                  className={`ml-1 ${performanceData.trend === "improving" ? "text-green-600" : "text-amber-600"}`}
                >
                  {performanceData.trend === "improving"
                    ? "↗ Improving"
                    : "↘ Needs attention"}
                </span>
              </p>
            </div>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              performanceData.status === "excellent"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : performanceData.status === "good"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {performanceData.healthIndex}%{" "}
            {performanceData.status.charAt(0).toUpperCase() +
              performanceData.status.slice(1)}
          </div>
        </div>

        {/* Statistics Cards - Enhanced with Hover */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: "Excellent",
              count: performanceData.excellentPillars,
              sub: "≥80% score",
              icon: CheckCircle,
              color: "emerald"
            },
            {
              label: "Good",
              count: performanceData.goodPillars,
              sub: "60-79% score",
              icon: Clock,
              color: "yellow"
            },
            {
              label: "Critical",
              count: performanceData.criticalPillars,
              sub: "<60% score",
              icon: AlertTriangle,
              color: "red"
            },
            {
              label: "Avg Score",
              count: `${performanceData.avgScore}%`,
              sub: "Overall average",
              icon: Activity,
              color: "purple"
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className={`rounded-lg border bg-gradient-to-br p-3 transition-all duration-200 ${
                stat.color === "emerald"
                  ? "border-emerald-200 from-emerald-50 to-white dark:border-emerald-800 dark:from-emerald-900/20"
                  : stat.color === "yellow"
                    ? "border-yellow-200 from-yellow-50 to-white dark:border-yellow-800 dark:from-yellow-900/20"
                    : stat.color === "red"
                      ? "border-red-200 from-red-50 to-white dark:border-red-800 dark:from-red-900/20"
                      : "border-purple-200 from-purple-50 to-white dark:border-purple-800 dark:from-purple-900/20"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <stat.icon
                  className={`h-4 w-4 text-${stat.color}-600 dark:text-${stat.color}-400`}
                />
                <span
                  className={`text-sm font-medium text-${stat.color}-700 dark:text-${stat.color}-400`}
                >
                  {stat.label}
                </span>
              </div>
              <div
                className={`text-2xl font-bold text-${stat.color}-800 dark:text-${stat.color}-300`}
              >
                {stat.count}
              </div>
              <div
                className={`text-xs text-${stat.color}-600 dark:text-${stat.color}-500`}
              >
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top Pillars */}
        <div className="mb-6">
          <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Star className="h-5 w-5 text-yellow-500" />
            Top Performing Pillars
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {performanceData.topPillars.map((pillar, index) => (
              <motion.div
                key={pillar.pillar}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}
                className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-gray-800"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(pillar.score)}%
                  </div>
                </div>
                <h4 className="mb-1 font-semibold capitalize text-gray-900 dark:text-gray-100">
                  {pillar.pillar.replace(/_/g, " ")}
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {pillar.metrics_count} metrics
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 ${
                      pillar.score >= 90
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : pillar.score >= 80
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {pillar.score >= 90
                      ? "Outstanding"
                      : pillar.score >= 80
                        ? "Excellent"
                        : "Good"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        {performanceData.areasForImprovement.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <Target className="h-5 w-5 text-orange-500" />
              Areas for Improvement
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {performanceData.areasForImprovement.map((pillar) => (
                <motion.div
                  key={pillar.pillar}
                  whileHover={{ scale: 1.01 }}
                  className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50/50 to-red-50/50 p-4 dark:border-orange-800 dark:from-orange-900/20 dark:to-red-900/20"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h5 className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                      {pillar.pillar.replace(/_/g, " ")}
                    </h5>
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(pillar.score)}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {pillar.metrics_count} metrics analyzed
                    </span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      +{Math.round(75 - pillar.score)}% needed
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Data Quality Indicator */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${
                  performanceData.metricQuality === "high"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : performanceData.metricQuality === "medium"
                      ? "bg-yellow-100 dark:bg-yellow-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                }`}
              >
                <BarChart3
                  className={`h-4 w-4 ${
                    performanceData.metricQuality === "high"
                      ? "text-green-600 dark:text-green-400"
                      : performanceData.metricQuality === "medium"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                />
              </div>
              <div>
                <h5 className="font-medium text-gray-900 dark:text-gray-100">
                  Data Quality:{" "}
                  <span className="capitalize">
                    {performanceData.metricQuality}
                  </span>
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {performanceData.totalMetrics} total metrics evaluated • Last
                  updated {new Date(data.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                performanceData.metricQuality === "high"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : performanceData.metricQuality === "medium"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {performanceData.metricQuality === "high"
                ? "Comprehensive"
                : performanceData.metricQuality === "medium"
                  ? "Moderate"
                  : "Limited"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================
        COMPLIANCE SECTION
        ========================================================================
      */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                complianceData.status === "no-data"
                  ? "bg-gray-100 dark:bg-gray-700/30"
                  : complianceData.status === "compliant"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : complianceData.status === "warning"
                      ? "bg-yellow-100 dark:bg-yellow-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              <Shield
                className={`h-6 w-6 ${
                  complianceData.status === "no-data"
                    ? "text-gray-600 dark:text-gray-400"
                    : complianceData.status === "compliant"
                      ? "text-green-600 dark:text-green-400"
                      : complianceData.status === "warning"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                }`}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Top Compliance Gaps
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Regulatory framework status
              </p>
            </div>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              complianceData.status === "no-data"
                ? "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400"
                : complianceData.status === "compliant"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : complianceData.status === "warning"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {complianceData.status === "no-data"
              ? "No Data"
              : complianceData.criticalIssues === 0
                ? "Compliant"
                : `${complianceData.criticalIssues} Issues`}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {complianceData.topFrameworks.length > 0 ? (
            complianceData.topFrameworks.map((framework, index) => (
              <motion.div
                key={framework.framework}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`rounded-xl border p-4 shadow-sm ${
                  (framework.high || 0) + (framework.med || 0) === 0
                    ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20"
                    : (framework.high || 0) > 0
                      ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-800 dark:from-red-900/20 dark:to-rose-900/20"
                      : "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <FileText
                    className={`h-4 w-4 ${
                      (framework.high || 0) + (framework.med || 0) === 0
                        ? "text-green-600 dark:text-green-400"
                        : (framework.high || 0) > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-yellow-600 dark:text-yellow-400"
                    }`}
                  />
                  <div className="flex gap-2">
                    {(framework.high || 0) > 0 && (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {framework.high}H
                      </span>
                    )}
                    {(framework.med || 0) > 0 && (
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {framework.med}M
                      </span>
                    )}
                    {(framework.low || 0) > 0 && (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {framework.low}L
                      </span>
                    )}
                  </div>
                </div>
                <h4 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                  {framework.framework}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(framework.high || 0) + (framework.med || 0) === 0
                    ? "Fully compliant"
                    : `${(framework.high || 0) + (framework.med || 0) + (framework.low || 0)} items checked`}
                </p>
              </motion.div>
            ))
          ) : complianceData.hasFailedData ? (
            Object.keys(complianceData.failedByFramework || {})
              .slice(0, 3)
              .map((frameworkName, index) => {
                const items = (
                  complianceData.failedByFramework as Record<
                    string,
                    FailedItem[]
                  >
                )?.[frameworkName];
                if (!items) {
                  return null;
                }
                return (
                  <motion.div
                    key={frameworkName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4 dark:border-red-800 dark:from-red-900/20 dark:to-rose-900/20"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {items.length} Failed
                      </span>
                    </div>
                    <h4 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                      {frameworkName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {items.length} compliance failure
                      {items.length !== 1 ? "s" : ""}
                    </p>
                  </motion.div>
                );
              })
          ) : (
            <div className="col-span-3 py-8 text-center">
              <div className="rounded-xl bg-gray-100 p-6 dark:bg-gray-700">
                <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                  No Compliance Data Available
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Compliance frameworks have not been configured or analyzed
                  yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ========================================================================
        RISK SECTION
        ========================================================================
      */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${
                riskData.status === "low"
                  ? "bg-green-100 dark:bg-green-900/30"
                  : riskData.status === "medium"
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              <AlertTriangle
                className={`h-6 w-6 ${
                  riskData.status === "low"
                    ? "text-green-600 dark:text-green-400"
                    : riskData.status === "medium"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Top Risk Assessment
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Critical risk metrics
              </p>
            </div>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              riskData.status === "low"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : riskData.status === "medium"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {riskData.status.charAt(0).toUpperCase() + riskData.status.slice(1)}{" "}
            Risk
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {riskData.topRiskMetrics.length > 0 ? (
            riskData.topRiskMetrics.map((metric, index) => (
              <motion.div
                key={metric.metric_name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className={`rounded-xl border p-4 shadow-sm ${
                  metric.risk_band === "high"
                    ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-800 dark:from-red-900/20 dark:to-rose-900/20"
                    : metric.risk_band === "med"
                      ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:border-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20"
                      : "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <Zap
                    className={`h-4 w-4 ${
                      metric.risk_band === "high"
                        ? "text-red-600 dark:text-red-400"
                        : metric.risk_band === "med"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                    }`}
                  />
                  <div
                    className={`rounded px-2 py-1 text-xs font-medium uppercase ${
                      metric.risk_band === "high"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : metric.risk_band === "med"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {metric.risk_band}
                  </div>
                </div>
                <h4 className="mb-1 font-semibold capitalize text-gray-900 dark:text-gray-100">
                  {metric.metric_name.replace(/_/g, " ")}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Score: {metric.raw_value?.toFixed(2) || "N/A"} | Risk:{" "}
                  {(metric.risk_score * 100)?.toFixed(0) || "N/A"}%
                </p>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 py-8 text-center">
              <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" />
              <p className="text-gray-500 dark:text-gray-400">
                No significant risks identified
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ========================================================================
        ACTIONS SECTION
        ========================================================================
      */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Top Recommended Actions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Priority action items
              </p>
            </div>
          </div>
          <div className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {actionsData.totalActions} Total
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {actionsData.topActions.length > 0 ? (
            actionsData.topActions.map((action, index) => {
              const isUrgent = action.source?.some(
                (s) => s.includes("high") || s.includes("critical")
              );
              return (
                <motion.div
                  key={action.action_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{
                    y: -4,
                    borderColor: isUrgent
                      ? "rgba(239, 68, 68, 0.4)"
                      : "rgba(168, 85, 247, 0.4)"
                  }}
                  className={`rounded-xl border p-4 shadow-sm transition-colors ${
                    isUrgent
                      ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-800 dark:from-red-900/20 dark:to-rose-900/20"
                      : "border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:border-purple-800 dark:from-purple-900/20 dark:to-violet-900/20"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <Users
                      className={`h-4 w-4 ${isUrgent ? "text-red-600 dark:text-red-400" : "text-purple-600 dark:text-purple-400"}`}
                    />
                    <div
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        isUrgent
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      }`}
                    >
                      {isUrgent ? "URGENT" : "STANDARD"}
                    </div>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    {action.action_id?.replace(/_/g, " ") || "Action Required"}
                  </h4>
                  <p className="mb-2 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                    {action.description || "No description available"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs capitalize text-gray-500 dark:text-gray-400">
                      {action.pillarName}
                    </span>
                    <div className="flex gap-1">
                      {action.ml_engineer_action?.length > 0 && (
                        <div
                          className="h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-gray-800"
                          title="ML Engineer"
                        ></div>
                      )}
                      {action.business_manager_action?.length > 0 && (
                        <div
                          className="h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"
                          title="Business Manager"
                        ></div>
                      )}
                      {action.compliance_manager_action?.length > 0 && (
                        <div
                          className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"
                          title="Compliance Manager"
                        ></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-3 py-8 text-center">
              <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" />
              <p className="text-gray-500 dark:text-gray-400">
                No actions required at this time
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MinimalTraceReport;
