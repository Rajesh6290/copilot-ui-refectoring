"use client";
import CustomTabBar from "@/shared/core/CustomTabBar";
import useCustomTab from "@/shared/hooks/useCustomTab";
import dynamic from "next/dynamic";
import { useState } from "react";
const TestLibrary = dynamic(() => import("./TestLibrary"), {
  ssr: false
});
const TestRegister = dynamic(() => import("./TestRegister"), {
  ssr: false
});
interface IsAccess {
  metadata: {
    reference: string;
  };
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
const AutomateTest = () => {
  const [tab, setTab] = useState("");
  const { activeReference, tabLabels, visibleTabs } = useCustomTab(tab);
  const renderActiveComponent = () => {
    switch (activeReference) {
      case "test-register":
        return (
          <TestRegister
            isAccess={
              visibleTabs?.find(
                (tabItem) => tabItem?.metadata?.reference === activeReference
              ) as IsAccess
            }
          />
        );
      case "tests-library":
        return (
          <TestLibrary
            isAccess={
              visibleTabs?.find(
                (tabItem) => tabItem?.metadata?.reference === activeReference
              ) as IsAccess
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-fit w-full flex-col gap-5 overflow-y-auto p-1 pt-3">
      <CustomTabBar
        tabs={tabLabels}
        defaultTab={tabLabels[0] || ""}
        activeTab={tab}
        setActiveTab={setTab}
        className="rounded-lg bg-white drop-shadow-2 dark:bg-darkSidebarBackground"
        instanceId="Test-Tab"
      />
      {renderActiveComponent()}
    </div>
  );
};

export default AutomateTest;
