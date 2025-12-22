import * as Yup from "yup";
const NewEvidenceValidationSchema = Yup.object({
  documentName: Yup.string()
    .min(3, "Document name must be at least 3 characters")
    .max(100, "Document name cannot exceed 100 characters")
    .required("Document name is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .required("Description is required"),
  version: Yup.string()
    .matches(/^\d+\.\d+\.\d+$/, "Version must be in format x.x.x (e.g., 1.0.0)")
    .required("Version is required"),
  isSensitive: Yup.boolean(),
  recurrence: Yup.string()
    .oneOf(["quarterly", "monthly", "yearly"] as const)
    .required("Recurrence is required"),
  timeSensitivity: Yup.string()
    .oneOf(["anytime", "soc2window"] as const)
    .required("Time sensitivity is required"),
  files: Yup.array()
    .min(1, "Please select at least one document")
    .required("Document selection is required"),
});
const NewVersionValidationSchema = Yup.object({
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .required("Description is required"),
  version: Yup.string()
    .matches(/^\d+\.\d+\.\d+$/, "Version must be in format x.x.x (e.g., 2.0.0)")
    .required("Version is required"),
  versionNotes: Yup.string()
    .min(10, "Version notes must be at least 10 characters")
    .max(500, "Version notes cannot exceed 500 characters")
    .required("Version notes are required"),
  isSensitive: Yup.boolean(),
  recurrence: Yup.string()
    .oneOf(["quarterly", "monthly", "yearly"] as const)
    .required("Recurrence is required"),
  files: Yup.array()
    .min(1, "Please select at least one document")
    .required("Document selection is required"),
});
export { NewEvidenceValidationSchema,NewVersionValidationSchema }