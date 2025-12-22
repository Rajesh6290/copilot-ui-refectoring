"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { UserPlus } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { AddAuditorSchema } from "../../schema/audit.schema";
import { AuditItem } from "./AuditRegister";

interface AddAuditorDialogProps {
  open: boolean;
  onClose: () => void;
  selectedAudit: AuditItem | null;
  mutate: () => void;
}

const AddAuditorDialog: React.FC<AddAuditorDialogProps> = ({
  open,
  onClose,
  selectedAudit,
  mutate
}) => {
  const { isLoading, mutation } = useMutation();
  const handleAddAuditor = async (values: {
    name: string;
    email: string;
    role: string;
  }) => {
    try {
      const res = await mutation(
        `audits/invite-auditors?audit_id=${selectedAudit?.audit_id}`,
        {
          method: "POST",
          isAlert: false,
          body: {
            auditors: [
              {
                name: values.name,
                email: values.email,
                role_type: values.role
              }
            ]
          }
        }
      );
      if (res?.status === 201 || res?.status === 200) {
        toast.success(res?.results?.message || "Auditor invited successfully");
        mutate();
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "dark:bg-gray-900"
      }}
    >
      <DialogTitle className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center gap-2">
          <UserPlus
            className="text-indigo-600 dark:text-indigo-400"
            size={24}
          />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Add Auditor
          </span>
        </div>
      </DialogTitle>

      <Formik
        initialValues={{
          name: "",
          email: "",
          role: ""
        }}
        validationSchema={AddAuditorSchema}
        onSubmit={handleAddAuditor}
      >
        {({ errors, touched }) => (
          <Form>
            <DialogContent className="space-y-4 bg-white py-6 dark:bg-gray-900">
              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name <span className="text-red-500 dark:text-red-400">*</span>
                </span>
                <Field
                  name="name"
                  type="text"
                  className={`w-full rounded-lg border px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
                    errors.name && touched.name
                      ? "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
                      : "border-gray-300 focus:ring-indigo-500 dark:border-gray-600 dark:focus:ring-indigo-400"
                  } bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400`}
                  placeholder="Enter auditor name"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="mt-1 text-sm text-red-500 dark:text-red-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email{" "}
                  <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <Field
                  name="email"
                  type="email"
                  className={`w-full rounded-lg border px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
                    errors.email && touched.email
                      ? "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
                      : "border-gray-300 focus:ring-indigo-500 dark:border-gray-600 dark:focus:ring-indigo-400"
                  } bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400`}
                  placeholder="Enter auditor email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="mt-1 text-sm text-red-500 dark:text-red-400"
                />
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role <span className="text-red-500 dark:text-red-400">*</span>
                </span>
                <Field
                  as="select"
                  name="role"
                  className={`w-full rounded-lg border px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 ${
                    errors.role && touched.role
                      ? "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
                      : "border-gray-300 focus:ring-indigo-500 dark:border-gray-600 dark:focus:ring-indigo-400"
                  } bg-white dark:bg-gray-800 dark:text-white`}
                >
                  <option value="" className="dark:bg-gray-800">
                    Select role
                  </option>
                  <option value="internal_auditor" className="dark:bg-gray-800">
                    Internal Auditor
                  </option>
                  <option value="external_auditor" className="dark:bg-gray-800">
                    External Auditor
                  </option>
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="mt-1 text-sm text-red-500 dark:text-red-400"
                />
              </div>
            </DialogContent>

            <DialogActions className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="w-fit">
                <Button
                  type="button"
                  variant="outlined"
                  className="!border-tertiary !text-tertiary"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
              <CustomButton
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                loadingText="Adding..."
              >
                Add Auditor
              </CustomButton>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddAuditorDialog;
