import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Plus,
  Settings
} from "lucide-react";
import React, { useState } from "react";
import { getIntegrationIcon, IntegrationMetadata, SubTab } from "./Integration";
interface IntegrationCardProps {
  integration: SubTab;
  metadata: IntegrationMetadata;
  onConfigure: (integration: SubTab) => void;
}
interface StatusBadgeProps {
  status: "connected" | "partial" | "disconnected";
  channelsConfigured?: boolean | undefined;
  integrationName: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  channelsConfigured,
  integrationName
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          label: "Connected",
          color:
            "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900/30 dark:text-tertiary-300",
          borderColor: "border-l-tertiary-500",
          icon: <CheckCircle2 className="h-3 w-3" />,
          pulse: true
        };
      case "partial":
        return {
          label: "Partial Setup",
          color:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
          borderColor: "border-l-amber-500",
          icon: <AlertCircle className="h-3 w-3" />,
          pulse: false
        };
      default:
        return {
          label: "Disconnected",
          color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          borderColor: "border-l-red-500",
          icon: <AlertCircle className="h-3 w-3" />,
          pulse: false
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="mb-4 flex flex-col gap-2">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${config.color}`}
      >
        <span className={config.pulse ? "animate-pulse" : ""}>
          {config.icon}
        </span>
        {config.label}
      </span>
      {integrationName === "Slack" && (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${channelsConfigured ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900/30 dark:text-tertiary-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}
        >
          {channelsConfigured
            ? "Channels Configured"
            : "No Channels Configured"}
        </span>
      )}
    </div>
  );
};

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  metadata,
  onConfigure
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const statusConfig = {
    connected: "border-l-tertiary-500",
    partial: "border-l-amber-500",
    disconnected: "border-l-red-500"
  };
  const borderColor = statusConfig[metadata.status];

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    const nextSibling = target.nextSibling as HTMLElement;
    target.style.display = "none";
    if (nextSibling) {
      nextSibling.style.display = "block";
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      className={`relative w-full rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-darkMainBackground ${borderColor} cursor-pointer overflow-hidden border-l-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onConfigure(integration)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onConfigure(integration);
        }
      }}
    >
      <div className="w-full p-6">
        <div className="mb-4 flex w-full items-start justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div
              className={`relative h-16 w-16 ${metadata.bgColor} ${metadata.darkBgColor} flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600`}
            >
              {metadata.image && (
                <img
                  src={metadata.image}
                  alt={metadata.name}
                  className="h-8 w-8"
                  style={{ filter: "none" }}
                  onError={handleImageError}
                />
              )}
              <div style={{ display: metadata.image ? "none" : "block" }}>
                {getIntegrationIcon(integration.metadata.reference)}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="mb-1 truncate text-xl font-bold text-gray-900 dark:text-gray-100">
                {metadata.name}
              </h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {metadata.description}
              </p>
            </div>
          </div>

          <div
            className={`transition-all duration-300 ${isHovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"}`}
          >
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <StatusBadge
          status={metadata.status}
          channelsConfigured={metadata.channelsConfigured}
          integrationName={metadata.name}
        />

        <div className="flex gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
          {integration.permission.actions.update && (
            <button
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-tertiary-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-tertiary-700"
              onClick={(e) => {
                e.stopPropagation();
                onConfigure(integration);
              }}
            >
              {metadata.status === "connected" ? (
                <>
                  <Settings className="h-4 w-4" />
                  Manage
                </>
              ) : metadata.status === "partial" ? (
                <>
                  <Settings className="h-4 w-4" />
                  Complete Setup
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Configure
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default IntegrationCard;
