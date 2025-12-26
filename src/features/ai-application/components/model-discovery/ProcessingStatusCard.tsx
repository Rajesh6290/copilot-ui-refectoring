"use client";
import { Clock, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";

const ProcessingStatusCard: React.FC<{
  processingType: "discover" | "sync" | null;
  selectedSource: string;
}> = React.memo(({ processingType, selectedSource }) => {
  const [dots, setDots] = useState<string>(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const isDiscovery = processingType === "discover";
  const title = isDiscovery ? "Discovering Assets" : "Syncing Assets";
  const description = isDiscovery
    ? `We're discovering AI assets from ${selectedSource}. This may take a few moments.`
    : `We're syncing the latest assets from ${selectedSource}. Please wait.`;

  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-600 dark:bg-gray-800/50">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-tertiary-400 opacity-20"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-500 to-tertiary-600 shadow-lg">
              <RefreshCw className="h-12 w-12 animate-spin text-white" />
            </div>
          </div>
        </div>

        <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          {title}
          <span className="inline-block w-8 text-left">{dots}</span>
        </h3>

        <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>This process may take 30 seconds to a few minutes</span>
          </div>

          <div className="rounded-lg border-2 border-dashed border-tertiary-200 bg-tertiary-50 px-6 py-4 dark:border-tertiary-800 dark:bg-tertiary-900/20">
            <p className="text-sm font-medium text-tertiary-700 dark:text-tertiary-300">
              {` 💡 You can wait here or navigate away. We'll continue processing
              in the background.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

ProcessingStatusCard.displayName = "ProcessingStatusCard";
export default ProcessingStatusCard;
