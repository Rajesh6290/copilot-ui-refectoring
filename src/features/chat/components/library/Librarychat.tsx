"use client";
import useMutation from "@/shared/hooks/useMutation";
import usePermission from "@/shared/hooks/usePermission";
import { useMyContext } from "@/shared/providers/AppProvider";
import { formatDateTime } from "@/shared/utils";
import Tooltip from "@mui/material/Tooltip";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, FolderPlus, Tag, Trash2 } from "lucide-react";
import moment from "moment";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { CHATDATA, PROJECTDATA } from "./Library";
import dynamic from "next/dynamic";
const AddToProject = dynamic(() => import("../project/AddToProject"), {
  ssr: false
});
const DeleteChat = ({
  sessionId,
  mutate,
  projectMutate
}: {
  sessionId: string;
  mutate: () => void;
  projectMutate: () => void;
}) => {
  const { isLoading, mutation } = useMutation();

  const deleteSessionChat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete this chats.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "Cancel"
      });
      if (result.isConfirmed) {
        const res = await mutation(
          `conversation/session/?session_id=${sessionId}`,
          {
            method: "DELETE"
          }
        );
        if (res?.status === 200) {
          toast.success("Chat deleted successfully", {
            position: "bottom-right"
          });
          mutate();
          projectMutate();
        }
      }
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };

  return isLoading ? (
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
    <Trash2 className="h-4 w-4" onClick={deleteSessionChat} />
  );
};

const Librarychat = ({
  item,
  mutate,
  projectMutate,
  userId,
  projectData,
  index,
  isDelete
}: {
  item: CHATDATA;
  mutate: () => void;
  projectMutate: () => void;
  userId: string;
  projectData: PROJECTDATA[];
  index: number;
  isDelete: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const router = useRouter();
  const { setMetaTitle } = useMyContext();
  const { isUserLoading, user } = usePermission();
  // Generate a truncated preview of the conversation
  const previewText = item?.first_user_query || "New Conversation";

  // Check if the chat is assigned to a project
  const isAssigned = item?.projects?.length > 0;

  return (
    <>
      <AddToProject
        open={open}
        setOpen={() => setOpen(!open)}
        mutate={mutate}
        projectMutate={projectMutate}
        userId={userId}
        projectData={projectData}
        sessionId={item?.session_id}
      />
      <motion.div
        key={index}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        viewport={{ once: true }}
        className={`group relative overflow-hidden border-l-4 ${
          isAssigned ? "border-l-[#6160b0]" : "border-l-transparent"
        } transition-all`}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        <div className="p-4">
          <div
            tabIndex={0}
            role="button"
            onClick={() => {
              router?.push(`/c/${item?.session_id}`);
              setMetaTitle(previewText || "New Conversation");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                router?.push(`/c/${item?.session_id}`);
                setMetaTitle(previewText || "New Conversation");
              }
            }}
            className="cursor-pointer"
          >
            {/* Title with icon */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="line-clamp-1 text-base font-medium text-gray-800 group-hover:text-[#6160b0] dark:text-white dark:group-hover:text-[#a09fdf]">
                  {previewText}
                </h3>

                {/* Chat metadata */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {!isUserLoading &&
                        user &&
                        item?.created_at &&
                        user?.date_time &&
                        moment(
                          formatDateTime(
                            item?.created_at,
                            user && user?.date_time
                          )
                        ).format("lll")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Go to chat icon */}
              <div className="ml-2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-full bg-[#6160b0]/10 p-1.5 text-[#6160b0]">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Project assignment status */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center ${isAssigned ? "opacity-100" : "opacity-70"}`}
              >
                <Tag
                  className={`mr-1.5 h-3.5 w-3.5 ${isAssigned ? "text-[#6160b0]" : "text-gray-400"}`}
                />
                <span
                  className={`text-xs font-medium ${isAssigned ? "text-[#6160b0]" : "text-gray-400"}`}
                >
                  {isAssigned ? "Assigned to:" : "Not assigned to any project"}
                </span>
              </div>

              {isAssigned && (
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center rounded-full bg-[#eaeaff] px-3 py-1 text-xs font-medium text-[#6160b0] dark:bg-[#6160b0]/20 dark:text-[#a09fdf]">
                    {item?.projects?.[0]?.project_name}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div
              tabIndex={0}
              role="button"
              className={`flex items-center gap-2 transition-opacity ${
                showOptions ? "opacity-100" : "opacity-0"
              }`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                }
              }}
            >
              {!isAssigned && (
                <Tooltip title="Add to project" placement="top">
                  <button
                    onClick={() => setOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[#6160b0] transition-all hover:bg-[#eaeaff] hover:text-[#6160b0] dark:bg-gray-800 dark:hover:bg-[#6160b0]/20"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </button>
                </Tooltip>
              )}

              {isDelete && (
                <Tooltip title="Delete chat" placement="top">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-red-500 transition-all hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30">
                    <DeleteChat
                      sessionId={item?.session_id}
                      mutate={mutate}
                      projectMutate={projectMutate}
                    />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Librarychat;
