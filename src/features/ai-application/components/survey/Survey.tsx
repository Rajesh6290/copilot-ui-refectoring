"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTabBar from "@/shared/core/CustomTabBar";
import usePermission from "@/shared/hooks/usePermission";
import { useCurrentMenuItem } from "@/shared/utils";
import { Menu, Plus, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
const AllSurevey = dynamic(() => import("./AllSurevey"), {
  ssr: false
});
const UserSurvey = dynamic(() => import("./UserSurvey"), {
  ssr: false
});
const Survey = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isUserLoading } = usePermission();
  const [tab, setTab] = useState<string>("");
  const currentMenuItem = useCurrentMenuItem();

  // Updated permission checks to use the new API structure
  const hasReadPermission = currentMenuItem?.permission?.actions?.read;
  const hasCreatePermission = currentMenuItem?.permission?.actions?.create;
  const hasDeletePermission = currentMenuItem?.permission?.actions?.delete;
  const hasUpdatePermission = currentMenuItem?.permission?.actions?.update;

  // Check if user has only read permission (no create, delete, update)
  const isReadOnlyUser =
    !isUserLoading &&
    hasReadPermission &&
    !hasCreatePermission &&
    !hasDeletePermission &&
    !hasUpdatePermission;

  // Helper function to get button permissions
  const getButtonPermission = (buttonReference: string) => {
    return (
      currentMenuItem?.buttons?.find(
        (button) => button.metadata?.reference === buttonReference
      )?.permission?.is_shown || false
    );
  };

  // Get create survey permission from buttons
  const canCreateSurvey =
    getButtonPermission("create-survey") || hasCreatePermission;

  return isReadOnlyUser ? (
    <UserSurvey />
  ) : (
    <div className="flex h-[calc(100vh-110px)] w-full flex-col rounded-md bg-gray-50 dark:bg-darkSidebarBackground lg:flex-row">
      {/* Mobile Header */}
      {tab === "All Survey" && (
        <div className="flex items-center justify-between border-b bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-6 w-6 dark:text-gray-200" />
          </button>
          <h1 className="text-lg font-semibold dark:text-white">
            Survey Builder
          </h1>
        </div>
      )}

      {/* Sidebar */}
      {tab === "All Survey" && (
        <div
          className={` ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 w-64 rounded-l-md border-r bg-white transition-transform duration-300 ease-in-out dark:border-gray-700 dark:bg-darkSidebarBackground lg:static lg:translate-x-0`}
        >
          <div className={`space-y-4 p-4 ${isSidebarOpen ? "mt-14" : "mt-0"} `}>
            {/* Only show Create button if user has permission */}
            {canCreateSurvey && (
              <CustomButton
                className="capitalize"
                onClick={() => setIsCreateFormOpen(true)}
                type="button"
                startIcon={<Plus className="h-5 w-5" />}
              >
                Create New Survey
              </CustomButton>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border bg-gray-50 py-2 pl-10 pr-4 outline-none transition-shadow focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-darkMainBackground dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Recent Survey</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 rounded-r-md">
        <div className="space-y-6 p-3 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <CustomTabBar
              tabs={["My Survey", "All Survey"]}
              defaultTab="My Survey"
              activeTab={tab}
              setActiveTab={setTab}
              className="border-b dark:border-neutral-700"
              instanceId="survey-Tab"
            />
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 outline-none dark:border-gray-700 dark:bg-darkSidebarBackground dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {tab === "All Survey" ? (
            <AllSurevey
              isCreateFormOpen={isCreateFormOpen}
              setIsCreateFormOpen={setIsCreateFormOpen}
            />
          ) : (
            <UserSurvey />
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          tabIndex={0}
          role="button"
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsSidebarOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default Survey;
