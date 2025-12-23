"use client";
import { ISAccess } from "@/features/compliance/components/evidence/EvidenceTable";
import CustomTabBar from "@/shared/core/CustomTabBar";
import useCustomTab from "@/shared/hooks/useCustomTab";
import dynamic from "next/dynamic";
import { useState } from "react";
const RiskScenario = dynamic(() => import("./RiskScenario"), {
  ssr: false
});
const RiskRegister = dynamic(() => import("./RiskRegister"), {
  ssr: false
});
const RiskLibrary = dynamic(() => import("./RiskLibrary"), {
  ssr: false
});
const Overview = dynamic(() => import("./Overview"), {
  ssr: false
});

export interface IsAccess {
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
const RiskManagement = () => {
  const [tab, setTab] = useState("");
  const { activeReference, tabLabels, visibleTabs } = useCustomTab(tab);
  const renderActiveComponent = () => {
    switch (activeReference) {
      case "risk-overview":
        return <Overview />;
      case "risk-register":
        return (
          <RiskRegister
            isAccess={
              visibleTabs?.find(
                (tabs) => tabs?.metadata?.reference === activeReference
              ) as ISAccess
            }
          />
        );
      case "risk-library":
        return (
          <RiskLibrary
            isAccess={
              visibleTabs?.find(
                (tabs) => tabs?.metadata?.reference === activeReference
              ) as ISAccess
            }
          />
        );
      case "risk-scenario":
        return (
          <RiskScenario
            isAccess={
              visibleTabs?.find(
                (tabs) => tabs?.metadata?.reference === activeReference
              ) as ISAccess
            }
          />
        );
      default:
        return <Overview />;
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
        instanceId="Risk-Tab"
      />
      {renderActiveComponent()}
    </div>
  );
};

export default RiskManagement;
