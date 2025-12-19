"use client";
import CustomButton from "@/shared/core/CustomButton";
import Empty from "@/shared/core/Empty";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useCurrentMenuItem } from "@/shared/utils";
import { useUser } from "@clerk/nextjs";
import { Tooltip } from "@mui/material";
import {
  BookOpen,
  BookOpenText,
  FolderOpenDot,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
const LibraryProject = dynamic(() => import("./LibraryProject"), {
  ssr: false
});
const Librarychat = dynamic(() => import("./Librarychat"), {
  ssr: false
});
const CreateProject = dynamic(() => import("../project/CreateProject"), {
  ssr: false
});
export interface PROJECTDATA {
  project_id: string;
  project_name: string;
  user_id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  session_ids: string[];
}
export interface CHATDATA {
  first_user_query: string;
  session_id: string;
  created_at: string;
  projects: {
    project_id: string;
    project_name: string;
  }[];
}
const ChatLoader = () => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-5 w-48 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );
};

const ProjectLoader = () => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
      <div className="space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );
};

const Library = () => {
  const [projectOpen, setProjectOpen] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [activeTab, setActiveTab] = useState("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoaded, user } = useUser();
  const { isLoading, mutation } = useMutation();
  const { isLoading: projectLoading, mutation: projectMutaion } = useMutation();
  const { data, mutate, isValidating } = useSwr(
    isLoaded ? "conversation/sessions" : null
  );
  const currentAccess = useCurrentMenuItem();
  const {
    data: projectData,
    mutate: projectMutate,
    isValidating: projectValidating
  } = useSwr(isLoaded ? "projects" : null);

  useEffect(() => {
    if (!isValidating && !projectValidating && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isValidating, projectValidating, isFirstLoad]);

  const filteredChats = data?.sessions?.filter(
    (item: { first_user_query: string; assessment_id: string | null }) =>
      item?.assessment_id === null &&
      (item?.first_user_query
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        searchQuery === "")
  );

  const filteredProjects = projectData?.projects?.filter(
    (item: { project_name: string }) =>
      item?.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery === ""
  );
  const deleteAllSessionChat = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete all session chats.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel"
    });
    if (result.isConfirmed) {
      try {
        const res = await mutation("conversation/all/session", {
          method: "DELETE",
          isAlert: false
        });
        if (res?.status === 200) {
          toast.success("All session chats deleted successfully");
          mutate();
          mutate();
          projectMutate();
        }
      } catch (error) {
        toast.error(error instanceof Error);
      }
    }
  };
  const deleteAllProject = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete all session chats.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
      cancelButtonText: "Cancel"
    });
    if (result.isConfirmed) {
      try {
        const res = await projectMutaion("projects/all", {
          method: "DELETE",
          isAlert: false
        });
        if (res?.status === 200) {
          toast.success("All projects deleted successfully");
          mutate();
          mutate();
          projectMutate();
        }
      } catch (error) {
        toast.error(error instanceof Error);
      }
    }
  };
  return (
    <div className="w-full bg-gray-50 pt-3 dark:bg-darkMainBackground">
      <CreateProject
        open={projectOpen}
        setOpen={() => setProjectOpen(!projectOpen)}
        projectMutate={projectMutate}
        userId={user?.id as string}
      />

      {/* Top Navigation */}
      <div className="rounded-lg border-b bg-white shadow-sm dark:border-gray-800 dark:bg-darkMainBackground">
        <div className="mx-auto px-6">
          <div className="flex h-20 items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7776c9] to-[#5452b7] text-white shadow-md shadow-[#6160b0]/20">
                <BookOpenText className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Library
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search library and projects..."
                  autoComplete="on"
                  autoCorrect="on"
                  spellCheck="true"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-lg border-0 bg-gray-100 py-2 pl-10 pr-4 text-sm outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#6160b0] dark:bg-gray-800 dark:ring-gray-700 dark:focus:ring-[#6160b0]"
                />
              </div>
              {currentAccess?.buttons?.[0]?.permission?.is_shown && (
                <CustomButton
                  onClick={() => setProjectOpen(true)}
                  startIcon={<Plus className="h-4 w-4" />}
                  disabled={
                    !currentAccess?.buttons?.[0]?.permission?.actions?.create
                  }
                >
                  {currentAccess?.buttons?.[0]?.metadata?.label ||
                    "Create Project"}
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search bar for mobile */}
      <div className="mx-4 mt-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search library and projects..."
            autoComplete="on"
            autoCorrect="on"
            spellCheck="true"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-0 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#6160b0] dark:bg-gray-800 dark:ring-gray-700 dark:focus:ring-[#6160b0]"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-6">
        {/* Mobile Tabs */}
        <div className="mb-6 lg:hidden">
          <div className="flex items-center rounded-full bg-white p-1 shadow-sm dark:bg-darkSidebarBackground">
            {["chats", "projects"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 rounded-full px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-[#6160b0] to-[#5452b7] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Chats Section */}
          <div
            className={`${activeTab === "chats" ? "block" : "hidden"} flex-1 space-y-6 lg:block`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-[#6160b0]" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Chats
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {currentAccess?.buttons?.[1]?.permission?.is_shown &&
                  filteredChats?.length > 0 && (
                    <Tooltip title="Delete All Chat" placement="top">
                      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-red-500 transition-all hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30">
                        {isLoading ? (
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
                            onClick={() => {
                              if (
                                currentAccess?.buttons?.[1]?.permission?.actions
                                  ?.delete
                              ) {
                                deleteAllSessionChat();
                              } else {
                                toast.error(
                                  "You don't have permission to delete chats"
                                );
                              }
                            }}
                          />
                        )}
                      </button>
                    </Tooltip>
                  )}
                <span className="rounded-full bg-[#6160b0]/10 px-3.5 py-1 text-sm font-medium text-[#6160b0] dark:bg-[#6160b0]/20">
                  {filteredChats?.length || 0} conversations
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              {isValidating && isFirstLoad ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <ChatLoader key={index} />
                ))
              ) : filteredChats?.length > 0 ? (
                filteredChats?.map((item: CHATDATA, index: number) => (
                  <div
                    key={item?.session_id}
                    className="overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md dark:bg-darkSidebarBackground"
                  >
                    <Librarychat
                      item={item}
                      mutate={mutate}
                      projectMutate={projectMutate}
                      userId={user?.id as string}
                      projectData={projectData?.projects}
                      index={index}
                      isDelete={
                        currentAccess?.buttons?.[1]?.permission?.actions
                          ?.delete as boolean
                      }
                    />
                  </div>
                ))
              ) : (
                <div className="flex w-full items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm dark:bg-darkSidebarBackground">
                  <div className="w-fit">
                    <Empty
                      title="No Conversations Yet"
                      subTitle="Start your first chat"
                      pathName="New Chat"
                      link="/"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Projects Section */}
          <div
            className={`${activeTab === "projects" ? "block" : "hidden"} w-full lg:block lg:w-96`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderOpenDot className="h-5 w-5 text-[#6160b0]" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Projects
                </h2>
              </div>{" "}
              <div className="flex items-center gap-2">
                {currentAccess?.buttons?.[1]?.permission?.is_shown &&
                  filteredProjects?.length > 0 && (
                    <Tooltip title="Delete All Project" placement="top">
                      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-red-500 transition-all hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30">
                        {projectLoading ? (
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
                            onClick={() => {
                              if (
                                currentAccess?.buttons?.[1]?.permission?.actions
                                  ?.delete
                              ) {
                                deleteAllProject();
                              } else {
                                toast.error(
                                  "You don't have permission to delete projects"
                                );
                              }
                            }}
                          />
                        )}
                      </button>
                    </Tooltip>
                  )}
                <span className="rounded-full bg-[#6160b0]/10 px-3.5 py-1 text-sm font-medium text-[#6160b0] dark:bg-[#6160b0]/20">
                  {filteredProjects?.length || 0} projects
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {projectValidating && isFirstLoad ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <ProjectLoader key={index} />
                ))
              ) : filteredProjects?.length > 0 ? (
                <div className="rounded-xl bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-darkSidebarBackground">
                  {filteredProjects.map((item: PROJECTDATA, index: number) => (
                    <LibraryProject
                      key={index}
                      item={item}
                      index={index}
                      mutate={mutate}
                      projectMutate={projectMutate}
                      isDelete={
                        currentAccess?.buttons?.[1]?.permission?.actions
                          ?.delete as boolean
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-white p-8 text-center shadow-sm dark:bg-darkSidebarBackground">
                  <Empty
                    title="No Projects Yet"
                    subTitle="Create your first project"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
