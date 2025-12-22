"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import usePermission from "@/shared/hooks/usePermission";
import useSwr from "@/shared/hooks/useSwr";
import { useClerk } from "@clerk/nextjs";
import { Dialog } from "@mui/material";
import { Form, Formik } from "formik";
import { ChevronDown, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { NewTestValidationSchema } from "../../schema/test.schema";

interface TestFormValues {
  firstName: string;
  description: string;
  frequency: string;
  preferredRunTime: string;
  application: string;
  notes: string;
}

interface AddNewTestProps {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
}

// Validation Schema

const initialValues: TestFormValues = {
  firstName: "",
  description: "",
  frequency: "",
  preferredRunTime: "",
  application: "",
  notes: ""
};

const AddNewTest: React.FC<AddNewTestProps> = ({ open, onClose, mutate }) => {
  const { isLoading, mutation } = useMutation();
  const { data, isValidating } = useSwr(open ? "applications/list" : null);
  const { user } = usePermission();
  const { user: clerkUser } = useClerk();

  // Convert time (HH:mm) to ISO UTC format with today's date
  const convertToISOUTC = (time: string): string => {
    if (!time) {
      return "";
    }

    // Get current date in user's local timezone
    const now = new Date();
    const [hours, minutes] = time.split(":");

    // Create a new date with today's date and selected time in local timezone
    const localDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parseInt(hours || "0", 10),
      parseInt(minutes || "0", 10),
      0,
      0
    );

    // Convert to ISO string (automatically converts to UTC)
    return localDate.toISOString();
  };

  const handleSubmit = async (values: TestFormValues): Promise<void> => {
    try {
      const res = await mutation("test", {
        method: "POST",
        isAlert: false,
        body: {
          name: values.firstName,
          description: values?.description,
          frequency: values?.frequency,
          preferred_run_time: convertToISOUTC(values.preferredRunTime),
          application_id: values?.application,
          notes: values?.notes,
          owner_id: user?.user_id,
          owner_name: clerkUser?.firstName
            ? `${clerkUser?.firstName + " " + clerkUser?.lastName}`
            : "Not Provided"
        }
      });
      if (res?.status === 201 || res?.status === 200) {
        toast.success("Test added successfully!");
        onClose();
        mutate();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const frequencyOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" }
  ];

  return (
    <>
      <Dialog
        open={open}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "bg-white dark:bg-gray-900 rounded-lg"
        }}
      >
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Test
          </h2>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={NewTestValidationSchema}
          onSubmit={handleSubmit}
        >
          {({
            errors,
            touched,
            values,
            handleChange,
            handleBlur,
            setFieldValue
          }) => (
            <Form className="w-full">
              <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* First Name Field */}
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Name <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      name="firstName"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.firstName}
                      placeholder="Enter first name"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    {touched.firstName && errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Description Field */}
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Description <span className="text-red-500">*</span>
                    </span>
                    <div className="relative">
                      <textarea
                        name="description"
                        rows={3}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.description}
                        placeholder="Enter a description for your test..."
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                        {values.description?.length || 0}/500 characters
                      </div>
                    </div>
                    {touched.description && errors.description && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Frequency Field */}
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Schedule Test <span className="text-red-500">*</span>
                    </span>
                    <div className="relative">
                      <select
                        name="frequency"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.frequency}
                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Select frequency</option>
                        {frequencyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    </div>
                    {touched.frequency && errors.frequency && (
                      <p className="text-sm text-red-500">{errors.frequency}</p>
                    )}
                  </div>

                  {/* Preferred Run Time Field */}
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Preferred Run Time <span className="text-red-500">*</span>
                    </span>
                    <div
                      tabIndex={0}
                      role="button"
                      className="relative cursor-pointer"
                      onClick={() => {
                        const timeInput = document.querySelector(
                          'input[name="preferredRunTime"]'
                        ) as HTMLInputElement;
                        if (timeInput) {
                          timeInput.focus();
                          if (timeInput.showPicker) {
                            timeInput.showPicker();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const timeInput = document.querySelector(
                            'input[name="preferredRunTime"]'
                          ) as HTMLInputElement;
                          if (timeInput) {
                            timeInput.focus();
                            if (timeInput.showPicker) {
                              timeInput.showPicker();
                            }
                          }
                        }
                      }}
                    >
                      <input
                        type="time"
                        name="preferredRunTime"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.preferredRunTime}
                        className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white [&::-webkit-calendar-picker-indicator]:opacity-0"
                      />
                      <Clock className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors" />
                    </div>
                    {touched.preferredRunTime && errors.preferredRunTime && (
                      <p className="text-sm text-red-500">
                        {errors.preferredRunTime}
                      </p>
                    )}
                  </div>

                  {/* Application Field */}
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Application <span className="text-red-500">*</span>
                    </span>
                    <div className="relative">
                      <select
                        name="application"
                        onChange={(e) => {
                          handleChange(e);
                          setFieldValue("controls", []);
                        }}
                        onBlur={handleBlur}
                        value={values.application}
                        disabled={isValidating}
                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Select an application</option>
                        {data &&
                          data?.length > 0 &&
                          data?.map((app: { doc_id: string; name: string }) => (
                            <option key={app?.doc_id} value={app?.doc_id}>
                              {app?.name}
                            </option>
                          ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                        {isValidating && (
                          <svg
                            className="h-4 w-4 animate-spin text-indigo-500"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        )}
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    {touched.application && errors.application && (
                      <p className="text-sm text-red-500">
                        {errors.application}
                      </p>
                    )}
                  </div>

                  {/* Notes Field */}
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Notes
                    </span>
                    <div className="relative">
                      <textarea
                        name="notes"
                        rows={3}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.notes}
                        placeholder="Add any additional notes..."
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                        {values.notes?.length || 0}/1000 characters
                      </div>
                    </div>
                    {touched.notes && errors.notes && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dialog Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <CustomButton
                  type="submit"
                  loading={isLoading}
                  loadingText="Adding..."
                  startIcon={<Plus size={16} />}
                >
                  Add Test
                </CustomButton>
              </div>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default AddNewTest;
