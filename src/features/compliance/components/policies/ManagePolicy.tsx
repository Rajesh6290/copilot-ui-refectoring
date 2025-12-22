"use client";
import CustomTabBar from "@/shared/core/CustomTabBar";
import useCustomTab from "@/shared/hooks/useCustomTab";
import useMutation from "@/shared/hooks/useMutation";
import { useMyContext } from "@/shared/providers/AppProvider";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AllAccess } from "./PoliciesRegister";
const PolicyAssistant = dynamic(() => import("./PolicyAssistant"), {
  ssr: false
});
const PoliciesRegister = dynamic(() => import("./PoliciesRegister"), {
  ssr: false
});
const PoliciesLibrary = dynamic(() => import("./PoliciesLibrary"), {
  ssr: false
});

interface Tab {
  metadata?: {
    reference?: string;
  };
}

interface IsAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        read: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
      };
    };
  }[];
}

const ManagePolicy = () => {
  const [tab, setTab] = useState("");
  const { mutation } = useMutation();
  const { userId } = useAuth();
  const [sessionId, setSessionId] = useState<string>("");
  const { setFullScreen } = useMyContext();
  const { activeReference, currentAccess, tabLabels } = useCustomTab(tab);

  const handleGenerateSession = useCallback(async () => {
    try {
      const res = await mutation("conversation/chat_id", {
        method: "POST",
        body: { user_id: userId }
      });
      if (res?.status === 200) {
        if (res?.results?.session_id) {
          setSessionId(res?.results?.session_id);
        } else {
          toast.error("Failed to generate session");
        }
      } else {
        toast.error("Failed to generate session");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  }, [userId, mutation]);

  useEffect(() => {
    if (tab === "Policy Assistant") {
      handleGenerateSession();
    } else {
      setSessionId("");
    }
  }, [tab, handleGenerateSession]);

  useEffect(() => {
    if (tab === "Policy Assistant") {
      setFullScreen(true);
    } else {
      setFullScreen(false);
    }
  }, [tab, setFullScreen]);

  // Helper function to get button access for specific tab
  const getTabButtonAccess = (tabReference: string): IsAccess => {
    const targetTab = currentAccess?.tabs?.find(
      (t: Tab) => t.metadata?.reference === tabReference
    );
    return targetTab || { buttons: [] };
  };

  const renderActiveComponent = () => {
    switch (activeReference) {
      case "policies-register":
        return (
          <PoliciesRegister
            isAccess={getTabButtonAccess("policies-register")}
            allAccess={currentAccess?.permission as AllAccess}
          />
        );
      case "policies-library":
        return (
          <PoliciesLibrary
            isAccess={getTabButtonAccess("policies-library")}
            allAccess={currentAccess?.permission as AllAccess}
          />
        );
      case "policies-assistant":
        return (
          <PolicyAssistant
            sessionId={sessionId as string}
            setSessionId={setSessionId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 overflow-y-auto p-1 pt-3">
      <CustomTabBar
        tabs={tabLabels} // Display labels
        defaultTab={tabLabels[0] || ""}
        activeTab={tab}
        setActiveTab={setTab}
        className="rounded-lg bg-white drop-shadow-2 dark:bg-darkSidebarBackground"
        instanceId="policy-Tab"
      />
      {renderActiveComponent()}
    </div>
  );
};

export default ManagePolicy;
