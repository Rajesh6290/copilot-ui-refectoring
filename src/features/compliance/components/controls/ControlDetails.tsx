"use client";
import CustomTabBar from "@/shared/core/CustomTabBar";
import useCustomTab from "@/shared/hooks/useCustomTab";
import useSwr from "@/shared/hooks/useSwr";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useState } from "react";
import { LiaHeartbeatSolid } from "react-icons/lia";
import { PiGraph } from "react-icons/pi";
const EvidenceTable = dynamic(() => import("../evidence/EvidenceTable"), {
  ssr: false
});
const Findings = dynamic(() => import("../findings/Findings"), {
  ssr: false
});
const Issues = dynamic(() => import("../issues/Issues"), {
  ssr: false
});
const Requirements = dynamic(() => import("../requirements/Requirements"), {
  ssr: false
});
const Details = dynamic(() => import("./Details"), {
  ssr: false
});
const CustomNotes = dynamic(() => import("@/shared/core/CustomNotes"), {
  ssr: false
});

interface ISAccess {
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
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
}
// Skeleton Loader Component with Shimmer Effect
const ControlsSkeleton = () => {
  return (
    <div className="flex w-full flex-col gap-4 pt-3">
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .skeleton-shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(
            90deg,
            rgba(243, 244, 246, 0) 0%,
            rgba(243, 244, 246, 0.4) 20%,
            rgba(243, 244, 246, 0.8) 50%,
            rgba(243, 244, 246, 0.4) 80%,
            rgba(243, 244, 246, 0) 100%
          );
          background-size: 1000px 100%;
        }
        .dark .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            rgba(55, 65, 81, 0) 0%,
            rgba(55, 65, 81, 0.4) 20%,
            rgba(55, 65, 81, 0.8) 50%,
            rgba(55, 65, 81, 0.4) 80%,
            rgba(55, 65, 81, 0) 100%
          );
          background-size: 1000px 100%;
        }
        .skeleton-box {
          position: relative;
          overflow: hidden;
          background: #f3f4f6;
        }
        .dark .skeleton-box {
          background: #374151;
        }
      `}</style>

      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 flex h-fit w-full flex-col gap-5 rounded-[5px] border border-gray-200 bg-white p-4 dark:border-gray-600/30 dark:bg-neutral-900 lg:px-7 lg:pt-7">
        <div className="flex w-full flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <div className="skeleton-box skeleton-shimmer h-5 w-5 rounded"></div>
              <div className="skeleton-box skeleton-shimmer h-6 w-64 rounded"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="skeleton-box skeleton-shimmer h-8 w-24 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Tab Bar Skeleton */}
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton-box skeleton-shimmer h-10 w-28 rounded"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content Skeleton - Matches Control Details Structure */}
      <div className="py-2">
        <div className="rounded-[5px] border border-gray-200 bg-white dark:border-gray-600/30 dark:bg-neutral-900">
          {/* Title Section */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-600/30">
            <div className="skeleton-box skeleton-shimmer h-7 w-40 rounded"></div>
            <div className="skeleton-box skeleton-shimmer h-9 w-24 rounded-lg"></div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_400px]">
            {/* Left Column - Control Details */}
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div
                      className="skeleton-box skeleton-shimmer h-10 w-10 rounded-full"
                      style={{ animationDelay: `${item * 0.08}s` }}
                    ></div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div
                      className="skeleton-box skeleton-shimmer h-3 w-32 rounded"
                      style={{ animationDelay: `${item * 0.08}s` }}
                    ></div>
                    <div
                      className="skeleton-box skeleton-shimmer h-5 w-full max-w-md rounded"
                      style={{ animationDelay: `${item * 0.08 + 0.05}s` }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Tags Section */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="skeleton-box skeleton-shimmer h-10 w-10 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton-box skeleton-shimmer h-3 w-20 rounded"></div>
                  <div className="flex gap-2">
                    <div className="skeleton-box skeleton-shimmer h-7 w-24 rounded-full"></div>
                    <div
                      className="skeleton-box skeleton-shimmer h-7 w-32 rounded-full"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="skeleton-box skeleton-shimmer h-7 w-28 rounded-full"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Health Metrics */}
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-600/30 dark:bg-neutral-800/30">
                {/* Health Metrics Title */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="skeleton-box skeleton-shimmer h-5 w-5 rounded"></div>
                  <div className="skeleton-box skeleton-shimmer h-6 w-32 rounded"></div>
                </div>

                {/* Implementation Status */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="skeleton-box skeleton-shimmer h-4 w-4 rounded"></div>
                      <div className="skeleton-box skeleton-shimmer h-4 w-32 rounded"></div>
                    </div>
                    <div className="skeleton-box skeleton-shimmer h-4 w-24 rounded"></div>
                  </div>
                  <div className="skeleton-box skeleton-shimmer h-2 w-full rounded-full"></div>
                </div>

                {/* Readiness Status */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="skeleton-box skeleton-shimmer h-4 w-4 rounded"></div>
                      <div className="skeleton-box skeleton-shimmer h-4 w-32 rounded"></div>
                    </div>
                    <div className="skeleton-box skeleton-shimmer h-4 w-24 rounded bg-red-100 dark:bg-red-900/20"></div>
                  </div>
                  <div className="skeleton-box skeleton-shimmer h-2 w-full rounded-full bg-red-100 dark:bg-red-900/20"></div>
                </div>

                {/* Grid Metrics */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="skeleton-box skeleton-shimmer h-3 w-24 rounded"></div>
                    <div className="flex items-center gap-2">
                      <div className="skeleton-box skeleton-shimmer h-4 w-4 rounded"></div>
                      <div className="skeleton-box skeleton-shimmer h-4 w-16 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton-box skeleton-shimmer h-3 w-32 rounded"></div>
                    <div className="flex items-center gap-2">
                      <div className="skeleton-box skeleton-shimmer h-4 w-4 rounded"></div>
                      <div className="skeleton-box skeleton-shimmer h-4 w-24 rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="skeleton-box skeleton-shimmer h-3 w-24 rounded"></div>
                    <div className="flex items-center gap-2">
                      <div className="skeleton-box skeleton-shimmer h-4 w-4 rounded"></div>
                      <div className="skeleton-box skeleton-shimmer h-4 w-20 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="skeleton-box skeleton-shimmer h-3 w-24 rounded"></div>
                    <div className="flex items-center gap-2">
                      <div className="skeleton-box skeleton-shimmer h-4 w-4 rounded"></div>
                      <div className="skeleton-box skeleton-shimmer h-4 w-16 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ControlDetails = () => {
  const params = useParams();
  const controlId = params["id"];
  const { data, isValidating, mutate } = useSwr(
    controlId && controlId?.length > 0 ? `control?doc_id=${controlId}` : null
  );
  const [tab, setTab] = useState<string>("");
  const { activeReference, tabLabels, visibleTabs } = useCustomTab(tab);
  const currentTab = tab || tabLabels[0];
  const getTabContent = () => {
    const backendTabName = activeReference || tabLabels[0];

    // Map backend tab names to content
    const contentMapping: { [key: string]: React.ReactNode } = {
      details: <Details data={data} />,
      issues: (
        <Issues
          controlId={controlId as string}
          isAccess={
            visibleTabs?.find(
              (tabItem: { tab_name: string }) =>
                tabItem.tab_name === activeReference
            ) as ISAccess
          }
        />
      ),
      evidence: (
        <EvidenceTable
          controlId={controlId as string}
          baseMutate={mutate}
          isAccess={
            visibleTabs?.find(
              (tabItem: { tab_name: string }) =>
                tabItem.tab_name === activeReference
            ) as ISAccess
          }
        />
      ),
      Requirements: <Requirements data={data?.requirement || {}} />,
      findings: (
        <Findings
          controlId={controlId as string}
          isAccess={
            visibleTabs?.find(
              (tabItem: { tab_name: string }) =>
                tabItem.tab_name === activeReference
            ) as ISAccess
          }
        />
      ),
      notes: (
        <div className="h-[calc(100vh-200px)] w-full">
          <CustomNotes
            id={controlId as string}
            type="Control"
            isAccess={
              visibleTabs?.find(
                (tabItem: { tab_name: string }) =>
                  tabItem.tab_name === activeReference
              ) as ISAccess
            }
          />
        </div>
      )
    };

    // Also support frontend display names as fallback
    const displayNameMapping: { [key: string]: React.ReactNode } = {
      Details: <Details data={data} />,
      Issues: (
        <Issues
          controlId={controlId as string}
          isAccess={
            visibleTabs?.find(
              (tabItem: { tab_name: string }) =>
                tabItem.tab_name === activeReference
            ) as ISAccess
          }
        />
      ),
      Evidence: (
        <EvidenceTable
          controlId={controlId as string}
          baseMutate={mutate}
          isAccess={
            visibleTabs?.find(
              (tabItem: { tab_name: string }) =>
                tabItem.tab_name === activeReference
            ) as ISAccess
          }
        />
      ),
      Requirements: <Requirements data={data?.requirement || {}} />,
      findings: (
        <Findings
          controlId={controlId as string}
          isAccess={
            visibleTabs?.find(
              (tabItem: { tab_name: string }) =>
                tabItem.tab_name === activeReference
            ) as ISAccess
          }
        />
      ),
      Notes: (
        <div className="h-[calc(100vh-200px)] w-full">
          <CustomNotes
            id={controlId as string}
            type="Control"
            isAccess={
              visibleTabs?.find(
                (tabItem: { tab_name: string }) =>
                  tabItem.tab_name === activeReference
              ) as ISAccess
            }
          />
        </div>
      )
    };

    // Try backend name first, then display name, then default
    return (
      (backendTabName && contentMapping[backendTabName.toLowerCase()]) ||
      (currentTab && displayNameMapping[currentTab]) || <Details data={data} />
    );
  };

  // Show skeleton loader when validating and no data
  if (isValidating && !data) {
    return <ControlsSkeleton />;
  }

  return (
    <div className="flex w-full flex-col gap-4 pt-3">
      <div className="sticky top-0 z-50 flex h-fit w-full flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-darkSidebarBackground lg:px-7 lg:pt-7">
        <div className="flex w-full flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <PiGraph className="text-xl text-gray-700 dark:text-gray-300" />
              <p className="text-lg text-gray-950 dark:text-gray-300">
                <span className="font-semibold uppercase">{data?.id}</span>{" "}
                {data?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1 rounded-[8px] px-2 py-1 text-sm ${
                  data?.health_status === "healthy"
                    ? "bg-green-50 text-green-700"
                    : data?.health_status === "at_risk"
                      ? "bg-red-50 text-red-700"
                      : "bg-blue-50 text-blue-700"
                } `}
              >
                <LiaHeartbeatSolid className="text-base" />
                <span className="capitalize tracking-wider">
                  {data?.health_status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <CustomTabBar
          tabs={tabLabels}
          defaultTab={tabLabels[0] || "Overview"}
          activeTab={currentTab || ""}
          setActiveTab={setTab}
          instanceId="Main-Tab"
        />
      </div>
      <div className="py-2">{getTabContent()}</div>
    </div>
  );
};

export default ControlDetails;
