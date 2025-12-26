"use client";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Check,
  ChevronRight,
  Circle,
  ExternalLink,
  Eye,
  Files,
  FileText,
  ListChecks,
  Loader2,
  MessageSquareText,
  MessagesSquare,
  Play,
  Shield
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback
} from "react";
import { toast } from "sonner";
import { BsDatabaseDown } from "react-icons/bs";
import { IoDocumentTextOutline } from "react-icons/io5";
import { TiDocumentText } from "react-icons/ti";
import { TbReportAnalytics } from "react-icons/tb";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import CustomButton from "@/shared/core/CustomButton";
interface TransformedStep {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryIndex: number | undefined;
  icon: React.ReactElement;
  status: string;
  taskId: string | null;
  fieldValue: string | null;
  taskLink: string | null;
  taskSteps: string[];
  taskType: string | null;
  isCompleted: boolean;
  isAvailable: boolean;
  badge: { text: string; icon: React.ReactElement; className: string };
  cardStyle: string;
  iconStyle: string;
  textStyle: string;
  expandedStyle: string;
  nodeStyle: string;
  chevronStyle: string;
}

interface Task {
  name?: string;
  description?: string;
  task_status?: string;
  task_type?: string;
  task_id?: string;
  field_value?: string;
  task_link?: string;
  task_steps?: string[];
}

interface Phase {
  phase?: string;
  tasks?: Task[];
}

const getIconForTask = (taskName: string) => {
  const name = taskName;

  if (name.includes("Knowledge")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-100 shadow-sm">
        <Files className="size-5" />
      </div>
    );
  }
  if (name.includes("RAI Report")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-100 shadow-sm">
        <TbReportAnalytics className="size-5" />
      </div>
    );
  }
  if (name.includes("Assessment")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-100 shadow-sm">
        <MessageSquareText className="size-5" />
      </div>
    );
  }
  if (name.includes("Chat +")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-100 shadow-sm">
        <MessagesSquare className="size-5" />
      </div>
    );
  }
  if (name.includes("Policy")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-100 shadow-sm">
        <TiDocumentText className="size-5" />
      </div>
    );
  }
  if (name.includes("Trust Center")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-100 shadow-sm">
        <IoDocumentTextOutline className="size-5 text-tertiary" />
      </div>
    );
  }
  if (name.includes("Application")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-100 shadow-sm">
        <BsDatabaseDown className="size-5 text-tertiary" />
      </div>
    );
  }
  if (name.includes("certification")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-100 shadow-sm">
        <Award className="size-5 text-tertiary" />
      </div>
    );
  }
  if (name.includes("transparency")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-100 shadow-sm">
        <Eye className="size-5 text-tertiary" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-tertiary-100 shadow-sm">
      <FileText className="size-5 text-tertiary" />
    </div>
  );
};

// Dynamic status mapping - no hardcoded statuses
const getStatusInfo = (status: string) => {
  const normalizedStatus = status?.toLowerCase() || "";

  // Check for "not found" status (red)
  if (normalizedStatus.includes("not found")) {
    return {
      isCompleted: false,
      isAvailable: false,
      badge: {
        text: status,
        icon: <Circle className="h-3 w-3" />,
        className: "bg-red-100 text-red-700"
      },
      cardStyle:
        "border-white-200 bg-white-50 shadow-md hover:shadow-white-100 hover:bg-white-100 dark:border-white-600/50 dark:bg-white-900/20 dark:hover:bg-white-900/30",
      iconStyle:
        "bg-white-100 text-white-700 dark:bg-white-800/50 dark:text-white-300",
      textStyle: "text-white-800 dark:text-white-200",
      expandedStyle: "bg-white-100/50 dark:bg-white-900/30",
      nodeStyle:
        "border-2 border-red-100 bg-red-500 shadow-lg shadow-red-200 hover:scale-110",
      chevronStyle: "text-white-600 dark:text-white-400"
    };
  }

  // Default for any other status (gray)
  return {
    isCompleted: false,
    isAvailable: true,
    badge: {
      text: status,
      icon: <Circle className="h-3 w-3" />,
      className: "bg-green-200 text-green-700"
    },
    cardStyle:
      "border-white-200 bg-white-50 shadow-md hover:shadow-white-100 hover:bg-white-100 dark:border-white-600/50 dark:bg-white-800/20 dark:hover:bg-white-800/30",
    iconStyle:
      "bg-white-100 text-white-600 dark:bg-white-700/50 dark:text-white-400",
    textStyle: "text-white-800 dark:text-white-300",
    expandedStyle: "bg-white-100/50 dark:bg-white-800/30",
    nodeStyle:
      "border-2 border-green bg-green-600 shadow-lg shadow-green-300 hover:scale-110",
    chevronStyle: "text-white-400 dark:text-white-500"
  };
};

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <div className="mx-auto h-fit w-full animate-pulse p-6">
      {/* Header Skeleton */}
      <div className="mb-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gray-300"></div>
            <div>
              <div className="mb-2 h-6 w-48 rounded bg-gray-300"></div>
              <div className="h-4 w-32 rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="h-10 w-32 rounded-lg bg-gray-300"></div>
        </div>

        {/* Progress Card Skeleton */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="mb-2 h-5 w-40 rounded bg-gray-300"></div>
              <div className="h-4 w-32 rounded bg-gray-200"></div>
            </div>
            <div className="text-right">
              <div className="mb-1 h-8 w-16 rounded bg-gray-300"></div>
              <div className="h-3 w-12 rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="mb-4 h-2 rounded-full bg-gray-200"></div>
          <div className="flex justify-between">
            <div className="h-4 w-24 rounded bg-gray-200"></div>
            <div className="h-4 w-20 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="relative">
        <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-gray-300"></div>

        {[...Array(6)].map((_, index) => (
          <div key={index} className="relative mb-8">
            {/* Category Header Skeleton (for first item) */}
            {index === 0 && (
              <div className="mb-6 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                <div>
                  <div className="mb-1 h-4 w-32 rounded bg-gray-300"></div>
                  <div className="h-px w-40 bg-gray-200"></div>
                </div>
              </div>
            )}

            <div className="flex items-start">
              {/* Timeline Node Skeleton */}
              <div className="relative mr-4 flex h-10 w-10 items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-gray-300"></div>
              </div>

              {/* Step Card Skeleton */}
              <div className="flex-1">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-300"></div>
                        <div className="h-6 w-20 rounded bg-gray-200"></div>
                      </div>
                    </div>
                    <div className="h-5 w-5 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mx-auto mb-6 h-5 w-48 rounded bg-gray-300"></div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-gray-300"></div>
              <div className="mx-auto h-4 w-16 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DynamicImplementation = () => {
  const [runId, setRunId] = useState<string>("");
  const { isLoading, mutation } = useMutation();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { isLoading: syncLoading, mutation: syncMutation } = useMutation();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [animatedProgress, setAnimatedProgress] = useState<number>(0);
  const [visibleDots, setVisibleDots] = useState<number[]>([]);
  const [lineHeight, setLineHeight] = useState<number>(0);

  // Refs for task elements to enable scrolling
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const {
    data: allRunData,
    isValidating: allRunLoading,
    mutate: allMutate
  } = useSwr(id ? `workflow/runs/list?workflow_id=${id}` : null);
  const router = useRouter();
  const { data, isValidating, error, mutate } = useSwr(
    runId ? `workflow/status/${runId}` : null
  );

  const runWorkflow = useCallback(async () => {
    try {
      const response = await mutation(
        "workflow/run?workflow_id=HAIGHS_WORKFLOW&workflow_name=HAIGS Complete Governance Workflow",
        { method: "POST" }
      );

      if (response?.status === 200) {
        allMutate();
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to run workflow"
      );
    }
  }, [mutation, allMutate]);

  useEffect(() => {
    if (!allRunLoading && allRunData && allRunData?.runs?.length === 0) {
      runWorkflow();
    } else {
      const latestRun = allRunData?.runs?.[0];
      if (latestRun) {
        setRunId(latestRun.run_id);
        mutate();
      }
    }
  }, [allRunData, allRunLoading, mutate, runWorkflow]);

  const { steps, progressPercentage, workflowInfo } = useMemo(() => {
    // Handle both old structure (data.tasks) and new structure (data.task_results)
    const taskResults = data?.task_results || data?.tasks;

    if (!taskResults || !Array.isArray(taskResults)) {
      return {
        steps: [],
        totalSteps: 0,
        completedSteps: [],
        progressPercentage: 0,
        workflowInfo: null
      };
    }

    const transformedSteps: TransformedStep[] = [];
    const completed: number[] = [];
    let stepIndex = 0;
    let categoryIndex = 1;

    taskResults.forEach((phase: Phase, phaseIdx: number) => {
      if (!phase?.tasks || !Array.isArray(phase.tasks)) {
        return;
      }

      phase.tasks.forEach((task: Task, taskIdx: number) => {
        if (!task?.name) {
          return;
        }

        const statusInfo = getStatusInfo(task.task_status || "Unknown");

        transformedSteps.push({
          id: `${phaseIdx}-${taskIdx}`,
          title: task.name || "Untitled Task",
          description: task.description || "No description available",
          category: (phase.phase || "Unknown Phase").toUpperCase(),
          categoryIndex: taskIdx === 0 ? categoryIndex : undefined,
          icon: getIconForTask(task.task_type || ""),
          status:
            task.task_status === "Not found"
              ? "Pending"
              : task.task_status || "Unknown",
          taskId: task.task_id || null,
          fieldValue: task.field_value || null,
          taskLink: task.task_link || null,
          taskSteps: task.task_steps || [],
          taskType: task.task_type || null,
          ...statusInfo
        });

        if (statusInfo.isCompleted) {
          completed.push(stepIndex);
        }
        stepIndex++;
      });
      categoryIndex++;
    });

    const total = transformedSteps.length;

    // Use API provided counts if available, otherwise calculate from transformed data
    const completedCount = data?.completed_tasks ?? completed.length;
    const totalCount = data?.total_tasks ?? total;
    const progress =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Extract workflow information from API response
    const workflowData = {
      runId: data?.run_id || null,
      workflowId: data?.workflow_id || null,
      workflowName: data?.workflow_name || null,
      clientId: data?.client_id || null,
      tenantId: data?.tenant_id || null,
      status: data?.status === "Not found" ? "Pending" : data?.status || null,
      totalTasks: data?.total_tasks || total,
      completedTasks: data?.completed_tasks || completed.length,
      failedTasks: data?.failed_tasks || 0,
      error: data?.error || null,
      startedAt: data?.started_at || null,
      finishedAt: data?.finished_at || null
    };

    return {
      steps: transformedSteps,
      totalSteps: totalCount,
      completedSteps: completed,
      progressPercentage: progress,
      workflowInfo: workflowData
    };
  }, [data]);

  // Handle URL task navigation
  useEffect(() => {
    const taskIdParam = searchParams.get("task_id");

    if (taskIdParam && steps && steps.length > 0) {
      // Find the step with matching task_id
      const targetStep = steps.find((step) => step.taskId === taskIdParam);

      if (targetStep) {
        // Set expanded step
        setExpandedStep(targetStep.id);

        // Wait for DOM to update and then scroll
        setTimeout(() => {
          const targetElement = taskRefs.current[targetStep.id];
          if (targetElement) {
            // Scroll to element with smooth behavior
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest"
            });
          }
        }, 500); // Wait for animations to complete
      }
    }
  }, [searchParams, steps, visibleDots]); // Include visibleDots to ensure animation is complete

  // Handle workflow run
  const handleRunWorkflow = async () => {
    if (isLoading) {
      return;
    }

    try {
      const response = await mutation(`workflow/run?workflow_id=${runId}`, {
        method: "POST"
      });

      if (response?.status === 200) {
        mutate();
        toast.success("Workflow run successfully");
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to run workflow"
      );
    }
  };

  const handleSync = async () => {
    try {
      const res = await syncMutation(`workflow/sync/${runId}`, {
        method: "POST",
        isAlert: false
      });
      if (res?.status === 200) {
        toast.success("Reviewed updates successfully.");
        mutate(); // Refresh the data after sync
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to run workflow"
      );
    }
  };

  // Handle step completion (you might want to make an API call here)
  const handleStepComplete = (index: number) => {
    const step = steps?.[index];
    if (step && step.status === "not_started") {
      // Here you would typically make an API call to update the status
      // Example: updateTaskStatus(step.taskId, 'in_progress');
    }
  };

  // Handle task link navigation
  const handleTaskLinkClick = (taskLink: string) => {
    if (taskLink) {
      router.push(taskLink);
    }
  };
  // Animate progress bar (faster)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 80); // was 300, now 80ms for faster animation
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  // Animate timeline appearance (faster)
  useEffect(() => {
    if (steps?.length > 0) {
      // Reset animations when new data comes in
      setVisibleDots([]);
      setLineHeight(0);

      setTimeout(() => {
        setLineHeight(100);
      }, 180); // was 500, now 180ms for faster line animation

      steps.forEach((_, index) => {
        setTimeout(
          () => {
            setVisibleDots((prev: number[]) => [...prev, index]);
          },
          index * 40 + 350 // was index*120+1800, now much faster
        );
      });
    }
  }, [steps]);

  const toggleStep = (stepId: string) => {
    const newExpandedStep = expandedStep === stepId ? null : stepId;
    setExpandedStep(newExpandedStep);

    // Update URL with task_id parameter when expanding a task
    if (newExpandedStep) {
      const targetStep = steps.find((step) => step.id === stepId);
      if (targetStep && targetStep.taskId) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("task_id", targetStep.taskId);

        // Update URL without page reload
        window.history.pushState({}, "", currentUrl.toString());
      }
    } else {
      // Remove task_id parameter when collapsing
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("task_id");

      // Update URL without page reload
      window.history.pushState({}, "", currentUrl.toString());
    }
  };

  // Loading state with skeleton
  if ((isValidating && !data) || isLoading || allRunLoading) {
    return <SkeletonLoader />;
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto h-fit w-full p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-800">
            Error Loading Data
          </h3>
          <p className="text-red-600">
            Failed to load implementation status. Please try again.
          </p>
          <button
            onClick={() => mutate()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  const taskResults = data?.task_results || data?.tasks;
  if (!taskResults || !Array.isArray(taskResults) || steps?.length === 0) {
    return (
      <div className="mx-auto h-fit w-full p-6">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            No Implementation Data
          </h3>
          <p className="text-gray-600">
            No implementation tasks found for this workflow.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto h-fit w-full p-6">
      {/* Modern Header */}
      <div className="mb-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-tertiary-600 to-indigo-700 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div
                className={`absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white ${
                  workflowInfo?.status === "completed"
                    ? "bg-green-500"
                    : workflowInfo?.status === "in_progress"
                      ? "bg-yellow-500"
                      : workflowInfo?.status === "failed"
                        ? "bg-red-500"
                        : "bg-gray-400"
                }`}
              ></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {workflowInfo?.workflowName || "Implementation Progress"}
            </h1>
          </div>

          {/* Run Workflow Button */}
          <div className="flex items-center gap-5">
            <CustomButton
              onClick={handleSync}
              disabled={syncLoading}
              loading={syncLoading}
              loadingText="Reviewing..."
            >
              Review
            </CustomButton>
            <button
              onClick={handleRunWorkflow}
              disabled={isLoading || workflowInfo?.status === "completed"}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                isLoading || workflowInfo?.status === "completed"
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "transform bg-gradient-to-r from-tertiary-600 to-indigo-700 text-white hover:-translate-y-0.5 hover:from-tertiary-700 hover:to-indigo-800 hover:shadow-lg"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : workflowInfo?.status === "completed" ? (
                <>
                  <Check className="h-4 w-4" />
                  Evaluated
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Workflow
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-neutral-900 dark:bg-darkSidebarBackground">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Implementation Progress
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span>
                  {workflowInfo?.totalTasks
                    ? `${workflowInfo.completedTasks}/${workflowInfo.totalTasks} tasks completed`
                    : "Complete tasks to advance the workflow"}
                </span>
                {workflowInfo && workflowInfo.failedTasks > 0 && (
                  <span className="text-red-600">
                    • {workflowInfo.failedTasks} tasks pending
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-3xl font-bold text-transparent">
                {animatedProgress}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Completed
              </p>
            </div>
          </div>

          <div className="relative mb-4 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-1000 ease-out"
              style={{ width: `${animatedProgress}%` }}
            >
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Timeline */}
      <div className="relative" style={{ minHeight: "800px" }}>
        {/* Background Timeline */}
        <div className="absolute bottom-0 left-5 top-0 w-0.5 bg-gray-300 dark:bg-tertiary"></div>

        {/* Animated Progress Line */}
        <div className="absolute left-5 top-0 w-0.5 overflow-hidden">
          <div
            className="duration-1500 w-full bg-gradient-to-b from-tertiary-500 to-indigo-600 transition-all ease-out"
            style={{ height: `${lineHeight}%` }}
          />
        </div>

        {steps?.map((step, index) => (
          <div
            key={step?.id}
            ref={(el) => {
              taskRefs.current[step?.id] = el;
            }}
            className="relative mb-5 transition-all duration-300"
            style={{ minHeight: "70px" }}
          >
            {/* Category Header */}
            {step?.categoryIndex && (
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-600 to-indigo-700 text-sm font-bold text-white shadow-lg">
                    {step.categoryIndex}
                  </div>
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wide text-tertiary-700">
                      {step?.category}
                    </h2>
                    <div className="mt-1 h-px w-40 bg-gradient-to-r from-tertiary-300 to-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Item */}
            <div className="flex items-start">
              {/* Professional Timeline Node */}
              <div className="relative mr-4 flex h-10 w-10 items-center justify-center">
                <div
                  tabIndex={0}
                  role="button"
                  className={`relative flex h-4 w-4 cursor-pointer items-center justify-center rounded-full transition-all duration-500 ${
                    visibleDots?.includes(index)
                      ? "scale-100 opacity-100"
                      : "scale-0 opacity-0"
                  } ${step?.nodeStyle}`}
                  onClick={() => handleStepComplete(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleStepComplete(index);
                    }
                  }}
                >
                  {/* Check mark for completed */}
                  {step?.isCompleted && (
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  )}

                  {/* Pulse ring for in progress */}
                  {step?.status?.toLowerCase().includes("progress") && (
                    <div className="absolute h-6 w-6 animate-pulse rounded-full border-2 border-tertiary-400 opacity-60"></div>
                  )}
                </div>

                {/* Success ripple */}
                {step?.isCompleted && visibleDots?.includes(index) && (
                  <div className="absolute h-7 w-7 animate-ping rounded-full bg-emerald-500 opacity-20"></div>
                )}
              </div>

              {/* Modern Step Card with Dynamic Status-Based Colors */}
              <div
                tabIndex={0}
                role="button"
                className={`flex-1 transition-all duration-200 ${
                  visibleDots?.includes(index)
                    ? "translate-x-0 opacity-100"
                    : "translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 40 + 400}ms` }}
                onClick={() => toggleStep(step?.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    toggleStep(step?.id);
                  }
                }}
              >
                <div
                  className={`group cursor-pointer rounded-xl border transition-all duration-200 hover:shadow-lg ${step?.cardStyle}`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-1 items-center gap-3">
                        <div
                          className={`rounded-lg p-2.5 transition-colors ${step?.iconStyle}`}
                        >
                          {step?.icon}
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-sm font-medium leading-tight ${step?.textStyle}`}
                          >
                            {step?.title}
                          </h3>

                          {/* Status Badge */}
                          <div className="mt-2">
                            {step?.badge && (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${step.badge.className}`}
                              >
                                {step.badge.icon}
                                {step.badge.text === "Not found"
                                  ? "Pending"
                                  : step.badge.text}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-5 w-5 transition-transform duration-200 ${
                          expandedStep === step?.id ? "rotate-90" : ""
                        } ${step?.chevronStyle}`}
                      />
                    </div>

                    {/* Expanded Description with Task Steps and Link */}
                    {expandedStep === step?.id && (
                      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <div
                          className={`rounded-lg p-4 ${step?.expandedStyle}`}
                        >
                          <p
                            className={`mb-4 text-sm leading-relaxed ${step?.textStyle}`}
                          >
                            {step?.description}
                          </p>

                          {/* Task Steps Section */}
                          {step?.taskSteps && step.taskSteps.length > 0 && (
                            <div className="mb-4">
                              <div className="mb-3 flex items-center gap-2">
                                <ListChecks className="h-4 w-4 text-tertiary-600" />
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  Task Steps
                                </h4>
                              </div>
                              <div className="space-y-2">
                                {step.taskSteps.map(
                                  (taskStep: string, stepIndex: number) => (
                                    <div
                                      key={stepIndex}
                                      className="flex items-start gap-3 rounded-md border border-gray-200/50 bg-white/60 p-3 dark:border-gray-700/50 dark:bg-gray-900/40"
                                    >
                                      <div className="mt-0.5 flex-shrink-0">
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-tertiary-100 text-tertiary-600 dark:bg-tertiary-900/50 dark:text-tertiary-300">
                                          <span className="text-xs font-semibold">
                                            {stepIndex + 1}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                                        {taskStep}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Task Link Button */}
                          {step?.taskLink && (
                            <div className="mb-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (step.taskLink) {
                                    handleTaskLinkClick(step.taskLink);
                                  }
                                }}
                                className="inline-flex items-center gap-2 rounded-lg bg-tertiary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-tertiary-700 hover:shadow-md"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Go to {step.taskType}
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          {/* Field Value */}
                          {step?.fieldValue && (
                            <div className="mt-3 rounded-md bg-white/50 p-2 dark:bg-gray-900/20">
                              <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                                Field Value:
                              </p>
                              <p className="text-sm text-gray-800 dark:text-gray-200">
                                {step.fieldValue}
                              </p>
                            </div>
                          )}

                          {/* Current Status */}
                          {step?.status && (
                            <div className="mt-3 flex items-center gap-2 rounded-md bg-white/50 p-2 dark:bg-gray-900/20">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Current Status:
                              </p>
                              <p className="text-sm capitalize text-gray-800 dark:text-gray-200">
                                {step.status}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refresh indicator */}
      {isValidating && data && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-lg dark:border-neutral-700 dark:bg-darkSidebarBackground">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-tertiary-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Updating...
          </span>
        </div>
      )}

      {/* Workflow Running Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 flex max-w-sm flex-col items-center rounded-2xl bg-white p-8 shadow-2xl dark:bg-darkSidebarBackground">
            <div className="relative mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-600 to-indigo-700">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 animate-ping rounded-full border-4 border-tertiary-300"></div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
              Running Workflow
            </h3>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
              Please wait while we execute the workflow tasks...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicImplementation;
