"use client";
import useSwr from "@/shared/hooks/useSwr";
import { Check, Copy } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { toast } from "sonner";
import CustomTable from "@/shared/core/CustomTable";
import CustomButton from "@/shared/core/CustomButton";
import dynamic from "next/dynamic";
const SubmitTestData = dynamic(() => import("./SubmitTestData"), {
  ssr: false
});

interface MetricData {
  [key: string]: number | null;
}

interface SubmissionData extends Record<string, unknown> {
  tenant_id: string;
  client_id: string;
  test_id: string;
  eval_provider: string;
  deepeval?: MetricData;
  [key: string]: unknown;
  is_processed: boolean;
  created_at: string;
}
const CustomTolbar = ({ onOpen }: { onOpen: () => void }) => {
  return (
    <div className="flex w-full items-center justify-between px-4 py-2">
      <div className="flex flex-col gap-1 py-3 pl-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Test Submission History
        </h2>
        <h4 className="font-medium text-gray-700 dark:text-white">
          {
            "View your past submissions or use the ‘Submit Test Data’ button to submit new test data."
          }
        </h4>
      </div>
      <div className="w-fit">
        <CustomButton className="!text-[0.7rem]" onClick={onOpen}>
          Submit Test Data
        </CustomButton>
      </div>
    </div>
  );
};
const TestSubmissionHistory = ({ testId }: { testId: string }) => {
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [copiedRow, setCopiedRow] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const { data, isValidating, mutate } = useSwr(
    testId
      ? `list/uploaded_metrics?test_id=${testId}&page=${page + 1}&limit=${pageSize}`
      : null
  );

  // Get status badge styling
  const getProcessedStyles = (isProcessed: boolean) => {
    return isProcessed
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  };

  const calculateSubmissionNumber = (row: SubmissionData) => {
    const totalRecords = data?.pagination?.total_records || 0;
    const currentData = data?.data || [];
    const currentIndex = currentData.findIndex(
      (item: { created_at: string }) => item.created_at === row.created_at
    );
    const currentPageStartIndex = page * pageSize;
    return totalRecords - (currentPageStartIndex + currentIndex);
  };

  const handleCopyMetrics = async (row: SubmissionData) => {
    const providerData = row[row.eval_provider];
    const metricsJson = JSON.stringify(providerData, null, 2);

    try {
      await navigator.clipboard.writeText(metricsJson);
      setCopiedRow(row.created_at);
      setTimeout(() => setCopiedRow(null), 2000);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to copy metrics"
      );
    }
  };

  const renderDetailsPanel = (row: SubmissionData) => {
    const providerData = row[row.eval_provider];
    const isCopied = copiedRow === row.created_at;

    // Extract metrics with non-null values
    const metrics = providerData
      ? Object.entries(providerData)
          .filter(([_, value]) => value !== null)
          .map(([key, value]) => ({ key, value }))
      : [];

    return (
      <div className="animate-in slide-in-from-top-2">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Metrics Details - {row.eval_provider}
            </h3>
            <button
              onClick={() => handleCopyMetrics(row)}
              className="flex items-center gap-2 rounded-md bg-tertiary-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-tertiary-600"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Values
                </>
              )}
            </button>
          </div>
          <div className="p-6">
            {metrics.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gradient-to-r from-tertiary-50 to-indigo-50 p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {metric.key.replace(/Metric$/, "")}
                    </span>
                    <span className="ml-3 rounded-full bg-tertiary-600 px-3 py-1 text-sm font-bold text-white">
                      {String(metric.value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500">
                No metrics available
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-fit w-full">
      <SubmitTestData
        mutate={mutate}
        open={open}
        onClose={() => setOpen(false)}
        testId={testId}
      />
      <CustomTable<SubmissionData>
        columns={[
          {
            field: "submission_number",
            title: "Submission Number",
            sortable: true,
            render: (row: SubmissionData) => (
              <span className="text-nowrap px-3 font-medium">
                {calculateSubmissionNumber(row)}
              </span>
            )
          },
          {
            field: "eval_provider",
            title: "Provider",
            sortable: true,
            filterable: true,
            render: (row: SubmissionData) => (
              <span className="inline-flex items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium capitalize text-purple-600">
                {row.eval_provider}
              </span>
            )
          },
          {
            field: "is_processed",
            title: "Status",
            sortable: true,
            filterable: true,
            render: (row: SubmissionData) => (
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getProcessedStyles(
                  row.is_processed
                )}`}
              >
                {row.is_processed ? "Processed" : "Pending"}
              </span>
            )
          },
          {
            field: "created_at",
            title: "Submitted At",
            sortable: true,
            filterable: true,
            render: (row: SubmissionData) => (
              <span className="text-nowrap">
                {moment(row.created_at).format("llll")}
              </span>
            )
          },
          {
            field: "metrics",
            title: "Metrics",
            sortable: false,
            render: (_row: SubmissionData) => (
              <div className="flex w-full items-center justify-center">
                <div className="w-fit">
                  <CustomButton className="!text-[0.7rem]">
                    View Metrics
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
        title=""
        customToolbar={<CustomTolbar onOpen={() => setOpen(true)} />}
        options={{
          toolbar: false,
          search: false,
          filtering: true,
          sorting: true,
          pagination: true,
          detailPanel: true,
          detailPanelPosition: "right",
          detailPanelHeader: ""
        }}
        localization={{
          body: {
            emptyDataSourceMessage:
              "No submitted data! Use the ‘Submit Test Data’ button to add new test data. "
          }
        }}
        className="flex-1"
        detailPanel={renderDetailsPanel}
      />
    </div>
  );
};

export default TestSubmissionHistory;
