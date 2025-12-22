"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
export interface Test extends Record<string, unknown> {
  common_test_id: string;

  name: string;
  description: string;
  notes: string;

  frequency: number;
  status: "draft" | "active" | "inactive";
  type: "predefined" | "custom";

  framework: string[];

  badge_url: string;
  owner_name: string;

  preferred_run_time: string;
  created_at: string;
  updated_at: string;

  is_added: boolean;
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

const TestLibrary = ({ isAccess }: { isAccess: IsAccess }) => {
  const { isLoading, mutation } = useMutation();
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const { data, isValidating, mutate } = useSwr(
    `tests/library?page=${page + 1}&limit=${pageSize}`
  );
  const [testId, setTestId] = useState<string>("");

  const AddToRegister = async (test_id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6160b0",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, register it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await mutation(`test/import?common_test_id=${test_id}`, {
          method: "POST",
          isAlert: false
        });

        if (res?.status === 200) {
          toast.success("Test registered successfully");
          mutate();
          setTestId("");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
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
      <CustomTable<Test>
        columns={[
          {
            field: "name",
            title: "Name",
            sortable: true,
            filterable: true,

            render: (row: Test) => (
              <div className="flex w-[300px] items-center gap-2 pl-2">
                <Image
                  src={row?.badge_url}
                  alt={row?.name}
                  width={40}
                  height={40}
                  className="flex-shrink-0"
                />
                <span className="line-clamp-3 text-left font-medium leading-tight">
                  {row?.name ?? "Not Provided"}
                </span>
              </div>
            )
          },
          {
            field: "description",
            title: "Description",
            sortable: true,
            filterable: true,
            cellClassName: "w-fit",
            render: (row: Test) => (
              <span className="flex max-w-[30rem] items-center justify-start text-wrap text-left lg:w-[20rem] 2xl:w-fit">
                {row?.description ?? "Not Provided"}
              </span>
            )
          },
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
          ...(isAccess?.buttons?.[0]?.permission?.is_shown
            ? [
                {
                  field: "add_to_register",
                  title: "Add to Register",
                  sortable: true,
                  filterable: true,
                  render: (row: Test) => (
                    <div className="flex w-full items-center justify-center">
                      <div className="w-fit">
                        <CustomButton
                          onClick={() => {
                            setTestId(row?.common_test_id);
                            AddToRegister(row?.common_test_id);
                          }}
                          disabled={
                            row?.is_added ||
                            !isAccess?.buttons?.[0]?.permission?.actions?.create
                          }
                          loading={isLoading && testId === row?.common_test_id}
                          className="!text-[0.7rem]"
                        >
                          {row?.is_added ? "Already Added" : "Add"}
                        </CustomButton>
                      </div>
                    </div>
                  )
                }
              ]
            : [])
        ]}
        // FIXED: Changed lenght to length and improved data check
        data={data?.data?.length > 0 ? data?.data : []}
        isLoading={isValidating}
        page={page}
        pageSize={pageSize}
        totalCount={data?.pagination?.total_records}
        onPageChange={setPage}
        onRowsPerPageChange={setPageSize}
        title="Test Library"
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

export default TestLibrary;
