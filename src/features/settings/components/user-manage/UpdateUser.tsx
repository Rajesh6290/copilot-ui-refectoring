"use client";
import ClickOutside from "@/shared/common/ClickOutside";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { useFormik } from "formik";
import { Check, User, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { UpdateUserValidationSchema } from "../../schema/user.schema";
import { User as UserType } from "./UserManagement";
interface RoleData {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}
interface GroupData {
  name: string;
  role_id: string;
  group_id: string;
  description: string;
  role_name: string;
  created_at: string;
  updated_at: string;
  user_count: number;
}

const UpdateUser = ({
  isOpen,
  onClose,
  mutate,
  item,
  setUpdateData
}: {
  isOpen: boolean;
  onClose: () => void;
  mutate: () => void;
  item: UserType | null;
  setUpdateData: React.Dispatch<React.SetStateAction<UserType | null>>;
}) => {
  const { data } = useSwr(
    isOpen ? "roles?detail=true&page=1&limit=10000" : null
  );
  const close = () => {
    onClose();
    setUpdateData(null);
  };
  const { isLoading, mutation } = useMutation();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { data: groupsData } = useSwr(
    isOpen ? "groups?page=1&limit=100&details=false" : null
  );
  const filteredOptions = useMemo(
    () =>
      groupsData?.data?.filter((option: GroupData) =>
        option?.name.toLowerCase().includes(searchValue.toLowerCase())
      ) || [],
    [groupsData, searchValue]
  );
  const toggleOption = useCallback(
    (
      option: GroupData,
      setFieldValue: (
        field: string,
        value: GroupData[],
        shouldValidate?: boolean
      ) => void
    ) => {
      setGroups((prev) => {
        const exists = prev.some(
          (group) => group?.group_id === option?.group_id
        );
        const newValue = exists
          ? prev.filter((group) => group?.group_id !== option?.group_id)
          : [...prev, option];
        setFieldValue("group", newValue);
        return newValue;
      });
    },
    []
  );
  const formik = useFormik({
    initialValues: {
      email: item?.email_id || "",
      role: item?.role_id || "",
      group: []
    },
    validationSchema: UpdateUserValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const res = await mutation(
          `user?role_id=${values?.role}&user_id=${item?.user_id}&groups=${values?.group?.map((items: GroupData) => items?.group_id)?.join(",")}`,
          {
            method: "PUT",
            isAlert: false
          }
        );
        if (res?.status === 200) {
          toast.success("User updated successfully");
          mutate();
          close();
        } else if (res?.status === 403) {
          toast.error(res?.results?.error);
          close();
        }
      } catch (error) {
        toast.error(error instanceof Error);
      }
    }
  });

  return (
    <Dialog
      open={isOpen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "dark:bg-darkSidebarBackground rounded-lg"
      }}
    >
      <DialogTitle className="border-b border-gray-200 p-6 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-satoshi text-xl font-semibold text-gray-800 dark:text-white">
              Update User
            </h2>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </DialogTitle>

      <DialogContent className="mt-5 p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email*
            </span>
            <input
              type="email"
              disabled
              {...formik.getFieldProps("email")}
              className="disabled block w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-darkMainBackground dark:text-white"
            />
          </div>

          {/* Role Field */}
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Role*
            </span>
            <select
              {...formik.getFieldProps("role")}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-darkMainBackground dark:text-white"
            >
              <option value="">Select a role</option>
              {data?.data?.map((role: RoleData) => (
                <option key={role?.id} value={role?.id}>
                  {role?.name}
                </option>
              ))}
            </select>
            {formik.touched.role && formik.errors.role && (
              <div className="mt-1.5 text-sm text-red-500">
                {typeof formik.errors.role === "string" && formik.errors.role}
              </div>
            )}
          </div>
          <div>
            <label className="mb-2 flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Groups{" "}
              {/* <Tooltip
                        placement="top"
                        title="You can add users to this group or manage them in the users section."
                      >
                        <Info size={16} className="cursor-pointer" />
                      </Tooltip> */}
            </label>
            <div className="relative">
              <div
                tabIndex={0}
                role="button"
                className="min-h-[42px] w-full cursor-text rounded-lg border border-gray-200 bg-white p-1 duration-300 focus-within:border-[#6160b0] focus-within:ring-2 focus-within:ring-[#6160b0] dark:border-neutral-700 dark:bg-darkMainBackground"
                onClick={() => setOpen(!open)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setOpen(!open);
                  }
                }}
              >
                <div className="flex flex-wrap gap-1">
                  {groups?.map((items: GroupData) => (
                    <span
                      key={items?.group_id}
                      className="inline-flex items-center rounded-md bg-[#6160b0]/10 px-2 py-1 text-sm text-[#6160b0] dark:bg-[#6160b0]/20 dark:text-[#74c9d5]"
                    >
                      {items?.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOption(items, formik.setFieldValue);
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
                    placeholder={groups.length === 0 ? "Select Groups" : ""}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setOpen(true)}
                  />
                </div>
              </div>

              {open && (
                <ClickOutside
                  onClick={() => setOpen(false)}
                  className="relative"
                >
                  <div className="mt-3 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 ease-out dark:border-neutral-700 dark:bg-darkMainBackground">
                    {filteredOptions.map((option: GroupData) => (
                      <button
                        type="button"
                        key={option?.group_id}
                        onClick={() =>
                          toggleOption(option, formik.setFieldValue)
                        }
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                      >
                        <span>{option?.name}</span>
                        {groups?.some(
                          (group) => group?.group_id === option?.group_id
                        ) && <Check className="h-4 w-4 text-[#6160b0]" />}
                      </button>
                    ))}
                  </div>
                </ClickOutside>
              )}
            </div>
          </div>
        </form>
      </DialogContent>

      <DialogActions className="border-t border-gray-200 p-6 dark:border-neutral-700">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
          >
            Cancel
          </button>
          <CustomButton
            onClick={() => formik.handleSubmit()}
            loading={isLoading}
            disabled={isLoading}
          >
            Update
          </CustomButton>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateUser;
