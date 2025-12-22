import * as Yup from "yup";
const NewApplicationValidationSchema = Yup.object({
  name: Yup.string()
    .required("AI Application Name is required")
    .min(3, "AI Application Name must be at least 3 characters")
    .max(50, "AI Application Name must be less than 50 characters"),
  version: Yup.string()
    .required("Version is required")
    .matches(
      /^\d+\.\d+\.\d+$/,
      "Version must be in format X.Y.Z (e.g., 1.0.0)",
    ),
  purpose: Yup.string()
    .required("Purpose is required")
    .max(500, "Purpose must be less than 500 characters"),
  owner_name: Yup.string()
    .required("Owner is required")
    .min(2, "Owner name must be at least 2 characters"),
  use_case_type: Yup.string().required("Use Case Type is required"),
  department: Yup.string()
    .max(100, "Department must be less than 100 characters")
    .optional(),
  sensitivity: Yup.string()
    .oneOf(
      ["low", "medium", "high"],
      "Sensitivity must be Low, Medium, or High",
    )
    .optional(),
  compliance_status: Yup.array().optional(),
  risk_level: Yup.string().optional(),
});

const AgentValidationSchema = Yup.object({
  agent_name: Yup.string()
    .required("Agent Name is required")
    .min(3, "Agent Name must be at least 3 characters"),
  purpose: Yup.string()
    .required("Purpose is required")
    .max(500, "Purpose must be less than 500 characters"),
  version: Yup.string()
    .required("Version is required")
    .matches(
      /^\d+\.\d+\.\d+$/,
      "Version must be in format X.Y.Z (e.g., 1.0.0)"
    ),
  action_supported: Yup.array()
    .min(1, "At least one capability must be selected")
    .required("Agent Capabilities are required")
});

const ModelValidationSchema = Yup.object({
  model_name: Yup.string()
    .required("Model Name is required")
    .min(3, "Model Name must be at least 3 characters"),
  model_description: Yup.string()
    .required("Description is required")
    .max(500, "Description must be less than 500 characters"),
  model_type: Yup.string().required("Model Type is required"),
  provider: Yup.string()
    .required("Model Owner / Vendor is required")
    .min(2, "Provider name must be at least 2 characters"),
  model_version: Yup.string()
    .required("Version is required")
    .matches(
      /^\d+\.\d+\.\d+$/,
      "Version must be in format X.Y.Z (e.g., 1.0.0)"
    ),
  model_status: Yup.string().required("Model Status is required"),
  compliance_status: Yup.array()
    .min(1, "At least one compliance status must be selected")
    .required("Compliance Status is required")
});

const DataSetsValidationSchema = Yup.object({
  name: Yup.string()
    .required("Dataset Name is required")
    .min(3, "Dataset Name must be at least 3 characters"),
  dataset_version: Yup.string()
    .required("Version is required")
    .matches(
      /^\d+\.\d+\.\d+$/,
      "Version must be in format X.Y.Z (e.g., 1.0.0)"
    ),
  contains_sensitive_data: Yup.boolean().required(
    "Contains Sensitive Data is required"
  ),
  data_sources: Yup.string().required("Data Sources are required"),
  used_for: Yup.string().required("Used For is required")
});

const SelectionValidationSchema = Yup.object({
  selectedItem: Yup.array()
    .min(1, "At least one selected")
    .required("Selection is required")
});

export { NewApplicationValidationSchema, AgentValidationSchema, ModelValidationSchema, DataSetsValidationSchema, SelectionValidationSchema };