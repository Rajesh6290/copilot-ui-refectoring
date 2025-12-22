"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useSwr from "@/shared/hooks/useSwr";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  PlayCircle,
  XCircle
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import dynamic from "next/dynamic";
const HistoryRunDetails = dynamic(() => import("./HistoryRunDetails"), {
  ssr: false
});

interface TestRun extends Record<string, unknown> {
  test_run_id: string;
  test_id: string;
  result_id: string;
  status: "completed" | "failed" | "error" | "running";
  started_at: string;
  ended_at: string | null;
}

const TestHistory = ({ testId }: { testId: string }) => {
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [historyRunDetailsOpen, setHistoryRunDetailsOpen] =
    useState<boolean>(false);
  const [selectedResultId, setSelectedResultId] = useState<string>("");
  const { data, isValidating } = useSwr(
    testId
      ? `tests/runs/list?test_id=${testId}&page=${page + 1}&limit=${pageSize}`
      : null
  );

  // Helper functions
  const getStatusIcon = (status: TestRun["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "failed":
        return <XCircle className="h-3 w-3" />;
      case "error":
        return <AlertCircle className="h-3 w-3" />;
      case "running":
        return <PlayCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusStyles = (status: TestRun["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "error":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "running":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const calculateDuration = (startedAt: string, endedAt: string | null) => {
    if (!endedAt) {
      return "Running...";
    }

    const start = new Date(startedAt).getTime();
    const end = new Date(endedAt).getTime();
    const diffInSeconds = Math.floor((end - start) / 1000);

    return `${diffInSeconds}s`;
  };

  const calculateTestRunNumber = (row: TestRun) => {
    const totalRecords = data?.pagination?.total_records || 0;
    const currentData = data?.data || [];
    const currentIndex = currentData.findIndex(
      (item: TestRun) => item.test_run_id === row.test_run_id
    );
    const currentPageStartIndex = page * pageSize;
    const runNumber = totalRecords - (currentPageStartIndex + currentIndex);
    return runNumber;
  };

  return (
    <div className="h-fit w-full">
      <HistoryRunDetails
        open={historyRunDetailsOpen}
        onClose={() => {
          setHistoryRunDetailsOpen(false);
          setSelectedResultId("");
        }}
        resultId={selectedResultId}
      />

      <CustomTable<TestRun>
        columns={[
          {
            field: "test_run_id",
            title: "Run Number",
            sortable: true,
            filterable: true,
            render: (row: TestRun) => (
              <span className="text-nowrap px-3 font-medium">
                {calculateTestRunNumber(row)}
              </span>
            )
          },
          {
            field: "status",
            title: "Status",
            sortable: true,
            filterable: true,
            render: (row: TestRun) => (
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusStyles(
                  row.status
                )}`}
              >
                {getStatusIcon(row.status)}
                {row.status}
              </span>
            )
          },
          {
            field: "started_at",
            title: "Execution Time",
            sortable: true,
            filterable: true,
            render: (row: TestRun) => (
              <span className="text-nowrap">
                {moment(row.started_at).format("llll")}
              </span>
            )
          },
          {
            field: "duration",
            title: "Duration",
            sortable: true,
            render: (row: TestRun) => (
              <span className="text-nowrap">
                {calculateDuration(row.started_at, row.ended_at)}
              </span>
            )
          },
          {
            field: "action",
            title: "Action",
            sortable: true,
            render: (row: TestRun) => (
              <div className="flex w-full items-center justify-center">
                <div className="w-fit">
                  <CustomButton
                    onClick={() => {
                      setSelectedResultId(row?.result_id);
                      setHistoryRunDetailsOpen(true);
                    }}
                    className="w-fit !text-[0.7rem] !uppercase"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    VIEW REPORT
                  </CustomButton>
                </div>
              </div>
            )
          }
        ]}
        data={data?.data || []}
        isLoading={isValidating}
        page={page}
        pageSize={pageSize}
        totalCount={data?.pagination?.total_records || 0}
        onPageChange={setPage}
        onRowsPerPageChange={setPageSize}
        title="Test History"
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
              "Once the test is executed, you’ll see the test run history here."
          }
        }}
        className="flex-1"
      />
    </div>
  );
};

export default TestHistory;
