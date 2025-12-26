"use client";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import DynamicFormCreate from "./DynamicFormCreate";

interface TopNavItem {
  label: string;
  isActive: boolean;
}

const SurveyBuild: React.FC = () => {
  const [tab, setTab] = useState<string>("Create");
  const [surveyName, setSurveyName] = useState<{ survey_name?: string }>({});
  const [surveyStatus, setSurveyStatus] = useState<string>("");
  const topNavItems: TopNavItem[] = [
    { label: "Create", isActive: true }
    // { label: "Share", isActive: false },
  ];

  return (
    <div className="flex flex-col">
      {/* Top Navigation */}
      <nav className="h-14 border-b dark:border-gray-700">
        <div className="flex h-full items-center gap-10 px-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              {surveyName?.survey_name || "Loading...."}
            </span>
          </div>

          <div className="flex items-center space-x-8">
            {topNavItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item?.label === "Share") {
                    if (surveyStatus === "published") {
                      setTab(item.label);
                    } else {
                      toast.warning("Publish the survey to share it");
                    }
                  } else {
                    setTab(item.label);
                  }
                }}
                className={`relative px-1 py-4 text-sm ${
                  tab === item.label
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.label}
                {tab === item.label && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>
      {
        {
          Create: (
            <DynamicFormCreate
              setTab={setTab}
              setSurveyName={setSurveyName}
              setSurveyStatus={setSurveyStatus}
            />
          )
          // Share: <FormShare item={surveyName} />,
        }[tab]
      }
    </div>
  );
};

export default SurveyBuild;
