import { Tooltip } from "@mui/material";
import { Calendar, ExternalLink } from "lucide-react";

interface EnhancedMetadata {
  name: string;
  version: string;
  jurisdiction: string;
  description: string;
  link: string;
  title: string;
  organization: string;
  release_date: string;
  type: string;
  scope: string;
  status: string;
  key_features: string;
  favicon: string;
}

const EnhancedLinkCard: React.FC<{
  metadata: EnhancedMetadata;
  isLoading?: boolean;
}> = ({ metadata, isLoading = false }) => {
  // Helper function to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) {
      return "";
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 dark:border-gray-700 dark:bg-gray-800">
        <div className="relative h-28 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tooltip
      title={
        (metadata?.link?.startsWith("http") ||
          metadata?.link?.startsWith("https")) && (
          <div className="text-center">
            <div className="text-sm font-medium">External Link</div>
            <div className="text-xs opacity-90">Opens in new tab</div>
          </div>
        )
      }
      placement="top"
      arrow
    >
      <div
        tabIndex={0}
        role="button"
        onClick={() => {
          if (
            metadata?.link?.startsWith("http") ||
            metadata?.link?.startsWith("https")
          ) {
            window.open(metadata.link, "_blank");
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (
              metadata?.link?.startsWith("http") ||
              metadata?.link?.startsWith("https")
            ) {
              window.open(metadata.link, "_blank");
            }
          }
        }}
        className="group relative cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:bg-darkSidebarBackground"
      >
        <div className="space-y-3 p-4">
          {/* Title and Favicon */}
          <div className="flex items-center gap-2">
            {metadata.favicon ? (
              <img
                src={metadata.favicon}
                alt="favicon"
                className="mt-0.5 size-6 flex-shrink-0 rounded-sm"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex size-6 items-center justify-center rounded-lg bg-tertiary text-white">
                {metadata?.title?.slice(0, 2).toUpperCase() ||
                  metadata?.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 dark:text-white xl:line-clamp-1 xl:text-nowrap">
              {metadata.title || metadata.name}
            </h3>
            {(metadata?.link?.startsWith("http") ||
              metadata?.link?.startsWith("https")) && (
              <ExternalLink className="ml-auto h-4 w-4 flex-shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {metadata.description}
          </p>

          {/* Footer with External Link text and Date */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <span className="flex-1 truncate pr-2">
              {metadata.jurisdiction}
            </span>

            {metadata.release_date && (
              <div className="flex flex-shrink-0 items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="whitespace-nowrap">
                  {formatDate(metadata.release_date)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Tooltip>
  );
};
export default EnhancedLinkCard;
