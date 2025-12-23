"use client";
import { motion } from "framer-motion";
import { FileText, Shield, Star } from "lucide-react";
import React from "react";
import { ApiData } from "./ResposibleAiReport";

interface ResponsibleAIHealthIndexProps {
  data: ApiData;
}

const ResponsibleIndexCard: React.FC<ResponsibleAIHealthIndexProps> = ({
  data
}) => {
  // Helper functions
  const getHealthColor = (health: number): string => {
    if (health >= 80) {
      return "text-green-600 dark:text-green-400";
    }
    if (health >= 60) {
      return "text-yellow-600 dark:text-yellow-400";
    }
    return "text-red-600 dark:text-red-400";
  };
  const getHealthStroke = (health: number): string => {
    if (health >= 80) {
      return "#10b981";
    }
    if (health >= 60) {
      return "#f59e0b";
    }
    return "#ef4444";
  };

  const getHealthText = (health: number): string => {
    if (health >= 80) {
      return "Excellent - Well Optimized";
    }
    if (health >= 60) {
      return "Good - Minor Issues";
    }
    return "Critical - Needs Attention";
  };

  // Calculate metrics by risk level
  const getRiskMetrics = () => {
    const allMetrics =
      data?.pillar_metrics?.flatMap((pillar) => pillar.metrics) || [];
    const highRisk = allMetrics.filter(
      (metric) => metric.risk_band === "high"
    ).length;
    const medRisk = allMetrics.filter(
      (metric) => metric.risk_band === "med"
    ).length;
    const lowRisk = allMetrics.filter(
      (metric) => metric.risk_band === "low"
    ).length;

    return { highRisk, medRisk, lowRisk, total: allMetrics.length };
  };

  // Get active pillars count
  const getActivePillarsCount = () => {
    return (
      data?.pillar_metrics?.filter((pillar) => pillar.metrics_count > 0)
        .length || 0
    );
  };
  const riskMetrics = getRiskMetrics();
  const activePillars = getActivePillarsCount();

  const StarRating: React.FC<{ rating: number; total?: number }> = ({
    rating,
    total = 5
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(total)].map((_, index) => (
          <Star
            key={index}
            className={`h-3 w-3 sm:h-4 sm:w-4 ${
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg dark:border-neutral-900 dark:from-darkSidebarBackground dark:to-darkSidebarBackground sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Left Side - Title and Description */}
        <div className="flex-1">
          <div className="mb-4 flex items-center space-x-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="block text-xl font-bold text-gray-800 dark:text-gray-200">
                Responsible AI Assessment Overview
              </span>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Overall system assessment score
              </div>
            </div>
          </div>

          {/* Health Status */}
          <div
            className={`flex items-center gap-5 text-lg font-bold ${getHealthColor(data?.health_index || 0)} mb-4`}
          >
            {getHealthText(data?.health_index || 0)}{" "}
            <div className="flex items-center justify-center space-x-2">
              <StarRating rating={data?.stars || 0} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {data?.stars || 0}/5
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            The assessment explored{" "}
            <strong>{data?.metrics_processed || 0}</strong> metrics across{" "}
            <strong>{activePillars}</strong>{" "}
            {
              "AI governance pillars to provide visibility into the system's relationship with responsible AI principles."
            }
          </p>
        </div>

        {/* Right Side - Circular Progress and Status Card */}
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            className="relative h-24 w-24 flex-shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg
              className="h-full w-full -rotate-90 transform"
              viewBox="0 0 36 36"
            >
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
                className="dark:stroke-gray-600"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={getHealthStroke(data?.health_index || 0)}
                strokeWidth="3"
                strokeDasharray={`${data?.health_index || 0}, 100`}
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${data?.health_index || 0}, 100` }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                className={`text-2xl font-bold ${getHealthColor(data?.health_index || 0)}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {data?.health_index || 0}%
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800/50">
        <div className="mb-3 flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-500" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Summary
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-tertiary"></div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {data?.metrics_processed || 0} Evaluation metrics reviewed.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-tertiary"></div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {activePillars} Responsible AI governance pillars.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-tertiary"></div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Evaluation Framework :{" "}
              <span className="capitalize text-tertiary">
                {data?.provider || "N/A"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-tertiary"></div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Current Score :
              <span
                className={`ml-1 ${
                  (data?.health_index || 0) >= 80
                    ? "text-green-600 dark:text-green-400"
                    : (data?.health_index || 0) >= 60
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              >
                {data?.health_index || 0}% (
                {(data?.health_index || 0) >= 80
                  ? "Excellent"
                  : (data?.health_index || 0) >= 60
                    ? "Good"
                    : "Critical"}
                )
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-tertiary"></div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Target Threshold :
              <span className="capitalize text-tertiary">75%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-tertiary"></div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Last Update :
              <span className="capitalize text-tertiary">
                {data?.created_at
                  ? new Date(data.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })
                  : "July 14, 2025"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-6">
        <h4 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Key Insights
        </h4>
        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800/50">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>{data?.metrics_processed}</strong> total metrics
                analyzed across <strong>{activePillars}</strong> governance
                pillars
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div
                className={`mt-2 h-2 w-2 rounded-full ${
                  riskMetrics.highRisk > 0
                    ? "bg-rose-500"
                    : riskMetrics.medRisk > 0
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
              />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {riskMetrics.highRisk > 0
                  ? "Immediate attention required for critical issues"
                  : riskMetrics.medRisk > 0
                    ? "Monitor medium risk areas closely"
                    : "System performing well within acceptable ranges"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 rounded-full bg-purple-500" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Target achievement:{" "}
                <strong>
                  {(
                    ((Math.min(data?.health_index || 0, 75) || 0) / 75) *
                    100
                  ).toFixed(0)}
                  %
                </strong>{" "}
                of 75% threshold
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResponsibleIndexCard;
