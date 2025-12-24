"use client";
import CustomTabBar from "@/shared/core/CustomTabBar";
import useCustomTab from "@/shared/hooks/useCustomTab";
import dynamic from "next/dynamic";
import { useState } from "react";
import { IntegrationData } from "./Integration";
import SecurityTab from "./SecurityTab";
import SystemConnection from "./SystemConnection";
const Integration = dynamic(() => import("./Integration"), {
  ssr: false
});
const ApiKey = dynamic(() => import("./ApiKey"), {
  ssr: false
});
const Framework = dynamic(() => import("./Framework"), {
  ssr: false
});
const SubscriptionViewPage = dynamic(() => import("./SubscriptionViewPage"), {
  ssr: false
});
const ActivityLogsTab = dynamic(() => import("./ActivityLogsTab"), {
  ssr: false
});
const GeneralTab = dynamic(() => import("./GeneralTab"), {
  ssr: false
});

interface IsAccess {
  metadata: {
    reference: string;
  };
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        update: boolean;
        delete: boolean;
        create: boolean;
      };
    };
  }[];
}
const SystemSettings = () => {
  const [tab, setTab] = useState<string>("");
  const { activeReference, tabLabels, visibleTabs } = useCustomTab(tab);
  const renderActiveComponent = () => {
    switch (activeReference) {
      case "settings-general":
        return (
          <GeneralTab
            isAccess={
              visibleTabs?.find(
                (tabs) => tabs?.metadata?.reference === activeReference
              ) as IsAccess
            }
          />
        );
      case "security":
        return (
          <SecurityTab
          // isAccess={
          //   visibleTabs?.find(
          //     (tabs) => tabs?.metadata?.reference === activeReference
          //   ) as IsAccess
          // }
          />
        );
      case "settings-activity-log":
        return <ActivityLogsTab />;
      case "settings-billing":
        return (
          <SubscriptionViewPage
          // isAccess={
          //   visibleTabs?.find(
          //     (tab: any) => tab?.metadata?.reference === activeReference
          //   ) as any
          // }
          />
        );
      case "settings-compliance":
        return (
          <Framework
            isAccess={
              visibleTabs?.find(
                (tabs) => tabs?.metadata?.reference === activeReference
              ) as IsAccess
            }
          />
        );
      case "settings-connection":
        return <SystemConnection />;
      case "settings-api":
        return <ApiKey />;
      case "integration":
        return (
          <Integration
            isAccess={
              visibleTabs?.find(
                (tabs) => tabs?.metadata?.reference === activeReference
              ) as unknown as IntegrationData
            }
          />
        );
      default:
        return (
          <GeneralTab
            isAccess={
              visibleTabs?.find(
                (tabs) => tabs?.metadata?.reference === activeReference
              ) as IsAccess
            }
          />
        );
    }
  };

  return (
    <div className="h-fit p-2 sm:p-4">
      <div className="flex w-full flex-col gap-5">
        <CustomTabBar
          tabs={tabLabels}
          defaultTab={tabLabels[0] || ""}
          activeTab={tab}
          setActiveTab={setTab}
          instanceId="system-settings-tab"
          className="rounded-lg bg-white dark:bg-darkSidebarBackground"
        />
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-neutral-700 dark:bg-darkSidebarBackground">
          <div className="p-4">{renderActiveComponent()}</div>
        </div>
      </div>
    </div>
  );
};
export default SystemSettings;
