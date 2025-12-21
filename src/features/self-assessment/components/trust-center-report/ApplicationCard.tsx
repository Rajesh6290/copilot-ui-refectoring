import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle,
  Database,
  Package,
  TrendingDown,
  TrendingUp,
  X,
  XCircle
} from "lucide-react";
import { JSX, useState } from "react";
import { Application, Pillar, RadarCoordinate } from "./ApplicationView";

const ApplicationCard: React.FC<{ application: Application }> = ({
  application
}) => {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const hasRAIData = application?.rai_data && application?.rai_data.pillars;

  const createRadarCoordinates = (
    pillars: Pillar[],
    centerX: number = 200,
    centerY: number = 200,
    maxRadius: number = 120
  ): RadarCoordinate[] => {
    const angleStep = (2 * Math.PI) / pillars.length;

    return pillars.map((pillar, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const radius = pillar.score * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const labelRadius = maxRadius + 60;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);

      return {
        ...pillar,
        x,
        y,
        labelX,
        labelY,
        angle: angle * (180 / Math.PI)
      };
    });
  };

  // Fixed coordinates - both charts use same center and scaling logic
  const fullRadarCoordinates = hasRAIData
    ? createRadarCoordinates(application.rai_data?.pillars ?? [], 225, 200, 120)
    : [];
  const compactRadarCoordinates = hasRAIData
    ? createRadarCoordinates(application.rai_data?.pillars ?? [], 150, 150, 80)
    : [];

  const createPath = (coordinates: RadarCoordinate[]): string => {
    if (coordinates.length === 0) {
      return "";
    }
    const pathCommands = coordinates.map(
      (coord, index) => `${index === 0 ? "M" : "L"} ${coord.x} ${coord.y}`
    );
    return pathCommands.join(" ") + " Z";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.7) {
      return "#10B981";
    }
    if (score >= 0.4) {
      return "#F59E0B";
    }
    return "#EF4444";
  };

  const getRiskColor = (riskBand: string): string => {
    switch (riskBand) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "med":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskIcon = (riskBand: string): JSX.Element | null => {
    switch (riskBand) {
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      case "med":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredMetrics =
    selectedPillar && hasRAIData && application.rai_data?.metrics
      ? application.rai_data.metrics.filter((metric) =>
          metric.pillar.includes(selectedPillar)
        )
      : [];

  // Threshold circles for radar chart background
  const thresholdLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const thresholdLabels = ["20%", "40%", "60%", "80%", "100%"];

  // Create pillar diagram coordinates for right side
  // const createPillarDiagramCoordinates = (
  //   pillars: Pillar[]
  // ): RadarCoordinate[] => {
  //   const centerX = 150;
  //   const centerY = 150;
  //   const radius = 80;
  //   const angleStep = (2 * Math.PI) / pillars.length;

  //   return pillars.map((pillar, index) => {
  //     const angle = index * angleStep - Math.PI / 2;
  //     const x = centerX + radius * Math.cos(angle);
  //     const y = centerY + radius * Math.sin(angle);

  //     return {
  //       ...pillar,
  //       x,
  //       y,
  //       labelX: x,
  //       labelY: y,
  //       angle: angle * (180 / Math.PI)
  //     };
  //   });
  // };

  // const pillarDiagramCoords = hasRAIData
  //   ? createPillarDiagramCoordinates(application.rai_data?.pillars ?? [])
  //   : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg dark:border-neutral-600 dark:bg-darkMainBackground"
    >
      {/* Application Header */}
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800 dark:text-white sm:text-xl">
            {application.name}
          </h1>
          {hasRAIData && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Health Index:
              </span>
              <span className="text-lg font-bold text-gray-800 dark:text-white">
                {application?.rai_data?.health_index}%
              </span>
              <span className="text-2xl">{application?.rai_data?.colour}</span>
            </div>
          )}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Purpose
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {application.purpose ||
                application.description ||
                "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Owner
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {application.owner_name || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Use Case Type
            </p>
            <p className="mt-1 text-sm capitalize text-gray-700 dark:text-gray-300">
              {application.use_case_type?.replace(/_/g, " ") || "Not specified"}
            </p>
          </div>
          {/* <div>
            <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              AI Application Type
            </p>
            <p className="mt-1 text-sm capitalize text-gray-700 dark:text-gray-300">
              {application.ai_application_type || "Not specified"}
            </p>
          </div> */}
        </div>

        {/* Mobile View: Cards */}
        <div className="space-y-4 md:hidden">
          {application.agents?.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-purple-900/10">
              <div className="mb-3 flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Agents
                </h3>
              </div>
              {application.agents.map((agent, idx) => (
                <div key={idx} className="border-b py-3 last:border-b-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {agent.agent_name || "Not specified"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Purpose:</span>{" "}
                    {agent.purpose || "Not specified"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Capabilities:</span>{" "}
                    {agent.action_supported?.join(", ") || "Not specified"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {application.models?.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-blue-900/10">
              <div className="mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Models
                </h3>
              </div>
              {application.models.map((model, idx) => (
                <div key={idx} className="border-b py-3 last:border-b-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {model.model_name || "Not specified"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Description:</span>{" "}
                    {model.model_description || "Not specified"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Type:</span>{" "}
                    {model.model_type || "Not specified"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Owner:</span>{" "}
                    {model.provider || "Not specified"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Compliance:</span>{" "}
                    {model.compliance_status
                      ?.join(", ")
                      ?.replace(/_/g, " ")
                      ?.toUpperCase() || "Not specified"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {application.datasets?.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-green-900/10">
              <div className="mb-3 flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Datasets
                </h3>
              </div>
              {application.datasets.map((dataset, idx) => (
                <div key={idx} className="border-b py-3 last:border-b-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {dataset.name || "Not specified"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Sensitive Data:</span>{" "}
                    {dataset.contains_sensitive_data ? "Yes" : "No"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Used For:</span>{" "}
                    <span className="capitalize">
                      {dataset.used_for || "Not specified"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop View: Tables */}
        <div className="hidden space-y-4 md:block">
          {application.agents?.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-purple-900/10">
              <div className="mb-3 flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Agents
                </h3>
              </div>
              <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white dark:border-blue-900/20 dark:bg-gray-800/60">
                <table className="min-w-full divide-y divide-blue-100 dark:divide-blue-900/20">
                  <thead className="bg-blue-50 dark:bg-blue-900/10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Agent Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Purpose
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Agent Capabilities
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 dark:divide-blue-900/10">
                    {application.agents.map((agent, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-800 dark:text-white">
                          {agent.agent_name || "Not specified"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                          {agent.purpose || "Not specified"}
                        </td>
                        <td className="px-4 py-2 text-sm capitalize text-gray-600 dark:text-gray-300">
                          {agent.action_supported?.join(", ") ||
                            "Not specified"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {application.models?.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-blue-900/10">
              <div className="mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Models
                </h3>
              </div>
              <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white dark:border-blue-900/20 dark:bg-gray-800/60">
                <table className="min-w-full divide-y divide-blue-100 dark:divide-blue-900/20">
                  <thead className="bg-blue-50 dark:bg-blue-900/10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Model Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Model Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Model Owner / Vendor
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Compliance Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 dark:divide-blue-900/10">
                    {application.models.map((model, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-800 dark:text-white">
                          {model.model_name || "Not specified"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                          {model.model_description || "Not specified"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm capitalize text-gray-600 dark:text-gray-300">
                          {model.model_type || "Not specified"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                          {model.provider || "Not specified"}
                        </td>
                        <td className="px-4 py-2">
                          {model.compliance_status &&
                          model.compliance_status.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {model.compliance_status.map((status, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium uppercase text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                >
                                  {status.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Not specified
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {application.datasets?.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-green-900/10">
              <div className="mb-3 flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Datasets
                </h3>
              </div>
              <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white dark:border-blue-900/20 dark:bg-gray-800/60">
                <table className="min-w-full divide-y divide-blue-100 dark:divide-blue-900/20">
                  <thead className="bg-blue-50 dark:bg-blue-900/10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Dataset Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Contains Sensitive Data
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-300">
                        Used For
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50 dark:divide-blue-900/10">
                    {application.datasets.map((dataset, idx) => (
                      <tr key={idx}>
                        <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-800 dark:text-white">
                          {dataset.name || "Not specified"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              dataset.contains_sensitive_data
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {dataset.contains_sensitive_data ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm capitalize text-gray-600 dark:text-gray-300">
                          {dataset.used_for || "Not specified"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced RAI Radar Chart Section */}
      {hasRAIData && (
        <div className="border-t border-gray-200 dark:border-neutral-600">
          <AnimatePresence mode="wait">
            {!selectedPillar ? (
              // Initial View: Radar Chart Left + Pillar Diagram Right
              <motion.div
                key="initial-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="grid gap-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20 lg:grid-cols-2"
              >
                {/* Left: Radar Chart (Like Image 1) - HORIZONTALLY CENTERED */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="flex w-full flex-col items-center justify-center"
                >
                  <div className="relative">
                    <svg width="450" height="400" className="drop-shadow-lg">
                      {/* Gradient definitions */}
                      <defs>
                        <linearGradient
                          id="radarFill"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#7DD3FC"
                            stopOpacity="0.6"
                          />
                          <stop
                            offset="50%"
                            stopColor="#3B82F6"
                            stopOpacity="0.4"
                          />
                          <stop
                            offset="100%"
                            stopColor="#1E40AF"
                            stopOpacity="0.3"
                          />
                        </linearGradient>
                      </defs>

                      {/* Background grid circles - CENTERED */}
                      {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, index) => (
                        <motion.circle
                          key={index}
                          cx="225"
                          cy="200"
                          r={level * 120}
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="1"
                          opacity="0.5"
                          initial={{ r: 0, opacity: 0 }}
                          animate={{ r: level * 120, opacity: 0.5 }}
                          transition={{ duration: 0.8, delay: 0.1 * index }}
                        />
                      ))}

                      {/* Percentage labels - CENTERED */}
                      {thresholdLevels.map((level, index) => (
                        <motion.text
                          key={index}
                          x="225"
                          y={200 - level * 120 - 8}
                          textAnchor="middle"
                          className="fill-gray-500 text-xs font-medium"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.5 + 0.1 * index
                          }}
                        >
                          {thresholdLabels[index]}
                        </motion.text>
                      ))}

                      {/* Grid lines from center to each pillar - CENTERED */}
                      {fullRadarCoordinates.map((coord, index) => (
                        <motion.line
                          key={index}
                          x1="225"
                          y1="200"
                          x2={coord.labelX}
                          y2={coord.labelY}
                          stroke="#E5E7EB"
                          strokeWidth="1"
                          opacity="0.5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.3 + index * 0.1
                          }}
                        />
                      ))}

                      {/* Data area filled polygon - CENTERED */}
                      <motion.path
                        d={createPath(fullRadarCoordinates)}
                        fill="url(#radarFill)"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          duration: 1.2,
                          ease: "easeOut",
                          delay: 0.8
                        }}
                      />

                      {/* Data points - CENTERED */}
                      {fullRadarCoordinates.map((coord, index) => (
                        <motion.circle
                          key={index}
                          cx={coord.x}
                          cy={coord.y}
                          r="4"
                          fill={getScoreColor(coord.score)}
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer"
                          onClick={() => setSelectedPillar(coord.pillar)}
                          whileHover={{ scale: 1.5, r: 6 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            duration: 0.4,
                            delay: 1.2 + index * 0.1,
                            type: "spring"
                          }}
                        />
                      ))}

                      {/* Pillar labels and percentages outside the chart - CENTERED */}
                      {fullRadarCoordinates.map((coord, index) => (
                        <motion.g key={index}>
                          {/* Pillar name */}
                          <motion.text
                            x={coord.labelX}
                            y={coord.labelY - 8}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="cursor-pointer fill-gray-700 text-sm font-semibold hover:fill-blue-600 dark:fill-gray-300"
                            onClick={() => setSelectedPillar(coord.pillar)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4 + index * 0.1 }}
                          >
                            {coord.pillar.length > 15
                              ? coord.pillar.substring(0, 12) + "..."
                              : coord.pillar}
                          </motion.text>

                          {/* Score percentage */}
                          <motion.text
                            x={coord.labelX}
                            y={coord.labelY + 8}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="cursor-pointer text-sm font-bold"
                            style={{ fill: getScoreColor(coord.score) }}
                            onClick={() => setSelectedPillar(coord.pillar)}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 1.6 + index * 0.1,
                              type: "spring"
                            }}
                          >
                            {Math.round(coord.score * 100)}%
                          </motion.text>
                        </motion.g>
                      ))}
                    </svg>
                  </div>
                </motion.div>

                {/* Right: Pillar Performance Dashboard (Like Image 2) - HORIZONTALLY CENTERED */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  className="mx-auto flex w-full flex-col rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
                >
                  <div className="mb-6 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Pillar Snapshot
                    </h2>
                  </div>

                  {/* Pillar Performance Bars */}
                  <div className="space-y-4">
                    {application.rai_data?.pillars.map((pillar, index) => (
                      <motion.div
                        key={pillar.pillar}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.2 }}
                        className="group cursor-pointer"
                        onClick={() => setSelectedPillar(pillar.pillar)}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400">
                            {pillar.pillar}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-bold"
                              style={{ color: getScoreColor(pillar.score) }}
                            >
                              {Math.round(pillar.score * 100)}%
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({pillar.metrics_count} metrics)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <motion.div
                            className="h-2 rounded-full transition-all duration-300 group-hover:shadow-md"
                            style={{
                              backgroundColor: getScoreColor(pillar.score)
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pillar.score * 100}%` }}
                            transition={{
                              duration: 1,
                              delay: 0.7 + index * 0.2
                            }}
                          />
                        </div>

                        {/* Current vs Target Line */}
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            Current: {Math.round(pillar.score * 100)}%
                          </span>
                          <span>Target: 90%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Overall Health Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="mt-8 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          Overall Health Score
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {application.rai_data?.metrics_processed} metrics
                          processed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {application?.rai_data?.health_index}%
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < (application?.rai_data?.stars || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Action Items */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                    className="mt-6"
                  >
                    <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Top Priority Areas
                    </h4>
                    <div className="space-y-2">
                      {application.rai_data?.pillars
                        .filter((pillar) => pillar.score < 0.7)
                        .slice(0, 3)
                        .map((pillar, index) => (
                          <motion.div
                            key={pillar.pillar}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 2 + index * 0.1 }}
                            className="flex cursor-pointer items-center gap-2 rounded bg-yellow-50 p-2 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
                            onClick={() => setSelectedPillar(pillar.pillar)}
                          >
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Improve {pillar.pillar}
                            </span>
                            <span className="ml-auto text-xs text-yellow-600">
                              {Math.round(pillar.score * 100)}%
                            </span>
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    Click on any pillar to view detailed metrics
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              // Detail View: Compact Radar Chart Left + Metrics Table Right
              <motion.div
                key="detail-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid gap-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20 lg:grid-cols-5"
              >
                {/* Left: Compact Radar Chart - FIXED TO MATCH MAIN CHART */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="mx-auto flex w-full flex-col items-center rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 lg:col-span-2"
                >
                  <div className="mb-4 flex w-full items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      RAI Overview
                    </h3>
                    <button
                      onClick={() => setSelectedPillar(null)}
                      className="rounded-full p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="flex w-full justify-center">
                    <svg width="300" height="300" className="drop-shadow-lg">
                      <defs>
                        <radialGradient
                          id="radarGradientSmall"
                          cx="50%"
                          cy="50%"
                          r="50%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3B82F6"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor="#1E40AF"
                            stopOpacity="0.1"
                          />
                        </radialGradient>
                        <linearGradient
                          id="radarFillSmall"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#7DD3FC"
                            stopOpacity="0.6"
                          />
                          <stop
                            offset="50%"
                            stopColor="#3B82F6"
                            stopOpacity="0.4"
                          />
                          <stop
                            offset="100%"
                            stopColor="#1E40AF"
                            stopOpacity="0.3"
                          />
                        </linearGradient>
                      </defs>

                      {/* Background grid circles - CENTERED */}
                      {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, index) => (
                        <circle
                          key={index}
                          cx="150"
                          cy="150"
                          r={level * 80}
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="1"
                          opacity="0.5"
                        />
                      ))}

                      {/* Percentage labels - CENTERED */}
                      {thresholdLevels.map((level, index) => (
                        <text
                          key={index}
                          x="150"
                          y={150 - level * 80 - 5}
                          textAnchor="middle"
                          className="fill-gray-500 text-xs font-medium"
                        >
                          {thresholdLabels[index]}
                        </text>
                      ))}

                      {/* Grid lines from center to each pillar - SAME AS MAIN CHART */}
                      {compactRadarCoordinates.map((_coord, index) => {
                        const angle =
                          (index * (2 * Math.PI)) /
                            compactRadarCoordinates.length -
                          Math.PI / 2;
                        const endX = 150 + (80 + 40) * Math.cos(angle);
                        const endY = 150 + (80 + 40) * Math.sin(angle);

                        return (
                          <line
                            key={`line-${index}`}
                            x1="150"
                            y1="150"
                            x2={endX}
                            y2={endY}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                            opacity="0.5"
                          />
                        );
                      })}

                      {/* Data area filled polygon - SAME STYLE AS MAIN */}
                      <path
                        d={createPath(compactRadarCoordinates)}
                        fill="url(#radarFillSmall)"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        opacity="0.8"
                      />

                      {/* Data points and labels - MATCHING MAIN CHART */}
                      {compactRadarCoordinates.map((coord, index) => {
                        const angle =
                          (index * (2 * Math.PI)) /
                            compactRadarCoordinates.length -
                          Math.PI / 2;
                        const labelRadius = 105;
                        const labelX = 150 + labelRadius * Math.cos(angle);
                        const labelY = 150 + labelRadius * Math.sin(angle);

                        return (
                          <g key={index}>
                            <motion.circle
                              cx={coord.x}
                              cy={coord.y}
                              r="6"
                              fill={
                                coord.pillar === selectedPillar
                                  ? "#3B82F6"
                                  : getScoreColor(coord.score)
                              }
                              stroke="white"
                              strokeWidth="2"
                              className="cursor-pointer"
                              onClick={() => setSelectedPillar(coord.pillar)}
                              whileHover={{ scale: 1.3 }}
                              whileTap={{ scale: 0.9 }}
                            />
                            {/* Pillar name - SAME POSITIONING LOGIC AS MAIN */}
                            <text
                              x={labelX}
                              y={labelY - 8}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className={`cursor-pointer text-xs font-semibold ${
                                coord.pillar === selectedPillar
                                  ? "fill-blue-600 dark:fill-blue-400"
                                  : "fill-gray-700 hover:fill-blue-600 dark:fill-gray-300 dark:hover:fill-blue-400"
                              }`}
                              onClick={() => setSelectedPillar(coord.pillar)}
                            >
                              {coord.pillar.length > 12
                                ? coord.pillar.substring(0, 10) + "..."
                                : coord.pillar}
                            </text>
                            {/* Score percentage - SAME AS MAIN */}
                            <text
                              x={labelX}
                              y={labelY + 8}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="cursor-pointer text-xs font-bold"
                              style={{ fill: getScoreColor(coord.score) }}
                              onClick={() => setSelectedPillar(coord.pillar)}
                            >
                              {Math.round(coord.score * 100)}%
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="mt-4 text-center">
                    <h4 className="font-semibold text-gray-800 dark:text-white">
                      {selectedPillar}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredMetrics.length} metrics
                    </p>
                  </div>
                </motion.div>

                {/* Right: Enhanced Metrics Table */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-h-[29rem] overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800 lg:col-span-3"
                >
                  <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                        {selectedPillar} Metrics
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total: {filteredMetrics.length}
                        </span>
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[24rem] overflow-y-auto">
                    {filteredMetrics.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Metric
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Value
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Risk
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Target Range
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            {filteredMetrics.map((metric, index) => (
                              <motion.tr
                                key={metric.metric_name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <td className="whitespace-nowrap px-4 py-3">
                                  <div className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                                    {metric.metric_name.replace(/_/g, " ")}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {metric.canonical_name}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {typeof metric.raw_value === "number"
                                      ? metric.raw_value.toFixed(3)
                                      : metric.raw_value}
                                  </div>
                                  <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                                    <motion.div
                                      className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                                      initial={{ width: 0 }}
                                      animate={{
                                        width: `${Math.min(metric.raw_value * 100, 100)}%`
                                      }}
                                      transition={{
                                        duration: 0.8,
                                        delay: 0.2 * index
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {typeof metric.risk === "number"
                                      ? metric.risk.toFixed(2)
                                      : metric.risk}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRiskColor(metric.risk_band)}`}
                                  >
                                    {getRiskIcon(metric.risk_band)}
                                    <span className="ml-1">
                                      {metric.risk_band.toUpperCase()}
                                    </span>
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3">
                                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                    {metric.better_high ? (
                                      <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                                    ) : (
                                      <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                                    )}
                                    <span>
                                      {metric.threshold_min} -{" "}
                                      {metric.threshold_max}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="max-w-xs text-xs text-gray-600 dark:text-gray-400">
                                    {metric.action}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          No metrics available for {selectedPillar}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
export default ApplicationCard;
