"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomNotes from "@/shared/core/CustomNotes";
import CustomTabBar from "@/shared/core/CustomTabBar";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useCurrentMenuItem } from "@/shared/utils";
import { Tooltip } from "@mui/material";
import moment from "moment";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  PiCalendarBlank,
  PiChartLine,
  PiCheckCircle,
  PiClockCountdown,
  PiCube,
  PiFileText,
  PiGraph,
  PiNote,
  PiShieldCheck,
  PiUser,
  PiWarning
} from "react-icons/pi";
import { toast } from "sonner";
const TestUpdate = dynamic(() => import("./TestUpdate"), {
  ssr: false
});
const TestSubmissionHistory = dynamic(() => import("./TestSubmissionHistory"), {
  ssr: false
});
const TestRunResult = dynamic(() => import("./TestRunResult"), {
  ssr: false
});
const TestHistory = dynamic(() => import("./TestHistory"), {
  ssr: false
});
const TestControl = dynamic(() => import("./TestControls"), {
  ssr: false
});
const DeveloperPortal = dynamic(() => import("./DeveloperPortal"), {
  ssr: false
});
const AddTestControl = dynamic(() => import("./AddTestControl"), {
  ssr: false
});
export interface CommonComplianceTestDetail {
  common_test_id: string;
  test_id: string;

  name: string;
  description: string;
  notes: string;

  frequency: number; // seconds (e.g. 86400 = daily)
  status: string;
  type: string;

  control_ids: string[];
  framework: string[];

  badge_url: string;
  owner_name: string;

  preferred_run_time: string; // ISO datetime
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime

  tenant_id: string;
  client_id: string;
  owner_id: string;

  in_processing: boolean;
  last_run_at: string | null;

  application_id: string | null;
  application_info: unknown | null;
}

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <div className="flex w-full animate-pulse flex-col gap-5 p-2">
      {/* Header Skeleton */}
      <div className="flex h-fit w-full flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-neutral-900">
        <div className="lg:flex-data flex flex-col gap-4 lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex flex-col gap-2">
              <div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-96 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-gray-700"
            ></div>
          ))}
        </div>
      </div>

      <div className="h-96 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
};

const TestDetails = () => {
  const { id } = useParams();
  const [tab, setTab] = useState<string>("");
  const { isLoading, mutation } = useMutation();
  const { isLoading: isRunning, mutation: runMutation } = useMutation();
  const [addControlOpen, setAddControlOpen] = useState<boolean>(false);
  const { data, isValidating, mutate } = useSwr(
    id ? `test?test_id=${id}` : null
  );
  const currentMenutAccess = useCurrentMenuItem();
  const currentAccess = currentMenutAccess?.tabs?.find(
    (tabs: { tab_name: string }) => tabs?.tab_name === "test-register"
  );
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "Not available";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const FREQUENCY_TO_SECONDS = {
    10: "10sec",
    86400: "daily",
    604800: "weekly",
    2592000: "monthly",
    7776000: "quarterly",
    31536000: "yearly"
  };
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          text: "text-emerald-700 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-800",
          icon: <PiCheckCircle className="text-lg" />,
          label: "Active"
        };
      case "draft":
        return {
          bg: "bg-slate-50 dark:bg-slate-800/50",
          text: "text-slate-700 dark:text-slate-400",
          border: "border-slate-200 dark:border-slate-700",
          icon: <PiChartLine className="text-lg" />,
          label: "In Draft"
        };
      case "pending":
        return {
          bg: "bg-amber-50 dark:bg-amber-900/20",
          text: "text-amber-700 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-800",
          icon: <PiWarning className="text-lg" />,
          label: "Pending Review"
        };
      case "inactive":
        return {
          bg: "bg-rose-50 dark:bg-rose-900/20",
          text: "text-rose-700 dark:text-rose-400",
          border: "border-rose-200 dark:border-rose-800",
          icon: <PiWarning className="text-lg" />,
          label: "Inactive"
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-800/50",
          text: "text-slate-700 dark:text-slate-400",
          border: "border-slate-200 dark:border-slate-700",
          icon: <PiChartLine className="text-lg" />,
          label: "Unknown"
        };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case "custom":
        return "Custom Test";
      case "automated":
        return "Automated Test";
      case "manual":
        return "Manual Test";
      case "integration":
        return "Integration Test";
      default:
        return type?.charAt(0).toUpperCase() + type?.slice(1);
    }
  };

  const renderTabContent = () => {
    switch (tab) {
      case "Latest Test Run Result":
        return (
          <TestRunResult
            status={data?.status}
            lastRunDate={data?.last_run_at}
            testId={id as string}
            type={data?.type}
          />
        );
      case "Test History":
        return <TestHistory testId={id as string} />;
      case "Tasks":
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-neutral-900">
            <div className="mb-4 flex items-center gap-3">
              <PiCheckCircle className="text-2xl text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Tasks
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Related tasks will appear here
            </p>
          </div>
        );
      case "Controls":
        return <TestControl testId={id as string} />;
      case "Notes":
        return <CustomNotes type="test" id={id as string} />;
      case "Submission Details":
        return <TestSubmissionHistory testId={id as string} />;
      case "Metrics To Send":
        return <DeveloperPortal id={id as string} />;
      default:
        return null;
    }
  };

  // if (isValidating || !data) {
  //   return <SkeletonLoader />;
  // }

  const statusConfig = getStatusConfig(data?.status);
  const handleToggleStatus = async (item: CommonComplianceTestDetail) => {
    // Check if test has at least one control before activating
    if (
      ["draft", "inactive"].includes(item?.status) &&
      (!item?.control_ids || item?.control_ids?.length === 0)
    ) {
      toast.error(
        "Cannot activate test. Please add at least one control first."
      );
      return;
    }

    try {
      const url = ["draft", "inactive"].includes(item?.status)
        ? "test/activate"
        : "test/deactivate";
      const res = await mutation(`${url}?test_id=${item?.test_id}`, {
        method: "POST",
        isAlert: false,
        body: {
          frequency: item?.frequency
        }
      });
      if (res?.status === 201 || res?.status === 200) {
        mutate();
        toast.success(
          `Test ${item?.status === "active" ? "deactivated" : "activated"} successfully!`
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  const runTestNow = async () => {
    try {
      const res = await runMutation(`test/run?test_id=${data?.test_id}`, {
        method: "POST",
        isAlert: false
      });
      if (res?.status === 201 || res?.status === 202) {
        mutate();
        toast.success(
          res?.results?.message || "Test run initiated successfully!"
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  return (
    <>
      {isValidating || !data ? <SkeletonLoader /> : null}

      <div className={isValidating || !data ? "hidden" : ""}>
        <TestUpdate
          mutate={mutate}
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
          }}
          updateData={data}
        />
        <AddTestControl
          open={addControlOpen}
          onClose={() => {
            setAddControlOpen(false);
          }}
          testId={data?.test_id || ""}
          applicationId={data?.application_id || ""}
          existingControlIds={data?.control_ids || []}
          mutate={mutate}
        />

        <div className="mb-20 flex w-full flex-col gap-5 p-2">
          {/* Header Section */}
          <div className="z-50 flex h-fit w-full flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-darkSidebarBackground lg:p-8">
            {/* Title, Description and Status */}
            <div className="lg:flex-data flex flex-col gap-5 lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <PiGraph className="text-3xl text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col gap-4">
                  <h1 className="text-2xl font-bold capitalize leading-tight text-gray-900 dark:text-gray-50">
                    {data?.name || "Test Details"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 xl:flex-shrink-0">
                    <div
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${
                        data?.last_run_at === null && data?.status === "draft"
                          ? "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
                          : data?.status === "active" &&
                              data?.last_run_at === null
                            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                      } font-medium`}
                    >
                      <PiClockCountdown className="text-lg" />
                      <span className="text-sm">
                        Test Run Status :{" "}
                        {data?.last_run_at === null && data?.status === "draft"
                          ? "Incomplete"
                          : data?.status === "active" &&
                              data?.last_run_at === null
                            ? "In Progress"
                            : "Completed"}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${statusConfig.border} ${statusConfig.bg} ${statusConfig.text} font-medium`}
                    >
                      {statusConfig.icon}
                      <span className="text-sm">
                        Status : {statusConfig.label}
                      </span>
                    </div>
                    {data?.type && (
                      <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                        <span className="text-sm">
                          Type : {getTypeLabel(data.type)}
                        </span>
                      </div>
                    )}
                    {/* Add Control Button */}
                    {currentAccess?.buttons?.[4]?.permission?.is_shown && (
                      <Tooltip
                        title={
                          data?.type === "predefined"
                            ? "No controls can be added for a predefined test."
                            : !currentAccess?.buttons?.[4]?.permission?.actions
                                  ?.create
                              ? "You do not have permission to add controls."
                              : "Add controls to activate the test"
                        }
                        arrow
                        placement="top"
                      >
                        <span>
                          <CustomButton
                            onClick={() => {
                              setAddControlOpen(true);
                            }}
                            disabled={
                              data?.type === "predefined" ||
                              !currentAccess?.buttons?.[4]?.permission?.actions
                                ?.create
                            }
                            className="!text-nowrap !text-[0.7rem]"
                          >
                            Add Control
                          </CustomButton>
                        </span>
                      </Tooltip>
                    )}

                    {/* Activate/Deactivate Button */}
                    {currentAccess?.buttons?.[5]?.permission?.is_shown && (
                      <Tooltip
                        title={
                          ["draft", "inactive"].includes(data?.status) &&
                          (!data?.control_ids ||
                            data?.control_ids?.length === 0)
                            ? "Add at least one control to activate"
                            : currentAccess?.buttons?.[5]?.permission?.actions
                                  ?.update
                              ? "You dont have permission to update."
                              : ""
                        }
                        arrow
                        placement="top"
                      >
                        <div className="w-fit">
                          <CustomButton
                            onClick={() => {
                              handleToggleStatus(data);
                            }}
                            className="!text-nowrap !text-[0.7rem]"
                            loading={isLoading}
                            disabled={
                              (["draft", "inactive"].includes(data?.status) &&
                                (!data?.control_ids ||
                                  data?.control_ids?.length === 0)) ||
                              !currentAccess?.buttons?.[5]?.permission?.actions
                                ?.update
                            }
                          >
                            {`${["inactive", "draft"].includes(data?.status) ? "Activate" : "Deactivate"} Test`}
                          </CustomButton>
                        </div>
                      </Tooltip>
                    )}

                    {/* Edit Button */}
                    {currentAccess?.buttons?.[2]?.permission?.is_shown && (
                      <Tooltip
                        title={
                          data?.type === "predefined"
                            ? "Predefined Test cannot be updated."
                            : !currentAccess?.buttons?.[2]?.permission?.actions
                                  ?.update
                              ? "You don't have permission to update."
                              : "Update Test"
                        }
                        arrow
                        placement="top"
                      >
                        <span className="w-fit">
                          <span>
                            <CustomButton
                              onClick={() => {
                                setEditOpen(true);
                              }}
                              className="!text-nowrap !text-[0.7rem]"
                              disabled={
                                data?.type === "predefined" ||
                                !currentAccess?.buttons?.[2]?.permission
                                  ?.actions?.update
                              }
                            >
                              Update
                            </CustomButton>
                          </span>
                        </span>
                      </Tooltip>
                    )}

                    <Tooltip
                      title="Run the test immediately"
                      arrow
                      placement="top"
                    >
                      <span>
                        <CustomButton
                          onClick={runTestNow}
                          loading={isRunning}
                          disabled={data?.in_processing}
                          loadingText="Running..."
                          className="!text-nowrap !text-[0.7rem]"
                        >
                          Run Test
                        </CustomButton>
                      </span>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div
              className={`grid grid-cols-1 gap-4 border-t border-gray-200 pt-5 dark:border-gray-700 md:grid-cols-2 ${
                data?.type === "predefined"
                  ? "lg:grid-cols-3"
                  : "lg:grid-cols-4"
              } `}
            >
              <div className="group flex items-start gap-3 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-700">
                  <PiUser className="text-xl text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Owner
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {data?.owner_name || "Not assigned"}
                  </span>
                </div>
              </div>

              <div className="group flex items-start gap-3 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-700">
                  <PiClockCountdown className="text-xl text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Frequency
                  </span>
                  <span className="text-sm font-semibold capitalize text-gray-900 dark:text-gray-100">
                    {data?.frequency
                      ? FREQUENCY_TO_SECONDS[
                          data?.frequency as keyof typeof FREQUENCY_TO_SECONDS
                        ]
                      : "Not Provided"}
                  </span>
                </div>
              </div>

              <div className="group flex items-start gap-3 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-700">
                  <PiShieldCheck className="text-xl text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Controls
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {data?.control_ids?.length || 0} Linked
                  </span>
                </div>
              </div>
              {data?.type !== "predefined" && (
                <div className="group flex items-start gap-3 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-700">
                    <PiCube className="text-xl text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Application
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {data?.application_info?.name || "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info Section */}
            <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-5 dark:border-gray-700 lg:grid-cols-3">
              {/* Description */}
              {data?.description && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="mb-2 flex items-center gap-2">
                    <PiFileText className="text-base text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Description
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {data.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {data?.notes && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="mb-2 flex items-center gap-2">
                    <PiNote className="text-base text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Notes
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {data.notes}
                  </p>
                </div>
              )}

              {/* Application Info */}
              {data?.application_info && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="mb-2 flex items-center gap-2">
                    <PiCube className="text-base text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Application Info
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Version:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {data.application_info.version || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Use Case:
                      </span>
                      <span className="font-medium capitalize text-gray-900 dark:text-gray-100">
                        {data.application_info.use_case_type?.replace(
                          /_/g,
                          " "
                        ) || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="flex flex-wrap gap-4 border-t border-gray-200 pt-5 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <PiCalendarBlank className="text-base text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Created:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(data?.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PiCalendarBlank className="text-base text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Updated:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(data?.updated_at)}
                </span>
              </div>
              {data?.last_run_at && (
                <div className="flex items-center gap-2">
                  <PiCalendarBlank className="text-base text-gray-500 dark:text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Expected Next Test Run Time:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(
                      new Date(
                        new Date(data?.last_run_at).getTime() +
                          (data?.frequency || 0) * 1000
                      ).toISOString()
                    )}
                  </span>
                </div>
              )}
              {data?.preferred_run_time && (
                <div className="flex items-center gap-2">
                  <PiCalendarBlank className="text-base text-gray-500 dark:text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Preferred Time:
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {moment(data?.preferred_run_time).format("h:mm A")}
                  </span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="pt-2">
              <CustomTabBar
                tabs={[
                  "Latest Test Run Result",
                  "Test History",
                  "Controls",
                  "Tasks",
                  "Notes",
                  ...(data?.type !== "predefined"
                    ? ["Submission Details", "Metrics To Send"]
                    : [])
                ]}
                defaultTab={"Latest Test Run Result"}
                activeTab={tab}
                setActiveTab={setTab}
                instanceId="Test-Tab"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="w-full">{renderTabContent()}</div>
        </div>
      </div>
    </>
  );
};

export default TestDetails;
