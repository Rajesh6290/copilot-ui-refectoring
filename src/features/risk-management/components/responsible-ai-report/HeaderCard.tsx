// components/HeaderCard.tsx
import { getFromLocalStorage } from "@/shared/utils";
import { motion } from "framer-motion";
import { Building, Download, FileText, Layers, Loader2 } from "lucide-react";
import { useState } from "react";
import { PiShareFatLight } from "react-icons/pi";
import { toast } from "sonner";
import { ApiData } from "./ResposibleAiReport";
import dynamic from "next/dynamic";
const ShareResponsibleDashboard = dynamic(
  () => import("./ShareResponsibleDashboard"),
  {
    ssr: false
  }
);
export interface IsAccess {
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      update: boolean;
      delete: boolean;
      read: boolean;
    };
  };
}
interface HeaderCardProps {
  data: ApiData;
  mutate: () => void;
  isAccess: IsAccess;
}

export const HeaderCard = ({ data, mutate, isAccess }: HeaderCardProps) => {
  const [host] = useState(
    typeof window !== "undefined" ? window.location.host : ""
  );
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Add loading state

  const downloadReport = async () => {
    setIsDownloading(true); // Start loading
    const token = getFromLocalStorage("ACCESS_TOKEN");
    try {
      const response = await fetch(
        `/api/cv/v1/responsible-ai/report/download?qr_url=${host === "localhost:3000" ? `http://${host}/report-verify` : `https://${host}/report-verify`}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "report.pdf"; // fallback default

      if (contentDisposition) {
        // Try to extract filename from Content-Disposition header
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, ""); // remove quotes
        }
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename; // Use dynamic filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up the object URL

      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download report"
      );
    } finally {
      setIsDownloading(false); // Stop loading
    }
  };

  return (
    <>
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-900 dark:bg-darkSidebarBackground sm:p-6 lg:p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Application Icon */}
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex items-center gap-5">
                  <div className="flex-shrink-0">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary-500 via-purple-600 to-indigo-700 text-xl font-bold text-white shadow-lg sm:h-16 sm:w-16 sm:text-2xl lg:rounded-2xl">
                      {data?.application_name?.substring(0, 2)?.toUpperCase() ||
                        "AI"}
                    </div>
                  </div>
                  <div className="flex w-fit items-center gap-5">
                    <h1 className="text-nowrap text-xl font-bold text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
                      Responsible AI Score
                    </h1>
                    {isAccess?.permission?.is_shown && (
                      <div className="hidden w-fit sm:block">
                        <motion.button
                          onClick={() => setIsInviteDialogOpen(true)}
                          className="group flex items-center space-x-2 text-nowrap rounded-lg bg-gradient-to-r from-tertiary-500 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:from-tertiary-600 hover:to-indigo-700 hover:shadow-xl"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <PiShareFatLight className="text-sm transition-transform duration-300 group-hover:rotate-12" />
                          <span className="text-sm">Share Report</span>
                        </motion.button>
                      </div>
                    )}
                    <div className="hidden w-fit sm:block">
                      <motion.button
                        onClick={downloadReport}
                        disabled={isDownloading} // Disable button while downloading
                        className="group flex items-center space-x-2 text-nowrap rounded-lg bg-gradient-to-r from-tertiary-500 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:from-tertiary-600 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-tertiary-500 disabled:hover:to-indigo-600"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {isDownloading ? (
                          <Loader2 size={15} className="animate-spin text-sm" />
                        ) : (
                          <Download
                            size={15}
                            className="text-sm transition-transform duration-300 group-hover:rotate-12"
                          />
                        )}
                        <span className="text-sm">
                          {isDownloading ? "Downloading..." : "Download Report"}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center gap-5">
                  {isAccess?.permission?.is_shown && (
                    <div className="sm:hidden">
                      <motion.button
                        onClick={() => setIsInviteDialogOpen(true)}
                        className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-tertiary-500 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:from-tertiary-600 hover:to-indigo-700 hover:shadow-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <PiShareFatLight className="text-sm" />
                        <span>Share</span>
                      </motion.button>
                    </div>
                  )}
                  <div className="sm:hidden">
                    <motion.button
                      onClick={downloadReport}
                      disabled={isDownloading}
                      className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-tertiary-500 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:from-tertiary-600 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-tertiary-500 disabled:hover:to-indigo-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {isDownloading ? (
                        <Loader2 size={12} className="animate-spin text-sm" />
                      ) : (
                        <Download size={12} className="text-sm" />
                      )}
                      <span>
                        {isDownloading ? "Downloading..." : "Download"}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                {[
                  {
                    icon: Building,
                    label: "Application Name",
                    value:
                      data?.application_name?.replace(/_/g, " ") ||
                      "Unknown Application"
                  },
                  {
                    icon: Layers,
                    label: "Report ID",
                    value: data?.report_id || "Unknown Type"
                  },
                  {
                    icon: FileText,
                    label: "Use Case",
                    value:
                      data?.use_case?.replace(/_/g, " ") || "AI Application"
                  },
                  {
                    icon: Layers,
                    label: "Evaluation Framework",
                    value:
                      data?.provider?.replace(/_/g, " ") || "Unknown Provider"
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-gray-50 p-3 dark:bg-darkMainBackground sm:p-4"
                  >
                    <div className="mb-2 flex items-center space-x-2">
                      <item.icon className="h-4 w-4 flex-shrink-0 text-tertiary-600" />
                      <span className="text-nowrap text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                        {item.label}
                      </span>
                    </div>
                    <p className="truncate text-sm font-semibold capitalize text-gray-900 dark:text-white sm:text-lg">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            {/* Health Index Progress Bar */}
            <div className="l w-full rounded-2xl border border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-neutral-900 dark:bg-darkMainBackground sm:w-80 sm:p-8">
              <div className="flex flex-col space-y-6">
                {/* Score Labels */}
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                      Current Score
                    </div>
                    <span
                      className={`text-2xl font-bold sm:text-3xl ${
                        (data?.health_index || 0) >= 75
                          ? "text-green-600"
                          : (data?.health_index || 0) >= 50
                            ? "text-orange-600"
                            : "text-red-600"
                      }`}
                    >
                      {data?.health_index || 0}%
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                      Target Score
                    </div>
                    <span className="text-2xl font-bold text-green-600 sm:text-3xl">
                      75%
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="relative w-full">
                  {/* Progress Bar Track */}
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700">
                    {/* Progress Bar Fill */}
                    <motion.div
                      className={`h-full rounded-full shadow-sm transition-all duration-500 ${
                        (data?.health_index || 0) >= 75
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : (data?.health_index || 0) >= 50
                            ? "bg-gradient-to-r from-orange-500 to-orange-600"
                            : "bg-gradient-to-r from-red-500 to-red-600"
                      }`}
                      style={{ width: `${data?.health_index || 0}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${data?.health_index || 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>

                  {/* 75% Position Indicator */}
                  <div className="absolute left-3/4 top-0 -translate-x-1/2 transform">
                    <div className="h-4 w-1 bg-green-500 shadow-sm"></div>
                    <div className="absolute left-1/2 top-5 -translate-x-1/2 transform">
                      <div className="rounded-md bg-green-500 px-2 py-1 text-xs font-medium text-white shadow-md">
                        Target
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Labels */}
                  <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Status Indicator */}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Invite User Dialog */}
      <ShareResponsibleDashboard
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        mutate={mutate}
      />
    </>
  );
};
