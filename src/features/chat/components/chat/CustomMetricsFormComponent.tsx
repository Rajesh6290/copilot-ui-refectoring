import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { ErrorMessage, Field, FieldProps, Form, Formik } from "formik";
import { ArrowLeft, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CustomMetricSchema from "../../schema/custom-metric.schema";

interface MetricRow {
  id: string;
  metric_name: string;
  description: string;
  value: string;
}

interface CustomMetricsFormProps {
  onFormSubmit?: () => void;
  onCancel: () => void;
  selectedProvider: string;
}

// Custom Metrics Form Component
const CustomMetricsFormComponent = ({
  onFormSubmit,
  onCancel,
  selectedProvider
}: CustomMetricsFormProps) => {
  const [metricsData, setMetricsData] = useState<MetricRow[]>([]);
  const [hasExistingApplication, setHasExistingApplication] = useState<
    boolean | null
  >(null);
  const [showApplicationQuestion, setShowApplicationQuestion] = useState(true);

  // Add the SWR hooks
  const { data: applicationsData, isValidating: applicationsValidating } =
    useSwr("applications/get-existing-applications?page=1&limit=1000");
  const { mutation } = useMutation();

  // Fetch template data from API
  const { data: templateData, isValidating: isLoadingMetrics } = useSwr(
    selectedProvider
      ? `template/fetch-trace-template?evaluation_provider=${selectedProvider}&type=form`
      : null
  );

  // Check if company URL should be shown
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

  // Parse metrics from API response
  useEffect(() => {
    if (templateData && templateData?.metrics) {
      try {
        const parsedMetrics = templateData?.metrics.map(
          (
            metric: {
              metricName: string;
              description: string;
              value: number;
            },
            index: number
          ) => ({
            id: `metric_${index}`,
            metric_name: metric.metricName || "",
            description: metric.description || "",
            value: String(metric.value || 0)
          })
        );

        setMetricsData(parsedMetrics);
      } catch {
        toast.error(
          `Failed to load ${selectedProvider} metrics template. Please try again.`
        );
        setMetricsData([]);
      }
    }
  }, [templateData, selectedProvider]);

  // const useCaseOptions = [
  //   { value: "", label: "Select a use case" },
  //   { value: "transportation", label: "Transportation" },
  //   { value: "financial_services", label: "Financial Services" },
  //   { value: "healthcare_diagnostics", label: "Healthcare Diagnostics" },
  //   { value: "customer_support", label: "Customer Support" },
  //   {
  //     value: "speech_recognition_systems",
  //     label: "Speech Recognition Systems"
  //   },
  //   { value: "industrial_automation", label: "Industrial Automation" },
  //   { value: "marketing_and_advertising", label: "Marketing & Advertising" },
  //   { value: "ecommerce_and_retail", label: "E-commerce & Retail" },
  //   { value: "legal_document_review", label: "Legal Document Review" },
  //   { value: "agriculture", label: "Agriculture" },
  //   {
  //     value: "energy_management_and_utilities",
  //     label: "Energy Management & Utilities"
  //   },
  //   { value: "supply_chain_optimization", label: "Supply Chain Optimization" },
  //   {
  //     value: "fraud_detection_in_finance_and_security",
  //     label: "Fraud Detection in Finance & Security"
  //   },
  //   {
  //     value: "cybersecurity_and_threat_detection",
  //     label: "Cybersecurity & Threat Detection"
  //   },
  //   {
  //     value: "urban_planning_and_smart_infrastructure",
  //     label: "Urban Planning & Smart Infrastructure"
  //   },
  //   { value: "drug_discovery", label: "Drug Discovery" },
  //   { value: "education_and_edtech", label: "Education & EdTech" },
  //   {
  //     value: "retail_pricing_optimization",
  //     label: "Retail Pricing Optimization"
  //   },
  //   { value: "environmental_monitoring", label: "Environmental Monitoring" },
  //   { value: "mental_health_support", label: "Mental Health Support" },
  //   { value: "autonomous_drones", label: "Autonomous Drones" },
  //   {
  //     value: "fake_news_detection_in_media_and_journalism",
  //     label: "Fake News Detection in Media & Journalism"
  //   },
  //   {
  //     value: "insurance_claims_processing",
  //     label: "Insurance Claims Processing"
  //   },
  //   {
  //     value: "law_enforcement_and_public_safety",
  //     label: "Law Enforcement & Public Safety"
  //   },
  //   { value: "biometrics_system", label: "Biometrics System" },
  //   { value: "image_generation", label: "Image Generation" },
  //   { value: "robotics", label: "Robotics" },
  //   { value: "others", label: "Others" }
  // ];

  const initialValues = {
    application_name: "",
    application_id: "",
    use_case: "",
    company_url: ""
  };

  const handleApplicationChoice = (choice: boolean) => {
    setHasExistingApplication(choice);
    setShowApplicationQuestion(false);
  };

  const handleBackToQuestion = () => {
    setShowApplicationQuestion(true);
    setHasExistingApplication(null);
  };

  const handleMetricValueChange = (id: string, value: string) => {
    // Allow empty string or valid numbers between 0 and 100
    if (
      value === "" ||
      (!isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100)
    ) {
      setMetricsData((prev) =>
        prev.map((metric) => (metric.id === id ? { ...metric, value } : metric))
      );
    }
  };

  const convertToCSV = () => {
    // Filter out metrics with empty values (but allow 0)
    const validMetrics = metricsData.filter(
      (metric) =>
        metric.metric_name.trim() !== "" && String(metric.value).trim() !== ""
    );

    if (validMetrics.length === 0) {
      return "";
    }

    // Create headers (metric names)
    const headers = validMetrics.map((metric) => `"${metric.metric_name}"`);

    // Create values (metric values) - convert string to number for CSV
    const values = validMetrics.map(
      (metric) => `"${Number(metric.value) || 0}"`
    );

    // Create CSV with only one row of data
    const csvContent = [
      headers.join(","), // Header row
      values.join(",") // Single data row
    ].join("\n");

    return csvContent;
  };

  const handleSubmit = async (
    values: {
      application_name: string;
      application_id: string;
      use_case: string;
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      // Validate that at least one metric has a value
      const metricsWithValues = metricsData.filter(
        (metric) => String(metric.value).trim() !== ""
      );
      if (metricsWithValues.length === 0) {
        toast.error("Please enter at least one metric value");
        setSubmitting(false);
        return;
      }

      // Validate that all entered values are valid numbers
      const invalidMetrics = metricsWithValues.filter(
        (metric) =>
          isNaN(Number(metric.value)) ||
          Number(metric.value) < 0 ||
          Number(metric.value) > 100
      );
      if (invalidMetrics.length > 0) {
        toast.error("Metric values must be numbers between 0 and 100");
        setSubmitting(false);
        return;
      }

      const csvContent = convertToCSV();
      if (!csvContent) {
        toast.error("No valid metrics to submit");
        setSubmitting(false);
        return;
      }

      const csvBlob = new Blob([csvContent], { type: "text/csv" });
      const csvFile = new File([csvBlob], "custom_metrics.csv", {
        type: "text/csv"
      });

      const formDataToSend = new FormData();
      const submitData: {
        application_name: string;
        resource_name: string;
        eval_provider: string;
        use_case: string;
        application_id?: string;
      } = {
        application_name: values.application_id
          ? values.application_name
          : values.application_name,
        resource_name: values.application_id
          ? values.application_id
          : values.application_name,
        eval_provider: selectedProvider,
        use_case: values.use_case
      };

      if (values.application_id) {
        submitData.application_id = values.application_id;
      }

      formDataToSend.append("metric_ingest_data", JSON.stringify(submitData));
      formDataToSend.append("file", csvFile);

      const response = await mutation("ai-metrics/upload-csv", {
        method: "POST",
        body: formDataToSend,
        isFormData: true
      });

      if (response?.status === 201 || response?.status === 202) {
        toast.success(
          `${selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)} metrics submitted successfully!`
        );
        onFormSubmit?.();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while submitting metrics"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (applicationsValidating || isLoadingMetrics) {
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
                {isLoadingMetrics
                  ? `Loading ${selectedProvider} metrics...`
                  : "We're setting up everything you need..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-4 mx-auto my-6 w-full max-w-6xl duration-500">
      <div className="relative overflow-hidden rounded-xl bg-tertiary-500/5">
        <div className="absolute right-2 top-2 z-999">
          <button
            onClick={onCancel}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-tertiary transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!showApplicationQuestion && (
          <div className="absolute left-2 top-2 z-999">
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
          {/* Step 1: Application Question */}
          {showApplicationQuestion && hasApplications && (
            <div className="animate-in fade-in-50 slide-in-from-bottom-4 space-y-6 text-center duration-500">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Custom{" "}
                  {selectedProvider.charAt(0).toUpperCase() +
                    selectedProvider.slice(1)}{" "}
                  Metrics Configuration
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
                  disabled={!hasApplications}
                  className={`w-fit flex-1 rounded-md px-4 py-2 font-semibold transition-all duration-300 ${
                    hasApplications
                      ? "text-nowrap bg-tertiary-500 text-white shadow-lg hover:bg-tertiary-600 hover:shadow-xl"
                      : "cursor-not-allowed bg-gray-300 text-gray-500"
                  }`}
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
                  {!hasApplications && (
                    <p className="mt-1 text-xs opacity-75">
                      No applications found
                    </p>
                  )}
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

          {/* Step 2: Form with Metrics Table */}
          {!showApplicationQuestion && hasExistingApplication !== null && (
            <div className="animate-in fade-in-50 slide-in-from-right-4 duration-500">
              <div className="mb-6 text-center">
                <p className="w-full text-center font-semibold text-tertiary">
                  Fill in the details and configure your {selectedProvider}{" "}
                  metrics
                </p>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={CustomMetricSchema({
                  hasExistingApplication
                })}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, setFieldValue, isSubmitting }) => (
                  <Form className="space-y-6">
                    {/* Application Fields */}
                    <div className="grid grid-cols-1 gap-6">
                      {hasExistingApplication ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Select Application{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field name="application_id">
                            {({ field, meta }: FieldProps) => (
                              <select
                                {...field}
                                className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:border-tertiary-500 focus:outline-none focus:ring-4 focus:ring-tertiary-500/20 dark:bg-gray-800/50 dark:text-white ${
                                  meta.touched && meta.error
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                <option value="">Select an application</option>
                                {applicationsData?.applications?.map(
                                  (app: {
                                    application_id: string;
                                    name: string;
                                  }) => (
                                    <option
                                      key={app.application_id}
                                      value={app.application_id}
                                    >
                                      {app.name}
                                    </option>
                                  )
                                )}
                              </select>
                            )}
                          </Field>
                          <ErrorMessage name="application_id">
                            {(msg) => (
                              <div className="mt-1 text-sm text-red-500">
                                {msg}
                              </div>
                            )}
                          </ErrorMessage>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Application Name{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field name="application_name">
                            {({ field, meta }: FieldProps) => (
                              <input
                                {...field}
                                type="text"
                                placeholder="Enter application name..."
                                className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:border-tertiary-500 focus:outline-none focus:ring-4 focus:ring-tertiary-500/20 dark:bg-gray-800/50 dark:text-white ${
                                  meta.touched && meta.error
                                    ? "border-red-500 dark:border-red-500"
                                    : "border-gray-300 dark:border-gray-600"
                                }`}
                              />
                            )}
                          </Field>
                          <ErrorMessage name="application_name">
                            {(msg) => (
                              <div className="mt-1 text-sm text-red-500">
                                {msg}
                              </div>
                            )}
                          </ErrorMessage>
                        </div>
                      )}

                      {/* <div className="space-y-2">
                        <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Use Case <span className="text-red-500">*</span>
                        </span>
                        <Field name="use_case">
                          {({ field, meta }: FieldProps) => (
                            <select
                              {...field}
                              disabled={
                                hasExistingApplication &&
                                values.application_id !== ""
                              }
                              className={`w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 focus:border-tertiary-500 focus:outline-none focus:ring-4 focus:ring-tertiary-500/20 dark:bg-gray-800/50 dark:text-white ${
                                meta.touched && meta.error
                                  ? "border-red-500 dark:border-red-500"
                                  : "border-gray-300 dark:border-gray-600"
                              } ${
                                hasExistingApplication &&
                                values.application_id !== ""
                                  ? "cursor-not-allowed bg-gray-100 opacity-75 dark:bg-gray-700"
                                  : ""
                              }`}
                            >
                              {useCaseOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </Field>
                        <ErrorMessage name="use_case">
                          {(msg) => (
                            <div className="mt-1 text-sm text-red-500">
                              {msg}
                            </div>
                          )}
                        </ErrorMessage>
                      </div> */}
                    </div>

                    {/* Auto-populate fields */}
                    <Field name="application_id">
                      {({ field }: FieldProps) => {
                        if (
                          hasExistingApplication &&
                          field.value &&
                          applicationsData?.applications
                        ) {
                          const selectedApp =
                            applicationsData.applications.find(
                              (app: {
                                application_id: string;
                                name: string;
                                use_case_type: string;
                              }) => app.application_id === field.value
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

                    {/* Metrics Table */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          Configure{" "}
                          {selectedProvider.charAt(0).toUpperCase() +
                            selectedProvider.slice(1)}{" "}
                          Metrics
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {
                            metricsData.filter(
                              (m) => m.value && m.value !== "0"
                            ).length
                          }{" "}
                          of {metricsData.length} metrics configured
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="w-full bg-white dark:bg-gray-800">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Metric Name
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Description
                              </th>
                              <th className="text-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Value{" "}
                                <span className="text-nowrap text-xs">
                                  (must be 0-100)
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {metricsData.map((metric) => (
                              <tr
                                key={metric.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <td className="px-4 py-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {metric.metric_name}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {metric.description}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    value={metric.value}
                                    onChange={(e) =>
                                      handleMetricValueChange(
                                        metric.id,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter value (0-100)"
                                    className={`w-full rounded-lg border px-3 py-2 focus:border-tertiary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500/20 dark:bg-gray-800 dark:text-white ${
                                      metric.value &&
                                      (isNaN(Number(metric.value)) ||
                                        Number(metric.value) < 0 ||
                                        Number(metric.value) > 100)
                                        ? "border-red-500"
                                        : "border-gray-300 dark:border-gray-600"
                                    }`}
                                  />
                                  {metric.value &&
                                    (isNaN(Number(metric.value)) ||
                                      Number(metric.value) < 0 ||
                                      Number(metric.value) > 100) && (
                                      <div className="mt-1 text-xs text-red-500">
                                        Value must be between 0 and 100
                                      </div>
                                    )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {metricsData.length === 0 && (
                        <div className="py-8 text-center">
                          <div className="mb-2 text-gray-500 dark:text-gray-400">
                            No metrics template found for {selectedProvider}
                          </div>
                          <div className="text-sm text-gray-400 dark:text-gray-500">
                            Please ensure the template is available or contact
                            support
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-6">
                      <CustomButton
                        type="submit"
                        disabled={
                          isSubmitting ||
                          metricsData.length === 0 ||
                          metricsData.filter((m) => m.value && m.value !== "0")
                            .length === 0
                        }
                        loading={isSubmitting}
                        loadingText="Submitting..."
                      >
                        Submit{" "}
                        {selectedProvider.charAt(0).toUpperCase() +
                          selectedProvider.slice(1)}{" "}
                        Metrics
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

export default CustomMetricsFormComponent;
