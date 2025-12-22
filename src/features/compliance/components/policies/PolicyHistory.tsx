"use client";
import usePermission from "@/shared/hooks/usePermission";
import { useMyContext } from "@/shared/providers/AppProvider";
import { formatDateTime } from "@/shared/utils";
import { Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { Search, Trash2, X } from "lucide-react";
import moment from "moment";
import { useMemo, useState } from "react";
import { RiArrowDownDoubleLine } from "react-icons/ri";

const PolicyHistory = ({
  sessions,
  loading,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  isLoading,
  open,
  setOpen
}: {
  sessions: Array<{
    session_id: string;
    query: string;
    updated_at: string;
  }> | null;
  loading: boolean;
  isLoading: boolean;
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [id, setId] = useState<string>("");
  const { setMetaTitle } = useMyContext();
  const { user, isUserLoading } = usePermission();
  const filteredSessions = useMemo(() => {
    if (!sessions) {
      return [];
    }
    if (!searchTerm.trim()) {
      return sessions;
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return sessions.filter((session) =>
      session.query.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [sessions, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-tertiary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div
      className={`absolute top-0 z-999 flex h-full w-[20rem] flex-col gap-3 bg-white p-4 duration-300 dark:bg-darkSidebarBackground ${
        open ? "left-0" : "-left-96"
      } `}
    >
      <div className="flex w-full items-center justify-between">
        <p className="font-semibold text-gray-800 dark:text-white">History</p>
        <RiArrowDownDoubleLine
          onClick={() => setOpen(false)}
          className="rotate-90 cursor-pointer text-2xl dark:text-neutral-400"
        />
      </div>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search history..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-tertiary-500 focus:ring-1 focus:ring-tertiary-500 dark:border-neutral-600 dark:bg-darkMainBackground dark:text-white dark:placeholder-gray-400"
        />
        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="h-full space-y-2 overflow-y-auto">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <motion.button
              key={session.session_id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSelectSession(session.session_id);
                setOpen(false);
                setMetaTitle(session.query || "New conversation");
              }}
              className={`group relative w-full rounded-lg p-2 text-left text-sm ${
                session.session_id === currentSessionId
                  ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900/30 dark:text-tertiary-300"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-darkMainBackground dark:text-gray-300 dark:hover:bg-darkHoverBackground"
              }`}
            >
              <div className="absolute right-1 top-1 hidden group-hover:block">
                <Tooltip title="Delete Chat" placement="top">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-red-500 transition-all hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30">
                    {isLoading && id === session.session_id ? (
                      <svg
                        className="h-4 w-4 animate-spin text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <Trash2
                        className="h-4 w-4 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDeleteSession(session.session_id);
                          setId(session.session_id);
                        }}
                      />
                    )}
                  </div>
                </Tooltip>
              </div>
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="line-clamp-1 font-medium">
                    {session.query || "New conversation"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {!isUserLoading &&
                      user &&
                      session.updated_at &&
                      moment(
                        formatDateTime(session.updated_at, user?.date_time)
                      ).format("lll")}
                  </p>
                </div>
                {session.session_id === currentSessionId && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-tertiary-500"></div>
                  </div>
                )}
              </div>
            </motion.button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No matching sessions found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyHistory;
