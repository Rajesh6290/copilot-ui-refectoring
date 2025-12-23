"use client";

import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { Dialog } from "@mui/material";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Code,
  Settings,
  Shield,
  Slack,
  Users,
  X,
  Zap
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { ActionDetail, ApiData, PillarMetric } from "./ResposibleAiReport";

interface CombinedActionsCardProps {
  data: ApiData;
  setSelectedPillar: (pillar: PillarMetric, metricId?: string) => void;
  mutate: () => void;
  reportId?: string;
}

const CombinedActionsCard: React.FC<CombinedActionsCardProps> = ({
  data,
  setSelectedPillar,
  mutate
}) => {
  const router = useRouter();
  const { data: slackChannelsData, isValidating: slackValidating } = useSwr(
    "integrations/slack/credintials"
  );
  const { data: jiraCredentialsData, isValidating: jiraValidating } = useSwr(
    "integrations/jira/credentials"
  );
  const { isLoading, mutation } = useMutation();
  const [isTaskAssignDialogOpen, setIsTaskAssignDialogOpen] = useState(false);
  const [selectedSlackChannel, setSelectedSlackChannel] = useState("");
  const [expandedTasks, setExpandedTasks] = useState<{
    [key: string]: boolean;
  }>({});
  const [activeTab, setActiveTab] = useState<string>("ML/Data Engineers");
  const { isLoading: taskMutationLoading, mutation: taskCompletionMutation } =
    useMutation();

  // State to track toggle states for each priority fix
  const [toggleStates, setToggleStates] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Check if Slack is integrated and has channels
  const hasSlackChannels =
    slackChannelsData &&
    slackChannelsData?.slack_teams &&
    slackChannelsData?.slack_teams.length > 0 &&
    slackChannelsData?.slack_teams?.some(
      (team: { channels: { channel_id: string; channel_name: string }[] }) =>
        team?.channels?.length > 0
    );

  // Check if Slack is configured but no channels
  const hasSlackConfigured =
    slackChannelsData &&
    slackChannelsData?.slack_teams &&
    slackChannelsData?.slack_teams.length > 0;

  // Check if Slack integration exists but not fully configured
  const hasSlackIntegration =
    slackChannelsData && Object.keys(slackChannelsData).length > 0;

  // Check if Jira is integrated
  const hasJiraIntegration =
    jiraCredentialsData &&
    jiraCredentialsData?.config_enabled === true &&
    jiraCredentialsData?.jira_base_url &&
    jiraCredentialsData?.default_project_key;

  // Extract real action data from API
  const getAllActions = () => {
    const allActions: (ActionDetail & {
      pillarName: string;
      metricName: string;
    })[] = [];
    data?.pillar_metrics?.forEach((pillar) => {
      const pillarName =
        pillar?.pillar
          ?.replace(/_/g, " ")
          ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
        "Unknown Pillar";
      pillar?.metrics?.forEach((metric) => {
        metric?.action_details?.forEach((action) => {
          allActions.push({
            ...action,
            pillarName,
            metricName: metric?.metric_name || "unknown_metric"
          });
        });
      });
    });
    return allActions;
  };

  const allActions = getAllActions();

  // Toggle task expansion
  const toggleTaskExpansion = (taskKey: string) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  // Map actions to Slack format
  const mapActionsToSlackFormat = () => {
    const tasks: {
      action_id: string;
      action_description: string;
      role_by_action: string;
      linked_metrics: string[];
      linked_risks: string[];
      applications: string[];
    }[] = [];
    allActions.forEach((action) => {
      // Create tasks for each role
      if (action.ml_engineer_action?.length > 0) {
        tasks.push({
          action_id: action.action_id,
          action_description: action.description,
          role_by_action: "ML Engineer",
          linked_metrics: [action.metricName],
          linked_risks: action.source || [],
          applications: [action.pillarName]
        });
      }
      if (action.business_manager_action?.length > 0) {
        tasks.push({
          action_id: action.action_id + "_BM",
          action_description: action.description,
          role_by_action: "Business Manager",
          linked_metrics: [action.metricName],
          linked_risks: action.source || [],
          applications: [action.pillarName]
        });
      }
      if (action.compliance_manager_action?.length > 0) {
        tasks.push({
          action_id: action.action_id + "_CM",
          action_description: action.description,
          role_by_action: "Compliance Manager",
          linked_metrics: [action.metricName],
          linked_risks: action.source || [],
          applications: [action.pillarName]
        });
      }
    });
    return { tasks };
  };

  // Map actions to Jira format
  const mapActionsToJiraFormat = () => {
    const tasks: {
      summary: string;
      description: string;
    }[] = [];
    allActions.forEach((action) => {
      tasks.push({
        summary: action.action_id || "Unknown Action",
        description: action.description || "No description available"
      });
    });
    return { tasks };
  };

  // Handle Slack assignment with channel selection
  const handleAssignToSlack = async () => {
    if (!selectedSlackChannel) {
      toast.error("Please select a Slack channel");
      return;
    }

    try {
      const payload = mapActionsToSlackFormat();
      const res = await mutation(
        `assign-slack-task?channel_id=${selectedSlackChannel}`,
        {
          method: "POST",
          isAlert: false,
          body: payload
        }
      );
      if (res?.status === 200) {
        toast.success("Tasks assigned to Slack successfully!");
        setIsTaskAssignDialogOpen(false);
        setSelectedSlackChannel("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  // Handle Jira assignment
  const handleAssignToJira = async () => {
    try {
      const payload = mapActionsToJiraFormat();
      const res = await mutation("assign-jira-task", {
        method: "POST",
        isAlert: false,
        body: payload
      });
      if (res?.status === 200) {
        toast.success("Tasks assigned to Jira successfully!");
        setIsTaskAssignDialogOpen(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  // Handle integration navigation
  const handleSlackIntegration = () => {
    router.push(
      "/system-settings?system-settings-tab=integration#integration-sub-tab=settings-slack-integration"
    );
  };

  const handleJiraIntegration = () => {
    router.push(
      "/system-settings?system-settings-tab=integration#integration-sub-tab=settings-jira-integration"
    );
  };

  // Group actions by role
  const roleActions = [
    {
      role: "ML/Data Engineers",
      icon: <Code className="h-4 w-4" />,
      color: "tertiary",
      tasks: allActions?.map((action, index) => ({
        title: action?.action_id || "Unknown Action",
        description: action?.description || "No description available",
        priority: index === 0 ? "High" : index === 1 ? "Medium" : "Low",
        actions: action?.ml_engineer_action || [],
        pillarName: action?.pillarName || "Unknown Pillar",
        metricName: action?.metricName || "Unknown Metric"
      }))
    },
    {
      role: "Business/Product Managers",
      icon: <Users className="h-4 w-4" />,
      color: "green",
      tasks: allActions?.map((action, index) => ({
        title: action?.action_id || "Unknown Action",
        description: action?.description || "No description available",
        priority: index === 0 ? "High" : index === 1 ? "Medium" : "Low",
        actions: action?.business_manager_action || [],
        pillarName: action?.pillarName || "Unknown Pillar",
        metricName: action?.metricName || "Unknown Metric"
      }))
    },
    {
      role: "Risk/Compliance Manager",
      icon: <Shield className="h-4 w-4" />,
      color: "red",
      tasks: allActions?.map((action, index) => ({
        title: action?.action_id || "Unknown Action",
        description: action?.description || "No description available",
        priority: index === 0 ? "Critical" : index === 1 ? "High" : "Medium",
        actions: action?.compliance_manager_action || [],
        pillarName: action?.pillarName || "Unknown Pillar",
        metricName: action?.metricName || "Unknown Metric"
      }))
    }
  ];

  // Extract priority fixes from business impacts with task_completed status
  const priorityFixes =
    data?.pillar_metrics
      ?.filter((pillar) => (pillar?.metrics_count || 0) > 0)
      ?.flatMap((pillar) => {
        const pillarName =
          pillar?.pillar
            ?.replace(/_/g, " ")
            ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
          "Unknown Pillar";
        return (
          pillar?.metrics
            ?.filter((metric) => metric?.risk_band === "high")
            ?.map((metric, index) => {
              const fixId = `${pillar.pillar}-${metric.metric_name}-${index}`;
              const taskCompleted = metric?.task_completed || false;
              // Initialize toggle state if not already set
              if (!(fixId in toggleStates)) {
                setToggleStates((prev) => ({
                  ...prev,
                  [fixId]: taskCompleted
                }));
              }
              return {
                id: fixId,
                pillar: pillarName,
                action: metric?.risk_name || `Fix ${pillarName} issues`,
                severity: metric?.risk_band || "medium",
                riskName: metric?.risk_name || "Unknown Risk",
                riskId: metric?.risk_id || "N/A",
                metricName: metric?.metric_name || "Unknown Metric",
                evidence: metric?.risk_description || "System analysis",
                taskCompleted: taskCompleted,
                originalMetric: metric
              };
            }) || []
        );
      })
      ?.filter((fix) => fix) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Navigation function to find correct pillar and metric
  const navigateToMetric = (pillarName: string, metricName: string) => {
    const pillar = data?.pillar_metrics?.find(
      (p) =>
        p?.pillar
          ?.replace(/_/g, " ")
          ?.replace(/\b\w/g, (l: string) => l.toUpperCase()) === pillarName
    );
    if (pillar) {
      setSelectedPillar(pillar, metricName);
    }
  };

  // Get active tab data
  const getActiveTabData = () => {
    return (
      roleActions.find((role) => role.role === activeTab) || roleActions[0]
    );
  };

  const activeRoleData = getActiveTabData();

  // Handle task status changes
  const handleTaskStatusChanges = async (
    fixId: string,
    metricName: string,
    newStatus: boolean
  ) => {
    try {
      // Update local state immediately for better UX
      setToggleStates((prev) => ({
        ...prev,
        [fixId]: newStatus
      }));
      const res = await taskCompletionMutation(
        `responsible-ai/report/tasks-change?metric_name=${metricName}&report_id=${data?.report_id}`,
        {
          method: "PUT",
          isAlert: false
        }
      );
      if (res?.status === 200) {
        toast.success("Task status updated successfully!");
        mutate();
      } else {
        // Revert the state if API call failed
        setToggleStates((prev) => ({
          ...prev,
          [fixId]: !newStatus
        }));
        toast.error("Failed to update task status");
      }
    } catch (error) {
      // Revert the state if API call failed
      setToggleStates((prev) => ({
        ...prev,
        [fixId]: !newStatus
      }));
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  // Toggle component
  const ToggleButton: React.FC<{
    isOn: boolean;
    onToggle: () => void;
    disabled?: boolean;
    size?: "sm" | "md";
  }> = ({ isOn, onToggle, disabled = false, size = "sm" }) => {
    const sizeClasses = size === "sm" ? "w-10 h-5" : "w-12 h-6";
    const thumbClasses = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <button
        onClick={onToggle}
        disabled={disabled}
        className={` ${sizeClasses} flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
          isOn
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${isOn ? "justify-end" : "justify-start"} `}
      >
        <div
          className={`${thumbClasses} rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out`}
        />
      </button>
    );
  };

  return (
    <>
      <motion.section
        id="actions-by-role"
        className="rounded-2xl border border-green-200 bg-white p-4 dark:border-neutral-900 dark:bg-darkSidebarBackground sm:p-6 lg:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Actions by Role Section */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex w-full items-center gap-5">
                <div className="b flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg sm:h-12 sm:w-12">
                  <Users className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    Actions by Role
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Prioritized tasks for different team roles
                  </p>
                </div>
              </div>
              <div className="sm:ml-auto">
                <span className="text-nowrap rounded-full bg-green-100 px-3 py-2 text-sm font-medium text-green-800 dark:bg-green-800 dark:text-green-200 sm:px-4">
                  {allActions.length} Total Actions
                </span>
              </div>
            </div>
            {/* Task Assignment Button */}
            <div className="flex-shrink-0">
              {hasSlackChannels || hasJiraIntegration ? (
                <button
                  onClick={() => setIsTaskAssignDialogOpen(true)}
                  disabled={
                    slackValidating || jiraValidating || allActions.length === 0
                  }
                  className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-tertiary-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-tertiary-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 sm:px-6 sm:py-3"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Assign Tasks</span>
                  <span className="sm:hidden">Assign</span>
                </button>
              ) : hasSlackIntegration || hasSlackConfigured ? (
                <button
                  onClick={() => setIsTaskAssignDialogOpen(true)}
                  className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-yellow-700 hover:to-orange-700 sm:px-6 sm:py-3"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Complete Setup</span>
                  <span className="sm:hidden">Setup</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsTaskAssignDialogOpen(true)}
                  className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-purple-700 hover:to-indigo-700 sm:px-6 sm:py-3"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Setup Integration</span>
                  <span className="sm:hidden">Setup</span>
                </button>
              )}
            </div>
          </div>

          {/* Show integration status if no integrations */}
          {!hasSlackChannels &&
            !hasJiraIntegration &&
            !slackValidating &&
            !jiraValidating && (
              <motion.div
                className="mb-4 rounded-lg border border-tertiary-200 bg-tertiary-50 p-3 dark:border-tertiary-800 dark:bg-tertiary-900/20 sm:mb-6 sm:p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Settings className="h-4 w-4 flex-shrink-0 text-tertiary-600 dark:text-tertiary-400 sm:h-5 sm:w-5" />
                  <div>
                    <h4 className="text-sm font-medium text-tertiary-900 dark:text-tertiary-100">
                      {hasSlackConfigured || hasSlackIntegration
                        ? "Integration Setup Required"
                        : "Integration Required"}
                    </h4>
                    <p className="text-sm text-tertiary-700 dark:text-tertiary-300">
                      {hasSlackConfigured
                        ? "Slack is configured but channels need to be set up."
                        : hasSlackIntegration
                          ? "Complete your Slack or Jira integration setup."
                          : "Connect Slack or Jira to assign tasks directly to your team."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          {/* Tab Navigation */}
          <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 dark:border-neutral-800 sm:mb-8">
            {roleActions.map((roleData) => (
              <button
                key={roleData.role}
                onClick={() => setActiveTab(roleData.role)}
                className={`flex items-center space-x-2 rounded-t-lg border-b-2 px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === roleData.role
                    ? "border-tertiary-500 bg-gradient-to-r from-tertiary-50 to-indigo-50 text-tertiary-600 dark:from-tertiary-900/30 dark:to-indigo-900/30 dark:text-tertiary-400"
                    : "border-transparent text-gray-600 hover:border-tertiary-300 hover:text-tertiary-600 dark:text-gray-400 dark:hover:text-tertiary-400"
                }`}
              >
                <div
                  className={`rounded-md p-1 ${
                    activeTab === roleData.role
                      ? roleData.color === "tertiary"
                        ? "bg-tertiary-100 text-tertiary-600 dark:bg-tertiary-900 dark:text-tertiary-400"
                        : roleData.color === "green"
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {roleData.icon}
                </div>
                <span className="hidden sm:inline">{roleData.role}</span>
                <span className="sm:hidden">{roleData.role.split("/")[0]}</span>
                <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {roleData.tasks?.filter((task) => task.actions.length > 0)
                    .length || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid max-h-[40rem] grid-cols-1 gap-4 overflow-y-auto sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {activeRoleData?.tasks
                ?.filter((task) => task.actions.length > 0)
                .map((task, taskIndex) => {
                  const taskKey = `${activeRoleData.role}-${taskIndex}`;
                  const isExpanded = expandedTasks[taskKey];
                  const shortDescription =
                    task.description.length > 80
                      ? task.description.substring(0, 80) + "..."
                      : task.description;
                  return (
                    <motion.div
                      key={taskIndex}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-shadow hover:shadow-md dark:border-neutral-900 dark:bg-darkSidebarBackground sm:p-5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: taskIndex * 0.1 }}
                    >
                      <div className="mb-4">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <h5 className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
                            {task.title}
                          </h5>
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                          {shortDescription}
                        </p>
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-tertiary-100 px-2 py-1 text-xs text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200">
                            {task.pillarName}
                          </span>
                          <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {task.metricName}
                          </span>
                        </div>
                        {/* Show actions when expanded */}
                        {isExpanded && task.actions.length > 0 && (
                          <motion.div
                            className="mt-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <h6 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                              Action Items ({task.actions.length}):
                            </h6>
                            <div className="space-y-2">
                              {task.actions.map((action, actionIndex) => (
                                <div
                                  key={actionIndex}
                                  className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
                                >
                                  <span className="mt-1 font-bold text-tertiary-600 dark:text-tertiary-400">
                                    {actionIndex + 1}.
                                  </span>
                                  <span className="flex-1">{action}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleTaskExpansion(taskKey)}
                          className="w-full rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-all hover:from-gray-200 hover:to-gray-300 dark:from-gray-600 dark:to-gray-700 dark:text-white dark:hover:from-gray-500 dark:hover:to-gray-600"
                        >
                          {isExpanded ? (
                            <span className="flex items-center justify-center space-x-2">
                              <span>Hide Actions</span>
                              <span className="text-xs">
                                ({task.actions.length})
                              </span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center space-x-2">
                              <span>View Actions</span>
                              <span className="text-xs">
                                ({task.actions.length})
                              </span>
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() =>
                            navigateToMetric(task.pillarName, task.metricName)
                          }
                          className="w-full rounded-lg bg-tertiary-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-tertiary-700"
                        >
                          Go to Metric
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
            {/* Empty State */}
            {/* Empty State */}
            {(!activeRoleData?.tasks ||
              activeRoleData.tasks.filter((task) => task.actions.length > 0)
                .length === 0) && (
              <div className="py-8 text-center sm:py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  {activeRoleData?.icon}
                </div>
                <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  No Actions Available
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  There are currently no actions assigned to{" "}
                  {activeRoleData?.role.toLowerCase()}.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* 48-Hour Fix List Section */}
        <div className="border-t-2 border-gray-200 pt-8 dark:border-neutral-800 sm:pt-12">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg sm:h-12 sm:w-12">
              <Zap className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                48-Hour Priority Fixes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick wins that can be implemented within 48 hours
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="rounded-full bg-orange-100 px-3 py-2 text-sm font-medium text-orange-800 dark:bg-orange-800 dark:text-orange-200 sm:px-4">
                Quick Impact
              </span>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-darkMainBackground">
            <div className="overflow-x-auto">
              <div className="max-h-80 overflow-y-auto sm:max-h-96">
                <table className="w-full min-w-[740px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-gray-600 dark:from-darkHoverBackground dark:to-darkHoverBackground">
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 sm:px-6 sm:py-4 sm:text-sm">
                        Pillar
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 sm:px-6 sm:py-4 sm:text-sm">
                        Risk Name
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 sm:px-6 sm:py-4 sm:text-sm">
                        Severity
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 sm:px-6 sm:py-4 sm:text-sm">
                        Description
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 dark:text-gray-300 sm:px-6 sm:py-4 sm:text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {priorityFixes.map((fix, index) => (
                      <motion.tr
                        key={fix.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-neutral-800 dark:hover:bg-gray-700/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <td className="px-3 py-3 sm:px-6 sm:py-4">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                            {fix.pillar}
                          </span>
                        </td>
                        <td className="px-3 py-3 sm:px-6 sm:py-4">
                          <span className="text-xs capitalize text-gray-700 dark:text-gray-300 sm:text-sm">
                            {fix?.riskName?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-3 py-3 sm:px-6 sm:py-4">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              fix.severity === "high"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : fix.severity === "med"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }`}
                          >
                            {fix.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-3 sm:px-6 sm:py-4">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {fix.evidence}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center sm:px-6 sm:py-4">
                          <div className="flex items-center justify-center">
                            <ToggleButton
                              isOn={toggleStates[fix?.riskName] || false}
                              onToggle={() =>
                                handleTaskStatusChanges(
                                  fix?.riskName,
                                  fix.metricName,
                                  !(toggleStates[fix?.riskName] || false)
                                )
                              }
                              disabled={taskMutationLoading}
                              size="sm"
                            />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-neutral-800 dark:bg-darkHoverBackground">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-red-500">✦</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Status:
                </span>
                <span className="text-gray-600 dark:text-gray-400">Use</span>
                <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-800 dark:bg-green-900 dark:text-green-200">
                  [ON]
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  to indicate the fix has been applied.
                </span>
                <span className="rounded bg-orange-100 px-2 py-1 text-xs font-bold text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  [OFF]
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  means pending.
                </span>
              </div>
            </div>
          </div>
          {priorityFixes.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg dark:border-neutral-800 dark:bg-darkMainBackground">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Zap className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                No Priority Fixes Available
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Great news! No urgent fixes are currently needed within the
                48-hour window, as there are no high risk.
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* SINGLE UNIFIED DIALOG */}
      <Dialog
        open={isTaskAssignDialogOpen}
        onClose={() => {
          setIsTaskAssignDialogOpen(false);
          setSelectedSlackChannel("");
        }}
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: 0,
            height: "100%",
            backgroundColor: "transparent",
            boxShadow: "none",
            border: "none",
            outline: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }
        }}
      >
        <motion.div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-neutral-900 dark:bg-darkSidebarBackground">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Assign Tasks
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred platform
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsTaskAssignDialogOpen(false);
                setSelectedSlackChannel("");
              }}
              className="p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Slack Option */}
            <div className="rounded-lg border border-gray-200 p-6 transition-colors hover:border-purple-300 dark:border-neutral-700 dark:hover:border-purple-600">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                    <Slack className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Slack
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Assign to Slack channels
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {hasSlackChannels ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      Connected
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                      Not Connected
                    </span>
                  )}
                </div>
              </div>

              {hasSlackChannels ? (
                <div className="space-y-4">
                  {/* Channel Selection Dropdown */}
                  <div>
                    <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Channel
                    </span>
                    <select
                      value={selectedSlackChannel}
                      onChange={(e) => setSelectedSlackChannel(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-darkMainBackground dark:text-white"
                    >
                      <option value="">Choose a channel...</option>
                      {slackChannelsData?.slack_teams?.map(
                        (team: {
                          id: string;
                          name: string;
                          channels: Array<{ id: string; name: string }>;
                        }) =>
                          team.channels?.map(
                            (channel: { id: string; name: string }) => (
                              <option key={channel.id} value={channel.id}>
                                #{channel.name}
                              </option>
                            )
                          )
                      )}
                    </select>
                  </div>

                  {/* Assign Button */}
                  <button
                    onClick={handleAssignToSlack}
                    disabled={isLoading || !selectedSlackChannel}
                    className="flex w-full items-center justify-center space-x-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Assign to Slack</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSlackIntegration}
                  className="w-full rounded-lg bg-gray-600 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-700"
                >
                  Setup Slack Integration
                </button>
              )}
            </div>

            {/* Jira Option */}
            <div className="rounded-lg border border-gray-200 p-6 transition-colors hover:border-blue-300 dark:border-neutral-700 dark:hover:border-blue-600">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <svg
                      className="h-5 w-5 text-blue-600 dark:text-blue-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm1.005-1.005H24a5.218 5.218 0 0 0-5.232-5.215h-2.13V3.236A5.215 5.215 0 0 0 11.425 0v11.482a1.005 1.005 0 0 0 1.005 1.005z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Jira
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create Jira tickets
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {hasJiraIntegration ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      Connected
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                      Not Connected
                    </span>
                  )}
                </div>
              </div>
              {hasJiraIntegration ? (
                <button
                  onClick={handleAssignToJira}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span>Creating Tasks...</span>
                    </>
                  ) : (
                    <span>Create Jira Tasks</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleJiraIntegration}
                  className="w-full rounded-lg bg-gray-600 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-700"
                >
                  Setup Jira Integration
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </Dialog>
    </>
  );
};

export default CombinedActionsCard;
