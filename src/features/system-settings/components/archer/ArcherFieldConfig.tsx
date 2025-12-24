"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { toast } from "sonner";

interface FieldMapping {
  cv_field: string;
  archer_tag: string;
}

interface AppConfig {
  fields: FieldMapping[];
}

interface RowData extends Record<string, unknown> {
  cv_field: string;
  archer_tag: string;
}
const CustomToolbar = ({
  appName,
  config,
  onVerify,
  isVerified,
  isLoading,
  isLastTab,
  setCurrentStep
}: {
  appName: string;
  config: AppConfig;
  onVerify: (appName: string, config: AppConfig) => Promise<void>;
  isVerified: boolean;
  isLoading: boolean;
  isLastTab: boolean;
  setCurrentStep: Dispatch<SetStateAction<number>>;
}) => {
  return (
    <div className="flex w-full items-center justify-between px-5 py-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Verify archer fields for smooth data sync
      </h3>
      <div className="flex items-center gap-3">
        {isVerified && (
          <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </span>
        )}
        <div className="w-fit">
          <CustomButton
            className="!text-[0.7rem]"
            onClick={() => onVerify(appName, config)}
            disabled={isVerified || isLoading}
          >
            {isLoading
              ? "Verifying..."
              : isLastTab
                ? "Verify"
                : "Verify & Next"}
          </CustomButton>
        </div>
        {isVerified && isLastTab && (
          <div className="w-fit">
            <CustomButton
              className="!text-[0.7rem]"
              onClick={() => setCurrentStep((pre) => pre + 1)}
            >
              Go Map Data
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
};
const ArcherFieldConfig = ({
  setCurrentStep
}: {
  setCurrentStep: Dispatch<SetStateAction<number>>;
}) => {
  const { data, isValidating, mutate } = useSwr("archer_get_map_config");
  const { isLoading, mutation } = useMutation();
  const [activeTab, setActiveTab] = useState<string>("");

  // Initialize verified tabs from sessionStorage
  const [verifiedTabs, setVerifiedTabs] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("archer_verified_tabs");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const apps = useMemo(() => {
    const mappings = data?.configs?.core_application_mappings || {};
    return Object.entries(mappings) as [string, AppConfig][];
  }, [data?.configs?.core_application_mappings]);

  // Auto-select first tab
  useEffect(() => {
    if (apps.length > 0 && !activeTab && apps[0]) {
      setActiveTab(apps[0][0]);
    }
  }, [apps, activeTab]);

  // Save verified tabs to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "archer_verified_tabs",
        JSON.stringify(Array.from(verifiedTabs))
      );
    }
  }, [verifiedTabs]);

  // Warn user before leaving page if there are unverified apps
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (apps.length > 0) {
        const allVerified = apps.every(([appName]) =>
          verifiedTabs.has(appName)
        );
        if (!allVerified) {
          e.preventDefault();
          e.returnValue =
            "You have unverified applications. Are you sure you want to leave?";
          return e.returnValue;
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [apps, verifiedTabs]);

  // Check if all apps are verified and notify parent
  useEffect(() => {
    if (apps.length > 0) {
      const allVerified = apps.every(([appName]) => verifiedTabs.has(appName));

      // Clear sessionStorage when all verified
      if (allVerified && typeof window !== "undefined") {
        sessionStorage.removeItem("archer_verified_tabs");
      }
    }
  }, [verifiedTabs, apps]);

  const handleVerifyAndNext = async (appName: string, config: AppConfig) => {
    // Show loading toast
    const loadingToast = toast.loading(
      "We are verifying all the field configs with Archer. Please wait...",
      {
        duration: Infinity
      }
    );

    try {
      const res = await mutation(
        `save_archer_field_config?core_application_name=${appName}`,
        {
          method: "POST",
          isAlert: false,
          body: {
            core_application_mappings: { [appName]: config }
          }
        }
      );

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (res?.status === 200) {
        toast.success(
          res?.results?.message || "Mapping verified successfully!"
        );

        // Mark tab as verified
        setVerifiedTabs((prev) => new Set(prev).add(appName));

        // Move to next tab if not the last one
        const currentIndex = apps.findIndex(([name]) => name === appName);
        const nextApp = apps[currentIndex + 1];
        if (currentIndex < apps.length - 1 && nextApp) {
          setActiveTab(nextApp[0]);
        } else {
          setCurrentStep((pre) => pre + 1);
        }

        await mutate();
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);

      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      );
    }
  };

  // Scroll active tab into view smoothly
  const scrollToTab = (tabName: string) => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const tabElement = container.querySelector(
      `[data-tab="${tabName}"]`
    ) as HTMLElement;
    if (tabElement) {
      container.scrollTo({
        left:
          tabElement.offsetLeft -
          container.offsetWidth / 2 +
          tabElement.offsetWidth / 2,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (activeTab) {
      scrollToTab(activeTab);
    }
  }, [activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-fit w-full rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="w-full p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Archer Field Configuration
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Configure and verify field mappings per application
              </p>
            </div>
            <div className="flex items-center gap-4">
              {apps.length > 0 && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Verified: {verifiedTabs.size} / {apps.length}
                </div>
              )}
              {isValidating && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Syncing...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading & Empty States */}
        {isValidating && !data && (
          <div className="flex flex-col items-center justify-center py-32">
            <svg
              className="mb-4 h-12 w-12 animate-spin text-tertiary-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Loading configurations...
            </p>
          </div>
        )}

        {data && apps.length === 0 && (
          <div className="rounded-xl bg-white py-20 text-center shadow dark:bg-gray-800">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No applications configured yet.
            </p>
          </div>
        )}

        {/* Scrollable Tabs + Content */}
        {data && apps.length > 0 && (
          <div className="space-y-3">
            {/* Scrollable Tab Header */}
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="scrollbar-hide flex gap-1 overflow-x-auto scroll-smooth pb-2"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {apps.map(([appName, config]) => {
                  const fieldCount = config.fields?.length || 0;
                  const isActive = activeTab === appName;
                  const isVerified = verifiedTabs.has(appName);

                  return (
                    <button
                      key={appName}
                      data-tab={appName}
                      onClick={() => setActiveTab(appName)}
                      className={`relative flex items-center gap-2.5 whitespace-nowrap rounded-lg px-5 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-tertiary-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      } `}
                    >
                      <span>{appName}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {fieldCount}
                      </span>
                      {isVerified && (
                        <svg
                          className="h-4 w-4 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute inset-0 -z-10 rounded-lg bg-tertiary-600"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <div className="relative w-full">
                {apps.map(
                  ([appName, config]) =>
                    activeTab === appName && (
                      <motion.div
                        key={appName}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25 }}
                        className="w-full"
                      >
                        <CustomTable<RowData>
                          columns={[
                            {
                              field: "cv_filed",
                              title: "CV Field",
                              sortable: true,
                              filterable: true,
                              render: (row: RowData) => (
                                <div className="pl-5 font-medium leading-tight">
                                  <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-tertiary-500"></div>
                                    <code className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                      {row?.cv_field}
                                    </code>
                                  </div>
                                </div>
                              )
                            },
                            {
                              field: "archer_filed",
                              title: "Archer Tag",
                              sortable: true,
                              filterable: true,
                              cellClassName: "w-fit",
                              render: (row: RowData) => (
                                <span className="text-left font-medium leading-tight">
                                  <div className="flex items-center gap-3 pl-5">
                                    <div className="h-2 w-2 rounded-full bg-tertiary-500"></div>
                                    <code className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                      {row?.archer_tag}
                                    </code>
                                  </div>
                                </span>
                              )
                            }
                          ]}
                          data={
                            config.fields?.length > 0
                              ? (config.fields as RowData[])
                              : []
                          }
                          customToolbar={
                            <CustomToolbar
                              appName={appName}
                              config={config}
                              onVerify={handleVerifyAndNext}
                              isVerified={verifiedTabs.has(appName)}
                              isLoading={isLoading}
                              isLastTab={
                                apps.findIndex(([name]) => name === appName) ===
                                apps.length - 1
                              }
                              setCurrentStep={setCurrentStep}
                            />
                          }
                          title=""
                          selection={false}
                          filtering={false}
                          options={{
                            toolbar: false,
                            search: false,
                            filtering: true,
                            sorting: true,
                            pagination: false
                          }}
                          className="flex-1"
                          localization={{
                            body: {
                              emptyDataSourceMessage:
                                "No field mappings configured."
                            }
                          }}
                        />
                      </motion.div>
                    )
                )}
              </div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ArcherFieldConfig;
