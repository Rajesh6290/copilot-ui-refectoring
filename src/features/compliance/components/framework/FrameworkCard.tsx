import ProgressChart from "@/shared/common/ProgressChart";
import { CircleCheckBig, SlidersHorizontal } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

const FrameworkCard = ({
  item
}: {
  item: {
    id: string;
    doc_id: string;
    name: string;
    short_name: string;
    badge_url: string;
    version?: string;
    jurisdiction?: string;
    requirement_stats: {
      ready_requirements: number;
      in_scope_requirements: number;
    };
  };
}) => {
  const router = useRouter();
  return (
    <div
      tabIndex={0}
      role="button"
      onClick={() =>
        router.push(
          `/compliance/framework/${item?.doc_id}?_name=${encodeURIComponent(item?.name)}&framework-name=${encodeURIComponent(item?.name)}&framework-id=${item?.id}`
        )
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          router.push(
            `/compliance/framework/${item?.doc_id}?_name=${encodeURIComponent(item?.name)}&framework-name=${encodeURIComponent(item?.name)}&framework-id=${item?.id}`
          );
        }
      }}
      className="shadow-1 flex h-fit w-full cursor-pointer flex-col gap-4 rounded-lg bg-white p-4 drop-shadow-1 dark:bg-darkSidebarBackground dark:shadow-none dark:drop-shadow-none"
    >
      <div className="flex w-full items-center gap-3">
        <div className="w-16 overflow-hidden">
          <img
            src={item?.badge_url}
            alt="framwork-badge"
            className="size-full object-cover"
          />
        </div>
        <div className="flex w-full flex-col gap-1">
          <p className="text-lg font-semibold text-tertiary">
            {item?.short_name}
          </p>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {item?.name}
          </p>
          {/* Version and Jurisdiction */}
          <div className="flex items-center gap-2 text-xs">
            {item?.version && (
              <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {item?.version}
              </span>
            )}
            {item?.jurisdiction && (
              <span className="rounded bg-purple-100 px-2 py-0.5 font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                {item?.jurisdiction}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="h-fit w-full overflow-hidden">
        <ProgressChart
          value={
            Math.floor(
              (item?.requirement_stats?.ready_requirements /
                item?.requirement_stats?.in_scope_requirements) *
                100
            ) || 0
          }
        />
      </div>
      <div className="mb-10 flex w-full items-center justify-center">
        {(() => {
          const completionPercentage =
            Math.floor(
              (item?.requirement_stats?.ready_requirements /
                item?.requirement_stats?.in_scope_requirements) *
                100
            ) || 0;

          const isCompliant = completionPercentage === 100;

          return (
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 ${
                isCompliant
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              <span
                className={`flex size-6 items-center justify-center rounded-full ${
                  isCompliant ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <CircleCheckBig className="text-white" size={12} />
              </span>
              <span className="text-sm font-semibold">
                {isCompliant ? "Compliant" : "Not Compliant"}
              </span>
            </div>
          );
        })()}
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-green-50">
            <CircleCheckBig className="text-green-500" size={15} />
          </span>
          <div className="flex flex-col gap-0">
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {item?.requirement_stats?.ready_requirements || 0}/
              {item?.requirement_stats?.in_scope_requirements || 0}
            </p>
            <p className="-mt-1 text-sm font-semibold text-gray-800 dark:text-white">
              Ready Requirements
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-blue-50">
            <SlidersHorizontal className="-rotate-90 text-blue-500" size={15} />
          </span>
          <div className="flex flex-col gap-0">
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {item?.requirement_stats?.in_scope_requirements || 0}
            </p>
            <p className="-mt-1 text-sm font-semibold text-gray-800 dark:text-white">
              In-scope Requirements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FrameworkCard;
