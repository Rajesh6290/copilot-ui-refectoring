"use client";
import ClickOutside from "@/shared/common/ClickOutside";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip
} from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Check, Info, Save, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { NewGroupSchema } from "../../schema/group.schema";
import { Group } from "./Groups";
interface GroupDialogProps {
  editingGroup: boolean;
  handleCloseModal: () => void;
  mutate: () => void;
  open: boolean;
  editData: Group | null;
  setEditGroup: (value: boolean) => void;
  setEditData: (data: Group | null) => void;
}
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
interface RoleData {
  id: string;
  name: string;
  description: string;
  role_type: string;
}

const GroupDialog: React.FC<GroupDialogProps> = React.memo(
  ({
    open,
    editingGroup,
    handleCloseModal,
    mutate,
    editData,
    setEditData,
    setEditGroup
  }) => {
    const { isLoading, mutation } = useMutation();
    const [userAccess, setUserAccess] = useState<User[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const { data } = useSwr(
      open ? "users?page=1&limit=10000&status=accepted&detail=true" : null
    );
    const { data: roledata } = useSwr(
      open ? "roles?detail=true&page=1&limit=1000" : null
    );
    const filteredOptions = useMemo(
      () =>
        data?.users?.filter((option: User) =>
          option?.role?.toLowerCase().includes(searchValue.toLowerCase())
        ) || [],
      [data, searchValue]
    );

    const toggleOption = useCallback(
      (
        option: User,
        setFieldValue: (
          field: string,
          value: User[],
          shouldValidate?: boolean
        ) => void
      ) => {
        setUserAccess((prev) => {
          const exists = prev.some((user) => user?.user_id === option?.user_id);
          const newValue = exists
            ? prev.filter((user) => user?.user_id !== option?.user_id)
            : [...prev, option];
          setFieldValue("user", newValue);
          return newValue;
        });
      },
      []
    );

    const close = useCallback(() => {
      setIsOpen(false);
      setEditGroup(false);
      setEditData(null);
      handleCloseModal();
      setUserAccess([]);
    }, [handleCloseModal, setEditGroup, setEditData]);

    const handleSubmit = useCallback(
      async (values: {
        groupName: string;
        role: string;
        description: string;
        user: User[];
      }) => {
        try {
          const res = await mutation("group", {
            method: "POST",
            body: {
              group_name: values?.groupName,
              role_id: values?.role,
              description: values?.description,
              user_ids: values?.user?.map((i: User) => i?.user_id)
            },
            isAlert: false
          });
          if (res?.status === 201) {
            toast.success("Group created successfully");
            close();
            mutate();
          }
        } catch (error) {
          toast.error(error instanceof Error);
        }
      },
      [mutation, close, mutate]
    );

    const handleUpdate = useCallback(
      async (values: {
        groupName: string;
        role: string;
        description: string;
        user: User[];
      }) => {
        try {
          const res = await mutation(`group?group_id=${editData?.group_id}`, {
            method: "PUT",
            body: {
              group_name: values?.groupName,
              role_id: values?.role,
              description: values?.description,
              user_ids: values?.user?.map((i: User) => i?.user_id)
            },
            isAlert: false
          });
          if (res?.status === 200) {
            toast.success("Group Updated successfully");
            close();
            mutate();
          }
        } catch (error) {
          toast.error(error instanceof Error);
        }
      },
      [mutation, editData, close, mutate]
    );

    useEffect(() => {
      if (editData?.users) {
        setUserAccess(editData.users as unknown as User[]);
      }
    }, [editData]);

    return (
      <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
        PaperProps={{ className: "bg-white dark:bg-gray-900 rounded-lg" }}
      >
        <DialogTitle className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-900 dark:text-white">
            {editingGroup ? "Edit Group" : "Create New Group"}
          </span>
        </DialogTitle>

        <Formik
          initialValues={{
            groupName: editData?.name ?? "",
            role: editData?.role_id ?? "",
            description: editData?.description ?? "",
            user: (editData?.users as unknown as User[]) || []
          }}
          validationSchema={NewGroupSchema}
          enableReinitialize={true}
          onSubmit={editingGroup ? handleUpdate : handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form>
              <DialogContent>
                <div className="space-y-6">
                  <div>
                    <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Group Name *
                    </span>
                    <Field
                      type="text"
                      name="groupName"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-[#6160b0] focus:outline-none focus:ring-2 focus:ring-[#6160b0] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      placeholder="Enter group name"
                    />
                    <ErrorMessage
                      name="groupName"
                      component="p"
                      className="text-sm text-red-500"
                    />
                  </div>
                  <div>
                    <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description *
                    </span>
                    <Field
                      type="text"
                      name="description"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-[#6160b0] focus:outline-none focus:ring-2 focus:ring-[#6160b0] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      placeholder="Enter description"
                    />
                    <ErrorMessage
                      name="description"
                      component="p"
                      className="text-sm text-red-500"
                    />
                  </div>
                  <div>
                    <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Role *
                    </span>
                    <Field
                      as="select"
                      name="role"
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-[#6160b0] focus:outline-none focus:ring-2 focus:ring-[#6160b0] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="" disabled>
                        Select a role
                      </option>
                      {roledata?.data
                        ?.filter((i: RoleData) => i?.id !== "system_admin")
                        ?.map((role: RoleData) => (
                          <option key={role?.id} value={role?.id}>
                            {role?.name}
                          </option>
                        ))}
                    </Field>
                    <ErrorMessage
                      name="role"
                      component="p"
                      className="text-sm text-red-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Users{" "}
                      <Tooltip
                        placement="top"
                        title="You can add users to this group or manage them in the users section."
                      >
                        <Info size={16} className="cursor-pointer" />
                      </Tooltip>
                    </label>
                    <div className="relative">
                      <div
                        tabIndex={0}
                        role="button"
                        className="min-h-[42px] w-full cursor-text rounded-lg border border-gray-200 bg-white p-1 duration-300 focus-within:border-[#6160b0] focus-within:ring-2 focus-within:ring-[#6160b0] dark:border-gray-700 dark:bg-gray-800"
                        onClick={() => setIsOpen(!isOpen)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setIsOpen(!isOpen);
                          }
                        }}
                      >
                        <div className="flex flex-wrap gap-1">
                          {userAccess.map((item) => (
                            <span
                              key={item.user_id}
                              className="inline-flex items-center rounded-md bg-[#6160b0]/10 px-2 py-1 text-sm text-[#6160b0] dark:bg-[#6160b0]/20 dark:text-[#74c9d5]"
                            >
                              {item?.first_name} {item?.last_name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleOption(item, setFieldValue);
                                }}
                                className="ml-1 rounded-full p-0.5 hover:bg-[#6160b0]/20"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            className="flex-1 border-none bg-transparent p-1 text-sm outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                            placeholder={
                              userAccess.length === 0 ? "Select Users" : ""
                            }
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onFocus={() => setIsOpen(true)}
                          />
                        </div>
                      </div>

                      {isOpen && (
                        <ClickOutside
                          onClick={() => setIsOpen(false)}
                          className="relative"
                        >
                          <div className="mt-3 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 ease-out dark:border-gray-700 dark:bg-gray-800">
                            {filteredOptions.map((option: User) => (
                              <button
                                type="button"
                                key={option?.user_id}
                                onClick={() =>
                                  toggleOption(option, setFieldValue)
                                }
                                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                              >
                                <span>
                                  {option?.first_name} {option?.last_name}
                                </span>
                                {userAccess.some(
                                  (user) => user?.user_id === option?.user_id
                                ) && (
                                  <Check className="h-4 w-4 text-[#6160b0]" />
                                )}
                              </button>
                            ))}
                          </div>
                        </ClickOutside>
                      )}
                    </div>
                    <ErrorMessage
                      name="menuAccess"
                      component="p"
                      className="text-sm text-red-500"
                    />
                  </div>
                </div>
              </DialogContent>
              <DialogActions className="border-t border-gray-200 p-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <div className="w-fit">
                  <CustomButton
                    loading={isLoading}
                    loadingText="Creating..."
                    type="submit"
                    className="w-fit"
                    startIcon={<Save className="h-4 w-4" />}
                  >
                    {editingGroup ? "Update" : "Create"}
                  </CustomButton>
                </div>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    );
  }
);
GroupDialog.displayName = "GroupDialog";
export default GroupDialog;
