"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import dynamic from "next/dynamic";
import { PolicyTemplate } from "./PolicyAssistant";

interface TabbedSidebarProps {
  data: { data?: PolicyTemplate[] };
  selectedTemplate: PolicyTemplate | null;
  setSelectedTemplate: (template: PolicyTemplate | null) => void;
  setQuery: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const QuickPrompts = dynamic(() => import("./QuickPrompt"), {
  ssr: false
});
const PolicyTemplateSelector = dynamic(
  () => import("./PolicyTemplateSelector"),
  {
    ssr: false
  }
);

const TabbedSidebar = ({
  data,
  selectedTemplate,
  setSelectedTemplate,
  setQuery,
  inputRef
}: TabbedSidebarProps) => {
  const [activeTab, setActiveTab] = useState("templates");

  return (
    <div className="flex h-full flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-neutral-600">
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "templates"
              ? "border-b-2 border-tertiary-500 text-tertiary-600 dark:text-tertiary-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab("quickPrompts")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "quickPrompts"
              ? "border-b-2 border-tertiary-500 text-tertiary-600 dark:text-tertiary-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          Quick Prompts
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "quickPrompts" ? (
            <motion.div
              key="quickPrompts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <QuickPrompts setQuery={setQuery} inputRef={inputRef} />
            </motion.div>
          ) : (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PolicyTemplateSelector
                data={data}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default TabbedSidebar;
