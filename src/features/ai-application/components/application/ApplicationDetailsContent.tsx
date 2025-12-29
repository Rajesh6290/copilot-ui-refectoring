"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Brain,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Code,
  Eye,
  FileText,
  GitBranch,
  Network,
  Plus,
  Settings,
  Shield,
  Target,
  UserCheck,
  Users,
  X,
  Zap
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { AIApplication } from "./ApplicationDetails";

// Multi-select options
const DATA_SENSITIVITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "internal", label: "Internal" },
  { value: "personal", label: "Personal" },
  { value: "confidential", label: "Confidential" }
];

// const TASK_CRITICALITY_OPTIONS = [
//   { value: "safety_critical", label: "Safety Critical" },
//   { value: "operational", label: "Operational" },
//   { value: "reputational", label: "Reputational" },
//   { value: "compliance", label: "Compliance" }
// ];

// const END_USER_OPTIONS = [
//   { value: "consumer_b2c", label: "Consumer (B2C)" },
//   { value: "enterprise_b2b", label: "Enterprise (B2B)" },
//   { value: "government_reg", label: "Government (Reg)" },
//   { value: "developer", label: "Developer" }
// ];

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  icon: React.ReactNode;
  iconColor: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder,
  icon,
  iconColor
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  const removeSelected = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
  };

  const getSelectedLabels = () => {
    return selectedValues.map(
      (value) =>
        options.find((option) => option.value === value)?.label || value
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="mb-3 flex items-center space-x-2">
        <div className={iconColor}>{icon}</div>
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {placeholder}
        </p>
      </div>

      <motion.div
        className="min-h-[48px] cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-neutral-600 dark:bg-neutral-800"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-1 flex-wrap gap-2">
            {selectedValues.length === 0 ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Select {placeholder.toLowerCase()}...
              </span>
            ) : (
              getSelectedLabels().map((label, index) => {
                const value = selectedValues[index];
                if (!value) {
                  return null;
                }

                return (
                  <motion.span
                    key={value}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {label}
                    <button
                      onClick={(e) => removeSelected(value, e)}
                      className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                );
              })
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 transform" : ""
            }`}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-xl dark:border-neutral-600 dark:bg-neutral-800"
          >
            <div className="max-h-60 overflow-auto p-2">
              {options.map((option) => (
                <motion.div
                  key={option.value}
                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  className="flex cursor-pointer items-center space-x-3 rounded-md p-3 transition-colors"
                  onClick={() => handleToggleOption(option.value)}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-gray-300 dark:border-neutral-600">
                    {selectedValues.includes(option.value) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-full w-full items-center justify-center rounded bg-blue-500"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {option.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ApplicationDetailsProps {
  data: AIApplication;
  onDataSensitivityChange?: (values: string[]) => void;
  onTaskCriticalityChange?: (values: string[]) => void;
  onEndUserChange?: (values: string[]) => void;
}

const ApplicationDetailsContent: React.FC<ApplicationDetailsProps> = ({
  data,
  onDataSensitivityChange
}) => {
  const [dataSensitivity, setDataSensitivity] = useState<string[]>(
    data?.data_sensitivity || []
  );
  const handleDataSensitivityChange = (values: string[]) => {
    setDataSensitivity(values);
    onDataSensitivityChange?.(values);
  };
  // Format moment dates (mock implementation for demo)
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "Not specified";
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) {
      return "Not specified";
    }
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="w-full space-y-8 bg-gray-50 dark:bg-neutral-900">
      {/* Header with status pill */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-white">
            {data?.name || "Sample Application"}
          </h2>
          <div className="mt-2 flex items-center space-x-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Version {data?.version || "1.0.0"}
            </p>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Created{" "}
                {formatDate(data?.created_at || new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-3 md:mt-0">
          <motion.div
            className={`rounded-full px-6 py-3 text-sm font-semibold shadow-lg ${
              data?.is_active !== false
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
            }`}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>{data?.is_active !== false ? "ACTIVE" : "INACTIVE"}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main info grid */}
      <motion.div
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Key Details */}
        <div className="lg:col-span-2">
          <motion.div
            className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-xl dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900"
            whileHover={{
              y: -5,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8 flex items-center space-x-3">
              <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 p-2">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Application Details
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="group">
                  <div className="mb-3 flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Purpose
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-800">
                    <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                      {data?.purpose ||
                        data?.description ||
                        "A comprehensive application management system designed to streamline business operations and enhance user productivity."}
                    </p>
                  </div>
                </div>

                <div className="group">
                  <div className="mb-3 flex items-center space-x-2">
                    <Code className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Use Case Type
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 text-sm font-medium capitalize text-blue-700 shadow-sm dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                    <GitBranch className="mr-2 h-4 w-4" />
                    {data?.use_case_type?.replace(/_/g, " ") ||
                      "Business Application"}
                  </span>
                </div>
                <div className="group col-span-2">
                  <div className="mb-3 flex items-center space-x-2">
                    <Code className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Compliance Status
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 text-sm font-medium capitalize text-blue-700 shadow-sm dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                    <GitBranch className="mr-2 h-4 w-4" />
                    {Array.isArray(data?.compliance_status) &&
                    data.compliance_status.length > 0
                      ? data.compliance_status
                          .map((status: string) => status.replace(/_/g, " "))
                          .join(", ")
                      : "GDPR Compliant, SOC 2 Certified"}
                  </span>
                </div>
                <div className="group">
                  <div className="mb-3 flex items-center space-x-2">
                    <Network className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Deployment Context
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 text-sm font-medium capitalize text-blue-700 shadow-sm dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                    {data?.deployment_context || "Not specified"}
                  </span>
                </div>

                <div className="group">
                  <div className="mb-3 flex items-center space-x-2">
                    <Users className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Intended Users
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 text-sm font-medium capitalize text-blue-700 shadow-sm dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                    {data?.intended_users || "Not specified"}
                  </span>
                </div>

                <div className="group">
                  <div className="mb-3 flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Automation Level
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 text-sm font-medium capitalize text-blue-700 shadow-sm dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                    {data?.automation_level || "Not specified"}
                  </span>
                </div>

                <div className="group">
                  <div className="mb-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Decision Binding
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 text-sm font-medium capitalize text-blue-700 shadow-sm dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                    {data?.decision_binding === true
                      ? "Yes"
                      : data?.decision_binding === false
                        ? "No"
                        : "Not specified"}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <div className="mb-3 flex items-center space-x-2">
                    <Users className="h-4 w-4 text-indigo-500" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Owner
                    </p>
                  </div>
                  <p className="rounded-lg bg-white p-3 text-sm text-gray-800 shadow-sm dark:bg-neutral-800 dark:text-gray-200">
                    {data?.owner_name || "John Doe"}
                  </p>
                </div>
                {/* Data Sensitivity Multi-Select */}
                <div className="group">
                  <MultiSelect
                    options={DATA_SENSITIVITY_OPTIONS}
                    selectedValues={dataSensitivity}
                    onChange={handleDataSensitivityChange}
                    placeholder="Data Sensitivity"
                    icon={<Shield className="h-4 w-4" />}
                    iconColor="text-amber-500"
                  />
                </div>

                <div className="group">
                  <div className="mb-3 flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      AI Behaviors
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-neutral-800">
                    {data?.ai_behaviors && data.ai_behaviors.length > 0 ? (
                      <p className="text-sm capitalize text-gray-800 dark:text-gray-200">
                        {data.ai_behaviors
                          .map((b) => b.replace(/_/g, " "))
                          .join(", ")}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Not specified
                      </p>
                    )}
                  </div>
                </div>

                <div className="group">
                  <div className="mb-3 flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Human Oversight Required
                    </p>
                  </div>
                  <p className="rounded-lg bg-white p-3 text-sm text-gray-800 shadow-sm dark:bg-neutral-800 dark:text-gray-200">
                    {data?.human_oversight_required === true
                      ? "Yes"
                      : data?.human_oversight_required === false
                        ? "No"
                        : "Not specified"}
                  </p>
                </div>

                {data?.oversight_type && (
                  <div className="group">
                    <div className="mb-3 flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-indigo-500" />
                      <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Oversight Type
                      </p>
                    </div>
                    <p className="rounded-lg bg-white p-3 text-sm capitalize text-gray-800 shadow-sm dark:bg-neutral-800 dark:text-gray-200">
                      {data.oversight_type.replace(/_/g, " ")}
                    </p>
                  </div>
                )}

                {data?.oversight_role && (
                  <div className="group">
                    <div className="mb-3 flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Oversight Role
                      </p>
                    </div>
                    <p className="rounded-lg bg-white p-3 text-sm capitalize text-gray-800 shadow-sm dark:bg-neutral-800 dark:text-gray-200">
                      {data.oversight_role.replace(/_/g, " ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          className="h-fit rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-xl dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900"
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8 flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-2">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Timeline
            </h3>
          </div>

          <div className="space-y-8">
            <motion.div
              className="flex items-start"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                  <Plus className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Created
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(data?.created_at || new Date().toISOString())}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                  <Settings className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Last Updated
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(data?.updated_at || new Date().toISOString())}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-start"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Last Audit
                </h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(
                    data?.last_audit_date || new Date().toISOString()
                  )}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ApplicationDetailsContent;
