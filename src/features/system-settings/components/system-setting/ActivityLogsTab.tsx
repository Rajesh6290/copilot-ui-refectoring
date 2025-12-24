"use client";
import Pagination from "@/shared/core/NewPagination";
import usePermission from "@/shared/hooks/usePermission";
import useSwr from "@/shared/hooks/useSwr";
import { formatDateTime } from "@/shared/utils";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Activity, AlertCircle, Clock, Search, User, X } from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";

interface Actor {
  user_id?: string;
  user_name?: string;
  email?: string;
  role?: string;
}

interface Resource {
  type?: string;
  id?: string;
  name?: string;
}

interface MetaData {
  ip?: string;
  geo_location?: string;
  user_agent?: string;
  origin?: string;
}

interface Change {
  modified_fields?: string[];
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

interface ActivityLog {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id?: string;
  client_id?: string;
  tenant_id?: string;
  action?: string;
  timestamp?: string;
  actor?: Actor;
  resource?: Resource;
  meta_data?: MetaData;
  change?: Change;
}

const ActivityLogsTab = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const { user, isUserLoading } = usePermission();
  const { data, isValidating, error } = useSwr(
    `activity_logs?page=${page}&limit=${limit}`
  );
  const filteredLogs = useMemo(() => {
    return (
      data?.logs?.filter(
        (item: ActivityLog) =>
          item?.action?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          item?.actor?.user_name
            ?.toLowerCase()
            ?.includes(searchQuery?.toLowerCase()) ||
          item?.resource?.name
            ?.toLowerCase()
            ?.includes(searchQuery?.toLowerCase()) ||
          item?.resource?.type
            ?.toLowerCase()
            ?.includes(searchQuery?.toLowerCase()) ||
          item?.meta_data?.origin
            ?.toLowerCase()
            ?.includes(searchQuery?.toLowerCase())
      ) || []
    );
  }, [data, searchQuery]);

  //   const handleViewDetails = (log: ActivityLog): void => {
  //     setSelectedLog(log);
  //   };

  const closeDetailView = (): void => {
    setSelectedLog(null);
  };

  const getActionColor = (action?: string): string => {
    switch (action?.toLowerCase()) {
      case "create":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100";
      case "update":
        return "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-100";
      case "delete":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const exportTableData = (logs: ActivityLog[]) => {
    const headers = [
      "Action",
      "Resource Name",
      "Resource Type",
      "User ID",
      "Timestamp",
      "IP",
      "Modified Fields",
      "Before",
      "After"
    ];
    const rows = logs.map((log) => [
      log?.action || "—",
      log?.resource?.name || "—",
      log?.resource?.type || "—",
      log?.actor?.user_id || "—",
      log?.timestamp
        ? moment(log.timestamp).format("YYYY-MM-DD HH:mm:ss")
        : "—",
      log?.meta_data?.ip || "—",
      log?.change?.modified_fields?.join("; ") || "—",
      log?.change?.before ? JSON.stringify(log.change.before) : "—",
      log?.change?.after ? JSON.stringify(log.change.after) : "—"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `activity_logs_${moment().format("YYYYMMDD_HHmmss")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //   const exportLogs = (): void => {
  //     exportTableData(filteredLogs);
  //   };

  const exportSelectedLogDetails = (): void => {
    if (selectedLog) {
      exportTableData([selectedLog]);
    }
  };

  return (
    <div className="bg-white p-6 text-neutral-900 dark:bg-darkSidebarBackground dark:text-gray-100">
      <div className="relative border-b border-gray-200 pb-5 dark:border-neutral-700">
        <h3 className="text-xl font-semibold">Activity Logs</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View and monitor system activity and changes
        </p>
      </div>

      <div className="mt-6">
        <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-3 md:space-y-0">
            <form className="relative">
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:border-tertiary-500 focus:ring-1 focus:ring-tertiary-500 dark:border-neutral-700 dark:bg-darkSidebarBackground md:w-64"
                placeholder="Search activity logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
                <Search size={16} />
              </div>
            </form>
          </div>

          {/* <button
            onClick={exportLogs}
            className="group inline-flex items-center rounded-lg bg-gradient-to-r from-tertiary-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-tertiary-700 hover:to-indigo-700 focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2 dark:from-tertiary-700 dark:to-indigo-700 dark:hover:from-tertiary-800 dark:hover:to-indigo-800"
          >
            <Download size={16} className="mr-2 group-hover:-translate-y-0.5" />
            Export Logs
          </button> */}
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-neutral-700 dark:bg-darkSidebarBackground">
          {error && (
            <div className="flex items-center p-6 text-red-500 dark:text-red-400">
              <AlertCircle size={16} className="mr-2" />
              <span>Failed to load activity logs</span>
            </div>
          )}
          {!isValidating && !error && filteredLogs?.length === 0 && (
            <div className="flex flex-col items-center justify-center p-10">
              <Activity
                size={48}
                className="mb-4 text-gray-300 dark:text-gray-600"
              />
              <p className="text-gray-500 dark:text-gray-400">
                No activity logs found
              </p>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                Try adjusting your search
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead className="bg-gray-50 dark:bg-darkSidebarBackground">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Features
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Summary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Timestamp
                  </th>
                  {/* <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Details
                  </th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-700 dark:bg-darkSidebarBackground">
                {isValidating ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-tertiary border-t-transparent"></div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs?.map(
                    (log: {
                      // eslint-disable-next-line @typescript-eslint/naming-convention
                      _id?: string;
                      action?: string;
                      resource?: Resource;
                      summary?: string;
                      actor?: Actor;
                      timestamp?: string;
                      meta_data?: {
                        ip?: string;
                        ipv4?: string;
                        geo_location?: string;
                        user_agent?: string;
                        origin?: string;
                      };
                    }) => (
                      <tr
                        key={log?._id}
                        className="hover:bg-gray-50 dark:hover:bg-darkMainBackground"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getActionColor(log?.action)}`}
                          >
                            {(log?.action ?? "—").charAt(0).toUpperCase() +
                              (log?.action ?? "—").slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-nowrap text-sm font-medium capitalize">
                            {log?.resource?.type || "—"}
                          </div>
                          {/* <div className="text-xs capitalize text-gray-500 dark:text-gray-400">
                          {log?.resource?.name || "—"}
                        </div> */}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium capitalize">
                            {log?.summary || "—"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-50 to-indigo-50 text-tertiary-600 dark:from-tertiary-900 dark:to-indigo-900 dark:text-tertiary-300">
                              <User size={14} />
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium capitalize">
                                {log?.actor?.user_name !== "Unknown"
                                  ? log?.actor?.user_name
                                  : log?.actor?.user_id || "—"}
                              </div>
                              {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                              {log?.actor?.user_id}
                            </div> */}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Clock
                              size={14}
                              className="mr-1.5 text-gray-400 dark:text-gray-500"
                            />
                            {!isUserLoading && user && log?.timestamp
                              ? moment(
                                  formatDateTime(log.timestamp, user?.date_time)
                                ).format("lll")
                              : "—"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            IP:{" "}
                            {log?.meta_data?.ipv4
                              ? log?.meta_data?.ipv4
                              : log?.meta_data?.ip}
                          </div>
                        </td>
                        {/* <td className="whitespace-nowrap px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(log)}
                          className="inline-flex items-center rounded-md bg-tertiary-50 px-3 py-1.5 text-xs font-medium text-tertiary-700 hover:bg-tertiary-100 dark:bg-tertiary-900 dark:text-tertiary-200 dark:hover:bg-tertiary-800"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </button>
                      </td> */}
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
          <div className="w-full p-2">
            {!isValidating && filteredLogs?.length > 0 && (
              <Pagination
                currentPage={page}
                limit={limit}
                setLimit={setLimit}
                setPageNumber={setPage}
                totalCount={data?.pagination?.total_records}
              />
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedLog}
        onClose={closeDetailView}
        fullScreen
        sx={{
          "& .MuiDialog-paper": { backgroundColor: "white", color: "#111827" }
        }}
        className="dark:[&_.MuiDialog-paper]:bg-darkSidebarBackground dark:[&_.MuiDialog-paper]:text-gray-100"
      >
        {selectedLog && (
          <>
            <DialogTitle className="flex items-center justify-between bg-gradient-to-r from-tertiary-600 to-indigo-600 p-4 text-white dark:from-tertiary-700 dark:to-indigo-700">
              <div className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Activity Log Details
              </div>
              <button
                onClick={closeDetailView}
                className="rounded-full p-1 text-white hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </DialogTitle>
            <DialogContent className="overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-6 pt-5 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-5 shadow-sm dark:border-neutral-700 dark:bg-darkSidebarBackground">
                  <h4 className="mb-3 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Clock
                      size={16}
                      className="mr-2 text-tertiary-500 dark:text-tertiary-400"
                    />
                    Time Information
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Timestamp
                  </p>
                  <p className="text-sm font-medium">
                    {selectedLog?.timestamp
                      ? moment(selectedLog.timestamp).format("LLLL")
                      : "—"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-5 shadow-sm dark:border-neutral-700 dark:bg-darkSidebarBackground">
                  <h4 className="mb-3 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <User
                      size={16}
                      className="mr-2 text-tertiary-500 dark:text-tertiary-400"
                    />
                    User Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        User ID
                      </p>
                      <p className="text-sm font-medium">
                        {selectedLog?.actor?.user_id || "—"}
                      </p>
                    </div>
                    {selectedLog?.actor?.user_name !== "Unknown" && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          User Name
                        </p>
                        <p className="text-sm font-medium">
                          {selectedLog?.actor?.user_name || "—"}
                        </p>
                      </div>
                    )}
                    {selectedLog?.actor?.role !== "Unknown" && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Role
                        </p>
                        <p className="text-sm font-medium">
                          {selectedLog?.actor?.role || "—"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-5 shadow-sm dark:border-neutral-700 dark:bg-darkSidebarBackground sm:col-span-2">
                  <h4 className="mb-3 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Activity
                      size={16}
                      className="mr-2 text-tertiary-500 dark:text-tertiary-400"
                    />
                    Resource Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Resource Type
                      </p>
                      <p className="text-sm font-medium">
                        {selectedLog?.resource?.type || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Resource Name
                      </p>
                      <p className="text-sm font-medium">
                        {selectedLog?.resource?.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Resource ID
                      </p>
                      <p className="text-sm font-medium">
                        {selectedLog?.resource?.id || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-100 bg-gray-50 p-5 shadow-sm dark:border-neutral-700 dark:bg-darkSidebarBackground sm:col-span-2">
                  <h4 className="mb-3 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <AlertCircle
                      size={16}
                      className="mr-2 text-tertiary-500 dark:text-tertiary-400"
                    />
                    Meta Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        IP Address
                      </p>
                      <p className="text-sm font-medium">
                        {selectedLog?.meta_data?.ip !== "0.0.0.0"
                          ? selectedLog?.meta_data?.ip
                          : "—"}
                      </p>
                    </div>
                    {selectedLog?.meta_data?.geo_location !== "Unknown" && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Location
                        </p>
                        <p className="text-sm font-medium">
                          {selectedLog?.meta_data?.geo_location || "—"}
                        </p>
                      </div>
                    )}
                    {selectedLog?.meta_data?.user_agent !== "Unknown" && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          User Agent
                        </p>
                        <p className="text-sm font-medium">
                          {selectedLog?.meta_data?.user_agent || "—"}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Origin
                      </p>
                      <p className="text-sm font-medium">
                        {selectedLog?.meta_data?.origin !== "Unknown"
                          ? selectedLog?.meta_data?.origin
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedLog?.change && (
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-5 shadow-sm dark:border-neutral-700 dark:bg-darkSidebarBackground sm:col-span-2">
                    <h4 className="mb-3 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <svg
                        className="mr-2 h-4 w-4 text-tertiary-500 dark:text-tertiary-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                      Changes
                    </h4>
                    {selectedLog?.change?.modified_fields &&
                      selectedLog.change.modified_fields.length > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                            Modified Fields
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedLog?.change?.modified_fields?.map(
                              (field, index) => (
                                <span
                                  key={index}
                                  className="rounded-full bg-tertiary-50 px-2.5 py-1 text-xs font-medium capitalize text-tertiary-700 dark:bg-tertiary-900 dark:text-tertiary-200"
                                >
                                  {field.replace(/_/g, " ") || "—"}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    {selectedLog?.change?.before &&
                      selectedLog?.change?.after && (
                        <div className="mt-4 overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                            <thead className="bg-gray-50 dark:bg-darkMainBackground">
                              <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                                  Field
                                </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                                  Before
                                </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                                  After
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-700 dark:bg-darkSidebarBackground">
                              {selectedLog?.change?.modified_fields?.map(
                                (field, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-gray-50 dark:hover:bg-darkMainBackground"
                                  >
                                    <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium capitalize">
                                      {field.replace(/_/g, " ") || "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                                      {selectedLog?.change?.before &&
                                      selectedLog.change.before[field] !==
                                        undefined
                                        ? String(
                                            selectedLog.change.before[field]
                                          )
                                        : "—"}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs font-medium text-tertiary-600 dark:text-tertiary-300">
                                      {selectedLog?.change?.after &&
                                      selectedLog.change.after[field] !==
                                        undefined
                                        ? String(
                                            selectedLog.change.after[field]
                                          )
                                        : "—"}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    {!selectedLog?.change?.before &&
                      selectedLog?.change?.after && (
                        <div className="mt-4 overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                                  Field
                                </th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-600 dark:text-gray-300">
                                  Value
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-darkSidebarBackground">
                              {Object.entries(
                                selectedLog?.change?.after || {}
                              ).map(([key, value], index) => (
                                <tr
                                  key={index}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium capitalize">
                                    {key?.replace(/_/g, " ") || "—"}
                                  </td>
                                  <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                                    {value !== undefined ? String(value) : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeDetailView}
                  className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2 dark:bg-darkSidebarBackground dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={exportSelectedLogDetails}
                  className="ml-3 inline-flex items-center rounded-md bg-gradient-to-r from-tertiary-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-tertiary-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2 dark:from-tertiary-700 dark:to-indigo-700 dark:hover:from-tertiary-800 dark:hover:to-indigo-800"
                >
                  Export Details
                </button>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default ActivityLogsTab;
