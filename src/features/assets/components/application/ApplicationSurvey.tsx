"use client";

import CustomTabBar from "@/shared/core/CustomTabBar";
import { useState } from "react";
import dynamic from "next/dynamic";
const SurveyRegister = dynamic(() => import("./SurveyRegister"), {
  ssr: false
});
const ApplicationSurvey = () => {
  const [tab, setTab] = useState("");
  return (
    <div className="flex w-full flex-col gap-5">
      <CustomTabBar
        // tabs={["Register", "Library"]}
        tabs={["Register"]}
        defaultTab="Register"
        activeTab={tab}
        setActiveTab={setTab}
        className="border-b border-neutral-300"
        instanceId="Survey-Tab"
      />
      <div className="h-fit w-full">
        {
          {
            Register: <SurveyRegister />
            // Library: <SurveyLibrary applicationId={applicationId} />,
          }[tab]
        }
      </div>
    </div>
  );
};

export default ApplicationSurvey;
