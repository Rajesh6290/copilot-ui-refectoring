"use client";
import React from "react";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Agent, Dataset, Model } from "../../types/overview.types";
import { useEditValidation } from "../../hooks/useEditValidation";
import { useEditSubmission } from "../../hooks/useEditSubmission";
import { useAssetFormOptions } from "../../hooks/useAssetFormOptions";
import CustomMultiSelect from "@/shared/core/CustomMultiSelect";
import CustomButton from "@/shared/core/CustomButton";

interface EditDialogsProps {
  showModelDialog: boolean;
  setShowModelDialog: (show: boolean) => void;
  showDatasetDialog: boolean;
  setShowDatasetDialog: (show: boolean) => void;
  showAgentDialog: boolean;
  setShowAgentDialog: (show: boolean) => void;
  selectedModel: Model | null;
  selectedDataset: Dataset | null;
  selectedAgent: Agent | null;
  isEditMode: boolean;
  mutate: () => void;
}

const EditDialogs: React.FC<EditDialogsProps> = ({
  showModelDialog,
  setShowModelDialog,
  showDatasetDialog,
  setShowDatasetDialog,
  showAgentDialog,
  setShowAgentDialog,
  selectedModel,
  selectedDataset,
  selectedAgent,
  isEditMode,
  mutate
}) => {
  // Custom hooks
  const {
    ModelValidationSchema,
    AgentValidationSchema,
    DatasetValidationSchema,
    getModelInitialValues,
    getAgentInitialValues,
    getDatasetInitialValues
  } = useEditValidation(
    selectedModel,
    selectedAgent,
    selectedDataset,
    isEditMode
  );

  const {
    handleSubmitEditModel,
    handleSubmitEditAgent,
    handleSubmitEditDataset,
    isLoading: isEditLoading
  } = useEditSubmission({
    selectedModel,
    selectedAgent,
    selectedDataset,
    setShowModelDialog,
    setShowAgentDialog,
    setShowDatasetDialog,
    mutate
  });

  const {
    complianceStatusOptions,
    modelTypeOptions,
    dataSourcesOptions,
    usedForOptions,
    preprocessingStepsOptions
  } = useAssetFormOptions();

  return (
    <>
      {/* Model Edit Dialog */}
      <Dialog
        open={showModelDialog}
        onClose={() => setShowModelDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "bg-white dark:bg-darkSidebarBackground rounded-lg"
        }}
      >
        <DialogTitle className="border-b border-gray-200 dark:border-neutral-700">
          <span className="text-gray-900 dark:text-white">Edit Model</span>
        </DialogTitle>
        <Formik
          initialValues={getModelInitialValues()}
          validationSchema={ModelValidationSchema}
          onSubmit={handleSubmitEditModel}
          enableReinitialize={true}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Model Name <span className="text-red-500">*</span>
                      </span>
                      <Field
                        type="text"
                        name="model_name"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="model_name"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description <span className="text-red-500">*</span>
                      </span>
                      <Field
                        as="textarea"
                        name="model_description"
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="model_description"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Model Type <span className="text-red-500">*</span>
                      </span>
                      <Field
                        as="select"
                        name="model_type"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
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
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fine Tuned <span className="text-red-500">*</span>
                      </span>
                      <div className="flex space-x-4">
                        {["Yes", "No"].map((option) => (
                          <label
                            key={option}
                            className="flex items-center space-x-2"
                          >
                            <Field
                              type="radio"
                              name="fine_tuned"
                              value={option === "Yes" ? "true" : "false"}
                              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-neutral-700"
                            />
                            <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                      <ErrorMessage
                        name="fine_tuned"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Provider <span className="text-red-500">*</span>
                      </span>
                      <Field
                        type="text"
                        name="provider"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="provider"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Version <span className="text-red-500">*</span>
                      </span>
                      <Field
                        type="text"
                        name="model_version"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="model_version"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Model Status <span className="text-red-500">*</span>
                      </span>
                      <Field
                        as="select"
                        name="model_status"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
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
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Evaluation Metrics
                      </span>
                      <Field
                        type="text"
                        name="eval_metrics"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="eval_metrics"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogActions className="border-t border-gray-200 p-4 dark:border-gray-700">
                <CustomButton
                  type="button"
                  onClick={() => setShowModelDialog(false)}
                  disabled={isSubmitting || isEditLoading}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  disabled={isSubmitting || isEditLoading}
                  loading={isSubmitting || isEditLoading}
                  loadingText="Updating..."
                >
                  Update Model
                </CustomButton>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Agent Edit Dialog */}
      <Dialog
        open={showAgentDialog}
        onClose={() => setShowAgentDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "bg-white dark:bg-darkSidebarBackground rounded-lg"
        }}
      >
        <DialogTitle className="border-b border-gray-200 dark:border-neutral-700">
          <span className="text-gray-900 dark:text-white">Edit Agent</span>
        </DialogTitle>
        <Formik
          initialValues={getAgentInitialValues()}
          validationSchema={AgentValidationSchema}
          onSubmit={handleSubmitEditAgent}
          enableReinitialize={true}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Agent Name <span className="text-red-500">*</span>
                      </span>
                      <Field
                        type="text"
                        name="agent_name"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="agent_name"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Purpose <span className="text-red-500">*</span>
                      </span>
                      <Field
                        as="textarea"
                        name="purpose"
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="purpose"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Human In Loop
                      </span>
                      <div className="flex space-x-4">
                        {["yes", "no"].map((option) => (
                          <label
                            key={option}
                            className="flex items-center space-x-2"
                          >
                            <Field
                              type="radio"
                              name="human_in_loop"
                              value={option === "yes" ? "true" : "false"}
                              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-neutral-700"
                            />
                            <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Version <span className="text-red-500">*</span>
                      </span>
                      <Field
                        type="text"
                        name="version"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="version"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Agent Capabilities{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="action_supported"
                        placeholder="Enter agent capability (e.g., classification, generation, etc.)"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="action_supported"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Is Active
                      </span>
                      <div className="flex space-x-4">
                        {["yes", "no"].map((option) => (
                          <label
                            key={option}
                            className="flex items-center space-x-2"
                          >
                            <Field
                              type="radio"
                              name="is_active"
                              value={option === "yes" ? "true" : "false"}
                              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-neutral-700"
                            />
                            <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogActions className="border-t border-gray-200 p-4 dark:border-gray-700">
                <CustomButton
                  type="button"
                  onClick={() => setShowAgentDialog(false)}
                  disabled={isSubmitting || isEditLoading}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  disabled={isSubmitting || isEditLoading}
                  loading={isSubmitting || isEditLoading}
                  loadingText="Updating..."
                >
                  Update Agent
                </CustomButton>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Dataset Edit Dialog */}
      <Dialog
        open={showDatasetDialog}
        onClose={() => setShowDatasetDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "bg-white dark:bg-darkSidebarBackground rounded-lg"
        }}
      >
        <DialogTitle className="border-b border-gray-200 dark:border-neutral-700">
          <span className="text-gray-900 dark:text-white">Edit Dataset</span>
        </DialogTitle>
        <Formik
          initialValues={getDatasetInitialValues()}
          validationSchema={DatasetValidationSchema}
          onSubmit={handleSubmitEditDataset}
          enableReinitialize={true}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dataset Name <span className="text-red-500">*</span>
                      </span>
                      <Field
                        type="text"
                        name="name"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Version <span className="text-red-500">*</span>
                      </span>
                      <Field
                        type="text"
                        name="dataset_version"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="dataset_version"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Size (GB)
                      </span>
                      <Field
                        type="number"
                        name="size_in_gb"
                        step="0.1"
                        min="0"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      />
                      <ErrorMessage
                        name="size_in_gb"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Preprocessing Steps
                      </span>
                      <Field
                        name="preprocessing_steps"
                        component={CustomMultiSelect}
                        options={preprocessingStepsOptions}
                      />
                      <ErrorMessage
                        name="preprocessing_steps"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div className="mb-4">
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Data Source <span className="text-red-500">*</span>
                      </span>
                      <Field
                        as="select"
                        name="data_sources"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Select Data Source</option>
                        {dataSourcesOptions.map((item, index) => (
                          <option key={index} value={item.value}>
                            {item.label}
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
                      <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Used For <span className="text-red-500">*</span>
                      </span>
                      <Field
                        as="select"
                        name="used_for"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Select Used For</option>
                        {usedForOptions.map((item, index) => (
                          <option key={index} value={item.value}>
                            {item.label}
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
              </div>
              <DialogActions className="border-t border-gray-200 p-4 dark:border-gray-700">
                <CustomButton
                  type="button"
                  onClick={() => setShowDatasetDialog(false)}
                  disabled={isSubmitting || isEditLoading}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  type="submit"
                  disabled={isSubmitting || isEditLoading}
                  loading={isSubmitting || isEditLoading}
                  loadingText="Updating..."
                >
                  Update Dataset
                </CustomButton>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default EditDialogs;
