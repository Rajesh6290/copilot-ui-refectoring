"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { CircularProgress } from "@mui/material";
import { Edit2, Plus, Trash2 } from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
const UpdateRiskScenario = dynamic(() => import("./UpdateScenario"), {
  ssr: false
});
const RiskScenarioDetails = dynamic(() => import("./RiskScerarioDetails"), {
  ssr: false
});
const AddNewScenario = dynamic(() => import("./AddNewScenario"), {
  ssr: false
});

interface AuditTrailEntry {
  action: string;
  status: string;
  action_by: string;
  action_at: string;
  ip: string;
}

export interface Risk extends Record<string, unknown> {
  tenant_id: string;
  client_id: string;
  doc_id: string;
  id: string;
  risk_source: string | null;
  name: string;
  version: string;
  risk_owner: string;
  description: string;
  risk_category: string | null;
  risk_type: string;
  domain_mit_taxonomy: string | null;
  subdomain_mit_taxonomy: string | null;
  type: string | null;
  root_cause_mit_taxonomy: string | null;
  eu_ai_risk_level: string | null;
  nist_ai_category: string | null;
  detection_and_monitoring: string | null;
  business_impact_level: string | null;
  business_impact_description: string | null;
  likelihood: string;
  impact: string;
  risk_level: string;
  risk_score: number;
  mitigation_strategy: string;
  control_ids: string[];
  control_effectiveness: number;
  framework_risk_category: string | null;
  frameworks: string | null;
  use_case_id: string | null;
  indicator_ids: string[];
  application_ids: string[];
  incident_ids: string[];
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  source: string;
  readiness_status: string;
  audit_trail: AuditTrailEntry[];
  application_name: string[];
  notes: string;
}

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
const CustomToolBar = ({
  setQuery,
  mutate
}: {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  mutate: () => void;
}) => {
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const handleSearchData = (value: string) => {
    setDebouncedQuery(value);
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      setQuery(debouncedQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedQuery, setQuery]);
  return (
    <div className="flex w-full flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
      <AddNewScenario
        isOpen={open}
        onClose={() => setOpen(!open)}
        mutate={mutate}
      />

      <div className="flex w-full items-center justify-between gap-5">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <svg
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            value={debouncedQuery}
            onChange={(e) => handleSearchData(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2 ps-10 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-darkMainBackground dark:text-white dark:placeholder-gray-400 xl:w-1/4"
            placeholder="Search Mockups, Logos..."
            required
          />
        </div>
        <div className="w-fit">
          <CustomButton
            onClick={() => setOpen(true)}
            className="!lg:text-base w-fit text-nowrap !text-sm"
            startIcon={<Plus className="h-4 w-4" />}
          >
            ADD NEW RISK
          </CustomButton>
        </div>
      </div>
    </div>
  );
};
const RiskScenario = ({ isAccess }: { isAccess: IsAccess }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState<string>("");
  const [update, setUpdate] = useState<boolean>(false);
  const [updateItem, setUpdateItem] = useState<Risk | null>(null);
  let url = `risks?page=${page + 1}&limit=${pageSize}&source=custom`;
  if (query?.length > 0) {
    url += `&keywords=${query}`;
  }
  const { data, isValidating, mutate } = useSwr(url);
  const { isLoading, mutation } = useMutation();
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState<string>("");
  const handleAdd = async (id: string) => {
    try {
      const res = await mutation(
        `risks/senario/import?doc_id=${id}&status=active`,
        {
          method: "POST",
          isAlert: false
        }
      );
      if (res?.status === 201 || res?.status === 200) {
        toast.success("Risk added to register");
        mutate();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleDeleteRiskScenario = (riskId: string) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await mutation(`risk?doc_id=${riskId}`, {
            method: "DELETE",
            isAlert: false
          });
          if (res?.status === 200) {
            mutate();
            setUpdateItem(null);
            toast.success("Risk Scenario deleted successfully");
          }
        }
      });
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };
  return (
    <div className="w-full">
      <UpdateRiskScenario
        isOpen={update}
        onClose={() => setUpdate(!update)}
        mutate={mutate}
        data={updateItem}
      />
      <RiskScenarioDetails
        onClose={() => {
          setViewOpen(!viewOpen);
          setSelectedRiskId("");
        }}
        open={viewOpen}
        riskId={selectedRiskId}
      />
      <CustomTable<Risk>
        columns={[
          {
            field: "risk_name",
            title: "Risk Name",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="font-medium capitalize">
                {row?.name ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "description",
            title: "description",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="capitalize">
                {row?.description ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "impact",
            title: "Impact",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="capitalize">
                {row?.impact ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "created_at",
            title: "created_at",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="capitalize">
                {moment(row?.created_at).format("ll") ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "add_to_risk_register",
            title: "Add to Risk",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <div className="flex items-center justify-center">
                <div
                  tabIndex={0}
                  role="button"
                  onClick={() => {
                    if (row?.status !== "active") {
                      if (isAccess?.buttons[0]?.permission?.actions.create) {
                        setUpdateItem(row);
                        handleAdd(row?.doc_id);
                      } else {
                        toast.error("You don't have permission to add risk");
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (row?.status !== "active") {
                        if (isAccess?.buttons[0]?.permission?.actions.create) {
                          setUpdateItem(row);
                          handleAdd(row?.doc_id);
                        } else {
                          toast.error("You don't have permission to add risk");
                        }
                      }
                    }
                  }}
                  className={`w-fit text-nowrap rounded border px-4 py-2 font-semibold ${
                    row?.status === "active" ||
                    !isAccess?.buttons?.[0]?.permission?.is_shown
                      ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      : "cursor-pointer text-gray-700 dark:text-white"
                  }`}
                >
                  {isLoading && row?.doc_id === updateItem?.doc_id ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : row?.status === "active" ? (
                    "Already Added"
                  ) : (
                    "Add"
                  )}
                </div>
              </div>
            )
          },
          {
            field: "linked_controls",
            title: "Linked Controls",
            sortable: true,
            filterable: true,
            render: (_row: Risk) => (
              <div className="flex w-full items-center justify-center gap-2">
                <div className="w-fit">
                  <CustomButton className="!text-nowrap !text-[0.7rem]">
                    Add New
                  </CustomButton>
                </div>
                <div className="w-fit">
                  <CustomButton className="!text-nowrap !text-[0.7rem]">
                    Exsting
                  </CustomButton>
                </div>
              </div>
            )
          },
          {
            field: "view",
            title: "View",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <div className="flex w-full items-center justify-center">
                {isAccess?.permission?.is_shown && (
                  <div className="w-fit">
                    <CustomButton
                      onClick={() => {
                        setSelectedRiskId(row?.doc_id);
                        setViewOpen(!viewOpen);
                      }}
                      disabled={!isAccess?.permission?.actions.read}
                      className="!text-[0.7rem]"
                    >
                      View
                    </CustomButton>
                  </div>
                )}
              </div>
            )
          }
        ]}
        data={data?.risks || []}
        actions={[
          {
            icon: isAccess?.buttons?.[1]?.permission?.is_shown ? (
              <Edit2 className="h-5 w-5 text-green-600" />
            ) : (
              <></>
            ),
            tooltip: "Edit",
            onClick: (row: Risk) => {
              if (isAccess?.buttons[1]?.permission?.actions.update) {
                setUpdateItem(row);
                setUpdate(!update);
              } else {
                toast.error("You don't have permission to update risk");
              }
            }
          },
          {
            icon: (row: Risk) =>
              isLoading && row?.doc_id === updateItem?.doc_id ? (
                <CircularProgress size={16} color="inherit" />
              ) : isAccess?.buttons?.[2]?.permission?.is_shown ? (
                <Trash2 className="ml-2 h-5 w-5 text-red-600" />
              ) : null,
            tooltip: "Remove",
            onClick: (row: Risk) => {
              if (!isLoading && row?.doc_id !== updateItem?.doc_id) {
                if (isAccess?.buttons[2]?.permission?.actions.delete) {
                  setUpdateItem(row);
                  handleDeleteRiskScenario(row?.doc_id);
                } else {
                  toast.error("You don't have permission to delete risk");
                }
              }
            }
          }
        ]}
        isLoading={isValidating}
        page={page}
        pageSize={pageSize}
        totalCount={data?.pagination?.total_records}
        onPageChange={setPage}
        onRowsPerPageChange={setPageSize}
        title=""
        selection={false}
        filtering={false}
        customToolbar={
          <CustomToolBar setQuery={setQuery} query={query} mutate={mutate} />
        }
        localization={{
          header: {
            actions: "Actions"
          }
        }}
        options={{
          toolbar: false,
          search: false,
          filtering: false,
          sorting: false,
          pagination: true
        }}
        className="flex-1"
      />
    </div>
  );
};

export default RiskScenario;
