"use client";
import { motion } from "framer-motion";
import {
  Activity,
  Archive,
  Calendar,
  CheckCircle,
  Database,
  Eye,
  Filter,
  HardDrive,
  Info,
  Link,
  Pencil,
  Server,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trash2,
  Zap
} from "lucide-react";
import moment from "moment";
import React from "react";
import { toast } from "sonner";
import { Dataset, ExpandedCards } from "../../types/overview.types";

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

interface DatasetsSectionProps {
  linkedDatasets: Dataset[];
  expandedCards: ExpandedCards;
  toggleCardExpansion: (cardType: string) => void;
  handleEditDataset: (dataset: Dataset) => void;
  handleDeleteDataset: (dataset: Dataset) => void;
  cardVariants: {
    hidden: { opacity: number; scale: number };
    visible: {
      opacity: number;
      scale: number;
      transition: { duration: number; ease: string };
    };
  };
  mutate: () => void;
  isRefreshing?: boolean;
  isAccess: ISAccess | null;
}

const DatasetsSection: React.FC<DatasetsSectionProps> = ({
  linkedDatasets,
  handleEditDataset,
  handleDeleteDataset,
  cardVariants,
  isAccess
}) => {
  const getUsedForInfo = (usedFor: string) => {
    switch (usedFor?.toLowerCase()) {
      case "training":
        return {
          text: "Training Data",
          color: "blue",
          icon: Target,
          description: "Used to train ML models"
        };
      case "validation":
        return {
          text: "Validation Set",
          color: "purple",
          icon: CheckCircle,
          description: "Used for model validation"
        };
      case "testing":
        return {
          text: "Test Dataset",
          color: "orange",
          icon: Activity,
          description: "Used for testing models"
        };
      case "rag":
        return {
          text: "RAG Dataset",
          color: "green",
          icon: Zap,
          description: "Retrieval Augmented Generation"
        };
      default:
        return {
          text: usedFor || "Unknown",
          color: "gray",
          icon: Info,
          description: "General purpose dataset"
        };
    }
  };

  const formatFileSize = (sizeInGB: number) => {
    if (sizeInGB >= 1000) {
      return `${(sizeInGB / 1000).toFixed(1)} TB`;
    } else if (sizeInGB >= 1) {
      return `${sizeInGB.toFixed(1)} GB`;
    } else {
      return `${(sizeInGB * 1000).toFixed(0)} MB`;
    }
  };

  return (
    <motion.div
      className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-green-50 p-4 shadow-xl dark:border-neutral-700 dark:from-darkSidebarBackground dark:to-green-900/20 sm:rounded-2xl sm:p-6 md:p-8"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between sm:mb-8">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative shrink-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-2 shadow-lg sm:rounded-xl sm:p-3">
            <Database className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white sm:h-6 sm:w-6">
              {linkedDatasets.length}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Datasets
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              {linkedDatasets.length}{" "}
              {linkedDatasets.length === 1 ? "dataset" : "datasets"} available
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {linkedDatasets.length > 0 ? (
          linkedDatasets.map((dataset: Dataset, index: number) => {
            const usedForInfo = getUsedForInfo(dataset.used_for);
            const UsedForIcon = usedForInfo.icon;

            return (
              <motion.div
                key={dataset.doc_id}
                className="dark:via-gray-850 group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 sm:rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="p-4 sm:p-6">
                  {/* Header with Dataset Info */}
                  <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start space-x-2 sm:items-center sm:space-x-3">
                        <div className="shrink-0">
                          <div className="rounded-lg bg-gray-100 p-1.5 dark:bg-gray-700 sm:px-2 sm:py-1">
                            <Database className="h-3.5 w-3.5 text-green-500 sm:h-4 sm:w-4" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="break-words text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                            {dataset.name}
                          </h4>
                          <p className="break-words text-xs text-gray-500 dark:text-gray-400">
                            v{dataset.dataset_version} • {dataset.data_sources}
                          </p>
                        </div>
                      </div>

                      {/* Sensitive Data Indicator */}
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-1.5 w-1.5 shrink-0 rounded-full sm:h-2 sm:w-2 ${
                            dataset.contains_sensitive_data
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium sm:text-sm ${
                            dataset.contains_sensitive_data
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {dataset.contains_sensitive_data
                            ? "Contains Sensitive Data"
                            : "Safe Dataset"}
                        </span>
                        {dataset.contains_sensitive_data && (
                          <Shield className="h-3.5 w-3.5 shrink-0 text-red-500 sm:h-4 sm:w-4" />
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex shrink-0 items-start space-x-2 opacity-100 transition-opacity group-hover:opacity-100 sm:flex-col sm:space-x-0 sm:space-y-2 sm:opacity-0">
                      {isAccess?.buttons?.[8]?.permission?.is_shown && (
                        <motion.button
                          onClick={() => {
                            if (
                              isAccess?.buttons?.[8]?.permission?.actions
                                ?.update
                            ) {
                              handleEditDataset(dataset);
                            } else {
                              toast.warning(
                                "You do not have permission to edit this dataset."
                              );
                            }
                          }}
                          className="rounded-lg bg-green-100 p-1.5 text-green-600 transition-colors hover:bg-green-200 dark:bg-green-900 dark:text-green-300 sm:p-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Edit Dataset"
                        >
                          <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </motion.button>
                      )}
                      {isAccess?.buttons?.[9]?.permission?.is_shown && (
                        <motion.button
                          onClick={() => {
                            if (
                              isAccess?.buttons?.[9]?.permission?.actions
                                ?.delete
                            ) {
                              handleDeleteDataset(dataset);
                            } else {
                              toast.warning(
                                "You do not have permission to delete this dataset."
                              );
                            }
                          }}
                          className="rounded-lg bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-300 sm:p-2"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Delete Dataset"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="mb-4 flex flex-wrap items-center gap-1.5 sm:mb-6 sm:gap-2">
                    {/* Purpose Badge */}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold sm:px-3 sm:py-1 ${
                        usedForInfo.color === "blue"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : usedForInfo.color === "purple"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : usedForInfo.color === "orange"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              : usedForInfo.color === "green"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }`}
                    >
                      <UsedForIcon className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">
                        {usedForInfo.text}
                      </span>
                      <span className="sm:hidden">
                        {usedForInfo.text.split(" ")[0]}
                      </span>
                    </span>

                    {/* Data Source Badge */}
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200 sm:px-3 sm:py-1">
                      <Server className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {dataset.data_sources}
                    </span>

                    {/* Scan Status */}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold sm:px-3 sm:py-1 ${
                        dataset.is_scanned
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      <Eye className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {dataset.is_scanned ? "Scanned" : "Pending"}
                    </span>
                  </div>

                  {/* Key Information Grid */}
                  <div className="mb-4 grid grid-cols-1 gap-2 sm:mb-6 sm:grid-cols-2 sm:gap-3">
                    {/* Dataset Size */}
                    <div className="rounded-lg bg-indigo-50 p-2.5 dark:bg-indigo-900/30 sm:p-3">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400 sm:h-4 sm:w-4" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                            Size
                          </p>
                          <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">
                            {dataset.size_in_gb
                              ? formatFileSize(dataset.size_in_gb)
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Creation Date */}
                    <div className="rounded-lg bg-green-50 p-2.5 dark:bg-green-900/30 sm:p-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400 sm:h-4 sm:w-4" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-green-700 dark:text-green-300">
                            Created
                          </p>
                          <p className="text-xs font-semibold text-green-800 dark:text-green-200">
                            {moment(dataset.created_at).format("MMM DD, YYYY")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preprocessing Steps Preview */}
                  {dataset.preprocessing_steps &&
                    dataset.preprocessing_steps.length > 0 && (
                      <div className="mb-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-2.5 dark:from-blue-900/20 dark:to-purple-900/20 sm:mb-4 sm:p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Settings className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400 sm:h-4 sm:w-4" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                              Preprocessing Steps
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-800 dark:text-blue-200 sm:py-1">
                              {dataset.preprocessing_steps.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Connection Info */}
                  <div className="mb-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 p-2.5 dark:from-amber-900/20 dark:to-orange-900/20 sm:mb-4 sm:p-3">
                    <div className="flex items-center space-x-2">
                      <Link className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400 sm:h-4 sm:w-4" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                        Connected Resources
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex items-center space-x-1">
                        <Archive className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                          {dataset.model_ids?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Settings className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                          {dataset.application_ids?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preprocessing Steps Detailed View */}
                  {dataset.preprocessing_steps &&
                    dataset.preprocessing_steps.length > 0 && (
                      <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30 sm:p-4">
                        <h5 className="mb-2 flex items-center text-xs font-semibold text-blue-900 dark:text-blue-100 sm:mb-3 sm:text-sm">
                          <Filter className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Preprocessing Pipeline
                        </h5>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {dataset.preprocessing_steps.map(
                            (step: string, idx: number) => (
                              <motion.span
                                key={idx}
                                className="inline-flex items-center rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200 sm:px-3 sm:py-1"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                              >
                                <Sparkles className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span className="break-words">
                                  {step
                                    .replace(/_/g, " ")
                                    .charAt(0)
                                    .toUpperCase() +
                                    step.replace(/_/g, " ").slice(1)}
                                </span>
                              </motion.span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-emerald-100 p-6 text-center dark:border-green-600 dark:from-green-900/20 dark:to-emerald-800/20 sm:rounded-2xl sm:p-8 md:p-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg sm:h-20 sm:w-20">
                <Database className="h-8 w-8 text-white sm:h-10 sm:w-10" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                No Datasets Available
              </h4>
              <p className="mx-auto max-w-md text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                Datasets are automatically discovered when you add models or
                agents. They provide the foundation for training, validation,
                and testing your AI systems.
              </p>
            </div>

            {/* Enhanced Resource Relationship Diagram */}
            <div className="mb-6 flex w-full max-w-3xl flex-col items-center justify-center space-y-4 sm:mb-8 sm:flex-row sm:space-x-6 sm:space-y-0">
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

              {/* Arrow */}
              <div className="flex rotate-90 flex-col items-center sm:rotate-0">
                <div className="flex items-center space-x-1">
                  <div className="h-px w-12 bg-gradient-to-r from-green-400 to-blue-400 sm:w-16"></div>
                  <div className="h-0 w-0 border-b-[6px] border-l-[8px] border-r-0 border-t-[6px] border-b-transparent border-l-blue-500 border-t-transparent"></div>
                </div>
                <span className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  power
                </span>
              </div>

              {/* Models Box */}
              <motion.div
                className="flex flex-col items-center space-y-2"
                whileHover={{ scale: 1.05 }}
              >
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-xl sm:rounded-2xl sm:p-4">
                  <Archive className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 sm:text-sm">
                  AI Models
                </span>
                <span className="text-xs text-gray-500">ML Processing</span>
              </motion.div>
            </div>

            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                <span>💡</span>
                <span className="max-w-sm break-words">
                  Datasets are automatically discovered when you add models or
                  agents
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400 sm:gap-4">
                <div className="flex items-center space-x-1">
                  <Target className="h-3 w-3" />
                  <span>Training</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Validation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="h-3 w-3" />
                  <span>Testing</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>RAG</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DatasetsSection;
