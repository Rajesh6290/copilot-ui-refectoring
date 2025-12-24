"use client";
import CustomButton from "@/shared/core/CustomButton";
import useSwr from "@/shared/hooks/useSwr";
import { useCurrentMenuItem } from "@/shared/utils";
import { debounce } from "lodash";
import { Search, UserPlus, Users } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
const GroupDialog = dynamic(() => import("./GroupDialog"), {
  ssr: false
});
const CardView = dynamic(() => import("./CardView"), {
  ssr: false
});

// Validation Schema
export interface GroupUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string | null; // can be null as seen in the data
  profile_img: string; // URL string
}

export interface Group {
  name: string;
  role_id: string;
  group_id: string;
  description: string;
  role_name: string;
  created_at: string; // ISO timestamp string
  updated_at: string; // ISO timestamp string
  users: GroupUser[];
}
const GroupsSkeletonLoader = () => {
  // Create an array of 6 elements for skeleton cards
  const skeletonCards = Array(6).fill(0);

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {skeletonCards.map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-darkSidebarBackground"
        >
          {/* Card Header Skeleton */}
          <div className="h-16 animate-pulse bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600"></div>

          {/* Card Content Skeleton */}
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-6 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-6 w-16 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Member Skeletons */}
            <div className="mt-3 space-y-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50"
                >
                  <div className="h-9 w-9 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-600"></div>
                    <div className="mt-1 h-3 w-40 rounded bg-gray-200 dark:bg-gray-600"></div>
                  </div>
                  <div className="h-5 w-16 rounded bg-gray-300 dark:bg-gray-600"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Footer Skeleton */}
          <div className="border-t border-gray-100 p-3 dark:border-gray-700">
            <div className="mx-auto h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const GroupsManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Group | null>(null);
  const [editGroup, setEditGroup] = useState(false);
  const currentAccess = useCurrentMenuItem();
  let url = "groups?details=true";
  if (debouncedSearchTerm) {
    url += `&filters=${debouncedSearchTerm}`;
  }
  const { data, isValidating, mutate } = useSwr(url);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const toggleModal = useCallback(() => setIsModalOpen((prev) => !prev), []);
  const toggleEditGroup = useCallback(() => setEditGroup((prev) => !prev), []);
  const debouncedSearch = useRef(
    debounce((value) => {
      setDebouncedSearchTerm(value);
      // setPage(0); // Reset page to 0 when search query changes
    }, 1000) // 500ms delay
  ).current;

  // Effect to call the debounced function when searchQuery changes
  useEffect(() => {
    debouncedSearch(searchQuery);

    // Cleanup the debounce function on component unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);
  return (
    <div className="w-full p-2">
      <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Groups Management
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 outline-none focus:border-[#6160b0] focus:ring-2 focus:ring-[#6160b0] dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {currentAccess?.buttons?.[0]?.permission?.is_shown && (
            <CustomButton
              onClick={toggleModal}
              disabled={
                !currentAccess?.buttons?.[0]?.permission?.actions?.create
              }
              startIcon={<UserPlus className="h-5 w-5" />}
            >
              Create Group
            </CustomButton>
          )}
        </div>
      </div>
      {isValidating ? (
        <GroupsSkeletonLoader />
      ) : (
        <div className="mt-6">
          {data && data?.data?.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-lg bg-white text-center dark:bg-darkSidebarBackground">
              <div className="space-y-2">
                <Users className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No groups found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or create a new group.
                </p>
              </div>
            </div>
          ) : (
            <CardView
              item={data && data?.data?.length > 0 ? data?.data : []}
              mutate={mutate}
              setEditData={setEditData}
              setOpen={toggleModal}
              setEditGroup={toggleEditGroup}
            />
          )}
        </div>
      )}
      <GroupDialog
        editingGroup={editGroup}
        handleCloseModal={handleCloseModal}
        open={isModalOpen}
        mutate={mutate}
        editData={editData}
        setEditGroup={setEditGroup}
        setEditData={setEditData}
      />
    </div>
  );
};

export default GroupsManagement;
