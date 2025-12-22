"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import usePermission from "@/shared/hooks/usePermission";
import useSwr from "@/shared/hooks/useSwr";
import { UserPermissionPayload } from "@/shared/types/user";
import { formatDateTime } from "@/shared/utils";
import { IconButton, Tooltip } from "@mui/material";
import { ChevronLeft, ChevronRight, Edit, Trash2, X } from "lucide-react";
import moment from "moment";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
const AddEditIssue = dynamic(() => import("./AddEditIssue"), {
  ssr: false
});
const IssueDetailsPanel = dynamic(() => import("./IssueDetailsPanel"), {
  ssr: false
});
// Type Definitions
interface AssignedTo {
  email: string;
  user_id: string;
  username: string;
  role: string;
}

interface RelatedEntity {
  type: string;
  id: string;
  name: string;
  framework_id: string | null;
  control_id: string;
  requirement_id: string | null;
  additional_info: {
    control_type: string;
    compliance_status: string;
    implementation_status: string;
  };
}

interface CreatedBy {
  email: string;
  user_id: string;
  username: string;
  role: string;
}

export interface Issue extends Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  type: string;
  status: "active" | "in_progress" | "remediated";
  assigned_to: AssignedTo;
  due_date: string;
  related_entity: RelatedEntity;
  tags: string[];
  tenant_id: string;
  client_id: string;
  created_by: CreatedBy;
  created_at: string;
  updated_at: string;
}

interface ISAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
    };
  }[];
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
}
const CustomToolbar = ({
  setOpen,
  setSearch,
  setStatusFilter,
  setPriorityFilter,
  search,
  statusFilter,
  priorityFilter,
  isAccess
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  setSearch: Dispatch<SetStateAction<string>>;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  setPriorityFilter: Dispatch<SetStateAction<string>>;
  search: string;
  statusFilter: string;
  priorityFilter: string;
  isAccess: ISAccess;
}) => {
  const [debouncedSearch] = useState<string>(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(debouncedSearch);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedSearch, setSearch]);

  return (
    <div className="flex w-full flex-col gap-4 px-5 py-3">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Issues
          </p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Manage and track issues across your organization
          </p>
        </div>
        {isAccess?.buttons?.[0]?.permission?.is_shown && (
          <div className="w-fit">
            <CustomButton
              className="w-fit text-nowrap"
              onClick={() => setOpen(true)}
              disabled={!isAccess?.buttons?.[0]?.permission?.actions?.create}
            >
              Add New Issue
            </CustomButton>
          </div>
        )}
      </div>
      {/* Search Bar and Filters */}
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* <input
          type="search"
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          placeholder="Search by Keywords"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tertiary-600 dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-white dark:placeholder-gray-400 sm:w-1/3"
        /> */}
        <div className="flex w-full gap-2 sm:w-1/2">
          <div className="relative w-full">
            {statusFilter?.length > 0 && (
              <div
                tabIndex={0}
                role="button"
                onClick={() => setStatusFilter("")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setStatusFilter("");
                  }
                }}
                className="absolute right-5 top-2.5 z-9999 cursor-pointer text-gray-500"
              >
                <X size={18} />
              </div>
            )}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-tertiary-600 dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-white"
            >
              <option value="">Filter By Status</option>
              <option value="active">Active</option>
              <option value="in_progress">In Progress</option>
              <option value="remediated">Remediated</option>
            </select>
          </div>
          <div className="relative w-full">
            {priorityFilter?.length > 0 && (
              <div
                tabIndex={0}
                role="button"
                onClick={() => setPriorityFilter("")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPriorityFilter("");
                  }
                }}
                className="absolute right-5 top-2.5 z-9999 cursor-pointer text-gray-500"
              >
                <X size={18} />
              </div>
            )}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-tertiary-600 dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-white"
            >
              <option value="">Filter By Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
const Issues = ({
  controlId,
  isAccess
}: {
  controlId: string;
  isAccess: ISAccess;
}) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Issue | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [deletingIssueId, setDeletingIssueId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const { user, isUserLoading } = usePermission();

  // Memoized query string
  const query = useMemo(
    () =>
      `issues?entity_id=${controlId}&entity_type=control&page=${page + 1}&limit=${pageSize}${
        search ? `&keywords=${encodeURIComponent(search)}` : ""
      }${statusFilter ? `&status=${encodeURIComponent(statusFilter)}` : ""}${
        priorityFilter ? `&priority=${encodeURIComponent(priorityFilter)}` : ""
      }`,
    [controlId, page, pageSize, search, statusFilter, priorityFilter]
  );

  const { data, isValidating, mutate } = useSwr(query);
  const { mutation } = useMutation();

  // Memoized delete handler
  const handleDelete = useCallback(
    async (issueId: string) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        setDeletingIssueId(issueId);
        try {
          const res = await mutation(`issues?issue_id=${issueId}`, {
            method: "DELETE",
            isAlert: false
          });

          if (res?.status === 200) {
            toast.success("Issue deleted successfully");
            mutate();
          }
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "An error occurred"
          );
        } finally {
          setDeletingIssueId(null);
        }
      }
    },
    [mutation, mutate]
  );

  // Memoized edit handler
  const handleEdit = useCallback((issue: Issue) => {
    setEditItem(issue);
    setOpen(true);
  }, []);

  // Memoized close modal handler
  const handleCloseModal = useCallback(() => {
    setOpen(false);
    setEditItem(null);
  }, []);

  // Helper function to get assigned user display name
  const getAssignedToDisplay = useCallback((assignedTo: AssignedTo | null) => {
    if (!assignedTo) {
      return "Unassigned";
    }
    return assignedTo.email || assignedTo.username || "Unassigned";
  }, []);

  // Memoized priority badge renderer
  const renderPriorityBadge = useCallback(
    (priority: string) => (
      <span
        className={`items-center justify-center text-wrap rounded-full px-4 py-1 font-medium capitalize ${
          priority === "high"
            ? "bg-red-600 text-white"
            : priority === "medium"
              ? "bg-orange-500 text-white"
              : "bg-green-500 text-white"
        }`}
      >
        {priority ?? "Not Provided"}
      </span>
    ),
    []
  );

  // Memoized status badge renderer
  const renderStatusBadge = useCallback(
    (status: string) => (
      <span
        className={`items-center justify-center text-wrap rounded-full px-4 py-1 font-medium capitalize ${
          status === "active"
            ? "bg-blue-600 text-white"
            : status === "in_progress"
              ? "bg-yellow-500 text-white"
              : "bg-green-500 text-white"
        }`}
      >
        {status?.replace("_", " ") ?? "Not Provided"}
      </span>
    ),
    []
  );

  // Memoized columns definition
  const columns = useMemo(
    () => [
      {
        field: "title",
        title: "Title",
        sortable: true,
        filterable: true,
        render: (row: Issue) => (
          <span className="font-medium capitalize">
            {row?.title ?? "Not Provided"}
          </span>
        )
      },
      {
        field: "priority",
        title: "Priority",
        sortable: true,
        filterable: true,
        render: (row: Issue) => renderPriorityBadge(row?.priority)
      },
      {
        field: "status",
        title: "Status",
        sortable: true,
        filterable: true,
        render: (row: Issue) => renderStatusBadge(row?.status)
      },
      {
        field: "type",
        title: "Type",
        sortable: true,
        filterable: true,
        render: (row: Issue) => (
          <span className="items-center justify-center text-wrap capitalize">
            {row?.type ?? "Not Provided"}
          </span>
        )
      },
      {
        field: "due_date",
        title: "Due Date",
        sortable: true,
        filterable: true,
        render: (row: Issue) => (
          <span className="text-nowrap">
            {!isUserLoading && user && row.due_date
              ? moment(formatDateTime(row.due_date, user?.date_time)).format(
                  "ll"
                )
              : "Not Provided"}
          </span>
        )
      },
      {
        field: "assigned_to",
        title: "Assigned To",
        sortable: true,
        filterable: true,
        render: (row: Issue) => (
          <span className="text-sm text-gray-900 dark:text-gray-100">
            {getAssignedToDisplay(row?.assigned_to)}
          </span>
        )
      },
      {
        field: "details",
        title: "Details",
        sortable: false,
        filterable: false,
        render: (row: Issue) => (
          <div className="flex w-full items-center justify-center">
            {isAccess?.permission?.is_shown && (
              <div className="w-fit">
                <CustomButton
                  onClick={() => {
                    setEditItem(row);
                    setEditOpen(true);
                  }}
                  disabled={!isAccess?.permission?.actions?.read}
                  className="!text-[0.7rem]"
                >
                  view
                </CustomButton>
              </div>
            )}
          </div>
        )
      },
      {
        field: "actions",
        title: "Actions",
        sortable: false,
        filterable: false,
        render: (row: Issue) => (
          <div className="flex w-full items-center justify-center">
            <div className="flex w-fit items-center gap-2">
              {isAccess?.buttons?.[1]?.permission?.is_shown && (
                <Tooltip title="Edit Issue" arrow placement="top">
                  <IconButton
                    onClick={() => {
                      if (isAccess?.buttons?.[1]?.permission?.actions?.update) {
                        handleEdit(row);
                      } else {
                        toast.error(
                          "You do not have permission to edit this issue."
                        );
                      }
                    }}
                  >
                    <Edit size={18} className="text-blue-500" />
                  </IconButton>
                </Tooltip>
              )}
              {isAccess?.buttons?.[2]?.permission?.is_shown && (
                <Tooltip title="Delete Issue" arrow placement="top">
                  <IconButton
                    onClick={() => {
                      if (isAccess?.buttons?.[2]?.permission?.actions?.delete) {
                        handleDelete(row.id);
                      } else {
                        toast.error(
                          "You do not have permission to delete this issue."
                        );
                      }
                    }}
                    disabled={deletingIssueId === row.id}
                  >
                    {deletingIssueId === row.id ? (
                      <div className="flex h-5 w-5 items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                      </div>
                    ) : (
                      <Trash2 size={18} className="text-red-500" />
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
        )
      }
    ],
    [
      renderPriorityBadge,
      renderStatusBadge,
      isUserLoading,
      user,
      isAccess,
      handleEdit,
      handleDelete,
      deletingIssueId,
      getAssignedToDisplay
    ]
  );

  // Mobile Card View Component
  const MobileCardView = useMemo(
    () => (
      <div className="flex w-full flex-col gap-4 px-4">
        {isValidating ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tertiary-600 border-t-transparent"></div>
          </div>
        ) : data?.issues?.length === 0 ? (
          <div className="flex h-40 w-full items-center justify-center">
            <p className="text-gray-500">No issues found</p>
          </div>
        ) : (
          <>
            {data?.issues?.map((issue: Issue) => (
              <div
                key={issue.id}
                className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-darkSidebarBackground"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                    {issue?.title ?? "Not Provided"}
                  </h3>
                  <div className="flex items-center gap-2">
                    {isAccess?.buttons?.[1]?.permission?.is_shown && (
                      <IconButton
                        onClick={() => {
                          if (
                            isAccess?.buttons?.[1]?.permission?.actions?.update
                          ) {
                            handleEdit(issue);
                          } else {
                            toast.error(
                              "You do not have permission to edit this issue."
                            );
                          }
                        }}
                      >
                        <Edit size={18} className="text-blue-500" />
                      </IconButton>
                    )}

                    {isAccess?.buttons?.[2]?.permission?.is_shown && (
                      <IconButton
                        onClick={() => {
                          if (
                            isAccess?.buttons?.[2]?.permission?.actions?.delete
                          ) {
                            handleDelete(issue.id);
                          } else {
                            toast.error(
                              "You do not have permission to delete this issue."
                            );
                          }
                        }}
                        disabled={deletingIssueId === issue.id}
                      >
                        {deletingIssueId === issue.id ? (
                          <div className="flex h-5 w-5 items-center justify-center">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                          </div>
                        ) : (
                          <Trash2 size={18} className="text-red-500" />
                        )}
                      </IconButton>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-neutral-400">
                  <p className="mb-2">
                    <strong>Description:</strong>{" "}
                    {issue?.description ?? "Not Provided"}
                  </p>
                  <p className="mb-2 capitalize">
                    <strong>Priority:</strong>{" "}
                    <span
                      className={`rounded px-2 py-0.5 ${
                        issue?.priority === "high"
                          ? "bg-red-600 text-white"
                          : issue?.priority === "medium"
                            ? "bg-orange-500 text-white"
                            : "bg-green-500 text-white"
                      }`}
                    >
                      {issue?.priority ?? "Not Provided"}
                    </span>
                  </p>
                  <p className="mb-2 capitalize">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`rounded px-2 py-0.5 ${
                        issue?.status === "active"
                          ? "bg-blue-600 text-white"
                          : issue?.status === "in_progress"
                            ? "bg-yellow-500 text-white"
                            : "bg-green-500 text-white"
                      }`}
                    >
                      {issue?.status?.replace("_", " ") ?? "Not Provided"}
                    </span>
                  </p>
                  <p className="mb-2 capitalize">
                    <strong>Type:</strong> {issue?.type ?? "Not Provided"}
                  </p>
                  <p className="mb-2">
                    <strong>Assigned To:</strong>{" "}
                    {getAssignedToDisplay(issue?.assigned_to)}
                  </p>
                  <p className="mb-2">
                    <strong>Due Date:</strong>{" "}
                    {!isUserLoading && user && issue.due_date
                      ? moment(
                          formatDateTime(issue.due_date, user?.date_time)
                        ).format("ll")
                      : "Not Provided"}
                  </p>
                  {issue?.related_entity && (
                    <p className="mb-2">
                      <strong>Related Entity:</strong>{" "}
                      {issue.related_entity.name ?? "Not Provided"}
                    </p>
                  )}
                  <div className="mt-3 flex justify-end">
                    {isAccess?.permission?.is_shown && (
                      <CustomButton
                        onClick={() => {
                          setEditItem(issue);
                          setEditOpen(true);
                        }}
                        disabled={!isAccess?.permission?.actions?.read}
                        className="!text-[0.7rem]"
                      >
                        View Details
                      </CustomButton>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {data?.issues?.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-white">
                  Showing {page * pageSize + 1} to{" "}
                  {Math.min(
                    (page + 1) * pageSize,
                    data?.pagination?.total_items || 0
                  )}{" "}
                  of {data?.pagination?.total_items || 0}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white disabled:opacity-50 dark:border-neutral-700 dark:bg-darkSidebarBackground"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-medium">
                    Page {page + 1} of{" "}
                    {Math.ceil((data?.pagination?.total_items || 0) / pageSize)}
                  </span>
                  <button
                    onClick={() =>
                      setPage(
                        Math.min(
                          Math.ceil(
                            (data?.pagination?.total_items || 0) / pageSize
                          ) - 1,
                          page + 1
                        )
                      )
                    }
                    disabled={
                      page >=
                      Math.ceil(
                        (data?.pagination?.total_items || 0) / pageSize
                      ) -
                        1
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white disabled:opacity-50 dark:border-neutral-700 dark:bg-darkSidebarBackground"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    ),
    [
      data,
      isValidating,
      page,
      pageSize,
      isAccess,
      handleEdit,
      handleDelete,
      deletingIssueId,
      user,
      isUserLoading,
      getAssignedToDisplay
    ]
  );

  return (
    <div className="h-fit w-full pt-6">
      <AddEditIssue
        mutate={mutate}
        onClose={handleCloseModal}
        open={open}
        editItem={editItem}
        controlId={controlId as string}
      />
      <IssueDetailsPanel
        issueId={editItem?.id as string}
        user={user as UserPermissionPayload}
        isUserLoading={isUserLoading}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
      {/* Responsive Design - Show Cards on Mobile, Table with Detail Panel on Desktop */}
      <div className="sm:hidden">
        <CustomToolbar
          setOpen={setOpen}
          setSearch={setSearch}
          setStatusFilter={setStatusFilter}
          setPriorityFilter={setPriorityFilter}
          search={search}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          isAccess={isAccess}
        />
        {MobileCardView}
      </div>
      <div className="hidden sm:block">
        <CustomTable<Issue>
          columns={columns}
          data={data?.issues || []}
          isLoading={isValidating}
          page={page}
          pageSize={pageSize}
          totalCount={data?.pagination?.total_items}
          onPageChange={setPage}
          onRowsPerPageChange={setPageSize}
          customToolbar={
            <CustomToolbar
              setOpen={setOpen}
              setSearch={setSearch}
              setStatusFilter={setStatusFilter}
              setPriorityFilter={setPriorityFilter}
              search={search}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              isAccess={isAccess}
            />
          }
          title=""
          selection={false}
          filtering={false}
          options={{
            toolbar: false,
            search: false,
            filtering: true,
            sorting: true,
            pagination: true,
            detailPanel: false
          }}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default Issues;
