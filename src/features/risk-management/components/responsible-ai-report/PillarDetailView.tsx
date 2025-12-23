"use client";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Shield } from "lucide-react";
import dynamic from "next/dynamic";
import type React from "react";
import { useState } from "react";
import { PillarMetric } from "./ResposibleAiReport";
const MetricDetailCard = dynamic(() => import("./MetricDetailCard"), {
  ssr: false
});

interface PillarDetailViewProps {
  pillar: PillarMetric;
  onBack: () => void;
  selectedMetricId?: string;
}

const PillarDetailView: React.FC<PillarDetailViewProps> = ({
  pillar,
  onBack,
  selectedMetricId
}) => {
  const [expandedMetricId, setExpandedMetricId] = useState<string | null>(null);

  const handleMetricToggle = (metricId: string) => {
    setExpandedMetricId(expandedMetricId === metricId ? null : metricId);
  };

  const pillarName =
    pillar?.pillar
      ?.replace(/_/g, " ")
      ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Unknown Pillar";

  const currentScore = Math.round((pillar?.score || 0) * 100);
  const targetScore = 75;
  const metricsCount = pillar?.metrics?.length || 0;

  const getScoreColor = (score: number) => {
    if (score >= 75) {
      return "text-emerald-600";
    }
    if (score >= 50) {
      return "text-amber-600";
    }
    return "text-rose-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) {
      return "from-emerald-50/50 via-green-50/30 to-teal-50/50 dark:from-emerald-950/20 dark:via-green-950/10 dark:to-teal-950/20";
    }
    if (score >= 50) {
      return "from-amber-50/50 via-orange-50/30 to-yellow-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20";
    }
    return "from-rose-50/50 via-red-50/30 to-pink-50/50 dark:from-rose-950/20 dark:via-red-950/10 dark:to-pink-950/20";
  };

  const getStatusText = (score: number) => {
    if (score >= 75) {
      return "Above Target";
    }
    if (score >= 50) {
      return "Below Target";
    }
    return "Critical";
  };

  const getStatusIcon = (score: number) => {
    if (score >= 75) {
      return "↗";
    }
    return "↘";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Back Navigation */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <button
          onClick={onBack}
          className="group flex w-fit items-center space-x-2 text-slate-600 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm font-medium">Back to Overview</span>
        </button>
        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <span>{pillarName}</span>
          {selectedMetricId && (
            <>
              <span className="text-slate-300 dark:text-slate-600">›</span>
              <span className="text-slate-700 dark:text-slate-300">
                {selectedMetricId}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Pillar Header Card */}
      <motion.div
        className={`bg-gradient-to-br ${getScoreBgColor(currentScore)} rounded-2xl border border-white/20 p-6 shadow-xl backdrop-blur-sm dark:border-slate-800/50 lg:p-8`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="mb-6 flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${
                  currentScore >= 75
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                    : currentScore >= 50
                      ? "bg-gradient-to-br from-amber-500 to-orange-600"
                      : "bg-gradient-to-br from-rose-500 to-red-600"
                } text-white`}
              >
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white lg:text-2xl 2xl:text-3xl">
                  {pillarName} Pillar
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-semibold ${getStatusIcon(currentScore) === "↗" ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {getStatusIcon(currentScore)}
                    </span>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {getStatusText(currentScore)}
                    </span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {metricsCount} metrics assessed
                  </span>
                </div>
              </div>
            </div>

            {/* Functional Description */}
            <div className="rounded-xl border border-white/30 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700/30 dark:bg-slate-800/60">
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                In the{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {pillarName}
                </span>{" "}
                Pillar,{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {metricsCount}
                </span>{" "}
                metrics were assessed, highlighting areas of elevated risk and
                potential improvement, with a current score of
                <span className={`font-bold ${getScoreColor(currentScore)}`}>
                  {" "}
                  {currentScore}%
                </span>{" "}
                against a target score of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {" "}
                  {targetScore}%
                </span>
                .
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/80">
              {/* Background decoration */}
              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-4 translate-x-4 rounded-full bg-gradient-to-br from-slate-500/5 to-slate-600/5"></div>
              <div className="absolute bottom-0 left-0 h-16 w-16 -translate-x-4 translate-y-4 rounded-full bg-gradient-to-tr from-slate-500/5 to-slate-600/5"></div>

              <div className="relative z-10">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Performance Score
                  </div>
                  <div
                    className={`h-3 w-3 rounded-full ${
                      currentScore >= 75
                        ? "bg-emerald-500"
                        : currentScore >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    } animate-pulse shadow-sm`}
                  ></div>
                </div>
                <div className="mb-6 flex items-end justify-center space-x-4">
                  <div className="text-center">
                    <div
                      className={`text-5xl font-bold ${getScoreColor(currentScore)} mb-1`}
                    >
                      {currentScore}%
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Current
                    </div>
                  </div>
                  <div className="mb-4 text-3xl font-light text-slate-300 dark:text-slate-600">
                    /
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-3xl font-semibold text-slate-500 dark:text-slate-400">
                      {targetScore}%
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Target
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className={`flex items-center space-x-1 rounded-full px-4 py-2 text-xs font-semibold ${
                      currentScore >= targetScore
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    } shadow-sm`}
                  >
                    <span>{getStatusIcon(currentScore)}</span>
                    <span>{getStatusText(currentScore)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Metrics
            </h2>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300">
              {metricsCount} metrics
            </span>
          </div>
        </div>

        {pillar?.metrics?.length ? (
          pillar.metrics.map((metric, index) => (
            <div key={metric?.metric_name || index} id={metric?.metric_name}>
              <MetricDetailCard
                metric={metric}
                index={index}
                isExpanded={
                  expandedMetricId === (metric?.metric_name || index.toString())
                }
                onToggle={() =>
                  handleMetricToggle(metric?.metric_name || index.toString())
                }
              />
            </div>
          ))
        ) : (
          <motion.div
            className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">
              No Metrics Available
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              No metrics have been configured for the {pillarName} pillar yet.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PillarDetailView;
