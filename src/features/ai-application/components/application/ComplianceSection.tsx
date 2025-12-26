"use client";
import React from "react";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Check, Award, BarChart3 } from "lucide-react";
import { ApplicationData } from "../../types/overview.types";

interface ComplianceSectionProps {
  data: ApplicationData;
  cardVariants: {
    hidden: { opacity: number; scale: number };
    visible: {
      opacity: number;
      scale: number;
      transition: { duration: number; ease: string };
    };
  };
}

const ComplianceSection: React.FC<ComplianceSectionProps> = ({
  data,
  cardVariants
}) => {
  // Get appropriate status color
  const getStatusColor = (status: string | string[] | null) => {
    if (!status) {
      return "gray";
    }
    const statusValue = Array.isArray(status) ? status[0] : status;
    if (!statusValue) {
      return "gray";
    }
    const statusLower = statusValue.toLowerCase();
    if (statusLower.includes("compliant")) {
      return "emerald";
    }
    if (statusLower.includes("non-compliant")) {
      return "red";
    }

    switch (statusLower) {
      case "under_review":
      case "under review":
        return "amber";
      case "active":
      case "approved":
        return "green";
      default:
        return "blue";
    }
  };

  return (
    <motion.div
      className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-xl dark:border-neutral-700 dark:from-darkSidebarBackground dark:to-neutral-900"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="mb-8 flex items-center space-x-4">
        <div className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 p-3 shadow-lg">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Compliance & Risk Assessment
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Security posture and regulatory compliance status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div
          className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg dark:from-blue-900/30 dark:to-blue-800/30"
          whileHover={{ scale: 1.05, rotate: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-blue-500 p-3 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Compliance Status
              </p>
              {Array.isArray(data?.compliance_status) &&
              data?.compliance_status.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {data.compliance_status.map(
                    (status: string, index: number) => (
                      <span
                        key={index}
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize bg-${getStatusColor(status)}-100 text-${getStatusColor(status)}-700 dark:bg-${getStatusColor(status)}-900 dark:text-${getStatusColor(status)}-200`}
                      >
                        <Award className="mr-1 h-3 w-3" />
                        {status.replace(/_/g, " ")}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-3 text-lg font-bold text-gray-600 dark:text-gray-400">
                  Not Assessed
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-lg dark:from-amber-900/30 dark:to-amber-800/30"
          whileHover={{ scale: 1.05, rotate: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-amber-500 p-3 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Risk Level
              </p>
              <p className="mt-3 text-2xl font-bold capitalize text-amber-700 dark:text-amber-300">
                {data?.risk_level || "Not Assessed"}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Current Status
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-lg dark:from-green-900/30 dark:to-green-800/30"
          whileHover={{ scale: 1.05, rotate: -1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-lg bg-green-500 p-3 shadow-lg">
                <Check className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                Audit Status
              </p>
              <p className="mt-3 text-2xl font-bold capitalize text-green-700 dark:text-green-300">
                {data?.audit_status || "Pending"}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Last Review
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Risk Information */}
      <motion.div
        className="mt-8 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-6 shadow-inner dark:from-gray-800 dark:to-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-6 flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Risk & Control Summary
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <TrendingUp className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.risk_ids?.length || 0}
            </p>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Identified Risks
            </p>
          </motion.div>
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.control_ids?.length || 0}
            </p>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Active Controls
            </p>
          </motion.div>
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.survey_ids?.length || 0}
            </p>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Surveys Completed
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ComplianceSection;
