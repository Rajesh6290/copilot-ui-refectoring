"use client";
import CustomTabBar from "@/shared/core/CustomTabBar";
import useCustomTab from "@/shared/hooks/useCustomTab";
import dynamic from "next/dynamic";
import { useState } from "react";
const AuditLibrary = dynamic(() => import("./AuditLibrary"), {
  ssr: false
});
const AuditRegister = dynamic(() => import("./AuditRegister"), {
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

const AuditManagement = () => {
  const [tab, setTab] = useState("");
  const { activeReference, tabLabels, visibleTabs } = useCustomTab(tab);
  const renderActiveComponent = () => {
    switch (activeReference) {
      case "audits-register":
        return (
          <AuditRegister
            isAccess={
              visibleTabs?.find(
                (visibleTab) =>
                  visibleTab?.metadata?.reference === activeReference
              ) as IsAccess
            }
          />
        );
      case "audits-library":
        return <AuditLibrary />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-fit w-full flex-col gap-5 overflow-y-auto p-1 pt-3">
      <CustomTabBar
        tabs={tabLabels}
        defaultTab={tabLabels[0] as ""}
        activeTab={tab}
        setActiveTab={setTab}
        className="rounded-lg bg-white drop-shadow-2 dark:bg-darkSidebarBackground"
        instanceId="Test-Tab"
      />
      {renderActiveComponent()}
    </div>
  );
};

export default AuditManagement;
