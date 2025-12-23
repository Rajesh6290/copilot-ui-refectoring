"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap
} from "lucide-react";
import { useState } from "react";
import { Metric, MetricDetailTab } from "./ResposibleAiReport";
const MetricDetailCard: React.FC<{
  metric: Metric;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ metric, index, isExpanded, onToggle }) => {
  const [activeTab, setActiveTab] = useState<MetricDetailTab>("risks");

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200 border-rose-200 dark:border-rose-700";
      case "high":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200 dark:border-amber-700";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700";
      case "low":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200 border-slate-200 dark:border-slate-700";
    }
  };

  const getRiskBandColor = (band: string) => {
    switch (band?.toLowerCase()) {
      case "high":
        return {
          bg: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200 border-rose-200 dark:border-rose-700",
          icon: "text-rose-600",
          gradient: "from-rose-500 to-red-600"
        };
      case "medium":
      case "med":
        return {
          bg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200 dark:border-amber-700",
          icon: "text-amber-600",
          gradient: "from-amber-500 to-orange-600"
        };
      case "low":
        return {
          bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700",
          icon: "text-emerald-600",
          gradient: "from-emerald-500 to-teal-600"
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-200 border-slate-200 dark:border-slate-700",
          icon: "text-slate-600",
          gradient: "from-slate-500 to-slate-600"
        };
    }
  };

  // Calculate proper tab counts
  const totalRisks =
    (metric?.common_risk_details?.length || 0) +
    1 +
    (metric?.business_impact?.length || 0);
  const totalActions = metric?.action_details?.length || 0;

  // Generate functional description
  const getMetricDescription = () => {
    const metricName =
      metric?.common_metric_name?.replace(/_/g, " ") || "this metric";
    const thresholdMin = Math.round((metric?.threshold_min || 0) * 100);
    const thresholdMax = Math.round((metric?.threshold_max || 0) * 100);
    const threshold = `${thresholdMin}-${thresholdMax}%`;
    const preferredDirection = metric?.better_high
      ? "Higher values preferred"
      : "Lower values preferred";
    const originalValue = metric?.original_value || 0;
    const riskScore = Math.round((metric?.risk_score || 0) * 100);
    const riskLevel = (metric?.risk_band || "low").toUpperCase();

    return `For ${metricName}, the desired value falls within ${threshold} (${preferredDirection}). Your current score is ${originalValue}, which corresponds to a risk score of ${riskScore}% and a risk level of ${riskLevel}.`;
  };

  const riskBandColors = getRiskBandColor(metric?.risk_band || "low");

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-neutral-900 dark:bg-darkSidebarBackground"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Enhanced Metric Header - Always Visible */}
      <div className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 via-white/30 to-slate-50/50 p-6 backdrop-blur-sm dark:border-slate-800/50 dark:from-darkSidebarBackground dark:via-darkSidebarBackground dark:to-darkSidebarBackground">
        <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="mb-4 flex items-start gap-4">
              <div
                className={`h-12 w-12 bg-gradient-to-r ${riskBandColors.gradient} flex items-center justify-center rounded-xl text-white shadow-lg`}
              >
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <h4 className="text-xl font-bold capitalize text-slate-900 dark:text-white">
                    {metric?.common_metric_name?.replace(/_/g, " ") ||
                      "Unknown Metric"}
                  </h4>
                  <span className="w-fit rounded-full bg-slate-100 px-4 py-1 text-sm font-medium capitalize text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                    {metric?.metric_name?.replace(/_/g, " ") || "Unknown"}
                  </span>
                </div>
                <p className="mb-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {metric?.common_metric_description ||
                    "No description available"}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {getMetricDescription()}
            </p>
          </div>

          <div className="text-center lg:text-right">
            <div className="rounded-xl border border-slate-200/50 bg-white/80 p-4 shadow-md backdrop-blur-sm dark:border-neutral-800/50 dark:bg-darkMainBackground">
              <div className="mb-1 text-3xl font-bold text-slate-700 dark:text-slate-300">
                {metric?.original_value || 0}
              </div>
              <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                Submitted Value
              </div>
              <div className="flex items-center justify-center space-x-1">
                {metric?.better_high ? (
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-slate-500" />
                )}
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {metric?.better_high
                    ? "Higher values preferred"
                    : "Lower values preferred"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Metric Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200/30 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-darkMainBackground">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Threshold Range
              </div>
              <Target className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {Math.round((metric?.threshold_min || 0) * 100)}-
              {Math.round((metric?.threshold_max || 0) * 100)}%
            </div>
          </div>

          <div className="rounded-lg border border-slate-200/30 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-darkMainBackground">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Risk Level
              </div>
              <AlertTriangle className={`h-4 w-4 ${riskBandColors.icon}`} />
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-sm font-bold ${riskBandColors.bg} shadow-sm`}
            >
              {(metric?.risk_band || "low").toUpperCase()}
            </span>
          </div>

          <div className="rounded-lg border border-slate-200/30 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-darkMainBackground">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Risk Score
              </div>
              <Zap className={`h-4 w-4 ${riskBandColors.icon}`} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {Math.round((metric?.risk_score || 0) * 100)}%
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full bg-gradient-to-r ${riskBandColors.gradient} shadow-sm transition-all duration-1000`}
                  style={{
                    width: `${Math.round((metric?.risk_score || 0) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200/30 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-darkMainBackground">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Status
              </div>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-center space-x-2">
              {(metric?.risk_score || 0) > 0.7 ? (
                <>
                  <XCircle className="h-5 w-5 text-rose-500" />
                  <span className="font-medium text-rose-600">
                    Action Required
                  </span>
                </>
              ) : (metric?.risk_score || 0) > 0.4 ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span className="font-medium text-amber-600">Monitor</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="font-medium text-emerald-600">Good</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Show More/Less Button */}
      <div className="border-b border-slate-200/50 bg-slate-50/50 px-6 py-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-darkSidebarBackground">
        <button
          onClick={onToggle}
          className="group flex w-full items-center justify-center space-x-2 rounded-lg py-2 text-slate-600 transition-colors hover:bg-white/50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-darkMainBackground dark:hover:text-slate-300"
        >
          <span className="font-medium">
            {isExpanded ? "Show Less" : "Show More Details"}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          ) : (
            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Enhanced Tab Navigation */}
            <div className="flex overflow-x-auto border-b border-slate-200/50 bg-slate-50/30 backdrop-blur-sm dark:border-neutral-800 dark:border-neutral-800/50 dark:bg-darkMainBackground">
              {[
                {
                  key: "risks",
                  label: "Risk Analysis",
                  icon: AlertTriangle,
                  count: totalRisks,
                  color: "rose"
                },
                {
                  key: "actions",
                  label: "Action Items",
                  icon: Target,
                  count: totalActions,
                  color: "amber"
                }
                // {
                //     key: "compliance",
                //     label: "Compliance",
                //     icon: Shield,
                //     count: totalCompliance,
                //     color: "slate",
                // },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as MetricDetailTab)}
                  className={`group relative flex items-center space-x-3 whitespace-nowrap px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? "border-b-2 border-slate-600 bg-white/70 text-slate-700 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-darkSidebarBackground dark:text-slate-300"
                      : "text-slate-500 hover:bg-white/50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-darkSidebarBackground dark:hover:text-slate-300"
                  }`}
                >
                  <div
                    className={`rounded-lg p-2 transition-colors ${
                      activeTab === tab.key
                        ? tab.color === "rose"
                          ? "bg-rose-100 dark:bg-rose-900/30"
                          : tab.color === "amber"
                            ? "bg-amber-100 dark:bg-amber-900/30"
                            : "bg-slate-100 dark:bg-slate-800"
                        : "bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-800 dark:group-hover:bg-slate-700"
                    }`}
                  >
                    <tab.icon
                      className={`h-4 w-4 ${
                        activeTab === tab.key
                          ? tab.color === "rose"
                            ? "text-rose-600"
                            : tab.color === "amber"
                              ? "text-amber-600"
                              : "text-slate-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                  </div>
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      activeTab === tab.key
                        ? tab.color === "rose"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-800/30 dark:text-rose-200"
                          : tab.color === "amber"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-200"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    } shadow-sm`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "risks" && (
                  <motion.div
                    key="risks"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {/* Common Risk Details */}
                    {metric?.common_risk_details?.map((risk, riskIndex) => (
                      <div
                        key={riskIndex}
                        className="rounded-xl border border-slate-200/30 bg-slate-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/30 dark:bg-slate-800/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center space-x-2">
                              <h5 className="font-semibold text-slate-900 dark:text-white">
                                {risk?.name || "Unknown Risk"}
                              </h5>
                            </div>
                            <p className="mb-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                              {risk?.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Technical Risk */}
                    <div className="rounded-xl border border-slate-200/30 bg-slate-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/30 dark:bg-slate-800/50">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <h5 className="font-semibold capitalize text-slate-900 dark:text-white">
                              {metric?.risk_name?.replace(/_/g, " ") ||
                                "Unknown Technical Risk"}
                            </h5>
                          </div>
                          <p className="mb-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            {metric?.risk_description ||
                              "No description available"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Business Impact Data */}
                    {metric?.business_impact?.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 border-t border-slate-200/50 pt-4 dark:border-slate-700/50">
                          <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <h5 className="font-semibold text-slate-900 dark:text-white">
                            Business Impact
                          </h5>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                            {metric.business_impact.length} impacts
                          </span>
                        </div>
                        {metric.business_impact.map((impact, impactIndex) => (
                          <div
                            key={impactIndex}
                            className="rounded-xl border border-slate-200/30 bg-gradient-to-br from-slate-50/50 via-white/30 to-slate-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/30 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-900/50"
                          >
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-tertiary-500 to-tertiary-600 p-1 text-sm font-bold text-white shadow-sm">
                                  {impact?.code || "?"}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white">
                                    {impact?.name || "N/A"}
                                  </div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {impact?.category || "Unknown Category"}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-bold ${getSeverityColor(impact?.severity || "low")} shadow-sm`}
                              >
                                {(impact?.severity || "low").toUpperCase()}
                              </span>
                            </div>
                            <p className="mb-3 leading-relaxed text-slate-700 dark:text-slate-300">
                              {impact?.description ||
                                "No explanation available"}
                            </p>
                            <div className="rounded-lg border border-slate-200/30 bg-white/70 p-3 shadow-sm backdrop-blur-sm dark:border-slate-700/30 dark:bg-slate-800/50">
                              <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                Example:
                              </div>
                              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                {impact?.example || "No example available"}
                              </p>
                            </div>
                            {impact?.risk_types?.length > 0 && (
                              <div className="mt-3">
                                <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Risk Types:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {impact.risk_types.map(
                                    (riskType: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 shadow-sm dark:bg-amber-900/40 dark:text-amber-200"
                                      >
                                        {riskType}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "actions" && (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {metric?.action_details?.map((action, actionIndex) => (
                      <div
                        key={actionIndex}
                        className="rounded-xl border border-slate-200/30 bg-slate-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/30 dark:bg-slate-800/50"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <h5 className="mb-2 font-semibold text-slate-900 dark:text-white">
                              {action?.action_id || "Unknown Action"}
                            </h5>
                            <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                              {action?.description ||
                                "No description available"}
                            </p>
                            <div className="space-y-3">
                              <div>
                                <h6 className="mb-2 text-sm font-medium text-slate-900 dark:text-white">
                                  ML Engineer Actions:
                                </h6>
                                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                  {action?.ml_engineer_action?.map(
                                    (item, idx) => (
                                      <li key={idx} className="leading-relaxed">
                                        {item}
                                      </li>
                                    )
                                  ) || <li>No actions available</li>}
                                </ul>
                              </div>
                              <div>
                                <h6 className="mb-2 text-sm font-medium text-slate-900 dark:text-white">
                                  Business Manager Actions:
                                </h6>
                                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                  {action?.business_manager_action?.map(
                                    (item, idx) => (
                                      <li key={idx} className="leading-relaxed">
                                        {item}
                                      </li>
                                    )
                                  ) || <li>No actions available</li>}
                                </ul>
                              </div>
                              <div>
                                <h6 className="mb-2 text-sm font-medium text-slate-900 dark:text-white">
                                  Compliance Manager Actions:
                                </h6>
                                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                  {action?.compliance_manager_action?.map(
                                    (item, idx) => (
                                      <li key={idx} className="leading-relaxed">
                                        {item}
                                      </li>
                                    )
                                  ) || <li>No actions available</li>}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="py-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400">
                          No actions available for this metric.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* {activeTab === "compliance" && (
                                    <motion.div
                                        key="compliance"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-4"
                                    >
                                        {metric?.control_details?.map((control, controlIndex) => (
                                            <div
                                                key={controlIndex}
                                                className="bg-gradient-to-br from-slate-50/50 via-white/30 to-slate-50/50 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-900/50 rounded-xl p-6 border border-slate-200/30 dark:border-slate-700/30 shadow-sm backdrop-blur-sm"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                                            <Shield className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                                {control?.name || "Unknown Control"}
                                                            </h5>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                Compliance Framework Requirements
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                                                    {control?.description || "No description available"}
                                                </p>
                                                <div className="space-y-4">
                                                    {control?.compliance_details?.map((compliance, idx) => (
                                                        <div key={idx} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-200/30 dark:border-slate-700/30 shadow-sm">
                                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-700 shadow-sm">
                                                                        {compliance?.framework || "Unknown Framework"}
                                                                    </span>
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                                        {compliance?.reference || "No reference"}
                                                                    </span>
                                                                </div>
                                                                {compliance?.regulatory_source_version && (
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-1 font-medium">
                                                                        {compliance.regulatory_source_version}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {compliance?.obligation_title && (
                                                                <div className="mb-3">
                                                                    <h6 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                                                                        {compliance.obligation_title}
                                                                    </h6>
                                                                    {compliance?.short_description && (
                                                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                                            {compliance.short_description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {compliance?.objective && (
                                                                <div className="mb-3 p-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg border border-slate-200/30 dark:border-slate-700/30">
                                                                    <div className="flex items-start space-x-2">
                                                                        <Target className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                                                                        <div>
                                                                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                                                Objective
                                                                            </div>
                                                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                                                {compliance.objective}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {compliance?.reference_keywords && compliance.reference_keywords.length > 0 && (
                                                                <div>
                                                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                                        Key Areas:
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {compliance.reference_keywords.map((keyword: string, keywordIdx: number) => (
                                                                            <span
                                                                                key={keywordIdx}
                                                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 shadow-sm"
                                                                            >
                                                                                {keyword}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )) || (
                                                            <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-200/30 dark:border-slate-700/30 shadow-sm">
                                                                <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                                                                    No detailed compliance information available
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        )) || (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Shield className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Compliance Controls</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                                        No compliance controls are currently available for this metric. Controls will appear here once they are configured.
                                                    </p>
                                                </div>
                                            )}
                                    </motion.div>
                                )} */}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default MetricDetailCard;
