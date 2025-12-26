"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { ArrowRight, Play, Workflow } from "lucide-react";
import moment from "moment";
import { useRouter } from "nextjs-toploader/app";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface TableData extends Record<string, unknown> {
  id: string;
  name: string;
  framework: string;
  number_of_tasks: number;
  incompleted_tasks: number;
  updated_at: string;
  actions: string;
  flow_info: {
    run_id: string;
    incomplete_count: number;
    updated_at: string;
  };
}
const Implementation = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [runningWorkflows, setRunningWorkflows] = useState<Set<string>>(
    new Set()
  );

  const { mutation } = useMutation();
  const {
    data: workflowData,
    isValidating: runValidating,
    mutate: allMutate
  } = useSwr(`workflow/list?page=${page + 1}&page_size=${limit}`);
  // Run workflow function
  const runWorkflow = async (workflowId: string, workflowName: string) => {
    if (!workflowId) {
      return;
    }

    setRunningWorkflows((prev) => new Set(prev).add(workflowId));
    try {
      const response = await mutation(
        `workflow/run?workflow_id=${workflowId}&workflow_name=${workflowName}`,
        { method: "POST" }
      );

      if (response?.status === 200) {
        toast.success("Workflow started successfully!");
        allMutate();
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while starting the workflow."
      );
    } finally {
      setRunningWorkflows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(workflowId);
        return newSet;
      });
    }
  };

  // Define table columns
  const columns = useMemo(
    () => [
      {
        field: "name",
        title: "Workflow Name",
        render: (row: TableData) => (
          <div className="flex items-center justify-center">
            <div className="truncate font-semibold text-gray-900 dark:text-white">
              {row.name}
            </div>
          </div>
        )
      },
      {
        field: "framework",
        title: "Framework",
        render: (row: TableData) => (
          <div className="flex items-center justify-center">
            <div className="truncate font-semibold text-gray-900 dark:text-white">
              {row.framework}
            </div>
          </div>
        )
      },
      {
        field: "number_of_tasks",
        title: "Total Tasks",
        render: (row: TableData) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {row.number_of_tasks} tasks
            </span>
          </div>
        )
      },
      {
        field: "incompleted_tasks",
        title: "Incompleted Tasks",
        render: (row: TableData) => (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {row.flow_info.incomplete_count} tasks
            </span>
          </div>
        )
      },
      {
        field: "updated_at",
        title: "Last Updated",
        render: (row: TableData) => (
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {moment(
              row.flow_info.run_id ? row.flow_info.updated_at : row.updated_at
            ).format("lll")}
          </span>
        )
      },
      {
        field: "actions",
        title: "Actions",
        render: (row: TableData) => (
          <div className="flex w-full items-center justify-center gap-3">
            {row.flow_info.run_id ? (
              <div className="w-fit">
                <CustomButton
                  className="!rounded-md !border-blue-600 !bg-blue-600 !text-[0.6rem] !text-white hover:!bg-blue-700"
                  startIcon={<ArrowRight className="h-3 w-3" />}
                  onClick={() => router.push(`/implementation/${row.id}`)}
                >
                  View
                </CustomButton>
              </div>
            ) : (
              <div className="w-fit">
                <CustomButton
                  className="!rounded-md !text-[0.6rem]"
                  startIcon={<Play className="h-3 w-3" />}
                  onClick={() => runWorkflow(row.id, row.name)}
                  disabled={runningWorkflows.has(row.id)}
                  loading={runningWorkflows.has(row.id)}
                  loadingText="Running..."
                >
                  {runningWorkflows.has(row.id) ? "Running..." : "Start"}
                </CustomButton>
              </div>
            )}
          </div>
        )
      }
    ],
    [runningWorkflows, router]
  );

  // Custom toolbar content
  const customToolbar = (
    <div className="flex w-full items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 via-tertiary-600 to-tertiary-600 shadow-lg">
            <Workflow className="h-8 w-8 text-white" />
          </div>
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent dark:from-tertiary-500 dark:to-tertiary-600">
            Compliance Workflows
          </h1>
          <p className="mt-1 text-lg text-gray-600 dark:text-gray-300">
            Manage and monitor your automation workflows
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-fit w-full flex-col gap-5 p-6">
      <CustomTable<TableData>
        title=""
        columns={columns}
        data={workflowData?.workflows || []}
        isLoading={runValidating}
        customToolbar={customToolbar}
        page={page}
        pageSize={limit}
        totalCount={workflowData?.total || 0}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
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
  );
};

export default Implementation;
