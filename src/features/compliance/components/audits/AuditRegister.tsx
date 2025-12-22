"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "nextjs-toploader/app";
import React, { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
const AddAuditorDialog = dynamic(() => import("./AddAuditorDialog"), {
  ssr: false
});
const AddNewAudit = dynamic(() => import("./AddNewAudit"), {
  ssr: false
});
const UpdateAudit = dynamic(() => import("./UpdateAudit"), {
  ssr: false
});
interface IsAccess {
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
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
}

interface AuditRegisterProps {
  isAccess: IsAccess;
}

export interface AuditItem extends Record<string, unknown> {
  audit_id: string;
  title: string;
  description: string;
  assessment_type: string;
  status: string;
  created_by: string;
  controls_count: number;
  frameworks_count: number;
  requirements_count: number;
  invited_auditors_count: number;
  created_at: string;
  updated_at: string;
  audit_window?: {
    start_date: string;
    end_date: string;
  };
  framwork_mapping?: Array<{
    framework_common_id: string;
    framework_doc_id: string;
    framework_name: string;
    framework_status: string;
  }>;
}

// Status color utility function
const getStatusStyles = (status: string) => {
  const statusLower = status?.toLowerCase();

  switch (statusLower) {
    case "draft":
      return "bg-gray-100 text-gray-700 border border-gray-300";
    case "in_progress":
      return "bg-blue-100 text-blue-700 border border-blue-300";
    case "in_review":
      return "bg-purple-100 text-purple-700 border border-purple-300";
    case "completed":
      return "bg-green-100 text-green-700 border border-green-300";
    case "archived":
      return "bg-orange-100 text-orange-700 border border-orange-300";
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

// Format status text for display
const formatStatusText = (status: string) => {
  return (
    status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ??
    "Not Provided"
  );
};
// Custom Toolbar Component
const CustomToolbar = ({
  mutate,
  isAccess
}: {
  mutate: () => void;
  isAccess: IsAccess;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="= flex w-full items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
      <AddNewAudit mutate={mutate} onClose={() => setOpen(false)} open={open} />
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Audit Management
        </h2>
      </div>
      {isAccess?.buttons?.[0]?.permission?.is_shown && (
        <div className="w-fit">
          <CustomButton
            onClick={() => setOpen(true)}
            disabled={!isAccess?.buttons?.[0]?.permission?.actions?.create}
            className="shadow-sm transition-all hover:shadow-md"
          >
            + Add New Audit
          </CustomButton>
        </div>
      )}
    </div>
  );
};
const AuditRegister: React.FC<AuditRegisterProps> = ({ isAccess }) => {
  const { isLoading, mutation } = useMutation();
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedAudit, setSelectedAudit] = useState<AuditItem | null>(null);
  const [updateOpen, setUpdateOpen] = useState<boolean>(false);
  const [addAuditorOpen, setAddAuditorOpen] = useState<boolean>(false);
  const router = useRouter();
  const { data, isValidating, mutate } = useSwr(
    `audits?page=${page + 1}&limit=${pageSize}`,
    {
      keepPreviousData: true
    }
  );
  const handleDeleteAudit = async (auditId: string) => {
    try {
      const { value: confirmed } = await Swal.fire({
        title: "Are you sure?",
        text: "You want to delete this audit? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
      });

      if (!confirmed) {
        return;
      }

      const res = await mutation(`audit?audit_id=${auditId}`, {
        method: "DELETE",
        isAlert: false
      });
      if (res?.status === 200) {
        toast.success(res?.results?.message || "Audit deleted successfully.");
        setSelectedAudit(null);
        mutate();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the audit."
      );
    }
  };

  return (
    <div className="h-fit w-full">
      <UpdateAudit
        open={updateOpen}
        onClose={() => {
          setSelectedAudit(null);
          setUpdateOpen(false);
        }}
        item={selectedAudit}
        mutate={mutate}
      />

      <AddAuditorDialog
        open={addAuditorOpen}
        onClose={() => {
          setAddAuditorOpen(false);
          setSelectedAudit(null);
        }}
        selectedAudit={selectedAudit}
        mutate={mutate}
      />

      <CustomTable<AuditItem>
        columns={[
          {
            field: "title",
            title: "Title",
            sortable: true,
            filterable: true,
            render: (row: AuditItem) => (
              <div className="flex flex-col gap-1">
                <span className="line-clamp-2 w-[250px] font-semibold leading-tight text-gray-900 dark:text-gray-100">
                  {row?.title ?? "Not Provided"}
                </span>
              </div>
            )
          },
          {
            field: "description",
            title: "Description",
            sortable: true,
            filterable: true,
            render: (row: AuditItem) => (
              <span className="w-full max-w-[400px] items-center justify-center text-wrap text-sm text-gray-700 dark:text-gray-300">
                {row?.description ?? "No description provided"}
              </span>
            )
          },
          {
            field: "status",
            title: "Status",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: AuditItem) => (
              <span
                className={`inline-flex items-center justify-center text-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyles(row?.status)}`}
              >
                {formatStatusText(row?.status)}
              </span>
            )
          },
          {
            field: "controls_count",
            title: "Controls",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: AuditItem) => (
              <div className="flex w-full flex-col items-center justify-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {row?.controls_count ?? 0}
                </span>
              </div>
            )
          },
          {
            field: "frameworks_count",
            title: "Frameworks",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: AuditItem) => (
              <div className="flex w-full flex-col items-center justify-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {row?.frameworks_count ?? 0}
                </span>
              </div>
            )
          },
          {
            field: "requirements_count",
            title: "Requirements",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: AuditItem) => (
              <div className="flex w-full flex-col items-center justify-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {row?.requirements_count ?? 0}
                </span>
              </div>
            )
          },

          ...(isAccess?.buttons?.[1]?.permission?.is_shown
            ? [
                {
                  field: "invited_auditors_count",
                  title: "Auditors",
                  sortable: true,
                  filterable: true,
                  cellClassName: "w-fit",
                  render: (row: AuditItem) => (
                    <div className="flex w-full flex-col items-center justify-center">
                      {row?.invited_auditors_count > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {row?.invited_auditors_count}
                          </span>
                          <Tooltip title="Invite Another Auditor">
                            <IconButton
                              onClick={() => {
                                setSelectedAudit(row);
                                setAddAuditorOpen(true);
                              }}
                              disabled={
                                !isAccess?.buttons?.[1]?.permission?.actions
                                  ?.create
                              }
                              className="!text-nowrap !text-indigo-500 hover:!bg-indigo-50 hover:!text-indigo-600"
                              size="small"
                            >
                              <UserPlus size={16} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      ) : (
                        <CustomButton
                          onClick={() => {
                            setSelectedAudit(row);
                            setAddAuditorOpen(true);
                          }}
                          disabled={
                            !isAccess?.buttons?.[1]?.permission?.actions?.create
                          }
                          className="w-fit !text-nowrap !text-[0.65rem] !uppercase"
                        >
                          <UserPlus size={14} className="mr-1" />
                          Invite Auditor
                        </CustomButton>
                      )}
                    </div>
                  )
                }
              ]
            : []),
          ...(isAccess?.buttons?.[2]?.permission?.is_shown
            ? [
                {
                  field: "view",
                  title: "Details",
                  sortable: false,
                  filterable: false,
                  render: (row: AuditItem) => (
                    <div className="flex w-full items-center justify-center gap-2">
                      <Tooltip title="View Details">
                        <CustomButton
                          onClick={() => {
                            router.push(
                              `/audits/${row?.audit_id}?_name=${encodeURIComponent(row?.title)}`
                            );
                          }}
                          disabled={
                            !isAccess?.buttons?.[2]?.permission?.actions?.read
                          }
                          className="w-fit !text-[0.6rem] !uppercase"
                        >
                          <Eye size={14} className="mr-1" />
                          VIEW
                        </CustomButton>
                      </Tooltip>
                    </div>
                  )
                }
              ]
            : []),

          {
            field: "action",
            title: "Actions",
            sortable: false,
            filterable: false,
            render: (row: AuditItem) => (
              <div className="flex w-full items-center justify-center gap-2">
                {isAccess?.buttons?.[3]?.permission?.is_shown && (
                  <Tooltip title="Edit Audit">
                    <IconButton
                      onClick={() => {
                        if (
                          isAccess?.buttons?.[3]?.permission?.actions?.update
                        ) {
                          setSelectedAudit(row);
                          setUpdateOpen(true);
                        } else {
                          toast.error(
                            "You don't have permission to update audit."
                          );
                        }
                      }}
                      className="!text-green-500 hover:!bg-green-50 hover:!text-green-600"
                      size="small"
                    >
                      <Pencil size={18} />
                    </IconButton>
                  </Tooltip>
                )}
                {isAccess?.buttons?.[4]?.permission?.is_shown && (
                  <Tooltip title="Delete Audit">
                    <IconButton
                      onClick={() => {
                        if (
                          isAccess?.buttons?.[4]?.permission?.actions?.delete
                        ) {
                          setSelectedAudit(row);
                          handleDeleteAudit(row?.audit_id);
                        } else {
                          toast.error(
                            "You don't have permission to delete audit."
                          );
                        }
                      }}
                      disabled={
                        isLoading && selectedAudit?.audit_id === row?.audit_id
                      }
                      className="!text-red-500 hover:!bg-red-50 hover:!text-red-600"
                      size="small"
                    >
                      {isLoading &&
                      selectedAudit?.audit_id === row?.audit_id ? (
                        <CircularProgress size={18} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            )
          }
        ]}
        data={data?.audits && data?.audits?.length > 0 ? data?.audits : []}
        isLoading={isValidating}
        page={page}
        pageSize={pageSize}
        totalCount={data?.pagination?.total ?? 0}
        onPageChange={setPage}
        onRowsPerPageChange={setPageSize}
        customToolbar={<CustomToolbar isAccess={isAccess} mutate={mutate} />}
        title=""
        selection={false}
        filtering={false}
        options={{
          toolbar: false,
          search: false,
          filtering: true,
          sorting: true,
          pagination: true
        }}
        localization={{
          body: {
            emptyDataSourceMessage:
              "You haven't created any audits yet. Use the 'Add New Audit' button to set one up."
          }
        }}
        className="flex-1"
      />
    </div>
  );
};

export default AuditRegister;
