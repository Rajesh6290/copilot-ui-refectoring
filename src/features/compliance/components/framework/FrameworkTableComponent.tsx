import CustomButton from "@/shared/core/CustomButton";
import CustomTable, { CVTableRef } from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArchiveRestore,
  CircleCheck,
  CircleCheckBig,
  CircleGauge,
  CircleX,
  FileText,
  FilterIcon,
  Landmark,
  Loader2,
  Map,
  Settings,
  Shield,
  Tag,
  Target,
  Users,
  X
} from "lucide-react";
import { Dispatch, JSX, SetStateAction, useRef, useState } from "react";
import { toast } from "sonner";
import {
  PaginationData,
  Requirement,
  RequirementsResponse
} from "./DynamicFrameworks";
import dynamic from "next/dynamic";
const FrameworkControlDetails = dynamic(
  () => import("./FrameworkControlDetails"),
  {
    ssr: false
  }
);
interface FrameworkData {
  requirements: RequirementsResponse[];
  pagination: PaginationData;
}
const CustomToolBar = ({
  setCategory,
  category,
  setReady,
  ready,
  selectionData,
  activeTab,
  mutate,
  setSelectionData,
  tableRef,
  frameworkId
}: {
  setCategory: Dispatch<SetStateAction<string>>;
  category: string;
  setReady: Dispatch<SetStateAction<string>>;
  ready: string;
  selectionData: string[];
  activeTab: string;
  mutate: () => void;
  setSelectionData: Dispatch<SetStateAction<string[]>>;
  tableRef: React.RefObject<CVTableRef | null>;
  frameworkId: string;
}) => {
  const { isLoading, mutation } = useMutation();
  const { data, isValidating } = useSwr(
    `requirement-filters?framework_id=${frameworkId}`
  );
  const getDynamicIcon = (index: number, size = 20) => {
    const icons = [
      <Tag key="tag" className="text-tertiary" size={size} />,
      <FilterIcon key="filter" className="text-tertiary" size={size} />,
      <FileText key="filetext" className="text-tertiary" size={size} />,
      <Users key="users" className="text-tertiary" size={size} />,
      <Shield key="shield" className="text-tertiary" size={size} />,
      <Target key="target" className="text-tertiary" size={size} />,
      <Settings key="settings" className="text-tertiary" size={size} />,
      <Landmark key="landmark" className="text-tertiary" size={size} />,
      <Map key="map" className="text-tertiary" size={size} />,
      <CircleGauge key="circlegauge" className="text-tertiary" size={size} />
    ];

    return icons[index % icons.length];
  };

  // Create dynamic filters from API data
  const dynamicFilters =
    data?.map((filterValue: string, index: number) => ({
      key: `${filterValue}-${index}`,
      label: filterValue,
      value: filterValue,
      icon: getDynamicIcon(index)
    })) || [];

  const handleChange = async () => {
    try {
      const res = await mutation("requirements", {
        method: "PUT",
        isAlert: false,
        body: {
          requirement_ids: selectionData,
          fields: {
            scope: activeTab !== "In Scope" ? "in_scope" : "out_of_scope"
          }
        }
      });
      if (res?.status === 200) {
        setSelectionData([]);
        tableRef.current?.resetSelection();
        mutate();
        toast.success(
          `Requirements ${activeTab !== "In Scope" ? "In Scope" : "Out of Scope"}`
        );
      } else {
        toast.error(
          `Failed to update requirements ${activeTab !== "In Scope" ? "In Scope" : "Out of Scope"}`
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 p-4">
      <div className="flex w-full flex-col justify-between lg:flex-row lg:items-center">
        {dynamicFilters?.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="pl-1 font-satoshi text-lg font-medium text-gray-900 dark:text-white">
              Framework Category
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {isValidating ? (
                // Loading skeleton
                <>
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="flex animate-pulse items-center gap-2 rounded-lg border border-gray-200 px-4 py-2"
                    >
                      <div className="h-5 w-5 rounded bg-gray-200" />
                      <div className="h-4 w-16 rounded bg-gray-200" />
                    </div>
                  ))}
                </>
              ) : (
                // Dynamic filters from API
                dynamicFilters?.map(
                  (
                    item: {
                      key: string;
                      label: string;
                      value: string;
                      icon: JSX.Element;
                    },
                    index: number
                  ) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() =>
                        setCategory(category === item?.value ? "" : item?.value)
                      }
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border border-primary-200 px-4 py-1.5 font-normal text-tertiary duration-200 dark:border-neutral-700 ${
                        category === item?.label
                          ? "bg-primary-100"
                          : "hover:bg-primary-50"
                      } `}
                    >
                      {item?.icon} {item?.label}
                    </motion.div>
                  )
                )
              )}
              {category?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setCategory("")}
                  className="cursor-pointer rounded-md border border-red-100 bg-red-100 p-2 transition-colors hover:bg-red-200"
                >
                  <X className="text-red-500" size={20} />
                </motion.div>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <p className="pl-1 font-satoshi text-lg font-medium text-gray-900 dark:text-white">
            Readiness Status
          </p>
          <div className="flex items-center gap-3">
            {ready?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setReady("")}
                className="cursor-pointer rounded-lg border border-red-100 bg-red-100 p-2 transition-colors hover:bg-red-200"
              >
                <X className="text-red-500" size={20} />
              </motion.div>
            )}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setReady(ready === "ready" ? "" : "ready")}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border border-primary-200 px-4 py-1.5 font-normal text-tertiary duration-200 dark:border-neutral-700 ${
                ready === "ready" ? "bg-primary-100" : "hover:bg-primary-50"
              } `}
            >
              <CircleCheckBig className="text-green-500" size={20} /> Ready
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setReady(ready === "not_ready" ? "" : "not_ready")}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border border-primary-200 px-4 py-1.5 font-normal text-tertiary duration-200 hover:bg-primary-50 dark:border-neutral-700 ${
                ready === "not_ready" ? "bg-primary-100" : "hover:bg-primary-50"
              } `}
            >
              <CircleX className="text-red-500" size={20} /> Not Ready
            </motion.div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectionData?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex w-full items-center gap-5"
          >
            <p className="text-sm font-medium text-green-400">
              {selectionData?.length} row{selectionData?.length > 1 ? "s" : ""}{" "}
              selected
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleChange}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border border-purple-200 bg-purple-100 px-4 py-1.5 font-normal text-purple-600 duration-200 hover:bg-purple-200 ${
                isLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              ) : (
                <ArchiveRestore className="h-5 w-5 text-purple-600" />
              )}
              <span>
                Mark as {activeTab === "In Scope" ? "out of scope" : "in scope"}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
const FrameworkTableComponents = ({
  page,
  setPage,
  category,
  setCategory,
  pageSize,
  setPageSize,
  data,
  isValidating,
  ready,
  setReady,
  activeTab,
  mutate,
  frameworkId
}: {
  frameworkName: string;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  data: FrameworkData | undefined;
  isValidating: boolean;
  ready: string;
  setReady: Dispatch<SetStateAction<string>>;
  activeTab: string;
  mutate: () => void;
  frameworkId: string;
}) => {
  const [controlId, setControlId] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [selectionData, setSelectionData] = useState<string[]>([]);
  const tableRef = useRef<CVTableRef>(null);
  return (
    <div className="flex h-fit w-full">
      <FrameworkControlDetails
        controlId={controlId}
        onClose={() => setOpen(!open)}
        open={open}
      />

      <div className="w-full">
        <CustomTable<RequirementsResponse>
          ref={tableRef}
          isLoading={isValidating}
          columns={[
            {
              field: "id",
              title: "ID",
              sortable: true,
              filterable: true,
              cellClassName: "w-[6rem]",
              render: (rows: RequirementsResponse) => {
                const row = rows as unknown as Requirement;

                return (
                  <div className="flex w-fit items-center justify-between gap-3">
                    <span
                      className={`flex items-center justify-center rounded-full ${
                        row?.readiness_status === "ready"
                          ? "bg-green-50 text-green-500"
                          : "bg-red-100 text-red-500"
                      } `}
                    >
                      {row?.readiness_status !== "ready" ? (
                        <CircleX size={20} />
                      ) : (
                        <CircleCheck size={20} />
                      )}
                    </span>
                    <span className="text-nowrap font-medium uppercase">
                      {row?.id ?? "Not Provided"}
                    </span>
                  </div>
                );
              }
            },
            {
              field: "name",
              title: "Requirement",
              sortable: true,
              filterable: true,
              cellClassName: "w-[20rem]",
              render: (rows: RequirementsResponse) => {
                const row = rows as unknown as Requirement;
                return (
                  <span className="flex w-[20rem] text-left font-medium capitalize">
                    {row?.requirement_name ?? "Not Provided"}
                  </span>
                );
              }
            },
            {
              field: "description",
              title: "Description",
              sortable: true,
              filterable: true,
              cellClassName: "min-w-[30rem]",
              render: (rows: RequirementsResponse) => {
                const row = rows as unknown as Requirement;
                return row.description || "No notes available";
              },
              expandable: {
                enabled: true,
                maxLines: 3,
                showMoreText: "Show More",
                showLessText: "Show Less"
              }
            },
            {
              field: "section",
              title: "Section",
              sortable: true,
              filterable: true,
              render: (rows: RequirementsResponse) => {
                const row = rows as unknown as Requirement;
                return (
                  <span className="flex w-full items-center justify-center text-nowrap">
                    {row?.section ?? "Not Provided"}
                  </span>
                );
              }
            },
            {
              field: "point_of_focus",
              title: "Point of focus",
              sortable: true,
              filterable: true,
              cellClassName: "w-[15rem]",
              render: (rows: RequirementsResponse) => {
                const row = rows as unknown as Requirement;
                return (
                  <div className="flex w-[15rem] flex-col text-left">
                    {Array.isArray(row?.point_of_focus) &&
                    row?.point_of_focus.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {row.point_of_focus.map((item: string, idx: number) => (
                          <li key={idx} className="capitalize">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>Not Provided</span>
                    )}
                  </div>
                );
              }
            },
            {
              field: "readiness_status",
              title: "Readiness Status",
              sortable: true,
              filterable: true,
              render: (rows: RequirementsResponse) => {
                const row = rows as unknown as Requirement;
                return (
                  <span className="flex w-full items-center justify-center text-nowrap">
                    {row?.readiness_status === "ready" ? "Ready" : "Not Ready"}
                  </span>
                );
              }
            },
            {
              field: "controls",
              title: "Controls",
              sortable: true,
              filterable: true,
              render: (rows: RequirementsResponse) => {
                const row = rows as unknown as Requirement;
                return (
                  <div className="flex w-full items-center justify-center">
                    <div className="w-fit">
                      <CustomButton
                        onClick={() => {
                          setControlId(row?.doc_id);
                          setOpen(true);
                        }}
                        className="w-fit !text-[0.7rem] !uppercase"
                      >
                        VIEW
                      </CustomButton>
                    </div>
                  </div>
                );
              }
            }
          ]}
          data={(data?.["requirements"] as RequirementsResponse[]) || []}
          page={page}
          pageSize={pageSize}
          totalCount={data?.["pagination"]?.total_records || 0}
          onPageChange={setPage}
          onRowsPerPageChange={setPageSize}
          onSelectionChange={(rows: RequirementsResponse[]) => {
            const row = rows as unknown as Requirement[];
            return setSelectionData(
              row?.map((item: Requirement) => item?.doc_id)
            );
          }}
          title=""
          selection={true}
          filtering={false}
          customToolbar={
            <CustomToolBar
              setCategory={setCategory}
              category={category}
              ready={ready}
              setReady={setReady}
              selectionData={selectionData}
              activeTab={activeTab}
              mutate={mutate}
              setSelectionData={setSelectionData}
              tableRef={tableRef}
              frameworkId={frameworkId}
            />
          }
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
export default FrameworkTableComponents;
