"use client";
import MarkdownRenderer from "@/shared/common/MarkdownRenderer";
import useSwr from "@/shared/hooks/useSwr";
import CopyAllOutlinedIcon from "@mui/icons-material/CopyAllOutlined";
import { IconButton, Tooltip } from "@mui/material";
import { FileText } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import dynamic from "next/dynamic";
const ArtifactCard = dynamic(() => import("./ArtifactCard"), {
  ssr: false
});
const EnhancedLinkCard = dynamic(() => import("./EnhancedLinkCard"), {
  ssr: false
});
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

interface ConversationProps {
  query: string;
  response?: string;
  isLoading: boolean;
  loading?: boolean;
  error?: string;
  collection_id?: string;
  showArtifactCard?: boolean;
  enhancedMetadata?: EnhancedMetadata[];
}

const Conversation: React.FC<ConversationProps> = ({
  query,
  response,
  isLoading,
  loading,
  collection_id,
  showArtifactCard,
  enhancedMetadata
}) => {
  const { data } = useSwr("knowledge/collections");

  const selectCollection =
    data?.collections?.length > 0
      ? data?.collections.find(
          (item: {
            collection_id: string;
            collection_name: string;
            description: string;
          }) => item.collection_id === collection_id
        )
      : null;

  const handleCopy = () => {
    if (response) {
      const formattedResponse = response
        .replace(/\n\n/g, "\n\n")
        .replace(/\n(?=\d\.)/g, "\n\n")
        .replace(/\*\*(.*?)\*\*/g, "**$1**")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "[$1]($2)");

      navigator.clipboard.writeText(formattedResponse).then(() => {
        toast.success("Copied to Clipboard");
      });
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 px-2">
      <div className="flex w-full flex-col gap-2">
        {selectCollection && selectCollection?.collection_id && (
          <div className="relative my-2 flex w-52 max-w-md items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1">
            <span className="flex size-8 items-center justify-center rounded-md bg-tertiary">
              <FileText size={16} className="text-white" />
            </span>
            <span className="flex w-full flex-col">
              <p className="line-clamp-1 w-full text-sm font-medium text-gray-900 dark:invert">
                {selectCollection?.collection_name}
              </p>
              <p className="text-xs font-medium text-gray-600">Collection</p>
            </span>
          </div>
        )}
        <ul className="flex w-full items-start gap-3 pl-2">
          <Image
            src="/user.svg"
            className="dark:invert lg:-mt-1"
            alt="loader"
            width={30}
            height={30}
          />
          <p className="font-satoshi font-medium tracking-wider text-gray-700 dark:text-white">
            {query}
          </p>
        </ul>
      </div>

      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full items-start gap-1 rounded-t-[14px] bg-gray-100/80 px-2 py-3 dark:bg-neutral-800/40 md:gap-2 md:px-4">
          <span className="size-fit">
            {isLoading ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                className="animate-spin text-gray-700 dark:text-white"
                viewBox="0 0 16 16"
              >
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                <path
                  fillRule="evenodd"
                  d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                />
              </svg>
            ) : (
              <Image
                src="/response.svg"
                alt="loader"
                width={25}
                height={25}
                className="dark:invert"
              />
            )}
          </span>

          {isLoading ? (
            <div role="status" className="w-full animate-pulse space-y-2.5">
              <div className="flex w-full items-center">
                <div className="h-2.5 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="ms-2 h-2.5 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="ms-2 h-2.5 w-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
              </div>
              <div className="flex w-full items-center">
                <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="ms-2 h-2.5 w-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="ms-2 h-2.5 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              </div>
              <div className="flex w-full items-center">
                <div className="h-2.5 w-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="ms-2 h-2.5 w-80 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="ms-2 h-2.5 w-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-3">
              <div className="w-full font-satoshi font-normal tracking-wider text-gray-700 dark:text-white">
                <MarkdownRenderer content={response || ""} />
              </div>
              {showArtifactCard && !isLoading && <ArtifactCard />}

              {/* Enhanced Metadata Cards */}
              {enhancedMetadata && enhancedMetadata.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sources ({enhancedMetadata.length})
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {enhancedMetadata.map((metadata, index) => (
                      <EnhancedLinkCard
                        key={`${metadata.link}-${index}`}
                        metadata={metadata}
                        isLoading={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!loading && (
          <div className="flex w-full items-center justify-end rounded-b-[14px] bg-gray-100/80 px-2 py-1 dark:bg-neutral-800/40 md:px-4">
            <div className="flex items-center">
              <Tooltip title="Copy Text">
                <IconButton>
                  <CopyAllOutlinedIcon
                    onClick={handleCopy}
                    className="!hover:text-gray-600 !text-gray-400"
                  />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversation;
