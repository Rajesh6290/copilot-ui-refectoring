"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useCurrentMenuItem } from "@/shared/utils";
import { CircularProgress, Tooltip } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Plus,
  Search,
  Shield,
  Trash2
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
const UpdateRole = dynamic(() => import("./UpdateRole"), {
  ssr: false
});
const AddNewRole = dynamic(() => import("./AddNewRole"), {
  ssr: false
});

interface RoleData extends Record<string, unknown> {
  id: string;
  name: string;
  description: string;
  role_type: string;
}
const RoleManagement = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { isLoading, mutation } = useMutation();
  const [roleId, setroleId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleDetails, setEditingRoledetails] = useState<RoleData | null>(
    null
  );
  const [editOpen, seteditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const router = useRouter();
  let url = `roles?page=${page + 1}&limit=${pageSize}&detail=true`;
  if (debouncedSearchTerm) {
    url += `&filters=${debouncedSearchTerm}`;
  }
  const { data, isValidating, mutate } = useSwr(url);
  const currentAccess = useCurrentMenuItem();
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
          const res = await mutation(`role?role_id=${id}`, {
            method: "DELETE",
            isAlert: false
          });
          if (res?.status === 200) {
            toast.success("Role deleted successfully");
            mutate();
          }
        }
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const isShowEditButton = (name: string) => {
    return (
      !["system_role"].includes(name) &&
      currentAccess?.buttons?.[1]?.permission?.actions?.update
    );
  };
  const isShowDeleteButton = (name: string) => {
    return (
      !["system_role"].includes(name) &&
      currentAccess?.buttons?.[2]?.permission?.actions?.delete
    );
  };

  // Mobile Card View Component
  const MobileCardView = () => {
    return (
      <div className="flex w-full flex-col gap-4">
        {isValidating ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-tertiary-600 border-t-transparent"></div>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex h-40 w-full items-center justify-center">
            <p className="text-gray-500 dark:text-neutral-400">
              No roles found
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {data?.data?.map((role: RoleData) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                  className="relative w-full rounded-xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-white p-4 shadow-lg dark:border-purple-700/50 dark:from-purple-900/30 dark:to-gray-800"
                >
                  <div className="flex items-start gap-3">
                    {/* Role Icon */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600">
                      <Shield size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      {/* Role Name */}
                      <h3 className="text-lg font-bold capitalize text-gray-900 dark:text-white">
                        {role?.name ?? "Not Provided"}
                      </h3>
                      {/* Description */}
                      <p className="mt-1 text-sm italic text-gray-600 dark:text-neutral-300">
                        {role?.description ?? "Not Provided"}
                      </p>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="mt-3 flex justify-end gap-2">
                    <Tooltip title="View Role" arrow placement="top">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (currentAccess?.permission?.actions?.read) {
                            router?.push(`/settings/roles/${role?.id}`);
                          } else {
                            toast.error(
                              "You do not have permission to view this role"
                            );
                          }
                        }}
                        className={`rounded-full p-2 ${currentAccess?.permission?.actions?.read ? "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800/50" : "bg-gray-200 text-gray-400 dark:bg-gray-700/50"}`}
                      >
                        <Eye size={16} />
                      </motion.button>
                    </Tooltip>
                    <Tooltip
                      title={
                        isShowEditButton(role?.role_type)
                          ? "Edit Role"
                          : "Cannot update System Roles"
                      }
                      arrow
                      placement="top"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (isShowEditButton(role?.role_type)) {
                            setroleId(role?.id);
                            seteditOpen(true);
                          } else {
                            toast.error(
                              "You do not have permission to edit this role"
                            );
                          }
                        }}
                        className={`rounded-full p-2 ${isShowEditButton(role?.role_type) ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-800/50" : "bg-gray-200 text-gray-400 dark:bg-gray-700/50"}`}
                      >
                        <Edit2 size={16} />
                      </motion.button>
                    </Tooltip>
                    <Tooltip
                      title={
                        isShowDeleteButton(role?.name)
                          ? "Delete Role"
                          : "Cannot delete System Roles"
                      }
                      arrow
                      placement="top"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (isShowDeleteButton(role?.role_type)) {
                            setEditingRoledetails(role);
                            handleDelete(role.id);
                          } else {
                            toast.error(
                              "You do not have permission to delete this role"
                            );
                          }
                        }}
                        className={`rounded-full p-2 ${isShowDeleteButton(role?.role_type) ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-800/50" : "bg-gray-200 text-gray-400 dark:bg-gray-700/50"}`}
                      >
                        {isLoading && role?.id === editingRoleDetails?.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </motion.button>
                    </Tooltip>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Mobile Pagination */}
            {data?.data?.length > pageSize && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-neutral-300">
                  Showing {page * pageSize + 1} to{" "}
                  {Math.min(
                    (page + 1) * pageSize,
                    data?.pagination?.total || 0
                  )}{" "}
                  of {data?.pagination?.total || 0}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm disabled:opacity-50 dark:bg-gray-800/80 dark:shadow-neutral-700/50"
                  >
                    <ChevronLeft
                      size={16}
                      className="text-gray-600 dark:text-neutral-300"
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700 dark:text-neutral-200">
                    Page {page + 1} of{" "}
                    {Math.ceil((data?.pagination?.total || 0) / pageSize)}
                  </span>
                  <button
                    onClick={() =>
                      setPage(
                        Math.min(
                          Math.ceil((data?.pagination?.total || 0) / pageSize) -
                            1,
                          page + 1
                        )
                      )
                    }
                    disabled={
                      page >=
                      Math.ceil((data?.pagination?.total || 0) / pageSize) - 1
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm disabled:opacity-50 dark:bg-gray-800/80 dark:shadow-neutral-700/50"
                  >
                    <ChevronRight
                      size={16}
                      className="text-gray-600 dark:text-neutral-300"
                    />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-fit w-full p-2">
      {/* Header */}
      <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="rounded-lg bg-gradient-to-r from-tertiary-600 to-tertiary-400 p-2">
            <Shield className="size-3xl text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Role Management
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600 dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {currentAccess?.buttons?.[0]?.permission?.is_shown && (
            <CustomButton
              onClick={() => setIsModalOpen(true)}
              disabled={
                !currentAccess?.buttons?.[0]?.permission?.actions?.create
              }
              startIcon={<Plus className="h-5 w-5" />}
            >
              Add New Custom Role
            </CustomButton>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddNewRole
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mutate={mutate}
      />
      <UpdateRole
        isOpen={editOpen}
        onClose={() => seteditOpen(false)}
        mutate={mutate}
        roleId={roleId}
        // featuresLoading={featuresLoading}
        // featuresData={featuresData}
      />

      {/* Responsive Design - Show Cards on Mobile, Table on Desktop */}
      <div className="sm:hidden">
        <MobileCardView />
      </div>
      <div className="hidden sm:block">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto rounded-lg bg-white shadow-md dark:bg-gray-800"
          >
            <CustomTable<RoleData>
              columns={[
                {
                  field: "role",
                  title: "Role",
                  sortable: true,
                  filterable: true,
                  render: (row) => (
                    <span className="font-medium capitalize">
                      {row?.name ?? "Not Provided"}
                    </span>
                  )
                },
                {
                  field: "Description",
                  title: "Description",
                  sortable: true,
                  filterable: true,
                  render: (row) => (
                    <span className="font-medium capitalize">
                      {row?.description ?? "Not Provided"}
                    </span>
                  )
                },
                {
                  field: "details",
                  title: "Details",
                  sortable: true,
                  filterable: true,
                  render: (row) => (
                    <div className="flex w-full items-center justify-center">
                      <div className="w-fit">
                        <CustomButton
                          onClick={() =>
                            router?.push(
                              `/settings/roles/${row?.id}?_name=${row?.name}`
                            )
                          }
                          disabled={!currentAccess?.permission?.actions?.read}
                          className="w-fit !text-[0.6rem] !uppercase"
                        >
                          VIEW
                        </CustomButton>
                      </div>
                    </div>
                  )
                },
                {
                  field: "edit",
                  title: "Update",
                  sortable: true,
                  filterable: true,
                  render: (row) => (
                    <Tooltip
                      title={
                        isShowEditButton(row?.role_type)
                          ? ""
                          : "Cannot update System Roles"
                      }
                      placement="top"
                      arrow
                    >
                      <div className="flex w-full items-center justify-center">
                        <Edit2
                          onClick={() => {
                            if (isShowEditButton(row?.role_type)) {
                              setroleId(row?.id);
                              seteditOpen(true);
                            } else {
                              toast.error(
                                "You do not have permission to edit this role"
                              );
                            }
                          }}
                          className={`h-5 w-5 ${isShowEditButton(row?.role_type) ? "cursor-pointer text-green-600" : "text-neutral-300"}`}
                        />
                      </div>
                    </Tooltip>
                  )
                },
                {
                  field: "delete",
                  title: "Remove",
                  sortable: true,
                  filterable: true,
                  render: (row: RoleData) => (
                    <Tooltip
                      title={
                        isShowDeleteButton(row?.role_type)
                          ? ""
                          : "Cannot delete System Roles"
                      }
                      placement="top"
                      arrow
                    >
                      <div className="flex w-full items-center justify-center">
                        {isLoading && row?.id === editingRoleDetails?.id ? (
                          <CircularProgress size={15} />
                        ) : (
                          <Trash2
                            onClick={() => {
                              if (isShowDeleteButton(row?.role_type)) {
                                setEditingRoledetails(row);
                                handleDelete(row.id);
                              } else {
                                toast.error(
                                  "You do not have permission to delete this role"
                                );
                              }
                            }}
                            className={`h-5 w-5 ${isShowDeleteButton(row?.role_type) ? "cursor-pointer text-red-600" : "text-neutral-300"}`}
                          />
                        )}
                      </div>
                    </Tooltip>
                  )
                }
              ]}
              data={data && data?.data?.length > 0 ? data?.data : []}
              isLoading={isValidating}
              page={page}
              pageSize={pageSize}
              totalCount={data?.pagination?.total}
              onPageChange={setPage}
              onRowsPerPageChange={setPageSize}
              title="All Roles"
              selection={true}
              filtering={false}
              options={{
                toolbar: false,
                search: false,
                filtering: true,
                sorting: true,
                pagination: true
              }}
              className="flex-1"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RoleManagement;
