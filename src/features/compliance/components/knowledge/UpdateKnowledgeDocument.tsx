"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UpdatenowledgeValidationSchema } from "../../schema/knowledge.schema";
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

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {/* Document Name */}
      <div className="space-y-2">
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="rectangular" height={48} className="rounded-lg" />
      </div>

      {/* Template */}
      <div className="space-y-2">
        <Skeleton variant="text" width={100} height={20} />
        <Skeleton variant="rectangular" height={48} className="rounded-lg" />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Skeleton variant="text" width={80} height={20} />
        <Skeleton variant="rectangular" height={48} className="rounded-lg" />
      </div>

      {/* Version */}
      <div className="space-y-2">
        <Skeleton variant="text" width={60} height={20} />
        <Skeleton variant="rectangular" height={48} className="rounded-lg" />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Skeleton variant="text" width={90} height={20} />
        <Skeleton variant="rectangular" height={96} className="rounded-lg" />
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton variant="rectangular" width={20} height={20} />
          <Skeleton variant="text" width={100} height={20} />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton variant="rectangular" width={20} height={20} />
          <Skeleton variant="text" width={120} height={20} />
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Skeleton variant="text" width={80} height={20} />
        <Skeleton variant="rectangular" height={120} className="rounded-lg" />
      </div>
    </div>
  );
};

// Main UpdateKnowledgeDocument Component
const UpdateKnowledgeDocument = ({
  collectionId,
  documentId,
  open,
  onClose,
  mutate,
  templates
}: {
  collectionId: string;
  documentId: string;
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  templates: Template[];
}) => {
  const { mutation } = useMutation();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasNewFile, setHasNewFile] = useState(false);

  const { data, isValidating } = useSwr(
    open
      ? `/knowledge/document?document_id=${documentId}&collection_id=${collectionId}`
      : null
  );

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
    setHasNewFile(false);
    onClose();
  };

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: UpdatenowledgeValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);

        const requestBody = {
          file_name: values.documentName,
          file_type: hasNewFile
            ? fileTypeMap[selectedFile?.type as keyof typeof fileTypeMap] ||
              "other"
            : data?.document?.file_type,
          visibility: values.visibility,
          version: values.version,
          requires_approval: values.requires_approval,
          comment: values.comment,
          template_id: values.template
        };

        const res = await mutation(
          `knowledge/document?document_id=${documentId}&collection_id=${collectionId}&file_update=${hasNewFile}`,
          {
            method: "PUT",
            isAlert: false,
            body: requestBody
          }
        );

        if (res?.status === 200 || res?.status === 201) {
          // If new file is selected and we got upload URL
          if (hasNewFile && res?.results?.doc_url && selectedFile) {
            const uploadUrl = res.results.doc_url;
            const response = await fetch(uploadUrl, {
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

            // Confirm the file upload
            const confirmResponse = await mutation(
              `/knowledge/document/confirm-update?document_id=${res?.results?.document_id}&collection_id=${collectionId}&status=true`,
              {
                method: "POST",
                isAlert: false
              }
            );

            if (confirmResponse?.status === 200) {
              toast.success("Document updated successfully with new file.");
              mutate();
              handleClose();
              resetForm();
            }
          } else {
            // No new file, just update metadata
            toast.success("Document updated successfully.");
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

  // Set initial values when data is loaded
  useEffect(() => {
    if (data?.document && !isValidating) {
      const document = data.document;
      formik.setValues({
        documentName: document.file_name || "",
        comment: document.comment || "",
        version: document.version || "1.0.0",
        visibility: document.visibility || false,
        requires_approval: document.requires_approval || false,
        template: document.template_id || ""
      });
    }
  }, [data, isValidating]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setHasNewFile(true);
    formik.setFieldValue("file", file);
  };

  // Function to handle view button click

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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Update Document
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
          {isValidating ? (
            <SkeletonLoader />
          ) : (
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
                  <option value="">Select a template</option>
                  {templates?.map(
                    (option: {
                      template_id: string;
                      template_name: string;
                    }) => (
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
                  placeholder="e.g. 'Updated document with latest policy changes and additional clarifications.'"
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

              {/* Current Document Preview */}
              {data?.document?.doc_url && !selectedFile && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Current Document
                  </h3>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 flex-1 items-center space-x-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
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
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {data.document.file_name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {data.document.file_type?.toUpperCase()}
                            </span>
                            <span>•</span>
                            <span>Version {data.document.version}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* New File Preview */}
              {selectedFile && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    New File Selected
                  </h3>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 transition-colors hover:bg-green-100 dark:border-green-700 dark:bg-green-800/20 dark:hover:bg-green-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 flex-1 items-center space-x-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                          {selectedFile.type.startsWith("image/") ? (
                            <svg
                              className="h-5 w-5 text-green-600 dark:text-green-400"
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
                              className="h-5 w-5 text-green-600 dark:text-green-400"
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
                            <span>•</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              New
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="text"
                          size="small"
                          className="ml-1 flex-shrink-0 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => {
                            setSelectedFile(null);
                            setHasNewFile(false);
                            formik.setFieldValue("file", undefined);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* File Upload Component */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedFile ? "Replace File" : "Upload New File (Optional)"}
                </label>
                <div className="relative w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <input
                    type="file"
                    accept=".pdf,.jpeg,.jpg,.png,.gif,.csv,.xlsx,.docx,.txt"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file) {
                        const fileType =
                          fileTypeMap[file.type as keyof typeof fileTypeMap];
                        if (fileType && allowedFileTypes.includes(fileType)) {
                          handleFileSelect(file);
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
                        {selectedFile
                          ? "Select a new file to replace the current selection"
                          : "Leave empty to keep the current document"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        All file types supported • Maximum file size: 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
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
                disabled={loading || isValidating}
                loadingText="Updating..."
                onClick={() => formik.handleSubmit()}
              >
                Update Document
              </CustomButton>
            </div>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateKnowledgeDocument;
