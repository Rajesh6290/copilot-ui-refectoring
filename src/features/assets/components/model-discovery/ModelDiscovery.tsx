"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { Database, RefreshCw, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import React, {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { BiArrowBack } from "react-icons/bi";
import { toast } from "sonner";
const ProviderDashboard = dynamic(() => import("./ProviderDashboard"), {
  ssr: false
});
const ProcessingStatusCard = dynamic(() => import("./ProcessingStatusCard"), {
  ssr: false
});
const NotDiscoveredCard = dynamic(() => import("./NotDiscoveredCard"), {
  ssr: false
});
const NotConnectedCard = dynamic(() => import("./NotConnectedCard"), {
  ssr: false
});
interface AssetItem {
  doc_id?: string;
  model_id?: string | null;
  dataset_id?: string | null;
  agent_id?: string | null;
  job_id?: string | null;
  model_name?: string;
  name?: string;
  agent_name?: string;
  job_name?: string;
  model_description?: string | null;
  description?: string | null;
  model_type?: string | null;
  dataset_type?: string | null;
  job_type?: string | null;
  asset_source?: string | null;
  provider?: string;
  purpose?: string | null;
  model_version?: string | null;
  dataset_version?: string | null;
  version?: string;
  model_status?: string | null;
  job_status?: string | null;
  is_active?: boolean;
  fine_tuned?: boolean;
  output_type?: string | null;
  model_application?: string | null;
  created_by?: string | null;
  creation_timestamp?: string | null;
  last_updated?: string | null;
  model_location?: string | null;
  compliance_status?: string[] | string | null;
  risks?: RiskItem[] | null;
  application_ids?: string[];
  agent_ids?: string[];
  dataset_ids?: string[];
  model_ids?: string[];
  created_at: string;
  updated_at: string;
  asset_type: string;
  size_in_gb?: number | null;
  contains_sensitive_data?: boolean;
  action_supported?: string[] | null;
  human_in_loop?: boolean;
  job_start_time?: string | null;
  job_end_time?: string | null;
  hyperparameter?: unknown;
  training_metrics?: unknown;
  job_artifact_uri?: string | null;
  additional_data?: unknown;
  lifecycle_state?: string;
  source_name?: string;
  [key: string]: unknown;
}

interface RiskItem {
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  details: string;
  score?: number;
}

type DiscoveryStatus =
  | "not_connected"
  | "processing"
  | "completed"
  | "false"
  | "true"
  | string
  | null;

const SkeletonLoader: React.FC = React.memo(() => {
  return (
    <div className="flex w-full flex-col gap-2 overflow-y-auto px-2 pt-3">
      <div className="animate-pulse">
        <div className="mb-4 flex h-fit w-full flex-col gap-3 rounded-lg border border-gray-200 bg-white px-3 pb-4 dark:border-neutral-800 dark:bg-darkSidebarBackground">
          <div className="flex w-full items-center justify-between px-2 pt-4">
            <div className="flex items-center gap-4">
              <div className="h-6 w-6 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-6 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-8 w-24 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-28 rounded-md bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-10 w-40 rounded-md bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>

        <div className="mb-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-darkSidebarBackground">
          <div className="grid grid-cols-7 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div
                key={item}
                className="h-4 rounded bg-gray-300 dark:bg-gray-700"
              ></div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-darkSidebarBackground"
            >
              <div className="grid grid-cols-7 gap-4">
                <div className="h-4 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-4 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-4 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-4 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-4 w-20 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-4 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-4 rounded bg-gray-300 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

SkeletonLoader.displayName = "SkeletonLoader";
const CustomToolBar: React.FC<{
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  availableSources: string[];
  sourceCounts: Record<string, number>;
  onDiscoverOrSync: () => void;
  discoveryStatus: DiscoveryStatus;
  isApiLoading: boolean;
  processingType: "discover" | "sync" | null;
  tableConfig: { title: string; icon: JSX.Element };
}> = React.memo(
  ({
    selectedSource,
    setSelectedSource,
    availableSources,
    sourceCounts,
    onDiscoverOrSync,
    discoveryStatus,
    isApiLoading,
    processingType,
    tableConfig
  }) => {
    const getButtonConfig = useCallback(() => {
      if (!selectedSource) {
        return {
          text: "Select Source",
          disabled: true,
          icon: <Settings size={20} />
        };
      }

      if (isApiLoading) {
        const loadingText =
          processingType === "sync" ? "Syncing..." : "Discovering...";
        return {
          text: loadingText,
          disabled: true,
          icon: <RefreshCw size={20} className="animate-spin" />
        };
      }

      if (discoveryStatus === "processing") {
        const processingText =
          processingType === "sync" ? "Syncing..." : "Discovering...";
        return {
          text: processingText,
          disabled: true,
          icon: <RefreshCw size={20} className="animate-spin" />
        };
      }

      if (discoveryStatus === "completed" || discoveryStatus === "true") {
        return { text: "Sync", disabled: false, icon: <RefreshCw size={20} /> };
      }

      return {
        text: "Discover",
        disabled: false,
        icon: <Database size={20} />
      };
    }, [selectedSource, isApiLoading, processingType, discoveryStatus]);

    const buttonConfig = getButtonConfig();

    const handleSourceChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSource(e.target.value);
      },
      [setSelectedSource]
    );

    return (
      <div className="flex h-fit w-full flex-col gap-3 px-3 pb-4">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between px-2 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {tableConfig.icon}
                <p className="font-satoshi text-lg font-semibold text-gray-900 dark:text-white">
                  {tableConfig.title}
                </p>
                {selectedSource && (
                  <span className="rounded-full bg-tertiary-100 px-3 py-1 text-sm font-medium text-tertiary-800 dark:bg-tertiary-900/30 dark:text-tertiary-300">
                    {selectedSource.charAt(0).toUpperCase() +
                      selectedSource.slice(1)}{" "}
                    ({sourceCounts[selectedSource] || 0})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CustomButton
                onClick={() => setSelectedSource("")}
                startIcon={<BiArrowBack size={20} />}
              >
                Back
              </CustomButton>
              <CustomButton
                startIcon={buttonConfig.icon}
                onClick={onDiscoverOrSync}
                disabled={buttonConfig.disabled}
              >
                {buttonConfig.text}
              </CustomButton>
              <select
                value={selectedSource}
                onChange={handleSourceChange}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 font-[family-name:var(--font-geist-sans)] text-sm font-medium capitalize outline-none transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                <option value="">Select Source</option>
                {availableSources.map((source) => (
                  <option
                    key={source}
                    value={source}
                    className="font-[family-name:var(--font-geist-mono)] capitalize"
                  >
                    {source === "mlflow"
                      ? "MLflow"
                      : source.charAt(0).toUpperCase() + source.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CustomToolBar.displayName = "CustomToolBar";

// Main ModelDiscovery Component
const ModelDiscovery: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Use refs to track processing state
  const processingTypeRef = useRef<"discover" | "sync" | null>(null);
  const previousStatusRef = useRef<DiscoveryStatus>(null);
  const toastShownRef = useRef<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutation } = useMutation();

  // Get config data to check available sources
  const { data: configData, isValidating: configLoading } =
    useSwr("get_config");

  // Get discovery status for selected source
  const {
    data: discoveryStatus,
    mutate: statusMutate,
    isValidating: statusValidating
  } = useSwr(
    selectedSource ? `discovery_status?provider_name=${selectedSource}` : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3000
    }
  );

  // Get all assets data - fetch whenever we have a selected source and completed status
  const shouldFetchAssets =
    selectedSource &&
    (discoveryStatus === "completed" || discoveryStatus === "true");

  const {
    data: allAssetsData,
    isValidating: assetsLoading,
    mutate: assetsMutate
  } = useSwr(shouldFetchAssets ? "show_all_assets_by_provider" : null, {
    revalidateOnFocus: false,
    dedupingInterval: 5000
  });

  // Set available sources from config
  useEffect(() => {
    if (
      configData?.data?.credential &&
      Array.isArray(configData.data.credential)
    ) {
      const configuredSources = configData.data.credential
        .filter(
          (cred: {
            configured: boolean;
            name: {
              toLowerCase: () => string;
            };
          }) => cred && cred.configured === true && cred.name
        )
        .map(
          (cred: {
            name: {
              toLowerCase: () => string;
            };
          }) => cred.name
        );

      setAvailableSources(configuredSources);
    } else {
      setAvailableSources([]);
    }
  }, [configData]);

  // Initialize from query params
  useEffect(() => {
    const sourceParam = searchParams.get("source");
    if (sourceParam && availableSources.includes(sourceParam)) {
      setSelectedSource(sourceParam);
    }
  }, [searchParams, availableSources]);

  // Update URL when source changes
  const handleSourceChange = useCallback(
    (source: string) => {
      // Set transitioning state
      setIsTransitioning(true);

      setSelectedSource(source);

      // Reset refs when source changes
      previousStatusRef.current = null;
      processingTypeRef.current = null;
      toastShownRef.current = false;
      setIsApiLoading(false);

      if (source) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("source", source);
        router.push(`?${params.toString()}`);
      } else {
        router.push(window.location.pathname);
      }

      // Remove transitioning state after a short delay
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    },
    [router, searchParams]
  );

  // Polling logic for processing status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (discoveryStatus === "processing") {
      interval = setInterval(async () => {
        await statusMutate();
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [discoveryStatus, statusMutate]);

  // Handle status changes with ref-based tracking
  useEffect(() => {
    const prevStatus = previousStatusRef.current;
    const currentStatus = discoveryStatus;

    // Only process if we have a previous status and it's different
    if (prevStatus !== null && prevStatus !== currentStatus) {
      // Check if we're transitioning from processing to completed
      if (
        prevStatus === "processing" &&
        (currentStatus === "completed" || currentStatus === "true")
      ) {
        // Only show toast if we haven't shown it yet for this operation
        if (!toastShownRef.current && processingTypeRef.current) {
          const operationType =
            processingTypeRef.current === "sync" ? "Sync" : "Discovery";
          toast.success(`${operationType} completed successfully!`);
          toastShownRef.current = true;

          // Refresh assets data
          setTimeout(() => {
            assetsMutate();
          }, 500);

          // Reset processing type after completion
          processingTypeRef.current = null;
        }
      }
    }

    // Update previous status
    previousStatusRef.current = currentStatus;
  }, [discoveryStatus, assetsMutate]);

  // Get current data for selected source - memoized
  const getCurrentData = useCallback((): AssetItem[] => {
    if (!allAssetsData || !selectedSource) {
      return [];
    }

    const sourceData = allAssetsData[selectedSource] || [];

    const filteredData = sourceData.filter((item: AssetItem) => {
      const itemSource = item?.asset_source || selectedSource;
      return itemSource.toLowerCase() === selectedSource.toLowerCase();
    });

    return filteredData.map((item: AssetItem) => ({
      ...item,
      source_name: selectedSource
    }));
  }, [allAssetsData, selectedSource]);

  // Get source counts - memoized
  const getSourceCounts = useCallback((): Record<string, number> => {
    if (!allAssetsData) {
      return {};
    }

    const counts: Record<string, number> = {};

    availableSources.forEach((source) => {
      const sourceData = allAssetsData[source] || [];
      const filteredData = sourceData.filter((item: AssetItem) => {
        const itemSource = item?.asset_source || source;
        return itemSource.toLowerCase() === source.toLowerCase();
      });
      counts[source] = filteredData.length;
    });

    return counts;
  }, [allAssetsData, availableSources]);

  // Handle discover or sync action
  const handleDiscoverOrSync = useCallback(async (): Promise<void> => {
    if (!selectedSource || discoveryStatus === "processing" || isApiLoading) {
      return;
    }

    const isSync =
      discoveryStatus === "completed" || discoveryStatus === "true";

    // Reset toast flag for new operation
    toastShownRef.current = false;
    setIsApiLoading(true);
    processingTypeRef.current = isSync ? "sync" : "discover";

    try {
      const selectedSources = { [selectedSource]: true };
      const response = await mutation("discover_all_assets", {
        method: "POST",
        body: selectedSources,
        isAlert: false
      });

      if (response?.status === 201) {
        const operationType = isSync ? "Sync" : "Discovery";
        toast.success(`${operationType} started successfully`);

        await statusMutate();
        setTimeout(async () => {
          await statusMutate();
        }, 2000);
      } else {
        toast.error(response?.results?.message || "Operation failed");
        processingTypeRef.current = null;
        toastShownRef.current = false;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
      processingTypeRef.current = null;
      toastShownRef.current = false;
    } finally {
      setIsApiLoading(false);
    }
  }, [selectedSource, discoveryStatus, isApiLoading, mutation, statusMutate]);

  // Navigate to details page
  const handleNavigateToDetails = useCallback(
    (row: AssetItem) => {
      const params = new URLSearchParams();
      params.set("asset_type", row.asset_type);
      params.set("source", selectedSource);
      router.push(`/assets/model-discovery/${row.doc_id}?${params.toString()}`);
    },
    [selectedSource, router]
  );

  // Table configuration - memoized
  const tableConfig = useMemo(
    () => ({
      title: "AI Assets",
      icon: <Database className="h-5 w-5" />,
      columns: [
        {
          field: "name",
          title: "Name",
          sortable: true,
          filterable: true,
          render: (row: AssetItem) => (
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-white">
                {row?.name ||
                  row?.model_name ||
                  row?.agent_name ||
                  row?.job_name ||
                  "Not Provided"}
              </span>
            </div>
          )
        },
        {
          field: "provider",
          title: "Provider",
          sortable: true,
          filterable: true,
          render: (row: AssetItem) => (
            <span className="capitalize">
              {row?.asset_source || selectedSource || "N/A"}
            </span>
          )
        },
        {
          field: "type",
          title: "Type",
          sortable: true,
          filterable: true,
          render: (row: AssetItem) => {
            let assetType = "N/A";

            if (row?.asset_type) {
              assetType = row.asset_type;
            } else if (row?.model_id || row?.model_name) {
              assetType = "models";
            } else if (row?.dataset_id || (row?.name && row?.dataset_version)) {
              assetType = "datasets";
            } else if (row?.agent_id || row?.agent_name) {
              assetType = "agents";
            } else if (row?.job_id || row?.job_name) {
              assetType = "training_jobs";
            }

            return (
              <span className="capitalize">{assetType.replace(/_/g, " ")}</span>
            );
          }
        },
        {
          field: "version",
          title: "Version",
          sortable: true,
          render: (row: AssetItem) => {
            const version =
              row?.model_version ||
              row?.dataset_version ||
              row?.version ||
              row?.model_name ||
              row?.name ||
              "N/A";

            return <span>{version}</span>;
          }
        },
        {
          field: "status",
          title: "Status",
          sortable: true,
          filterable: true,
          render: (row: AssetItem) => {
            const status =
              row?.model_status || row?.job_status || row?.is_active || "N/A";

            const getStatusColor = (statuss: string | boolean): string => {
              if (typeof statuss === "boolean") {
                return statuss
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
              }

              const statusLower = statuss.toString().toLowerCase();
              if (
                statusLower.includes("active") ||
                statusLower.includes("ready") ||
                statusLower.includes("completed") ||
                statusLower.includes("finished")
              ) {
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
              }
              if (statusLower.includes("not") || statusLower.includes("fail")) {
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
              }
              if (
                statusLower.includes("processing") ||
                statusLower.includes("pending")
              ) {
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
              }
              return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
            };

            const displayStatus =
              typeof status === "boolean"
                ? status
                  ? "Active"
                  : "Inactive"
                : status === "N/A"
                  ? "Not Applicable"
                  : status;

            return (
              <span
                className={`rounded px-2 py-1 text-xs font-medium capitalize ${getStatusColor(status)}`}
              >
                {displayStatus?.toString().replace(/_/g, " ")}
              </span>
            );
          }
        },
        {
          field: "risk",
          title: "Risk",
          sortable: true,
          render: (row: AssetItem) => {
            const risks = row?.risks || [];
            if (risks.length === 0) {
              return (
                <span className="text-gray-500 dark:text-gray-400">
                  Not Available
                </span>
              );
            }

            const highRisks = risks.filter(
              (r: RiskItem) => r.risk_level === "HIGH"
            ).length;
            const mediumRisks = risks.filter(
              (r: RiskItem) => r.risk_level === "MEDIUM"
            ).length;

            if (highRisks > 0) {
              return <span className="font-medium text-red-600">High</span>;
            } else if (mediumRisks > 0) {
              return (
                <span className="font-medium text-yellow-600">Medium</span>
              );
            } else {
              return <span className="font-medium text-green-600">Low</span>;
            }
          }
        },
        {
          field: "actions",
          title: "Actions",
          sortable: false,
          filterable: false,
          render: (row: AssetItem) => (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigateToDetails(row);
              }}
              className="rounded-md bg-red-100 px-4 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-100 hover:outline-none hover:ring-2 hover:ring-red-100 focus:ring-offset-2 dark:bg-red-100 dark:hover:bg-red-200"
            >
              🚦 Check Risk
            </button>
          )
        }
      ]
    }),
    [selectedSource, handleNavigateToDetails]
  );

  const currentData = useMemo(() => getCurrentData(), [getCurrentData]);
  const sourceCounts = useMemo(() => getSourceCounts(), [getSourceCounts]);

  // Determine what to render based on state
  const renderContent = useCallback(() => {
    // Show loading during initial config load
    if (configLoading) {
      return <SkeletonLoader />;
    }

    // Show not connected card if no sources configured
    if (availableSources.length === 0) {
      return (
        <div className="flex w-full flex-col gap-2 overflow-y-auto px-2 pt-3">
          <NotConnectedCard />
        </div>
      );
    }

    // If no source selected, show dashboard with provider cards
    if (!selectedSource) {
      return (
        <div className="flex w-full flex-col gap-2 overflow-y-auto px-2 pt-3">
          <ProviderDashboard
            onSelectSource={handleSourceChange}
            availableSources={availableSources}
          />
        </div>
      );
    }

    // Show skeleton during transition
    if (isTransitioning) {
      return <SkeletonLoader />;
    }

    // Show skeleton during initial status check
    if (statusValidating && discoveryStatus === undefined) {
      return <SkeletonLoader />;
    }

    // Source is selected - now check discovery status
    // Show processing card during discovery/sync
    if (discoveryStatus === "processing" || isApiLoading) {
      return (
        <div className="flex w-full flex-col gap-2 overflow-y-auto px-2 pt-3">
          <div className="flex flex-1 flex-col">
            <CustomToolBar
              selectedSource={selectedSource}
              setSelectedSource={handleSourceChange}
              availableSources={availableSources}
              sourceCounts={sourceCounts}
              onDiscoverOrSync={handleDiscoverOrSync}
              discoveryStatus={discoveryStatus || "false"}
              isApiLoading={isApiLoading}
              processingType={processingTypeRef.current}
              tableConfig={tableConfig}
            />
            <ProcessingStatusCard
              processingType={processingTypeRef.current}
              selectedSource={selectedSource}
            />
          </div>
        </div>
      );
    }

    // Show "not discovered" card if source selected but not discovered yet
    if (discoveryStatus !== "completed" && discoveryStatus !== "true") {
      return (
        <div className="flex w-full flex-col gap-2 overflow-y-auto px-2 pt-3">
          <div className="flex flex-1 flex-col">
            <CustomToolBar
              selectedSource={selectedSource}
              setSelectedSource={handleSourceChange}
              availableSources={availableSources}
              sourceCounts={sourceCounts}
              onDiscoverOrSync={handleDiscoverOrSync}
              discoveryStatus={discoveryStatus || "false"}
              isApiLoading={isApiLoading}
              processingType={processingTypeRef.current}
              tableConfig={tableConfig}
            />
            <NotDiscoveredCard
              selectedSource={selectedSource}
              onDiscover={handleDiscoverOrSync}
            />
          </div>
        </div>
      );
    }

    // Show skeleton while loading assets data for the first time
    if (assetsLoading && !allAssetsData) {
      return <SkeletonLoader />;
    }

    // Show table with data if discovered and completed
    return (
      <div className="flex w-full flex-col gap-2 overflow-y-auto px-2 pt-3">
        <CustomTable<AssetItem>
          key={selectedSource}
          columns={tableConfig.columns}
          data={currentData}
          isLoading={false}
          page={page}
          pageSize={pageSize}
          totalCount={currentData.length}
          onPageChange={setPage}
          onRowsPerPageChange={setPageSize}
          title=""
          selection={false}
          filtering={false}
          customToolbar={
            <CustomToolBar
              selectedSource={selectedSource}
              setSelectedSource={handleSourceChange}
              availableSources={availableSources}
              sourceCounts={sourceCounts}
              onDiscoverOrSync={handleDiscoverOrSync}
              discoveryStatus={discoveryStatus || "false"}
              isApiLoading={isApiLoading}
              processingType={processingTypeRef.current}
              tableConfig={tableConfig}
            />
          }
          options={{
            toolbar: false,
            search: false,
            filtering: true,
            sorting: true,
            pagination: false,
            detailPanel: false,
            detailPanelPosition: "right",
            detailPanelHeader: ""
          }}
          className="flex-1"
        />
      </div>
    );
  }, [
    configLoading,
    availableSources,
    selectedSource,
    handleSourceChange,
    sourceCounts,
    handleDiscoverOrSync,
    discoveryStatus,
    isApiLoading,
    tableConfig,
    assetsLoading,
    allAssetsData,
    currentData,
    page,
    pageSize,
    isTransitioning,
    statusValidating
  ]);

  return renderContent();
};

export default ModelDiscovery;
