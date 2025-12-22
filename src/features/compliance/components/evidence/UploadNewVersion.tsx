"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip
} from "@mui/material";
import { useFormik } from "formik";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { NewVersionValidationSchema } from "../../schema/evidence.schema";
import { TableRow } from "./EvidenceTable";
const ImageDetailsDialog = dynamic(() => import("./ImageDetailsDialog"), {
  ssr: false
});

interface FormValues {
  description: string;
  version: string;
  versionNotes: string;
  isSensitive: boolean;
  recurrence:
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "semi-annually"
    | "annually"
    | "one-time"
    | "yearly"
    | "never";
  files?: File[];
}

interface UploadNewVersionProps {
  open: boolean;
  onClose: () => void;
  parentEvidence: TableRow;
  controlId: string;
  mutate: () => void;
  baseMutate: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + " B";
  }
  if (bytes < 1048576) {
    return (bytes / 1024).toFixed(2) + " KB";
  }
  return (bytes / 1048576).toFixed(2) + " MB";
};

// Normalize file name - remove extension and standardize
const normalizeFileName = (fileName: string): string => {
  return fileName
    .toLowerCase()
    .trim()
    .replace(/\.(pdf|png|jpg|jpeg|gif)$/i, "");
};

// Check if files are exactly the same (same names, same count)
const areFilesSame = (oldFileNames: string[], newFiles: File[]): boolean => {
  // Must have same number of files
  if (oldFileNames.length !== newFiles.length) {
    return false;
  }

  // Normalize and sort both arrays
  const oldNormalized = oldFileNames.map(normalizeFileName).sort();

  const newNormalized = newFiles
    .map((file) => normalizeFileName(file.name))
    .sort();

  // Check if every file name matches
  return oldNormalized.every((name, index) => name === newNormalized[index]);
};

// Version increment utility
const incrementVersion = (currentVersion: string, isPatch: boolean): string => {
  const versionMatch = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!versionMatch) {
    return "1.0.0";
  }

  let [, major, minor, patch] = versionMatch.map(Number);

  if (isPatch) {
    // Same files - increment patch (1.0.0 → 1.0.1)
    patch = (patch || 0) + 1;
  } else {
    // Different files - increment major (1.0.0 → 2.0.0)
    major = (major || 0) + 1;
    minor = 0;
    patch = 0;
  }

  return `${major}.${minor}.${patch}`;
};

// Calculate next version based on file comparison
const calculateNextVersion = (
  latestVersion: string,
  latestFileNames: string[],
  newFiles: File[]
): { version: string; isAuto: boolean; reason: string } => {
  // Check if new files are exactly same as latest version files
  const isSameFiles = areFilesSame(latestFileNames, newFiles);

  if (isSameFiles) {
    // Same files - patch increment (1.0.0 → 1.0.1)
    const newVersion = incrementVersion(latestVersion, true);
    return {
      version: newVersion,
      isAuto: true,
      reason: `Same file names detected. Patch version increment from v${latestVersion} to v${newVersion}`
    };
  } else {
    // Different or new files - major increment (1.0.0 → 2.0.0)
    const newVersion = incrementVersion(latestVersion, false);

    // Build detailed reason
    const oldFiles = latestFileNames.map(normalizeFileName).join(", ");
    const newFilesList = newFiles
      .map((f) => normalizeFileName(f.name))
      .join(", ");

    return {
      version: newVersion,
      isAuto: true,
      reason: `Different file names detected. Major version increment from v${latestVersion} to v${newVersion}. Old files: [${oldFiles}]. New files: [${newFilesList}]`
    };
  }
};

const UploadNewVersion: React.FC<UploadNewVersionProps> = ({
  open,
  onClose,
  parentEvidence,
  controlId,
  mutate,
  baseMutate
}) => {
  const { mutation } = useMutation();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [versionInfo, setVersionInfo] = useState<{
    version: string;
    isAuto: boolean;
    reason: string;
  }>({ version: "2.0.0", isAuto: true, reason: "" });
  const [showImageDetails, setShowImageDetails] = useState(false);
  const [isVersionManuallySet, setIsVersionManuallySet] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const fileTypeMap = {
    "application/pdf": "pdf",
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/gif": "gif"
  };

  const initialValues: FormValues = {
    description: parentEvidence?.latest_version_info?.description || "",
    version: "2.0.0",
    versionNotes: "",
    isSensitive:
      parentEvidence?.latest_version_info?.sensitivity === "confidential",
    recurrence: parentEvidence?.latest_version_info?.recurrence || "quarterly"
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setIsVersionManuallySet(false);
    onClose();
  };

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: NewVersionValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!values.files || values.files.length === 0) {
        toast.error("Please select at least one document before submitting");
        return;
      }

      try {
        setLoading(true);
        const res = await mutation("evidence/create-version", {
          method: "POST",
          isAlert: false,
          body: {
            parent_evidence_id: parentEvidence.latest_doc_id,
            new_version: values.version,
            version_notes: values.versionNotes,
            evidence_data: {
              description: values.description,
              sensitivity: values.isSensitive ? "confidential" : "public",
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
              throw new Error(`File not found at index ${i}`);
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
            toast.success("New version uploaded successfully.");
            mutate();
            baseMutate();
            handleClose();
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

  useEffect(() => {
    if (selectedFiles.length > 0 && !isVersionManuallySet && parentEvidence) {
      // Get latest version info
      const latestVersion = parentEvidence.latest_version || "1.0.0";
      const latestFileNames =
        parentEvidence.latest_version_info?.file_names || [];

      // Calculate version based on file comparison
      const calculatedVersion = calculateNextVersion(
        latestVersion,
        latestFileNames,
        selectedFiles
      );

      setVersionInfo(calculatedVersion);
      formik.setFieldValue("version", calculatedVersion.version);
    }
  }, [selectedFiles, parentEvidence]);
  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVersion = e.target.value;
    formik.setFieldValue("version", newVersion);
    setIsVersionManuallySet(true);
  };
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
            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload New Version
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {parentEvidence?.evidence_name} (Current: v
                {parentEvidence?.latest_version})
              </p>
            </div>
          </div>
          <IconButton
            onClick={handleClose}
            className="text-gray-500 dark:text-gray-400"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="mt-2 max-h-[70vh] overflow-y-auto p-6 dark:bg-gray-900">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Parent Evidence Info */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <InfoIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="flex-1 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Parent Evidence Information
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>Evidence Name:</strong>{" "}
                      {parentEvidence?.evidence_name}
                    </p>
                    <p>
                      <strong>Current Version:</strong> v
                      {parentEvidence?.latest_version}
                    </p>
                    <p>
                      <strong>Current Files:</strong>{" "}
                      {parentEvidence?.latest_version_info?.file_names?.join(
                        ", "
                      ) || "None"}
                    </p>
                    <p>
                      <strong>Total Versions:</strong>{" "}
                      {parentEvidence?.total_versions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Version Field with Auto-calculation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  New Version *
                </span>
                <Tooltip title={versionInfo.reason}>
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <InfoIcon className="h-4 w-4" />
                    <span>
                      {versionInfo.isAuto && !isVersionManuallySet
                        ? "Auto-calculated"
                        : "Manual"}
                    </span>
                  </div>
                </Tooltip>
              </div>
              <input
                type="text"
                id="version"
                className={`font-mono w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
                  formik.touched.version && formik.errors.version
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
                }`}
                placeholder="2.0.0"
                value={formik.values.version}
                onChange={handleVersionChange}
              />
              {formik.touched.version && formik.errors.version && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formik.errors.version}
                </p>
              )}
            </div>

            {/* Version Notes */}
            <div className="space-y-2">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Version Notes *
              </span>
              <textarea
                id="versionNotes"
                rows={3}
                className={`w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
                  formik.touched.versionNotes && formik.errors.versionNotes
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
                }`}
                placeholder="e.g., 'Updated based on new regulatory requirements and improved documentation'"
                {...formik.getFieldProps("versionNotes")}
              />
              {formik.touched.versionNotes && formik.errors.versionNotes && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {formik.errors.versionNotes}
                </p>
              )}
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
                placeholder="e.g., 'Enhanced testing documentation with additional compliance requirements'"
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
                className="bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                type="submit"
                loading={loading}
                disabled={loading}
                loadingText="Uploading..."
                onClick={() => formik.handleSubmit()}
              >
                Upload New Version
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

export default UploadNewVersion;
