"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { Dialog } from "@mui/material";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { AlertCircle, Edit, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import * as Yup from "yup";

interface PolicyStatusUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentStatus: string;
  documentName: string;
  mutate: () => void;
}

const statusOptions = [
  {
    value: "draft",
    label: "Draft",
    color:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400"
  },
  {
    value: "reviewed",
    label: "Reviewed",
    color:
      "bg-tertiary-50 text-tertiary-700 ring-tertiary-600/20 dark:bg-tertiary-500/10 dark:text-tertiary-400"
  },
  {
    value: "approved",
    label: "Approved",
    color:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
  },
  {
    value: "rejected",
    label: "Rejected",
    color:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400"
  }
];

const validationSchema = Yup.object({
  status: Yup.string()
    .required("Status is required")
    .oneOf(["draft", "reviewed", "approved", "rejected"], "Invalid status"),
  comment: Yup.string()
    .required("Comment is required")
    .min(5, "Comment must be at least 5 characters")
    .max(500, "Comment must not exceed 500 characters")
});

const PolicyStatusUpdate: React.FC<PolicyStatusUpdateProps> = ({
  isOpen,
  onClose,
  documentId,
  currentStatus,
  documentName,
  mutate
}) => {
  const { isLoading, mutation } = useMutation();

  const formik = useFormik({
    initialValues: {
      status: "",
      comment: ""
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await mutation(`policy?doc_id=${documentId}`, {
          method: "PUT",
          isAlert: false,
          body: {
            file: false,
            policy_update: {
              visibility: "private",
              status: values.status,
              comment: values.comment
            }
          }
        });

        if (res?.status === 200) {
          toast.success("Policy status updated successfully");
          resetForm();
          mutate();
          onClose();
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update status"
        );
      }
    }
  });

  // Filter out current status from options
  const availableStatusOptions = statusOptions.filter(
    (option) => option.value !== currentStatus
  );

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      PaperProps={{
        style: {
          background: "transparent",
          backgroundColor: "transparent",
          boxShadow: "none",
          borderRadius: "0px",
          padding: "0px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999999
        }
      }}
      style={{ zIndex: 9999 }}
      BackdropProps={{
        style: {
          zIndex: 9999,
          backgroundColor: "rgba(0, 0, 0, 0.5)"
        }
      }}
    >
      <div className="w-[30rem] overflow-hidden rounded-2xl border border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-800">
        {/* Header */}
        <div className="border-b border-slate-200/50 bg-gradient-to-r from-tertiary-50 to-tertiary-50 px-6 py-4 dark:border-slate-700/50 dark:from-tertiary-900/20 dark:to-tertiary-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-gradient-to-r from-tertiary-500 to-tertiary-600 p-2 shadow-lg">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Update Status
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {documentName}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={formik.handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Current Status Display */}
            {currentStatus && (
              <div className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Current Status
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ring-1 ring-inset ${
                    statusOptions.find((s) => s.value === currentStatus)?.color
                  }`}
                >
                  {currentStatus}
                </span>
              </div>
            )}

            {/* Status Selection */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                New Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary-500 ${
                  formik.touched.status && formik.errors.status
                    ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700"
                } dark:text-white`}
              >
                <option value="">Select Status</option>
                {availableStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formik.touched.status && formik.errors.status && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center space-x-1 text-sm text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{formik.errors.status}</span>
                </motion.p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label
                htmlFor="comment"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={4}
                value={formik.values.comment}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Add your comment here..."
                className={`w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary-500 ${
                  formik.touched.comment && formik.errors.comment
                    ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700"
                } dark:text-white dark:placeholder-slate-400`}
              />
              <div className="mt-1 flex items-center justify-between">
                {formik.touched.comment && formik.errors.comment ? (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{formik.errors.comment}</span>
                  </motion.p>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Minimum 5 characters required
                  </span>
                )}
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formik.values.comment.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </motion.button>
            <CustomButton
              type="submit"
              disabled={isLoading || !formik.isValid}
              loading={isLoading}
              loadingText="Updating..."
            >
              Submit
            </CustomButton>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default PolicyStatusUpdate;
