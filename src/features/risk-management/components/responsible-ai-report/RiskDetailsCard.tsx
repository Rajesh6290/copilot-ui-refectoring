"use client";
import { motion } from "framer-motion";
import { AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import { BsExclamationTriangle } from "react-icons/bs";
import {
  ApiData,
  BusinessImpact,
  CommonRiskDetail
} from "./ResposibleAiReport";

interface RiskDetailsCardProps {
  data: ApiData;
}

const RiskDetailsCard: React.FC<RiskDetailsCardProps> = ({ data }) => {
  const [showAllRisks, setShowAllRisks] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<string>("all");

  // Get highest risk per pillar
  const getHighestRiskPerPillar = () => {
    const pillarRisks: Array<{
      pillar: string;
      metric: string;
      risk:
        | CommonRiskDetail
        | BusinessImpact
        | { id: string; name: string; description: string };
      type: "technical" | "common" | "business";
      severity: string;
      riskScore: number;
    }> = [];

    data?.pillar_metrics?.forEach((pillar) => {
      const pillarName =
        pillar?.pillar
          ?.replace(/_/g, " ")
          ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
        "Unknown Pillar";
      let highestRisk: {
        pillar: string;
        metric: string;
        risk:
          | CommonRiskDetail
          | BusinessImpact
          | { id: string; name: string; description: string };
        type: "technical" | "common" | "business";
        severity: string;
        riskScore: number;
      } | null = null;
      let highestScore = 0;

      pillar?.metrics?.forEach((metric) => {
        const score = (metric?.risk_score || 0) * 100;

        // Add technical risk if it has the highest score for this pillar
        if (score >= highestScore) {
          highestScore = score;
          highestRisk = {
            pillar: pillarName,
            metric: metric?.common_metric_name || "Unknown Metric",
            risk: {
              id: metric?.risk_id || "unknown",
              name: metric?.risk_name || "Unknown Risk",
              description:
                metric?.risk_description || "No description available"
            },
            type: "technical",
            severity: metric?.risk_band || "low",
            riskScore: score
          };
        }

        // Check common risks - add each one if it matches the highest score
        metric?.common_risk_details?.forEach(() => {
          if (score >= highestScore) {
            // If we find a common risk with the same high score, we might want to include it too
            // For now, let's prioritize the technical risk but this logic can be adjusted
          }
        });
      });

      if (highestRisk) {
        pillarRisks.push(highestRisk);
      }
    });

    return pillarRisks;
  };

  const getAllRisks = () => {
    const allRisks: Array<{
      pillar: string;
      metric: string;
      risk:
        | CommonRiskDetail
        | BusinessImpact
        | { id: string; name: string; description: string };
      type: "technical" | "common" | "business";
      severity: string;
      riskScore: number;
    }> = [];

    data?.pillar_metrics?.forEach((pillar) => {
      const pillarName =
        pillar?.pillar
          ?.replace(/_/g, " ")
          ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
        "Unknown Pillar";
      pillar?.metrics?.forEach((metric) => {
        const score = (metric?.risk_score || 0) * 100;

        // Add technical risk
        allRisks.push({
          pillar: pillarName,
          metric: metric?.common_metric_name || "Unknown Metric",
          risk: {
            id: metric?.risk_id || "unknown",
            name: metric?.risk_name || "Unknown Risk",
            description: metric?.risk_description || "No description available"
          },
          type: "technical",
          severity: metric?.risk_band || "low",
          riskScore: score
        });

        // Add common risks
        metric?.common_risk_details?.forEach((risk) => {
          allRisks.push({
            pillar: pillarName,
            metric: metric?.common_metric_name || "Unknown Metric",
            risk,
            type: "common",
            severity: metric?.risk_band || "low",
            riskScore: score
          });
        });
      });
    });

    return allRisks;
  };

  // Get unique pillars and metrics for dropdown options
  const getUniquePillars = () => {
    const pillars = new Set<string>();
    data?.pillar_metrics?.forEach((pillar) => {
      const pillarName =
        pillar?.pillar
          ?.replace(/_/g, " ")
          ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
        "Unknown Pillar";
      pillars.add(pillarName);
    });
    return Array.from(pillars);
  };

  const getUniqueMetrics = () => {
    const metrics = new Set<string>();
    data?.pillar_metrics?.forEach((pillar) => {
      pillar?.metrics?.forEach((metric) => {
        metrics.add(metric?.common_metric_name || "Unknown Metric");
      });
    });
    return Array.from(metrics);
  };

  // Filter risks based on selected pillar and metric
  const filterRisks = (
    risks: {
      pillar: string;
      metric: string;
      risk:
        | CommonRiskDetail
        | BusinessImpact
        | { id: string; name: string; description: string };
      type: "technical" | "common" | "business";
      severity: string;
      riskScore: number;
    }[]
  ) => {
    return risks.filter((risk) => {
      const pillarMatch =
        selectedPillar === "all" || risk.pillar === selectedPillar;
      const metricMatch =
        selectedMetric === "all" || risk.metric === selectedMetric;
      return pillarMatch && metricMatch;
    });
  };

  const highestRisks = getHighestRiskPerPillar();
  const allRisks = getAllRisks();
  const baseRisks = showAllRisks ? allRisks : highestRisks;
  const displayRisks = filterRisks(baseRisks);

  const uniquePillars = getUniquePillars();
  const uniqueMetrics = getUniqueMetrics();

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
      case "med":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
      case "high":
        return <BsExclamationTriangle className="h-4 w-4 text-red-600" />;
      case "medium":
      case "med":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "low":
        return <Info className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <motion.div
      className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-4 shadow-xl dark:border-neutral-900 dark:from-darkSidebarBackground dark:to-darkSidebarBackground sm:p-6 lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center space-x-3 sm:space-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg sm:h-12 sm:w-12">
            <BsExclamationTriangle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Risk Details Overview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comprehensive risk analysis across all AI pillars
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="rounded-full bg-red-100 px-3 py-2 text-sm font-medium text-red-800 dark:bg-red-800 dark:text-red-200 sm:px-4">
            {allRisks.length} Total Risks
          </span>
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-3 sm:gap-6">
        {[
          {
            label: "Critical/High Risks",
            count: displayRisks.filter(
              (r) =>
                r.severity.toLowerCase() === "critical" ||
                r.severity.toLowerCase() === "high"
            ).length,
            color: "red",
            icon: BsExclamationTriangle
          },
          {
            label: "Medium Risks",
            count: displayRisks.filter(
              (r) =>
                r.severity.toLowerCase() === "medium" ||
                r.severity.toLowerCase() === "med"
            ).length,
            color: "orange",
            icon: AlertTriangle
          },
          {
            label: "Low Risks",
            count: displayRisks.filter(
              (r) => r.severity.toLowerCase() === "low"
            ).length,
            color: "green",
            icon: Info
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-neutral-900 dark:bg-darkMainBackground sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`mb-1 text-2xl font-bold sm:text-3xl ${
                    stat.color === "red"
                      ? "text-red-600"
                      : stat.color === "orange"
                        ? "text-orange-600"
                        : "text-green-600"
                  }`}
                >
                  {stat.count}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                  {stat.label}
                </div>
              </div>
              <stat.icon
                className={`h-6 w-6 sm:h-8 sm:w-8 ${
                  stat.color === "red"
                    ? "text-red-600"
                    : stat.color === "orange"
                      ? "text-orange-600"
                      : "text-green-600"
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Risk List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-neutral-900 dark:bg-darkMainBackground">
        <div className="border-b border-gray-200 p-4 dark:border-neutral-800 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Detailed Risk Analysis
            </h4>

            {/* Filter Selects */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Filter by Pillar */}
              <div className="flex flex-col">
                <label
                  htmlFor="pillar-filter"
                  className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  Filter by Pillar
                </label>
                <select
                  id="pillar-filter"
                  value={selectedPillar}
                  onChange={(e) => setSelectedPillar(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-gray-300 sm:w-48"
                >
                  <option value="all">All Pillars</option>
                  {uniquePillars.map((pillar) => (
                    <option key={pillar} value={pillar}>
                      {pillar}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Metric */}
              <div className="flex flex-col">
                <label
                  htmlFor="metric-filter"
                  className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400"
                >
                  Filter by Metric
                </label>
                <select
                  id="metric-filter"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-gray-300 sm:w-48"
                >
                  <option value="all">All Metrics</option>
                  {uniqueMetrics.map((metric) => (
                    <option className="capitalize" key={metric} value={metric}>
                      {metric?.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto sm:max-h-96">
          <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
            {displayRisks.length > 0 ? (
              displayRisks.map((riskItem, index) => (
                <motion.div
                  key={`${riskItem.pillar}-${riskItem.metric}-${riskItem.type}-${index}`}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-neutral-900 dark:bg-darkSidebarBackground sm:p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                        {getSeverityIcon(riskItem.severity)}
                        <h5 className="text-sm font-semibold capitalize text-gray-900 dark:text-white sm:text-base">
                          {riskItem?.risk?.name?.replace(/_/g, " ") ||
                            "Unknown Risk"}
                        </h5>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${getSeverityColor(riskItem.severity)}`}
                        >
                          {riskItem.severity.toUpperCase()}
                        </span>
                        {riskItem.riskScore > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Score: {riskItem.riskScore.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p className="mb-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                        {riskItem?.risk?.description ||
                          "No description available"}
                      </p>
                      <div className="flex flex-col gap-2 text-xs text-gray-500 dark:text-gray-400 sm:flex-row sm:items-center sm:gap-4">
                        <span>
                          <strong>Pillar:</strong> {riskItem.pillar}
                        </span>
                        <span className="capitalize">
                          <strong>Metric:</strong>{" "}
                          {riskItem?.metric?.replace(/_/g, " ") ||
                            "Unknown Metric"}
                        </span>
                        <span className="capitalize">
                          <strong>Type:</strong> {riskItem.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No risks found for the selected filters.
              </div>
            )}

            <div className="py-4 text-center">
              <button
                onClick={() => setShowAllRisks(!showAllRisks)}
                className="mr-3 rounded-lg bg-tertiary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-tertiary-700 sm:px-6"
              >
                {showAllRisks
                  ? `Show Highest Risks Only (${filterRisks(highestRisks).length})`
                  : `View All Risks (${filterRisks(allRisks).length})`}
              </button>

              {(selectedPillar !== "all" || selectedMetric !== "all") && (
                <button
                  onClick={() => {
                    setSelectedPillar("all");
                    setSelectedMetric("all");
                  }}
                  className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600 sm:px-6"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default RiskDetailsCard;
