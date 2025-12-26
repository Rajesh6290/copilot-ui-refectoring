"use client";
import { Dialog } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bot,
  Calendar,
  Check,
  Cpu,
  Database,
  Link,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
  X
} from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { toast } from "sonner";

import { Agent, ExpandedCards } from "../../types/overview.types";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import CustomButton from "@/shared/core/CustomButton";
import {
  DatasetValidationSchema,
  ModelValidationSchema,
  SelectionValidationSchema
} from "../../schema/agent.schema";
import CustomMultiSelect from "@/shared/core/CustomMultiSelect";

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

interface AgentsSectionProps {
  linkedAgents: Agent[];
  expandedCards: ExpandedCards;
  toggleCardExpansion: (cardType: string) => void;
  handleAddAgent: () => void;
  handleEditAgent: (agent: Agent) => void;
  handleDeleteAgent: (agent: Agent) => void;
  isAccess: ISAccess;
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
}
// Form Options
const modelTypeOptions = [
  { value: "generative", label: "Generative" },
  { value: "predictive", label: "Predictive" },
  { value: "other", label: "Other" }
];

const complianceStatusOptions = [
  { value: "ccpa_compliant", label: "CCPA Compliant" },
  { value: "hipaa_compliant", label: "HIPAA Compliant" },
  { value: "iso_27001", label: "ISO 27001" },
  { value: "soc_2", label: "SOC 2" },
  { value: "not_assessed", label: "Not Assessed" },
  { value: "euro_ai", label: "EURO AI" },
  { value: "nist", label: "NIST" },
  { value: "internally_evaluated", label: "Internally Evaluated" }
];

const dataSourcesOptions = [
  { value: "internal", label: "Internal" },
  { value: "public", label: "Public" },
  { value: "third_party", label: "Third-party" }
];

const usedForOptions = [
  { value: "training", label: "Training" },
  { value: "validation", label: "Validation" },
  { value: "testing", label: "Testing" },
  { value: "rag", label: "RAG" },
  { value: "fine-tuning", label: "Fine-Tuning" },
  { value: "other", label: "Other" }
];

const AgentsSection: React.FC<AgentsSectionProps> = ({
  linkedAgents,
  handleAddAgent,
  handleEditAgent,
  handleDeleteAgent,
  isAccess,
  cardVariants,
  mutate
}) => {
  // State for Link Models Dialog
  const [showLinkModelsDialog, setShowLinkModelsDialog] = useState(false);
  const [selectedAgentForLinking, setSelectedAgentForLinking] =
    useState<Agent | null>(null);
  const [linkingMode, setLinkingMode] = useState<"create" | "existing" | null>(
    null
  );
  const [linkingStep, setLinkingStep] = useState(0);
  const [createdModelId, setCreatedModelId] = useState<string>("");

  // Hooks
  const { mutation, isLoading } = useMutation();
  const { data: listOfModels } = useSwr("get_models");

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Handle Link Models Dialog
  const handleOpenLinkModelsDialog = (agent: Agent) => {
    setSelectedAgentForLinking(agent);
    setShowLinkModelsDialog(true);
    setLinkingStep(0);
    setLinkingMode(null);
    setCreatedModelId("");
  };

  const handleCloseLinkModelsDialog = () => {
    setShowLinkModelsDialog(false);
    setSelectedAgentForLinking(null);
    setLinkingMode(null);
    setLinkingStep(0);
    setCreatedModelId("");
  };

  const handleModeSelection = (mode: "create" | "existing") => {
    setLinkingMode(mode);
    if (mode === "create") {
      setLinkingStep(1);
    } else {
      setLinkingStep(0);
    }
  };

  // Form submission handlers
  const handleSubmitNewModel = async (
    values: {
      model_name: string;
      model_description: string;
      model_type: string;
      provider: string;
      model_version: string;
      model_status: string;
      compliance_status: string[];
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const payload = {
        model_name: values.model_name,
        model_description: values.model_description,
        model_type: values.model_type,
        provider: values.provider,
        model_version: values.model_version,
        model_status: values.model_status,
        compliance_status: values.compliance_status,
        agent_ids: [selectedAgentForLinking?.doc_id]
      };
      const res = await mutation("model", {
        method: "POST",
        isAlert: false,
        body: payload
      });

      if (res?.status === 201 || res?.status === 200) {
        toast.success("Model created successfully");
        setCreatedModelId(res?.results?.doc_id || values.model_name);
        setLinkingStep(2);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitNewDataset = async (
    values: {
      name: string;
      dataset_version: string;
      contains_sensitive_data: boolean;
      data_sources: string;
      used_for: string;
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const payload = {
        name: values.name,
        dataset_version: values.dataset_version,
        contains_sensitive_data: values.contains_sensitive_data,
        data_sources: values.data_sources,
        used_for: values.used_for,
        model_ids: [createdModelId]
      };
      const res = await mutation("dataset", {
        method: "POST",
        isAlert: false,
        body: payload
      });

      if (res?.status === 201 || res?.status === 200) {
        toast.success("Dataset created and linked successfully");
        handleCloseLinkModelsDialog();
        mutate();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitExistingModels = async (values: {
    selectedItem: string[];
  }) => {
    try {
      for (const modelId of values.selectedItem) {
        const res = await mutation(`model?doc_id=${modelId}`, {
          method: "PUT",
          isAlert: false,
          body: { agent_ids: [selectedAgentForLinking?.doc_id] }
        });
        if (res?.status !== 200) {
          toast.error(`Failed to link model with ID: ${modelId}`);
          return;
        }
      }
      toast.success("Models linked successfully");
      handleCloseLinkModelsDialog();
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleSkipDataset = () => {
    toast.success("Model created successfully without dataset");
    handleCloseLinkModelsDialog();
    mutate();
  };

  return (
    <>
      <motion.div
        className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-purple-50 p-4 shadow-xl dark:border-neutral-700 dark:from-darkSidebarBackground dark:to-purple-900/20 sm:rounded-2xl sm:p-6 md:p-8"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative shrink-0 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 p-2 shadow-lg sm:rounded-xl sm:p-3">
              <Bot className="h-6 w-6 text-white sm:h-8 sm:w-8" />
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white sm:h-6 sm:w-6">
                {linkedAgents.length}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                AI Agents
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                {linkedAgents.length}{" "}
                {linkedAgents.length === 1 ? "agent" : "agents"} configured
              </p>
            </div>
          </div>
          {isAccess?.buttons?.[4]?.permission?.is_shown && (
            <motion.button
              onClick={() => {
                if (isAccess?.buttons?.[4]?.permission?.actions?.create) {
                  handleAddAgent();
                } else {
                  toast.error(
                    "You don't have permission to perform this action."
                  );
                }
              }}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-800 sm:w-auto sm:rounded-xl sm:px-6 sm:py-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Add Agent</span>
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {linkedAgents.length > 0 ? (
            linkedAgents.map((agent: Agent, index: number) => {
              const getLifecycleStatus = (state: string) => {
                switch (state?.toLowerCase()) {
                  case "active":
                    return { text: "Active", color: "green", icon: Check };
                  case "draft":
                    return {
                      text: "Draft",
                      color: "orange",
                      icon: AlertTriangle
                    };
                  case "testing":
                    return { text: "Testing", color: "blue", icon: Activity };
                  case "deprecated":
                    return { text: "Deprecated", color: "red", icon: X };
                  default:
                    return {
                      text: "Draft",
                      color: "gray",
                      icon: AlertTriangle
                    };
                }
              };

              const lifecycleInfo = getLifecycleStatus(
                agent.lifecycle_state || "draft"
              );
              const LifecycleIcon = lifecycleInfo.icon;

              return (
                <motion.div
                  key={agent.doc_id}
                  className="dark:via-gray-850 group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 sm:rounded-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="p-4 sm:p-6">
                    {/* Header with Agent Info */}
                    <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start space-x-2 sm:items-center sm:space-x-3">
                          <div className="shrink-0">
                            <div className="rounded-lg bg-gray-100 p-1.5 dark:bg-gray-700 sm:px-2 sm:py-1">
                              <Bot className="h-3.5 w-3.5 text-purple-500 sm:h-4 sm:w-4" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="break-words text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                              {agent.agent_name}
                            </h4>
                            <p className="break-words text-xs text-gray-500 dark:text-gray-400">
                              v{agent.version} •{" "}
                              {agent.action_supported?.length || 0} capabilities
                            </p>
                          </div>
                        </div>
                        <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                          {agent.purpose || "No description available"}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex shrink-0 items-start space-x-2 opacity-100 transition-opacity group-hover:opacity-100 sm:flex-col sm:space-x-0 sm:space-y-2 sm:opacity-0">
                        {isAccess?.buttons?.[6]?.permission?.is_shown && (
                          <motion.button
                            onClick={() => {
                              if (
                                isAccess?.buttons?.[6]?.permission?.actions
                                  ?.update
                              ) {
                                handleEditAgent(agent);
                              } else {
                                toast.error(
                                  "You don't have permission to perform this action."
                                );
                              }
                            }}
                            className="rounded-lg bg-purple-100 p-1.5 text-purple-600 transition-colors hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 sm:p-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Edit Agent"
                          >
                            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </motion.button>
                        )}
                        {isAccess?.buttons?.[7]?.permission?.is_shown && (
                          <motion.button
                            onClick={() => {
                              if (
                                isAccess?.buttons?.[7]?.permission?.actions
                                  ?.delete
                              ) {
                                handleDeleteAgent(agent);
                              } else {
                                toast.error(
                                  "You don't have permission to perform this action."
                                );
                              }
                            }}
                            className="rounded-lg bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-300 sm:p-2"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete Agent"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="mb-4 flex flex-wrap items-center gap-1.5 sm:mb-6 sm:gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold sm:px-3 sm:py-1 ${
                          agent.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        <Activity className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {agent.is_active ? "Active" : "Inactive"}
                      </span>

                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold sm:px-3 sm:py-1 ${
                          lifecycleInfo.color === "green"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : lifecycleInfo.color === "orange"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              : lifecycleInfo.color === "blue"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : lifecycleInfo.color === "red"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        <LifecycleIcon className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        {lifecycleInfo.text}
                      </span>

                      {agent.human_in_loop && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200 sm:px-3 sm:py-1">
                          <Users className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Human Loop
                        </span>
                      )}
                    </div>

                    {/* Key Information Grid */}
                    <div className="mb-4 grid grid-cols-1 gap-2 sm:mb-6 sm:grid-cols-2 sm:gap-3">
                      <div
                        className={`rounded-lg p-2.5 sm:p-3 ${
                          lifecycleInfo.color === "green"
                            ? "bg-green-50 dark:bg-green-900/30"
                            : lifecycleInfo.color === "orange"
                              ? "bg-orange-50 dark:bg-orange-900/30"
                              : lifecycleInfo.color === "blue"
                                ? "bg-blue-50 dark:bg-blue-900/30"
                                : lifecycleInfo.color === "red"
                                  ? "bg-red-50 dark:bg-red-900/30"
                                  : "bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <LifecycleIcon
                            className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${
                              lifecycleInfo.color === "green"
                                ? "text-green-600 dark:text-green-400"
                                : lifecycleInfo.color === "orange"
                                  ? "text-orange-600 dark:text-orange-400"
                                  : lifecycleInfo.color === "blue"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : lifecycleInfo.color === "red"
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-gray-600 dark:text-gray-400"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs font-medium ${
                                lifecycleInfo.color === "green"
                                  ? "text-green-700 dark:text-green-300"
                                  : lifecycleInfo.color === "orange"
                                    ? "text-orange-700 dark:text-orange-300"
                                    : lifecycleInfo.color === "blue"
                                      ? "text-blue-700 dark:text-blue-300"
                                      : lifecycleInfo.color === "red"
                                        ? "text-red-700 dark:text-red-300"
                                        : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              Lifecycle
                            </p>
                            <p
                              className={`break-words text-xs font-semibold ${
                                lifecycleInfo.color === "green"
                                  ? "text-green-800 dark:text-green-200"
                                  : lifecycleInfo.color === "orange"
                                    ? "text-orange-800 dark:text-orange-200"
                                    : lifecycleInfo.color === "blue"
                                      ? "text-blue-800 dark:text-blue-200"
                                      : lifecycleInfo.color === "red"
                                        ? "text-red-800 dark:text-red-200"
                                        : "text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              {lifecycleInfo.text}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-indigo-50 p-2.5 dark:bg-indigo-900/30 sm:p-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400 sm:h-4 sm:w-4" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                              Created
                            </p>
                            <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">
                              {moment(agent.created_at).format("MMM DD, YYYY")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

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
                          <Cpu className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                            {agent.model_ids?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Database className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                            {0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    {isAccess?.buttons?.[0]?.permission?.is_shown && (
                      <div>
                        <motion.button
                          onClick={() => {
                            if (
                              isAccess?.buttons?.[0]?.permission?.actions
                                ?.create
                            ) {
                              handleOpenLinkModelsDialog(agent);
                            } else {
                              toast.error(
                                "You don't have permission to perform this action."
                              );
                            }
                          }}
                          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-all hover:from-purple-600 hover:to-purple-700 sm:px-4 sm:text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span>Link Models</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            /* Empty State for Agents */
            <motion.div
              className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 p-6 text-center dark:border-purple-600 dark:from-purple-900/20 dark:to-purple-800/20 sm:rounded-2xl sm:p-8 md:p-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-4 space-y-3 sm:mb-6 sm:space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg sm:h-20 sm:w-20">
                  <Bot className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  No AI Agents Yet
                </h4>
                <p className="mx-auto max-w-md text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                  Create intelligent agents that utilize AI models to perform
                  specific tasks and operations within your applications.
                </p>
              </div>

              {/* Resource Relationship Diagram */}
              <div className="mb-6 flex w-full max-w-2xl flex-col items-center justify-center space-y-4 sm:mb-8 sm:flex-row sm:space-x-6 sm:space-y-0">
                <motion.div
                  className="flex flex-col items-center space-y-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-3 shadow-xl sm:rounded-2xl sm:p-4">
                    <Bot className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                  </div>
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 sm:text-sm">
                    AI Agents
                  </span>
                  <span className="text-xs text-gray-500">Execute Tasks</span>
                </motion.div>

                <div className="flex rotate-90 flex-col items-center sm:rotate-0">
                  <div className="flex items-center space-x-1">
                    <div className="h-px w-12 bg-gradient-to-r from-purple-400 to-blue-400 sm:w-16"></div>
                    <div className="h-0 w-0 border-b-[6px] border-l-[8px] border-r-0 border-t-[6px] border-b-transparent border-l-blue-500 border-t-transparent"></div>
                  </div>
                  <span className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                    utilize
                  </span>
                </div>

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
                  <span className="text-xs text-gray-500">
                    Process & Predict
                  </span>
                </motion.div>

                <div className="flex rotate-90 flex-col items-center sm:rotate-0">
                  <div className="flex items-center space-x-1">
                    <div className="h-px w-12 bg-gradient-to-r from-blue-400 to-green-400 sm:w-16"></div>
                    <div className="h-0 w-0 border-b-[6px] border-l-[8px] border-r-0 border-t-[6px] border-b-transparent border-l-green-500 border-t-transparent"></div>
                  </div>
                  <span className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                    with
                  </span>
                </div>

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
                onClick={handleAddAgent}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 px-6 py-3 text-sm text-white shadow-xl transition-all hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 hover:shadow-2xl sm:w-auto sm:space-x-3 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold">Add Your First Agent</span>
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Link Models Dialog */}
      <Dialog
        open={showLinkModelsDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className:
            "bg-white dark:bg-darkSidebarBackground rounded-lg m-2 sm:m-4 max-w-full"
        }}
        onClose={handleCloseLinkModelsDialog}
      >
        <div className="flex h-full max-h-[95vh] flex-col sm:max-h-[90vh]">
          {/* Dialog Header */}
          <div className="shrink-0 border-b border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6 sm:py-4">
            <div className="flex items-start justify-between gap-3 sm:items-center">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                  Link Models to Agent
                </h2>
                {selectedAgentForLinking && (
                  <p className="mt-1 truncate text-xs text-gray-500 sm:text-sm">
                    Agent: {selectedAgentForLinking.agent_name}
                  </p>
                )}
              </div>
              <button
                onClick={handleCloseLinkModelsDialog}
                className="shrink-0 rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 sm:p-1.5"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Step Indicator for Create Mode */}
            {linkingMode === "create" && linkingStep > 0 && (
              <div className="mt-4 sm:mt-6">
                <motion.div
                  className="mb-4 sm:mb-6"
                  initial="initial"
                  animate="animate"
                  variants={fadeIn}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center justify-center">
                    {["Model", "Dataset"].map((step, index) => (
                      <React.Fragment key={step}>
                        <motion.div
                          className="flex flex-col items-center"
                          animate={
                            index + 1 === linkingStep
                              ? { scale: 1.1 }
                              : { scale: 1 }
                          }
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <motion.div
                            className={`flex size-8 items-center justify-center rounded-full transition-all duration-300 sm:size-10 ${
                              index + 1 < linkingStep
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                                : index + 1 === linkingStep
                                  ? "border-2 border-indigo-600 bg-white text-indigo-600 shadow-lg dark:border-indigo-500 dark:bg-gray-800 dark:text-indigo-400"
                                  : "border-2 border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {index + 1 < linkingStep ? (
                              <Check className="size-4 text-white sm:size-5" />
                            ) : (
                              <span className="text-sm font-semibold sm:text-base">
                                {index + 1}
                              </span>
                            )}
                          </motion.div>
                          <div className="mt-2 text-center">
                            <span
                              className={`text-xs font-semibold ${
                                index + 1 <= linkingStep
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        </motion.div>
                        {index < 1 && (
                          <div className="mx-2 w-12 sm:mx-4 sm:w-20">
                            <motion.div
                              className={`h-1 rounded-full transition-all duration-500 ${
                                index + 1 < linkingStep
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* Dialog Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Mode Selection (Step 0) */}
            {linkingStep === 0 && (
              <div className="space-y-4 sm:space-y-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                  Do you want to create a new model or continue with an existing
                  one?
                </p>

                <div className="space-y-4">
                  <div className="w-full sm:w-fit">
                    <CustomButton
                      onClick={() => handleModeSelection("create")}
                      startIcon={<Plus size={16} />}
                      className="w-full"
                    >
                      Create New Model
                    </CustomButton>
                  </div>

                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300 sm:mb-4">
                      Continue with Existing Model
                    </h3>

                    <Formik
                      initialValues={{ selectedItem: [] }}
                      validationSchema={SelectionValidationSchema}
                      onSubmit={handleSubmitExistingModels}
                    >
                      {({ isSubmitting }) => (
                        <Form>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Select Models{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <Field
                              name="selectedItem"
                              component={CustomMultiSelect}
                              options={
                                listOfModels?.map(
                                  (item: {
                                    doc_id: string;
                                    model_name: string;
                                    model_version: string;
                                  }) => ({
                                    label: `${item?.model_name} (${item?.model_version})`,
                                    value: item?.doc_id
                                  })
                                ) || []
                              }
                            />
                            <ErrorMessage
                              name="selectedItem"
                              component="div"
                              className="mt-1 text-sm text-red-500"
                            />
                          </div>

                          <div className="mt-4 flex flex-col justify-end gap-3 sm:mt-6 sm:flex-row">
                            <button
                              type="button"
                              onClick={handleCloseLinkModelsDialog}
                              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
                            >
                              Cancel
                            </button>
                            <CustomButton
                              type="submit"
                              loading={isSubmitting}
                              loadingText="Linking..."
                              startIcon={<Save size={16} />}
                              className="w-full sm:w-auto"
                            >
                              Link Models
                            </CustomButton>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </div>
            )}

            {/* Model Form (Step 1) */}
            {linkingMode === "create" && linkingStep === 1 && (
              <Formik
                initialValues={{
                  model_name: "",
                  model_description: "",
                  model_type: "",
                  provider: "",
                  model_version: "1.0.0",
                  model_status: "",
                  compliance_status: []
                }}
                validationSchema={ModelValidationSchema}
                onSubmit={handleSubmitNewModel}
              >
                {({ touched, errors }) => (
                  <Form className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Model Name <span className="text-red-500">*</span>
                          </span>
                          <Field
                            type="text"
                            name="model_name"
                            className={`w-full rounded-md border ${
                              touched.model_name && errors.model_name
                                ? "border-red-500"
                                : "border-gray-300 dark:border-neutral-700"
                            } px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
                          />
                          <ErrorMessage
                            name="model_name"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description <span className="text-red-500">*</span>
                          </span>
                          <Field
                            as="textarea"
                            name="model_description"
                            rows={4}
                            className={`w-full rounded-md border ${
                              touched.model_description &&
                              errors.model_description
                                ? "border-red-500"
                                : "border-gray-300 dark:border-neutral-700"
                            } px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
                          />
                          <ErrorMessage
                            name="model_description"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Model Type <span className="text-red-500">*</span>
                          </span>
                          <Field
                            as="select"
                            name="model_type"
                            className={`w-full rounded-md border ${
                              touched.model_type && errors.model_type
                                ? "border-red-500"
                                : "border-gray-300 dark:border-neutral-700"
                            } px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
                          >
                            <option value="">Select Model Type</option>
                            {modelTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="model_type"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Model Owner / Vendor{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            name="provider"
                            className={`w-full rounded-md border ${
                              touched.provider && errors.provider
                                ? "border-red-500"
                                : "border-gray-300 dark:border-neutral-700"
                            } px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
                          />
                          <ErrorMessage
                            name="provider"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Version <span className="text-red-500">*</span>
                          </span>
                          <Field
                            type="text"
                            name="model_version"
                            className={`w-full rounded-md border ${
                              touched.model_version && errors.model_version
                                ? "border-red-500"
                                : "border-gray-300 dark:border-neutral-700"
                            } px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
                          />
                          <ErrorMessage
                            name="model_version"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Model Status <span className="text-red-500">*</span>
                          </span>
                          <Field
                            as="select"
                            name="model_status"
                            className={`w-full rounded-md border ${
                              touched.model_status && errors.model_status
                                ? "border-red-500"
                                : "border-gray-300 dark:border-neutral-700"
                            } px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
                          >
                            <option value="">Select Model Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </Field>
                          <ErrorMessage
                            name="model_status"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Compliance Status{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            name="compliance_status"
                            component={CustomMultiSelect}
                            options={complianceStatusOptions}
                          />
                          <ErrorMessage
                            name="compliance_status"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="hidden">
                      <button
                        id="skip-dataset-btn"
                        type="button"
                        onClick={handleSkipDataset}
                      >
                        Skip Dataset
                      </button>
                      <button type="submit">Submit and Next</button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}

            {/* Dataset Form (Step 2) */}
            {linkingMode === "create" && linkingStep === 2 && (
              <Formik
                initialValues={{
                  name: "",
                  dataset_version: "1.0.0",
                  contains_sensitive_data: false,
                  data_sources: "",
                  used_for: ""
                }}
                validationSchema={DatasetValidationSchema}
                onSubmit={handleSubmitNewDataset}
              >
                {({ touched, errors }) => (
                  <Form className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Dataset Name <span className="text-red-500">*</span>
                          </span>
                          <Field
                            type="text"
                            name="name"
                            className={`w-full rounded-md border ${
                              touched.name && errors.name
                                ? "border-red-500"
                                : "border-gray-300 dark:border-neutral-700"
                            } px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
                          />
                          <ErrorMessage
                            name="name"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Version <span className="text-red-500">*</span>
                          </span>
                          <Field
                            type="text"
                            name="dataset_version"
                            className={`w-full rounded-md border ${
                              touched.dataset_version && errors.dataset_version
                                ? "border-red-500"
                                : "border-gray-300 dark:border-neutral-700"
                            } px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
                          />
                          <ErrorMessage
                            name="dataset_version"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Contains Sensitive Data{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                            {["yes", "no"].map((option) => (
                              <label
                                key={option}
                                className="flex items-center space-x-2"
                              >
                                <Field
                                  type="radio"
                                  name="contains_sensitive_data"
                                  value={option === "yes"}
                                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-neutral-700"
                                />
                                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                          <ErrorMessage
                            name="contains_sensitive_data"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Data Source <span className="text-red-500">*</span>
                          </span>
                          <Field
                            as="select"
                            name="data_sources"
                            className={`w-full rounded-md border ${
                              touched.data_sources && errors.data_sources
                                ? "border-red-500"
                                : "border-gray-300 dark:border-neutral-700"
                            } px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
                          >
                            <option value="">Select Data Source</option>
                            {dataSourcesOptions.map((item, index) => (
                              <option key={index} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="data_sources"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Used For <span className="text-red-500">*</span>
                          </span>
                          <Field
                            as="select"
                            name="used_for"
                            className={`w-full rounded-md border ${
                              touched.used_for && errors.used_for
                                ? "border-red-500"
                                : "border-gray-300 dark:border-neutral-700"
                            } px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white`}
                          >
                            <option value="">Select Used For</option>
                            {usedForOptions.map((item, index) => (
                              <option key={index} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage
                            name="used_for"
                            component="div"
                            className="mt-1 text-xs text-red-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="hidden">
                      <button type="submit">Submit Dataset</button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>

          {/* Dialog Footer */}
          <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-darkMainBackground sm:px-6 sm:py-4">
            <div className="flex w-full items-center justify-end gap-3">
              {linkingStep > 0 && linkingMode === "create" && (
                <button
                  type="button"
                  onClick={handleCloseLinkModelsDialog}
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
                >
                  Cancel
                </button>
              )}

              {linkingMode === "create" && linkingStep === 1 && (
                <>
                  <CustomButton
                    type="button"
                    className="w-full text-nowrap text-sm sm:w-auto"
                    startIcon={<Save size={16} />}
                    onClick={() => {
                      const skipBtn =
                        document.getElementById("skip-dataset-btn");
                      if (skipBtn) {
                        skipBtn.click();
                      }
                    }}
                  >
                    Save without Dataset
                  </CustomButton>
                  <CustomButton
                    type="submit"
                    loading={isLoading}
                    loadingText="Creating..."
                    className="w-full text-sm sm:w-auto"
                    startIcon={<Save size={16} />}
                    onClick={() => {
                      const form = document.querySelector("form");
                      if (form) {
                        form.requestSubmit();
                      }
                    }}
                  >
                    Next
                  </CustomButton>
                </>
              )}

              {linkingMode === "create" && linkingStep === 2 && (
                <CustomButton
                  type="submit"
                  loading={isLoading}
                  loadingText="Creating..."
                  className="w-full text-sm sm:w-auto"
                  startIcon={<Save size={16} />}
                  onClick={() => {
                    const form = document.querySelector("form");
                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                >
                  Create & Link
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AgentsSection;
