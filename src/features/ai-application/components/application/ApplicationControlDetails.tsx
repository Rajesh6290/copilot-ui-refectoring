"use client";
import CustomLoading from "@/shared/common/CustomLoading";
import useSwr from "@/shared/hooks/useSwr";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction, useState } from "react";
import { LiaHeartbeatSolid } from "react-icons/lia";
import { PiGraph } from "react-icons/pi";
const CustomNotes = dynamic(() => import("@/shared/core/CustomNotes"), {
  ssr: false
});
const Requirements = dynamic(
  () => import("@/features/compliance/components/requirements/Requirements"),
  {
    ssr: false
  }
);
const Issues = dynamic(
  () => import("@/features/compliance/components/issues/Issues"),
  {
    ssr: false
  }
);
const EvidenceTable = dynamic(
  () => import("@/features/compliance/components/evidence/EvidenceTable"),
  {
    ssr: false
  }
);
const Details = dynamic(
  () => import("@/features/compliance/components/controls/Details"),
  {
    ssr: false
  }
);

const ApplicationControlDetails = ({
  controlId
}: {
  controlId: string;
  setControlId: Dispatch<SetStateAction<string>>;
}) => {
  const { data, isValidating, mutate } = useSwr(
    controlId?.length > 0 ? `control?doc_id=${controlId}` : null
  );
  const [tab, setTab] = useState<string>("Details");
  return isValidating ? (
    <div className="flex size-full items-center justify-center">
      <CustomLoading message="Fetching controls...." />
    </div>
  ) : (
    <div className="flex w-full flex-col gap-4">
      <div className="sticky top-0 z-50 flex h-fit w-full flex-col gap-10 rounded-[5px] border border-gray-200 bg-white px-7 pt-7 dark:border-gray-600/30 dark:bg-neutral-900">
        <div className="flex w-full flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <PiGraph className="text-xl text-gray-700 dark:text-gray-300" />
              <p className="text-lg text-gray-950 dark:text-gray-300">
                <span className="font-semibold">{data?.id}</span> {data?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1 rounded-[8px] px-2 py-1 text-sm ${
                  data?.health_status === "healthy"
                    ? "bg-green-50 text-green-700"
                    : data?.health_status === "at_risk"
                      ? "bg-red-50 text-red-700"
                      : "bg-blue-50 text-blue-700"
                } `}
              >
                <LiaHeartbeatSolid className="text-base" />
                <span className="capitalize tracking-wider">
                  {data?.health_status}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="hideScrollbar flex w-full items-center gap-3 overflow-x-auto px-1">
          {["Details", "Issues", "Evidence", "Requirements", "Notes"]?.map(
            (item: string, index: number) => (
              <div
                tabIndex={0}
                key={index}
                role="button"
                onClick={() => setTab(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setTab(item);
                  }
                }}
                className={`relative inline-flex cursor-pointer items-center whitespace-nowrap px-2 pb-2 align-baseline font-medium text-gray-950 dark:text-gray-300 ${item === tab ? "border-b-2 border-[#693EE0]" : "border-b-2 border-transparent"} `}
              >
                {item}
              </div>
            )
          )}
        </div>
      </div>
      <div className="p-2">
        {tab === "Details" ? (
          <Details data={data} />
        ) : tab === "Issues" ? (
          <Issues controlId={controlId as string} />
        ) : tab === "Notes" ? (
          <CustomNotes id={controlId as string} type="application" />
        ) : tab === "Requirements" ? (
          <Requirements data={data} />
        ) : tab === "Evidence" ? (
          <EvidenceTable controlId={controlId as string} baseMutate={mutate} />
        ) : null}
      </div>
    </div>
  );
};

export default ApplicationControlDetails;
