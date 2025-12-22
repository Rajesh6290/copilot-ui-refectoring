"use client";
import useMutation from "@/shared/hooks/useMutation";
import CloseIcon from "@mui/icons-material/Close";
import { Button, Dialog, IconButton } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";

import CustomButton from "@/shared/core/CustomButton";
import { toast } from "sonner";
import { NewFindingValidationSchema } from "../../schema/finding.schema";

// Validation schema

const AddNewFinding = ({
  open,
  onClose,
  mutate,
  item
}: {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  item: {
    application_id?: string;
    finding_type: string;
    framework_id?: string;
    control_id?: string;
    test_id?: string;
    test_run_id?: string;
    result_id?: string;
    requirement_id?: string;
  };
}) => {
  const { isLoading, mutation } = useMutation();

  const initialValues = {
    title: "",
    message: "",
    severity: "",
    finding_category: ""
  };

  const handleSubmit = async (values: {
    title: string;
    message: string;
    severity: string;
    finding_category: string;
  }) => {
    try {
      const payload = {
        heading: values.title,
        message: values.message,
        finding_type: item.finding_type,
        status: "other",
        ...(values.severity && { severity: values.severity }),
        ...(values.finding_category && {
          finding_category: values.finding_category
        }),
        ...(item.application_id && { application_id: item.application_id }),
        ...(item.framework_id && { framework_id: item.framework_id }),
        ...(item.control_id && { control_id: item.control_id }),
        ...(item.test_id && { test_id: item.test_id }),
        ...(item.test_run_id && { test_run_id: item.test_run_id }),
        ...(item.result_id && { result_id: item.result_id }),
        ...(item.requirement_id && { requirement_id: item.requirement_id })
      };

      const res = await mutation("findings", {
        method: "POST",
        body: payload,
        isAlert: false
      });

      if (res?.status === 201 || res?.status === 200) {
        onClose();
        mutate();
        toast.success(res?.results?.message || "Finding added successfully");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          borderRadius: 0,
          background: "transparent",
          boxShadow: "none",
          border: "none"
        }
      }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={NewFindingValidationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {() => (
          <Form className="flex h-auto w-full flex-col rounded-[4px] bg-white dark:border dark:border-gray-600 dark:bg-darkSidebarBackground">
            {/* Header */}
            <div className="flex h-[60px] w-full items-center justify-between border-b border-gray-300 p-3 dark:border-gray-600">
              <p className="text-2xl font-semibold text-gray-700 dark:text-gray-400">
                Add New Finding
              </p>
              <IconButton onClick={onClose}>
                <CloseIcon className="dark:text-white" />
              </IconButton>
            </div>

            {/* Content Area */}
            <div className="w-full overflow-y-auto p-8">
              <div className="space-y-6">
                {/* Title Field */}
                <div className="group">
                  <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </span>
                  <Field
                    name="title"
                    type="text"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800 shadow-sm transition-all duration-300 placeholder:text-gray-400 hover:border-tertiary-300 focus:border-tertiary-500 focus:outline-none focus:ring-4 focus:ring-tertiary-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-tertiary-400 dark:focus:border-tertiary-500 dark:focus:ring-tertiary-900"
                    placeholder="Enter finding title..."
                  />
                  <ErrorMessage
                    name="title"
                    component="p"
                    className="mt-2 flex items-center text-sm font-medium text-red-600 dark:text-red-400"
                  />
                </div>

                {/* Message Field */}
                <div className="group">
                  <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Message <span className="text-red-500">*</span>
                  </span>
                  <Field
                    name="message"
                    as="textarea"
                    rows={4}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800 shadow-sm transition-all duration-300 placeholder:text-gray-400 hover:border-tertiary-300 focus:border-tertiary-500 focus:outline-none focus:ring-4 focus:ring-tertiary-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-tertiary-400 dark:focus:border-tertiary-500 dark:focus:ring-tertiary-900"
                    placeholder="Enter your finding details here..."
                  />
                  <ErrorMessage
                    name="message"
                    component="p"
                    className="mt-2 flex items-center text-sm font-medium text-red-600 dark:text-red-400"
                  />
                </div>

                {/* Severity Field */}
                <div className="group">
                  <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Severity
                  </span>
                  <Field
                    name="severity"
                    as="select"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800 shadow-sm transition-all duration-300 hover:border-tertiary-300 focus:border-tertiary-500 focus:outline-none focus:ring-4 focus:ring-tertiary-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-tertiary-400 dark:focus:border-tertiary-500 dark:focus:ring-tertiary-900"
                  >
                    <option value="">Select Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                    <option value="other">Other</option>
                  </Field>
                  <ErrorMessage
                    name="severity"
                    component="p"
                    className="mt-2 flex items-center text-sm font-medium text-red-600 dark:text-red-400"
                  />
                </div>

                {/* Finding Category Field */}
                <div className="group">
                  <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Finding Category
                  </span>
                  <Field
                    name="finding_category"
                    type="text"
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800 shadow-sm transition-all duration-300 placeholder:text-gray-400 hover:border-tertiary-300 focus:border-tertiary-500 focus:outline-none focus:ring-4 focus:ring-tertiary-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-tertiary-400 dark:focus:border-tertiary-500 dark:focus:ring-tertiary-900"
                    placeholder="Enter finding category..."
                  />
                  <ErrorMessage
                    name="finding_category"
                    component="p"
                    className="mt-2 flex items-center text-sm font-medium text-red-600 dark:text-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex h-[60px] w-full items-center justify-end gap-6 border-t border-gray-300 px-6 dark:border-gray-600">
              <Button
                variant="outlined"
                className="!border-tertiary-600 !text-tertiary-600"
                onClick={onClose}
              >
                Cancel
              </Button>
              <div className="w-fit">
                <CustomButton
                  type="submit"
                  loading={isLoading}
                  loadingText="Submitting..."
                >
                  Submit Finding
                </CustomButton>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddNewFinding;
