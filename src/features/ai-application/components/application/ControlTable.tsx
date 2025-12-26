"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useSwr from "@/shared/hooks/useSwr";
import { Activity, HeartPulse } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { Dispatch, SetStateAction, useState } from "react";
export interface Application {
  label: string;
  value: string;
}

export interface Control extends Record<string, unknown> {
  id: string;
  name: string;
  common_name: string;
  description: string;
  category: string;
  sub_type: string;
  control_type: string;
  severity_level: string;
  enforcement_type: string;
  applicability: string;
  control_lifecycle_stage: string[];
  effectiveness_metrics: string[];
  evidence_required: string[];
  health_status: string;
  implementation_status: string;
  readiness_status: string;
  scope: string;
  tags: string[];
  risk_ids: string[];
  indicator_ids: string[];
  requirement_ids: string[];
  version: string;
  sensitivity: string;
  policy_ids: string[];
  incident_ids: string[];
  test_id: string[];
  last_test_run_id: string[];
  application_ids: string[];
  evidence_ids: string[];
  created_at: string;
  updated_at: string;
  compliance_status: string;
  obligation_common_ids: string[];
  action_ids: string[];
  action_id: string[];
  doc_id: string;
  original_control_id: string;
  tenant_id: string;
  client_id: string;
  obligation_ids: string[];
  applications: Application[];
}

const getStatusStyles = (status: string): string => {
  const styles: { [key: string]: string } = {
    completed:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:border-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400",
    not_started:
      "bg-tertiary-50 text-tertiary-700 border-tertiary-200 dark:border-tertiary-600/20 dark:bg-tertiary-900/30 dark:text-tertiary-400",
    in_progress:
      "bg-amber-50 text-amber-700 border-amber-200 dark:border-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400",
    effective:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:border-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400",
    not_tested:
      "bg-slate-50 text-slate-700 border-slate-200 dark:border-slate-600/20 dark:bg-slate-900/30 dark:text-slate-400",
    ineffective:
      "bg-red-50 text-red-700 border-red-200 dark:border-red-600/20 dark:bg-red-900/30 dark:text-red-400",
    complete:
      "bg-green-50 text-green-700 border-green-200 dark:border-green-600/20 dark:bg-green-900/30 dark:text-green-400",
    ready:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:border-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400",
    not_ready:
      "bg-orange-50 text-orange-700 border-orange-200 dark:border-orange-600/20 dark:bg-orange-900/30 dark:text-orange-400",
    not_compliant:
      "bg-red-50 text-red-700 border-red-200 dark:border-red-600/20 dark:bg-red-900/30 dark:text-red-400",
    compliant:
      "bg-green-50 text-green-700 border-green-200 dark:border-green-600/20 dark:bg-green-900/30 dark:text-green-400",
    in_scope:
      "bg-blue-50 text-blue-700 border-blue-200 dark:border-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400",
    out_of_scope:
      "bg-gray-50 text-gray-700 border-gray-200 dark:border-gray-600/20 dark:bg-gray-900/30 dark:text-gray-400"
  };
  return (
    styles[status] ||
    "bg-gray-50 text-gray-700 border-gray-200 dark:border-gray-600/20 dark:bg-gray-800/50 dark:text-gray-400"
  );
};

const StatusBadge = ({
  status,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  icon: Icon
}: {
  status: string;
  icon: React.ComponentType<{ className: string }>;
  type?: string;
}) => (
  <div className="flex flex-col gap-1">
    <span
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium capitalize ${getStatusStyles(status)}`}
    >
      <Icon className="h-4 w-4" />
      {status.replace(/_/g, " ")}
    </span>
  </div>
);

const ControlTable = ({
  applicationId
}: {
  setControlId: Dispatch<SetStateAction<string>>;
  applicationId: string;
}) => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data, isValidating } = useSwr(
    `controls?page=${page + 1}&limit=${pageSize}&application_id=${applicationId}`
  );
  return (
    <CustomTable<Control>
      columns={[
        {
          field: "control_id",
          title: "Control ID",
          sortable: true,
          filterable: true,
          render: (row: Control) => (
            <span className="text-nowrap px-3 font-medium capitalize">
              {row?.id ?? "Not Provided"}
            </span>
          )
        },
        {
          field: "control_name",
          title: "Control Name",
          sortable: true,
          filterable: true,
          render: (row: Control) => (
            <span className="text-nowrap capitalize">
              {row?.name ?? "Not Provided"}
            </span>
          )
        },
        {
          field: "description",
          title: "Description",
          sortable: true,
          filterable: true,
          cellClassName: "w-[20rem]",
          render: (row: Control) => (
            <span className="flex w-[20rem] items-center justify-start text-left capitalize">
              {row?.description ?? "Not Provided"}
            </span>
          )
        },
        {
          field: "implementation",
          title: "Implementation",
          sortable: true,
          render: (row: Control) =>
            row?.implementation_status ? (
              <StatusBadge
                status={row?.implementation_status}
                icon={Activity}
                type="implementation"
              />
            ) : (
              <span className="text-nowrap capitalize">{"Not Provided"}</span>
            )
        },
        {
          field: "readiness_status",
          title: "Readiness Status",
          sortable: true,
          render: (row: Control) => {
            const status = row?.readiness_status;
            return status ? (
              <StatusBadge status={status} icon={HeartPulse} />
            ) : (
              <span className="text-nowrap text-gray-500 dark:text-gray-400">
                Not Provided
              </span>
            );
          }
        }
      ]}
      actions={[
        {
          icon: (row: Control) => (
            <div className="flex w-full items-center justify-center">
              <div className="w-fit">
                <CustomButton
                  onClick={() =>
                    router.push(`/controls/${row?.doc_id}?_name=${row?.name}`)
                  }
                  className="w-fit !text-[0.7rem] !uppercase"
                >
                  VIEW
                </CustomButton>
              </div>
            </div>
          ),
          tooltip: "View",
          onClick: (_row: Control) => {}
        }
      ]}
      data={data?.controls || []}
      isLoading={isValidating}
      page={page}
      pageSize={pageSize}
      totalCount={data?.pagination?.total_records}
      onPageChange={setPage}
      onRowsPerPageChange={setPageSize}
      title="All Controls"
      selection={false}
      filtering={false}
      localization={{
        header: {
          actions: "Details"
        }
      }}
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
  );
};
export default ControlTable;
