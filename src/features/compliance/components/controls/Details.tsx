"use client";
import { AlertTriangle, Calendar, Shield } from "lucide-react";
import { FC } from "react";
import { CiSettings } from "react-icons/ci";
import {
  FaIdCard,
  FaInfoCircle,
  FaListAlt,
  FaShieldAlt,
  FaTags
} from "react-icons/fa";
import { IoPulseSharp } from "react-icons/io5";
import { LiaHeartbeatSolid } from "react-icons/lia";
import { MdCategory, MdDescription } from "react-icons/md";

interface Requirement {
  requirements: {
    doc_id: string;
    id: string;
    requirement_name: string;
    description: string;
    category: string;
    framework: string;
    readiness_status: string;
    scope: string;
  }[];
}

interface ControlData {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  id: string;
  name: string;
  common_name: string;
  description: string;
  category: string;
  sub_type: string;
  control_type: string;
  severity_level: string;
  enforcement_type: string;
  applicability: string;
  control_lifecycle_stage: string[];
  effectiveness_metrics: string[];
  evidence_required: string[];
  health_status: string;
  implementation_status: string;
  readiness_status: string;
  scope: string;
  tags: string[];
  risk_ids: string[];
  indicator_ids: string[];
  requirement_ids: string[];
  version: string;
  sensitivity: string;
  action_id: string[];
  policy_ids: string[];
  incident_ids: string[];
  test_id: string[];
  last_test_run_id: string[];
  application_ids: string[];
  evidence_ids: string[];
  created_at: string;
  updated_at: string;
  compliance_status: string;
  obligation_common_ids: string[];
  doc_id: string;
  original_control_id: string;
  evidence_files: string[];
  control_effectiveness: number;
  tenant_id: string;
  client_id: string;
  requirement: Requirement;
}

interface DetailsProps {
  data: ControlData;
}

type StatusType =
  | "healthy"
  | "at_risk"
  | "completed"
  | "effective"
  | "ready"
  | "ineffective"
  | "not_ready"
  | "in_progress"
  | "not_started"
  | "not_tested"
  | "not_compliant"
  | "complete";

const Details: FC<DetailsProps> = ({ data }) => {
  const getStatusColorClasses = (status: StatusType | string): string => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "healthy":
      case "complete":
      case "effective":
      case "ready":
        return "text-green-500";
      case "at_risk":
      case "ineffective":
      case "not_ready":
      case "not_compliant":
        return "text-red-500";
      case "in_progress":
        return "text-yellow-500";
      case "not_started":
      case "not_tested":
      default:
        return "text-blue-500";
    }
  };

  const getBadgeColorClasses = (status: StatusType | string): string => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "healthy":
      case "complete":
      case "effective":
      case "ready":
        return "bg-green-50 text-green-700 border-green-200";
      case "at_risk":
      case "ineffective":
      case "not_ready":
      case "not_compliant":
        return "bg-red-50 text-red-700 border-red-200";
      case "in_progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "not_started":
      case "not_tested":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid date";
    }
  };

  const formatStatus = (status: string): string => {
    return status?.replace(/[_-]/g, " ") || "N/A";
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity?.toLowerCase()) {
      case "high":
      case "critical":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:rounded-xl">
      <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:gap-0 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
          Control Details
        </h2>
        <div
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium sm:px-3 sm:py-1.5 sm:text-sm ${getBadgeColorClasses(
            data?.health_status
          )}`}
        >
          <LiaHeartbeatSolid className="text-sm sm:text-base" />
          <span className="capitalize tracking-wider">
            {formatStatus(data?.health_status)}
          </span>
        </div>
      </div>

      <div className="flex h-fit flex-col md:flex-row">
        <div className="flex size-full flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-800 sm:gap-6 sm:p-6 md:w-1/2 md:border-b-0 2xl:w-[60%]">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="mt-1 shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 sm:p-2">
              <FaIdCard size={18} className="sm:h-5 sm:w-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 sm:text-sm">
                Control ID
              </p>
              <p className="break-words text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                {data?.id || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="mt-1 shrink-0 rounded-lg bg-purple-50 p-1.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 sm:p-2">
              <FaInfoCircle size={18} className="sm:h-5 sm:w-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 sm:text-sm">
                Control Name
              </p>
              <p className="break-words text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                {data?.name || data?.common_name || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="mt-1 shrink-0 rounded-lg bg-green-50 p-1.5 text-green-700 dark:bg-green-900/30 dark:text-green-300 sm:p-2">
              <MdDescription size={18} className="sm:h-5 sm:w-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 sm:text-sm">
                Description
              </p>
              <p className="break-words text-sm text-gray-700 dark:text-gray-300 sm:text-base">
                {data?.description || "No description available"}
              </p>
            </div>
          </div>

          {/* Category Field - Always Shown */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="mt-1 shrink-0 rounded-lg bg-amber-50 p-1.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 sm:p-2">
              <MdCategory size={18} className="sm:h-5 sm:w-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 sm:text-sm">
                Category
              </p>
              <p className="break-words text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                {data?.category || "Not Provided"}
              </p>
            </div>
          </div>

          {data?.sub_type && (
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-1 shrink-0 rounded-lg bg-indigo-50 p-1.5 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 sm:p-2">
                <FaShieldAlt size={18} className="sm:h-5 sm:w-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 sm:text-sm">
                  Sub Type
                </p>
                <p className="break-words text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                  {data?.sub_type}
                </p>
              </div>
            </div>
          )}

          {data?.tags?.length > 0 && (
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-1 shrink-0 rounded-lg bg-rose-50 p-1.5 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 sm:p-2">
                <FaTags size={18} className="sm:h-5 sm:w-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 sm:text-sm">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {data?.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="break-words rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 sm:py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex size-full flex-col p-4 sm:p-6 md:w-1/2 md:border-l 2xl:w-[40%]">
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h3 className="flex items-center gap-2 text-base font-medium text-gray-900 dark:text-white sm:text-lg">
              <LiaHeartbeatSolid className="text-lg text-blue-500 sm:text-xl" />
              Health Metrics
            </h3>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/30 sm:rounded-xl sm:p-5">
            <div className="mb-4 sm:mb-6">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <IoPulseSharp
                    className={`text-base sm:text-lg ${getStatusColorClasses(
                      data?.implementation_status
                    )}`}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200 sm:text-sm">
                    Implementation
                  </span>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${getBadgeColorClasses(data?.implementation_status)}`}
                >
                  {formatStatus(data?.implementation_status)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 sm:h-2">
                <div
                  className={`h-full rounded-full ${
                    data?.implementation_status === "complete"
                      ? "w-full bg-green-500"
                      : data?.implementation_status === "in_progress"
                        ? "w-1/2 bg-yellow-500"
                        : "w-0"
                  }`}
                ></div>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <IoPulseSharp
                    className={`text-base sm:text-lg ${getStatusColorClasses(data?.readiness_status)}`}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200 sm:text-sm">
                    Readiness Status
                  </span>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${getBadgeColorClasses(data?.readiness_status)}`}
                >
                  {formatStatus(data?.readiness_status)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 sm:h-2">
                <div
                  className={`h-full rounded-full ${
                    data?.readiness_status === "ready"
                      ? "w-full bg-green-500"
                      : data?.readiness_status === "not_ready"
                        ? "w-full bg-red-500"
                        : "w-0"
                  }`}
                ></div>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4">
              {data?.severity_level && (
                <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4">
                  <p className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Severity Level
                  </p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={14}
                      className={`sm:h-4 sm:w-4 ${getSeverityColor(data?.severity_level)}`}
                    />
                    <span className="text-xs font-medium capitalize text-gray-800 dark:text-gray-200 sm:text-sm">
                      {data?.severity_level}
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4">
                <p className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Compliance Status
                </p>
                <div className="flex items-center gap-2">
                  <Shield
                    size={14}
                    className={`sm:h-4 sm:w-4 ${getStatusColorClasses(data?.compliance_status)}`}
                  />
                  <span className="break-words text-xs font-medium capitalize text-gray-800 dark:text-gray-200 sm:text-sm">
                    {formatStatus(data?.compliance_status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700 sm:mt-5 sm:pt-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
                <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4">
                  <p className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 sm:mb-3">
                    Last Updated
                  </p>
                  <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Calendar
                      size={14}
                      className="shrink-0 text-green-500 sm:h-4 sm:w-4"
                    />
                    <span className="break-words text-xs font-medium sm:text-sm">
                      {formatDate(data?.updated_at)}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4">
                  <p className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400 sm:mb-3">
                    Enforcement
                  </p>
                  <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <CiSettings className="shrink-0 text-base text-blue-500 sm:text-lg" />
                    <span className="break-words text-xs font-medium capitalize sm:text-sm">
                      {data?.enforcement_type || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {data?.evidence_required?.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <div className="mb-3 flex items-start gap-2 sm:mb-4">
                <FaListAlt className="mt-1.5 text-sm text-indigo-500 sm:text-lg" />
                <div className="flex w-full flex-col gap-2">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white sm:text-lg">
                    Evidence Required
                  </h3>
                  <span className="text-sm font-semibold text-gray-800">
                    {" "}
                    This control will be ready once the required evidence is
                    attached and approved.
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/30 sm:p-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {data?.evidence_required.map((item, index) => (
                    <span
                      key={index}
                      className="break-words rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300 sm:px-3 sm:py-1 sm:text-sm"
                    >
                      {formatStatus(item)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;
