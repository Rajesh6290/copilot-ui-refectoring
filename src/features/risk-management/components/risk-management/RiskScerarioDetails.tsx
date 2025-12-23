"use client";
import useSwr from "@/shared/hooks/useSwr";
import { Drawer } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Shield,
  Tag,
  Target,
  TrendingUp,
  User,
  X,
  XCircle
} from "lucide-react";
interface AuditTrailEntry {
  action: string;
  status: string;
  action_by: string;
  action_at: string;
  ip: string;
}
const SkeletonLine = ({
  width = "100%",
  height = "16px"
}: {
  width?: string;
  height?: string;
}) => (
  <div
    className="animate-pulse rounded bg-gray-200 dark:bg-gray-700"
    style={{ width, height }}
  />
);

const SkeletonCard = () => (
  <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
    <SkeletonLine width="60%" height="20px" />
    <SkeletonLine width="100%" height="14px" />
    <SkeletonLine width="80%" height="14px" />
  </div>
);

const InfoCard = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  icon: Icon,
  title,
  value,
  className = "",
  valueClassName = ""
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string | number | null;
  className?: string;
  valueClassName?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 ${className}`}
  >
    <div className="mb-2 flex items-center gap-2">
      <Icon size={16} className="text-gray-500" />
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {title}
      </span>
    </div>
    <div
      className={`text-lg font-semibold text-gray-900 dark:text-white ${valueClassName}`}
    >
      {value || "Not specified"}
    </div>
  </motion.div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (s: string) => {
    switch (s?.toLowerCase()) {
      case "active":
        return {
          color:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          icon: CheckCircle2
        };
      case "in_active":
        return {
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          icon: XCircle
        };
      case "draft":
        return {
          color:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          icon: Clock
        };
      default:
        return {
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          icon: Activity
        };
    }
  };

  const { color, icon: StatusIcon } = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium ${color}`}
    >
      <StatusIcon size={14} />
      {status?.replace("_", " ").toUpperCase()}
    </span>
  );
};

const RiskLevelBadge = ({ level }: { level: string }) => {
  const getRiskLevelConfig = (l: string) => {
    switch (l?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${getRiskLevelConfig(level)}`}
    >
      <AlertTriangle size={14} className="mr-1" />
      {level || "Unknown"}
    </span>
  );
};

const AuditTrailItem = ({
  item,
  index
}: {
  item: AuditTrailEntry;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
  >
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-tertiary-100 dark:bg-tertiary-900">
      <Activity
        size={16}
        className="text-tertiary-600 dark:text-tertiary-300"
      />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {item.action} by {item.action_by}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Status: <span className="font-medium">{item.status}</span>
      </p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        {new Date(item.action_at).toLocaleString()}
      </p>
    </div>
  </motion.div>
);

const RiskScenarioDetails = ({
  open,
  onClose,
  riskId
}: {
  open: boolean;
  onClose: () => void;
  riskId: string;
}) => {
  const { data, isValidating } = useSwr(
    riskId ? `risk?doc_id=${riskId}` : null
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: "40rem" },
          maxWidth: "100vw"
        }
      }}
    >
      <div className="relative flex h-dvh flex-col bg-white dark:bg-darkMainBackground">
        {/* Header */}
        <div className="flex w-full flex-shrink-0 items-center justify-between bg-tertiary px-6 py-4 shadow-sm">
          {isValidating ? (
            <div className="flex items-center gap-3">
              <SkeletonLine width="200px" height="24px" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <FileText className="text-white" size={24} />
              <div>
                <h2 className="text-xl font-bold text-white">{data?.name}</h2>
              </div>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition-shadow hover:shadow-lg"
          >
            <X className="text-tertiary" size={20} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isValidating ? (
            // Skeleton Loading
            <div className="space-y-6 p-6">
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8 p-6"
              >
                {/* Status and Basic Info */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status={data?.status} />
                    <RiskLevelBadge level={data?.risk_level} />
                    <span className="inline-flex items-center rounded-full bg-tertiary-100 px-2.5 py-1 text-sm font-medium text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-300">
                      Score: {data?.risk_score}
                    </span>
                  </div>

                  {data?.description && (
                    <div className="rounded-lg border-l-4 border-tertiary-400 bg-tertiary-50 p-4 dark:bg-tertiary-900/20">
                      <p className="text-gray-700 dark:text-gray-300">
                        {data.description}
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Key Information Grid */}
                <motion.div variants={itemVariants}>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Risk Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoCard
                      icon={User}
                      title="Risk Owner"
                      value={data?.risk_owner}
                    />
                    <InfoCard
                      icon={Target}
                      title="Risk Type"
                      value={data?.risk_type}
                    />
                    <InfoCard
                      icon={TrendingUp}
                      title="Likelihood"
                      value={data?.likelihood}
                      valueClassName={
                        data?.likelihood?.toLowerCase() === "likely"
                          ? "text-red-600 dark:text-red-400"
                          : data?.likelihood?.toLowerCase() === "possible"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-green-600 dark:text-green-400"
                      }
                    />
                    <InfoCard
                      icon={AlertTriangle}
                      title="Impact Level"
                      value={data?.impact}
                      valueClassName={
                        data?.impact?.toLowerCase() === "high"
                          ? "text-red-600 dark:text-red-400"
                          : data?.impact?.toLowerCase() === "medium"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-green-600 dark:text-green-400"
                      }
                    />
                  </div>
                </motion.div>

                {/* Mitigation Strategy */}
                {data?.mitigation_strategy && (
                  <motion.div variants={itemVariants}>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                      <Shield size={20} />
                      Mitigation Strategy
                    </h3>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                      <p className="text-gray-700 dark:text-gray-300">
                        {data.mitigation_strategy}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Tags */}
                {data?.tags && data.tags.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                      <Tag size={20} />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.map((tag: string, index: number) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Additional Details */}
                <motion.div variants={itemVariants}>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <InfoCard
                      icon={Eye}
                      title="Control Effectiveness"
                      value={
                        data?.control_effectiveness
                          ? `${(data.control_effectiveness * 100).toFixed(0)}%`
                          : null
                      }
                    />
                    <InfoCard
                      icon={CheckCircle2}
                      title="Readiness Status"
                      value={data?.readiness_status
                        ?.replace("_", " ")
                        .toUpperCase()}
                    />
                    <InfoCard
                      icon={Calendar}
                      title="Version"
                      value={data?.version}
                    />
                  </div>
                </motion.div>

                {/* Audit Trail */}
                {data?.audit_trail && data.audit_trail.length > 0 && (
                  <motion.div variants={itemVariants}>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                      <Clock size={20} />
                      Audit Trail
                    </h3>
                    <div className="space-y-3">
                      {data.audit_trail
                        .flat()
                        .map((item: AuditTrailEntry, index: number) => (
                          <AuditTrailItem
                            key={index}
                            item={item}
                            index={index}
                          />
                        ))}
                    </div>
                  </motion.div>
                )}

                {/* Timestamps */}
                <motion.div variants={itemVariants}>
                  <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:grid-cols-2">
                    <InfoCard
                      icon={Calendar}
                      title="Created At"
                      value={
                        data?.created_at
                          ? new Date(data.created_at).toLocaleDateString()
                          : null
                      }
                    />
                    <InfoCard
                      icon={Calendar}
                      title="Updated At"
                      value={
                        data?.updated_at
                          ? new Date(data.updated_at).toLocaleDateString()
                          : null
                      }
                    />
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default RiskScenarioDetails;
