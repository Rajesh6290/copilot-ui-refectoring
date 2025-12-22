"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { IconButton, Tooltip } from "@mui/material";
import { ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";

const AddNewPolicy = dynamic(() => import("./AddNewPolicy"), {
  ssr: false
});
const PolicyDetails = dynamic(() => import("./PolicyDetails"), {
  ssr: false
});
const UpdatePolicy = dynamic(() => import("./UpdatePolicy"), {
  ssr: false
});

export interface PoliciesResponse extends Record<string, unknown> {
  policies: Policy[];
  pagination: Pagination;
  tenant_id: string;
  client_id: string;
}

/* =========================
 * Policy
 * ========================= */
export interface Policy extends Record<string, unknown> {
  doc_id: string;
  id: string | null;
  version: string;
  name: string;
  description: string;
  effective_date: string | null;
  readiness_status: ReadinessStatus;
  scope: string;
  framework: string[] | null;
  category: string[] | null;
  citation: string[] | null;
  tags: string[];
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  visibility: Visibility;
  status?: PolicyStatus;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
}

/* =========================
 * Pagination
 * ========================= */
export interface Pagination {
  total_records: number;
  page: number;
  limit: number;
  total_pages: number;
}

/* =========================
 * Enums (CPT / ALS friendly)
 * ========================= */
export type ReadinessStatus = "Pending" | "not_ready" | "ready" | "approved";

export type Visibility = "private" | "public" | "restricted";

export type PolicyStatus = "approved" | "draft" | "deprecated";
export interface IsAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        read: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
      };
    };
  }[];
}
export interface AllAccess {
  is_shown: boolean;
  actions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}
const CustomToolbar = ({
  mutate,
  isAccess
}: {
  mutate: () => void;
  isAccess: IsAccess;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full items-center justify-between px-5 py-3">
      <AddNewPolicy
        mutate={mutate}
        onClose={() => setOpen(false)}
        open={open}
      />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Policies
      </h2>
      {isAccess?.buttons?.[0]?.permission?.is_shown && (
        <div className="w-fit">
          <CustomButton
            disabled={!isAccess?.buttons?.[0]?.permission?.actions?.create}
            onClick={() => setOpen(true)}
          >
            Add New Policy
          </CustomButton>
        </div>
      )}
    </div>
  );
};
const PoliciesRegister = ({
  isAccess,
  allAccess
}: {
  isAccess: IsAccess;
  allAccess: AllAccess;
}) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState<boolean>(false);
  const [policyId, setPolicyId] = useState<string>("");
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const { data, isValidating, mutate } = useSwr(
    `policies?page=${page + 1}&limit=${pageSize}`
  );
  const { isLoading, mutation } = useMutation();
  const { isLoading: deleteLoading, mutation: deleteMutation } = useMutation();

  // State to track toggle status for all policies (key: doc_id, value: isChecked)
  const [toggleStates, setToggleStates] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Initialize toggle states based on data when it loads
  const initializeToggleStates = (policies: Policy[]) => {
    const newToggleStates = policies.reduce(
      (acc, policy) => {
        acc[policy.doc_id] = policy.visibility === "public";
        return acc;
      },
      {} as { [key: string]: boolean }
    );
    setToggleStates(newToggleStates);
  };

  // Update toggle states when data changes
  if (
    data &&
    data?.policies?.length > 0 &&
    Object.keys(toggleStates).length === 0
  ) {
    initializeToggleStates(data?.policies || []);
  }

  // Handle toggle change for a specific policy
  const handleToggle = async (doc_id: string) => {
    // Optimistically update the UI
    const previousStates = { ...toggleStates };
    setToggleStates((prev) => ({
      ...prev,
      [doc_id]: !prev[doc_id]
    }));

    try {
      const res = await mutation(`policy?doc_id=${doc_id}`, {
        method: "PUT",
        isAlert: false,
        body: {
          file: false,
          policy_update: {
            visibility: toggleStates[doc_id] ? "private" : "public"
          }
        }
      });

      if (res?.status === 200) {
        toast.success("Policy visibility updated successfully");
        mutate(); // Refresh the data
      } else {
        // Revert the toggle on failure
        setToggleStates(previousStates);
        toast.error("Failed to update policy visibility");
      }
    } catch (error) {
      // Revert the toggle on error
      setToggleStates(previousStates);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleDelete = async (doc_id: string) => {
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
      try {
        const res = await deleteMutation(`policy?doc_id=${doc_id}`, {
          method: "DELETE",
          isAlert: false
        });

        if (res?.status === 200) {
          toast.success("Policy deleted successfully");
          mutate(); // Refresh the data
        } else {
          toast.error("Failed to delete policy");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    }
  };

  // Mobile Card View Component
  const MobileCardView = () => {
    return (
      <div className="flex w-full flex-col gap-4 px-4">
        {isValidating ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tertiary-600 border-t-transparent"></div>
          </div>
        ) : data?.policies?.length === 0 ? (
          <div className="flex h-40 w-full items-center justify-center">
            <p className="text-gray-500">No policies found</p>
          </div>
        ) : (
          <>
            {data?.policies?.map((policy: Policy) => (
              <div
                key={policy.doc_id}
                className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-darkSidebarBackground"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                    {policy?.name ?? "Not Provided"}
                  </h3>
                  <div className="flex items-center gap-2">
                    {allAccess?.is_shown && (
                      <Tooltip title="View Policy" arrow placement="top">
                        <Eye
                          onClick={() => {
                            if (allAccess?.actions?.read) {
                              setPolicyId(policy?.doc_id);
                              setOpen(true);
                            } else {
                              toast.error(
                                "You do not have permission to view this policy."
                              );
                            }
                          }}
                          size={20}
                          className="cursor-pointer text-tertiary-600"
                        />
                      </Tooltip>
                    )}
                    {isAccess?.buttons?.[1]?.permission?.is_shown && (
                      <Tooltip title="Update Policy" arrow placement="top">
                        <Pencil
                          onClick={() => {
                            if (
                              isAccess?.buttons?.[1]?.permission?.actions
                                ?.update
                            ) {
                              setPolicyId(policy?.doc_id);
                              setEditOpen(true);
                            } else {
                              toast.error(
                                "You do not have permission to update this policy."
                              );
                            }
                          }}
                          size={20}
                          className="cursor-pointer text-green-500"
                        />
                      </Tooltip>
                    )}
                    {isAccess?.buttons?.[2]?.permission?.is_shown && (
                      <Tooltip title="Delete Policy" arrow placement="top">
                        <Trash2
                          onClick={() => {
                            if (
                              isAccess?.buttons?.[2]?.permission?.actions
                                ?.delete
                            ) {
                              setPolicyId(policy.doc_id);
                              handleDelete(policy.doc_id);
                            } else {
                              toast.error(
                                "You do not have permission to delete this policy."
                              );
                            }
                          }}
                          size={20}
                          className="cursor-pointer text-red-500"
                        />
                      </Tooltip>
                    )}
                  </div>
                </div>
                <p className="mb-4 text-sm text-gray-600 dark:text-neutral-400">
                  {policy?.description ?? "Not Provided"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-700 dark:text-white">
                      Show in Trust Center:
                    </span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <span className="sr-only">
                        Toggle policy visibility in Trust Center
                      </span>
                      <input
                        type="checkbox"
                        checked={toggleStates[policy.doc_id] || false}
                        onChange={() => handleToggle(policy.doc_id)}
                        className="peer sr-only"
                      />
                      <div className="peer relative h-5 w-9 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-tertiary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-tertiary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-tertiary-600 dark:peer-focus:ring-tertiary-800 rtl:peer-checked:after:-translate-x-full"></div>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {data?.policies?.length > pageSize && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-white">
                  Showing {page * pageSize + 1} to{" "}
                  {Math.min(
                    (page + 1) * pageSize,
                    data?.pagination?.total_records || 0
                  )}{" "}
                  of {data?.pagination?.total_records || 0}
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
                    {Math.ceil(
                      (data?.pagination?.total_records || 0) / pageSize
                    )}
                  </span>
                  <button
                    onClick={() =>
                      setPage(
                        Math.min(
                          Math.ceil(
                            (data?.pagination?.total_records || 0) / pageSize
                          ) - 1,
                          page + 1
                        )
                      )
                    }
                    disabled={
                      page >=
                      Math.ceil(
                        (data?.pagination?.total_records || 0) / pageSize
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
    );
  };

  return (
    <>
      <PolicyDetails
        onClose={() => setOpen(!open)}
        open={open}
        policyId={policyId}
        setPolicyId={setPolicyId}
        isAccess={allAccess}
        isUpdateDocumentStatus={
          isAccess?.buttons?.[1]?.permission?.actions?.update ?? false
        }
      />
      <UpdatePolicy
        mutate={mutate}
        onClose={() => setEditOpen(!editOpen)}
        open={editOpen}
        policyId={policyId}
        canUploadNewFiles={true}
        setPolicyId={setPolicyId}
      />

      {/* Responsive Design - Show Cards on Mobile, Table on Desktop */}
      <div className="sm:hidden">
        <CustomToolbar mutate={mutate} isAccess={isAccess} />
        <MobileCardView />
      </div>
      <div className="hidden sm:block">
        <CustomTable<Policy>
          columns={[
            {
              field: "name",
              title: "Name",
              sortable: true,
              filterable: true,
              render: (rows: Policy) => {
                const row = rows as unknown as Policy;
                return (
                  <span className="flex w-fit items-center justify-start text-nowrap pl-2 text-left font-medium capitalize">
                    {row?.name ?? "Not Provided"}
                  </span>
                );
              }
            },
            {
              field: "description",
              title: "Description",
              sortable: true,
              filterable: true,
              cellClassName: "w-fit",
              render: (row: Policy) => (
                <span className="flex w-[30rem] items-center justify-start text-wrap text-left lg:w-[20rem] 2xl:w-fit">
                  {row?.description ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "show_In_Trust_center",
              title: "Show in Trust Center",
              sortable: false,
              filterable: false,
              render: (row: Policy) => (
                <span className="flex w-full items-center justify-center">
                  {allAccess?.is_shown && (
                    <div className="relative w-fit cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={toggleStates[row.doc_id] || false}
                        onChange={() => {
                          if (allAccess?.actions?.update) {
                            handleToggle(row.doc_id);
                          } else {
                            toast.error(
                              "You do not have permission to update this policy visibility."
                            );
                          }
                        }}
                        className="peer sr-only"
                      />
                      <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-tertiary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tertiary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-tertiary-600 dark:peer-focus:ring-tertiary-800 rtl:peer-checked:after:-translate-x-full"></div>
                    </div>
                  )}
                </span>
              )
            },
            {
              field: "view",
              title: "View",
              sortable: true,
              filterable: true,
              render: (row: Policy) => (
                <div className="flex w-full items-center justify-center">
                  {allAccess?.is_shown && (
                    <div className="w-fit">
                      <CustomButton
                        onClick={() => {
                          setPolicyId(row?.doc_id);
                          setOpen(true);
                        }}
                        disabled={!allAccess?.actions?.read}
                        className="w-fit !text-[0.7rem] !uppercase"
                      >
                        VIEW
                      </CustomButton>
                    </div>
                  )}
                </div>
              )
            },
            {
              field: "action",
              title: "Action",
              sortable: true,
              filterable: true,
              render: (row: Policy) => (
                <div className="flex w-full items-center justify-center">
                  <div className="flex items-center gap-1">
                    {isLoading && row.doc_id === policyId ? (
                      <div className="flex h-5 w-5 animate-spin items-center justify-center rounded-full border-2 border-t-2 border-gray-200 border-t-tertiary-600"></div>
                    ) : (
                      <Tooltip title="Update Policy" arrow placement="top">
                        <IconButton
                          onClick={() => {
                            if (
                              isAccess?.buttons?.[1]?.permission?.actions
                                ?.update
                            ) {
                              setPolicyId(row?.doc_id);
                              setEditOpen(true);
                            } else {
                              toast.error(
                                "You do not have permission to update this policy."
                              );
                            }
                          }}
                        >
                          {isAccess?.buttons?.[1]?.permission?.is_shown && (
                            <Pencil
                              size={23}
                              className="cursor-pointer text-green-500"
                            />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                    {deleteLoading && row.doc_id === policyId ? (
                      <div className="flex h-5 w-5 animate-spin items-center justify-center rounded-full border-2 border-t-2 border-gray-200 border-t-tertiary-600"></div>
                    ) : (
                      <Tooltip title="Delete Policy" arrow placement="top">
                        <IconButton
                          onClick={() => {
                            if (
                              isAccess?.buttons?.[2]?.permission?.actions
                                ?.delete
                            ) {
                              setPolicyId(row?.doc_id);
                              handleDelete(row.doc_id);
                            } else {
                              toast.error(
                                "You do not have permission to delete this policy."
                              );
                            }
                          }}
                        >
                          {isAccess?.buttons?.[2]?.permission?.is_shown && (
                            <Trash2
                              size={23}
                              className="cursor-pointer text-red-500"
                            />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )
            }
          ]}
          data={data?.policies || []}
          isLoading={isValidating}
          page={page}
          pageSize={pageSize}
          totalCount={data?.pagination?.total_records}
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
          className="flex-1"
        />
      </div>
    </>
  );
};

export default PoliciesRegister;
