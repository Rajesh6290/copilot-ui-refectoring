"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { CircularProgress, Tooltip } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
const LibraryPolicyDetails = dynamic(() => import("./LibraryPolicyDetails"), {
  ssr: false
});
export interface PoliciesListResponse extends Record<string, unknown> {
  data: PolicyItem[];
  pagination: Pagination;
  tenant_id: string;
  client_id: string;
}
export interface PolicyItem extends Record<string, unknown> {
  doc_id: string;
  id: string;
  version: string;
  name: string;
  description: string;
  effective_date: string; // empty string allowed by API
  readiness_status: ReadinessStatus;
  scope: string;
  created_by: string;
  framework: string[];
  category: string[];
  citation: string[];
  source_refference: string[]; // keeping API spelling
  keywords: string[];
  tags: string[];
  topics: string[];
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  is_present_in_policy_register: boolean;
}
export interface Pagination {
  total_records: number;
  page: number;
  limit: number;
}
export type ReadinessStatus = "Pending" | "not_ready" | "ready" | "approved";
interface IsAccess {
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
interface AllAccess {
  is_shown: boolean;
  actions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}
const PoliciesLibrary = ({
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
  const { data, isValidating, mutate } = useSwr(
    `policies-common?page=${page + 1}&limit=${pageSize}`
  );

  const AddToSurveyRegister = ({ row }: { row: PolicyItem }) => {
    const { isLoading, mutation } = useMutation();
    const handleAdd = async () => {
      try {
        const res = await mutation(`policy/import?doc_id=${row?.doc_id}`, {
          method: "POST",
          isAlert: false
        });
        if (res?.status === 201) {
          mutate();
          toast.success("Policy added to register");
        } else {
          toast.error("Failed to add policy to register");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    };

    return isLoading ? (
      <CircularProgress size={15} />
    ) : isAccess?.buttons?.[0]?.permission?.is_shown ? (
      <div
        tabIndex={0}
        role="button"
        onClick={() => {
          if (isAccess?.buttons?.[0]?.permission?.actions?.create) {
            handleAdd();
          } else {
            toast.error("You do not have permission to add policies");
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (isAccess?.buttons?.[0]?.permission?.actions?.create) {
              handleAdd();
            } else {
              toast.error("You do not have permission to add policies");
            }
          }
        }}
        className={`cursor-pointer rounded border px-4 py-2 font-semibold ${
          row?.is_present_in_policy_register
            ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            : !isAccess?.buttons?.[0]?.permission?.actions?.create
              ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              : "text-gray-700 dark:text-white"
        }`}
      >
        {row?.is_present_in_policy_register ? "Already Added" : "Add"}
      </div>
    ) : (
      <></>
    );
  };

  // Mobile Card View Component
  const MobileCardView = () => {
    return (
      <div className="flex w-full flex-col gap-4 px-4">
        {isValidating ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tertiary-600 border-t-transparent"></div>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex h-40 w-full items-center justify-center">
            <p className="text-gray-500">No policies found</p>
          </div>
        ) : (
          <>
            {data?.data?.map((policy: PolicyItem) => (
              <div
                key={policy.doc_id}
                className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-darkSidebarBackground"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                    {policy?.name ?? "Not Provided"}
                  </h3>
                  {allAccess?.is_shown && (
                    <div className="flex items-center gap-2">
                      <Tooltip title="View Policy" arrow placement="top">
                        <CustomButton
                          onClick={() => {
                            setPolicyId(policy?.doc_id);
                            setOpen(true);
                          }}
                          disabled={!allAccess?.actions?.read}
                          className="w-fit !text-[0.7rem] !uppercase"
                        >
                          VIEW
                        </CustomButton>
                      </Tooltip>
                    </div>
                  )}
                </div>
                <p className="mb-4 text-sm text-gray-600 dark:text-neutral-400">
                  {policy?.description ?? "Not Provided"}
                </p>
                <div className="flex items-center justify-end">
                  <AddToSurveyRegister row={policy} />
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {data?.data?.length > pageSize && (
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
      <LibraryPolicyDetails
        onClose={() => setOpen(!open)}
        open={open}
        policyId={policyId}
        isAccess={allAccess}
      />
      {/* Responsive Design - Show Cards on Mobile, Table on Desktop */}
      <div className="sm:hidden">
        <MobileCardView />
      </div>
      <div className="hidden sm:block">
        <CustomTable<PolicyItem>
          columns={[
            {
              field: "id",
              title: "ID",
              sortable: true,
              filterable: true,
              render: (row: PolicyItem) => (
                <span className="text-nowrap font-medium capitalize">
                  {row?.id ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "name",
              title: "Name",
              sortable: true,
              filterable: true,
              cellClassName: "w-fit",
              render: (row: PolicyItem) => (
                <span className="flex w-fit items-center justify-start text-nowrap text-left font-medium capitalize">
                  {row?.name ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "description",
              title: "Description",
              sortable: true,
              filterable: true,
              cellClassName: "w-[40rem]",
              render: (row: PolicyItem) => (
                <span className="lg:[20rem] flex items-center justify-start text-left 2xl:w-[40rem]">
                  {row?.description ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "add_to_register",
              title: "Add To Register",
              sortable: true,
              filterable: true,
              render: (row: PolicyItem) => (
                <div className="flex w-full items-center justify-center">
                  <AddToSurveyRegister row={row} />
                </div>
              )
            }
          ]}
          actions={[
            {
              icon: (row: PolicyItem) => (
                <div className="flex w-full items-center justify-center">
                  <div className="w-fit">
                    <CustomButton
                      onClick={() => {
                        setPolicyId(row?.doc_id);
                        setOpen(true);
                      }}
                      className="w-fit !text-[0.7rem] !uppercase"
                    >
                      VIEW
                    </CustomButton>
                  </div>
                </div>
              ),
              tooltip: "View",
              onClick: (row: PolicyItem) => {
                setPolicyId(row?.doc_id);
                setOpen(true);
              }
            }
          ]}
          data={data?.data || []}
          isLoading={isValidating}
          page={page}
          pageSize={pageSize}
          totalCount={data?.pagination?.total_records}
          onPageChange={setPage}
          onRowsPerPageChange={setPageSize}
          title="Policies"
          localization={{
            header: {
              actions: "View"
            }
          }}
          selection={false}
          filtering={false}
          customToolbar={<></>}
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

export default PoliciesLibrary;
