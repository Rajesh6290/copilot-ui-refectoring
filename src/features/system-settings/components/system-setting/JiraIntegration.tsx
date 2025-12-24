"use client";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import {
  AlertCircle,
  Calendar,
  Check,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Settings,
  Unlink,
  X
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { JiraConfigurationSchema } from "../../schema/integration.schema";
const JiraSetupGuide = dynamic(() => import("./JiraSetupGuide"), {
  ssr: false
});

interface JiraConfigurationFormValues {
  jira_base_url: string;
  jira_email: string;
  jira_api_token: string;
  default_project_key: string;
}

interface StatusMessage {
  type: "success" | "error" | "warning" | "info";
  message: string;
}
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6">
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
          <div>
            <div className="mb-2 h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
        <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

// Copy to Clipboard Hook
const useCopyToClipboard = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return { copied, copyToClipboard };
};

// Enhanced Input Field Component
interface InputFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  showToggle?: boolean;
  description?: string;
  [key: string]: unknown;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  readOnly = false,
  showToggle = false,
  description,
  ...props
}) => {
  const [showValue, setShowValue] = useState(false);
  const inputType = showToggle ? (showValue ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      <div className="relative">
        <Field
          name={name}
          type={inputType}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-400 ${
            readOnly
              ? "cursor-not-allowed bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              : ""
          } ${showToggle ? "pr-12" : ""}`}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowValue(!showValue)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            {showValue ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      <ErrorMessage
        name={name}
        component="div"
        className="text-sm font-medium text-red-500 dark:text-red-400"
      />
    </div>
  );
};

// Enhanced Status Alert Component
interface StatusAlertProps {
  status: StatusMessage | undefined;
  onClose?: () => void;
}

const StatusAlert: React.FC<StatusAlertProps> = ({ status, onClose }) => {
  if (!status) {
    return null;
  }

  const getStatusStyles = (type: StatusMessage["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200";
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusIcon = (type: StatusMessage["type"]) => {
    switch (type) {
      case "success":
        return <Check className="h-5 w-5" />;
      case "error":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertCircle className="h-5 w-5" />;
      case "info":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${getStatusStyles(
        status.type
      )}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon(status.type)}
          <span className="font-medium">{status.message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const JiraIntegration = () => {
  const { data, isValidating, mutate } = useSwr(
    "integrations/jira/credentials"
  );
  const { isLoading: configLoading, mutation: configMutation } = useMutation();
  const { isLoading: disconnectLoading, mutation: disconnectMutation } =
    useMutation();
  const [showConfiguration, setShowConfiguration] = useState<boolean>(false);
  const [globalStatus, setGlobalStatus] = useState<StatusMessage | undefined>();

  const { copied, copyToClipboard } = useCopyToClipboard();

  // Determine integration status
  const isConfigured =
    data && data.jira_base_url && data.jira_email && data.jira_api_token;
  const isConnected = data && data.config_enabled === true;

  // Configuration Form Handler
  const handleConfigureJira = async (
    values: JiraConfigurationFormValues,
    helpers: FormikHelpers<JiraConfigurationFormValues>
  ) => {
    try {
      setGlobalStatus(undefined);

      const response = await configMutation("integrations/jira/configure", {
        method: "POST",
        isAlert: false,
        body: {
          jira_base_url: values.jira_base_url,
          jira_email: values.jira_email,
          jira_api_token: values.jira_api_token,
          default_project_key: values.default_project_key
        }
      });

      if (response?.status === 200) {
        mutate();
        setGlobalStatus({
          type: "success",
          message: "Jira integration configured successfully!"
        });
        setShowConfiguration(false);
      }
    } catch (error: unknown) {
      setGlobalStatus({
        type: "error",
        message:
          (error as Error)?.message ||
          "Network error occurred while configuring Jira"
      });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  // Disconnect Jira Handler
  const handleDisconnectJira = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect Jira? This will remove all configuration and require reconfiguration."
      )
    ) {
      return;
    }

    try {
      setGlobalStatus(undefined);

      const response = await disconnectMutation(
        "integrations/jira/disconnect",
        {
          method: "DELETE",
          isAlert: false
        }
      );

      if (response?.status === 200) {
        mutate();
        setGlobalStatus({
          type: "success",
          message: "Jira integration disconnected successfully!"
        });
        setShowConfiguration(true);
      }
    } catch (error: unknown) {
      setGlobalStatus({
        type: "error",
        message:
          (error as Error)?.message ||
          "Network error occurred while disconnecting Jira"
      });
    }
  };

  if (isValidating && !data) {
    return <SkeletonLoader />;
  }

  return (
    <div className="mx-auto h-fit max-w-6xl space-y-8">
      {/* Global Status Messages */}
      {globalStatus && (
        <StatusAlert
          status={globalStatus}
          onClose={() => setGlobalStatus(undefined)}
        />
      )}

      {/* Configuration Form - Show when configuring */}
      {(!isConfigured || showConfiguration) && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
                  <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {isConfigured
                      ? "Reconfigure Integration"
                      : "Setup Integration"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter your Jira credentials to get started
                  </p>
                </div>
              </div>
              {isConfigured && (
                <button
                  onClick={() => setShowConfiguration(false)}
                  className="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            <Formik<JiraConfigurationFormValues>
              initialValues={{
                jira_base_url: data?.jira_base_url || "",
                jira_email: data?.jira_email || "",
                jira_api_token: data?.jira_api_token || "",
                default_project_key: data?.default_project_key || ""
              }}
              validationSchema={JiraConfigurationSchema}
              onSubmit={handleConfigureJira}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InputField
                      name="jira_base_url"
                      label="Jira Base URL"
                      placeholder="https://yourcompany.atlassian.net"
                      description="Your Jira instance URL"
                    />

                    <InputField
                      name="jira_email"
                      label="Jira Email"
                      type="email"
                      placeholder="your-email@company.com"
                      description="Your Jira account email"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InputField
                      name="jira_api_token"
                      label="Jira API Token"
                      type="password"
                      placeholder="Enter your API token"
                      description="Generate from your Atlassian account settings"
                      showToggle={true}
                    />

                    <InputField
                      name="default_project_key"
                      label="Default Project Key"
                      placeholder="OPS"
                      description="Default project for creating issues"
                    />
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || configLoading}
                      className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting || configLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <ExternalLink className="h-5 w-5" />
                      )}
                      {isConfigured ? "Update Configuration" : "Configure Jira"}
                    </button>

                    {isConfigured && (
                      <button
                        type="button"
                        onClick={() => setShowConfiguration(false)}
                        className="rounded-xl bg-gray-500 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Main Content - Show when not reconfiguring */}
      {isConfigured && !showConfiguration && (
        <div className="space-y-8">
          {/* Configuration Details */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
                    <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Configuration Details
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your Jira integration credentials and settings
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfiguration(true)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                    Reconfigure
                  </button>
                  {isConnected && (
                    <button
                      onClick={handleDisconnectJira}
                      disabled={disconnectLoading}
                      className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3 font-medium text-red-700 shadow-sm transition-all duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                    >
                      {disconnectLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                      ) : (
                        <Unlink className="h-4 w-4" />
                      )}
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Base URL
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={data?.jira_base_url || ""}
                      readOnly
                      className="font-mono flex-1 cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    />
                    <button
                      onClick={() => copyToClipboard(data?.jira_base_url)}
                      className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 shadow-sm transition-all duration-200 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={data?.jira_email || ""}
                      readOnly
                      className="font-mono flex-1 cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    />
                    <button
                      onClick={() => copyToClipboard(data?.jira_email)}
                      className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 shadow-sm transition-all duration-200 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    API Token
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={data?.jira_api_token || ""}
                      readOnly
                      className="font-mono flex-1 cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    />
                    <button
                      onClick={() => copyToClipboard(data?.jira_api_token)}
                      className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 shadow-sm transition-all duration-200 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Default Project Key
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={data?.default_project_key || ""}
                      readOnly
                      className="font-mono flex-1 cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    />
                    <button
                      onClick={() => copyToClipboard(data?.default_project_key)}
                      className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 shadow-sm transition-all duration-200 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Connection Status:
                    </span>
                    <div className="flex items-center gap-3">
                      {isConnected ? (
                        <>
                          <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            Connected
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            Disconnected
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {data?.configured_by && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Configured by:{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {data.configured_by}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Creation Date */}
              {data?.created_at && (
                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Created on:{" "}
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {new Date(data.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Setup Guide - Show when not configured */}
      <JiraSetupGuide />
    </div>
  );
};

export default JiraIntegration;
