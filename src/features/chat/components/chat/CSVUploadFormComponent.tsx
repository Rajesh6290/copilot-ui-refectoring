import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import { ArrowLeft, FileText, Settings, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";

const CSVUploadFormComponent = ({
  onFormSubmit,
  onCancel,
  selectedProvider
}: {
  onFormSubmit?: () => void;
  onCancel: () => void;
  selectedProvider: string;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasExistingApplication, setHasExistingApplication] = useState<
    boolean | null
  >(null);
  const [showApplicationQuestion, setShowApplicationQuestion] = useState(true);

  const { data: applicationsData, isValidating: applicationsValidating } =
    useSwr("applications/get-existing-applications?page=1&limit=1000");
  const { mutation } = useMutation();
  const hasApplications =
    applicationsData &&
    applicationsData.applications &&
    applicationsData.applications.length > 0;

  // Automatically set to new application form if no applications exist
  useEffect(() => {
    if (!applicationsValidating && !hasApplications) {
      setHasExistingApplication(false);
      setShowApplicationQuestion(false);
    }
  }, [applicationsValidating, hasApplications]);

  const useCaseOptions = [
    { value: "", label: "Select a use case" },
    { value: "transportation", label: "Transportation" },
    { value: "financial_services", label: "Financial Services" },
    { value: "healthcare_diagnostics", label: "Healthcare Diagnostics" },
    { value: "customer_support", label: "Customer Support" },
    {
      value: "speech_recognition_systems",
      label: "Speech Recognition Systems"
    },
    { value: "industrial_automation", label: "Industrial Automation" },
    { value: "marketing_and_advertising", label: "Marketing & Advertising" },
    { value: "ecommerce_and_retail", label: "E-commerce & Retail" },
    { value: "legal_document_review", label: "Legal Document Review" },
    { value: "agriculture", label: "Agriculture" },
    {
      value: "energy_management_and_utilities",
      label: "Energy Management & Utilities"
    },
    { value: "supply_chain_optimization", label: "Supply Chain Optimization" },
    {
      value: "fraud_detection_in_finance_and_security",
      label: "Fraud Detection in Finance & Security"
    },
    {
      value: "cybersecurity_and_threat_detection",
      label: "Cybersecurity & Threat Detection"
    },
    {
      value: "urban_planning_and_smart_infrastructure",
      label: "Urban Planning & Smart Infrastructure"
    },
    { value: "drug_discovery", label: "Drug Discovery" },
    { value: "education_and_edtech", label: "Education & EdTech" },
    {
      value: "retail_pricing_optimization",
      label: "Retail Pricing Optimization"
    },
    { value: "environmental_monitoring", label: "Environmental Monitoring" },
    { value: "mental_health_support", label: "Mental Health Support" },
    { value: "autonomous_drones", label: "Autonomous Drones" },
    {
      value: "fake_news_detection_in_media_and_journalism",
      label: "Fake News Detection in Media & Journalism"
    },
    {
      value: "insurance_claims_processing",
      label: "Insurance Claims Processing"
    },
    {
      value: "law_enforcement_and_public_safety",
      label: "Law Enforcement & Public Safety"
    },
    { value: "biometrics_system", label: "Biometrics System" },
    { value: "image_generation", label: "Image Generation" },
    { value: "robotics", label: "Robotics" },
    { value: "others", label: "Others" }
  ];

  const initialValues = {
    application_name: "",
    application_id: "",
    use_case: "",
    company_url: "",
    file: null as File | null
  };

  const validationSchema = Yup.object({
    application_name: hasExistingApplication
      ? Yup.string()
      : Yup.string()
          .required("Application name is required")
          .min(2, "Application name must be at least 2 characters")
          .max(100, "Application name must not exceed 100 characters"),
    application_id: hasExistingApplication
      ? Yup.string().required("Please select an application")
      : Yup.string(),
    use_case: Yup.string()
      .required("Use case is required")
      .notOneOf([""], "Please select a use case"),
    file: Yup.mixed()
      .required("CSV file is required")
      .test("fileType", "Only CSV files are allowed", (value) => {
        if (!value) {
          return false;
        }
        return (
          value instanceof File &&
          (value.type === "text/csv" || value.name.endsWith(".csv"))
        );
      })
      .test("fileSize", "File size must be less than 10MB", (value) => {
        if (!value) {
          return false;
        }
        return value instanceof File && value.size <= 10 * 1024 * 1024;
      })
  });

  const handleApplicationChoice = (choice: boolean) => {
    setHasExistingApplication(choice);
    setShowApplicationQuestion(false);
  };

  const handleBackToQuestion = () => {
    setShowApplicationQuestion(true);
    setHasExistingApplication(null);
  };

  const handleFileChange = (
    file: File | null,
    setFieldValue: (field: string, value: File | null) => void
  ) => {
    setFieldValue("file", file);
  };

  const handleDrop = (
    e: React.DragEvent,
    setFieldValue: (field: string, value: File | null) => void
  ) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
        handleFileChange(file, setFieldValue);
      } else {
        toast.error("Only CSV files are allowed");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (
    values: {
      application_name: string;
      application_id: string;
      use_case: string;
      file: File | null;
    },
    {
      setSubmitting
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    try {
      const formDataToSend = new FormData();
      const submitData: {
        application_name: string;
        resource_name: string;
        eval_provider: string;
        use_case: string;
        application_id?: string;
      } = {
        application_name: values.application_name,
        resource_name: values.application_name, // Set resource_name to application_name
        eval_provider: selectedProvider,
        use_case: values.use_case
      };

      if (values.application_id) {
        submitData.application_id = values.application_id;
      }
      formDataToSend.append("metric_ingest_data", JSON.stringify(submitData));

      if (values.file) {
        formDataToSend.append("file", values.file);
      }

      const response = await mutation("ai-metrics/upload-csv", {
        method: "POST",
        body: formDataToSend,
        isFormData: true
      });

      if (response?.status === 201 || response?.status === 202) {
        toast.success(
          `${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} metrics uploaded successfully!`
        );
        onFormSubmit?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ name }: { name: string }) => (
    <ErrorMessage name={name}>
      {(msg) => (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          {msg}
        </div>
      )}
    </ErrorMessage>
  );

  const InputField = ({
    label,
    name,
    type = "text",
    placeholder,
    description,
    required = false,
    disabled = false,
    children
  }: {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    description?: string;
    required?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {children || (
        <Field name={name}>
          {({ field, meta }: FieldProps) => (
            <>
              <input
                {...field}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:border-tertiary-500 focus:outline-none focus:ring-4 focus:ring-tertiary-500/20 dark:bg-gray-800/50 dark:text-white ${
                  meta.touched && meta.error
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } ${
                  disabled
                    ? "cursor-not-allowed bg-gray-100 opacity-75 dark:bg-gray-700"
                    : ""
                }`}
              />
            </>
          )}
        </Field>
      )}
      <FieldError name={name} />
    </div>
  );

  const SelectField = ({
    label,
    name,
    options,
    description,
    required = false,
    disabled = false
  }: {
    label: string;
    name: string;
    options: { value: string; label: string }[];
    description?: string;
    required?: boolean;
    disabled?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      <Field name={name}>
        {({ field, meta }: FieldProps) => (
          <select
            {...field}
            disabled={disabled}
            className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:border-tertiary-500 focus:outline-none focus:ring-4 focus:ring-tertiary-500/20 dark:bg-gray-800/50 dark:text-white ${
              meta.touched && meta.error
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } ${
              disabled
                ? "cursor-not-allowed bg-gray-100 opacity-75 dark:bg-gray-700"
                : ""
            }`}
          >
            {options.map((option: { value: string; label: string }) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </Field>
      <FieldError name={name} />
    </div>
  );

  if (applicationsValidating) {
    return (
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 mx-auto my-6 w-full max-w-4xl duration-500">
        <div className="relative overflow-hidden">
          <div className="relative p-8">
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-tertiary-500/20">
                    <Settings className="h-8 w-8 animate-spin text-tertiary-500" />
                  </div>
                </div>
              </div>
              <p className="text-lg font-medium text-tertiary dark:text-gray-400">
                {"We're setting up everything you need..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-4 mx-auto my-6 w-full max-w-4xl duration-500">
      <div className="relative overflow-hidden rounded-xl bg-tertiary-500/5">
        <div className="absolute right-2 top-2 z-50">
          <button
            onClick={onCancel}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-tertiary transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!showApplicationQuestion && (
          <div className="absolute left-2 top-2 z-50">
            <button
              onClick={handleBackToQuestion}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-tertiary transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-48 w-48 animate-pulse rounded-full bg-tertiary-500/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-48 w-48 animate-pulse rounded-full bg-tertiary-500/20 blur-3xl delay-1000"></div>
        </div>

        <div className="relative p-8">
          {showApplicationQuestion && hasApplications && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 space-y-6 text-center duration-500">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Upload Data for{" "}
                  {selectedProvider.charAt(0).toUpperCase() +
                    selectedProvider.slice(1)}
                </h2>
                <p className="mx-auto max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  {
                    "If you have existing applications, you can select one from the list and we'll pre-fill some information for you. Otherwise, you can create a new application."
                  }
                </p>
              </div>

              <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => handleApplicationChoice(true)}
                  className="w-fit flex-1 text-nowrap rounded-md bg-tertiary-500 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-tertiary-600 hover:shadow-xl"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Yes, I have
                  </div>
                </button>

                <button
                  onClick={() => handleApplicationChoice(false)}
                  className="w-fit flex-1 text-nowrap rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-800 shadow-lg transition-all duration-300 hover:bg-gray-300 hover:shadow-xl dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    No, create new
                  </div>
                </button>
              </div>
            </div>
          )}

          {!showApplicationQuestion && hasExistingApplication !== null && (
            <div className="animate-in fade-in-50 slide-in-from-right-4 duration-500">
              <p className="w-full text-center font-semibold text-tertiary">
                Fill in the details and upload your {selectedProvider} CSV file
              </p>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, setFieldValue, isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    {hasExistingApplication ? (
                      <SelectField
                        label="Select Application"
                        name="application_id"
                        required
                        description="Choose an existing application from your list"
                        options={[
                          { value: "", label: "Select an application" },
                          ...(applicationsData?.applications?.map(
                            (app: {
                              application_id: string;
                              name: string;
                            }) => ({
                              value: app.application_id,
                              label: app.name
                            })
                          ) || [])
                        ]}
                      />
                    ) : (
                      <InputField
                        label="Application Name"
                        name="application_name"
                        required
                        placeholder="Enter application name..."
                        description="Name of the AI application (e.g., CRM System, Analytics Platform)"
                      />
                    )}

                    <Field name="application_id">
                      {({ field }: FieldProps) => {
                        if (
                          hasExistingApplication &&
                          field.value &&
                          applicationsData?.applications
                        ) {
                          const selectedApp =
                            applicationsData.applications.find(
                              (app: { application_id: string }) =>
                                app.application_id === field.value
                            );
                          if (
                            selectedApp &&
                            values.application_name !== selectedApp.name
                          ) {
                            setFieldValue("application_name", selectedApp.name);
                            setFieldValue(
                              "use_case",
                              selectedApp.use_case_type
                            );
                          }
                        }
                        return null;
                      }}
                    </Field>

                    <SelectField
                      label="Use Case"
                      name="use_case"
                      required
                      disabled={
                        hasExistingApplication && values.application_id !== ""
                      }
                      description={
                        hasExistingApplication && values.application_id
                          ? "Use case is auto-filled from the selected application"
                          : "Business use case this application supports (e.g., fraud detection, customer support, content generation)"
                      }
                      options={useCaseOptions}
                    />

                    <div className="space-y-2">
                      <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        CSV File <span className="text-red-500">*</span>
                      </span>
                      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                        Upload your {selectedProvider} CSV file containing the
                        data you want to analyze (Max size: 10MB)
                      </p>
                      <div
                        className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                          isDragOver
                            ? "border-tertiary-400 bg-tertiary-50 dark:bg-tertiary-950/20"
                            : values.file
                              ? "border-tertiary-400 bg-tertiary-50 dark:bg-tertiary-950/20"
                              : touched.file && errors.file
                                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                : "border-gray-300 hover:border-tertiary-400 dark:border-gray-600"
                        }`}
                        onDrop={(e) => handleDrop(e, setFieldValue)}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        {values.file ? (
                          <div className="space-y-3">
                            <FileText className="mx-auto h-12 w-12 text-tertiary-500" />
                            <p className="text-lg font-semibold text-gray-700 dark:text-white">
                              {values.file.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(values.file.size / 1024).toFixed(2)} KB
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                handleFileChange(null, setFieldValue)
                              }
                              className="text-sm text-red-600 underline hover:text-red-800"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="mx-auto h-16 w-16 text-gray-400" />
                            <div>
                              <p className="text-lg font-medium text-gray-700 dark:text-white">
                                Drop your {selectedProvider} CSV file here
                              </p>
                              <p className="mt-1 text-sm text-gray-500">or</p>
                            </div>
                            <label className="inline-block cursor-pointer rounded-lg bg-tertiary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-tertiary-700">
                              Browse Files
                              <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  handleFileChange(file, setFieldValue);
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                      <FieldError name="file" />
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                      <CustomButton
                        type="submit"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        loadingText="Submitting..."
                      >
                        Submit{" "}
                        {selectedProvider.charAt(0).toUpperCase() +
                          selectedProvider.slice(1)}{" "}
                        Data
                      </CustomButton>
                      <button
                        type="button"
                        onClick={handleBackToQuestion}
                        disabled={isSubmitting}
                        className="rounded border-2 border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800/50"
                      >
                        Back
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CSVUploadFormComponent;
