import { XCircleIcon } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";

const ControlContent = ({
  controls
}: {
  controls: { name: string; description: string; readiness_status: string }[];
}) => (
  <div className="flex w-full flex-col rounded-lg border border-neutral-200">
    <div className="flex w-full items-center border-b border-neutral-200 p-4">
      <p className="w-[90%] text-sm font-medium uppercase text-neutral-500">
        CONTROL Status
      </p>
    </div>
    {controls?.map(
      (
        item: { name: string; description: string; readiness_status: string },
        index: number
      ) => (
        <div
          key={index}
          className="flex w-full items-center justify-between p-4"
        >
          <span className="flex w-full flex-col gap-1">
            <p className="text-lg font-medium text-gray-800">{item.name}</p>
            <p className="text-sm font-medium text-neutral-500">
              {item.description}
            </p>
          </span>
          {item.readiness_status === "ready" ? (
            <FaCircleCheck className="text-green-500" size={16} />
          ) : (
            <XCircleIcon className="text-red-500" size={16} />
          )}
        </div>
      )
    )}
  </div>
);
export default ControlContent;
