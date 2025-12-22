"use client";
import CustomButton from "@/shared/core/CustomButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { formatFileSize } from "./AddEvidenece";

interface ImageDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  files: File[] | null;
  initialFileIndex?: number;
  onFileUpdate?: (newFiles: File[]) => void;
}

const ImageDetailsDialog: React.FC<ImageDetailsDialogProps> = ({
  open,
  onClose,
  files,
  initialFileIndex = 0,
  onFileUpdate
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(files || []);
  const [currentFileIndex, setCurrentFileIndex] = useState(initialFileIndex);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedFiles(files || []);
    setCurrentFileIndex(initialFileIndex);
  }, [files, initialFileIndex]);
  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };
  useEffect(() => {
    if (
      selectedFiles.length > 0 &&
      selectedFiles[currentFileIndex]?.type.startsWith("image/")
    ) {
      getImageDimensions(selectedFiles[currentFileIndex]).then(setDimensions);
    } else {
      setDimensions(null);
    }
  }, [selectedFiles, currentFileIndex]);

  if (!open || selectedFiles.length === 0) {
    return null;
  }

  const currentFile = selectedFiles[currentFileIndex];

  const handleNewVersionClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
    handleMenuClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files;
    if (newFiles) {
      const fileList = Array.from(newFiles);
      setSelectedFiles(fileList);
      onFileUpdate?.(fileList);
    }
  };

  const handlePrevFile = () => {
    setCurrentFileIndex((prev) =>
      prev > 0 ? prev - 1 : selectedFiles.length - 1
    );
  };

  const handleNextFile = () => {
    setCurrentFileIndex((prev) =>
      prev < selectedFiles.length - 1 ? prev + 1 : 0
    );
  };

  const renderFilePreview = () => {
    if (currentFile?.type.startsWith("image/")) {
      return (
        <img
          src={URL.createObjectURL(currentFile)}
          alt="Preview"
          className="max-h-full max-w-full object-contain"
          onLoad={(e) =>
            URL.revokeObjectURL((e.target as HTMLImageElement).src)
          }
        />
      );
    }
    if (currentFile?.type === "application/pdf") {
      return (
        <iframe
          src={URL.createObjectURL(currentFile)}
          className="h-full w-full"
          title="PDF Preview"
        />
      );
    }
    return (
      <div className="flex h-full items-center justify-center bg-gray-100 p-4 dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <svg
              className="h-8 w-8 text-gray-400"
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
          <p className="font-medium text-gray-600 dark:text-gray-400">
            Preview not available
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {currentFile?.type || "Unknown file type"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        className:
          "dark:bg-gray-900 rounded-xl border-0 shadow-2xl w-full mx-4",
        style: { height: "90vh", maxHeight: "900px" }
      }}
    >
      <DialogTitle className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex min-w-0 flex-1 items-center gap-3">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
              {currentFile?.name}
            </h2>
            {selectedFiles.length > 1 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentFileIndex + 1} of {selectedFiles.length} files
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="relative">
            <Button
              variant="outlined"
              onClick={handleNewVersionClick}
              className="border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Upload new version
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              className="mt-2"
              PaperProps={{
                className: "dark:bg-gray-800 border dark:border-gray-700"
              }}
            >
              <MenuItem
                onClick={handleFileSelect}
                className="dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Choose from computer
              </MenuItem>
            </Menu>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf, .jpeg, .jpg, .png, .gif"
              multiple
              className="hidden"
            />
          </div>
          <CustomButton onClick={onClose}>Done</CustomButton>
          <IconButton
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className="flex flex-col overflow-hidden !p-0 dark:bg-gray-900 lg:flex-row">
        <div className="relative w-full flex-1 bg-gray-50 dark:bg-gray-800">
          {selectedFiles.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevFile}
                className="!absolute !left-4 !top-1/2 z-10 -translate-y-1/2 transform bg-white shadow-lg hover:bg-gray-50 dark:bg-darkHoverBackground dark:hover:bg-gray-700"
              >
                <ChevronLeftIcon className="text-gray-800 dark:text-white" />
              </IconButton>
              <IconButton
                onClick={handleNextFile}
                className="!absolute !right-4 !top-1/2 z-10 -translate-y-1/2 transform bg-white shadow-lg hover:bg-gray-50 dark:bg-darkHoverBackground dark:hover:bg-gray-700"
              >
                <ChevronRightIcon className="text-gray-800 dark:text-white" />
              </IconButton>
            </>
          )}

          <div className="flex h-full items-center justify-center p-6">
            {renderFilePreview()}
          </div>

          {selectedFiles.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform rounded-full bg-black bg-opacity-75 px-3 py-1 text-sm text-white">
              {currentFileIndex + 1} / {selectedFiles.length}
            </div>
          )}
        </div>

        <div className="w-full border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 lg:w-80 lg:border-l lg:border-t-0">
          <div className="h-full overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  File Name
                </h3>
                <p className="break-all text-sm font-medium text-gray-900 dark:text-white">
                  {currentFile?.name}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  File Type
                </h3>
                <div className="flex items-center gap-2">
                  <div className="rounded bg-gray-100 p-1 dark:bg-gray-800">
                    <svg
                      className="h-4 w-4 text-gray-600 dark:text-gray-400"
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
                  <span className="text-sm text-gray-900 dark:text-white">
                    {currentFile?.type || "Unknown"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  File Size
                </h3>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {formatFileSize(currentFile?.size || 0)}
                </p>
              </div>

              {dimensions && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Dimensions
                  </h3>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {dimensions.width} × {dimensions.height} pixels
                  </p>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Last Modified
                </h3>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(
                    currentFile?.lastModified || 0
                  ).toLocaleDateString()}{" "}
                  at{" "}
                  {new Date(
                    currentFile?.lastModified || 0
                  ).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ImageDetailsDialog;
