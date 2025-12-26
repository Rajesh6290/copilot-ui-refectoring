import * as Yup from "yup";
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
      "Version must be in format X.Y.Z (e.g., 1.0.0)",
    ),
  model_status: Yup.string().required("Model Status is required"),
  compliance_status: Yup.array()
    .min(1, "At least one compliance status must be selected")
    .required("Compliance Status is required"),
});

const DatasetValidationSchema = Yup.object({
  name: Yup.string()
    .required("Dataset Name is required")
    .min(3, "Dataset Name must be at least 3 characters"),
  dataset_version: Yup.string()
    .required("Version is required")
    .matches(
      /^\d+\.\d+\.\d+$/,
      "Version must be in format X.Y.Z (e.g., 1.0.0)",
    ),
  contains_sensitive_data: Yup.boolean().required(
    "Contains Sensitive Data is required",
  ),
  data_sources: Yup.string().required("Data Sources are required"),
  used_for: Yup.string().required("Used For is required"),
});

const SelectionValidationSchema = Yup.object({
  selectedItem: Yup.array()
    .min(1, "At least one model must be selected")
    .required("Selection is required"),
});

export { ModelValidationSchema, DatasetValidationSchema, SelectionValidationSchema };