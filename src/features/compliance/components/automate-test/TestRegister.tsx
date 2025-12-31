"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "nextjs-toploader/app";
import React, { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
const AddNewTest = dynamic(() => import("./AddNewTest"), {
  ssr: false
});
const AddTestControl = dynamic(() => import("./AddTestControl"), {
  ssr: false
});
const TestUpdate = dynamic(() => import("./TestUpdate"), {
  ssr: false
});
export interface Test extends Record<string, unknown> {
  common_test_id: string;
  test_id: string;

  name: string;
  description: string;
  notes: string;

  frequency: number;
  status: "draft" | "active" | "inactive";
  type: "predefined" | "custom";

  control_ids: string[];
  framework: string[];

  badge_url: string;
  owner_name: string;

  preferred_run_time: string;
  created_at: string;
  updated_at: string;

  tenant_id: string;
  client_id: string;
  owner_id: string;

  in_processing: boolean;
  last_run_at: string | null;
  application_id: string | null;
  latest_result_id: string | null;
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

interface TestRegisterProps {
  isAccess: IsAccess;
}
// Custom Toolbar Component
const CustomToolbar = ({
  mutate,
  isAccess
}: {
  mutate: () => void;
  isAccess: IsAccess;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full items-center justify-between px-5 py-3">
      <AddNewTest mutate={mutate} onClose={() => setOpen(false)} open={open} />
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Tests
      </h2>
      {isAccess?.buttons?.[1]?.permission?.is_shown && (
        <div className="w-fit">
          <CustomButton
            disabled={!isAccess?.buttons?.[1]?.permission?.actions?.create}
            onClick={() => setOpen(true)}
          >
            Add New Test
          </CustomButton>
        </div>
      )}
    </div>
  );
};
const TestRegister: React.FC<TestRegisterProps> = ({ isAccess }) => {
  const { isLoading, mutation } = useMutation();
  const { isLoading: statusLoading, mutation: statusMutation } = useMutation();
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const { data, isValidating, mutate } = useSwr(
    `tests/list?page=${page + 1}&limit=${pageSize}`,
    {
      keepPreviousData: true
    }
  );

  const [addControlOpen, setAddControlOpen] = useState<boolean>(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  const router = useRouter();
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [testId, setTestId] = useState<Test | null>(null);

  const handleDelete = async (test_id: string) => {
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
        const res = await mutation(`test?test_id=${test_id}`, {
          method: "DELETE",
          isAlert: false
        });

        if (res?.status === 200) {
          toast.success("Test deleted successfully");
          mutate();
        } else {
          toast.error("Failed to delete test");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    }
  };

  const handleToggleStatus = async (item: Test) => {
    // Check if test has at least one control before activating
    if (
      ["draft", "inactive"].includes(item?.status) &&
      (!item?.control_ids || item?.control_ids?.length === 0)
    ) {
      toast.error(
        "Cannot activate test. Please add at least one control first."
      );
      return;
    }

    try {
      const url = ["draft", "inactive"].includes(item?.status)
        ? "test/activate"
        : "test/deactivate";
      const res = await statusMutation(`${url}?test_id=${item?.test_id}`, {
        method: "POST",
        isAlert: false,
        body: {
          frequency: item?.frequency
        }
      });
      if (res?.status === 201 || res?.status === 200) {
        mutate();
        setTestId(null);
        toast.success(
          `Test ${item?.status === "active" ? "deactivated" : "activated"} successfully!`
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const FREQUENCY_TO_SECONDS = {
    10: "10sec",
    86400: "daily",
    604800: "weekly",
    2592000: "monthly",
    7776000: "quarterly",
    31536000: "yearly"
  };

  return (
    <div className="h-fit w-full">
      <TestUpdate
        mutate={mutate}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setTestId(null);
        }}
        updateData={testId}
      />
      <AddTestControl
        open={addControlOpen}
        onClose={() => {
          setAddControlOpen(false);
          setSelectedTest(null);
        }}
        testId={selectedTest?.test_id || ""}
        applicationId={selectedTest?.application_id || ""}
        existingControlIds={selectedTest?.control_ids || []}
        mutate={mutate}
      />
      <CustomTable<Test>
        columns={[
          {
            field: "name",
            title: "Name",
            sortable: true,
            filterable: true,
            render: (row: Test) => (
              <span className="line-clamp-2 w-[250px] font-medium leading-tight">
                {row?.name ?? "Not Provided"}
              </span>
            )
          },
          // {
          //   field: "description",
          //   title: "Description",
          //   sortable: true,
          //   filterable: true,
          //   cellClassName: "w-[400px]",
          //   render: (row: any) => (
          //     <span className="flex w-[400px] max-w-[400px] items-center justify-center text-wrap">
          //       {row?.description ?? "Not Provided"}
          //     </span>
          //   ),
          // },
          {
            field: "frequency",
            title: "Frequency",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: Test) => (
              <span className="flex w-full items-center justify-center capitalize">
                {row?.frequency
                  ? FREQUENCY_TO_SECONDS[
                      row?.frequency as keyof typeof FREQUENCY_TO_SECONDS
                    ]
                  : "Not Provided"}
              </span>
            )
          },
          {
            field: "status",
            title: "Status",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: Test) => (
              <span
                className={`flex w-full items-center justify-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  row?.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {row?.status ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "type",
            title: "Type",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: Test) => (
              <span className="flex w-full items-center justify-center capitalize">
                {row?.type ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "owner",
            title: "Owner",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: Test) => (
              <span className="flex w-full items-center justify-center text-nowrap capitalize">
                {row?.owner_name ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "test_run_status",
            title: "Test Run Status",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: Test) => (
              <span className="flex w-full items-center justify-center text-nowrap capitalize">
                {row?.last_run_at === null && row?.status === "draft"
                  ? "Incomplete"
                  : row?.status === "active" && row?.last_run_at === null
                    ? "In Progress"
                    : "Completed"}
              </span>
            )
          },
          ...(isAccess?.buttons?.[0]?.permission?.is_shown
            ? [
                {
                  field: "view",
                  title: "View",
                  sortable: true,
                  filterable: true,
                  render: (row: Test) => (
                    <div className="flex w-full items-center justify-center">
                      <div className="w-fit">
                        <CustomButton
                          onClick={() => {
                            router.push(
                              `/compliance/automate-test/${row?.test_id}?_name=${encodeURIComponent(row?.name)}${row?.latest_result_id ? `&resultId=${row?.latest_result_id}` : ""}`
                            );
                          }}
                          className="w-fit !text-[0.7rem] !uppercase"
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
            field: "action",
            title: "Action",
            sortable: true,
            filterable: true,
            render: (row: Test) => (
              <div className="flex w-full items-center justify-center">
                <div className="flex items-center gap-2">
                  {/* Add Control Button */}
                  {isAccess?.buttons?.[4]?.permission?.is_shown && (
                    <Tooltip
                      title={
                        row?.type === "predefined"
                          ? "No controls can be added for a predefined test."
                          : !isAccess?.buttons?.[4]?.permission?.actions?.create
                            ? "You do not have permission to add controls."
                            : "Add controls to activate the test"
                      }
                      arrow
                      placement="top"
                    >
                      <span>
                        <CustomButton
                          onClick={() => {
                            setSelectedTest(row);
                            setAddControlOpen(true);
                          }}
                          disabled={
                            row?.type === "predefined" ||
                            !isAccess?.buttons?.[4]?.permission?.actions?.create
                          }
                          className="!text-nowrap !text-[0.7rem]"
                        >
                          Add Control
                        </CustomButton>
                      </span>
                    </Tooltip>
                  )}
                  {/* Activate/Deactivate Button */}
                  {isAccess?.buttons?.[5]?.permission?.is_shown && (
                    <Tooltip
                      title={
                        ["draft", "deactive"].includes(row?.status) &&
                        (!row?.control_ids || row?.control_ids?.length === 0)
                          ? "Add at least one control to activate"
                          : isAccess?.buttons?.[5]?.permission?.actions?.update
                            ? "You dont have permission to update."
                            : ""
                      }
                      arrow
                      placement="top"
                    >
                      <div>
                        <CustomButton
                          onClick={() => {
                            setTestId(row);
                            handleToggleStatus(row);
                          }}
                          className="!text-nowrap !text-[0.7rem]"
                          loading={
                            statusLoading && row?.test_id === testId?.test_id
                          }
                          disabled={
                            (["draft", "inactive"].includes(row?.status) &&
                              (!row?.control_ids ||
                                row?.control_ids?.length === 0)) ||
                            !isAccess?.buttons?.[5]?.permission?.actions?.update
                          }
                        >
                          {`${["inactive", "draft"].includes(row?.status) ? "Activate" : "Deactivate"} Test`}
                        </CustomButton>
                      </div>
                    </Tooltip>
                  )}

                  {/* Edit Button */}
                  {isLoading && row.test_id === testId?.test_id ? (
                    <CircularProgress size={20} />
                  ) : isAccess?.buttons?.[2]?.permission?.is_shown ? (
                    <Tooltip
                      title={
                        row?.type === "predefined"
                          ? "Predefined Test cannot be updated."
                          : !isAccess?.buttons?.[2]?.permission?.actions?.update
                            ? "You don't have permission to update."
                            : "Update Test"
                      }
                      arrow
                      placement="top"
                    >
                      <span>
                        <IconButton
                          onClick={() => {
                            setTestId(row);
                            setEditOpen(true);
                          }}
                          disabled={
                            row?.type === "predefined" ||
                            !isAccess?.buttons?.[2]?.permission?.actions?.update
                          }
                        >
                          <Pencil
                            size={23}
                            className={`cursor-pointer ${
                              row?.type === "predefined"
                                ? "text-neutral-400"
                                : "text-green-500"
                            } `}
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : null}

                  {/* Delete Button */}
                  {isLoading && row.test_id === testId?.test_id ? (
                    <CircularProgress size={20} />
                  ) : isAccess?.buttons?.[3]?.permission?.is_shown ? (
                    <Tooltip title="Delete Test" arrow placement="top">
                      <IconButton
                        onClick={() => {
                          if (
                            isAccess?.buttons?.[3]?.permission?.actions?.delete
                          ) {
                            setTestId(row);
                            handleDelete(row?.test_id);
                          } else {
                            toast.error("You don't have permission to delete.");
                          }
                        }}
                      >
                        <Trash2
                          size={23}
                          className={`cursor-pointer ${!isAccess?.buttons?.[3]?.permission?.actions?.delete ? "text-neutral-400" : "text-red-500"} `}
                        />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            )
          }
        ]}
        data={data?.data?.length > 0 ? data?.data : []}
        isLoading={isValidating}
        page={page}
        pageSize={pageSize}
        totalCount={data?.pagination?.total_records}
        onPageChange={setPage}
        onRowsPerPageChange={setPageSize}
        customToolbar={<CustomToolbar isAccess={isAccess} mutate={mutate} />}
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
        localization={{
          body: {
            emptyDataSourceMessage:
              "You haven’t created any tests yet. Use the ‘Add New Test’ button to set one up."
          }
        }}
        className="flex-1"
      />
    </div>
  );
};

export default TestRegister;
