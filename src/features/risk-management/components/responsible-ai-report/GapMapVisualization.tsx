"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Lightbulb,
  Target
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { ApiData } from "./ResposibleAiReport";

interface GapMapVisualizationProps {
  data: ApiData;
}

const GapMapVisualization: React.FC<GapMapVisualizationProps> = ({ data }) => {
  const policyTarget = 75;
  const currentHealth = data?.health_index || 0;
  const gap = Math.max(0, policyTarget - currentHealth);

  // Calculate pillar statistics
  const pillarStats =
    data?.pillar_metrics?.map(
      (pillar: {
        pillar: string;
        score: number;
        metrics_count: number;
        metrics: string | unknown[];
      }) => {
        const pillarName =
          pillar?.pillar
            ?.replace(/_/g, " ")
            ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
          "Unknown Pillar";
        const score = Math.round((pillar?.score || 0) * 100);
        const hasMetrics =
          (pillar?.metrics_count || 0) > 0 &&
          (pillar?.metrics?.length || 0) > 0;
        const gapFromTarget = hasMetrics
          ? Math.max(0, policyTarget - score)
          : policyTarget;
        const status = hasMetrics
          ? score >= policyTarget
            ? "passing"
            : "failing"
          : "no-data";

        return {
          name: pillarName,
          score,
          hasMetrics,
          gapFromTarget,
          status,
          metricsCount: pillar?.metrics_count || 0
        };
      }
    ) || [];

  // Calculate summary statistics
  const pillarsWithData = pillarStats?.filter((p) => p.hasMetrics) || [];
  const passingPillars =
    pillarsWithData?.filter((p) => p.status === "passing") || [];
  const failingPillars =
    pillarsWithData?.filter((p) => p.status === "failing") || [];
  const pillarsWithoutData = pillarStats?.filter((p) => !p.hasMetrics) || [];
  const averageGap =
    pillarsWithData?.length > 0
      ? Math.round(
          pillarsWithData.reduce((sum, p) => sum + p.gapFromTarget, 0) /
            pillarsWithData.length
        )
      : 0;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "passing":
        return {
          icon: CheckCircle,
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-500/10",
          label: "Passing",
          dot: "bg-emerald-500"
        };
      case "failing":
        return {
          icon: AlertCircle,
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-500/10",
          label: "Failing",
          dot: "bg-red-500"
        };
      default:
        return {
          icon: BarChart3,
          color: "text-gray-500 dark:text-gray-400",
          bg: "bg-gray-500/10",
          label: "No Data",
          dot: "bg-gray-400"
        };
    }
  };

  return (
    <motion.div
      className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-900 dark:bg-darkSidebarBackground lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tertiary-500 to-purple-600 shadow-lg lg:flex">
            <Target className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">
              Pillar Gap Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 lg:text-base">
              Track your progress toward responsible AI excellence
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-tertiary-600 dark:text-tertiary-400">
            {policyTarget}%
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Target Score
          </div>
        </div>
      </div>

      {/* Key Metrics - Clean Row Layout */}
      <div className="mb-8 rounded-2xl border border-tertiary-100 bg-gradient-to-r from-tertiary-50 via-indigo-50 to-purple-50 p-6 dark:border-tertiary-800 dark:from-tertiary-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="text-center">
            <div className="mb-1 text-3xl font-bold text-tertiary-600 dark:text-tertiary-400">
              {currentHealth}%
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Score
            </div>
          </div>
          <div className="text-center">
            <div
              className={`mb-1 text-3xl font-bold ${gap > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
            >
              {gap > 0 ? `${gap}%` : "✓"}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {gap > 0 ? "Gap to Close" : "Target Met"}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {passingPillars?.length || 0}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Passing Pillars
            </div>
          </div>
          <div className="text-center">
            <div className="mb-1 text-3xl font-bold text-red-600 dark:text-red-400">
              {failingPillars?.length || 0}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Need Attention
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              Overall Progress
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              {currentHealth >= policyTarget
                ? "🎉 Congratulations! You've achieved the policy target"
                : `${gap}% improvement needed to reach ${policyTarget}% target`}
            </p>
          </div>
          {/* <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round((currentHealth / policyTarget) * 100)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Complete
            </div>
          </div> */}
        </div>

        <div className="relative">
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <motion.div
              className={`h-full rounded-full ${
                currentHealth >= policyTarget
                  ? "bg-gradient-to-r from-emerald-500 to-green-500"
                  : currentHealth >= policyTarget * 0.7
                    ? "bg-gradient-to-r from-tertiary-500 to-indigo-500"
                    : "bg-gradient-to-r from-amber-500 to-red-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(currentHealth, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          {/* Target marker */}
          <div
            className="absolute top-0 flex h-2 items-center"
            style={{ left: `${policyTarget}%` }}
          >
            <span className="absolute left-1/2 top-5 -translate-x-1/2 transform text-nowrap font-medium text-green-500">
              Target: {policyTarget}%
            </span>
            <div className="relative h-6 w-0.5 rounded-full bg-green-500 shadow-lg">
              <div className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 transform bg-green-500"></div>
            </div>
          </div>

          <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>0%</span>

            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Key Insights Section */}
      <div className="mb-8 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="mb-4 flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Key Insights
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-6 text-sm lg:grid-cols-2">
          <div>
            <strong className="mb-2 block text-amber-800 dark:text-amber-200">
              Performance Summary:
            </strong>
            <ul className="space-y-1 text-amber-700 dark:text-amber-300">
              <li>
                • {pillarsWithData?.length || 0} of {pillarStats?.length || 0}{" "}
                pillars have active metrics
              </li>
              <li>
                • {passingPillars?.length || 0} pillars are meeting the{" "}
                {policyTarget}% target
              </li>
              <li>• {failingPillars?.length || 0} pillars need improvement</li>
              {(pillarsWithoutData?.length || 0) > 0 && (
                <li>
                  • {pillarsWithoutData?.length} pillars need metric
                  configuration
                </li>
              )}
            </ul>
          </div>
          <div>
            <strong className="mb-2 block text-amber-800 dark:text-amber-200">
              Next Steps:
            </strong>
            <ul className="space-y-1 text-amber-700 dark:text-amber-300">
              {currentHealth >= policyTarget ? (
                <li>• ✅ Maintain current performance levels</li>
              ) : (
                <li>
                  • Focus on {failingPillars?.length || 0} underperforming
                  pillars
                </li>
              )}
              {averageGap > 0 && (
                <li>• Average improvement needed per pillar: {averageGap}%</li>
              )}
              {(pillarsWithoutData?.length || 0) > 0 && (
                <li>
                  • Configure metrics for {pillarsWithoutData?.length} pillars
                </li>
              )}
              <li>
                <Link
                  className=""
                  href="/self-assessment/responsible-ai#actions-by-role"
                >
                  • Consider following prescribed actions for improvement
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pillar Performance - Clean List Layout */}
      <div>
        <h4 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Pillar Performance Breakdown
        </h4>
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {pillarStats?.map((pillar, index) => {
            const config = getStatusConfig(pillar.status);
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={pillar.name}
                className="rounded-xl border border-gray-200 bg-gray-50 p-6 transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-darkMainBackground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${config.dot}`}></div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pillar.name}
                      </h5>
                      <div className="mt-1 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${config.color}`} />
                          <span
                            className={`text-sm font-medium ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        {pillar.hasMetrics && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {pillar.metricsCount} metrics analyzed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
                      {pillar.hasMetrics ? `${pillar.score}%` : "—"}{" "}
                      <span className="text-sm font-medium">Score</span>
                    </div>
                    {pillar.hasMetrics && pillar.gapFromTarget > 0 && (
                      <div className="text-sm font-medium text-red-600 dark:text-red-400">
                        {pillar.gapFromTarget}% improvement needed
                      </div>
                    )}
                    {pillar.hasMetrics && pillar.gapFromTarget === 0 && (
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Target achieved ✓
                      </div>
                    )}
                    {!pillar.hasMetrics && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No metrics configured
                      </div>
                    )}
                  </div>
                </div>

                {pillar.hasMetrics && (
                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-neutral-800">
                    <div className="rounded-lg bg-white p-4 text-sm text-gray-600 dark:bg-darkSidebarBackground dark:text-gray-300">
                      <strong>{pillar.name}</strong> scored{" "}
                      <strong>{pillar.score}%</strong> with{" "}
                      <strong>{pillar.metricsCount}</strong> metrics analyzed.{" "}
                      {pillar.gapFromTarget > 0 ? (
                        <>
                          This is <strong>{pillar.gapFromTarget}%</strong> below
                          the {policyTarget}% target, indicating{" "}
                          <span className="font-medium text-red-600 dark:text-red-400">
                            improvement is needed
                          </span>
                          .
                        </>
                      ) : (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          Target has been achieved ✓
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default GapMapVisualization;
