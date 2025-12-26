"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import { useRouter } from "nextjs-toploader/app";
interface IsAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        update: boolean;
        delete: boolean;
        read: boolean;
      };
    };
  }[];
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      update: boolean;
      delete: boolean;
      read: boolean;
    };
  };
}
interface Risk extends Record<string, unknown> {
  id: string;
  name: string;
  common_name: string;
  description: string;

  risk_category: string;
  source: string;
  risk_type: string;

  end_user: string[];
  task_criticality: string[];
  application_type: string[];

  connectors: string[];
  asset_category: string;

  framework_reference: string[];
  reference: Record<string, unknown>;

  control_effectiveness: number;

  likelihood: string;
  impact: string;
  risk_level: string;
  risk_score: number;

  control_ids: string[];
  indicator_ids: string[];

  use_case_id: string;
  application_ids: string[];

  readiness_status: string;

  version: string;
  risk_owner: string;
  tags: string;

  created_at: string;
  updated_at: string;

  status: string;

  control_doc_ids: string[];
  doc_id: string;
  original_risk_id: string;

  tenant_id: string;
  client_id: string;

  application_name: string[];
}

interface RiskTableData {
  risks: Risk[];
  pagination: {
    total_records: number;
  };
}
const getLikelihoodColor = (likelihood: string | undefined) => {
  switch (likelihood) {
    case "Very Unlikely":
      return "bg-green-500";
    case "Unlikely":
      return "bg-green-300";
    case "Somewhat Likely":
      return "bg-amber-500";
    case "Likely":
      return "bg-red-300";
    case "Very Likely":
      return "bg-red-500";
    default:
      return "bg-gray-300"; // Default color if likelihood is missing
  }
};
const getImpactColor = (impact: string | undefined) => {
  switch (impact) {
    case "Very Low":
      return "bg-green-500";
    case "Low":
      return "bg-green-300";
    case "Medium":
      return "bg-amber-500";
    case "High":
      return "bg-red-300";
    case "Very High":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
};
const getRiskLevelColor = (riskLevel: string | undefined) => {
  const riskLevelMap: Record<string, string> = {
    Low: "bg-green-500", // Low Risk - Green
    low: "bg-green-500", // High Risk - Red
    Medium: "bg-amber-400", // Medium Risk - Amber
    medium: "bg-amber-400", // Medium Risk - Amber
    High: "bg-red-500", // High Risk - Red
    high: "bg-red-500" // High Risk - Red
  };
  return riskLevelMap[riskLevel || ""] || "bg-[#C4C4C4]"; // Default color
};

const RiskTable = ({
  data,
  page,
  pageSize,
  setPage,
  setPageSize,
  isValidating,
  isAccess
}: {
  data: RiskTableData;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  isValidating: boolean;
  isAccess: IsAccess;
}) => {
  const router = useRouter();
  return (
    <div className="w-full">
      <CustomTable<Risk>
        columns={[
          {
            field: "risk_id",
            title: "Risk ID",
            sortable: true,
            filterable: true,
            cellClassName: "w-[20rem]",
            render: (row: Risk) => (
              <span className="text-nowrap text-left font-medium capitalize">
                {row?.id ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "name",
            title: "Name",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="text-nowrap capitalize">
                {row?.name ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "category",
            title: "Risk Category",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="text-nowrap capitalize">
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
              <span className="text-nowrap capitalize">
                {row?.source ?? "Not Provided"}
              </span>
            )
          },
          ...(isAccess?.buttons?.[0]?.permission?.is_shown
            ? [
                {
                  field: "details",
                  title: "Details",
                  sortable: true,
                  filterable: true,
                  render: (row: Risk) => (
                    <div className="flex w-full items-center justify-center">
                      <div className="w-fit">
                        <CustomButton
                          onClick={() =>
                            router.push(
                              `/risk-management?Risk-Tab=risk+register&riskId=${row?.doc_id}`
                            )
                          }
                          disabled={
                            !isAccess?.buttons?.[0]?.permission?.actions?.read
                          }
                          className="w-fit !text-[0.6rem] !uppercase"
                        >
                          VIEW
                        </CustomButton>
                      </div>
                    </div>
                  )
                }
              ]
            : []),
          {
            field: "risk_score",
            title: "Risk Score",
            sortable: true,
            filterable: true,
            render: (row: Risk) => (
              <span className="text-nowrap capitalize">
                {row?.risk_score ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "probability",
            title: "Probability",
            sortable: true,
            cellClassName: " relative w-[30rem]  whitespace-nowrap ",
            render: (row: Risk) => (
              <span
                className={`absolute left-0 top-0 flex h-full w-full items-center justify-center whitespace-nowrap text-nowrap text-center capitalize text-white ${getLikelihoodColor(row?.likelihood)}`}
              >
                {row?.likelihood || "Not Provided"}
              </span>
            )
          },
          {
            field: "impact",
            title: "Impact",
            sortable: true,
            cellClassName: " relative w-[30rem]  whitespace-nowrap ",
            render: (row: Risk) => (
              <span
                className={`absolute left-0 top-0 flex h-full w-full items-center justify-center whitespace-nowrap text-nowrap text-center capitalize text-white ${getImpactColor(row?.impact)}`}
              >
                {row?.impact || "Not Provided"}
              </span>
            )
          },
          {
            field: "risk_level",
            title: "Risk Level",
            sortable: true,
            cellClassName: " relative w-[30rem]  whitespace-nowrap ",
            render: (row: Risk) => (
              <span
                className={`absolute left-0 top-0 flex h-full w-full items-center justify-center whitespace-nowrap text-nowrap text-center capitalize text-white ${getRiskLevelColor(row?.risk_level)}`}
              >
                {row?.risk_level || "Not Available"}
              </span>
            )
          }
        ]}
        data={(data["risks"] as Risk[]) || []}
        // actions={[
        //   {
        //     icon: <Trash2 className="h-5 w-5 text-red-600" />,
        //     tooltip: "Remove",
        //     onClick: (row: any) => {},
        //   },
        // ]}
        isLoading={isValidating}
        page={page}
        pageSize={pageSize}
        totalCount={data?.["pagination"]?.total_records}
        onPageChange={setPage}
        onRowsPerPageChange={setPageSize}
        title="All Risks"
        selection={true}
        filtering={false}
        options={{
          toolbar: false, // Since we have custom toolbar
          search: false,
          filtering: true,
          sorting: true,
          pagination: true
        }}
        className="flex-1"
        localization={{
          header: {
            actions: ""
          }
        }}
      />
    </div>
  );
};
export default RiskTable;
