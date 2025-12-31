"use client";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Cpu,
  Database,
  Info,
  Link,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  Users,
  Zap
} from "lucide-react";
import moment from "moment";
import React from "react";
import { toast } from "sonner";
import { ExpandedCards, Model } from "../../types/overview.types";

interface ISAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        update: boolean;
        delete: boolean;
        read: boolean;
      };
    };
  }[];
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      update: boolean;
      delete: boolean;
      read: boolean;
    };
  };
}

interface ModelsSectionProps {
  linkedModels: Model[];
  expandedCards: ExpandedCards;
  toggleCardExpansion: (cardType: string) => void;
  handleAddModel: () => void;
  handleEditModel: (model: Model) => void;
  handleDeleteModel: (model: Model) => void;
  isAccess: ISAccess;
  cardVariants: {
    hidden: { opacity: number; scale: number };
  };
  mutate: () => void;
  isRefreshing?: boolean;
}

const ModelsSection: React.FC<ModelsSectionProps> = ({
  linkedModels,
  handleAddModel,
  handleEditModel,
  handleDeleteModel,
  isAccess,
  cardVariants
}) => {
  const getComplianceStatus = (status: string[]) => {
    if (!status || status.length === 0) {
      return { text: "Not Assessed", color: "gray", icon: AlertTriangle };
    }

    const primaryStatus = status[0];
    switch (primaryStatus?.toLowerCase()) {
      case "soc_2":
        return { text: "SOC 2 Compliant", color: "green", icon: CheckCircle };
      case "hipaa":
        return { text: "HIPAA Compliant", color: "blue", icon: Shield };
      case "gdpr":
        return { text: "GDPR Compliant", color: "purple", icon: Shield };
      case "not_assessed":
        return { text: "Not Assessed", color: "orange", icon: AlertTriangle };
      default:
        return {
          text: primaryStatus
            ? primaryStatus.replace(/_/g, " ").toUpperCase()
            : "Unknown",
          color: "gray",
          icon: Info
        };
    }
  };

  return (
    <motion.div
      className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-blue-50 p-4 shadow-xl dark:border-neutral-700 dark:from-darkSidebarBackground dark:to-blue-900/20 sm:rounded-2xl sm:p-6 md:p-8"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {/* Header Section */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative shrink-0 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-2 shadow-lg sm:rounded-xl sm:p-3">
            <Cpu className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white sm:h-6 sm:w-6">
              {linkedModels.length}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              AI Models
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              {linkedModels.length}{" "}
              {linkedModels.length === 1 ? "model" : "models"} configured
            </p>
          </div>
        </div>
        {isAccess?.buttons?.[0]?.permission?.is_shown && (
          <motion.button
            onClick={() => {
              if (isAccess?.buttons?.[0]?.permission?.actions?.create) {
                handleAddModel();
              } else {
                toast.error(
                  "You don't have permission to perform this action."
                );
              }
            }}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 sm:w-auto sm:rounded-xl sm:px-6 sm:py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Add Model</span>
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {linkedModels.length > 0 ? (
          linkedModels.map((model: Model, index: number) => {
            const complianceInfo = getComplianceStatus(model.compliance_status);
            const ComplianceIcon = complianceInfo.icon;

            return (
              <motion.div
                key={model.doc_id}
                className="dark:via-gray-850 group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 sm:rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="p-4 sm:p-6">
                  {/* Header with Model Info */}
                  <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start space-x-2 sm:items-center sm:space-x-3">
                        <div className="shrink-0">
                          <div className="rounded-lg bg-gray-100 p-1.5 dark:bg-gray-700 sm:p-2">
                            <Cpu className="h-3.5 w-3.5 text-blue-500 sm:h-4 sm:w-4" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="break-words text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                            {model.model_name}
                          </h4>
                          <p className="break-words text-xs text-gray-500 dark:text-gray-400">
                            v{model.model_version} • {model.provider}
                          </p>
                        </div>
                      </div>
                      <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                        {model.model_description || "No description available"}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex shrink-0 items-start space-x-2 opacity-100 transition-opacity group-hover:opacity-100 sm:flex-col sm:space-x-0 sm:space-y-2 sm:opacity-0">
                      {isAccess?.buttons?.[2]?.permission?.is_shown && (
                        <motion.button
                          onClick={() => {
                            if (
                              isAccess?.buttons?.[2]?.permission?.actions
                                ?.update
                            ) {
                              handleEditModel(model);
                            } else {
                              toast.error(
                                "You don't have permission to perform this action."
                              );
                            }
                          }}
                          className="rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 sm:p-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit Model"
                        >
                          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </motion.button>
                      )}
                      {isAccess?.buttons?.[3]?.permission?.is_shown && (
                        <motion.button
                          onClick={() => {
                            if (
                              isAccess?.buttons?.[3]?.permission?.actions
                                ?.delete
                            ) {
                              handleDeleteModel(model);
                            } else {
                              toast.error(
                                "You don't have permission to perform this action."
                              );
                            }
                          }}
                          className="rounded-lg bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-300 sm:p-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete Model"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="mb-4 flex flex-wrap items-center gap-1.5 sm:mb-6 sm:gap-2">
                    {/* Model Status */}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold sm:px-3 sm:py-1 ${
                        model.model_status?.toLowerCase() === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      <Activity className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {model.model_status}
                    </span>

                    {/* Model Type */}
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200 sm:px-3 sm:py-1">
                      <Sparkles className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {model.model_type}
                    </span>

                    {/* Fine-tuned Badge */}
                    {model.fine_tuned && (
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200 sm:px-3 sm:py-1">
                        <Zap className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        Fine-tuned
                      </span>
                    )}
                  </div>

                  {/* Key Information Grid */}
                  <div className="mb-4 grid grid-cols-1 gap-2 sm:mb-6 sm:grid-cols-2 sm:gap-3">
                    {/* Compliance Status */}
                    <div
                      className={`rounded-lg p-2.5 sm:p-3 ${
                        complianceInfo.color === "green"
                          ? "bg-green-50 dark:bg-green-900/30"
                          : complianceInfo.color === "blue"
                            ? "bg-blue-50 dark:bg-blue-900/30"
                            : complianceInfo.color === "purple"
                              ? "bg-purple-50 dark:bg-purple-900/30"
                              : complianceInfo.color === "orange"
                                ? "bg-orange-50 dark:bg-orange-900/30"
                                : "bg-gray-50 dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <ComplianceIcon
                          className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${
                            complianceInfo.color === "green"
                              ? "text-green-600 dark:text-green-400"
                              : complianceInfo.color === "blue"
                                ? "text-blue-600 dark:text-blue-400"
                                : complianceInfo.color === "purple"
                                  ? "text-purple-600 dark:text-purple-400"
                                  : complianceInfo.color === "orange"
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-gray-600 dark:text-gray-400"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-medium ${
                              complianceInfo.color === "green"
                                ? "text-green-700 dark:text-green-300"
                                : complianceInfo.color === "blue"
                                  ? "text-blue-700 dark:text-blue-300"
                                  : complianceInfo.color === "purple"
                                    ? "text-purple-700 dark:text-purple-300"
                                    : complianceInfo.color === "orange"
                                      ? "text-orange-700 dark:text-orange-300"
                                      : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            Compliance
                          </p>
                          <p
                            className={`break-words text-xs font-semibold ${
                              complianceInfo.color === "green"
                                ? "text-green-800 dark:text-green-200"
                                : complianceInfo.color === "blue"
                                  ? "text-blue-800 dark:text-blue-200"
                                  : complianceInfo.color === "purple"
                                    ? "text-purple-800 dark:text-purple-200"
                                    : complianceInfo.color === "orange"
                                      ? "text-orange-800 dark:text-orange-200"
                                      : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {complianceInfo.text}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Creation Date */}
                    <div className="rounded-lg bg-indigo-50 p-2.5 dark:bg-indigo-900/30 sm:p-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400 sm:h-4 sm:w-4" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                            Created
                          </p>
                          <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">
                            {moment(model.created_at).format("MMM DD, YYYY")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Info */}
                  <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 p-2.5 dark:from-amber-900/20 dark:to-orange-900/20 sm:p-3">
                    <div className="flex items-center space-x-2">
                      <Link className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400 sm:h-4 sm:w-4" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        Connected Resources
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                          {model.agent_ids?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Database className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                          {model.dataset_ids?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          /* Empty State for Models */
          <motion.div
            className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center dark:border-blue-600 dark:from-blue-900/20 dark:to-blue-800/20 sm:rounded-2xl sm:p-8 md:p-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:h-20 sm:w-20">
                <Cpu className="h-8 w-8 text-white sm:h-10 sm:w-10" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                No AI Models Yet
              </h4>
              <p className="mx-auto max-w-md text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                Start by adding your first AI model to begin processing data,
                making predictions, or generating content.
              </p>
            </div>

            {/* Resource Relationship Diagram */}
            <div className="mb-6 flex w-full max-w-2xl flex-col items-center justify-center space-y-4 sm:mb-8 sm:flex-row sm:space-x-6 sm:space-y-0">
              {/* Models Box */}
              <motion.div
                className="flex flex-col items-center space-y-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-xl sm:rounded-2xl sm:p-4">
                  <Cpu className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 sm:text-sm">
                  AI Models
                </span>
                <span className="text-xs text-gray-500">Process & Predict</span>
              </motion.div>

              {/* Arrow */}
              <div className="flex rotate-90 flex-col items-center sm:rotate-0">
                <div className="flex items-center space-x-1">
                  <div className="h-px w-12 bg-gradient-to-r from-blue-400 to-green-400 sm:w-16"></div>
                  <div className="h-0 w-0 border-b-[6px] border-l-[8px] border-r-0 border-t-[6px] border-b-transparent border-l-green-500 border-t-transparent"></div>
                </div>
                <span className="mt-1 rotate-0 text-xs font-medium text-gray-600 dark:text-gray-400">
                  utilize
                </span>
              </div>

              {/* Datasets Box */}
              <motion.div
                className="flex flex-col items-center space-y-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-xl sm:rounded-2xl sm:p-4">
                  <Database className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <span className="text-xs font-semibold text-green-700 dark:text-green-300 sm:text-sm">
                  Datasets
                </span>
                <span className="text-xs text-gray-500">Training Data</span>
              </motion.div>
            </div>

            <motion.button
              onClick={handleAddModel}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-6 py-3 text-sm text-white shadow-xl transition-all hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 hover:shadow-2xl sm:w-auto sm:space-x-3 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-semibold">Add Your First Model</span>
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ModelsSection;
