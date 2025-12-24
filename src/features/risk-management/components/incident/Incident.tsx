"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomPagination from "@/shared/core/CustomPagination";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import usePermission from "@/shared/hooks/usePermission";
import useSwr from "@/shared/hooks/useSwr";
import { formatDateTime, useCurrentMenuItem } from "@/shared/utils";
import { IconButton, Tooltip } from "@mui/material";
import { Eye, Trash2, X } from "lucide-react";
import moment from "moment";
import { useRouter } from "nextjs-toploader/app";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
const AddNewIncident = dynamic(() => import("./AddNewIncident"), {
  ssr: false
});

interface Incident extends Record<string, unknown> {
  doc_id: string;
  inc_number: string;
  incident_type: string | null;
  title: string;
  description: string;
  severity: string;
  priority: string | null;
  status: string;
  category: string | null;
  impact: string | null;
  impact_scope: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  reported_at: string;
  due_date: string;
  resolved_at: string | null;
}
const CustomToolbar = ({
  setOpen,
  setSearch,
  setSeverityFilter,
  search,
  severityFilter
}: {
  mutate: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setSearch: Dispatch<SetStateAction<string>>;
  setSeverityFilter: Dispatch<SetStateAction<string>>;
  search: string;
  severityFilter: string;
}) => {
  const currentAcces = useCurrentMenuItem();
  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);
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
            Incident
          </p>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {
              "Managing Risks by tracking and resolving AI governance failure events."
            }
          </p>
        </div>
        {currentAcces?.buttons?.[0]?.permission?.is_shown && (
          <div className="w-fit">
            <CustomButton
              className="w-fit text-nowrap"
              onClick={() => setOpen(true)}
              disabled={
                !currentAcces?.buttons?.[0]?.permission?.actions?.create
              }
            >
              Add New Incident
            </CustomButton>
          </div>
        )}
      </div>
      {/* Search Bar and Severity Filter */}
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
          placeholder="Search by Keywords"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tertiary-600 dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-white dark:placeholder-gray-400 sm:w-1/3"
        />
        <div className="relative w-full sm:w-1/4">
          {severityFilter?.length > 0 && (
            <span
              tabIndex={0}
              role="button"
              onClick={() => setSeverityFilter("")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSeverityFilter("");
                }
              }}
              className="absolute right-5 top-2.5 z-9999 cursor-pointer text-gray-500"
            >
              <X size={18} />
            </span>
          )}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-tertiary-600 dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-white"
          >
            <option value="">Filter By Severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const Incident = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<Incident | null>(null);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const router = useRouter();
  const { user, isUserLoading } = usePermission();
  const currentAccess = useCurrentMenuItem();
  const query = `incidents?page=${page + 1}&limit=${pageSize}${
    search ? `&keywords=${encodeURIComponent(search)}` : ""
  }${severityFilter ? `&severity=${encodeURIComponent(severityFilter)}` : ""}`;

  const { data, isValidating, mutate } = useSwr(query);
  const { isLoading, mutation } = useMutation();

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
        const res = await mutation(`incident?doc_id=${doc_id}`, {
          method: "DELETE",
          isAlert: false
        });

        if (res?.status === 200) {
          toast.success("Incident deleted successfully");
          mutate(); // Refresh the data
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
        ) : data?.incidents?.length === 0 ? (
          <div className="flex h-40 w-full items-center justify-center">
            <p className="text-gray-500">No incidents found</p>
          </div>
        ) : (
          <>
            {data?.incidents?.map((incident: Incident) => (
              <div
                key={incident.doc_id}
                className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-darkSidebarBackground"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                    {incident?.title ?? "Not Provided"}
                  </h3>
                  <div className="flex items-center gap-2">
                    {currentAccess?.permission?.is_shown && (
                      <Tooltip title="View Incident" arrow placement="top">
                        <Eye
                          onClick={() => {
                            if (currentAccess?.permission?.actions?.read) {
                              router?.push(
                                `/risk-management/incident/${incident?.doc_id}`
                              );
                            } else {
                              toast.error(
                                "You do not have permission to view this incident."
                              );
                            }
                          }}
                          size={20}
                          className="cursor-pointer text-tertiary-600"
                        />
                      </Tooltip>
                    )}

                    <IconButton
                      onClick={() => {
                        if (
                          currentAccess?.buttons?.[2]?.permission?.actions
                            ?.delete
                        ) {
                          setItem(incident);
                          handleDelete(incident.doc_id);
                        } else {
                          toast.error(
                            "You do not have permission to delete this incident."
                          );
                        }
                      }}
                    >
                      {isLoading && incident.doc_id === item?.doc_id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-4 border-tertiary-600 border-t-transparent"></div>
                      ) : (
                        currentAccess?.buttons?.[2]?.permission?.is_shown && (
                          <Trash2 size={18} className="text-red-500" />
                        )
                      )}
                    </IconButton>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-neutral-400">
                  <p className="capitalize">
                    <strong>Severity:</strong>{" "}
                    <span
                      className={`rounded px-2 py-0.5 ${
                        incident?.severity === "high"
                          ? "bg-red-600 text-white"
                          : incident?.severity === "medium"
                            ? "bg-orange-500 text-white"
                            : incident?.severity === "low"
                              ? "bg-yellow-500 text-white"
                              : "bg-green-500 text-white"
                      }`}
                    >
                      {incident?.severity ?? "Not Provided"}
                    </span>
                  </p>
                  <p className="capitalize">
                    <strong>Status:</strong>{" "}
                    {incident?.status ?? "Not Provided"}
                  </p>
                  <p className="capitalize">
                    <strong>Impact Scope:</strong>{" "}
                    {incident?.impact_scope || "Not Provided"}
                  </p>
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {!isUserLoading && user && incident.due_date
                      ? moment(
                          formatDateTime(incident.due_date, user?.date_time)
                        ).format("ll")
                      : "Not Provided"}
                  </p>
                  <p>
                    <strong>Owner:</strong>{" "}
                    {incident?.created_by ?? "Not Provided"}
                  </p>
                </div>
              </div>
            ))}

            {/* Mobile Pagination */}
            {data?.incidents?.length > 0 && (
              <CustomPagination
                pagination={data?.pagination}
                setPageNumber={(pag: number) => setPage(pag - 1)}
                pageNumber={page + 1}
              />
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-fit w-full pt-6">
      <AddNewIncident
        mutate={mutate}
        onClose={() => setOpen(false)}
        open={open}
      />

      {/* Responsive Design - Show Cards on Mobile, Table on Desktop */}
      <div className="sm:hidden">
        <CustomToolbar
          mutate={mutate}
          setOpen={setOpen}
          setSearch={setSearch}
          setSeverityFilter={setSeverityFilter}
          search={search}
          severityFilter={severityFilter}
        />
        <MobileCardView />
      </div>
      <div className="hidden sm:block">
        <CustomTable<Incident>
          columns={[
            {
              field: "title",
              title: "Title",
              sortable: true,
              filterable: true,
              render: (row: Incident) => (
                <span className="font-medium capitalize">
                  {row?.title ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "severity",
              title: "Severity",
              sortable: true,
              filterable: true,
              render: (row: Incident) => (
                <span
                  className={`items-center justify-center text-wrap rounded-full px-4 py-1 font-medium capitalize ${
                    row?.severity === "high"
                      ? "bg-red-600 text-white"
                      : row?.severity === "medium"
                        ? "bg-orange-500 text-white"
                        : row?.severity === "low"
                          ? "bg-yellow-500 text-white"
                          : "bg-green-500 text-white"
                  } `}
                >
                  {row?.severity ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "status",
              title: "Status",
              sortable: true,
              filterable: true,
              render: (row: Incident) => (
                <span className="items-center justify-center text-wrap capitalize">
                  {row?.status ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "impact_scope",
              title: "Impact Scope",
              sortable: false,
              filterable: true,
              render: (row: Incident) => (
                <span className="items-center justify-center text-wrap capitalize">
                  {row?.impact_scope ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "created_by",
              title: "Owner",
              sortable: true,
              filterable: true,
              render: (row: Incident) => (
                <span className="text-nowrap">
                  {row?.created_by ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "due_date",
              title: "Due Date",
              sortable: true,
              filterable: true,
              render: (row: Incident) => (
                <span className="text-nowrap">
                  {!isUserLoading && user && row.due_date
                    ? moment(
                        formatDateTime(row.due_date, user?.date_time)
                      ).format("ll")
                    : "Not Provided"}
                </span>
              )
            },
            {
              field: "view",
              title: "View",
              sortable: false,
              filterable: false,
              render: (row: Incident) => (
                <div className="flex w-full items-center justify-center">
                  {currentAccess?.permission?.is_shown && (
                    <div className="w-fit">
                      <CustomButton
                        onClick={() =>
                          router?.push(
                            `/risk-management/incident/${row?.doc_id}?_name=${encodeURIComponent(
                              row?.title
                            )}`
                          )
                        }
                        disabled={!currentAccess?.permission?.actions?.read}
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
              field: "actions",
              title: "Actions",
              sortable: false,
              filterable: false,
              render: (row: Incident) => (
                <div className="flex w-full items-center justify-center">
                  {currentAccess?.buttons?.[2]?.permission?.is_shown && (
                    <div className="flex w-fit items-center gap-2">
                      <Tooltip title="Delete Incident" arrow placement="top">
                        <IconButton
                          onClick={() => {
                            if (
                              currentAccess?.buttons?.[2]?.permission?.actions
                                ?.delete
                            ) {
                              setItem(row);
                              handleDelete(row.doc_id);
                            } else {
                              toast.error(
                                "You do not have permission to delete this incident."
                              );
                            }
                          }}
                        >
                          {isLoading && row.doc_id === item?.doc_id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-4 border-tertiary-600 border-t-transparent"></div>
                          ) : (
                            currentAccess?.buttons?.[2]?.permission
                              ?.is_shown && (
                              <Trash2 size={18} className="text-red-500" />
                            )
                          )}
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}
                </div>
              )
            }
          ]}
          data={data?.incidents || []}
          isLoading={isValidating}
          page={page}
          pageSize={pageSize}
          totalCount={data?.pagination?.total_records}
          onPageChange={setPage}
          onRowsPerPageChange={setPageSize}
          customToolbar={
            <CustomToolbar
              mutate={mutate}
              setOpen={setOpen}
              setSearch={setSearch}
              setSeverityFilter={setSeverityFilter}
              search={search}
              severityFilter={severityFilter}
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
            pagination: true
          }}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default Incident;
