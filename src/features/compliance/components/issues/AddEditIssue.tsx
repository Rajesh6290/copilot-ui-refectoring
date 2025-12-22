"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IssueValidationSchema } from "../../schema/issue.schema";
import { Issue } from "./Issues";
import dynamic from "next/dynamic";
const SearchableUserDropdown = dynamic(
  () => import("./SearchableUserDropdown"),
  {
    ssr: false
  }
);

interface NewIssue {
  title: string;
  description: string;
  priority: string;
  type: string;
  status: string;
  assigned_to: {
    email: string;
    user_id: string;
    username: string;
    role: string;
  };
  due_date: string;
}
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
const AddEditIssue = ({
  open,
  onClose,
  mutate,
  editItem,
  controlId
}: {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  editItem?: Issue | null;
  controlId: string;
}) => {
  const { isLoading, mutation } = useMutation();
  const isEditing = !!editItem;
  const [userSearchFilter, setUserSearchFilter] = useState("");
  const debouncedUserSearch = useDebounce(userSearchFilter, 300);
  const { data: usersResponse, isValidating: usersLoading } = useSwr(
    `users?page=1&limit=1000&status=&detail=true${debouncedUserSearch ? `&filters=${encodeURIComponent(debouncedUserSearch)}` : ""}`
  );

  const users = usersResponse?.users || [];
  const handleUserSearch = useCallback((searchTerm: string) => {
    setUserSearchFilter(searchTerm);
  }, []);

  const handleSubmit = async (
    values: NewIssue,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const apiUrl = isEditing ? `issue?issue_id=${editItem.id}` : "issues";
      const method = isEditing ? "PUT" : "POST";

      const submitData = {
        ...values,
        status: isEditing ? values.status : "active",
        related_entity: {
          type: "control",
          control_id: controlId,
          id: controlId
        },
        due_date: values.due_date ? new Date(values.due_date).toISOString() : ""
      };

      const res = await mutation(apiUrl, {
        method,
        isAlert: false,
        body: submitData
      });

      if (res?.status === 200 || res?.status === 201) {
        mutate();
        resetForm();
        onClose();
        toast.success(`Issue ${isEditing ? "updated" : "added"} successfully`);
      }
    } catch {
      toast.error(
        `Error ${isEditing ? "updating" : "adding"} issue. Please try again.`
      );
    }
  };
  const getInitialAssignedTo = () => {
    if (editItem?.assigned_to) {
      if (
        typeof editItem.assigned_to === "object" &&
        editItem.assigned_to.user_id
      ) {
        return editItem.assigned_to;
      }
      if (typeof editItem.assigned_to === "string") {
        const assignedToEmail = editItem.assigned_to;
        if (assignedToEmail === "other") {
          return {
            email: "other",
            user_id: "other",
            username: "other",
            role: "other"
          };
        }

        const user = users.find(
          (u: { email_id: string }) => u.email_id === assignedToEmail
        );
        if (user) {
          return {
            email: user.email_id || "",
            user_id: user.user_id || "",
            username: user.user_name || user.first_name || "",
            role: user.role || ""
          };
        }
      }
    }
    return {
      email: "",
      user_id: "",
      username: "",
      role: ""
    };
  };

  const initialValues: NewIssue = {
    title: editItem?.title || "",
    description: editItem?.description || "",
    priority: editItem?.priority || "",
    type: editItem?.type || "",
    status: editItem?.status || "active",
    assigned_to: getInitialAssignedTo(),
    due_date: editItem?.due_date
      ? String(new Date(editItem.due_date).toISOString().split("T")[0])
      : ""
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-lg"
      }}
    >
      <DialogTitle className="border-b border-gray-200 dark:border-gray-700 dark:bg-darkSidebarBackground">
        <span className="text-gray-900 dark:text-white">
          {isEditing ? "Edit Issue" : "Add New Issue"}
        </span>
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={IssueValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validateOnChange={false}
        validateOnBlur={true}
      >
        {({ isSubmitting, values, setFieldValue, errors }) => (
          <Form className="dark:bg-darkSidebarBackground">
            <div className="p-6">
              <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="text"
                    id="title"
                    name="title"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                    placeholder="Enter issue title..."
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Assigned To - Enhanced Searchable Dropdown */}
                <div>
                  <label
                    htmlFor="assigned_to"
                    className="mb-2 block text-sm font-semibold text-[#475569] dark:text-white"
                  >
                    Assigned To <span className="text-red-500">*</span>
                  </label>
                  <SearchableUserDropdown
                    value={values.assigned_to}
                    onChange={(value) => setFieldValue("assigned_to", value)}
                    onSearchChange={handleUserSearch}
                    users={users}
                    isLoading={usersLoading}
                    {...(errors.assigned_to?.user_id && {
                      error: errors.assigned_to.user_id
                    })}
                  />
                  <ErrorMessage
                    name="assigned_to.user_id"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label
                    htmlFor="priority"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    id="priority"
                    name="priority"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                  >
                    <option value="" disabled>
                      Select priority
                    </option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Field>
                  <ErrorMessage
                    name="priority"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Type */}
                <div>
                  <label
                    htmlFor="type"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Type <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    id="type"
                    name="type"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="control">Control</option>
                    <option value="security">Security</option>
                    <option value="operational">Operational</option>
                    <option value="technical">Technical</option>
                    <option value="other">Other</option>
                  </Field>
                  <ErrorMessage
                    name="type"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Status - Only show when editing */}
                {isEditing && (
                  <div>
                    <label
                      htmlFor="status"
                      className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                    >
                      Status <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      id="status"
                      name="status"
                      className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="active">Active</option>
                      <option value="in_progress">In Progress</option>
                      <option value="remediated">Remediated</option>
                    </Field>
                    <ErrorMessage
                      name="status"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>
                )}

                {/* Due Date */}
                <div className={isEditing ? "" : "md:col-span-2"}>
                  <label
                    htmlFor="due_date"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="date"
                    id="due_date"
                    name="due_date"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                  />
                  <ErrorMessage
                    name="due_date"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows={4}
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                    placeholder="Enter issue description..."
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
              </div>
            </div>
            <DialogActions className="border-t border-gray-200 p-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <div className="w-fit">
                <CustomButton
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  loading={isLoading}
                  startIcon={<Check className="h-4 w-4" />}
                  loadingText={isEditing ? "Updating..." : "Saving..."}
                >
                  {isEditing ? "Update Issue" : "Save Issue"}
                </CustomButton>
              </div>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddEditIssue;
