import CustomButton from "@/shared/core/CustomButton";
import { Dialog, Tooltip } from "@mui/material";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { motion } from "framer-motion";
import { Check, Save, X } from "lucide-react";
import dynamic from "next/dynamic";
import React from "react";
import Application, {
  AgentFormValues,
  DatasetFormValues,
  ModelFormValues
} from "./Application";
const CustomMultiSelect = dynamic(
  () => import("@/shared/core/CustomMultiSelect"),
  {
    ssr: false
  }
);

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};
const modelTypeOptions = [
  { value: "generative", label: "Generative" },
  { value: "predictive", label: "Predictive" },
  { value: "other", label: "Other" }
];

const complianceStatusOptions = [
  { value: "ccpa_compliant", label: "CCPA Compliant" },
  { value: "hipaa_compliant", label: "HIPAA Compliant" },
  { value: "iso_27001", label: "ISO 27001" },
  { value: "soc_2", label: "SOC 2" },
  { value: "not_assessed", label: "Not Assessed" },
  { value: "euro_ai", label: "EURO AI" },
  { value: "nist", label: "NIST" },
  { value: "internally_evaluated", label: "Internally Evaluated" }
];

const dataSourcesOptions = [
  { value: "internal", label: "Internal" },
  { value: "public", label: "Public" },
  { value: "third_party", label: "Third-party" }
];

const usedForOptions = [
  { value: "training", label: "Training" },
  { value: "validation", label: "Validation" },
  { value: "testing", label: "Testing" },
  { value: "rag", label: "RAG" },
  { value: "fine-tuning", label: "Fine-Tuning" },
  { value: "other", label: "Other" }
];

const AssetCreationDialog = ({
  isLoading,
  anotherDatasetLoading,
  showAssetDialog,
  closeAssetDialog,
  assetCreationMode,
  activeStep,
  getSteps,
  getStepInitialValues,
  getStepValidationSchema,
  handleSubmitAgent,
  handleSubmitAgentOnly,
  handleSubmitModel,
  handleSubmitModelWithoutDataset,
  handleSubmitDataset,
  handleAddAnotherDataset,
  selectedApplicationForAsset
}: {
  isLoading: boolean;
  anotherDatasetLoading: boolean;
  showAssetDialog: boolean;
  closeAssetDialog: () => void;
  assetCreationMode: "agent" | "direct" | null;
  activeStep: number;
  getSteps: () => string[];
  getStepInitialValues: (step: number) => object;
  getStepValidationSchema: (step: number) => object;
  handleSubmitAgent: (
    values: AgentFormValues,
    formikBag: FormikHelpers<AgentFormValues>
  ) => void;
  handleSubmitAgentOnly: (
    values: AgentFormValues,
    formikBag: FormikHelpers<AgentFormValues>
  ) => void;
  handleSubmitModel: (
    values: ModelFormValues,
    formikBag: FormikHelpers<ModelFormValues>
  ) => void;
  handleSubmitModelWithoutDataset: (
    values: ModelFormValues,
    formikBag: FormikHelpers<ModelFormValues>
  ) => void;
  handleSubmitDataset: (
    values: DatasetFormValues,
    formikBag: FormikHelpers<DatasetFormValues>
  ) => void;
  handleAddAnotherDataset: (
    values: DatasetFormValues,
    formikBag: FormikHelpers<DatasetFormValues>,
    resetForm: () => void
  ) => void;
  selectedApplicationForAsset: Application | null;
}) => {
  return (
    <Dialog
      open={showAssetDialog}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-darkSidebarBackground rounded-lg"
      }}
      onClose={closeAssetDialog}
    >
      <div className="flex h-full max-h-[90vh] flex-col">
        {/* Dialog Header */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {assetCreationMode === "agent"
                  ? "Add Assets with Agent"
                  : "Add Assets Directly"}
              </h2>
              {selectedApplicationForAsset && (
                <p className="mt-1 text-sm text-gray-500">
                  Application: {selectedApplicationForAsset.name}
                </p>
              )}
            </div>
            <button
              onClick={closeAssetDialog}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="mt-6">
            <motion.div
              className="mb-10"
              initial="initial"
              animate="animate"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-wrap items-center justify-center md:flex-nowrap">
                {getSteps().map((step, index) => (
                  <React.Fragment key={step}>
                    <motion.div
                      className="mb-4 flex flex-col items-center md:mb-0"
                      animate={
                        index === activeStep ? { scale: 1.1 } : { scale: 1 }
                      }
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div
                        className={`flex size-10 items-center justify-center rounded-full transition-all duration-300 ${
                          index < activeStep
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg dark:from-blue-500 dark:to-indigo-500"
                            : index === activeStep
                              ? "border-2 border-indigo-600 bg-white text-indigo-600 shadow-lg dark:border-indigo-500 dark:bg-gray-800 dark:text-indigo-400"
                              : "border-2 border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {index < activeStep ? (
                          <Check className="size-5 text-white" />
                        ) : (
                          <span className="text-base font-semibold">
                            {index + 1}
                          </span>
                        )}
                      </motion.div>
                      <div className="mt-3 text-center">
                        <span
                          className={`text-xs font-semibold ${
                            index <= activeStep
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    </motion.div>
                    {index < getSteps().length - 1 && (
                      <div className="mx-2 hidden w-24 md:block">
                        <motion.div
                          className={`h-1 rounded-full transition-all duration-500 ${
                            index < activeStep
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Agent Form */}
          {assetCreationMode === "agent" && activeStep === 0 && (
            <Formik
              initialValues={getStepInitialValues(0) as AgentFormValues}
              validationSchema={getStepValidationSchema(0)}
              onSubmit={handleSubmitAgent}
            >
              {({ isSubmitting, touched, errors, values, ...formikBag }) => (
                <Form className="h-full">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <div className="mb-4">
                        <label
                          htmlFor="agent_name"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Agent Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="agent_name"
                          className={`w-full rounded-md border ${
                            touched.agent_name && errors.agent_name
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        />
                        <ErrorMessage
                          name="agent_name"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="purpose"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Purpose <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="textarea"
                          name="purpose"
                          rows={1}
                          className={`w-full rounded-md border ${
                            touched.purpose && errors.purpose
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        />
                        <ErrorMessage
                          name="purpose"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <label
                          htmlFor="version"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Version <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="version"
                          className={`w-full rounded-md border ${
                            touched.version && errors.version
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        />
                        <ErrorMessage
                          name="version"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="action_supported"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Agent Capabilities{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="action_supported"
                          placeholder="Enter capabilities separated by commas (e.g., classification, generation, other)"
                          className={`w-full rounded-md border ${
                            touched.action_supported && errors.action_supported
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const value = e.target.value;
                            const arrayValue = value
                              .split(",")
                              .map((item) => item.trim())
                              .filter((item) => item.length > 0);
                            formikBag.setFieldValue(
                              "action_supported",
                              arrayValue
                            );
                          }}
                          value={values.action_supported?.join(", ") || ""}
                        />
                        <ErrorMessage
                          name="action_supported"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hidden buttons for form submission */}
                  <div className="hidden">
                    <button
                      id="save-agent-only"
                      type="button"
                      onClick={() => handleSubmitAgentOnly(values, formikBag)}
                    >
                      Save Agent Only
                    </button>
                    <button type="submit">Submit and Next</button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Model Form */}
          {((assetCreationMode === "agent" && activeStep === 1) ||
            (assetCreationMode === "direct" && activeStep === 0)) && (
            <Formik
              initialValues={
                getStepInitialValues(
                  assetCreationMode === "agent" ? 1 : 0
                ) as ModelFormValues
              }
              validationSchema={getStepValidationSchema(
                assetCreationMode === "agent" ? 1 : 0
              )}
              onSubmit={handleSubmitModel}
            >
              {({ isSubmitting, touched, errors, values, ...formikBag }) => (
                <Form className="h-full">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <div className="mb-4">
                        <label
                          htmlFor="model_name"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Model Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="model_name"
                          className={`w-full rounded-md border ${
                            touched.model_name && errors.model_name
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        />
                        <ErrorMessage
                          name="model_name"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="model_description"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Description <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="textarea"
                          name="model_description"
                          rows={4}
                          className={`w-full rounded-md border ${
                            touched.model_description &&
                            errors.model_description
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        />
                        <ErrorMessage
                          name="model_description"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="model_type"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Model Type <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="model_type"
                          className={`w-full rounded-md border ${
                            touched.model_type && errors.model_type
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        >
                          <option value="">Select Model Type</option>
                          {modelTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="model_type"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <label
                          htmlFor="provider"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Model Owner / Vendor{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="provider"
                          className={`w-full rounded-md border ${
                            touched.provider && errors.provider
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        />
                        <ErrorMessage
                          name="provider"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="model_version"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Version <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="model_version"
                          className={`w-full rounded-md border ${
                            touched.model_version && errors.model_version
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        />
                        <ErrorMessage
                          name="model_version"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="model_status"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Model Status <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="model_status"
                          className={`w-full rounded-md border ${
                            touched.model_status && errors.model_status
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        >
                          <option value="">Select Model Status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </Field>
                        <ErrorMessage
                          name="model_status"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="compliance_status"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Compliance Status{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="compliance_status"
                          component={CustomMultiSelect}
                          options={complianceStatusOptions}
                        />
                        <ErrorMessage
                          name="compliance_status"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hidden buttons for form submission */}
                  <div className="hidden">
                    <button
                      id="skip-dataset"
                      type="button"
                      onClick={() =>
                        handleSubmitModelWithoutDataset(values, formikBag)
                      }
                    >
                      Proceed without Dataset
                    </button>
                    <button type="submit">Submit and Next</button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Dataset Form */}
          {((assetCreationMode === "agent" && activeStep === 2) ||
            (assetCreationMode === "direct" && activeStep === 1)) && (
            <Formik
              initialValues={
                getStepInitialValues(
                  assetCreationMode === "agent" ? 2 : 1
                ) as DatasetFormValues
              }
              validationSchema={getStepValidationSchema(
                assetCreationMode === "agent" ? 2 : 1
              )}
              onSubmit={handleSubmitDataset}
            >
              {({ resetForm, touched, errors, values, ...formikBag }) => (
                <Form className="h-full">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <div className="mb-4">
                        <label
                          htmlFor="name"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Dataset Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="name"
                          className={`w-full rounded-md border ${
                            touched.name && errors.name
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="dataset_version"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Version <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="dataset_version"
                          className={`w-full rounded-md border ${
                            touched.dataset_version && errors.dataset_version
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        />
                        <ErrorMessage
                          name="dataset_version"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="contains_sensitive_data"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Contains Sensitive Data{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-4">
                          {["yes", "no"].map((option) => (
                            <label
                              key={option}
                              className="flex items-center space-x-2"
                            >
                              <Field
                                type="radio"
                                name="contains_sensitive_data"
                                value={option === "yes" ? "true" : "false"}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-neutral-700"
                              />
                              <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                        <ErrorMessage
                          name="contains_sensitive_data"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <label
                          htmlFor="data_sources"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Data Source <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="data_sources"
                          className={`w-full rounded-md border ${
                            touched.data_sources && errors.data_sources
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        >
                          <option value="">Select Data Source</option>
                          {dataSourcesOptions?.map((item, index) => (
                            <option key={index} value={item?.value}>
                              {item?.label}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="data_sources"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="used_for"
                          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Used For <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="used_for"
                          className={`w-full rounded-md border ${
                            touched.used_for && errors.used_for
                              ? "border-red-500"
                              : "border-gray-300 dark:border-neutral-700"
                          } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white`}
                        >
                          <option value="">Select Data Source</option>
                          {usedForOptions?.map((item, index) => (
                            <option key={index} value={item?.value}>
                              {item?.label}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="used_for"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hidden buttons for form submission */}
                  <div className="hidden">
                    <button
                      id="add-another-dataset"
                      type="button"
                      onClick={() =>
                        handleAddAnotherDataset(
                          values,
                          {
                            setSubmitting: formikBag.setSubmitting,
                            resetForm: resetForm,
                            setFieldError: formikBag.setFieldError,
                            setFieldTouched: formikBag.setFieldTouched,
                            setFieldValue: formikBag.setFieldValue,
                            setErrors: formikBag.setErrors,
                            setStatus: formikBag.setStatus,
                            setTouched: formikBag.setTouched,
                            setValues: formikBag.setValues,
                            validateField: formikBag.validateField,
                            validateForm: formikBag.validateForm
                          } as FormikHelpers<DatasetFormValues>,
                          resetForm
                        )
                      }
                    >
                      Add Another Dataset
                    </button>
                    <button type="submit">Submit</button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-darkMainBackground">
          <div className="flex w-full items-center justify-end space-x-3">
            {activeStep > 0 && (
              <button
                type="button"
                onClick={closeAssetDialog}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Tooltip
                  title="This just cancels your current step. Previous updates stay saved."
                  placement="top"
                  arrow
                >
                  <span>Cancel</span>
                </Tooltip>
              </button>
            )}

            {/* Agent step buttons: Save Only and Save & Next */}
            {assetCreationMode === "agent" && activeStep === 0 && (
              <>
                <CustomButton
                  type="button"
                  className="w-fit text-nowrap"
                  startIcon={<Save size={16} />}
                  onClick={() => {
                    const saveAgentOnlyBtn =
                      document.getElementById("save-agent-only");
                    if (saveAgentOnlyBtn) {
                      saveAgentOnlyBtn.click();
                    }
                  }}
                >
                  Save Agent Only
                </CustomButton>
                <CustomButton
                  type="submit"
                  loading={isLoading}
                  loadingText="Saving..."
                  className="w-fit text-nowrap"
                  startIcon={<Save size={16} />}
                  onClick={() => {
                    const form = document.querySelector("form");
                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                >
                  Save & Next
                </CustomButton>
              </>
            )}

            {/* Model step buttons: Next and Proceed without Dataset */}
            {((assetCreationMode === "agent" && activeStep === 1) ||
              (assetCreationMode === "direct" && activeStep === 0)) && (
              <>
                <CustomButton
                  type="button"
                  className="w-fit text-nowrap"
                  startIcon={<Save size={16} />}
                  onClick={() => {
                    const skipDatasetBtn =
                      document.getElementById("skip-dataset");
                    if (skipDatasetBtn) {
                      skipDatasetBtn.click();
                    }
                  }}
                >
                  Save without Dataset
                </CustomButton>
                <CustomButton
                  type="submit"
                  loading={isLoading}
                  loadingText="Saving..."
                  className="w-fit"
                  startIcon={<Save size={16} />}
                  onClick={() => {
                    const form = document.querySelector("form");
                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                >
                  Next
                </CustomButton>
              </>
            )}

            {/* Dataset step buttons: Add Another Dataset and Save */}
            {((assetCreationMode === "agent" && activeStep === 2) ||
              (assetCreationMode === "direct" && activeStep === 1)) && (
              <>
                <CustomButton
                  type="button"
                  loading={anotherDatasetLoading}
                  loadingText="Saving..."
                  className="w-fit"
                  startIcon={<Save size={16} />}
                  onClick={() => {
                    const anotherDataset = document.getElementById(
                      "add-another-dataset"
                    );
                    if (anotherDataset) {
                      anotherDataset.click();
                    }
                  }}
                >
                  Add Another Dataset
                </CustomButton>
                <CustomButton
                  type="submit"
                  loading={isLoading && !anotherDatasetLoading}
                  loadingText="Saving..."
                  className="w-fit"
                  startIcon={<Save size={16} />}
                  onClick={() => {
                    const form = document.querySelector("form");
                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                >
                  Save
                </CustomButton>
              </>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AssetCreationDialog;
