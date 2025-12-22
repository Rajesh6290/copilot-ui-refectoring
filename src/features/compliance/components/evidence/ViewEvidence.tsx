"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { Dialog, DialogActions, DialogContent, Popover } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  ChevronRight,
  Download,
  ExternalLink,
  File,
  FileSpreadsheet,
  FileText,
  Image,
  X
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { IoMdDoneAll } from "react-icons/io";
import { toast } from "sonner";
import * as Yup from "yup";
import { VersionItem } from "./EvidenceTable";

interface Document {
  file_type: string;
  download_url: string;
  file_name: string;
}

interface ViewEvidenceProps {
  isOpen: boolean;
  onClose: () => void;
  data: VersionItem;
  mutate?: () => void;
  baseMutate?: () => void;
  isAccess: ISAccess;
  controlId: string;
}

interface ActionFormData {
  action: "approve" | "reject" | "";
  comment: string;
}

// Validation schema
const validationSchema = Yup.object({
  action: Yup.string().required("Approval status is required"),
  comment: Yup.string()
    .required("Comment is required")
    .min(10, "Comment must be at least 10 characters")
});

interface ISAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
    };
  }[];
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
}

const ViewEvidence: React.FC<ViewEvidenceProps> = ({
  isOpen,
  onClose,
  data,
  mutate,
  baseMutate,
  isAccess,
  controlId
}) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [actionAnchorEl, setActionAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [pdfViewerError, setPdfViewerError] = useState(false);
  const { mutation } = useMutation();

  const initialValues: ActionFormData = {
    action: "",
    comment: ""
  };

  // Get file type from extension or mime type
  const getFileType = (doc: Document): string => {
    const fileName = doc.file_name.toLowerCase();
    const fileType = doc.file_type.toLowerCase();

    // Check for Excel files
    if (
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      fileType.includes("excel") ||
      fileType.includes("spreadsheet")
    ) {
      return "excel";
    }

    // Check for CSV files
    if (fileName.endsWith(".csv") || fileType === "csv") {
      return "csv";
    }

    // Check for Word documents
    if (
      fileName.endsWith(".doc") ||
      fileName.endsWith(".docx") ||
      fileType.includes("word") ||
      fileType.includes("document")
    ) {
      return "word";
    }

    // Check for PDF
    if (fileName.endsWith(".pdf") || fileType === "pdf") {
      return "pdf";
    }

    // Check for images
    if (
      fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
      fileType.includes("image")
    ) {
      return "image";
    }

    return fileType;
  };

  // Get file icon based on type
  const getFileIcon = (doc: Document) => {
    const type = getFileType(doc);

    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500 sm:h-6 sm:w-6" />;
      case "excel":
      case "csv":
        return (
          <FileSpreadsheet className="h-5 w-5 text-green-500 sm:h-6 sm:w-6" />
        );
      case "word":
        return <File className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />;
      case "image":
        return <Image className="h-5 w-5 text-tertiary-500 sm:h-6 sm:w-6" />;
      default:
        return <File className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6" />;
    }
  };

  // Get viewer URL for different file types
  const getViewerUrl = (url: string, fileType: string): string => {
    const encodedUrl = encodeURIComponent(url);

    switch (fileType) {
      case "pdf":
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
      case "excel":
      case "csv":
      case "word":
        // Google Docs Viewer supports Excel, Word, and CSV
        return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
      default:
        return url;
    }
  };

  const getFileNameFromUrl = (url: string): string => {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    if (!lastPart) {
      return "";
    }

    const withoutQuery = lastPart.split("?")[0];
    if (!withoutQuery) {
      return "";
    }

    return withoutQuery.replace(
      /(\.(pdf|png|jpe?g|webp|svg|csv|xlsx?|docx?|txt))+$/i,
      ""
    );
  };

  useEffect(() => {
    if (data?.files?.length > 0) {
      setSelectedDoc(data.files[0] || null);
    } else {
      setSelectedDoc(null);
    }
    setPdfViewerError(false);
  }, [data?.files]);

  const close = () => {
    onClose();
    setSelectedDoc(null);
    setActionAnchorEl(null);
    setPdfViewerError(false);
  };

  const handleTakeAction = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActionAnchorEl(event.currentTarget);
  };

  const handleCloseActionPopover = () => {
    setActionAnchorEl(null);
  };

  const handleActionSubmit = async (values: ActionFormData) => {
    try {
      const res = await mutation("evidence/approve-evidence", {
        method: "POST",
        isAlert: false,
        body: {
          doc_id: data?.doc_id,
          control_id: controlId,
          approval_status: values.action,
          comments: values.comment
        }
      });
      if (res?.status === 200) {
        toast.success(`Document ${values.action} successfully!`);
        if (mutate) {
          mutate();
        }
        if (baseMutate) {
          baseMutate();
        }
        handleCloseActionPopover();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while submitting the action."
      );
    }
  };

  const handleViewerError = () => {
    setPdfViewerError(true);
  };

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Render document viewer based on file type
  const renderDocumentViewer = (doc: Document) => {
    const fileType = getFileType(doc);

    if (pdfViewerError) {
      return (
        <div className="flex h-[500px] items-center justify-center bg-gray-50 dark:bg-gray-800 sm:h-[600px] md:h-[700px]">
          <div className="text-center">
            {getFileIcon(doc)}
            <p className="mb-4 text-lg font-medium text-gray-600 dark:text-gray-300">
              Viewer failed to load
            </p>
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => openInNewTab(doc.download_url)}
                className="flex items-center space-x-2 rounded-lg bg-tertiary-600 px-4 py-2 text-white hover:bg-tertiary-700"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open in New Tab</span>
              </button>
              <a
                href={doc.download_url}
                download
                className="flex items-center space-x-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                <span>Download File</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Handle image files
    if (fileType === "image") {
      return (
        <div className="relative">
          <img
            src={doc.download_url}
            alt="Document Preview"
            className="mx-auto h-auto max-w-full rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="flex h-64 items-center justify-center">
                    <div class="text-center">
                      <p class="text-gray-500 dark:text-gray-400">Failed to load image</p>
                      <a href="${doc.download_url}" download class="mt-2 inline-block rounded bg-tertiary-500 px-4 py-2 text-white">Download</a>
                    </div>
                  </div>
                `;
              }
            }}
          />
        </div>
      );
    }

    // Handle PDF, Excel, CSV, Word documents with Google Docs Viewer
    if (["pdf", "excel", "csv", "word"].includes(fileType)) {
      return (
        <>
          <iframe
            src={getViewerUrl(doc.download_url, fileType)}
            className="h-[500px] w-full sm:h-[600px] md:h-[700px]"
            frameBorder="0"
            title={`${fileType.toUpperCase()} Viewer`}
            onError={handleViewerError}
            onLoad={(e) => {
              const iframe = e.target as HTMLIFrameElement;
              try {
                if (iframe.contentDocument?.title?.includes("Error")) {
                  handleViewerError();
                }
              } catch {
                // Cross-origin restriction, but that's okay if it loads
              }
            }}
          />
          {/* Fallback button */}
          <div className="absolute bottom-4 right-4">
            <button
              onClick={() => openInNewTab(doc.download_url)}
              className="flex items-center space-x-1 rounded-lg bg-black/70 px-3 py-1 text-xs text-white hover:bg-black/80"
              title="Open in new tab"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Open</span>
            </button>
          </div>
        </>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex h-[500px] items-center justify-center bg-gray-50 dark:bg-gray-800 sm:h-[600px] md:h-[700px]">
        <div className="text-center">
          {getFileIcon(doc)}
          <p className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-300">
            Preview not available
          </p>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            This file type cannot be previewed in the browser
          </p>
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => openInNewTab(doc.download_url)}
              className="flex items-center space-x-2 rounded-lg bg-tertiary-600 px-4 py-2 text-white hover:bg-tertiary-700"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open in New Tab</span>
            </button>
            <a
              href={doc.download_url}
              download
              className="flex items-center space-x-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              <span>Download File</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  const isActionPopoverOpen = Boolean(actionAnchorEl);

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        className: "dark:bg-gray-900 bg-white"
      }}
    >
      <div className="flex h-[90vh] bg-white dark:bg-gray-900">
        {/* Left Sidebar */}
        <div className="w-full border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 sm:w-80 md:w-72">
          <div className="p-2 sm:p-4">
            <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
              Documents
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {data?.files?.map((doc: Document, index: number) => (
                <div
                  key={index}
                  tabIndex={0}
                  role="button"
                  onClick={() => {
                    setSelectedDoc(doc);
                    setPdfViewerError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSelectedDoc(doc);
                      setPdfViewerError(false);
                    }
                  }}
                  className={`cursor-pointer rounded-lg border p-2 transition-all duration-200 hover:scale-[1.02] sm:p-3 ${
                    selectedDoc?.download_url === doc?.download_url
                      ? "border-tertiary-200 bg-tertiary-50 shadow-md dark:border-tertiary-400 dark:bg-tertiary-900/20"
                      : "border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                  }`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="rounded-lg bg-gray-100 p-1.5 dark:bg-gray-600 sm:p-2">
                      {getFileIcon(doc)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                        {getFileNameFromUrl(doc.file_name)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {getFileType(doc).toUpperCase()}
                      </p>
                    </div>
                    {selectedDoc?.download_url === doc.download_url && (
                      <ChevronRight className="h-3 w-3 text-tertiary-500 sm:h-4 sm:w-4" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="truncate text-xs font-medium capitalize text-gray-900 dark:text-white sm:text-sm">
                {selectedDoc
                  ? getFileNameFromUrl(selectedDoc.file_name)
                  : "No document selected"}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {selectedDoc && (
                <>
                  <button
                    onClick={() => openInNewTab(selectedDoc.download_url)}
                    className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 sm:p-2"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-300 sm:h-5 sm:w-5" />
                  </button>
                  <a
                    href={selectedDoc.download_url}
                    download
                    className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 sm:p-2"
                    title="Download"
                  >
                    <Download className="h-4 w-4 text-gray-600 dark:text-gray-300 sm:h-5 sm:w-5" />
                  </a>
                </>
              )}
              <button
                onClick={close}
                className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 sm:p-2"
                title="Close"
              >
                <X className="h-4 w-4 text-gray-600 dark:text-gray-300 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <DialogContent
            sx={{
              padding: 0,
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div className="flex-1 overflow-y-auto bg-gray-50 p-2 dark:bg-gray-900">
              {selectedDoc ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Document Preview */}
                  <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {renderDocumentViewer(selectedDoc)}
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="px-4 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 opacity-50 sm:h-16 sm:w-16" />
                    <p className="text-base font-medium sm:text-lg">
                      Select a document to view
                    </p>
                    <p className="mt-2 text-xs opacity-75 sm:text-sm">
                      Choose from the documents list on the left
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>

          {/* Footer */}
          <DialogActions
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              padding: "12px 16px"
            }}
            className="bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            {isAccess?.buttons?.[1]?.permission?.is_shown &&
              data?.evidence_status !== "approved" && (
                <div className="flex w-full flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={(e) => {
                      if (isAccess?.buttons?.[1]?.permission?.actions?.update) {
                        handleTakeAction(e);
                      } else {
                        toast.error(
                          "You don't have permission to perform this action."
                        );
                      }
                    }}
                    className="g flex transform items-center space-x-2 text-nowrap rounded-lg bg-gradient-to-r from-tertiary-600 to-tertiary-700 px-3 py-2 text-sm text-white shadow-md sm:px-4 sm:py-2"
                  >
                    <IoMdDoneAll className="h-4 w-4" />
                    <span className="hidden sm:inline">Take Action</span>
                    <span className="sm:hidden">Action</span>
                  </button>
                </div>
              )}
          </DialogActions>
        </div>
      </div>

      {/* Action Popover */}
      <Popover
        open={isActionPopoverOpen}
        anchorEl={actionAnchorEl}
        onClose={handleCloseActionPopover}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        PaperProps={{
          className:
            "dark:bg-gray-800 bg-white dark:border-gray-700 border-gray-200 shadow-2xl"
        }}
      >
        <div className="w-72 bg-white p-4 dark:bg-gray-800 sm:w-80 sm:p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
            Take Action
          </h3>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleActionSubmit}
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form className="space-y-4">
                {/* Action Selection */}
                <div>
                  <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Approval Status *
                  </span>
                  <Field
                    as="select"
                    name="action"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Status</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </Field>
                  <ErrorMessage
                    name="action"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </div>

                {/* Comment Text Area */}
                <div>
                  <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Comment *
                  </span>
                  <Field
                    as="textarea"
                    name="comment"
                    placeholder="Add your comment here..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                  <ErrorMessage
                    name="comment"
                    component="div"
                    className="mt-1 text-xs text-red-500"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-2 pt-2 sm:space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseActionPopover}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:px-4 sm:py-2"
                  >
                    Cancel
                  </button>
                  <div className="w-fit">
                    <CustomButton
                      type="submit"
                      disabled={isSubmitting || !isValid || !dirty}
                      loading={isSubmitting}
                      loadingText="Submitting..."
                      className="!text-[0.75rem]"
                    >
                      Submit
                    </CustomButton>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Popover>
    </Dialog>
  );
};

export default ViewEvidence;
