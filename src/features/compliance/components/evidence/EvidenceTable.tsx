"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useSwr from "@/shared/hooks/useSwr";
import { AttachFile } from "@mui/icons-material";
import BackupOutlinedIcon from "@mui/icons-material/BackupOutlined";
import { Chip } from "@mui/material";
import moment from "moment";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
const AddEvidenece = dynamic(() => import("./AddEvidenece"), {
  ssr: false
});
const AttachedEvidence = dynamic(() => import("./AttachEvidence"), {
  ssr: false
});
const UploadNewVersion = dynamic(() => import("./UploadNewVersion"), {
  ssr: false
});
const VersionsPanel = dynamic(() => import("./VersionsPanel"), {
  ssr: false
});
const ViewEvidenece = dynamic(() => import("./ViewEvidence"), {
  ssr: false
});

interface CustomToolBarProps {
  onAddClick: () => void;
  isAccess: ISAccess;
  search: string;
  setSearch: (val: string) => void;
  setAttachOpen: (open: boolean) => void;
}

interface AuditTrailItem {
  action: string;
  status: string;
  reviewed_by: string;
  reviewed_at: string;
  comments: string;
  ip: string;
}

export interface VersionItem extends Record<string, unknown> {
  doc_id: string;
  version: string;
  description: string;
  evidence_status: string;
  created_at: string;
  updated_at: string;
  uploaded: boolean;
  is_file: boolean;
  file_names: string[];
  reviewed_by: string;
  reviewed_at: string;
  comment: string;
  audit_trail: AuditTrailItem[];
  collected_by: string;
  collected_on: string;
  download_urls?: string[];
  sensitivity?: string;
  files: {
    file_name: string;
    download_url: string;
    file_type: string;
  }[];
  recurrence:
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "semi-annually"
    | "annually"
    | "one-time"
    | "yearly"
    | "never";
}

export interface TableRow extends Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  evidence_name: string;
  control_id: string;
  total_versions: number;
  latest_version: string;
  evidence_status: string;
  versions: VersionItem[];
  latest_version_info: VersionItem;
  latest_doc_id: string;
  requires_approval: boolean;
  [key: string]: unknown;
}
const CustomToolBar: React.FC<CustomToolBarProps> = ({
  onAddClick,
  isAccess,
  search,
  setSearch,
  setAttachOpen
}) => {
  return (
    <div className="flex w-full items-center justify-between gap-4 px-4 py-3">
      <div className="relative w-1/2">
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
          className="block w-full rounded-lg border border-gray-300 bg-white p-2 ps-10 text-sm text-gray-900 outline-none focus:border-tertiary-500 focus:ring-tertiary-500 dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white dark:placeholder-gray-400"
          placeholder="Search evidence..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex w-1/2 items-center justify-end">
        <div className="flex items-center gap-5">
          {isAccess?.buttons?.[3]?.permission?.is_shown && (
            <div className="w-fit">
              <CustomButton
                startIcon={<AttachFile />}
                onClick={() => setAttachOpen(true)}
                disabled={!isAccess?.buttons?.[3]?.permission?.actions?.read}
              >
                Attach Evidence
              </CustomButton>
            </div>
          )}

          {isAccess?.buttons?.[0]?.permission?.is_shown && (
            <div className="w-fit">
              <CustomButton
                className="!text-nowrap !bg-tertiary"
                startIcon={<BackupOutlinedIcon />}
                onClick={onAddClick}
                disabled={!isAccess?.buttons?.[0]?.permission?.actions?.create}
              >
                Add New Evidence
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export interface ISAccess {
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

// Main Evidence Table Component
const EvidenceTable = ({
  controlId,
  baseMutate,
  isAccess
}: {
  controlId: string;
  baseMutate: () => void;
  isAccess: ISAccess;
}) => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState<VersionItem | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [uploadVersionOpen, setUploadVersionOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<TableRow | null>(
    null
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [attachOpen, setAttachOpen] = useState(false);
  let url = `evidences?page=${page + 1}&limit=${pageSize}&control_id=${controlId}&group_by_name=true`;
  if (debouncedSearch) {
    url += `&keywords=${encodeURIComponent(debouncedSearch)}`;
  }
  const { data, isValidating, mutate } = useSwr(url);

  const handleClickOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

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

  const handleUploadNewVersion = (row: TableRow) => {
    setSelectedEvidence(row);
    setUploadVersionOpen(true);
  };

  return (
    <>
      <AddEvidenece
        controlId={controlId}
        mutate={mutate}
        onClose={() => setOpen(!open)}
        open={open}
        baseMutate={baseMutate}
      />
      <AttachedEvidence
        open={attachOpen}
        controlId={controlId}
        onClose={() => setAttachOpen(false)}
        mutate={mutate}
        isAccess={isAccess}
      />
      {viewData && (
        <ViewEvidenece
          data={viewData}
          isOpen={viewOpen}
          onClose={() => {
            setViewOpen(false);
            setViewData(null);
          }}
          mutate={mutate}
          baseMutate={baseMutate}
          isAccess={isAccess}
          controlId={controlId}
        />
      )}
      <UploadNewVersion
        open={uploadVersionOpen}
        onClose={() => {
          setUploadVersionOpen(false);
          setSelectedEvidence(null);
        }}
        parentEvidence={selectedEvidence as TableRow}
        controlId={controlId}
        mutate={mutate}
        baseMutate={baseMutate}
      />
      <CustomTable<TableRow>
        columns={[
          {
            field: "evidence_name",
            title: "Evidence Name",
            sortable: true,
            filterable: true,
            render: (row: TableRow) => (
              <div className="flex flex-col">
                <span className="text-nowrap font-medium capitalize">
                  {row?.evidence_name ?? "Not Provided"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {row?.total_versions} version(s)
                </span>
              </div>
            )
          },
          {
            field: "latest_version",
            title: "Latest Version",
            sortable: true,
            filterable: true,
            render: (row: TableRow) => (
              <span className="font-mono font-medium">
                v{row?.latest_version ?? "N/A"}
              </span>
            )
          },
          {
            field: "collected_on",
            title: "Collected On",
            sortable: true,
            filterable: true,
            render: (row: TableRow) => (
              <span className="capitalize">
                {moment(row?.latest_version_info?.collected_on).format("ll") ??
                  "Not Provided"}
              </span>
            )
          },
          {
            field: "evidence_status",
            title: "Status",
            sortable: true,
            filterable: true,
            render: (row: TableRow) => (
              <div className="flex flex-col items-center space-y-1 capitalize">
                <Chip
                  label={row?.evidence_status || "Unknown"}
                  color={getStatusColor(row?.evidence_status || "")}
                  size="small"
                  variant="filled"
                />
              </div>
            )
          },
          {
            field: "collected_by",
            title: "Collected By",
            sortable: true,
            filterable: true,
            render: (row: TableRow) => (
              <span className="text-nowrap capitalize">
                {row?.latest_version_info?.collected_by ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "reviewed_at",
            title: "Last Reviewed",
            sortable: true,
            filterable: true,
            render: (row: TableRow) => (
              <div className="flex flex-col">
                <span className="text-sm">
                  {row?.latest_version_info?.reviewed_at
                    ? moment(row.latest_version_info.reviewed_at).format(
                        "MMM DD, YYYY"
                      )
                    : "Not Reviewed"}
                </span>
                {row?.latest_version_info?.reviewed_at && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {moment(row.latest_version_info.reviewed_at).format("lll")}
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
            render: (row: TableRow) => (
              <div className="flex w-full items-center justify-center space-x-2">
                {isAccess?.buttons?.[0]?.permission?.is_shown && (
                  <div className="w-fit">
                    <CustomButton
                      onClick={() => handleUploadNewVersion(row)}
                      disabled={
                        !isAccess?.buttons?.[0]?.permission?.actions?.create
                      }
                      className="w-fit !text-nowrap !text-[0.6rem] !uppercase"
                    >
                      Add New Version
                    </CustomButton>
                  </div>
                )}
              </div>
            )
          },
          {
            field: "view",
            title: "Version Details",
            sortable: false,
            filterable: false,
            render: (_row: TableRow) => (
              <div className="flex w-full items-center justify-center space-x-2">
                {isAccess?.buttons?.[0]?.permission?.is_shown && (
                  <div className="w-fit">
                    <CustomButton
                      disabled={
                        !isAccess?.buttons?.[0]?.permission?.actions?.create
                      }
                      className="w-fit !text-nowrap !text-[0.6rem] !uppercase"
                    >
                      view
                    </CustomButton>
                  </div>
                )}
              </div>
            )
          }
        ]}
        data={data?.evidences || []}
        isLoading={isValidating}
        page={page}
        pageSize={pageSize}
        totalCount={data?.pagination?.total_records}
        onPageChange={setPage}
        onRowsPerPageChange={setPageSize}
        title=""
        selection={true}
        filtering={false}
        customToolbar={
          <CustomToolBar
            onAddClick={handleClickOpen}
            isAccess={isAccess}
            search={search}
            setSearch={setSearch}
            setAttachOpen={setAttachOpen}
          />
        }
        detailPanel={(row: TableRow) => (
          <VersionsPanel
            row={row}
            isAccess={isAccess}
            setViewData={setViewData}
            setViewOpen={setViewOpen}
          />
        )}
        options={{
          toolbar: false,
          search: false,
          filtering: false,
          sorting: true,
          pagination: true,
          detailPanel: true,
          detailPanelPosition: "right",
          detailPanelHeader: ""
        }}
        localization={{
          body: {
            emptyDataSourceMessage:
              "Evidence is required to satisfy this control."
          }
        }}
        className="flex-1"
      />
    </>
  );
};

export default EvidenceTable;
