import useSwr from "@/shared/hooks/useSwr";
import { UserPermissionPayload } from "@/shared/types/user";
import { formatDateTime } from "@/shared/utils";
import {
  Assignment,
  Business,
  CalendarToday,
  CheckCircle,
  Close,
  Error,
  Flag,
  Info,
  Person,
  Schedule,
  Security,
  Warning
} from "@mui/icons-material";
import {
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton
} from "@mui/material";
import moment from "moment";
import React, { useCallback, useMemo } from "react";

interface IssueDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  issueId: string;
  user?: UserPermissionPayload;
  isUserLoading?: boolean;
}

const IssueDetailsDialog: React.FC<IssueDetailsDialogProps> = ({
  open,
  onClose,
  issueId,
  user,
  isUserLoading = false
}) => {
  // Memoized API query
  const query = useMemo(() => `issue?issue_id=${issueId}`, [issueId]);

  const { data: issueData, isValidating, error } = useSwr(open ? query : null);

  // Memoized issue data
  const issue = useMemo(() => issueData?.data, [issueData]);

  // Helper function to get assignee display name
  const getAssigneeDisplayName = useCallback(
    (assignedTo: { email?: string; username?: string; user_id?: string }) => {
      if (!assignedTo) {
        return "Unassigned";
      }

      // Handle both object and string formats for backward compatibility
      if (typeof assignedTo === "string") {
        return assignedTo;
      }

      if (typeof assignedTo === "object") {
        // Prefer email, then username, then user_id
        return (
          assignedTo.email ||
          assignedTo.username ||
          assignedTo.user_id ||
          "Unassigned"
        );
      }

      return "Unassigned";
    },
    []
  );

  // Helper function to get creator display name
  const getCreatorDisplayName = useCallback(
    (createdBy: { email?: string; username?: string; user_id?: string }) => {
      if (!createdBy) {
        return "System";
      }

      // Handle both object and string formats for backward compatibility
      if (typeof createdBy === "string") {
        return createdBy;
      }

      if (typeof createdBy === "object") {
        // Prefer email, then username, then user_id
        return (
          createdBy.email || createdBy.username || createdBy.user_id || "System"
        );
      }

      return "System";
    },
    []
  );

  // Enhanced priority styling
  const getPriorityConfig = useCallback((priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return {
          color: "error" as const,
          icon: <Error className="h-4 w-4" />,
          bgClass: "bg-red-100 dark:bg-red-900/20",
          textClass: "text-red-700 dark:text-red-300"
        };
      case "medium":
        return {
          color: "warning" as const,
          icon: <Warning className="h-4 w-4" />,
          bgClass: "bg-orange-100 dark:bg-orange-900/20",
          textClass: "text-orange-700 dark:text-orange-300"
        };
      case "low":
        return {
          color: "success" as const,
          icon: <CheckCircle className="h-4 w-4" />,
          bgClass: "bg-green-100 dark:bg-green-900/20",
          textClass: "text-green-700 dark:text-green-300"
        };
      default:
        return {
          color: "default" as const,
          icon: <Info className="h-4 w-4" />,
          bgClass: "bg-gray-100 dark:bg-gray-800",
          textClass: "text-gray-700 dark:text-gray-300"
        };
    }
  }, []);

  // Enhanced status styling
  const getStatusConfig = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return {
          color: "primary" as const,
          icon: <Schedule className="h-4 w-4" />,
          label: "Active"
        };
      case "in_progress":
        return {
          color: "warning" as const,
          icon: <Schedule className="h-4 w-4" />,
          label: "In Progress"
        };
      case "remediated":
        return {
          color: "success" as const,
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Remediated"
        };
      default:
        return {
          color: "default" as const,
          icon: <Info className="h-4 w-4" />,
          label: "Unknown"
        };
    }
  }, []);

  // Get compliance status configuration
  const getComplianceConfig = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case "compliant":
        return {
          color: "success",
          icon: <CheckCircle className="h-4 w-4" />,
          label: "Compliant"
        };
      case "not_compliant":
        return {
          color: "error",
          icon: <Error className="h-4 w-4" />,
          label: "Non-Compliant"
        };
      default:
        return {
          color: "default",
          icon: <Info className="h-4 w-4" />,
          label: "Unknown"
        };
    }
  }, []);

  // Memoized formatted dates
  const formattedDates = useMemo(() => {
    if (!issue) {
      return {
        dueDate: "Not Set",
        dueDateRelative: "",
        created: "N/A",
        updated: "N/A",
        createdRelative: "",
        updatedRelative: ""
      };
    }

    const dueDate =
      issue.due_date && !isUserLoading && user
        ? moment(formatDateTime(issue.due_date, user?.date_time))
        : null;

    const createdMoment = issue.created_at ? moment(issue.created_at) : null;
    const updatedMoment = issue.updated_at ? moment(issue.updated_at) : null;

    return {
      dueDate: dueDate ? dueDate.format("MMM DD, YYYY") : "Not Set",
      dueDateRelative: dueDate ? dueDate.fromNow() : "",
      created: createdMoment ? createdMoment.format("MMM DD, YYYY") : "N/A",
      updated: updatedMoment ? updatedMoment.format("MMM DD, YYYY") : "N/A",
      createdRelative: createdMoment ? createdMoment.fromNow() : "",
      updatedRelative: updatedMoment ? updatedMoment.fromNow() : ""
    };
  }, [issue, user, isUserLoading]);

  // Check if due date is overdue
  const isOverdue = useMemo(() => {
    if (!issue?.due_date) {
      return false;
    }
    const dueDate = moment(issue.due_date);
    return (
      dueDate.isBefore(moment()) && issue.status?.toLowerCase() !== "remediated"
    );
  }, [issue]);

  const priorityConfig = issue ? getPriorityConfig(issue.priority) : null;
  const statusConfig = issue ? getStatusConfig(issue.status) : null;
  const complianceConfig = issue?.related_entity?.additional_info
    ?.compliance_status
    ? getComplianceConfig(
        issue.related_entity.additional_info.compliance_status
      )
    : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen
      PaperProps={{
        className: "rounded-none"
      }}
    >
      {/* Compact Header */}
      <DialogTitle className="flex items-center justify-between bg-tertiary p-4 text-white">
        <div className="flex items-center space-x-3">
          <Assignment className="h-6 w-6" />
          <h1 className="text-xl font-bold">Issue Details</h1>
        </div>
        <IconButton onClick={onClose} className="!text-white">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent className="h-full overflow-hidden bg-gray-50 p-0 dark:bg-gray-900">
        {isValidating ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Loading...
              </p>
            </div>
          </div>
        ) : error || !issue ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Error className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h3 className="mb-2 text-xl font-semibold text-red-600">
                Failed to Load
              </h3>
              <p className="text-gray-600">
                {error?.message || "Issue not found"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid h-full grid-cols-12 gap-6 p-6">
            {/* Main Content - Left Side */}
            <div className="col-span-8 space-y-6">
              {/* Issue Header Card */}
              <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                      {issue.title || "Untitled Issue"}
                    </h2>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                      {issue.description || "No description provided"}
                    </p>
                  </div>
                  {isOverdue && (
                    <Chip
                      icon={<Warning />}
                      label="OVERDUE"
                      color="error"
                      size="small"
                      className="font-semibold"
                    />
                  )}
                </div>

                {/* Status Row */}
                <div className="flex flex-wrap gap-3">
                  {statusConfig && (
                    <Chip
                      icon={statusConfig.icon}
                      label={statusConfig.label}
                      color={statusConfig.color}
                      variant="filled"
                      size="small"
                    />
                  )}
                  {priorityConfig && (
                    <Chip
                      icon={priorityConfig.icon}
                      label={`${issue.priority?.toUpperCase()} Priority`}
                      color={priorityConfig.color}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  <Chip
                    icon={<Security />}
                    label={issue.type?.toUpperCase() || "GENERAL"}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </div>
              </div>

              {/* Assignment & Timeline Combined */}
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="mb-4 flex items-center">
                    <Person className="mr-2 h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Assignment
                    </h3>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <p className="mb-1 text-sm text-blue-700 dark:text-blue-300">
                      Assigned To
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {getAssigneeDisplayName(issue.assigned_to)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="mb-4 flex items-center">
                    <CalendarToday className="mr-2 h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Timeline
                    </h3>
                  </div>
                  <div
                    className={`rounded-lg p-4 ${isOverdue ? "bg-red-50 dark:bg-red-900/20" : "bg-green-50 dark:bg-green-900/20"}`}
                  >
                    <p
                      className={`mb-1 text-sm ${isOverdue ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}
                    >
                      Due Date
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formattedDates.dueDate}
                    </p>
                    {formattedDates.dueDateRelative && (
                      <p
                        className={`text-sm ${isOverdue ? "text-red-600" : "text-green-600"}`}
                      >
                        {formattedDates.dueDateRelative}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Related Entity */}
              {issue.related_entity && (
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="mb-4 flex items-center">
                    <Business className="mr-2 h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Related Control
                    </h3>
                  </div>

                  <div className="mb-4 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                    <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      {issue.related_entity.name || "Unnamed Control"}
                    </h4>
                    <div className="mb-3 flex gap-2">
                      {issue.related_entity.additional_info?.control_type && (
                        <Chip
                          label={
                            issue.related_entity.additional_info.control_type
                          }
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </div>
                  </div>

                  {/* Compliance Status */}
                  {issue.related_entity.additional_info && (
                    <div className="grid grid-cols-2 gap-4">
                      {complianceConfig && (
                        <div
                          className={`rounded-lg p-4 ${complianceConfig.color === "success" ? "bg-green-50 dark:bg-green-900/10" : "bg-red-50 dark:bg-red-900/10"}`}
                        >
                          <div className="flex items-center">
                            {complianceConfig.icon}
                            <div className="ml-2">
                              <p className="text-xs text-gray-600">
                                Compliance
                              </p>
                              <p className="font-semibold">
                                {complianceConfig.label}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {issue.related_entity.additional_info
                        .implementation_status && (
                        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <div className="ml-2">
                              <p className="text-xs text-gray-600">
                                Implementation
                              </p>
                              <p className="font-semibold capitalize">
                                {issue.related_entity.additional_info.implementation_status.replace(
                                  "_",
                                  " "
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {issue.tags && issue.tags.length > 0 && (
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="mb-4 flex items-center">
                    <Flag className="mr-2 h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Tags
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map((tag: string, index: number) => (
                      <Chip
                        key={index}
                        label={`#${tag}`}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="col-span-4">
              <div className="h-fit rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="mb-6 flex items-center">
                  <Info className="mr-2 h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    System Info
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase text-gray-500">
                        Created
                      </span>
                      <CalendarToday className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formattedDates.created}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formattedDates.createdRelative}
                    </p>
                  </div>

                  <Divider />

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase text-gray-500">
                        Updated
                      </span>
                      <Schedule className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formattedDates.updated}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formattedDates.updatedRelative}
                    </p>
                  </div>

                  <Divider />

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase text-gray-500">
                        Created By
                      </span>
                      <Person className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {getCreatorDisplayName(issue.created_by)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(IssueDetailsDialog);
