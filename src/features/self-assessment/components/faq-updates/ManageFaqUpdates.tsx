"use client";
import CustomTabBar from "@/shared/core/CustomTabBar";
import useCustomTab from "@/shared/hooks/useCustomTab";
import { useState } from "react";
import { FAQIsAccess } from "./FAQs";
import { UpdateIsAccess } from "./Updates";
import dynamic from "next/dynamic";
const Updates = dynamic(() => import("./Updates"), {
  ssr: false
});
const FAQs = dynamic(() => import("./FAQs"), {
  ssr: false
});
const ManageFaqUpdates = () => {
  const [tab, setTab] = useState<string>("");
  const { currentAccess, tabLabels, activeReference } = useCustomTab(tab);
  const renderActiveComponent = () => {
    switch (activeReference) {
      case "FAQs":
        return (
          <FAQs
            isAccess={
              (currentAccess?.tabs?.find(
                (t) => t.metadata?.reference === "FAQs"
              ) as FAQIsAccess | undefined) || ({} as FAQIsAccess)
            }
          />
        );
      case "updates":
        return (
          <Updates
            isAccess={
              (currentAccess?.tabs?.find(
                (t) => t.metadata?.reference === "updates"
              ) as UpdateIsAccess | undefined) || ({} as UpdateIsAccess)
            }
          />
        );
      default:
        return (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-400">
            No Data Found
          </div>
        );
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 p-2">
      <CustomTabBar
        tabs={tabLabels}
        defaultTab={tabLabels[0] || ""}
        activeTab={tab}
        setActiveTab={setTab}
        className="border-b dark:border-neutral-600"
        instanceId="FaqUpdates-Tab"
      />
      {renderActiveComponent()}
    </div>
  );
};

export default ManageFaqUpdates;
