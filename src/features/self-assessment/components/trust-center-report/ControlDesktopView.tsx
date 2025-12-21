import ControlContent from "./ControlContent";

const ControlDesktopView = ({
  data,
  tab,
  setTab
}: {
  data: {
    category: string;
    controls: {
      id: string;
      name: string;
      description: string;
      status: string;
    }[];
  }[];
  tab: string;
  setTab: (tab: string) => void;
}) => (
  <div className="hidden h-fit w-full gap-5 lg:flex">
    <div className="line-clamp-1 flex w-[30%] flex-col gap-3">
      {data?.map(
        (
          item: {
            category: string;
            controls: {
              id: string;
              name: string;
              description: string;
              status: string;
            }[];
          },
          index: number
        ) => (
          <div
            key={index}
            tabIndex={0}
            role="button"
            onClick={() => setTab(item?.category)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setTab(item?.category);
              }
            }}
            className={`line-clamp-1 cursor-pointer rounded-md px-4 py-1.5 font-medium text-gray-800 duration-200 ${
              tab === item?.category
                ? "bg-tertiary-100 dark:bg-tertiary-700"
                : "hover:bg-tertiary-100 dark:hover:bg-tertiary-700"
            } `}
          >
            {item?.category}
          </div>
        )
      )}
    </div>
    <div className="flex w-[70%] flex-col gap-5">
      <div className="flex w-full flex-col gap-5">
        <p className="text-lg font-medium text-gray-800">{tab}</p>
        <ControlContent
          controls={
            data
              ?.find((i: { category: string }) => i?.category === tab)
              ?.controls.map((control) => ({
                name: control.name,
                description: control.description,
                readiness_status: control.status
              })) ?? []
          }
        />
      </div>
    </div>
  </div>
);
export default ControlDesktopView;
