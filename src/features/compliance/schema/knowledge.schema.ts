import * as Yup from "yup";
const NewKnowledgeValidationSchema = Yup.object({
  collectionName: Yup.string()
    .required("Collection name is required")
    .min(3, "Must be at least 3 characters")
});
const UploadKnowledgeValidationSchema = Yup.object({
  documentName: Yup.string()
    .min(3, "Document name must be at least 3 characters")
    .max(100, "Document name cannot exceed 100 characters")
    .required("Document name is required"),
  comment: Yup.string()
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment cannot exceed 500 characters")
    .required("Comment is required"),
  version: Yup.string()
    .matches(/^\d+\.\d+\.\d+$/, "Version must be in format x.x.x (e.g., 1.0.0)")
    .required("Version is required"),
  template: Yup.string().optional(),
  visibility: Yup.boolean(),
  requires_approval: Yup.boolean(),
  file: Yup.mixed().required("File is required")
});
const UpdatenowledgeValidationSchema = Yup.object({
  documentName: Yup.string()
    .min(3, "Document name must be at least 3 characters")
    .max(100, "Document name cannot exceed 100 characters")
    .required("Document name is required"),
  comment: Yup.string()
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment cannot exceed 500 characters")
    .required("Comment is required"),
  version: Yup.string()
    .matches(/^\d+\.\d+\.\d+$/, "Version must be in format x.x.x (e.g., 1.0.0)")
    .required("Version is required"),
  template: Yup.string().optional(),
  visibility: Yup.boolean(),
  requires_approval: Yup.boolean()
});
const StatusUpdateValidationSchema = Yup.object({
  status: Yup.string()
    .required("Status is required")
    .oneOf(["draft", "reviewed", "approved", "rejected"], "Invalid status"),
  comment: Yup.string()
    .required("Comment is required")
    .min(5, "Comment must be at least 5 characters")
    .max(500, "Comment must not exceed 500 characters")
});

export { NewKnowledgeValidationSchema, UploadKnowledgeValidationSchema,UpdatenowledgeValidationSchema,StatusUpdateValidationSchema };