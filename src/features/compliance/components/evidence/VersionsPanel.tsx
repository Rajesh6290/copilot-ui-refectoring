import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import { Chip } from "@mui/material";
import moment from "moment";
import dynamic from "next/dynamic";
import { ISAccess, TableRow, VersionItem } from "./EvidenceTable";
const AuditTrailPanel = dynamic(() => import("./AuditTrailPanel"), {
  ssr: false
});
const VersionsPanel: React.FC<{
  row: TableRow;
  isAccess: ISAccess;
  setViewData: (data: VersionItem) => void;
  setViewOpen: (open: boolean) => void;
}> = ({ row, isAccess, setViewData, setViewOpen }) => {
  const versions = row.versions || [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="rounded-lg bg-gray-50 p-4 dark:bg-darkMainBackground">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Version History: {row.evidence_name}
        </h3>
      </div>

      <CustomTable<VersionItem>
        columns={[
          {
            field: "version",
            title: "Version",
            sortable: true,
            filterable: true,
            render: (versionRow: VersionItem) => (
              <span className="font-mono font-medium">
                v{versionRow.version}
              </span>
            )
          },
          {
            field: "description",
            title: "Description",
            sortable: true,
            filterable: true,
            render: (versionRow: VersionItem) => (
              <span className="capitalize">
                {versionRow.description || "Not Provided"}
              </span>
            )
          },
          {
            field: "collected_on",
            title: "Created On",
            sortable: true,
            filterable: true,
            render: (versionRow: VersionItem) => (
              <span>
                {moment(versionRow.created_at).format("MMM DD, YYYY HH:mm")}
              </span>
            )
          },
          {
            field: "evidence_status",
            title: "Status",
            sortable: true,
            filterable: true,
            render: (versionRow: VersionItem) => (
              <Chip
                label={versionRow.evidence_status || "Unknown"}
                color={getStatusColor(versionRow.evidence_status || "")}
                size="small"
                variant="filled"
                className="!capitalize"
              />
            )
          },
          {
            field: "collected_by",
            title: "Collected By",
            sortable: true,
            filterable: true,
            render: (versionRow: VersionItem) => (
              <span className="capitalize">
                {versionRow.collected_by ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "reviewed_at",
            title: "Last Reviewed",
            sortable: true,
            filterable: true,
            render: (versionRow: VersionItem) => (
              <div className="flex flex-col">
                <span className="text-sm">
                  {versionRow.reviewed_at
                    ? moment(versionRow.reviewed_at).format("MMM DD, YYYY")
                    : "Not Reviewed"}
                </span>
                {versionRow.reviewed_at && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {moment(versionRow.reviewed_at).format("HH:mm")}
                  </span>
                )}
              </div>
            )
          },
          {
            field: "actions",
            title: "Actions",
            sortable: false,
            filterable: false,
            render: (versionRow: VersionItem) => (
              <div className="flex w-full items-center justify-center space-x-2">
                {isAccess?.permission?.is_shown && (
                  <div className="w-fit">
                    <CustomButton
                      onClick={() => {
                        setViewData(versionRow || {});
                        setViewOpen(true);
                      }}
                      className="w-fit !text-[0.6rem] !uppercase"
                      disabled={!isAccess?.permission?.actions?.read}
                    >
                      VIEW
                    </CustomButton>
                  </div>
                )}
              </div>
            )
          },
          {
            field: "audit_trail",
            title: "Trail Entries",
            sortable: false,
            filterable: false,
            render: (versionRow: VersionItem) => (
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {versionRow?.audit_trail?.length || 0} entries
                </span>
              </div>
            )
          }
        ]}
        data={versions}
        isLoading={false}
        page={0}
        pageSize={versions.length}
        totalCount={versions.length}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
        title=""
        selection={false}
        filtering={false}
        detailPanel={(versionRow: VersionItem) => (
          <AuditTrailPanel row={versionRow} />
        )}
        options={{
          toolbar: false,
          search: false,
          filtering: false,
          sorting: true,
          pagination: false,
          detailPanel: true,
          detailPanelPosition: "right",
          detailPanelHeader: "Audit Trail",
          tableColor: "bg-blue-500"
        }}
        className="flex-1"
      />
    </div>
  );
};
export default VersionsPanel;
