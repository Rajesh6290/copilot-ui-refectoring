"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { useFormik } from "formik";
import { User, X } from "lucide-react";
import { PiShareFatLight } from "react-icons/pi";
import { toast } from "sonner";
import { ShareValidationSchema } from "../../schema/rai.schema";
interface User {
  email: string;
  role: string;
}

const ShareResponsibleDashboard = ({
  isOpen,
  onClose,
  mutate
}: {
  isOpen: boolean;
  onClose: () => void;
  mutate: () => void;
}) => {
  const { isLoading, mutation } = useMutation();
  const formik = useFormik({
    initialValues: {
      email: "",
      role: "rai_viewer",
      group: []
    },
    validationSchema: ShareValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await mutation("user/invite", {
          method: "POST",
          isAlert: false,
          body: {
            email: values.email,
            role_id: values.role,
            groups: []
          }
        });
        if (res?.status === 200) {
          toast.success("Share with user successfully");
          mutate();
          onClose();
          resetForm();
        }
      } catch (error) {
        toast.error(error instanceof Error);
      }
    }
  });
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "dark:bg-darkSidebarBackground rounded-lg"
      }}
    >
      <DialogTitle className="border-b border-gray-200 p-6 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="font-satoshi text-xl font-semibold text-gray-800 dark:text-white">
              Share With User
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </DialogTitle>

      <DialogContent className="mt-5 p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email*
            </span>
            <input
              type="email"
              {...formik.getFieldProps("email")}
              placeholder="Enter email address"
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-darkMainBackground dark:text-white"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="mt-1.5 text-sm text-red-500">
                {formik.errors.email}
              </div>
            )}
          </div>
        </form>
      </DialogContent>

      <DialogActions className="border-t border-gray-200 p-6 dark:border-neutral-700">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/50"
          >
            Cancel
          </button>
          <CustomButton
            onClick={() => formik.handleSubmit()}
            startIcon={<PiShareFatLight className="text-xl" />}
            disabled={isLoading}
            loading={isLoading}
            loadingText="Sharing...."
          >
            Share
          </CustomButton>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default ShareResponsibleDashboard;
