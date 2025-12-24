"use client";
import useMutation from "@/shared/hooks/useMutation";
import { useCurrentMenuItem } from "@/shared/utils";
import { CircularProgress, Dialog } from "@mui/material";
import {
  ChevronRight,
  Edit2,
  Search,
  Trash2,
  User,
  Users,
  X
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Group, GroupUser } from "./Groups";

const CardView: React.FC<{
  item: Group[];
  mutate: () => void;
  setEditData: (data: Group) => void;
  setOpen: () => void;
  setEditGroup: () => void;
}> = React.memo(({ item, mutate, setEditData, setOpen, setEditGroup }) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const currentAccess = useCurrentMenuItem();
  const openMembersModal = useCallback((group: Group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  }, []);

  const closeMembersModal = useCallback(() => {
    setIsModalOpen(false);
    setSearchQuery("");
    setTimeout(() => setSelectedGroup(null), 300);
  }, []);

  const filteredMembers = useMemo(
    () =>
      selectedGroup?.users?.filter((user: GroupUser) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const email = user.email.toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      }) || [],
    [selectedGroup, searchQuery]
  );

  const DeleteGroups: React.FC<{ id: string }> = React.memo(({ id }) => {
    const { isLoading, mutation } = useMutation();
    const handleDelete = useCallback(async () => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This action will delete the group permanently.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        try {
          const res = await mutation(`group?group_id=${id}`, {
            method: "DELETE",
            isAlert: false
          });
          if (res?.status === 200) {
            toast.success("Group deleted successfully");
            mutate();
          }
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to delete group"
          );
        }
      }
    }, [id, mutation, mutate]);

    return isLoading ? (
      <CircularProgress size={20} className="!text-red-500" />
    ) : (
      <button
        onClick={() => {
          if (currentAccess?.buttons?.[2]?.permission?.actions?.delete) {
            handleDelete();
          } else {
            toast.error("You don't have permission to delete this group");
          }
        }}
        className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-red-400/20 hover:text-red-200"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  });
  DeleteGroups.displayName = "DeleteGroups";
  if (!item || !Array.isArray(item)) {
    return <div className="p-6 text-center">No group data available</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {item.map((group: Group) => (
          <div
            key={group?.group_id}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white p-0 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-neutral-700 dark:bg-darkSidebarBackground"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-tertiary-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="max-w-[180px] truncate font-semibold text-white">
                    {group?.name}
                  </h3>
                </div>
                <div className="flex space-x-1">
                  {currentAccess?.buttons?.[1]?.permission?.is_shown && (
                    <button
                      onClick={() => {
                        if (
                          currentAccess?.buttons?.[1]?.permission?.actions
                            ?.update
                        ) {
                          setEditData(group);
                          setEditGroup();
                          setOpen();
                        } else {
                          toast.error(
                            "You don't have permission to edit this group"
                          );
                        }
                      }}
                      className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/10"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                  {currentAccess?.buttons?.[2]?.permission?.is_shown && (
                    <DeleteGroups id={group?.group_id} />
                  )}
                </div>
              </div>
            </div>

            <div className="p-4">
              {/* <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Group ID:{" "}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {group?.group_id}
                    </span>
                  </span>
                  <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {group?.users?.length || 0} members
                  </span>
                </div> */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role:{" "}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {group?.role_name}
                  </span>
                </span>
                <span
                  tabIndex={0}
                  role="button"
                  onClick={() =>
                    router.push(`/settings/roles/${group?.role_id}`)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push(
                        `/settings/roles/${group?.role_id}?_name=${group?.role_name}`
                      );
                    }
                  }}
                  className="cursor-pointer rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                >
                  View
                </span>
              </div>

              <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
                {group?.users && group?.users?.length > 0 ? (
                  group?.users?.slice(0, 3).map((user: GroupUser) => (
                    <div
                      key={user?.user_id}
                      className="flex items-center rounded-lg bg-gray-50 p-2 transition-colors hover:bg-gray-100 dark:bg-darkMainBackground dark:hover:bg-darkHoverBackground"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-tertiary-200 to-indigo-200 dark:from-tertiary-800 dark:to-indigo-800">
                          <span className="text-sm font-medium uppercase text-indigo-700 dark:text-indigo-300">
                            {user?.first_name?.charAt(0)}
                            {user?.last_name?.charAt(0)}
                          </span>
                        </div>
                        {user?.role === "super-admin" && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-indigo-600 dark:border-gray-800" />
                        )}
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="truncate text-sm font-medium capitalize text-gray-800 dark:text-gray-200">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                      <div className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-700 dark:bg-gray-600 dark:text-gray-300">
                        {user?.role || "Member"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-4 text-center text-gray-500 dark:bg-gray-700/30 dark:text-gray-400">
                    <User className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No members in this group</p>
                  </div>
                )}
              </div>
            </div>

            {group?.users?.length > 3 && (
              <div className="border-t border-gray-100 p-3 dark:border-gray-700">
                <button
                  onClick={() => openMembersModal(group)}
                  className="flex w-full items-center justify-center space-x-1 text-xs text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                >
                  <span>View {group?.users?.length - 3} more members</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={closeMembersModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "bg-white dark:bg-gray-900 rounded-lg" }}
      >
        <div className="h-fit w-full">
          <div className="inline-block w-full transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Members of {selectedGroup?.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedGroup?.users?.length || 0} total members
                </p>
              </div>
              <button
                onClick={closeMembersModal}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Search members by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="h-[calc(100vh-300px)] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      >
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-700">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((user: GroupUser) => (
                        <tr
                          key={user?.user_id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div className="relative h-10 w-10 flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-tertiary-100 to-indigo-100 dark:from-tertiary-900 dark:to-indigo-900">
                                  {/* {user?.profile_img ? (
                                      <img
                                        src={
                                          user?.profile_img ??
                                          "https://icon-library.com/images/user-icon-png/user-icon-png-13.jpg"
                                        }
                                        alt={`${user?.first_name} ${user?.last_name}`}
                                        className="h-full w-full rounded-full object-cover"
                                      />
                                    ) : ( */}
                                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                    {user?.first_name?.charAt(0)}
                                    {user?.last_name?.charAt(0)}
                                  </span>
                                  {/* )} */}
                                </div>
                                {user?.role === "super-admin" && (
                                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-indigo-600 dark:border-gray-700" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user?.first_name} {user?.last_name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {user?.user_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex rounded-full bg-indigo-100 px-2 text-xs font-semibold leading-5 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                              {user.role || "member"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-16 text-center text-gray-500 dark:text-gray-400"
                        >
                          <div className="flex flex-col items-center">
                            <User className="mb-2 h-10 w-10 text-gray-300 dark:text-gray-600" />
                            {searchQuery ? (
                              <>
                                <p className="text-sm font-medium">
                                  No members match your search
                                </p>
                                <p className="mt-1 text-xs">
                                  Try a different search term
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-medium">
                                No members in this group
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
});
CardView.displayName = "CardView";
export default CardView;
