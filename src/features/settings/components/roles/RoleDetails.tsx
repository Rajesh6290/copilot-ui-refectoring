"use client";
import useSwr from "@/shared/hooks/useSwr";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  Briefcase,
  Calendar,
  ChevronDown,
  Clock,
  Crown,
  Edit,
  Eye,
  Key,
  Layers,
  MessageSquare,
  RefreshCw,
  Settings,
  Shield,
  User,
  Zap
} from "lucide-react";
import moment from "moment";
import { useParams } from "next/navigation";
import React, { useState } from "react";

// Updated TypeScript interfaces for new API structure with tabs
interface Tab {
  tab: string;
  resource: string;
  label: string;
  permission: "manager" | "contributor" | "viewer" | "no_access";
}

interface Subgroup {
  subgroup: string;
  resource: string;
  label: string;
  tabs: Tab[];
  permission: "manager" | "contributor" | "viewer" | "no_access";
}

interface FeatureOffered {
  feature_group: string;
  resource: string;
  label: string;
  subgroups: Subgroup[];
  permission: "manager" | "contributor" | "viewer" | "no_access";
}

type PermissionLevel = "manager" | "contributor" | "viewer" | "no_access";

// Custom Skeleton component
const Skeleton = ({ className }: { className: string }) => {
  return <div className={`animate-pulse ${className}`}></div>;
};

// Permission level configurations
const permissionLevels = {
  manager: {
    label: "Manager",
    shortLabel: "Mgr",
    description: "Full access (Create, Read, Update, Delete)",
    shortDescription: "Full CRUD",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    gradient: "from-purple-500 to-purple-600"
  },
  contributor: {
    label: "Contributor",
    shortLabel: "Cont",
    description: "Can create, read, and update",
    shortDescription: "CRU Access",
    icon: Edit,
    color: "text-tertiary-600",
    bgColor: "bg-tertiary-50",
    borderColor: "border-tertiary-200",
    gradient: "from-tertiary-500 to-tertiary-600"
  },
  viewer: {
    label: "Viewer",
    shortLabel: "View",
    description: "Read-only access",
    shortDescription: "Read Only",
    icon: Eye,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    gradient: "from-green-500 to-green-600"
  },
  no_access: {
    label: "No Access",
    shortLabel: "None",
    description: "No permissions granted",
    shortDescription: "No Access",
    icon: Ban,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    gradient: "from-red-500 to-red-600"
  }
} as const;

// Feature group icons mapping
const featureGroupIcons: Record<
  string,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  assistant: MessageSquare,
  "ai-profile-readiness": Zap,
  assets: Briefcase,
  compliance: Shield,
  "risk-management": AlertTriangle,
  settings: Settings
};

interface PermissionStats {
  manager: number;
  contributor: number;
  viewer: number;
  no_access: number;
}

const RoleDetails: React.FC = () => {
  const params = useParams();
  const { data, isValidating, error } = useSwr(`role?role_id=${params["id"]}`);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  const toggleGroup = (groupName: string): void => {
    setExpandedGroups({
      ...expandedGroups,
      [groupName]: !expandedGroups[groupName]
    });
  };

  // Get permission summary statistics from new structure including tabs
  const permissionStats = React.useMemo((): PermissionStats => {
    if (!data?.features_offered) {
      return { manager: 0, contributor: 0, viewer: 0, no_access: 0 };
    }

    return data.features_offered.reduce(
      (acc: PermissionStats, feature: FeatureOffered) => {
        feature.subgroups.forEach((subgroup: Subgroup) => {
          // Count subgroup permission
          acc[subgroup.permission] = (acc[subgroup.permission] || 0) + 1;

          // Count tab permissions
          subgroup.tabs.forEach((tab: Tab) => {
            acc[tab.permission] = (acc[tab.permission] || 0) + 1;
          });
        });
        return acc;
      },
      { manager: 0, contributor: 0, viewer: 0, no_access: 0 }
    );
  }, [data?.features_offered]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-2 py-4 sm:px-4 sm:py-8">
        <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg sm:p-8">
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500" />
          <h2 className="mb-2 text-center text-lg font-bold text-gray-900 sm:text-xl">
            Error Loading Role Data
          </h2>
          <p className="text-center text-sm text-gray-600 sm:text-base">
            There was a problem fetching the role information. Please try again
            later.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center rounded-lg bg-tertiary-600 px-3 py-2 text-sm text-white transition-colors hover:bg-tertiary-700 sm:px-4 sm:text-base"
            >
              <RefreshCw size={14} className="mr-2 sm:h-4 sm:w-4" /> Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 overflow-hidden rounded-lg bg-white shadow-lg dark:bg-darkSidebarBackground sm:mb-6 sm:rounded-xl">
          <div className="border-b border-gray-100 bg-gradient-to-r from-tertiary-600 to-indigo-600 px-3 py-4 dark:border-neutral-700 sm:px-6 sm:py-6">
            <div className="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:space-y-0">
              <div className="mr-0 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 font-bold text-white shadow-lg backdrop-blur-sm sm:mr-4 sm:h-16 sm:w-16 sm:rounded-xl">
                {isValidating ? (
                  <Skeleton className="h-6 w-6 rounded-full bg-white/30 sm:h-8 sm:w-8" />
                ) : (
                  <span className="text-lg sm:text-2xl">
                    {data?.name?.charAt(0) || "R"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex w-full items-center gap-3">
                  <h1 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                    {isValidating ? (
                      <Skeleton className="h-6 w-48 bg-white/20 sm:h-8 sm:w-64" />
                    ) : (
                      <span className="break-words">
                        {data?.name || "Role"}
                      </span>
                    )}
                  </h1>
                  <span className="inline-block rounded-full bg-white/20 px-2 py-1 text-xs text-white backdrop-blur-sm sm:px-3 sm:text-sm">
                    {data?.role_type?.replace("_", " ")?.toUpperCase() ||
                      "CUSTOM ROLE"}
                  </span>
                </div>
                <div className="mt-1 text-sm text-white/90 sm:mt-3 sm:text-base">
                  {isValidating ? (
                    <Skeleton className="h-4 w-full bg-white/20 sm:h-5" />
                  ) : (
                    <span className="break-words">
                      {data?.description || "No description provided"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Role Information Cards */}
          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-tertiary-50 to-indigo-50 p-3 sm:p-4">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-tertiary-600 sm:h-8 sm:w-8" />
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs font-medium text-gray-600 sm:text-sm">
                      Created On
                    </p>
                    <p className="text-sm font-semibold text-gray-900 sm:text-lg">
                      {isValidating ? (
                        <Skeleton className="h-4 w-20 bg-gray-200 sm:h-5 sm:w-24" />
                      ) : (
                        moment(data?.ceated_at).format("MMM D, YYYY")
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs font-medium text-gray-600 sm:text-sm">
                      Updated On
                    </p>
                    <p className="text-sm font-semibold text-gray-900 sm:text-lg">
                      {isValidating ? (
                        <Skeleton className="h-4 w-20 bg-gray-200 sm:h-5 sm:w-24" />
                      ) : (
                        moment(data?.updated_at).format("MMM D, YYYY")
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:col-span-2 sm:p-4 lg:col-span-1">
                <div className="flex items-center">
                  <User className="h-6 w-6 text-purple-600 sm:h-8 sm:w-8" />
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs font-medium text-gray-600 sm:text-sm">
                      Owner ID
                    </p>
                    <p className="break-all text-sm font-semibold text-gray-900 sm:text-lg">
                      {isValidating ? (
                        <Skeleton className="h-4 w-20 bg-gray-200 sm:h-5 sm:w-24" />
                      ) : (
                        data?.owner_id || ""
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permission Summary Cards */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4 sm:gap-4">
          {(Object.entries(permissionStats) as [PermissionLevel, number][]).map(
            ([level, count], index) => {
              const config = permissionLevels[level];
              const IconComponent = config.icon;

              return (
                <motion.div
                  key={level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`rounded-lg border p-3 shadow-sm transition-all duration-200 hover:shadow-md sm:rounded-xl sm:p-4 ${config.borderColor} ${config.bgColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 sm:text-sm">
                        <span className="sm:hidden">{config.shortLabel}</span>
                        <span className="hidden sm:inline">{config.label}</span>
                      </p>
                      <p className="text-lg font-bold text-gray-900 sm:text-2xl">
                        {count}
                      </p>
                    </div>
                    <div
                      className={`rounded-md bg-gradient-to-r p-1.5 shadow-sm sm:rounded-lg sm:p-2 ${config.gradient}`}
                    >
                      <IconComponent className="h-4 w-4 text-white sm:h-6 sm:w-6" />
                    </div>
                  </div>
                </motion.div>
              );
            }
          )}
        </div>

        {/* Permissions Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-darkSidebarBackground sm:rounded-xl">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-3 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center">
              <Key className="mr-2 h-5 w-5 text-indigo-600 sm:mr-3 sm:h-6 sm:w-6" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                Permissions Overview
              </h2>
            </div>
          </div>

          <div className="p-3 sm:p-6">
            {isValidating ? (
              <div className="space-y-3 sm:space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-12 w-full bg-gray-200 sm:h-16"
                    />
                  ))}
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {data?.features_offered?.map(
                  (
                    feature: {
                      feature_group: string;
                      label: string;
                      subgroups: Subgroup[];
                    },
                    groupIndex: number
                  ) => {
                    const IconComponent =
                      featureGroupIcons[feature.feature_group] || Layers;
                    const isExpanded = expandedGroups[feature.feature_group];

                    return (
                      <motion.div
                        key={feature.feature_group}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
                        className="overflow-hidden rounded-lg border border-gray-200 shadow-sm"
                      >
                        <motion.div
                          className="flex cursor-pointer items-center justify-between bg-gradient-to-r from-gray-50 to-white px-3 py-3 transition-colors hover:from-gray-100 hover:to-gray-50 sm:px-6 sm:py-4"
                          onClick={() => toggleGroup(feature.feature_group)}
                        >
                          <div className="flex items-center">
                            <motion.div
                              className="mr-2 rounded-md bg-gradient-to-r from-tertiary-500 to-indigo-500 p-1.5 shadow-sm sm:mr-3 sm:rounded-lg sm:p-2"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                            >
                              <IconComponent className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                            </motion.div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 sm:text-lg">
                                <span className="break-words">
                                  {feature.label}
                                </span>
                              </h3>
                              <p className="text-xs text-gray-500 sm:text-sm">
                                {feature.subgroups.length} subgroup
                                {feature.subgroups.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <span className="rounded-full bg-tertiary-100 px-2 py-0.5 text-xs font-medium text-tertiary-800 sm:px-3 sm:py-1">
                              {feature.subgroups.length}
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
                            </motion.div>
                          </div>
                        </motion.div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                duration: 0.4,
                                ease: "easeInOut",
                                opacity: { duration: 0.3 }
                              }}
                              className="overflow-hidden border-t border-gray-100 bg-white"
                            >
                              <div className="divide-y divide-gray-100">
                                {feature.subgroups.map((subgroup, index) => {
                                  const config =
                                    permissionLevels[subgroup.permission];
                                  const PermissionIcon = config.icon;
                                  const hasTabs =
                                    subgroup.tabs && subgroup.tabs.length > 0;

                                  return (
                                    <motion.div
                                      key={`${subgroup.subgroup}-${index}`}
                                      initial={{ x: -20, opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: index * 0.05,
                                        ease: "easeOut"
                                      }}
                                      className="transition-colors hover:bg-gray-50"
                                    >
                                      {/* Subgroup Header */}
                                      <div className="flex flex-col space-y-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:px-6 sm:py-4">
                                        <div className="flex items-center">
                                          <motion.div
                                            className="mr-3 h-2 w-2 rounded-full bg-gray-300 sm:mr-4 sm:h-3 sm:w-3"
                                            whileHover={{ scale: 1.3 }}
                                            transition={{ duration: 0.2 }}
                                          ></motion.div>
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                              <h4 className="text-sm font-medium text-gray-900 sm:text-base">
                                                <span className="break-words">
                                                  {subgroup.label}
                                                </span>
                                              </h4>
                                              {hasTabs && (
                                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                                  {subgroup.tabs.length} tab
                                                  {subgroup.tabs.length !== 1
                                                    ? "s"
                                                    : ""}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-gray-500 sm:text-sm">
                                              <span className="break-words">
                                                Subgroup of {feature.label}
                                              </span>
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center">
                                          <motion.div
                                            className={`flex items-center rounded-md border px-2 py-1.5 shadow-sm sm:rounded-lg sm:px-4 sm:py-2 ${config.borderColor} ${config.bgColor}`}
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.2 }}
                                          >
                                            <motion.div
                                              className={`mr-1.5 rounded-full bg-gradient-to-r p-1 shadow-sm sm:mr-2 sm:p-1.5 ${config.gradient}`}
                                              whileHover={{ rotate: 360 }}
                                              transition={{ duration: 0.5 }}
                                            >
                                              <PermissionIcon className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
                                            </motion.div>
                                            <div>
                                              <p
                                                className={`text-xs font-semibold sm:text-sm ${config.color}`}
                                              >
                                                <span className="sm:hidden">
                                                  {config.shortLabel}
                                                </span>
                                                <span className="hidden sm:inline">
                                                  {config.label}
                                                </span>
                                              </p>
                                              <p className="hidden text-xs text-gray-500 sm:block">
                                                <span className="sm:hidden">
                                                  {config.shortDescription}
                                                </span>
                                                <span className="hidden sm:inline">
                                                  {config.description}
                                                </span>
                                              </p>
                                            </div>
                                          </motion.div>
                                        </div>
                                      </div>

                                      {/* Tabs Section - Always visible if tabs exist */}
                                      {hasTabs && (
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ duration: 0.3 }}
                                          className="bg-gray-25 border-t border-gray-50"
                                        >
                                          <div className="px-6 py-2">
                                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 sm:text-sm">
                                              Tabs
                                            </p>
                                          </div>
                                          <div className="divide-y divide-gray-100">
                                            {subgroup.tabs.map(
                                              (tab, tabIndex) => {
                                                const tabConfig =
                                                  permissionLevels[
                                                    tab.permission
                                                  ];
                                                const TabIcon = tabConfig.icon;

                                                return (
                                                  <motion.div
                                                    key={`${tab.tab}-${tabIndex}`}
                                                    initial={{
                                                      x: -10,
                                                      opacity: 0
                                                    }}
                                                    animate={{
                                                      x: 0,
                                                      opacity: 1
                                                    }}
                                                    transition={{
                                                      duration: 0.2,
                                                      delay: tabIndex * 0.03,
                                                      ease: "easeOut"
                                                    }}
                                                    className="flex items-center justify-between px-8 py-3 hover:bg-gray-50 sm:px-12"
                                                  >
                                                    <div className="flex items-center">
                                                      <div className="mr-3 h-1.5 w-1.5 rounded-full bg-gray-400 sm:mr-4"></div>
                                                      <div>
                                                        <h5 className="text-sm font-medium text-gray-800">
                                                          <span className="break-words">
                                                            {tab.label}
                                                          </span>
                                                        </h5>
                                                      </div>
                                                    </div>

                                                    <motion.div
                                                      className={`flex items-center rounded-md border px-2 py-1 shadow-sm sm:px-3 sm:py-1.5 ${tabConfig.borderColor} ${tabConfig.bgColor}`}
                                                      whileHover={{
                                                        scale: 1.05
                                                      }}
                                                      transition={{
                                                        duration: 0.2
                                                      }}
                                                    >
                                                      <motion.div
                                                        className={`mr-1 rounded-full bg-gradient-to-r p-0.5 shadow-sm sm:mr-1.5 sm:p-1 ${tabConfig.gradient}`}
                                                        whileHover={{
                                                          rotate: 360
                                                        }}
                                                        transition={{
                                                          duration: 0.5
                                                        }}
                                                      >
                                                        <TabIcon className="h-2 w-2 text-white sm:h-2.5 sm:w-2.5" />
                                                      </motion.div>
                                                      <p
                                                        className={`text-xs font-semibold ${tabConfig.color}`}
                                                      >
                                                        <span className="sm:hidden">
                                                          {tabConfig.shortLabel}
                                                        </span>
                                                        <span className="hidden sm:inline">
                                                          {tabConfig.label}
                                                        </span>
                                                      </p>
                                                    </motion.div>
                                                  </motion.div>
                                                );
                                              }
                                            )}
                                          </div>
                                        </motion.div>
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetails;
