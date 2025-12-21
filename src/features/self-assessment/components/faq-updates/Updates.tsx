import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import usePermission from "@/shared/hooks/usePermission";
import useSwr from "@/shared/hooks/useSwr";
import { formatDateTime } from "@/shared/utils";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  Edit2,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import * as Yup from "yup";

// Define types
interface Update {
  id: string;
  updated_date: string;
  change_description: string;
  impact: string;
}

interface NewUpdate {
  updated_date: string;
  change_description: string;
  impact: string;
}

// Validation schemas
const UpdateValidationSchema = Yup.object().shape({
  updated_date: Yup.string().required("Date is required"),
  change_description: Yup.string()
    .required("Description is required")
    .min(5, "Description must be at least 5 characters"),
  impact: Yup.string()
    .required("Impact statement is required")
    .min(10, "Impact statement must be at least 10 characters")
});
export interface UpdateIsAccess {
  button_name: string;
  metadata: {
    reference: string;
    resource_type: string;
    route: string;
    label: string;
  };
  permission: {
    is_shown: boolean;
    permission_set: string;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
  buttons: {
    button_name: string;
    metadata: {
      reference: string;
      resource_type: string;
      route: string;
      label: string;
    };
    permission: {
      is_shown: boolean;
      permission_set: string;
      actions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
    };
  }[];
}
const UpdatesSkeleton = () => {
  return (
    <div className="mx-auto w-full animate-pulse px-2 py-3 sm:w-4/5 sm:px-6 sm:py-12 lg:px-8">
      {/* Header Skeleton */}
      <div className="mb-16 text-center">
        <div className="mx-auto mb-4 h-10 w-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="mx-auto h-4 w-full max-w-3xl rounded-md bg-gray-200 dark:bg-gray-700"></div>
        <div className="mx-auto mt-2 h-4 w-3/4 max-w-3xl rounded-md bg-gray-200 dark:bg-gray-700"></div>

        {/* Search Bar Skeleton */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-300 dark:text-gray-600" />
            </div>
            <div className="block h-14 w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 shadow-lg dark:bg-darkSidebarBackground"></div>
          </div>
        </div>
      </div>

      {/* Control Bar Skeleton */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <div className="h-6 w-32 rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="h-10 w-36 rounded-md bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* FAQ Items Skeleton */}
      <div className="w-full space-y-4">
        {Array(5)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className="w-full overflow-hidden rounded-2xl bg-white shadow-md dark:bg-darkSidebarBackground"
            >
              <div className="flex items-center justify-between px-6 py-5">
                <div className="h-6 w-3/4 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
// Main Updates Component
const Updates = ({ isAccess }: { isAccess: UpdateIsAccess }) => {
  const { isLoading, mutation } = useMutation();
  const { data, isValidating, mutate } = useSwr("trust-center/updates");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const { user, isUserLoading } = usePermission();
  const updates: Update[] =
    data && data?.updates?.length > 0 ? data?.updates : [];
  const filteredUpdates: Update[] = updates?.filter(
    (update) =>
      update.change_description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      update.impact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.updated_date.includes(searchTerm)
  );

  const handleEdit = (updateId: string): void => {
    setEditingUpdateId(updateId);
    setActiveAccordion(null);
  };

  const handleSaveEdit = async (
    values: NewUpdate,
    updateId: string
  ): Promise<void> => {
    try {
      const res = await mutation(`trust-center/updates?id=${updateId}`, {
        method: "PUT",
        isAlert: false,
        body: values
      });
      if (res?.status === 200) {
        toast.success("Update modified successfully");
        mutate();
        setEditingUpdateId(null);
      }
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };

  const handleDelete = (id: string) => {
    try {
      Swal.fire({
        title: "Delete Update",
        text: "Are you sure you want to delete this update? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await mutation(`trust-center/updates?id=${id}`, {
            method: "DELETE",
            isAlert: false
          });
          if (res?.status === 200) {
            toast.success("Update deleted successfully");
            mutate();
          }
        }
      });
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };

  const handleAddNew = async (
    values: NewUpdate,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const res = await mutation("trust-center/updates", {
        method: "POST",
        isAlert: false,
        body: values
      });
      if (res?.status === 201) {
        toast.success("Update added successfully");
        mutate();
        setIsAddingNew(false);
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  // Sort updates by date (newest first)
  const sortedUpdates = [...filteredUpdates].sort(
    (a, b) =>
      new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime()
  );

  return (
    <div className="mx-auto w-full px-2 py-3 sm:w-4/5 sm:px-6 sm:py-12 lg:px-8">
      {isValidating ? (
        <UpdatesSkeleton />
      ) : (
        <>
          {/* Premium Header */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-2xl font-bold tracking-tight text-[#1e293b] dark:text-white sm:text-4xl">
              Trust Center Updates
            </h1>
            <p className="mx-auto w-full text-sm text-[#64748b] dark:text-gray-400 sm:max-w-3xl sm:text-lg">
              Post updates to keep your customers informed about your security,
              privacy, and compliance practices.
            </p>

            {/* Premium Search Bar */}
            <div className="mx-auto mt-10 w-full sm:max-w-xl">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-[#94a3b8]" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 text-[#475569] shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6366f1] dark:bg-darkSidebarBackground dark:text-white"
                  placeholder="Search updates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-5 w-5 text-[#94a3b8] hover:text-[#475569]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#334155] dark:text-white sm:text-xl">
                {searchTerm
                  ? `Search Results ${sortedUpdates.length > 0 ? `(${sortedUpdates.length})` : ""}`
                  : "Recent Updates"}
              </h2>
              {searchTerm && sortedUpdates.length > 0 && (
                <p className="mt-1 text-sm text-[#64748b] dark:text-white">
                  {` Showing results for "${searchTerm}"`}
                </p>
              )}
            </div>
            {isAccess?.buttons?.[0]?.permission?.is_shown && (
              <CustomButton
                type="button"
                onClick={() => setIsAddingNew(true)}
                disabled={!isAccess?.buttons?.[0]?.permission?.actions?.create}
                startIcon={<Plus className="mr-2 h-5 w-5" />}
              >
                Add New Update
              </CustomButton>
            )}
          </div>

          {/* Empty State */}
          {sortedUpdates.length === 0 && !isValidating && (
            <div className="mx-auto w-full rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-darkSidebarBackground">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eff6ff] dark:bg-darkSidebarBackground">
                <AlertCircle className="h-8 w-8 text-[#3b82f6]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#1e293b] dark:text-white">
                {searchTerm
                  ? "No matching updates found"
                  : "No updates available"}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-[#64748b]">
                {searchTerm
                  ? `We couldn't find any updates matching "${searchTerm}". Try different keywords or add a new update.`
                  : "Get started by adding your first update using the button above."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center rounded-lg bg-[#eff6ff] px-4 py-2 text-[#3b82f6] transition-colors duration-200 hover:bg-[#dbeafe] dark:bg-darkMainBackground"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Add New Update Form with Formik */}
          <Dialog
            open={isAddingNew}
            maxWidth="md"
            fullWidth
            PaperProps={{
              className: "bg-white dark:bg-gray-900 rounded-lg"
            }}
          >
            <DialogTitle className="border-b border-gray-200 dark:border-neutral-700 dark:bg-darkSidebarBackground">
              <span className="text-gray-900 dark:text-white">
                Add New Update
              </span>
            </DialogTitle>
            <Formik
              initialValues={{
                updated_date: new Date().toISOString().split("T")[0] ?? "",
                change_description: "",
                impact: ""
              }}
              validationSchema={UpdateValidationSchema}
              onSubmit={handleAddNew}
            >
              {({ isSubmitting, resetForm }) => (
                <Form>
                  <div className="space-y-4 p-6 dark:bg-darkSidebarBackground">
                    <div>
                      <label
                        htmlFor="updated_date"
                        className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                      >
                        Date
                      </label>
                      <Field
                        type="date"
                        id="updated_date"
                        name="updated_date"
                        className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:text-white"
                      />
                      <ErrorMessage
                        name="updated_date"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="change_description"
                        className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                      >
                        Description
                      </label>
                      <Field
                        type="text"
                        id="change_description"
                        name="change_description"
                        className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:text-white"
                        placeholder="Describe the change or update..."
                      />
                      <ErrorMessage
                        name="change_description"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="impact"
                        className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                      >
                        Impact Statement
                      </label>
                      <Field
                        as="textarea"
                        id="impact"
                        name="impact"
                        rows={3}
                        className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:text-white"
                        placeholder="Describe the impact of this change..."
                      />
                      <ErrorMessage
                        name="impact"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                  </div>
                  <DialogActions className="border-t border-gray-200 p-4 dark:border-neutral-700 dark:bg-darkSidebarBackground">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsAddingNew(false);
                      }}
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
                        loadingText="Saving..."
                      >
                        Save Update
                      </CustomButton>
                    </div>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </Dialog>
          {/* Updates List */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {sortedUpdates.map((update) => (
              <motion.div
                key={update.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-darkSidebarBackground"
                variants={itemVariants}
              >
                {editingUpdateId === update.id ? (
                  // Edit Form with Formik
                  <div className="border-l-4 border-[#4f46e5] p-6">
                    <h3 className="mb-4 text-lg font-semibold text-[#1e293b] dark:text-white">
                      Edit Update
                    </h3>
                    <Formik
                      initialValues={{
                        updated_date: update.updated_date,
                        change_description: update.change_description,
                        impact: update.impact
                      }}
                      validationSchema={UpdateValidationSchema}
                      onSubmit={(values) => handleSaveEdit(values, update.id)}
                    >
                      {({ isSubmitting }) => (
                        <Form className="space-y-4">
                          <div>
                            <label
                              htmlFor={`edit-date-${update.id}`}
                              className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                            >
                              Date
                            </label>
                            <Field
                              type="date"
                              id={`edit-date-${update.id}`}
                              name="updated_date"
                              className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:text-white"
                            />
                            <ErrorMessage
                              name="updated_date"
                              component="div"
                              className="mt-1 text-sm text-red-500"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`edit-description-${update.id}`}
                              className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                            >
                              Description
                            </label>
                            <Field
                              type="text"
                              id={`edit-description-${update.id}`}
                              name="change_description"
                              className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:text-white"
                            />
                            <ErrorMessage
                              name="change_description"
                              component="div"
                              className="mt-1 text-sm text-red-500"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`edit-impact-${update.id}`}
                              className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                            >
                              Impact Statement
                            </label>
                            <Field
                              as="textarea"
                              id={`edit-impact-${update.id}`}
                              name="impact"
                              rows={3}
                              className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:text-white"
                            />
                            <ErrorMessage
                              name="impact"
                              component="div"
                              className="mt-1 text-sm text-red-500"
                            />
                          </div>
                          <div className="flex justify-end space-x-3 pt-2">
                            <button
                              type="button"
                              className="rounded-lg border border-[#e2e8f0] px-4 py-2 text-[#64748b] outline-none transition-colors duration-200 hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:ring-offset-2 dark:border-neutral-600 dark:text-white dark:hover:bg-darkMainBackground"
                              onClick={() => setEditingUpdateId(null)}
                            >
                              Cancel
                            </button>
                            <CustomButton
                              type="submit"
                              disabled={isSubmitting || isLoading}
                              loading={isLoading}
                              startIcon={<Check className="h-4 w-4" />}
                              loadingText="Updating..."
                            >
                              Save Changes
                            </CustomButton>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                ) : (
                  <>
                    <button
                      className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                      onClick={() => toggleAccordion(update.id)}
                    >
                      <div className="flex flex-col items-start gap-2">
                        <div className="flex items-center text-tertiary">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span className="text-sm font-medium">
                            {!isUserLoading &&
                              user &&
                              update.updated_date &&
                              moment(
                                formatDateTime(
                                  update.updated_date,
                                  user?.date_time
                                )
                              ).format("ll")}
                          </span>
                        </div>
                        <span className="mt-1 pr-6 font-medium text-[#1e293b] dark:text-white sm:ml-6 sm:mt-0">
                          {update.change_description}
                        </span>
                      </div>
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${activeAccordion === update.id ? "bg-tertiary text-white" : "bg-[#f1f5f9] text-[#64748b]"} transition-colors duration-200`}
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-200 ${activeAccordion === update.id ? "rotate-180 transform" : ""}`}
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {activeAccordion === update.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-[#f1f5f9] px-6 pb-6 dark:border-neutral-600">
                            <div className="pt-4">
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-[#64748b] dark:text-white">
                                  Impact
                                </h4>
                                <p className="mt-1 whitespace-pre-line leading-relaxed text-[#475569] dark:text-white">
                                  {update.impact}
                                </p>
                              </div>
                              <div className="mt-6 flex justify-end space-x-3">
                                {isAccess?.buttons?.[1]?.permission
                                  ?.is_shown && (
                                  <button
                                    type="button"
                                    className="inline-flex items-center rounded-lg bg-[#eef2ff] px-3 py-1.5 text-sm text-[#4f46e5] transition-colors duration-200 hover:bg-[#e0e7ff]"
                                    onClick={() => {
                                      if (
                                        isAccess?.buttons?.[1]?.permission
                                          ?.actions?.update
                                      ) {
                                        handleEdit(update.id);
                                      } else {
                                        toast.error(
                                          "You do not have permission to edit this update."
                                        );
                                      }
                                    }}
                                  >
                                    <Edit2 className="mr-1.5 h-4 w-4" />
                                    Edit
                                  </button>
                                )}
                                {isAccess?.buttons?.[2]?.permission
                                  ?.is_shown && (
                                  <button
                                    type="button"
                                    className="inline-flex items-center rounded-lg bg-[#fef2f2] px-3 py-1.5 text-sm text-[#ef4444] transition-colors duration-200 hover:bg-[#fee2e2]"
                                    onClick={() => {
                                      if (
                                        isAccess?.buttons?.[2]?.permission
                                          ?.actions?.delete
                                      ) {
                                        handleDelete(update.id);
                                      } else {
                                        toast.error(
                                          "You do not have permission to delete this update."
                                        );
                                      }
                                    }}
                                  >
                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Updates;
