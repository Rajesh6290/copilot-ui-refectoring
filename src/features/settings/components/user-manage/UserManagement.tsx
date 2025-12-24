"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomPagination from "@/shared/core/CustomPagination";
import CustomTable from "@/shared/core/CustomTable";
import usePermission from "@/shared/hooks/usePermission";
import useSwr from "@/shared/hooks/useSwr";
import { formatDateTime, useCurrentMenuItem } from "@/shared/utils";
import { Chip, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { Edit2, Search, Trash2, User } from "lucide-react";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { PiShareFatLight } from "react-icons/pi";
import { toast } from "sonner";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
import useMutation from "@/shared/hooks/useMutation";
const UpdateUser = dynamic(() => import("./UpdateUser"), {
  ssr: false
});
const InviteUser = dynamic(() => import("./InviteUser"), {
  ssr: false
});
const Empty = dynamic(() => import("@/shared/core/Empty"), {
  ssr: false
});

export interface GroupDetail {
  group_id: string;
  group_name: string;
  role_id: string;
  role_name: string;
}

export interface User extends Record<string, unknown> {
  email_id: string;
  role_id: string;
  allowed_sensitivity: boolean;
  tenant_id: string;
  client_id: string;
  clerk_user_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  db: string;
  first_name: string;
  last_name: string;
  user_name: string;
  role: string;
  profile_img?: string;
  date_time?: string;
  group_details: GroupDetail[];
  user_groups?: string[];
}

const DeleteRUser = ({ user, mutate }: { user: User; mutate: () => void }) => {
  const { isLoading, mutation } = useMutation();
  const currentAccess = useCurrentMenuItem();
  const handleDelete = (id: string) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await mutation(`user/?user_id=${id}`, {
            method: "DELETE",
            isAlert: false
          });
          if (res?.status === 200) {
            toast.success("User Removed successfully");
            mutate();
          }
        }
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  return (
    <div
      tabIndex={0}
      role="button"
      onClick={() => {
        if (currentAccess?.buttons?.[2]?.permission?.actions?.delete) {
          handleDelete(user?.user_id);
        } else {
          toast.error("You don't have permission to delete this user");
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (currentAccess?.buttons?.[2]?.permission?.actions?.delete) {
            handleDelete(user?.user_id);
          } else {
            toast.error("You don't have permission to delete this user");
          }
        }
      }}
      className="cursor-pointer text-red-500"
    >
      {isLoading ? (
        <CircularProgress size={15} />
      ) : (
        <Trash2 className="h-5 w-5" />
      )}
    </div>
  );
};
const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<"accepted" | "pending">(
    "accepted"
  );
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState<boolean>(false);
  const [updateData, setUpdateData] = useState<User | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const { user, isUserLoading } = usePermission();
  const currentAccess = useCurrentMenuItem();
  let url = `users?page=${page + 1}&limit=${pageSize}&status=${activeTab}&detail=true`;
  if (debouncedSearchTerm) {
    url += `&filters=${debouncedSearchTerm}`;
  }
  const { data, isValidating, mutate } = useSwr(url);

  const getRoleColor = (role: string) => {
    const roleMap: Record<
      string,
      { bg: string; text: string; border: string }
    > = {
      ROOT_USER_ROLE_2: {
        bg: "bg-green-500/20",
        text: "text-green-700",
        border: "border-green-700"
      },
      ADMIN: {
        bg: "bg-blue-500/20",
        text: "text-blue-700",
        border: "border-blue-700"
      },
      USER: {
        bg: "bg-amber-500/20",
        text: "text-amber-700",
        border: "border-amber-700"
      }
    };
    return (
      roleMap[role] || {
        bg: "bg-gray-500/20",
        text: "text-gray-700",
        border: "border-gray-700"
      }
    );
  };

  // Debounce search
  const debouncedSearch = useRef(
    debounce((value) => {
      setDebouncedSearchTerm(value);
      setPage(0);
    }, 1000)
  ).current;

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  // Mobile Card View Component
  const MobileCardView = () => {
    return (
      <div className="flex w-full flex-col gap-16">
        {isValidating ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tertiary-600 border-t-transparent"></div>
          </div>
        ) : data?.users?.length === 0 ? (
          <div className="flex h-40 w-full items-center justify-center">
            <Empty
              title="No Users Found"
              subTitle="Start inviting team members to collaborate seamlessly!"
              pathName="Invite User"
              link="#"
              onClick={() => setOpen(true)}
            />
          </div>
        ) : (
          <>
            <AnimatePresence>
              <div className="flex w-full flex-col gap-5">
                {data?.users?.map((users: User) => (
                  <motion.div
                    key={users.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-lg dark:border-neutral-700 dark:from-darkSidebarBackground dark:to-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-400 to-tertiary-600 text-white">
                          {users?.profile_img ? (
                            <img
                              src={users.profile_img}
                              alt={`${users.first_name} ${users.last_name}`}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium">
                              {users?.first_name?.charAt(0)?.toUpperCase()}
                              {users?.last_name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                          {users?.first_name?.toLowerCase()}{" "}
                          {users?.last_name?.toLowerCase()}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentAccess?.buttons?.[1]?.permission?.is_shown && (
                          <Tooltip title="Edit User" arrow placement="top">
                            <IconButton
                              onClick={() => {
                                if (
                                  currentAccess?.buttons?.[1]?.permission
                                    ?.actions?.update
                                ) {
                                  setUpdateData(users);
                                  setUpdateOpen(true);
                                } else {
                                  toast.error(
                                    "You don't have permission to edit this user"
                                  );
                                }
                              }}
                            >
                              <Edit2
                                size={20}
                                className="cursor-pointer text-green-600 hover:text-green-700"
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                        {currentAccess?.buttons?.[2]?.permission?.is_shown && (
                          <Tooltip title="Delete User" arrow placement="top">
                            <DeleteRUser mutate={mutate} user={users} />
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                      {users?.email_id ?? "Not Provided"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`rounded-full ${getRoleColor(users.role).bg} ${getRoleColor(users.role).text} px-3 py-1 text-xs font-medium uppercase`}
                      >
                        {users?.role ?? "Not Assigned"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {users.group_details && users.group_details.length > 0 ? (
                        users.group_details.map(
                          (group: GroupDetail, idx: number) => (
                            <Chip
                              key={idx}
                              label={group.group_name}
                              size="small"
                              className="!bg-tertiary !text-sm !font-medium !capitalize !text-white"
                            />
                          )
                        )
                      ) : (
                        <span className="text-xs italic text-gray-500 dark:text-neutral-400">
                          No groups
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                      Created:{" "}
                      {!isUserLoading && user && users.created_at
                        ? moment(
                            formatDateTime(users.created_at, user?.date_time)
                          ).format("ll")
                        : "Not Provided"}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </>
        )}
        <CustomPagination
          pagination={data?.pagination}
          pageNumber={page === 0 ? 1 : page}
          setPageNumber={setPage}
        />
      </div>
    );
  };

  return (
    <div className="h-fit w-full overflow-y-auto bg-gray-50 p-2 pt-3 dark:bg-transparent">
      <InviteUser
        isOpen={open}
        onClose={() => setOpen(!open)}
        mutate={mutate}
      />
      <UpdateUser
        isOpen={updateOpen}
        onClose={() => setUpdateOpen(!updateOpen)}
        mutate={mutate}
        item={updateData as User}
        setUpdateData={
          setUpdateData as React.Dispatch<React.SetStateAction<User | null>>
        }
      />
      <div className="mb-8 flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-0 md:space-x-4">
          <div className="flex items-center gap-2">
            <div className="size-fit rounded-lg bg-gradient-to-r from-tertiary-600 to-tertiary-400 p-2">
              <User className="text-2xl text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Manage User
            </h1>
          </div>
          <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("accepted")}
              className={`px-4 py-2 font-medium ${
                activeTab === "accepted"
                  ? "border-b-2 border-tertiary-600 text-tertiary-600 dark:border-tertiary-400 dark:text-tertiary-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Accepted Users
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 font-medium ${
                activeTab === "pending"
                  ? "border-b-2 border-tertiary-600 text-tertiary-600 dark:border-tertiary-400 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Invited Users
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 outline-none dark:border-gray-700 dark:bg-darkSidebarBackground dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {currentAccess?.buttons?.[0]?.permission?.is_shown && (
            <CustomButton
              onClick={() => setOpen(true)}
              startIcon={<PiShareFatLight className="text-xl" />}
              disabled={
                !currentAccess?.buttons?.[0]?.permission?.actions?.create
              }
            >
              Invite User
            </CustomButton>
          )}
        </div>
      </div>

      {/* Responsive Design - Show Cards on Mobile, Table on Desktop */}
      <div className="sm:hidden">
        <MobileCardView />
      </div>
      <div className="hidden sm:block">
        <AnimatePresence mode="wait">
          {data?.users?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex h-[60vh] w-full items-center justify-center"
            >
              <Empty
                title="No Users Found"
                subTitle="Start inviting team members to collaborate seamlessly!"
                pathName="Invite User"
                link="#"
                onClick={() => setOpen(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-x-auto p-1"
            >
              <CustomTable<User>
                columns={[
                  {
                    field: "name",
                    title: "User",
                    sortable: true,
                    filterable: true,
                    render: (row) => (
                      <div className="flex w-full items-center justify-center gap-3">
                        <div className="flex flex-col items-start">
                          {row?.first_name && row?.last_name ? (
                            <div className="text-nowrap font-medium capitalize">
                              {row.first_name.toLowerCase()}{" "}
                              {row.last_name.toLowerCase()}
                            </div>
                          ) : (
                            <div className="text-nowrap italic text-gray-500">
                              Not Provided
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  },
                  {
                    field: "email",
                    title: "Email",
                    sortable: true,
                    filterable: true,
                    render: (row) => (
                      <div className="flex w-full items-center justify-center gap-2">
                        <span className="font-medium">
                          {row?.email_id ?? "Not Provided"}
                        </span>
                      </div>
                    )
                  },
                  {
                    field: "role",
                    title: "Role",
                    sortable: true,
                    filterable: true,
                    render: (row) => {
                      const roleStyle = getRoleColor(row.role);
                      return (
                        <span
                          className={`rounded-full ${roleStyle.bg} ${roleStyle.text} px-3 py-1 text-xs font-medium uppercase`}
                        >
                          {row?.role ?? "Not Assigned"}
                        </span>
                      );
                    }
                  },
                  {
                    field: "groups",
                    title: "Groups",
                    sortable: true,
                    render: (row) => (
                      <div className="flex flex-wrap items-center gap-1">
                        {row.group_details && row.group_details.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {row.group_details.map(
                              (group: GroupDetail, idx: number) => (
                                <Chip
                                  key={idx}
                                  label={group.group_name}
                                  size="small"
                                  className="!bg-tertiary text-sm !font-medium !capitalize !text-white"
                                />
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-xs italic text-gray-500">
                            No groups
                          </span>
                        )}
                      </div>
                    )
                  },
                  {
                    field: "created",
                    title: "Created At",
                    sortable: true,
                    render: (row) => (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {!isUserLoading &&
                          user &&
                          row.created_at &&
                          moment(
                            formatDateTime(row.created_at, user?.date_time)
                          ).format("ll")}
                      </div>
                    )
                  }
                ]}
                data={data && data?.users?.length > 0 ? data?.users : []}
                actions={[
                  {
                    icon: currentAccess?.buttons?.[1]?.permission?.is_shown && (
                      <Edit2 className="h-5 w-5 text-green-600" />
                    ),
                    tooltip: "Edit User",
                    onClick: (row) => {
                      if (
                        currentAccess?.buttons?.[1]?.permission?.actions?.update
                      ) {
                        setUpdateData(row as User);
                        setUpdateOpen(true);
                      } else {
                        toast.error(
                          "You don't have permission to edit this user"
                        );
                      }
                    }
                  },
                  {
                    icon: (row) =>
                      currentAccess?.buttons?.[2]?.permission?.is_shown && (
                        <DeleteRUser mutate={mutate} user={row as User} />
                      ),
                    tooltip: "Delete User",
                    onClick: () => {}
                  }
                ]}
                isLoading={isValidating}
                page={page}
                pageSize={pageSize}
                totalCount={data?.pagination?.total_records}
                onPageChange={setPage}
                onRowsPerPageChange={setPageSize}
                title=""
                selection={true}
                filtering={false}
                options={{
                  toolbar: false,
                  search: false,
                  filtering: true,
                  sorting: true,
                  pagination: true
                }}
                className="overflow-hidden rounded-lg border border-gray-100 shadow-sm dark:border-gray-700"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserManagement;
