"use client";
import CustomButton from "@/shared/core/CustomButton";
import Empty from "@/shared/core/Empty";
import useSwr from "@/shared/hooks/useSwr";
import { useMyContext } from "@/shared/providers/AppProvider";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { FC, useMemo, useState } from "react";
import { BiTime } from "react-icons/bi";
import { FaArrowRight } from "react-icons/fa6";
import { IoAdd, IoSearch } from "react-icons/io5";

interface Message {
  user_query: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  AI_response: string;
  timestamp?: string;
}

interface Chat {
  session_id: string;
  messages: Message[];
  timestamp?: string;
  created_at?: string;
}

interface ProjectData {
  project_name: string;
  chats: Chat[];
}

interface ApiResponse {
  data?: ProjectData;
  isValidating: boolean;
  error?: unknown;
}

// Skeleton component with TypeScript
interface SkeletonProps {
  className?: string;
}

const Skeleton: FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  );
};

const Projects: FC = () => {
  const params = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { setMetaTitle } = useMyContext();
  const { data, isValidating }: ApiResponse = useSwr(
    `projects/name?project_id=${params["id"]}`
  );

  // Format relative time
  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) {
      return "Recently";
    }

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    }
    if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    }
    if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
    if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  // Filtered chats based on search query
  const filteredChats = useMemo(() => {
    if (!data?.chats?.length) {
      return [];
    }

    return data.chats.filter((chat) =>
      chat?.messages?.[0]?.user_query
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [data?.chats, searchQuery]);

  // Extract and clean AI response preview
  const getResponsePreview = (response?: string): string => {
    if (!response) {
      return "";
    }
    // Remove markdown headers and formatting
    return (
      response
        .replace(/^#+\s+/gm, "")
        .replace(/\*\*/g, "")
        .replace(/\n+/g, " ")
        .slice(0, 120) + (response.length > 120 ? "..." : "")
    );
  };

  return (
    <div className="flex h-fit w-full flex-col space-y-6 py-4">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-5 border-b border-gray-100 pb-2 dark:border-gray-800 lg:flex-row lg:items-center">
        <div className="flex flex-col">
          {isValidating ? (
            <Skeleton className="mb-2 h-8 w-48" />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data?.project_name || "Project"}
            </h1>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isValidating ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `${filteredChats.length} conversation${filteredChats.length !== 1 ? "s" : ""}`
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end lg:self-auto">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <IoSearch className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="search"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 lg:w-64"
            />
          </div>

          <CustomButton
            startIcon={<IoAdd size={16} />}
            onClick={() => router.push("/")}
          >
            New Chat
          </CustomButton>
        </div>
      </div>

      {/* Content section */}
      <div className="flex w-full flex-col space-y-1">
        {isValidating ? (
          // Skeleton loaders
          Array(3)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex flex-col rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <Skeleton className="mb-3 h-5 w-3/5" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="mb-2 h-4 w-4/5" />
                <Skeleton className="mb-3 h-4 w-2/5" />
                <div className="mt-2 w-full border-b border-gray-100 dark:border-gray-800"></div>
              </div>
            ))
        ) : filteredChats.length > 0 ? (
          // Actual chat list
          filteredChats.map((chat, index) => (
            <div
              key={index}
              tabIndex={0}
              role="button"
              onClick={() => {
                router?.push(`/c/${chat.session_id}`);
                setMetaTitle(chat.messages[0]?.user_query || "");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router?.push(`/c/${chat.session_id}`);
                  setMetaTitle(chat.messages[0]?.user_query || "");
                }
              }}
              className="group flex cursor-pointer flex-col rounded-lg border border-transparent p-4 transition-all duration-200 hover:border-blue-100 hover:bg-blue-50/70 dark:hover:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <div className="mb-1.5 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-800/30">
                    <FaArrowRight size={12} />
                  </div>
                  <h3 className="line-clamp-1 text-base font-medium text-gray-800 dark:text-white">
                    {chat.messages[0]?.user_query || "Untitled Chat"}
                  </h3>
                </div>

                <div className="ml-4 flex items-center whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  <BiTime className="mr-1" />
                  {formatRelativeTime(chat.timestamp || chat.created_at)}
                </div>
              </div>

              {chat.messages[0]?.AI_response && (
                <p className="line-clamp-2 pl-10 text-sm text-gray-500 dark:text-gray-400">
                  {getResponsePreview(chat.messages[0].AI_response)}
                </p>
              )}

              <div className="mt-4 w-full border-b border-gray-100 dark:border-gray-800"></div>
            </div>
          ))
        ) : (
          // Empty state
          <div className="mt-4 flex w-full items-center justify-center rounded-xl border border-gray-100 bg-white/50 p-10 text-center shadow-sm dark:border-gray-800/70 dark:bg-gray-800/30">
            <div className="w-fit max-w-md py-8">
              <Empty
                title="No Conversations Yet"
                subTitle="Start your first chat in this project"
                pathName="New Chat"
                link="/"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
