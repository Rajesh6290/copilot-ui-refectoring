"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { getFromLocalStorage } from "@/shared/utils";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { useFormik } from "formik";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Info,
  Save,
  Shield,
  User,
  X
} from "lucide-react";
import React, { memo, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import dynamic from "next/dynamic";
const AccessResourcePanel = dynamic(() => import("./AccessResourcePanel"), {
  ssr: false
});

// Types
type Subgroup = {
  subgroup: string;
  label: string;
  permission: "manager" | "contributor" | "viewer" | "no_access";
};

type FeatureGroup = {
  feature_group: string;
  label: string;
  subgroups: Subgroup[];
  is_shown: boolean;
};

export interface RoleFormValues {
  name: string;
  description: string;
  featureGroups: FeatureGroup[];
}

interface AddNewRoleProps {
  isOpen: boolean;
  onClose: () => void;
  mutate: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Role name is required"),
  description: Yup.string().required("Description is required")
});

// Badge component
export const Badge = memo(
  ({
    children,
    variant = "default",
    size = "md"
  }: {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "info" | "primary";
    size?: "sm" | "md";
  }) => {
    const variantClasses = {
      default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      success:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      warning:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      info: "bg-tertiary-100 text-tertiary-700 dark:bg-tertiary-900/30 dark:text-tertiary-300",
      primary:
        "bg-tertiary-100 text-tertiary-700 dark:bg-tertiary-900/30 dark:text-tertiary-300"
    };

    const sizeClasses = {
      sm: "px-1.5 py-0.5 text-xs",
      md: "px-2 py-1 text-xs"
    };

    return (
      <span
        className={`rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

// Card component
const Card = memo(
  ({
    children,
    className = ""
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

// PermissionCard component

const AddNewRole: React.FC<AddNewRoleProps> = ({ isOpen, onClose, mutate }) => {
  const { isLoading, mutation } = useMutation();
  const [activeTab, setActiveTab] = useState<"info" | "resource">("info");
  const { data } = useSwr("features-offered");

  // Initialize feature groups with default permissions
  const initialFeatureGroups: FeatureGroup[] = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    const featureGroups: FeatureGroup[] = data.map((group: FeatureGroup) => ({
      feature_group: group.feature_group || "unknown",
      label: group.label || "Unknown Group",
      is_shown: false,
      subgroups: (group.subgroups || []).map((subgroup: Subgroup) => ({
        subgroup: subgroup.subgroup || "unknown",
        label: subgroup.label || "Unknown Subgroup",
        permission: "no_access" as
          | "manager"
          | "contributor"
          | "viewer"
          | "no_access"
      }))
    }));

    // Pre-select chat subgroup as manager
    const assistantGroup = featureGroups.find(
      (group) => group.feature_group === "assistant"
    );
    if (assistantGroup) {
      const chatSubgroup = assistantGroup.subgroups.find(
        (subgroup) => subgroup.subgroup === "chat"
      );
      if (chatSubgroup) {
        chatSubgroup.permission = "manager";
        assistantGroup.is_shown = true;
      }
    }

    return featureGroups;
  }, [data]);

  // Check if any permissions are granted
  const hasAnyAccessGranted = useCallback((values: RoleFormValues) => {
    return values.featureGroups.some((group) =>
      group.subgroups.some((subgroup) => subgroup.permission !== "no_access")
    );
  }, []);

  const formik = useFormik<RoleFormValues>({
    initialValues: {
      name: "",
      description: "",
      featureGroups: initialFeatureGroups
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values: RoleFormValues, { resetForm }) => {
      try {
        // Ensure section visibility is correct
        const finalValues = JSON.parse(JSON.stringify(values));
        finalValues.featureGroups.forEach((group: FeatureGroup) => {
          group.is_shown = group.subgroups.some(
            (subgroup) => subgroup.permission !== "no_access"
          );
        });

        if (!hasAnyAccessGranted(finalValues)) {
          toast.error(
            "Please grant at least one access permission before saving the role."
          );
          return;
        }

        const token = getFromLocalStorage("ACCESS_TOKEN");
        if (!token) {
          toast.error("Authentication required.");
          return;
        }

        // Transform data to match POST API output
        const permissionsSet = finalValues.featureGroups.flatMap(
          (group: FeatureGroup) =>
            group.subgroups.map((subgroup: Subgroup) => ({
              feature_group: group.feature_group,
              subgroup: subgroup.subgroup,
              permission: subgroup.permission
            }))
        );

        const res = await mutation("role", {
          method: "POST",
          isAlert: false,
          body: {
            name: finalValues.name,
            description: finalValues.description,
            permissions_set: permissionsSet
          }
        });

        if (res?.status === 201) {
          toast.success("Role created successfully.");
          mutate();
          onClose();
          resetForm();
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    }
  });

  const isBasicInfoValid = useCallback(
    () =>
      formik.values.name.trim() !== "" &&
      formik.values.description.trim() !== "" &&
      !formik.errors.name &&
      !formik.errors.description,
    [
      formik.values.name,
      formik.values.description,
      formik.errors.name,
      formik.errors.description
    ]
  );

  const handleNext = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (activeTab === "info" && isBasicInfoValid()) {
        setActiveTab("resource");
      } else if (activeTab === "info" && !isBasicInfoValid()) {
        // Trigger form validation to show errors
        formik.setTouched({
          name: true,
          description: true
        });
        toast.error("Please fill in all required fields correctly.");
      }
    },
    [activeTab, isBasicInfoValid, formik]
  );

  const handlePrevious = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (activeTab === "resource") {
        setActiveTab("info");
      }
    },
    [activeTab]
  );

  const handleTabChange = useCallback(
    (tab: "info" | "resource") => {
      // Prevent navigation to resource tab if basic info is not valid
      if (tab === "resource" && !isBasicInfoValid()) {
        // Trigger form validation to show errors
        formik.setTouched({
          name: true,
          description: true
        });
        toast.error(
          "Please fill in the role name and description before proceeding to feature access."
        );
        return;
      }
      setActiveTab(tab);
    },
    [isBasicInfoValid, formik]
  );

  const handleCancel = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    },
    [onClose]
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullScreen
      PaperProps={{ className: "dark:bg-gray-900" }}
    >
      <DialogTitle className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-tertiary-100 p-2 dark:bg-tertiary-900/20">
              <User className="h-5 w-5 text-tertiary-600 dark:text-tertiary-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-800 dark:text-white">
              Create New Custom Role
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </DialogTitle>

      <div className="flex flex-wrap border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
        <button
          type="button"
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-6 ${
            activeTab === "info"
              ? "border-tertiary-600 text-tertiary-600 dark:border-tertiary-400 dark:text-tertiary-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
          onClick={() => handleTabChange("info")}
        >
          <span className="flex items-center gap-2">
            <Info className="hidden h-4 w-4 sm:inline" />
            <span>Basic Information</span>
          </span>
        </button>
        <button
          type="button"
          disabled={!isBasicInfoValid()}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-6 ${
            activeTab === "resource"
              ? "border-tertiary-600 text-tertiary-600 dark:border-tertiary-400 dark:text-tertiary-400"
              : !isBasicInfoValid()
                ? "cursor-not-allowed border-transparent text-gray-400 dark:text-gray-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
          onClick={() => handleTabChange("resource")}
          title={!isBasicInfoValid() ? "Complete basic information first" : ""}
        >
          <span className="flex items-center gap-2">
            <Shield className="hidden h-4 w-4 sm:inline" />
            <span>Feature Access</span>
            {!isBasicInfoValid() && (
              <span className="hidden text-xs sm:inline">
                (Complete basic info first)
              </span>
            )}
          </span>
        </button>
      </div>

      <DialogContent className="flex-1 p-0">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeTab === "info" && (
              <div className="mx-auto max-w-2xl space-y-6">
                <Card>
                  <h3 className="mb-4 flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white">
                    <User className="h-5 w-5 text-tertiary-600 dark:text-tertiary-400" />
                    <span>Basic Information</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="role-name"
                        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Role Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="role-name"
                        type="text"
                        {...formik.getFieldProps("name")}
                        className={`block w-full rounded-lg border p-3 outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                          formik.touched.name && formik.errors.name
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-tertiary-500 focus:ring-tertiary-500 dark:border-gray-600"
                        }`}
                        placeholder="Enter role name"
                      />
                      {formik.touched.name && formik.errors.name && (
                        <div className="mt-1.5 flex items-center gap-1 text-sm text-red-500">
                          <AlertCircle className="h-4 w-4" />
                          {formik.errors.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="role-description"
                        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="role-description"
                        {...formik.getFieldProps("description")}
                        rows={4}
                        className={`block w-full rounded-lg border p-3 outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                          formik.touched.description &&
                          formik.errors.description
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-tertiary-500 focus:ring-tertiary-500 dark:border-gray-600"
                        }`}
                        placeholder="Describe the purpose and permissions of this role"
                      />
                      {formik.touched.description &&
                        formik.errors.description && (
                          <div className="mt-1.5 flex items-center gap-1 text-sm text-red-500">
                            <AlertCircle className="h-4 w-4" />
                            {formik.errors.description}
                          </div>
                        )}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "resource" && (
              <div className="h-full">
                <AccessResourcePanel formik={formik} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      <DialogActions className="border-t border-gray-200 p-4 dark:border-gray-700">
        <form
          onSubmit={formik.handleSubmit}
          className="flex w-full justify-between"
        >
          <div>
            {activeTab === "resource" && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            {activeTab === "info" ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isBasicInfoValid()}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  !isBasicInfoValid()
                    ? "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
                    : "bg-tertiary-600 hover:bg-tertiary-700 dark:bg-tertiary-500 dark:hover:bg-tertiary-600"
                }`}
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <CustomButton
                type="submit"
                startIcon={<Save className="h-4 w-4" />}
                disabled={isLoading || !hasAnyAccessGranted(formik.values)}
                loading={isLoading}
              >
                Save Role
              </CustomButton>
            )}
          </div>
        </form>
      </DialogActions>
    </Dialog>
  );
};

export default AddNewRole;
