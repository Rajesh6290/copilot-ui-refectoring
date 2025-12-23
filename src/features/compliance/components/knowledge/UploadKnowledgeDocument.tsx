"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from "@mui/material";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import { UploadKnowledgeValidationSchema } from "../../schema/knowledge.schema";
import { Template } from "./KnowledgeCard";

// Types
interface FormValues {
  documentName: string;
  comment: string;
  version: string;
  visibility: boolean;
  requires_approval: boolean;
  template: string;
  file?: File;
}
const fileTypeMap = {
  "application/pdf": "pdf",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "text/csv": "csv",
  "application/csv": "csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt"
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + " B";
  }
  if (bytes < 1048576) {
    return (bytes / 1024).toFixed(2) + " KB";
  }
  return (bytes / 1048576).toFixed(2) + " MB";
};

// Validation Schema

const initialValues: FormValues = {
  documentName: "",
  comment: "",
  version: "1.0.0",
  visibility: false,
  requires_approval: false,
  template: ""
};

// Main UploadKnowledgeDocument Component
const UploadKnowledgeDocument = ({
  collectionId,
  open,
  onClose,
  mutate,
  templates
}: {
  collectionId: string;
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  templates: Template[];
}) => {
  const { mutation } = useMutation();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  const allowedFileTypes = [
    "pdf",
    "jpeg",
    "jpg",
    "png",
    "gif",
    "csv",
    "xlsx",
    "docx",
    "txt"
  ];

  const handleClose = () => {
    setSelectedFile(null);
    setFileError("");
    onClose();
  };

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: UploadKnowledgeValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      // Check if file is selected
      if (!selectedFile) {
        setFileError("File is required");
        toast.error("Please select a file to upload.");
        return;
      }

      try {
        setLoading(true);
        const res = await mutation(
          `knowledge/document/upload?collection_id=${collectionId}`,
          {
            method: "POST",
            isAlert: false,
            body: {
              file_name: values.documentName,
              file_type:
                fileTypeMap[selectedFile?.type as keyof typeof fileTypeMap] ||
                "other",
              visibility: values.visibility,
              version: values.version,
              requires_approval: values.requires_approval,
              status: "draft",
              comment: values.comment,
              template_id: values.template
            }
          }
        );

        if (res?.status === 201 && res?.results?.doc_url && selectedFile) {
          const Url = res.results.doc_url;
          const response = await fetch(Url, {
            method: "PUT",
            body: selectedFile,
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "Content-Type": selectedFile?.type || "application/octet-stream"
            }
          });
          if (!response.ok) {
            throw new Error(`Failed to upload file: ${selectedFile.name}`);
          }

          const confirmResponse = await mutation(
            `/knowledge/document/confirm-upload?document_id=${res?.results?.document_id}&collection_id=${collectionId}&status=true`,
            {
              method: "POST",
              isAlert: false
            }
          );
          if (confirmResponse?.status === 200) {
            toast.success(" Document uploaded successfully.");
            mutate();
            handleClose();
            resetForm();
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "dark:bg-gray-900 rounded-xl border-0 shadow-2xl mx-4"
        }}
      >
        <DialogTitle className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add New Document
            </h2>
          </div>
          <IconButton
            onClick={handleClose}
            className="text-gray-500 dark:text-gray-400"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="max-h-[70vh] overflow-y-auto p-6 dark:bg-gray-900">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Document Name Field */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Document Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                id="documentName"
                className={`w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
                  formik.touched.documentName && formik.errors.documentName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
                }`}
                placeholder="e.g. 'Clear Desk Policy Enforced'"
                {...formik.getFieldProps("documentName")}
              />
              {formik.touched.documentName && formik.errors.documentName && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formik.errors.documentName}
                </p>
              )}
            </div>

            {/* Template Selection Field */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Select Template
              </span>
              <select
                id="template"
                className={`w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
                  formik.touched.template && formik.errors.template
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
                }`}
                {...formik.getFieldProps("template")}
              >
                <option value="" disabled>
                  Select a template
                </option>
                {templates?.map(
                  (option: { template_id: string; template_name: string }) => (
                    <option
                      key={option?.template_name}
                      value={option?.template_id}
                    >
                      {option?.template_name}
                    </option>
                  )
                )}
              </select>
              {formik.touched.template && formik.errors.template && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formik.errors.template}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose the template type that best matches your document
              </p>
            </div>

            {/* Version Field */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Version <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                id="version"
                className={`font-mono w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
                  formik.touched.version && formik.errors.version
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
                }`}
                placeholder="1.0.0"
                {...formik.getFieldProps("version")}
              />
              {formik.touched.version && formik.errors.version && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formik.errors.version}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use semantic versioning format (e.g., 1.0.0, 2.1.3)
              </p>
            </div>

            {/* Comment Field */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Comment <span className="text-red-500">*</span>
              </span>
              <textarea
                id="comment"
                rows={4}
                className={`w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
                  formik.touched.comment && formik.errors.comment
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
                }`}
                placeholder="e.g. 'Image of internal office space showing clear desk policy in action at 3 or more workstations.'"
                {...formik.getFieldProps("comment")}
              />
              {formik.touched.comment && formik.errors.comment && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formik.errors.comment}
                </p>
              )}
            </div>

            {/* Visibility Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="visibility"
                name="visibility"
                checked={formik.values.visibility}
                onChange={formik.handleChange}
                className="mt-0.5 !text-blue-600"
              />
              <div className="space-y-1">
                <label
                  htmlFor="visibility"
                  className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Visibility
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Make this document visible to other users
                </p>
              </div>
            </div>

            {/* Requires Approval Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="requires_approval"
                name="requires_approval"
                checked={formik.values.requires_approval}
                onChange={formik.handleChange}
                className="mt-0.5 !text-blue-600"
              />
              <div className="space-y-1">
                <label
                  htmlFor="requires_approval"
                  className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Requires Approval
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This document requires approval before being published
                </p>
              </div>
            </div>

            {/* File Preview */}
            {selectedFile && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Selected File
                </h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 items-center space-x-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        {selectedFile.type.startsWith("image/") ? (
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {selectedFile.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatFileSize(selectedFile.size)}</span>
                          <span>•</span>
                          <span>
                            {selectedFile.type.split("/")[1]?.toUpperCase() ||
                              "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Component */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Upload File <span className="text-red-500">*</span>
              </span>
              <div
                className={`relative w-full cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  fileError
                    ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                    : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpeg,.jpg,.png,.gif,.csv,.xlsx,.docx,.txt"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      const fileType =
                        fileTypeMap[file.type as keyof typeof fileTypeMap];
                      if (fileType && allowedFileTypes.includes(fileType)) {
                        setSelectedFile(file);
                        setFileError(""); // Clear error when file is selected
                        formik.setFieldValue("file", file);
                      } else {
                        toast.error(
                          "File type not supported. Please upload: PDF, JPEG, JPG, PNG, GIF, CSV, XLSX, DOCX, or TXT files only."
                        );
                        event.target.value = "";
                      }
                    }
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <svg
                      className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      <span className="text-blue-600 dark:text-blue-400">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      All file types supported
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Maximum file size: 10MB
                    </p>
                  </div>
                </div>
              </div>
              {fileError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fileError}
                </p>
              )}
              {formik.touched.file && formik.errors.file && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formik.errors.file}
                </p>
              )}
            </div>
          </form>
        </DialogContent>

        <DialogActions className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex w-full justify-end gap-3">
            <Button
              variant="outlined"
              onClick={handleClose}
              className="border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <div className="w-fit">
              <CustomButton
                className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                type="submit"
                loading={loading}
                disabled={loading}
                loadingText="Adding..."
                onClick={() => formik.handleSubmit()}
              >
                Add Document
              </CustomButton>
            </div>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadKnowledgeDocument;
