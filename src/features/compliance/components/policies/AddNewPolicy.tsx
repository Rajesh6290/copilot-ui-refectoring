"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import usePermission from "@/shared/hooks/usePermission";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { Form, Formik, FormikHelpers } from "formik";
import { File, FileText, Plus, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { NewPolicySchema } from "../../schema/policy.schema";

// Define interfaces
interface PolicyFormValues {
  name: string;
  description: string;
  policyFiles: File[]; // Changed to array for multiple files
}

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

interface AddNewPolicyProps {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
}

// File Preview Component
const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("");

  useEffect(() => {
    if (!file) {
      return;
    }

    // Get file type
    const type = file.name.split(".").pop()?.toLowerCase() || "";
    setFileType(type);

    // Create URL for file object
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Clean up on unmount
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

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
            {file.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {(file.size / 1024 / 1024).toFixed(2)} MB • {fileType.toUpperCase()}
          </p>
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

// Initial Form Values
const initialValues: PolicyFormValues = {
  name: "",
  description: "",
  policyFiles: []
};

// Main Component
const AddNewPolicy: React.FC<AddNewPolicyProps> = ({
  open,
  onClose,
  mutate
}) => {
  const { isLoading, mutation } = useMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = usePermission();
  const handleSubmit = async (
    values: PolicyFormValues,
    { setSubmitting }: FormikHelpers<PolicyFormValues>
  ): Promise<void> => {
    try {
      const res = await mutation("policy", {
        method: "POST",
        isAlert: false,
        body: {
          file: values.policyFiles?.length > 0 ? true : false,
          file_type:
            values?.policyFiles?.length > 0
              ? values.policyFiles?.map((file) =>
                  file.type.replace("application/", "")
                )
              : undefined,
          file_name:
            values?.policyFiles?.length > 0
              ? values.policyFiles?.map((file) => file.name.replace(".pdf", ""))
              : undefined,
          policy: {
            name: values.name,
            description: values.description
          }
        }
      });
      if (
        res?.status === 200 ||
        (res?.status === 201 &&
          res?.results?.blob_url.length > 0 &&
          values.policyFiles)
      ) {
        for (let i = 0; i < values.policyFiles.length; i++) {
          const file = values.policyFiles[i];
          if (!file) {
            throw new Error(`File at index ${i} is missing`);
          }
          const blob_url = res.results.blob_url[i];
          const response = await fetch(blob_url, {
            method: "PUT",
            body: file,
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "x-ms-meta-tenant_id": user?.tenant_id || "",
              "x-ms-meta-client_id": user?.client_id || "",
              "Content-Type": file.type || "application/octet-stream"
            }
          });
          if (!response.ok) {
            throw new Error(`Failed to upload file: ${file.name}`);
          }
        }
        const response = await mutation(
          `policy/confirm-upload?doc_id=${res?.results?.doc_id}&confirmation_status=true`,
          {
            method: "POST",
            isAlert: false
          }
        );
        if (response?.status === 200) {
          mutate();
          onClose();
        } else {
          toast.error("Error confirming upload. Please try again.");
        }
      } else {
        toast.error("Failed to create policy");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

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
          Add New Policy
        </span>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={NewPolicySchema}
        onSubmit={handleSubmit}
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

                {/* Multiple File Upload Field */}
                <div className="space-y-2">
                  <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Policy Documents <span className="text-red-500">*</span>
                  </span>

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
                      }}
                    />

                    {/* Upload Area - always visible */}
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
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOC or DOCX (Max 10MB per file)
                      </p>
                    </div>
                  </div>

                  {/* Display All Files */}
                  {values.policyFiles.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Uploaded Files ({values.policyFiles.length})
                        </h4>
                        {values.policyFiles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFieldValue("policyFiles", [])}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove All
                          </button>
                        )}
                      </div>
                      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {values.policyFiles.map((file, index) => (
                          <FilePreview
                            key={`${file.name}-${index}`}
                            file={file}
                            onRemove={() => {
                              const newFiles = [...values.policyFiles];
                              newFiles.splice(index, 1);
                              setFieldValue("policyFiles", newFiles);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {touched.policyFiles && errors.policyFiles && (
                    <p className="mt-1 text-sm text-red-500">
                      {typeof errors.policyFiles === "string"
                        ? errors.policyFiles
                        : "Please upload valid policy files"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogActions className="border-t border-gray-200 p-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <div className="w-fit">
                <CustomButton
                  loading={isLoading}
                  loadingText="Creating..."
                  type="submit"
                  className="w-fit bg-indigo-600 hover:bg-indigo-700"
                  startIcon={<Plus className="h-4 w-4" />}
                >
                  Create Policy
                </CustomButton>
              </div>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddNewPolicy;
