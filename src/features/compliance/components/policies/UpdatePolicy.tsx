"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import usePermission from "@/shared/hooks/usePermission";
import useSwr from "@/shared/hooks/useSwr";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { Form, Formik, FormikHelpers } from "formik";
import { File, FileText, Save, Upload, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";

// Define interfaces
interface PolicyFormValues {
  name: string;
  description: string;
  policyFiles: File[]; // New files to be uploaded
  existingFiles: ExistingFileType[]; // Existing files
  doc_id: string; // Document ID for updates
}

interface ExistingFileType {
  url: string;
  name: string;
  type: string;
}

interface FilePreviewProps {
  file: File | ExistingFileType;
  onRemove: () => void;
  isExisting?: boolean;
}

interface UpdatePolicyProps {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  policyId: string; // Only need policyId instead of the full policy data
  canUploadNewFiles?: boolean; // Flag to control if new files can be uploaded
  setPolicyId: Dispatch<SetStateAction<string>>;
}

// File Preview Component
const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  isExisting = false
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");

  useEffect(() => {
    if (!file) {
      return;
    }

    if (isExisting) {
      // Handle existing file (from server)
      const existingFile = file as ExistingFileType;
      setFileType(existingFile.type);
      setFileName(existingFile.name);
      setPreview(existingFile.url);
      return;
    } else {
      // Handle new file (File object)
      const newFile = file as File;
      const type = newFile.name.split(".").pop()?.toLowerCase() || "";
      setFileType(type);
      setFileName(newFile.name);
      setFileSize((newFile.size / 1024 / 1024).toFixed(2));

      // Create URL for file object
      const objectUrl = URL.createObjectURL(newFile);
      setPreview(objectUrl);

      // Clean up on unmount
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file, isExisting]);

  if (!file) {
    return null;
  }

  return (
    <div className="relative mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        {fileType === "pdf" ? (
          <FileText className="h-10 w-10 text-red-500" />
        ) : (
          <File className="h-10 w-10 text-blue-500" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {fileName}
            {isExisting && (
              <span className="ml-2 text-xs text-green-500">(Existing)</span>
            )}
          </p>
          {fileSize && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {fileSize} MB • {fileType.toUpperCase()}
            </p>
          )}
          {!fileSize && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {fileType.toUpperCase()} File
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full bg-gray-200 p-1.5 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {fileType === "pdf" && preview && (
        <div className="mt-4 flex justify-center">
          <a
            href={preview}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Preview PDF
          </a>
        </div>
      )}

      {(fileType === "doc" || fileType === "docx") && (
        <div className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          Preview not available for DOC files
        </div>
      )}
    </div>
  );
};

// File validation function
const validateFile = (file: File): boolean => {
  const supportedFormats = ["pdf"];
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // Check if file is too large (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return false;
  }

  return supportedFormats.includes(extension);
};

// Validation Schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required("Policy name is required")
    .min(3, "Policy name must be at least 3 characters")
    .max(50, "Policy name must be less than 50 characters"),
  description: Yup.string()
    .max(500, "Description must be less than 500 characters")
    .required("Policy description is required"),
  // For update, we don't require new files if existing files are present
  policyFiles: Yup.array().of(
    Yup.mixed<File>().test(
      "fileFormat",
      "Only PDF files under 10MB are allowed",
      (value) => !value || validateFile(value)
    )
  ),
  existingFiles: Yup.array(),
  // Custom validation to ensure at least one file (either existing or new)
  doc_id: Yup.string().required("Document ID is required")
}).test(
  "atLeastOneFile",
  "At least one policy file is required",
  function (values) {
    return (
      (values.policyFiles && values.policyFiles.length > 0) ||
      (values.existingFiles && values.existingFiles.length > 0)
    );
  }
);

// Main Component
const UpdatePolicy: React.FC<UpdatePolicyProps> = ({
  open,
  onClose,
  mutate,
  policyId,
  canUploadNewFiles = true, // Default to true if not specified
  setPolicyId
}) => {
  const { isLoading, mutation } = useMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesSectionRef = useRef<HTMLDivElement>(null);
  const [hasNewFileSelected, setHasNewFileSelected] = useState<boolean>(false);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user } = usePermission();
  // Use SWR to fetch the policy data
  const { data, isValidating } = useSwr(
    policyId ? `policy?doc_id=${policyId}` : null
  );

  // Scroll to bottom of file section when files added/removed
  useEffect(() => {
    if (filesSectionRef.current && totalFiles > 0) {
      setTimeout(() => {
        filesSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      }, 100);
    }
  }, [totalFiles]);

  // Function to re-upload an existing file from URL to a new blob URL
  const reuploadExistingFile = async (
    existingFileUrl: string,
    newBlobUrl: string
  ) => {
    try {
      // Fetch the file from the existing URL
      const fileResponse = await fetch(existingFileUrl);

      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch existing file: ${existingFileUrl}`);
      }

      // Get the file as a blob
      const fileBlob = await fileResponse.blob();

      // Upload to the new blob URL
      const uploadResponse = await fetch(newBlobUrl, {
        method: "PUT",
        body: fileBlob,
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "x-ms-meta-tenant_id": user?.tenant_id || "",
          "x-ms-meta-client_id": user?.client_id || "",
          "Content-Type": fileBlob.type || "application/octet-stream"
        }
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to new location");
      }

      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (
    values: PolicyFormValues,
    { setSubmitting }: FormikHelpers<PolicyFormValues>
  ) => {
    setIsSubmitting(true);
    try {
      // Create a combined array of all files (both existing and new)
      const allFilesInfo = [
        // First, add info about existing files
        ...values.existingFiles.map((file) => ({
          name: file.name,
          type: file.type,
          url: file.url,
          isExisting: true
        })),
        // Then, add info about new files
        ...values.policyFiles.map((file) => ({
          name: file.name.replace(".pdf", ""),
          type: file.type.replace("application/", ""),
          isExisting: false
        }))
      ];

      // Prepare payload with combined file information
      const payload = {
        // Indicate if there are new files to upload
        file: allFilesInfo?.length > 0,
        // File type information for ALL files
        file_type: allFilesInfo.map((file) => file.type),
        // File name information for ALL files
        file_name: allFilesInfo.map((file) => file.name),
        // Policy update info
        policy_update: {
          name: values.name,
          description: values.description
        },
        // Include existing files information separately for proper processing
        existing_files: values.existingFiles.map((file) => ({
          name: file.name,
          type: file.type,
          url: file.url
        })),
        // Flag to indicate if there are new files selected
        has_new_files: hasNewFileSelected,
        // Track the order of files to maintain proper correspondence with blob URLs
        file_order: allFilesInfo.map((file) =>
          file.isExisting ? "existing" : "new"
        )
      };

      const res = await mutation(`policy?doc_id=${values.doc_id}`, {
        method: "PUT",
        isAlert: false,
        body: payload
      });

      if (res?.status === 200) {
        // Handle file uploads - both new and re-uploading existing if needed
        if (res?.results?.blob_url && res.results.blob_url.length > 0) {
          // Track which blob URLs are for new files vs existing files
          const newFileBlobUrls = [];
          const existingFileBlobUrls = [];

          // Sort blob URLs based on file_order from the response
          if (res.results.file_order && Array.isArray(res.results.file_order)) {
            res.results.file_order.forEach(
              (fileType: string, index: string | number) => {
                if (fileType === "new") {
                  newFileBlobUrls.push(res.results.blob_url[index]);
                } else if (fileType === "existing") {
                  existingFileBlobUrls.push(res.results.blob_url[index]);
                }
              }
            );
          } else {
            // Fallback if file_order is not in response
            // Assume first N URLs are for new files, remaining are for existing
            const newFilesCount = values.policyFiles.length;
            newFileBlobUrls.push(
              ...res.results.blob_url.slice(0, newFilesCount)
            );
            existingFileBlobUrls.push(
              ...res.results.blob_url.slice(newFilesCount)
            );
          }

          // Upload all new files
          for (let i = 0; i < values.policyFiles.length; i++) {
            const file = values.policyFiles[i];
            if (!file) {
              throw new Error(`File at index ${i} is missing`);
            }
            const blob_url = newFileBlobUrls[i];
            if (!blob_url) {
              continue;
            }

            const response = await fetch(blob_url, {
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

          // Handle existing files if they need to be re-uploaded
          for (let i = 0; i < values.existingFiles.length; i++) {
            const existingFile = values.existingFiles[i];
            if (!existingFile) {
              throw new Error(`Existing file at index ${i} is missing`);
            }
            // If there's a corresponding blob URL for this existing file, re-upload it
            if (existingFileBlobUrls[i]) {
              const success = await reuploadExistingFile(
                existingFile.url,
                existingFileBlobUrls[i]
              );
              if (!success) {
                toast.error(
                  `Could not re-upload existing file: ${existingFile.name}`
                );
              }
            }
          }

          // Confirm all uploads
          const confirmResponse = await mutation(
            `policy/confirm-upload?doc_id=${values.doc_id}&confirmation_status=true`,
            {
              method: "POST",
              isAlert: false
            }
          );

          if (confirmResponse?.status === 200) {
            toast.success("Policy updated successfully");
            mutate();
            onClose();
            setPolicyId("");
            return;
          } else {
            throw new Error("Failed to confirm upload");
          }
        } else {
          // If no files to upload, just update the policy info
          toast.success("Policy updated successfully");
          mutate();
          onClose();
          setPolicyId("");
        }
      } else {
        throw new Error("Failed to update policy");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the policy"
      );
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Prepare initial values from the policy data
  const initialValues: PolicyFormValues = {
    name: data?.name || "",
    description: data?.description || "",
    policyFiles: [],
    existingFiles: data?.files || [],
    doc_id: policyId || ""
  };

  // Update total files count when data loads
  useEffect(() => {
    if (data?.files) {
      setTotalFiles(data.files.length);
    }
  }, [data]);

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-lg"
      }}
    >
      <DialogTitle className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <span className="text-xl font-semibold text-gray-900 dark:text-white">
          Update Policy
        </span>
      </DialogTitle>

      {isValidating ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Loading policy data...
            </p>
          </div>
        </div>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({
            errors,
            touched,
            values,
            handleChange,
            handleBlur,
            setFieldValue
          }) => (
            <Form className="w-full">
              {/* Scrollable Content Area */}
              <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Policy Name <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      name="name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.name}
                      placeholder="Enter policy name"
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    {touched.name && errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Description Field */}
                  <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Description <span className="text-red-500">*</span>
                    </span>
                    <div className="relative">
                      <textarea
                        name="description"
                        rows={4}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.description}
                        placeholder="Enter a description for your policy..."
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                        {values.description?.length || 0}/500 characters
                      </div>
                    </div>
                    {touched.description && errors.description && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* File Upload Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Policy Documents <span className="text-red-500">*</span>
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        At least one document is required
                      </span>
                    </div>

                    {/* Upload Area for New Files */}
                    <div className="mt-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf"
                        multiple
                        className="hidden"
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          const files = Array.from(
                            event.currentTarget.files || []
                          );
                          // Add new files to existing files
                          setFieldValue("policyFiles", [
                            ...values.policyFiles,
                            ...files
                          ]);
                          // Set the flag that user has selected new files
                          setHasNewFileSelected(true);
                          // Update total files count to trigger scroll
                          setTotalFiles(
                            values.existingFiles.length +
                              values.policyFiles.length +
                              files.length
                          );
                        }}
                      />

                      {/* Upload Area - only visible if canUploadNewFiles is true */}
                      {canUploadNewFiles && (
                        <div
                          tabIndex={0}
                          role="button"
                          onClick={() => fileInputRef.current?.click()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              fileInputRef.current?.click();
                            }
                          }}
                          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-gray-500 dark:hover:bg-gray-700/50"
                        >
                          <Upload className="mb-2 h-10 w-10 text-gray-400" />
                          <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Click to upload new files or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF, DOC or DOCX (Max 10MB per file)
                          </p>
                        </div>
                      )}
                      {!canUploadNewFiles && (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-800/50">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Uploading new files is not permitted for this policy
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Combined Files Display Section */}
                    {(values.existingFiles.length > 0 ||
                      values.policyFiles.length > 0) && (
                      <div className="mt-4" ref={filesSectionRef}>
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Policy Files (
                            {values.existingFiles.length +
                              values.policyFiles.length}
                            )
                          </h4>
                          {values.policyFiles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFieldValue("policyFiles", []);
                                // Update file count to trigger scrolling
                                setTotalFiles(values.existingFiles.length);
                              }}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Remove All New Files
                            </button>
                          )}
                        </div>

                        {/* Flex container for all files in a single row with wrapping */}
                        <div className="flex flex-wrap gap-4">
                          {/* Render existing files */}
                          {values.existingFiles.map((file, index) => (
                            <div
                              key={`existing-${file.name}-${index}`}
                              className="w-full flex-grow-0 sm:w-auto sm:min-w-64 sm:max-w-72"
                            >
                              <FilePreview
                                file={file}
                                isExisting={true}
                                onRemove={() => {
                                  const newExistingFiles = [
                                    ...values.existingFiles
                                  ];
                                  newExistingFiles.splice(index, 1);
                                  setFieldValue(
                                    "existingFiles",
                                    newExistingFiles
                                  );
                                  // Update total files count to trigger scroll
                                  setTotalFiles(
                                    newExistingFiles.length +
                                      values.policyFiles.length
                                  );
                                }}
                              />
                            </div>
                          ))}

                          {/* Render new files */}
                          {values.policyFiles.map((file, index) => (
                            <div
                              key={`new-${file.name}-${index}`}
                              className="w-full flex-grow-0 sm:w-auto sm:min-w-64 sm:max-w-72"
                            >
                              <FilePreview
                                file={file}
                                onRemove={() => {
                                  const newFiles = [...values.policyFiles];
                                  newFiles.splice(index, 1);
                                  setFieldValue("policyFiles", newFiles);
                                  // Update total files count to trigger scroll
                                  setTotalFiles(
                                    values.existingFiles.length +
                                      newFiles.length
                                  );
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error message if no files */}
                    {errors.policyFiles &&
                      typeof errors.policyFiles === "string" && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.policyFiles}
                        </p>
                      )}

                    {/* Custom validation error from Yup test */}
                    {errors.doc_id &&
                      errors.doc_id ===
                        "At least one policy file is required" && (
                        <p className="mt-1 text-sm text-red-500">
                          At least one policy file is required
                        </p>
                      )}
                  </div>
                </div>
              </div>

              <DialogActions className="border-t border-gray-200 p-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setPolicyId("");
                  }}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <div className="w-fit">
                  <CustomButton
                    loading={isLoading || isSubmitting}
                    loadingText="Updating..."
                    type="submit"
                    className="w-fit bg-indigo-600 hover:bg-indigo-700"
                    startIcon={<Save className="h-4 w-4" />}
                  >
                    Update Policy
                  </CustomButton>
                </div>
              </DialogActions>
            </Form>
          )}
        </Formik>
      )}
    </Dialog>
  );
};

export default UpdatePolicy;
