"use client";
import useMutation from "@/shared/hooks/useMutation";
import { useMyContext } from "@/shared/providers/AppProvider";
import { Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import { Folder, Trash2 } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { PROJECTDATA } from "./Library";
const DeleteProject = ({
  projectId,
  mutate,
  projectMutate,
  isDelete
}: {
  projectId: string;
  mutate: () => void;
  projectMutate: () => void;
  isDelete: boolean;
}) => {
  const { isLoading, mutation } = useMutation();

  const deleteProject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete this project.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "Cancel"
      });
      if (result.isConfirmed) {
        const res = await mutation(`projects?project_id=${projectId}`, {
          method: "DELETE"
        });
        if (res?.status === 200) {
          toast.success("Project deleted successfully");
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
    <Trash2
      className="h-4 w-4"
      onClick={(e) => {
        if (isDelete) {
          e.stopPropagation();
          e.preventDefault();
          deleteProject(e);
        } else {
          e.stopPropagation();
          e.preventDefault();
          toast.error("You don't have permission to delete this project");
        }
      }}
    />
  );
};

const LibraryProject = ({
  item,
  index,
  mutate,
  projectMutate,
  isDelete
}: {
  item: PROJECTDATA;
  index: number;
  mutate: () => void;
  projectMutate: () => void;
  isDelete: boolean;
}) => {
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(false);
  const { setMetaTitle } = useMyContext();
  return (
    <motion.div
      key={index}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      viewport={{ once: true }}
      onClick={() => {
        if (item?.session_ids?.length > 0) {
          router?.push(`/library/${item?.project_id}`);
          setMetaTitle(
            `Project : ${item?.project_name ?? "Untitled"} | Cognitiveview`
          );
        }
      }}
      className="group relative mb-2 cursor-pointer overflow-hidden rounded-xl transition-all last:mb-0 hover:bg-[#f8f8ff] dark:hover:bg-gray-800"
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {showOptions && isDelete && (
        <div className="absolute right-1 top-1">
          <Tooltip title="Delete Project" placement="top">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-red-500 transition-all hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30">
              <DeleteProject
                projectId={item?._id}
                mutate={mutate}
                projectMutate={projectMutate}
                isDelete={isDelete}
              />
            </button>
          </Tooltip>
        </div>
      )}
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7776c9]/20 to-[#5452b7]/20 text-[#6160b0] group-hover:from-[#7776c9]/30 group-hover:to-[#5452b7]/30 dark:from-[#6160b0]/20 dark:to-[#4e4da6]/20">
            <Folder className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h3 className="font-medium text-gray-900 transition-colors group-hover:text-[#6160b0] dark:text-white dark:group-hover:text-[#a09fdf]">
              {item?.project_name}
            </h3>
          </div>

          {item?.session_ids?.length > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6160b0]/10 text-xs font-medium text-[#6160b0] dark:bg-[#6160b0]/20">
              {item?.session_ids?.length}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LibraryProject;
