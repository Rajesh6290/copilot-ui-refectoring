"use client";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import RiskFilter from "./RiskFilter";
const getRiskLevelColor = (riskLevel: string | undefined) => {
  const riskLevelMap: Record<string, string> = {
    Low: "bg-green-500",
    low: "bg-green-500",
    Medium: "bg-amber-400",
    medium: "bg-amber-400",
    High: "bg-red-500",
    high: "bg-red-500"
  };
  return riskLevelMap[riskLevel || ""] || "bg-[#C4C4C4]";
};
interface Risk extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  risk_category: string;
  source: string;
  risk_type: string;
  end_user: string[];
  task_criticality: string[];
  application_type: string[];
  control_effectiveness: number;
  likelihood: string;
  impact: string;
  risk_level: string;
  risk_score: number;
  control_ids: string[];
  use_case_id: string;
  version: string;
  tags: string;
  created_at: string;
  updated_at: string;
  status: string;
  doc_id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  is_present_in_risk_register: boolean;
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

const RiskLibrary = ({ isAccess }: { isAccess: IsAccess }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterUrl, setFilterUrl] = useState("");
  const baseUrl = useMemo(
    () => `risks-common?page=${page + 1}&limit=${pageSize}`,
    [page, pageSize]
  );
  const finalUrl = useMemo(() => {
    if (filterUrl && filterUrl !== baseUrl) {
      const filterParams = filterUrl.replace(baseUrl, "").replace(/^&/, "");
      return filterParams ? `${baseUrl}&${filterParams}` : baseUrl;
    }
    return baseUrl;
  }, [baseUrl, filterUrl]);
  const { data, isValidating, mutate } = useSwr(finalUrl);
  const { mutation } = useMutation();
  const handleUrlChange = useCallback((newUrl: string) => {
    setFilterUrl(newUrl);
  }, []);
  const handleAdd = async (id: string) => {
    try {
      const res = await mutation(`risk-library/import?doc_id=${id}`, {
        method: "POST",
        isAlert: false
      });
      if (res?.status === 201) {
        toast.success("Risk added to register");
        mutate();
      } else {
        toast.error("Failed to add risk to register");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  return (
    <div className="flex h-fit w-full flex-col gap-5">
      <RiskFilter baseUrl={baseUrl} onUrlChange={handleUrlChange} />
      <div className="w-full">
        <CustomTable<Risk>
          columns={[
            {
              field: "scenarrio",
              title: "Risk",
              sortable: true,
              filterable: true,
              cellClassName: "w-fit",
              render: (row: Risk) => (
                <span className="flex w-fit items-center px-3 font-medium capitalize">
                  {row?.name ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "category",
              title: "Category",
              sortable: true,
              filterable: true,
              render: (row: Risk) => (
                <span className="flex items-center justify-center text-left capitalize">
                  {row?.risk_category ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "source",
              title: "Source",
              sortable: true,
              filterable: true,
              render: (row: Risk) => (
                <span className="flex items-center justify-center text-left capitalize">
                  {row?.source?.replace(/_/g, " ") ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "risk_score",
              title: "Risk Score",
              sortable: true,
              filterable: true,
              render: (row: Risk) => (
                <span className="flex items-center justify-center capitalize">
                  {row?.risk_score ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "risk_level",
              title: "Risk Level",
              sortable: true,
              filterable: true,
              cellClassName: " relative w-fit  whitespace-nowrap ",
              render: (row: Risk) => (
                <span
                  className={`absolute left-0 top-0 flex size-full items-center justify-center whitespace-nowrap text-nowrap text-center capitalize text-white ${getRiskLevelColor(row?.risk_level)}`}
                >
                  {row?.risk_level || "Not Available"}
                </span>
              )
            }
          ]}
          data={data?.data || []}
          actions={[
            {
              icon: (row: Risk) => (
                <div
                  className={`rounded border px-4 py-2 font-semibold ${
                    row["is_in_risk_collection"] ||
                    !isAccess?.buttons[0]?.permission?.actions.read
                      ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      : "text-gray-700 dark:text-white"
                  }`}
                >
                  {row?.is_present_in_risk_register ? "Already Added" : "Add"}
                </div>
              ),
              onClick: (row: Risk) => {
                if (!row?.is_present_in_risk_register) {
                  if (isAccess?.buttons[0]?.permission?.actions.create) {
                    handleAdd(row?.doc_id);
                  } else {
                    toast.error(
                      "You don't have permission to perform this action"
                    );
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
          // customToolbar={
          //   <CustomToolBar
          //     setCategory={setCategory}
          //     category={category}
          //     setQuery={setQuery}
          //     query={query}
          //   />
          // }
          localization={{
            header: {
              actions: "Add to Register"
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
    </div>
  );
};

export default RiskLibrary;
