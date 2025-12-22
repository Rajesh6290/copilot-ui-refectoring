"use client";
import ProgressChart from "@/shared/common/ProgressChart";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import CloseIcon from "@mui/icons-material/Close";
import { Button, Dialog, IconButton } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Calendar, CircleCheckBig, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UpdateAuditValidationSchemas } from "../../schema/audit.schema";
import { AuditItem } from "./AuditRegister";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" }
];

interface UpdateAuditProps {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  item: AuditItem | null;
}

const UpdateAudit = ({ open, onClose, mutate, item }: UpdateAuditProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { data, isValidating } = useSwr("frameworks?page=1&limit=10");
  const { isLoading, mutation } = useMutation();
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return "";
    }
    return dateString.split("T")[0] || ""; // Extract YYYY-MM-DD from ISO string
  };

  const initialFrameworkIds =
    item?.framwork_mapping?.map(
      (fw: { framework_common_id: string }) => fw.framework_common_id
    ) || [];
  const initialFrameworkDocs =
    item?.framwork_mapping?.reduce(
      (
        acc: Record<string, string>,
        fw: {
          framework_common_id: string;
          framework_doc_id: string;
        }
      ) => {
        acc[fw.framework_common_id] = fw.framework_doc_id;
        return acc;
      },
      {}
    ) || {};

  const initialValues = {
    title: item?.title || "",
    description: item?.description || "",
    status: item?.status || "draft",
    audit_window: {
      start_date: formatDate(item?.audit_window?.start_date),
      end_date: formatDate(item?.audit_window?.end_date)
    },
    framework_ids: initialFrameworkIds as string[],
    framework_docs: initialFrameworkDocs as Record<string, string>
  };

  const handleSubmit = async (values: {
    title: string;
    description: string;
    status: string;
    audit_window: {
      start_date: string;
      end_date: string;
    };
    framework_docs: Record<string, string>;
  }) => {
    try {
      const startDate = values.audit_window.start_date
        ? new Date(values.audit_window.start_date).toISOString()
        : null;
      const endDate = values.audit_window.end_date
        ? new Date(values.audit_window.end_date).toISOString()
        : null;

      const payload: {
        assessment_type: string;
        title: string;
        description: string;
        status: string;
        audit_window: {
          start_date: string | null;
          end_date: string | null;
        };
        framework_ids_map: Record<string, string>;
      } = {
        assessment_type: "audit",
        title: values.title,
        description: values.description,
        status: values.status,
        audit_window: {
          start_date: startDate,
          end_date: endDate
        },
        framework_ids_map: values.framework_docs
      };

      const res = await mutation(`audit?audit_id=${item?.audit_id}`, {
        method: "PUT",
        body: payload,
        isAlert: false
      });
      if (res?.status === 201 || res?.status === 200) {
        onClose();
        mutate();
        setCurrentStep(1);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  const getCompliancePercentage = (stats: {
    ready_requirements: number;
    in_scope_requirements: number;
  }) => {
    if (!stats?.ready_requirements || !stats?.in_scope_requirements) {
      return 0;
    }
    return Math.floor(
      (stats.ready_requirements / stats.in_scope_requirements) * 100
    );
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="lg"
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
        validationSchema={UpdateAuditValidationSchemas[currentStep - 1]}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          setFieldTouched,
          validateForm
        }) => (
          <Form className="flex h-[80vh] w-full flex-col rounded-[4px] bg-white dark:border dark:border-gray-600 dark:bg-darkSidebarBackground">
            {/* Header */}
            <div className="flex h-[7%] w-full items-center justify-between border-b border-gray-300 p-3 dark:border-gray-600">
              <p className="text-2xl font-semibold text-gray-700 dark:text-gray-400">
                Update Audit
              </p>
              <IconButton onClick={onClose}>
                <CloseIcon className="dark:text-white" />
              </IconButton>
            </div>

            {/* Content Area */}
            <div className="h-[85%] w-full overflow-y-auto p-8">
              {/* Step 1: Basic Information with Status */}
              {currentStep === 1 && (
                <div className="mx-auto space-y-8">
                  <div className="space-y-6">
                    {/* Assessment Name */}
                    <div className="group">
                      <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Name <span className="text-red-500">*</span>
                      </span>
                      <Field
                        name="title"
                        type="text"
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800 shadow-sm transition-all duration-300 placeholder:text-gray-400 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-blue-400 dark:focus:border-blue-500 dark:focus:ring-blue-900"
                        placeholder="e.g., Q4 2024 Security Audit"
                      />
                      <ErrorMessage
                        name="title"
                        component="p"
                        className="mt-2 flex items-center text-sm font-medium text-red-600 dark:text-red-400"
                      />
                    </div>

                    {/* Description */}
                    <div className="group">
                      <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Description <span className="text-red-500">*</span>
                      </span>
                      <Field
                        name="description"
                        as="textarea"
                        rows={5}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800 shadow-sm transition-all duration-300 placeholder:text-gray-400 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-blue-400 dark:focus:border-blue-500 dark:focus:ring-blue-900"
                        placeholder="Provide a detailed description of the audit scope and objectives..."
                      />
                      <ErrorMessage
                        name="description"
                        component="p"
                        className="mt-2 flex items-center text-sm font-medium text-red-600 dark:text-red-400"
                      />
                    </div>

                    {/* Status Field */}
                    <div className="group">
                      <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Status <span className="text-red-500">*</span>
                      </span>
                      <Field
                        name="status"
                        as="select"
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 text-gray-800 shadow-sm transition-all duration-300 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-blue-400 dark:focus:border-blue-500 dark:focus:ring-blue-900"
                      >
                        <option value="" disabled>
                          Select Status
                        </option>
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="status"
                        component="p"
                        className="mt-2 flex items-center text-sm font-medium text-red-600 dark:text-red-400"
                      />
                    </div>

                    {/* Audit Window */}
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-tertiary-50 p-6 shadow-sm dark:from-gray-800 dark:via-gray-800 dark:to-gray-700">
                      <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                        Audit Window
                      </h4>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Start Date */}
                        <div className="group">
                          <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Start Date <span className="text-red-500">*</span>
                          </span>
                          <div
                            tabIndex={0}
                            role="button"
                            className="relative cursor-pointer"
                            onClick={() => {
                              const startDateInput = document.querySelector(
                                'input[name="audit_window.start_date"]'
                              ) as HTMLInputElement;
                              if (startDateInput) {
                                startDateInput.focus();
                                if (startDateInput) {
                                  startDateInput.focus();
                                  if (startDateInput.showPicker) {
                                    startDateInput.showPicker();
                                  }
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const startDateInput = document.querySelector(
                                  'input[name="audit_window.start_date"]'
                                ) as HTMLInputElement;
                                if (startDateInput) {
                                  startDateInput.focus();
                                  if (startDateInput.showPicker) {
                                    startDateInput.showPicker();
                                  }
                                }
                              }
                            }}
                          >
                            <Field
                              name="audit_window.start_date"
                              type="date"
                              className="w-full cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 pr-10 text-gray-800 shadow-sm transition-all duration-300 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-blue-400 dark:focus:border-blue-500 dark:focus:ring-blue-900 [&::-webkit-calendar-picker-indicator]:opacity-0"
                            />
                            <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors" />
                          </div>
                          <ErrorMessage
                            name="audit_window.start_date"
                            component="p"
                            className="mt-2 flex items-center text-sm font-medium text-red-600 dark:text-red-400"
                          />
                        </div>

                        {/* End Date */}
                        <div className="group">
                          <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            End Date <span className="text-red-500">*</span>
                          </span>
                          <div
                            tabIndex={0}
                            role="button"
                            className="relative cursor-pointer"
                            onClick={() => {
                              const endDateInput = document.querySelector(
                                'input[name="audit_window.end_date"]'
                              ) as HTMLInputElement;
                              if (endDateInput) {
                                endDateInput.focus();
                                if (endDateInput) {
                                  endDateInput.focus();
                                  if (endDateInput.showPicker) {
                                    endDateInput.showPicker();
                                  }
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const endDateInput = document.querySelector(
                                  'input[name="audit_window.end_date"]'
                                ) as HTMLInputElement;
                                if (endDateInput) {
                                  endDateInput.focus();
                                  if (endDateInput.showPicker) {
                                    endDateInput.showPicker();
                                  }
                                }
                              }
                            }}
                          >
                            <Field
                              name="audit_window.end_date"
                              type="date"
                              className="w-full cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-4 py-3.5 pr-10 text-gray-800 shadow-sm transition-all duration-300 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-blue-400 dark:focus:border-blue-500 dark:focus:ring-blue-900 [&::-webkit-calendar-picker-indicator]:opacity-0"
                            />
                            <Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors" />
                          </div>
                          <ErrorMessage
                            name="audit_window.end_date"
                            component="p"
                            className="mt-2 flex items-center text-sm font-medium text-red-600 dark:text-red-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Select Framework */}
              {currentStep === 2 && (
                <div className="mx-auto space-y-6">
                  {/* Loading State */}
                  {isValidating ? (
                    <div className="flex h-64 items-center justify-center">
                      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent"></div>
                    </div>
                  ) : (
                    <>
                      {/* Frameworks Grid */}
                      <div className="grid w-full grid-cols-1 items-center gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {data?.frameworks?.map(
                          (items: {
                            id: string;
                            short_name: string;
                            name: string;
                            version: string;
                            jurisdiction: string;
                            badge_url: string;
                            doc_id: string;
                            requirement_stats: {
                              ready_requirements: number;
                              in_scope_requirements: number;
                            };
                          }) => {
                            const completionPercentage =
                              getCompliancePercentage(items?.requirement_stats);
                            const isCompliant = completionPercentage === 100;

                            return (
                              <div
                                key={items.id}
                                tabIndex={0}
                                role="button"
                                onClick={() => {
                                  const isSelected =
                                    values.framework_ids.includes(items.id);
                                  if (isSelected) {
                                    // Remove framework
                                    setFieldValue(
                                      "framework_ids",
                                      values.framework_ids.filter(
                                        (id: string) => id !== items.id
                                      )
                                    );
                                    const newDocs = {
                                      ...values.framework_docs
                                    };
                                    delete newDocs[items.id];
                                    setFieldValue("framework_docs", newDocs);
                                  } else {
                                    // Add framework
                                    setFieldValue("framework_ids", [
                                      ...values.framework_ids,
                                      items.id
                                    ]);
                                    setFieldValue("framework_docs", {
                                      ...values.framework_docs,
                                      [items.id]: items.doc_id || ""
                                    });
                                  }
                                  setFieldTouched("framework_ids", true);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const isSelected =
                                      values.framework_ids.includes(items.id);
                                    if (isSelected) {
                                      // Remove framework
                                      setFieldValue(
                                        "framework_ids",
                                        values.framework_ids.filter(
                                          (id: string) => id !== items.id
                                        )
                                      );
                                      const newDocs = {
                                        ...values.framework_docs
                                      };
                                      delete newDocs[items.id];
                                      setFieldValue("framework_docs", newDocs);
                                    } else {
                                      // Add framework
                                      setFieldValue("framework_ids", [
                                        ...values.framework_ids,
                                        items.id
                                      ]);
                                      setFieldValue("framework_docs", {
                                        ...values.framework_docs,
                                        [items.id]: items.doc_id || ""
                                      });
                                    }
                                    setFieldTouched("framework_ids", true);
                                  }
                                }}
                                className={`flex h-full w-full cursor-pointer flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800 ${
                                  values.framework_ids.includes(items.id)
                                    ? "border-blue-500 ring-4 ring-blue-100 dark:border-blue-400 dark:ring-blue-900"
                                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                                }`}
                              >
                                {/* Framework Header */}
                                <div className="flex w-full items-center gap-3">
                                  <div className="w-16 overflow-hidden">
                                    <img
                                      src={items?.badge_url}
                                      alt={`${items?.short_name} badge`}
                                      className="size-full object-cover"
                                    />
                                  </div>
                                  <div className="flex w-full flex-col gap-1">
                                    <p className="text-lg font-semibold text-tertiary">
                                      {items?.short_name}
                                    </p>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      {items?.name}
                                    </p>
                                    {/* Version and Jurisdiction Tags */}
                                    <div className="flex items-center gap-2 text-xs">
                                      {items?.version && (
                                        <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                          {items?.version}
                                        </span>
                                      )}
                                      {items?.jurisdiction && (
                                        <span className="rounded bg-tertiary-100 px-2 py-0.5 font-medium text-tertiary-700 dark:bg-tertiary-900/30 dark:text-tertiary-400">
                                          {items?.jurisdiction}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Progress Chart */}
                                <div className="h-fit w-full overflow-hidden">
                                  <ProgressChart
                                    value={completionPercentage}
                                    size={200}
                                  />
                                </div>

                                {/* Compliance Badge */}
                                <div className="mb-10 flex w-full items-center justify-center">
                                  <div
                                    className={`flex items-center gap-2 rounded-full px-4 py-2 ${
                                      isCompliant
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                    }`}
                                  >
                                    <span
                                      className={`flex size-6 items-center justify-center rounded-full ${
                                        isCompliant
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    >
                                      <CircleCheckBig
                                        className="text-white"
                                        size={12}
                                      />
                                    </span>
                                    <span className="text-sm font-semibold">
                                      {isCompliant
                                        ? "Compliant"
                                        : "Not Compliant"}
                                    </span>
                                  </div>
                                </div>

                                {/* Statistics */}
                                <div className="flex w-full items-center justify-between">
                                  {/* Ready Requirements */}
                                  <div className="flex items-center gap-3">
                                    <span className="flex size-8 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                                      <CircleCheckBig
                                        className="text-green-500"
                                        size={15}
                                      />
                                    </span>
                                    <div className="flex flex-col gap-0">
                                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                                        {items?.requirement_stats
                                          ?.ready_requirements || 0}
                                        /
                                        {items?.requirement_stats
                                          ?.in_scope_requirements || 0}
                                      </p>
                                      <p className="-mt-1 text-sm font-semibold text-gray-800 dark:text-white">
                                        Ready Requirements
                                      </p>
                                    </div>
                                  </div>

                                  {/* In-scope Requirements */}
                                  <div className="flex items-center gap-3">
                                    <span className="flex size-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                                      <SlidersHorizontal
                                        className="-rotate-90 text-blue-500"
                                        size={15}
                                      />
                                    </span>
                                    <div className="flex flex-col gap-0">
                                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                                        {items?.requirement_stats
                                          ?.in_scope_requirements || 0}
                                      </p>
                                      <p className="-mt-1 text-sm font-semibold text-gray-800 dark:text-white">
                                        In-scope Requirements
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>

                      {/* Selected Count */}
                      {values.framework_ids.length > 0 && (
                        <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                            {values.framework_ids.length} framework
                            {values.framework_ids.length > 1 ? "s" : ""}{" "}
                            selected
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {touched.framework_ids && errors.framework_ids && (
                        <p className="mt-2 flex items-center text-sm font-medium text-red-600 dark:text-red-400">
                          <span className="mr-1">⚠</span> {errors.framework_ids}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex h-[8%] w-full items-center justify-between border-t border-gray-300 px-6 dark:border-gray-600">
              <Button
                variant="outlined"
                className="!border-tertiary-600 !text-tertiary-600"
                onClick={onClose}
              >
                Cancel
              </Button>
              <div className="flex items-center gap-5">
                {currentStep > 1 && (
                  <div className="w-fit">
                    <CustomButton
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Back
                    </CustomButton>
                  </div>
                )}
                <div className="w-fit">
                  <CustomButton
                    type="button"
                    onClick={async () => {
                      const err = await validateForm();

                      // Mark all fields in current step as touched
                      if (currentStep === 1) {
                        setFieldTouched("title", true);
                        setFieldTouched("description", true);
                        setFieldTouched("status", true);
                        setFieldTouched("audit_window.start_date", true);
                        setFieldTouched("audit_window.end_date", true);
                      } else if (currentStep === 2) {
                        setFieldTouched("framework_ids", true);
                      }

                      // Check if current step has errors
                      const hasErrors =
                        (currentStep === 1 &&
                          (err.title ||
                            err.description ||
                            err.status ||
                            err.audit_window)) ||
                        (currentStep === 2 && err.framework_ids);
                      if (!hasErrors) {
                        if (currentStep < 2) {
                          setCurrentStep(currentStep + 1);
                        } else {
                          handleSubmit(values);
                        }
                      }
                    }}
                    loading={isLoading}
                    loadingText="Updating...."
                  >
                    {currentStep === 2 ? "Update Audit" : "Next"}
                  </CustomButton>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default UpdateAudit;
