import useSwr from "@/shared/hooks/useSwr";
import { Tooltip } from "@mui/material";
import { BarChart3, Database, Layers, TrendingUp } from "lucide-react";
import React, { useMemo } from "react";

interface ProviderDashboardProps {
  onSelectSource: (source: string) => void;
  availableSources: string[];
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = React.memo(
  ({ onSelectSource, availableSources }) => {
    const { data: assetsData, error } = useSwr("show_all_assets_by_provider");

    const sourceCounts = useMemo(() => {
      return availableSources.reduce(
        (acc, source) => {
          if (assetsData && Array.isArray(assetsData[source])) {
            acc[source] = assetsData[source].length;
          } else {
            acc[source] = 0;
          }
          return acc;
        },
        {} as Record<string, number>
      );
    }, [assetsData, availableSources]);

    const totalAssets = useMemo(() => {
      return Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);
    }, [sourceCounts]);

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-20 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500 shadow-lg">
            <Database className="h-12 w-12 text-white" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Error Loading Providers
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Failed to fetch asset data. Please try again later.
          </p>
        </div>
      );
    }

    const getProviderIcon = (source?: string) => {
      if (!source) {
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
            <Database className="h-5 w-5 text-white" />
          </div>
        );
      }
      const iconClass = "h-5 w-5";
      const normalizedSource = source.toLowerCase();
      switch (normalizedSource) {
        case "mlflow":
          return (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-500">
              <Layers className={iconClass + " text-white"} />
            </div>
          );
        case "sagemaker":
          return (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
              <Database className={iconClass + " text-white"} />
            </div>
          );
        case "azureml":
        case "azure":
          return (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-600">
              <BarChart3 className={iconClass + " text-white"} />
            </div>
          );
        case "vertex":
          return (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
              <TrendingUp className={iconClass + " text-white"} />
            </div>
          );
        default:
          return (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
              <Database className={iconClass + " text-white"} />
            </div>
          );
      }
    };

    const getProviderName = (source?: string) => {
      if (!source) {
        return "Unknown Provider";
      }
      const normalizedSource = source.toLowerCase();
      if (normalizedSource === "mlflow") {
        return "MLflow";
      }
      if (normalizedSource === "sagemaker") {
        return "AWS SageMaker";
      }
      if (normalizedSource === "azureml" || normalizedSource === "azure") {
        return "Azure ML";
      }
      if (normalizedSource === "vertex") {
        return "Google Vertex AI";
      }
      return source.charAt(0).toUpperCase() + source.slice(1);
    };

    return (
      <div className="flex w-full flex-col gap-6 p-4">
        {/* Beautiful Header Section */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-tertiary-50 to-indigo-50 p-6 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary-500 to-indigo-600 shadow-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Auto Discovery
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  View and manage AI assets automatically discovered across your
                  connected ML providers.
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {"Here’s a list of the providers already configured:"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalAssets}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Assets
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 border-b border-gray-200 bg-indigo-50 px-6 py-4 dark:border-gray-700 dark:bg-indigo-900/20">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Provider Name
            </div>
            <div className="text-center text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Asset Discovered
            </div>
            <div className="text-center text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Action
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {availableSources.map((source) => {
              const count = sourceCounts[source] ?? 0;

              return (
                <div
                  key={source}
                  className="grid grid-cols-3 gap-4 px-6 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {/* Provider Column */}
                  <div className="flex items-center gap-3">
                    {getProviderIcon(source)}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {getProviderName(source)}
                    </span>
                  </div>

                  {/* Asset Count Column */}
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {count}
                    </span>
                  </div>

                  {/* Action Column */}
                  <div className="flex items-center justify-center">
                    <Tooltip
                      title={
                        count === 0
                          ? "Click to discover AI assets from this provider"
                          : "Click to view discovered assets or sync latest"
                      }
                      placement="top"
                      arrow
                    >
                      <button
                        onClick={() => onSelectSource(source)}
                        className="flex items-center gap-2 rounded-lg bg-tertiary-50 px-4 py-2 text-sm font-semibold text-tertiary-600 transition-all hover:bg-tertiary-100 dark:bg-tertiary-900/30 dark:text-tertiary-400 dark:hover:bg-tertiary-900/50"
                      >
                        {count === 0 ? "Discover" : "View"}
                        <span className="text-base">→</span>
                      </button>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

ProviderDashboard.displayName = "ProviderDashboard";
export default ProviderDashboard;
