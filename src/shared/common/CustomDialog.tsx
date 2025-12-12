import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import React, { ReactNode } from "react";
import CustomButton from "../core/CustomButton";

type DialogSize = "sm" | "md" | "lg" | "xl";

interface CommonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  cancelButtonText?: string;
  submitButtonText?: string;
  onSubmit: () => void;
  size?: DialogSize;
  loading?: boolean;
  startIcon?: ReactNode;
  loadingText?: string;
}

const CustomDialog: React.FC<CommonDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  cancelButtonText = "Cancel",
  submitButtonText = "Submit",
  onSubmit,
  size = "md",
  loading,
  startIcon,
  loadingText
}) => {
  // Map custom size to MUI's maxWidth values
  const muiSizeMap: Record<DialogSize, "xs" | "sm" | "md" | "lg"> = {
    sm: "xs",
    md: "sm",
    lg: "md",
    xl: "lg"
  };

  return (
    <Dialog
      open={isOpen}
      // onClose={onClose}
      maxWidth={muiSizeMap[size]}
      fullWidth
      scroll="paper" // important for outer scroll when content overflows
      PaperProps={{
        style: {
          borderRadius: "5px",
          maxHeight: "90vh", // keeps dialog within viewport
          display: "flex",
          flexDirection: "column",
          backgroundColor: "transparent"
        }
      }}
    >
      {/* Header (Non-Scrolling) */}
      <DialogTitle className="dark:bg-darkMainBackground m-0 flex-shrink-0 border-b border-gray-200 bg-white p-2 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
      </DialogTitle>

      {/* Scrollable Content */}
      <DialogContent
        className="dark:bg-darkMainBackground bg-white px-6 py-4"
        style={{
          overflowY: "auto", // This is crucial
          flex: 1 // Take up available space and allow scrolling
        }}
      >
        {children}
      </DialogContent>

      {/* Footer (Non-Scrolling) */}
      <DialogActions className="dark:bg-darkMainBackground flex flex-shrink-0 justify-end space-x-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-neutral-700">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {cancelButtonText}
        </button>
        <div className="w-fit">
          <CustomButton
            loading={loading ?? false}
            {...(loadingText && { loadingText })}
            onClick={onSubmit}
            className="w-fit"
            disabled={loading ?? false}
            startIcon={startIcon}
          >
            {submitButtonText}
          </CustomButton>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
