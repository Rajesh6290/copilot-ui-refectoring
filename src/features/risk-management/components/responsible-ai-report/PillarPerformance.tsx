"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  OctagonAlert
} from "lucide-react";
import { useState } from "react";
import { ApiData, PillarMetric, RadarPoint } from "./ResposibleAiReport";

interface PillarPerformanceProps {
  data: ApiData;
  onPillarClick: (pillar: PillarMetric, metricId?: string) => void;
}

const PillarPerformance: React.FC<PillarPerformanceProps> = ({
  data,
  onPillarClick
}) => {
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);

  // Helper functions
  const getPillarColor = (pillar: PillarMetric): string => {
    const hasData =
      (pillar?.metrics_count || 0) > 0 && (pillar?.metrics?.length || 0) > 0;
    if (!hasData) {
      return "#6b7280";
    }

    const score = Math.round((pillar?.score || 0) * 100);
    if (score >= 75) {
      return "#10b981";
    }
    if (score >= 50) {
      return "#f59e0b";
    }
    return "#ef4444";
  };

  const getPillarIcon = (pillar: PillarMetric): React.ReactNode => {
    const hasData = (pillar?.metrics?.length || 0) > 0;
    if (!hasData) {
      return <Info className="h-4 w-4 text-gray-600" />;
    }

    const score = Math.round((pillar?.score || 0) * 100);
    if (score >= 75) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (score >= 50) {
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
    return <OctagonAlert className="h-4 w-4 text-red-600" />;
  };

  const getPillarBgColor = (pillar: PillarMetric): string => {
    const hasData = (pillar?.metrics?.length || 0) > 0;
    if (!hasData) {
      return "bg-gray-100 dark:bg-gray-900/30";
    }

    const score = Math.round((pillar?.score || 0) * 100);
    if (score >= 75) {
      return "bg-green-100 dark:bg-green-900/30";
    }
    if (score >= 50) {
      return "bg-orange-100 dark:bg-orange-900/30";
    }
    return "bg-red-100 dark:bg-red-900/30";
  };

  const getPillarTextColor = (pillar: PillarMetric): string => {
    const hasData = (pillar?.metrics?.length || 0) > 0;
    if (!hasData) {
      return "text-gray-600";
    }

    const score = Math.round((pillar?.score || 0) * 100);
    if (score >= 75) {
      return "text-green-600";
    }
    if (score >= 50) {
      return "text-orange-600";
    }
    return "text-red-600";
  };

  const handlePillarClick = (pillar: PillarMetric): void => {
    onPillarClick(pillar);
  };

  // Transform API data to display format
  const radarData =
    data?.pillar_metrics?.map((pillar: PillarMetric) => {
      const hasData = (pillar?.metrics?.length || 0) > 0;
      const pillarValue = hasData ? Math.round((pillar?.score || 0) * 100) : 0;
      const pillarName =
        pillar?.pillar
          ?.replace(/_/g, " ")
          ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
        "Unknown Pillar";

      return {
        name: pillarName,
        value: pillarValue,
        color: getPillarColor(pillar),
        metrics_count: pillar?.metrics?.length || 0,
        metrics: pillar?.metrics || [],
        hasData: hasData,
        pillar: pillar
      };
    }) || [];
  const THRESHOLD_SCORE = 75;
  const transformApiDataToRadar = (apiData: ApiData): RadarPoint[] => {
    if (!apiData?.pillar_metrics) {
      return [];
    }
    return apiData.pillar_metrics.map((pillar: PillarMetric) => {
      const hasData = (pillar?.metrics?.length || 0) > 0;
      const pillarValue = hasData ? Math.round((pillar?.score || 0) * 100) : 0;
      const pillarName =
        pillar?.pillar
          ?.replace(/_/g, " ")
          ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
        "Unknown Pillar";

      return {
        name: pillarName,
        value: pillarValue,
        color: getPillarColor(pillar),
        metrics_count: pillar?.metrics?.length || 0,
        metrics: pillar?.metrics || [],
        hasData: hasData
      };
    });
  };

  const generateRadarPath = (
    datas: RadarPoint[]
  ): (RadarPoint & { x: number; y: number })[] => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const angleStep = (2 * Math.PI) / datas.length;
    return datas.map((point, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const value = (point.value / 100) * radius;
      const x = centerX + Math.cos(angle) * value;
      const y = centerY + Math.sin(angle) * value;
      return { x, y, ...point };
    });
  };

  const handlePillarClicks = (pillarName: string): void => {
    if (!data?.pillar_metrics) {
      return;
    }
    const pillar = data.pillar_metrics.find(
      (p: PillarMetric) =>
        p?.pillar
          ?.replace(/_/g, " ")
          ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) === pillarName
    );
    if (pillar) {
      onPillarClick(pillar);
    }
  };
  const radarDatas = transformApiDataToRadar(data);
  const radarPoints = generateRadarPath(radarData);
  return (
    <motion.div
      className="rounded-2xl border bg-white shadow-lg dark:border-neutral-900 dark:bg-darkSidebarBackground"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Header */}
      <div className="p-4 dark:border-neutral-800 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg sm:h-12 sm:w-12">
              <Activity className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                AI Pillars Performance Metrics
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click any pillar to view detailed metrics
              </p>
            </div>
          </div>
          <span
            className={`w-fit whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm ${
              (data?.health_index || 0) >= 75
                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                : (data?.health_index || 0) >= 50
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
                  : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
            }`}
          >
            {(data?.health_index || 0) >= 75
              ? "Excellent Performance"
              : (data?.health_index || 0) >= 50
                ? "Needs Improvement"
                : "Critical Issues Detected"}
          </span>
        </div>
      </div>

      {/* Pillar List */}
      <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center">
        <div className="mb-6 w-full overflow-hidden lg:w-2/5">
          <div className="relative flex w-full justify-center rounded-xl p-2 backdrop-blur-sm">
            <motion.svg
              width="100%"
              height="400"
              viewBox="0 0 300 300"
              className="max-w-sm sm:max-w-md lg:max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              {/* Grid circles */}
              {[20, 40, 60, 80, 100].map((percent) => (
                <motion.circle
                  key={percent}
                  cx="150"
                  cy="150"
                  r={(percent / 100) * 100}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  opacity="0.7"
                  className="dark:stroke-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ duration: 0.8, delay: percent * 0.05 }}
                />
              ))}

              {/* Threshold circle */}
              <motion.circle
                cx="150"
                cy="150"
                r={(THRESHOLD_SCORE / 100) * 100}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 1.0, delay: 0.8 }}
              />

              {/* Axis lines */}
              {radarDatas.map((_, index) => {
                const angle =
                  (index * (2 * Math.PI)) / radarData.length - Math.PI / 2;
                const x2 = 150 + Math.cos(angle) * 100;
                const y2 = 150 + Math.sin(angle) * 100;
                return (
                  <motion.line
                    key={index}
                    x1="150"
                    y1="150"
                    x2={x2}
                    y2={y2}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    opacity="0.7"
                    className="dark:stroke-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
                  />
                );
              })}

              {/* Radar area */}
              <motion.path
                d={`M ${radarPoints.map((p) => `${p.x},${p.y}`).join(" L ")} Z`}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, delay: 1.2 }}
              />

              {/* Data points */}
              {radarPoints.map((point, index) => (
                <motion.g key={point.name}>
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill={point.color}
                    opacity="0.15"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    transition={{ duration: 0.8, delay: 1.5 + index * 0.2 }}
                  />
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill={point.color}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer transition-all dark:stroke-gray-800"
                    onClick={() => handlePillarClicks(point.name)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.8 + index * 0.2 }}
                    whileHover={{
                      scale: 1.3,
                      stroke: "#10b981",
                      strokeWidth: 3
                    }}
                    whileTap={{ scale: 0.9 }}
                  />
                </motion.g>
              ))}

              {/* Labels */}
              {radarPoints.map((point, index) => {
                const angle =
                  (index * (2 * Math.PI)) / radarData.length - Math.PI / 2;
                const labelDistance = 120;
                const labelX = 150 + Math.cos(angle) * labelDistance;
                const labelY = 150 + Math.sin(angle) * labelDistance;
                return (
                  <g key={`label-${point.name}`}>
                    <motion.text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#374151"
                      className="cursor-pointer dark:fill-gray-300"
                      onClick={() => handlePillarClicks(point.name)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.5 + index * 0.2 }}
                    >
                      {point.name.length > 12
                        ? point.name.substring(0, 10) + "..."
                        : point.name}
                    </motion.text>
                    <motion.text
                      x={labelX}
                      y={labelY + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="9"
                      fontWeight="500"
                      fill={point.color}
                      className="cursor-pointer"
                      onClick={() => handlePillarClicks(point.name)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.5 + index * 0.2 }}
                    >
                      {point.hasData ? `${point.value}%` : "No Data"}
                    </motion.text>
                  </g>
                );
              })}
            </motion.svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 sm:gap-6">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>Above Threshold</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full border-2 border-green-500"></div>
              <span>Threshold ({THRESHOLD_SCORE}%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-gray-500"></div>
              <span>No Data</span>
            </div>
          </div>
        </div>
        <div className="w-full p-4 sm:p-6 lg:w-3/5">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-neutral-900 dark:bg-gray-800/50">
            <div className="space-y-3 sm:space-y-4">
              {radarData?.map(
                (
                  pillar: RadarPoint & { pillar: PillarMetric },
                  index: number
                ) => {
                  const pillarData = pillar.pillar;
                  const hasData = (pillarData?.metrics?.length || 0) > 0;
                  const displayValue = hasData ? `${pillar.value}%` : "No Data";
                  const statusLabel = hasData
                    ? pillar.value >= 75
                      ? "Good"
                      : pillar.value >= 50
                        ? "Warning"
                        : "Critical"
                    : "No Data";

                  return (
                    <motion.div
                      key={pillar.name}
                      className="group relative flex cursor-pointer flex-col gap-2 rounded-xl px-4 py-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 sm:flex-row sm:items-center"
                      onClick={() => handlePillarClick(pillarData)}
                      onMouseEnter={() => setHoveredPillar(pillar.name)}
                      onMouseLeave={() => setHoveredPillar(null)}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Pillar Info */}
                      <div className="flex flex-shrink-0 items-center space-x-3 sm:w-48 sm:space-x-4">
                        <motion.div
                          className="size-2 rounded-full shadow-lg"
                          style={{
                            backgroundColor: getPillarColor(pillarData)
                          }}
                          animate={{
                            boxShadow: `0 0 15px ${getPillarColor(pillarData)}40`
                          }}
                          transition={{
                            boxShadow: { duration: 2, repeat: Infinity }
                          }}
                        />
                        <span className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                          {pillar.name}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative min-w-0 flex-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-600">
                          <motion.div
                            className="relative h-full overflow-hidden rounded-full"
                            style={{
                              background: hasData
                                ? `linear-gradient(90deg, ${getPillarColor(pillarData)}, ${getPillarColor(pillarData)}dd)`
                                : "linear-gradient(90deg, #6b7280, #6b7280dd)"
                            }}
                            initial={{ width: 0 }}
                            animate={{
                              width: hasData ? `${pillar.value}%` : "0%"
                            }}
                            transition={{
                              duration: 1.5,
                              delay: index * 0.2,
                              ease: "easeOut"
                            }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.3
                              }}
                            />
                          </motion.div>

                          {/* Threshold marker */}
                          {hasData && (
                            <motion.div
                              className="group/threshold absolute top-0 flex h-full items-center justify-center"
                              style={{ left: "75%" }}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.2 + 1 }}
                            >
                              <motion.div
                                className="relative h-5 w-1 rounded bg-green-600 shadow-lg sm:h-4"
                                animate={{
                                  boxShadow: [
                                    "0 0 5px #10b981",
                                    "0 0 15px #10b981",
                                    "0 0 5px #10b981"
                                  ]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity
                                }}
                              />
                              <AnimatePresence>
                                {hoveredPillar === pillar.name && (
                                  <motion.div
                                    className="absolute -top-10 z-10 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-gray-900 sm:-top-12 sm:px-3 sm:py-1.5"
                                    initial={{ opacity: 0, y: 5, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    Excellence Threshold (75%)
                                    <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-white"></div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )}
                          {hasData && (
                            <motion.div
                              className="absolute -top-8 rounded-lg bg-gray-800 px-2 py-1 text-xs font-bold text-white shadow-lg dark:bg-white dark:text-gray-800 sm:-top-10 sm:px-3 sm:py-1.5"
                              style={{
                                left: hasData ? `${pillar.value}%` : "0px",
                                transform: hasData
                                  ? "translateX(-50%)"
                                  : "translateX(0%)"
                              }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.2 + 1 }}
                            >
                              {displayValue}
                              <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 transform border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800 dark:border-t-white"></div>
                            </motion.div>
                          )}
                        </div>

                        {/* Value label */}
                      </div>

                      {/* Status and Icon */}
                      <motion.div
                        className="flex flex-shrink-0 items-center justify-between space-x-3 sm:w-30 sm:justify-end sm:space-x-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        <span
                          className={`text-sm font-bold ${getPillarTextColor(pillarData)}`}
                        >
                          {statusLabel}
                        </span>
                        <motion.div
                          className={`rounded-full p-2 ${getPillarBgColor(pillarData)} shadow-lg`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 2, -2, 0]
                          }}
                          transition={{
                            scale: { duration: 2, repeat: Infinity },
                            rotate: { duration: 3, repeat: Infinity }
                          }}
                        >
                          {getPillarIcon(pillarData)}
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PillarPerformance;
