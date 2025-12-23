"use client";
import Empty from "@/shared/core/Empty";
import useSwr from "@/shared/hooks/useSwr";
import React, { useState } from "react";
import dynamic from "next/dynamic";
const DynamicHeatmap = dynamic(() => import("./DynamicHeatmap"), {
  ssr: false
});

export interface RiskData {
  matrix_size: number;
  likelihood_labels: string[];
  impact_labels: string[];
  risk_count_matrix: number[][];
  classified_risk_matrix: number[][];
}

interface ApiResponse {
  client_id: string;
  tenant_id: string;
  current_risk: RiskData;
  residual_risk: RiskData;
  current_risk_count: number;
  residual_risk_count: number;
}

const OverviewSkeleton: React.FC<{ matrixSize: number }> = ({ matrixSize }) => {
  const size = matrixSize;
  const cellSize = size === 3 ? 100 : 80;
  const padding = size === 3 ? 120 : 100;
  const svgWidth = size * cellSize + padding * 2;
  const svgHeight = size * cellSize + padding * 2;

  return (
    <div className="flex h-fit w-full flex-col gap-5">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <span className="flex flex-col gap-1">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="mt-1 h-5 w-96 animate-pulse rounded bg-gray-200"></div>
        </span>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex flex-wrap gap-4">
            {/* Summary card skeletons */}
            <div className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                <div className="h-4 w-32 rounded bg-gray-300"></div>
              </div>
            </div>
            <div className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                <div className="h-4 w-32 rounded bg-gray-300"></div>
              </div>
            </div>
          </div>
          <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200"></div>
        </div>
      </div>

      {/* Heatmap skeletons */}
      <div className="flex h-full w-full flex-col items-stretch gap-5 lg:flex-row">
        {/* Current Risk Skeleton */}
        <div className="shadow-1 relative h-fit w-full animate-pulse overflow-hidden rounded-xl bg-white p-5 drop-shadow-1">
          <div className="absolute left-5 top-3 z-10 h-6 w-32 rounded bg-gray-200"></div>

          <div className="flex h-full items-center justify-center">
            <svg
              width={svgWidth}
              height={svgHeight}
              className="h-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-full"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            >
              {/* Axis label skeletons */}
              <rect
                x={svgWidth / 2 - 40}
                y={svgHeight - 20}
                width={80}
                height={12}
                rx={6}
                fill="#e5e7eb"
              />
              <rect
                x={8}
                y={svgHeight / 2 - 40}
                width={12}
                height={80}
                rx={6}
                fill="#e5e7eb"
              />

              {/* Grid skeleton */}
              {Array.from({ length: size }).map((_, y) =>
                Array.from({ length: size }).map((_i, x) => (
                  <rect
                    key={`skeleton-current-${x}-${y}`}
                    x={padding + x * cellSize + 1}
                    y={padding + y * cellSize + 1}
                    width={cellSize - 2}
                    height={cellSize - 2}
                    fill="#f3f4f6"
                    stroke="#ffffff"
                    strokeWidth="2"
                    rx="4"
                  />
                ))
              )}
            </svg>
          </div>
        </div>

        {/* Residual Risk Skeleton */}
        <div className="shadow-1 relative h-fit w-full animate-pulse overflow-hidden rounded-xl bg-white p-5 drop-shadow-1">
          <div className="absolute left-5 top-3 z-10 h-6 w-32 rounded bg-gray-200"></div>

          <div className="flex h-full items-center justify-center">
            <svg
              width={svgWidth}
              height={svgHeight}
              className="h-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-full"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            >
              {/* Axis label skeletons */}
              <rect
                x={svgWidth / 2 - 40}
                y={svgHeight - 20}
                width={80}
                height={12}
                rx={6}
                fill="#e5e7eb"
              />
              <rect
                x={8}
                y={svgHeight / 2 - 40}
                width={12}
                height={80}
                rx={6}
                fill="#e5e7eb"
              />

              {/* Grid skeleton */}
              {Array.from({ length: size }).map((_, y) =>
                Array.from({ length: size }).map((_i, x) => (
                  <rect
                    key={`skeleton-residual-${x}-${y}`}
                    x={padding + x * cellSize + 1}
                    y={padding + y * cellSize + 1}
                    width={cellSize - 2}
                    height={cellSize - 2}
                    fill="#f3f4f6"
                    stroke="#ffffff"
                    strokeWidth="2"
                    rx="4"
                  />
                ))
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const Overview: React.FC = () => {
  const [matrixSize, setMatrixSize] = useState<number>(5);
  const [enableAnimation] = useState<boolean>(true);

  const { isValidating, data, mutate } = useSwr(
    `risks/heatmap?matrix_size=${matrixSize}`
  ) as {
    isValidating: boolean;
    data: ApiResponse | null;
    mutate: () => void;
  };

  const handleMatrixSizeChange = (size: number) => {
    setMatrixSize(size);
  };
  // Loading state
  if (isValidating) {
    return <OverviewSkeleton matrixSize={matrixSize} />;
  }

  // Error state
  if (!data) {
    return (
      <div className="flex h-[calc(100dvh-250px)] w-full items-center justify-center">
        <Empty
          title="Unable to load risk data"
          subTitle=" Please try refreshing the page or contact support."
          pathName="Refresh"
          onClick={() => mutate()}
          link="#"
        />
      </div>
    );
  }

  return (
    <div className="flex h-fit w-full flex-col gap-5">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <span className="flex flex-col gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            Risk Distribution
          </p>
          <p className="text-base font-medium text-neutral-500">
            Review the current and residual scores for your risk scenarios.
          </p>
        </span>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm font-semibold text-blue-800">
                  Current Risks: {data.current_risk_count.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-semibold text-green-800">
                  Residual Risks: {data.residual_risk_count.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="w-fit">
            <label className="inline-flex cursor-pointer items-center gap-5">
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Minimal
              </span>
              <input
                onChange={() =>
                  handleMatrixSizeChange(matrixSize === 3 ? 5 : 3)
                }
                checked={matrixSize === 5}
                type="checkbox"
                value=""
                className="peer sr-only"
              />
              <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-tertiary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-tertiary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-tertiary-600 dark:peer-focus:ring-tertiary-800 rtl:peer-checked:after:-translate-x-full"></div>
              <span className="-ml-1 text-sm font-medium text-gray-900 dark:text-gray-300">
                Detailed
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Risk summary cards */}

      {/* Heatmap section */}
      <div className="flex h-full w-full flex-col items-stretch gap-5 lg:flex-row">
        <DynamicHeatmap
          riskData={data.current_risk}
          title="Current Risk"
          isAnimating={enableAnimation}
        />

        <DynamicHeatmap
          riskData={data.residual_risk}
          title="Residual Risk"
          isAnimating={enableAnimation}
        />
      </div>
    </div>
  );
};

export default Overview;
