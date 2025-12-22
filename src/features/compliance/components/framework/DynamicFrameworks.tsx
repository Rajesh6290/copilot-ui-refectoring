"use client";
import CustomTabBar from "@/shared/core/CustomTabBar";
import useSwr from "@/shared/hooks/useSwr";
import { CircleCheckBig, CircleX, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AnimatedCircle from "./AnimatedCircle";
import dynamic from "next/dynamic";
const FrameworkTableComponents = dynamic(
  () => import("./FrameworkTableComponent"),
  {
    ssr: false
  }
);

export interface Requirement extends Record<string, unknown> {
  id: string;
  section: string;
  requirement_name: string;
  framework: string;
  description: string;
  framework_category: string;
  control_ids: string[];
  requirement_type: string;
  status: string;
  point_of_focus: string[];
  tags: string[];
  scope: string;
  readiness_status: string;
  created_at: string;
  updated_at: string;
  doc_id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
}
export interface PaginationData {
  total_records: number;
  current_page: number;
  per_page: number;
  total_pages: number;
}
export interface RequirementsResponse extends Record<string, unknown> {
  requirements: Requirement[];
  stats: {
    total_ready: number;
    total_not_ready: number;
    total_in_scope: number;
    total_out_of_scope: number;
  };
  pagination: PaginationData;
  framework_details: {
    name: string;
    description: string;
    badge_url: string;
    compliance_status: string;
  };
}

const DynamicFrameworks = () => {
  const params = useSearchParams();
  const frameworkName = params?.get("framework-name");
  const frameworkId = params?.get("framework-id");
  const [activeTab, setActiveTab] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState<string>("");
  const [pageSize, setPageSize] = useState(10);
  const [ready, setReady] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  let url = activeTab
    ? `requirements?page=${page + 1}&limit=${pageSize}&framework=${decodeURIComponent(frameworkId as string)}`
    : null;
  if (query?.length > 0) {
    url += `&keywords=${query}`;
  }
  if (category?.length > 0) {
    url += `&framework_category=${category}`;
  }
  if (ready?.length > 0) {
    url += `&readiness_status=${ready}`;
  }
  if (activeTab?.length > 0) {
    url += `&scope=${activeTab === "In Scope" ? "in_scope" : "out_of_scope"}`;
  }
  const { data, isValidating, mutate } = useSwr(url, {
    keepPreviousData: true
  });

  const handleSearchData = (value: string) => {
    setDebouncedQuery(value);
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      setQuery(debouncedQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedQuery, setQuery]);
  return (
    <div className="flex size-full flex-col gap-10 px-2 py-4">
      <div className="shadow-1 flex h-full w-full flex-col items-start justify-center gap-3 rounded-lg bg-white p-4 drop-shadow-1 dark:bg-darkSidebarBackground dark:drop-shadow-none">
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex w-full flex-col items-center gap-4 lg:flex-row">
            <div className="size-24 overflow-hidden lg:size-16">
              <img
                src={data?.framework_details?.badge_url}
                alt="framework-logo"
                className="size-full object-contain"
              />
            </div>
            <p className="text-xl font-semibold text-tertiary lg:text-2xl">
              {data?.framework_details?.name}
            </p>
          </div>
          <div className="lg:ml-auto">
            <div className="mb-0 flex w-full items-center justify-start lg:justify-center">
              {(() => {
                const readyRequirements =
                  data?.framework_details?.requirement_stats
                    ?.ready_requirements ?? 0;
                const inScopeRequirements =
                  data?.framework_details?.requirement_stats
                    ?.in_scope_requirements ?? 0;
                const completionPercentage =
                  inScopeRequirements > 0
                    ? Math.floor(
                        (readyRequirements / inScopeRequirements) * 100
                      )
                    : 0;
                const isCompliant = completionPercentage === 100;
                return (
                  <div
                    className={`flex items-center gap-2 rounded-full px-4 py-2 ${
                      isCompliant
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    <span
                      className={`flex size-6 items-center justify-center rounded-full ${
                        isCompliant ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <CircleCheckBig className="text-white" size={12} />
                    </span>
                    <span className="text-nowrap text-sm font-semibold">
                      {isCompliant ? "Compliant" : "Not Compliant"}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        <p className="text-clip text-sm font-medium text-neutral-500 dark:text-gray-300">
          {data?.framework_details?.description}
        </p>
      </div>
      <div className="flex h-fit w-full gap-5">
        <div className="grid h-full w-full grid-cols-1 items-center gap-5 lg:grid-cols-4">
          <div className="shadow-1 flex size-full items-center justify-center rounded-lg bg-white drop-shadow-1 dark:bg-darkSidebarBackground dark:drop-shadow-none">
            <AnimatedCircle
              value={
                Math.floor(
                  (data?.stats?.total_ready / data?.pagination?.total_records) *
                    100
                ) || 0
              }
              size={170}
            />
          </div>
          <div className="shadow-1 flex size-full items-center justify-center rounded-lg bg-white p-2 drop-shadow-1 dark:bg-darkSidebarBackground dark:drop-shadow-none">
            <div className="flex flex-col items-center gap-3">
              <span className="flex size-16 items-center justify-center rounded-full bg-red-50">
                <CircleX className="text-red-500" size={30} />
              </span>
              <p className="text-4xl font-bold text-gray-800 dark:text-white">
                {data?.stats?.total_not_ready || 0}/
                {data?.pagination?.total_records || 0}
              </p>
              <p className="w-full text-center text-lg font-medium tracking-wider text-neutral-700 dark:text-gray-300">
                Requirements are Not Ready
              </p>
            </div>
          </div>
          <div className="shadow-1 flex size-full items-center justify-center rounded-lg bg-white p-2 drop-shadow-1 dark:bg-darkSidebarBackground dark:drop-shadow-none">
            <div className="flex flex-col items-center gap-3">
              <span className="flex size-16 items-center justify-center rounded-full bg-green-50">
                <CircleCheckBig className="text-green-500" size={30} />
              </span>
              <p className="text-4xl font-bold text-gray-800 dark:text-white">
                {data?.stats?.total_ready || 0}/
                {data?.pagination?.total_records || 0}
              </p>
              <p className="w-full text-center text-lg font-medium tracking-wider text-neutral-700 dark:text-gray-300">
                Requirements are Ready
              </p>
            </div>
          </div>
          <div className="shadow-1 flex size-full items-center justify-center rounded-lg bg-white p-2 drop-shadow-1 dark:bg-darkSidebarBackground dark:drop-shadow-none">
            <div className="flex flex-col items-center gap-3">
              <span className="flex size-16 items-center justify-center rounded-full bg-tertiary-50">
                <SlidersHorizontal className="text-tertiary-500" size={30} />
              </span>
              <p className="text-4xl font-bold text-gray-800 dark:text-white">
                {data?.stats?.total_in_scope || 0}
              </p>
              <p className="text-lg font-medium tracking-wider text-neutral-700 dark:text-gray-300">
                In Scope Requirements
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative -mb-8 flex h-fit w-full flex-col items-center justify-between rounded-lg bg-white p-2 shadow-sm dark:bg-darkSidebarBackground lg:flex-row">
        <span className="absolute -left-0 top-0 h-full w-1.5 rounded-l-2xl bg-tertiary/70"></span>
        <CustomTabBar
          tabs={["In Scope", "Out Of Scope"]}
          defaultTab="In Scope"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          className="w-full text-nowrap"
          instanceId="scope-Tab"
        />
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <svg
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            value={debouncedQuery}
            onChange={(e) => handleSearchData(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2 ps-10 text-sm text-gray-900 outline-none focus:border-tertiary-500 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-darkMainBackground dark:text-white dark:placeholder-gray-400"
            placeholder="Search requirements...."
            required
          />
        </div>
      </div>
      <FrameworkTableComponents
        frameworkName={frameworkName as string}
        query={query}
        setQuery={setQuery}
        page={page}
        setPage={setPage}
        category={category}
        setCategory={setCategory}
        pageSize={pageSize}
        setPageSize={setPageSize}
        data={data}
        isValidating={isValidating}
        setReady={setReady}
        ready={ready}
        activeTab={activeTab}
        mutate={mutate}
        frameworkId={frameworkId as string}
      />
    </div>
  );
};

export default DynamicFrameworks;
