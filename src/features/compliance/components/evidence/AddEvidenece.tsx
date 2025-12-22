"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { useUser } from "@clerk/nextjs";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Radio,
  RadioGroup
} from "@mui/material";
import { useFormik } from "formik";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
import { NewEvidenceValidationSchema } from "../../schema/evidence.schema";
const ImageDetailsDialog = dynamic(() => import("./ImageDetailsDialog"), {
  ssr: false
});

// Types
interface FormValues {
  documentName: string;
  description: string;
  version: string;
  isSensitive: boolean;
  recurrence: "quarterly" | "monthly" | "yearly";
  timeSensitivity: "anytime" | "soc2window";
  files?: File[];
}
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + " B";
  }
  if (bytes < 1048576) {
    return (bytes / 1024).toFixed(2) + " KB";
  }
  return (bytes / 1048576).toFixed(2) + " MB";
};
const initialValues: FormValues = {
  documentName: "",
  description: "",
  version: "1.0.0",
  isSensitive: false,
  recurrence: "quarterly",
  timeSensitivity: "anytime"
};
// Main AddEvidence Component
const AddEvidence = ({
  controlId,
  open,
  onClose,
  mutate,
  baseMutate
}: {
  controlId: string;
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  baseMutate: () => void;
}) => {
  const { mutation } = useMutation();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showImageDetails, setShowImageDetails] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const { user } = useUser();

  const fileTypeMap = {
    "application/pdf": "pdf",
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/gif": "gif"
  };
  const handleClose = () => {
    setSelectedFiles([]);
    onClose();
  };
  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: NewEvidenceValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!values.files || values.files.length === 0) {
        toast.error("Please select at least one document before submitting");
        return;
      }

      try {
        setLoading(true);
        const res = await mutation("evidence", {
          method: "POST",
          isAlert: false,
          body: {
            evidence: {
              name: values.documentName,
              control_id: controlId,
              collected_by: user?.fullName,
              sensitivity: values.isSensitive ? "confidential" : "public",
              description: values.description,
              version: values.version,
              recurrence: values.recurrence
            },
            file: values.files && values.files.length > 0 ? true : false,
            file_type: values.files
              ? values.files.map(
                  (file) => fileTypeMap[file.type as keyof typeof fileTypeMap]
                )
              : [],
            file_names: values.files?.map((file) => file.name)
          }
        });

        if (
          res?.status === 202 &&
          res?.results?.blob_url &&
          values.files?.length
        ) {
          for (let i = 0; i < values.files.length; i++) {
            const file = values.files[i];
            if (!file) {
              throw new Error(`File not ${i} found`);
            }
            const s3Url = res.results.blob_url[i];
            const response = await fetch(s3Url, {
              method: "PUT",
              body: file,
              headers: {
                "x-ms-blob-type": "BlockBlob",
                "Content-Type": file?.type || "application/octet-stream"
              }
            });
            if (!response.ok) {
              throw new Error(`Failed to upload file: ${file.name}`);
            }
          }
          const response = await mutation(
            `evidence/confirm-upload?doc_id=${res?.results?.evidence_id}&control_id=${controlId}`,
            {
              method: "POST",
              isAlert: false
            }
          );
          if (response?.status === 200) {
            toast.success("Evidence document uploaded successfully.");
            mutate();
            baseMutate();
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

  const handleViewFile = (index: number) => {
    setSelectedFileIndex(index);
    setShowImageDetails(true);
  };

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
              Add New Evidence
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
                Document Name *
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

            {/* Version Field - Always 1.0.0 */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Version *
              </span>
              <input
                type="text"
                id="version"
                className="font-mono w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value="1.0.0"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Initial version for new evidence is always 1.0.0
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Description *
              </span>
              <textarea
                id="description"
                rows={4}
                className={`w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
                  formik.touched.description && formik.errors.description
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
                }`}
                placeholder="e.g. 'Image of internal office space showing clear desk policy in action at 3 or more workstations.'"
                {...formik.getFieldProps("description")}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formik.errors.description}
                </p>
              )}
            </div>

            {/* Sensitive Document Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="isSensitive"
                name="isSensitive"
                checked={formik.values.isSensitive}
                onChange={formik.handleChange}
                className="mt-0.5 !text-blue-600"
              />
              <div className="space-y-1">
                <label
                  htmlFor="isSensitive"
                  className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  This is a sensitive document
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sensitive documents require additional security measures
                </p>
              </div>
            </div>

            {/* Recurrence Selector */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Recurrence *
              </span>
              <select
                id="recurrence"
                className={`w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
                  formik.touched.recurrence && formik.errors.recurrence
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
                }`}
                {...formik.getFieldProps("recurrence")}
              >
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              {formik.touched.recurrence && formik.errors.recurrence && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formik.errors.recurrence}
                </p>
              )}
            </div>

            {/* Time Sensitivity Section */}
            <div className="space-y-3">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Time Sensitivity
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This only applies when you map this document to a control used
                by SOC2.
              </p>
              <RadioGroup
                name="timeSensitivity"
                value={formik.values.timeSensitivity}
                onChange={formik.handleChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <Radio
                    value="anytime"
                    className="!text-blue-600"
                    size="small"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Upload anytime
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Document can be uploaded at any time
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Radio
                    value="soc2window"
                    className="!text-blue-600"
                    size="small"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Upload during SOC 2 observation window
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Document must be uploaded during the observation period
                    </p>
                  </div>
                </div>
              </RadioGroup>
              {formik.touched.timeSensitivity &&
                formik.errors.timeSensitivity && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {formik.errors.timeSensitivity}
                  </p>
                )}
            </div>

            {/* File Upload Component */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Upload Files *
              </span>
              <div className="relative w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                <input
                  type="file"
                  accept=".pdf, .jpeg, .jpg, .png, .gif"
                  multiple
                  onChange={(event) => {
                    const files = event.currentTarget.files;
                    if (files) {
                      const fileList = Array.from(files);
                      setSelectedFiles(fileList);
                      formik.setFieldValue("files", fileList);
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
                      PDF, PNG, JPG, or GIF files supported
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Maximum file size: 10MB per file
                    </p>
                  </div>
                </div>
              </div>
              {formik.touched.files && formik.errors.files && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formik.errors.files}
                </p>
              )}
            </div>

            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Selected Files ({selectedFiles.length})
                </h3>
                <div className="max-h-fit space-y-2 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center space-x-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            {file.type.startsWith("image/") ? (
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
                              {file.name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>
                                {file.type.split("/")[1]?.toUpperCase() ||
                                  "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outlined"
                          size="small"
                          className="ml-3 flex-shrink-0 border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                          onClick={() => handleViewFile(index)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                Add Evidence
              </CustomButton>
            </div>
          </div>
        </DialogActions>
      </Dialog>

      {/* Image Details Dialog */}
      <ImageDetailsDialog
        open={showImageDetails}
        onClose={() => setShowImageDetails(false)}
        files={selectedFiles}
        initialFileIndex={selectedFileIndex}
        onFileUpdate={(newFiles) => {
          setSelectedFiles(newFiles);
          formik.setFieldValue("files", newFiles);
        }}
      />
    </>
  );
};

export default AddEvidence;
