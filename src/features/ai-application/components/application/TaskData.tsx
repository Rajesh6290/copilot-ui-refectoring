import Empty from "@/shared/core/Empty";
import useSwr from "@/shared/hooks/useSwr";
import { GitBranchPlus, MessageCircle } from "lucide-react";
const generateRandomHexColor = (): string => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, "0")}`;
};

const TaskData = () => {
  const { data } = useSwr("tasks-by-status");
  const order = ["Pending", "In Progress", "Completed", "Overdue"];
  const sortedData = data?.data?.sort(
    (a: { status: string }, b: { status: string }) =>
      order.indexOf(a.status) - order.indexOf(b.status)
  );
  const columnColors = {
    Overdue: "bg-red-500",
    "In Progress": "bg-blue-500",
    Pending: "bg-amber-500",
    Completed: "bg-green-500"
  };
  return (
    <div className="flex h-fit w-full flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {sortedData?.length > 0 ? (
          sortedData?.map(
            (
              item: {
                status: string;
                tasks: Array<{
                  name: string;
                  description: string;
                  priority: string;
                  recurrence: string;
                  category: string;
                }>;
              },
              colIdx: number
            ) => (
              <div
                key={colIdx}
                className="flex w-full flex-col gap-3 rounded-lg bg-gray-200"
              >
                <h3
                  className={`rounded-t-lg p-3 text-lg font-semibold text-white ${columnColors[item?.status as keyof typeof columnColors]}`}
                >
                  {item?.status} ({item?.tasks?.length})
                </h3>
                <div className="max-h-[calc(100vh-200px)] space-y-2 overflow-y-auto p-3">
                  {item?.tasks?.length > 0 ? (
                    item?.tasks?.map(
                      (
                        subItem: {
                          name: string;
                          description: string;
                          priority: string;
                          recurrence: string;
                          category: string;
                        },
                        itemIdx: number
                      ) => (
                        <div
                          key={itemIdx}
                          className="flex w-full flex-col gap-3 rounded-md bg-white p-3 shadow"
                        >
                          <h4 className="font-semibold text-gray-600">
                            {subItem?.name}
                          </h4>
                          <p className="mt-1 whitespace-pre-line text-sm capitalize text-gray-700">
                            {subItem?.description}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="relative rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600">
                              {subItem?.priority}
                              <span
                                className="absolute left-0 top-0 h-full w-1 rounded-l-md"
                                style={{
                                  backgroundColor: generateRandomHexColor()
                                }}
                              ></span>
                            </span>
                            <span className="relative rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600">
                              {subItem?.recurrence}
                              <span
                                className="absolute left-0 top-0 h-full w-1 rounded-l-md"
                                style={{
                                  backgroundColor: generateRandomHexColor()
                                }}
                              ></span>
                            </span>
                            <span className="relative rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600">
                              {subItem?.category}
                              <span
                                className="absolute left-0 top-0 h-full w-1 rounded-l-md"
                                style={{
                                  backgroundColor: generateRandomHexColor()
                                }}
                              ></span>
                            </span>
                          </div>
                          <div className="flex w-full items-center justify-end gap-5">
                            <MessageCircle
                              size={20}
                              className="cursor-pointer"
                            />
                            <GitBranchPlus
                              size={20}
                              className="cursor-pointer"
                            />
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-gray-500">No Task </p>
                  )}
                </div>
              </div>
            )
          )
        ) : (
          <div className="flex w-full items-center justify-center rounded-md bg-white p-8 text-center shadow dark:bg-transparent">
            <div className="w-fit">
              <Empty
                title="No Task Yet"
                subTitle="Start your first Task"
                pathName="New Task"
                link="#"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TaskData;
