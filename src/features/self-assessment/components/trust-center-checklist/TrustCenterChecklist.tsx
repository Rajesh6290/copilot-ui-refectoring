"use client";
import CustomButton from "@/shared/core/CustomButton";
import useSwr from "@/shared/hooks/useSwr";
import { motion, useSpring, useTransform } from "framer-motion";
import { useRouter } from "nextjs-toploader/app";
import { JSX, useEffect, useState } from "react";

// TypeScript interfaces
interface ChecklistItemDetails {
  status: boolean;
  required: boolean;
}

interface ChecklistItem {
  [key: string]: ChecklistItemDetails;
}

interface ModuleSummary {
  percentage: number;
  status: "completed" | "incomplete";
  items: ChecklistItem;
  route: string;
}

// Skeleton Components
const SkeletonBox = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`} />
);

const CircularProgressSkeleton = ({ size = 120 }: { size?: number }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <SkeletonBox className={`w-${size} h-${size} rounded-full`} />
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <SkeletonBox className="h-8 w-16 rounded" />
      <SkeletonBox className="mt-2 h-4 w-12 rounded" />
    </div>
  </div>
);

const ModuleCardSkeleton = () => (
  <div className="w-full max-w-none">
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-darkSidebarBackground">
      {/* Status indicator skeleton */}
      <SkeletonBox className="h-1 w-full" />

      <div className="p-6">
        {/* Header skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SkeletonBox className="h-12 w-12 rounded-xl" />
            <div className="flex-1">
              <SkeletonBox className="mb-2 h-6 w-32 rounded" />
              <SkeletonBox className="h-4 w-24 rounded" />
            </div>
          </div>
          <SkeletonBox className="h-8 w-16 rounded-full" />
        </div>

        {/* Status and Action skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SkeletonBox className="h-5 w-5 rounded" />
            <SkeletonBox className="h-4 w-20 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <SkeletonBox className="h-10 w-16 rounded-lg" />
            <SkeletonBox className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonLoading = () => (
  <div className="min-h-dvh">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-12 text-center">
        <SkeletonBox className="mx-auto mb-4 h-10 w-80 rounded" />
        <SkeletonBox className="mx-auto h-6 w-96 rounded" />
      </div>

      {/* Overall Progress Section skeleton */}
      <div className="mb-12 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-darkSidebarBackground">
        <div className="text-center">
          <SkeletonBox className="mx-auto mb-6 h-8 w-48 rounded" />
          <div className="flex items-center justify-center">
            <CircularProgressSkeleton size={180} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-gray-100 p-4 dark:bg-gray-700"
              >
                <SkeletonBox className="mx-auto mb-2 h-8 w-12 rounded" />
                <SkeletonBox className="mx-auto h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules Grid skeleton */}
      <div className="mb-12">
        <div className="mb-8 text-center">
          <SkeletonBox className="mx-auto mb-2 h-8 w-64 rounded" />
          <SkeletonBox className="mx-auto mb-1 h-5 w-80 rounded" />
          <SkeletonBox className="mx-auto h-4 w-32 rounded" />
        </div>

        <div className="grid w-full grid-cols-1 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ModuleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Enhanced circular progress component with dark mode
const CircularProgress: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}> = ({ percentage, size = 120, strokeWidth = 8, className = "" }) => {
  const [mounted, setMounted] = useState(false);
  const springValue = useSpring(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = useTransform(
    springValue,
    [0, 100],
    [circumference, 0]
  );

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      springValue.set(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage, springValue]);

  if (!mounted) {
    return <div style={{ width: size, height: size }} />;
  }

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={percentage === 100 ? "#10b981" : "#3b82f6"}
            />
            <stop
              offset="100%"
              stopColor={percentage === 100 ? "#059669" : "#1d4ed8"}
            />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
          className="dark:stroke-gray-600"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {Math.round(percentage)}%
        </motion.span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Complete
        </span>
      </div>
    </div>
  );
};

// Module icon component with dark mode
const ModuleIcon: React.FC<{ name: string; completed: boolean }> = ({
  name,
  completed
}) => {
  const iconMap: Record<string, JSX.Element> = {
    "Company Information": (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    "AI Assessments": (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    Applications: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    Models: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
    Agents: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    Datasets: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
        />
      </svg>
    ),
    "Sub-Processors": (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        />
      </svg>
    ),
    FAQ: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    Updates: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
    Knowledge: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    Policies: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    )
  };

  return (
    <motion.div
      className={`rounded-xl p-3 transition-all duration-200 ${
        completed
          ? "bg-tertiary-100 text-tertiary-700 shadow-tertiary-100 dark:bg-tertiary-900/30 dark:text-tertiary-400"
          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {iconMap[name] || iconMap["Company Information"]}
    </motion.div>
  );
};

// Module card component with dark mode
interface ModuleCardProps {
  moduleName: string;
  moduleData: ModuleSummary;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  moduleName,
  moduleData,
  isExpanded,
  onToggle
}) => {
  // Updated to handle new API structure
  const completedItems = Object.values(moduleData.items || {}).filter(
    (item) => item.status === true
  ).length;
  const totalItems = Object.keys(moduleData.items || {}).length;
  const router = useRouter();

  // Calculate required and optional counts
  const requiredItems = Object.values(moduleData.items || {}).filter(
    (item) => item.required === true
  ).length;
  const optionalItems = totalItems - requiredItems;

  return (
    <div className="w-full max-w-none">
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:border-gray-300 hover:shadow-lg dark:border-neutral-800 dark:bg-darkSidebarBackground dark:hover:border-neutral-600">
        {/* Status indicator */}
        <div className="h-1 w-full bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-violet-500 dark:to-indigo-500" />

        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ModuleIcon
                name={moduleName}
                completed={moduleData.status === "completed"}
              />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-balance font-semibold text-gray-900 group-hover:text-gray-700 dark:text-white dark:group-hover:text-gray-200 sm:text-lg">
                    {moduleName}
                  </h3>
                  {/* Required/Optional labels moved here */}
                  <div className="flex items-center gap-2">
                    {requiredItems > 0 && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        {requiredItems} Required
                      </span>
                    )}
                    {optionalItems > 0 && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {optionalItems} Optional
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {completedItems} of {totalItems} items completed
                </p>
              </div>
            </div>

            <div
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                moduleData.status === "completed"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
            >
              {Math.round(moduleData.percentage || 0)}%
            </div>
          </div>

          {/* Status and Action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {moduleData.status === "completed" ? (
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Completed</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Incomplete</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(moduleData?.route)}
                className="rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 dark:from-violet-500 dark:to-indigo-500"
              >
                Open
              </button>
              <button
                onClick={onToggle}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                  isExpanded
                    ? "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {isExpanded ? "Hide Details" : "View Details"}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable content */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gray-50 dark:border-neutral-800 dark:bg-darkSidebarBackground">
            <div className="p-6">
              <h4 className="mb-4 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Checklist Items
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(moduleData.items || {}).map(
                  ([itemName, itemDetails]) => (
                    <div
                      key={itemName}
                      className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${
                        itemDetails.status
                          ? "border-tertiary-200 bg-tertiary-50 dark:border-tertiary-700 dark:bg-tertiary-900/20"
                          : "border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                          itemDetails.status
                            ? "bg-tertiary-500 dark:bg-tertiary-600"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        {itemDetails.status ? (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-white dark:bg-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <span
                          className={`text-sm font-medium ${
                            itemDetails.status
                              ? "text-tertiary-900 dark:text-tertiary-300"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {itemName}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component with dark mode
const TrustCenterChecklist: React.FC = () => {
  const { data, isValidating, error } = useSwr("trust-center/checklist");
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const router = useRouter();

  const findModuleForMissingItem = (
    missingItem: string,
    module_summary: Record<string, ModuleSummary>
  ): string | null => {
    for (const [moduleName, moduleData] of Object.entries(module_summary)) {
      if (
        moduleData.items &&
        Object.keys(moduleData.items).includes(missingItem)
      ) {
        return moduleName;
      }
    }
    for (const [moduleName, moduleData] of Object.entries(module_summary)) {
      if (moduleData.items) {
        const moduleItems = Object.keys(moduleData.items);
        const partialMatch = moduleItems.find(
          (item) =>
            item.toLowerCase().includes(missingItem.toLowerCase()) ||
            missingItem.toLowerCase().includes(item.toLowerCase())
        );

        if (partialMatch) {
          return moduleName;
        }
      }
    }
    if (module_summary[missingItem]) {
      return missingItem;
    }
    return null;
  };

  const handleMissingItemClick = (missingItem: string) => {
    if (!data?.checklist_report?.module_summary) {
      return;
    }

    const moduleName = findModuleForMissingItem(
      missingItem,
      data.checklist_report.module_summary
    );

    if (moduleName && moduleName in data.checklist_report.module_summary) {
      const moduleData = data.checklist_report.module_summary[moduleName];

      if (moduleData?.route) {
        router.push(moduleData.route);
      }
    }
  };

  // Filter missing items to show only required ones
  const getRequiredMissingItems = (
    missing_items: string[],
    module_summary: Record<string, ModuleSummary>
  ) => {
    return missing_items.filter((item) => {
      // Parse the missing item to extract module and item name
      const parts = item.split(" - ");
      if (parts.length >= 2) {
        const moduleName = parts[0];
        const itemName = parts.slice(1).join(" - ");

        if (moduleName && moduleName in module_summary) {
          const moduleData = module_summary[moduleName];
          if (moduleData && moduleData.items) {
            const itemDetails = moduleData.items[itemName];
            return itemDetails && itemDetails.required;
          }
        }
      }
      return false;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  // Loading state with skeleton
  if (isValidating) {
    return <SkeletonLoading />;
  }

  // Error state with dark mode
  if (error || !data) {
    return (
      <div className="flex size-full items-center justify-center">
        <motion.div
          className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-darkSidebarBackground"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Something went wrong
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Unable to load your checklist data. Please try refreshing the page.
          </p>
          {error && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">
              Error: {error.toString()}
            </p>
          )}
          <motion.button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const { checklist_report } = data;
  const { percentage_complete, module_summary, missing_items } =
    checklist_report;

  // Calculate statistics with updated structure
  const sortedModules = Object.entries(module_summary || {}) as [
    string,
    ModuleSummary
  ][];

  const completedModules = sortedModules.filter(
    ([_, moduleData]) => moduleData.status === "completed"
  ).length;
  const completedItems = sortedModules.reduce(
    (acc, [_, moduleData]) =>
      acc +
      Object.values(moduleData.items).filter((item) => item.status === true)
        .length,
    0
  );

  // Get only required missing items for Action Required section
  const requiredMissingItems = getRequiredMissingItems(
    missing_items,
    module_summary
  );

  return (
    <div className="min-h-dvh">
      <motion.div
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Trust Center Checklist
          </h1>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 sm:text-base">
            Monitor your compliance progress and complete essential trust
            requirements for your organization
          </p>
        </motion.div>

        {/* Overall Progress Section */}
        <motion.div
          className="mb-12 rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-darkSidebarBackground"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Overall Progress
            </h2>
            <div className="flex items-center justify-center">
              <CircularProgress
                percentage={percentage_complete}
                size={180}
                strokeWidth={12}
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-900/30 dark:to-blue-800/30">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {Math.round(percentage_complete)}%
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  Complete
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 dark:from-emerald-900/30 dark:to-emerald-800/30">
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                  {completedModules}
                </div>
                <div className="text-sm text-emerald-700 dark:text-emerald-400">
                  Modules Done
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-900/30 dark:to-purple-800/30">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                  {completedItems}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-400">
                  Items Complete
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-4 dark:from-orange-900/30 dark:to-orange-800/30">
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                  {requiredMissingItems.length}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-400">
                  Required Items
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Missing Items Alert - Only show required items */}
        {requiredMissingItems.length > 0 && (
          <motion.div
            className="mb-12 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg dark:border-orange-700 dark:from-orange-900/20 dark:to-red-900/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="p-6">
              <div className="mb-6 flex items-center">
                <div className="mr-4 rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                  <svg
                    className="h-6 w-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
                    Action Required
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                    Complete these {requiredMissingItems.length} required items
                    to achieve full compliance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {requiredMissingItems.map((item: string, index: number) => {
                  const moduleName = findModuleForMissingItem(
                    item,
                    module_summary
                  );

                  return (
                    <motion.div
                      key={item}
                      className="flex cursor-pointer items-start rounded-xl border border-orange-200 bg-white p-4 transition-all duration-200 hover:shadow-md dark:border-none dark:border-orange-700 dark:bg-darkSidebarBackground"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleMissingItemClick(item);
                      }}
                    >
                      <div className="mr-3 mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500 dark:bg-orange-400"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item}
                        </p>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          {moduleName
                            ? `Found in: ${moduleName}`
                            : "Module not found - check  for details"}
                        </p>
                        <span className="mt-2 inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Required
                        </span>
                      </div>
                      <motion.button
                        className="ml-2 rounded-lg bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMissingItemClick(item);
                        }}
                      >
                        Fix
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Modules Grid */}
        <div className="mb-12">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Module Progress
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
              Track completion status for each compliance module
            </p>
          </div>

          {sortedModules.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-lg dark:border-neutral-800 dark:bg-darkSidebarBackground">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-darkMainBackground">
                <svg
                  className="h-8 w-8 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No Modules Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                No compliance modules were found in the API response.
              </p>
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 gap-6">
              {sortedModules.map(([moduleName, moduleData], index) => {
                return (
                  <ModuleCard
                    key={moduleName}
                    moduleName={moduleName}
                    moduleData={moduleData}
                    index={index}
                    isExpanded={expandedModule === moduleName}
                    onToggle={() =>
                      setExpandedModule(
                        expandedModule === moduleName ? null : moduleName
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
        {checklist_report && (
          <div className="flex w-full items-center justify-end pb-10 pt-4">
            <CustomButton
              onClick={() => router.push("/self-assessment/trust-center")}
            >
              Go to Report
            </CustomButton>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TrustCenterChecklist;
