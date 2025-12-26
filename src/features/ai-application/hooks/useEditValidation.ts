
import * as Yup from "yup";
import { Agent, Dataset, Model } from "../types/overview.types";

export const useEditValidation = (
  selectedModel: Model | null,
  selectedAgent: Agent | null,
  selectedDataset: Dataset | null,
  isEditMode: boolean,
) => {
  const ModelValidationSchema = Yup.object().shape({
    model_name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be less than 50 characters")
      .required("Model name is required"),
    model_description: Yup.string()
      .min(10, "Description must be at least 10 characters")
      .required("Model description is required"),
    model_type: Yup.string().required("Model type is required"),
    provider: Yup.string()
      .min(2, "Provider name must be at least 2 characters")
      .required("Provider is required"),
    model_version: Yup.string().required("Version is required"),
    model_status: Yup.string().required("Model status is required"),
    compliance_status: Yup.array()
      .of(Yup.string())
      .min(1, "Select at least one compliance status")
      .required("Compliance status is required"),
    fine_tuned: Yup.boolean().required("Fine-tuned status is required"),
    eval_metrics: Yup.string(),
  });

  const DatasetValidationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be less than 50 characters")
      .required("Dataset name is required"),
    dataset_version: Yup.string().required("Version is required"),
    contains_sensitive_data: Yup.string().required(
      "Please select if dataset contains sensitive data",
    ),
    data_sources: Yup.string().required("Data source is required"),
    used_for: Yup.string().required("Used for is required"),
    size_in_gb: Yup.number()
      .nullable()
      .min(0, "Size cannot be negative")
      .optional(),
    preprocessing_steps: Yup.array().of(Yup.string()).nullable().optional(),
  });

  const AgentValidationSchema = Yup.object().shape({
    agent_name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be less than 50 characters")
      .required("Agent name is required"),
    purpose: Yup.string()
      .min(10, "Purpose must be at least 10 characters")
      .required("Purpose is required"),
    version: Yup.string().required("Version is required"),
    action_supported: Yup.string()
      .min(1, "Agent capability is required")
      .required("Agent capability is required"),
    human_in_loop: Yup.boolean().optional(),
    is_active: Yup.boolean().optional(),
  });

  const getModelInitialValues = () => {
    if (selectedModel && isEditMode) {
      let complianceStatus: string[] = [];
      if (Array.isArray(selectedModel.compliance_status)) {
        complianceStatus = selectedModel.compliance_status.filter(Boolean);
      } else if (selectedModel.compliance_status) {
        complianceStatus = [selectedModel.compliance_status];
      }
      return {
        model_name: selectedModel.model_name || "",
        model_description: selectedModel.model_description || "",
        model_type: selectedModel.model_type || "",
        provider: selectedModel.provider || "",
        model_version: selectedModel.model_version || "1.0.0",
        model_status: selectedModel.model_status || "",
        compliance_status: complianceStatus,
        fine_tuned: selectedModel.fine_tuned ? "true" : "false",
        eval_metrics: selectedModel.eval_metrics || "",
      };
    }
    return {
      model_name: "",
      model_description: "",
      model_type: "",
      provider: "",
      model_version: "1.0.0",
      model_status: "",
      compliance_status: [],
      fine_tuned: "false",
      eval_metrics: "",
    };
  };

  const getAgentInitialValues = () => {
    if (selectedAgent && isEditMode) {
      return {
        agent_name: selectedAgent.agent_name || "",
        purpose: selectedAgent.purpose || "",
        version: selectedAgent.version || "1.0.0",
        action_supported: Array.isArray(selectedAgent.action_supported)
          ? selectedAgent.action_supported[0] || ""
          : selectedAgent.action_supported || "",
        human_in_loop: String(selectedAgent.human_in_loop ?? false),
        is_active: String(selectedAgent.is_active ?? false),
      };
    }
    return {
      agent_name: "",
      purpose: "",
      version: "1.0.0",
      action_supported: "",
      human_in_loop: "false",
      is_active: "false",
    };
  };

  const getDatasetInitialValues = () => {
    if (selectedDataset && isEditMode) {
      return {
        name: selectedDataset.name || "",
        dataset_version: selectedDataset.dataset_version || "1.0.0",
        contains_sensitive_data: selectedDataset.contains_sensitive_data
          ? "true"
          : "false",
        data_sources: selectedDataset.data_sources || "",
        used_for: selectedDataset.used_for || "",
        size_in_gb: selectedDataset.size_in_gb || null,
        preprocessing_steps: selectedDataset.preprocessing_steps || [],
      };
    }
    return {
      name: "",
      dataset_version: "1.0.0",
      contains_sensitive_data: "false",
      data_sources: "",
      used_for: "",
      size_in_gb: null,
      preprocessing_steps: [],
    };
  };

  return {
    ModelValidationSchema,
    DatasetValidationSchema,
    AgentValidationSchema,
    getModelInitialValues,
    getAgentInitialValues,
    getDatasetInitialValues,
  };
};
