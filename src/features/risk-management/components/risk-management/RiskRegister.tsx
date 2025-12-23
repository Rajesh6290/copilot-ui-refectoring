"use client";
import useSwr from "@/shared/hooks/useSwr";
import { Tooltip } from "@mui/material";
import { Filter } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
const RiskTable = dynamic(() => import("./RiskTable"), {
  ssr: false
});
const RiskFilter = dynamic(() => import("./RiskFilter"), {
  ssr: false
});
const AnimatedCircle = dynamic(() => import("./AnimatedCircle"), {
  ssr: false
});

export interface Risk extends Record<string, unknown> {
  id: string;
  name: string;
  common_name: string;
  description: string;
  risk_category: string;
  source: string;
  risk_type: string;
  end_user: string[];
  task_criticality: string[];
  application_type: string[];
  connectors: unknown[];
  asset_category: string;
  framework_reference: string[];
  reference: Record<string, unknown>;
  control_effectiveness: number;
  likelihood: string;
  impact: string;
  risk_level: string;
  risk_score: number;
  control_ids: string[];
  indicator_ids: string[];
  use_case_id: string;
  application_ids: string[];
  readiness_status: string;
  version: string;
  risk_owner: string;
  tags: string;
  created_at: string;
  updated_at: string;
  status: string;
  control_doc_ids: string[];
  doc_id: string;
  original_risk_id: string;
  tenant_id: string;
  client_id: string;
  application_name: string[];
}

interface HeatmapColorCount {
  label: string;
  value: number;
}

interface HeatmapColorCounts {
  green: HeatmapColorCount;
  orange: HeatmapColorCount;
  red: HeatmapColorCount;
}

interface CategoryCounts {
  mitigated: number;
  not_mitigated: number;
}

interface Analytics {
  heatmap_color_counts: HeatmapColorCounts;
  category_counts: CategoryCounts;
  total_risk_count: number;
}

interface Pagination {
  total_records: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface RisksResponse {
  risks: Risk[];
  pagination: Pagination;
  analytics: Analytics;
}
export interface CircleDisplayMode {
  mode: "mitigated" | "not_mitigated";
  label: string;
  value: number;
  total: number;
  percentage: number;
}
export interface IsAccess {
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

const RiskRegister = ({ isAccess }: { isAccess: IsAccess }) => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [type, setType] = useState<string>("Current");
  const [filterUrl, setFilterUrl] = useState("");
  const baseUrl = useMemo(
    () => `risks?page=${page + 1}&limit=${limit}&state=${type}`,
    [page, limit, type]
  );
  const finalUrl = useMemo(() => {
    if (filterUrl && filterUrl !== baseUrl) {
      const filterParams = filterUrl.replace(baseUrl, "").replace(/^&/, "");
      return filterParams ? `${baseUrl}&${filterParams}` : baseUrl;
    }
    return baseUrl;
  }, [baseUrl, filterUrl]);
  const { data: riskData, isValidating, mutate } = useSwr(finalUrl);
  const [circleMode, setCircleMode] = useState<"mitigated" | "not_mitigated">(
    "not_mitigated"
  );
  const data = [
    {
      value: riskData?.analytics?.heatmap_color_counts?.green?.value || 0,
      color: "#53BD6F",
      lable: riskData?.analytics?.heatmap_color_counts?.green?.label || "Low"
    },
    {
      value: riskData?.analytics?.heatmap_color_counts?.orange?.value || 0,
      color: "#FFBE0F",
      lable:
        riskData?.analytics?.heatmap_color_counts?.orange?.label || "Medium"
    },
    {
      value: riskData?.analytics?.heatmap_color_counts?.red?.value || 0,
      color: "#F06C6C",
      lable: riskData?.analytics?.heatmap_color_counts?.red?.label || "High"
    }
  ];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const hasData = total > 0;

  const handleUrlChange = useCallback((newUrl: string) => {
    setFilterUrl(newUrl);
  }, []);

  // Calculate circle display data - ONLY 2 modes
  const getCircleDisplayData = (): CircleDisplayMode => {
    const totalRisks = riskData?.analytics?.total_risk_count || 0;
    const mitigated = riskData?.analytics?.category_counts?.mitigated || 0;
    const notMitigated =
      riskData?.analytics?.category_counts?.not_mitigated || 0;

    if (circleMode === "mitigated") {
      return {
        mode: "mitigated",
        label: "Mitigated",
        value: mitigated,
        total: totalRisks,
        percentage: totalRisks > 0 ? (mitigated / totalRisks) * 100 : 0
      };
    } else {
      return {
        mode: "not_mitigated",
        label: "Not Mitigated",
        value: notMitigated,
        total: totalRisks,
        percentage: totalRisks > 0 ? (notMitigated / totalRisks) * 100 : 0
      };
    }
  };

  const handleCircleClick = () => {
    // Toggle between ONLY 2 modes
    setCircleMode(circleMode === "mitigated" ? "not_mitigated" : "mitigated");
  };

  return (
    <div className="flex h-fit w-full flex-col gap-5">
      <div className="flex w-full flex-col items-center gap-5 lg:flex-row">
        <div className="shadow-1 flex h-[13rem] w-full flex-col items-center justify-center gap-2 rounded-xl bg-white py-3 drop-shadow-1 dark:bg-darkSidebarBackground dark:shadow-none dark:drop-shadow-none sm:w-1/2 xl:w-[20%] 2xl:w-[14%]">
          <AnimatedCircle
            displayData={getCircleDisplayData()}
            onClick={handleCircleClick}
            size={170}
          />
        </div>
        <div className="shadow-1 flex h-[13rem] w-full flex-col gap-5 rounded-xl bg-white p-4 drop-shadow-1 dark:bg-darkSidebarBackground dark:shadow-none dark:drop-shadow-none sm:w-1/2 xl:w-[80%] 2xl:w-[86%]">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <p className="text-xl font-medium text-gray-800 dark:text-white">
              Risk posture
            </p>
            <div className="flex items-center gap-8">
              <Filter className="mt-1.5 h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div className="flex items-center justify-center gap-4">
                {["Current", "Residual"]?.map((item: string, index: number) => (
                  <div
                    key={index}
                    tabIndex={0}
                    role="button"
                    onClick={() => setType(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setType(item);
                      }
                    }}
                    className={`cursor-pointer text-lg font-medium ${
                      type === item
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-600 dark:text-white"
                    } `}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Posture Bar or Empty State */}
          {hasData ? (
            <div className="flex h-12 w-full gap-0.5 overflow-hidden rounded-md">
              {data
                ?.filter((i) => i?.value > 0)
                ?.map((item, index) => (
                  <Tooltip
                    title={`${item.lable}: ${item.value}`}
                    placement="top"
                    key={index}
                  >
                    <div
                      style={{
                        backgroundColor: item.color,
                        width: `${(item.value / total) * 100}%`
                      }}
                      className="flex size-full cursor-pointer items-center justify-center text-white"
                    >
                      {item.value}
                    </div>
                  </Tooltip>
                ))}
            </div>
          ) : (
            <div
              style={{
                width: "100%"
              }}
              className="flex size-full h-16 cursor-pointer items-center justify-center rounded-xl bg-gray-300 text-white"
            >
              0
            </div>
          )}
          <div className="flex items-center justify-end gap-4">
            {data.map((item, index) => (
              <Tooltip
                key={index}
                title={`${item.lable}: ${item.value} risk${item.value !== 1 ? "s" : ""}`}
                placement="top"
              >
                <div className="flex cursor-pointer items-center gap-2">
                  <div
                    className="h-3 w-3 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.lable}
                  </span>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full">
        <RiskFilter
          baseUrl={baseUrl}
          onUrlChange={handleUrlChange}
          showApplication={true}
        />
      </div>
      <RiskTable
        type={type}
        data={riskData}
        isValidating={isValidating}
        limit={limit}
        mutate={mutate}
        page={page}
        setLimit={setLimit}
        setPage={setPage}
        isAccess={isAccess}
      />
    </div>
  );
};

export default RiskRegister;

// AnimatedCircle component - ONLY 2 modes
