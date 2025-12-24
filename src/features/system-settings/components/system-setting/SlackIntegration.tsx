"use client";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import {
  AlertCircle,
  Check,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Unlink,
  Users,
  X,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  ChannelSchema,
  SlackConfigurationSchema,
  UpdateChannelSchema
} from "../../schema/integration.schema";
const SetupGuide = dynamic(() => import("./SetupGuide"), {
  ssr: false
});

interface SubTab {
  tab_name: string;
  resource_id: string;
  buttons: Button[];
  metadata: {
    reference: string;
    resource_type: string;
    label: string;
    icon: string;
    route: string;
  };
  permission: Permission;
}

interface Permission {
  is_shown: boolean;
  permission_set: string;
  actions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

interface Button {
  button_name: string;
  resource_id: string;
  metadata: {
    reference: string;
    resource_type: string;
    label: string;
    icon: string;
    route: string;
  };
  permission: Permission;
}

interface Channel {
  id: string;
  name: string;
}

interface SlackTeam {
  channels: Channel[];
}

interface ConfigurationFormValues {
  slack_client_id: string;
  slack_client_secret: string;
}

interface ChannelFormValues {
  channel_id: string;
  channel_name: string;
}

interface UpdateChannelFormValues {
  channel_name: string;
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
export const useCopyToClipboard = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return { copied, copyToClipboard };
};

// OAuth Popup Manager Hook
const useOAuthPopup = () => {
  const popupRef = useRef<Window | null>(null);

  const openOAuthPopup = (
    url: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }

    popupRef.current = window.open(
      url,
      "slack_oauth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no`
    );

    if (!popupRef.current) {
      onError?.(
        "Popup blocked. Please allow popups for this site and try again."
      );
      return;
    }

    const checkClosed = setInterval(() => {
      if (popupRef.current?.closed) {
        clearInterval(checkClosed);
        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      }
    }, 1000);

    popupRef.current.focus();
  };

  const closePopup = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
  };

  return { openOAuthPopup, closePopup };
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
          className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 transition-all duration-200 focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-tertiary-400 ${readOnly ? "cursor-not-allowed bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400" : ""} ${showToggle ? "pr-12" : ""}`}
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
        return "bg-tertiary-50 dark:bg-tertiary-900/20 border-tertiary-200 dark:border-tertiary-700 text-tertiary-800 dark:text-tertiary-200";
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
      className={`rounded-xl border p-4 shadow-sm ${getStatusStyles(status.type)}`}
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

const SlackIntegration = ({ tabData }: { tabData: SubTab }) => {
  const { data, isValidating, mutate } = useSwr(
    "integrations/slack/credintials"
  );
  const { isLoading: configLoading, mutation: configMutation } = useMutation();
  const { isLoading: channelLoading, mutation: channelMutation } =
    useMutation();
  const { isLoading: updateLoading, mutation: updateMutation } = useMutation();
  const { isLoading: deleteLoading, mutation: deleteMutation } = useMutation();
  const { isLoading: disconnectLoading, mutation: disconnectMutation } =
    useMutation();
  const [showConfiguration, setShowConfiguration] = useState<boolean>(false);
  const [showChannelForm, setShowChannelForm] = useState<boolean>(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [globalStatus, setGlobalStatus] = useState<StatusMessage | undefined>();
  const [host] = useState(
    typeof window !== "undefined" ? window.location.host : ""
  );
  const redirectUri = `https://${host}/auth/slack/callback`;

  const { openOAuthPopup } = useOAuthPopup();
  const { copied, copyToClipboard } = useCopyToClipboard();

  // Determine integration status
  const isConfigured = data && data.slack_client_id && data.slack_client_secret;
  const isConnected = data && data.config_enabled === true;
  const hasChannels =
    data &&
    data.slack_teams &&
    Array.isArray(data.slack_teams) &&
    data.slack_teams.length > 0 &&
    data.slack_teams.some(
      (team: SlackTeam) =>
        team?.channels &&
        Array.isArray(team.channels) &&
        team.channels.length > 0
    );

  // Configuration Form Handler
  const handleConfigureSlack = async (
    values: ConfigurationFormValues,
    helpers: FormikHelpers<ConfigurationFormValues>
  ) => {
    try {
      setGlobalStatus(undefined);

      const response = await configMutation("integrations/slack/configure", {
        method: "POST",
        isAlert: false,
        body: {
          slack_client_id: values.slack_client_id,
          slack_client_secret: values.slack_client_secret,
          slack_redirect_uri: redirectUri
        }
      });

      if (response?.status === 200) {
        const result = response?.results;

        if (result?.slack_oauth_url) {
          openOAuthPopup(
            result.slack_oauth_url,
            () => {
              mutate();
              setGlobalStatus({
                type: "success",
                message: "OAuth authorization completed successfully!"
              });
              setShowConfiguration(false);
            },
            (error) => {
              setGlobalStatus({
                type: "error",
                message: error
              });
            }
          );

          setGlobalStatus({
            type: "info",
            message:
              "Configuration saved! Please complete the OAuth flow in the popup window."
          });
        } else {
          mutate();
          setGlobalStatus({
            type: "success",
            message: "Configuration updated successfully!"
          });
          setShowConfiguration(false);
        }
      }
    } catch (error: unknown) {
      setGlobalStatus({
        type: "error",
        message:
          (error as Error)?.message ||
          "Network error occurred while configuring Slack"
      });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  // Add Channel Handler
  const handleAddChannel = async (
    values: ChannelFormValues,
    helpers: FormikHelpers<ChannelFormValues>
  ) => {
    try {
      setGlobalStatus(undefined);

      const response = await channelMutation(
        `integrations/slack/add-channel?channel_id=${values.channel_id}&channel_name=${values.channel_name}`,
        {
          method: "POST",
          isAlert: false
        }
      );

      if (response?.status === 200) {
        helpers.resetForm();
        setShowChannelForm(false);
        mutate();
        setGlobalStatus({
          type: "success",
          message: "Channel added successfully!"
        });
      }
    } catch (err: unknown) {
      setGlobalStatus({
        type: "error",
        message:
          (err as Error)?.message ||
          "Network error occurred while adding channel"
      });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  // Update Channel Handler
  const handleUpdateChannel = async (
    values: UpdateChannelFormValues,
    helpers: FormikHelpers<UpdateChannelFormValues>
  ) => {
    if (!editingChannel) {
      return;
    }

    try {
      setGlobalStatus(undefined);

      const response = await updateMutation(
        `integrations/slack/update-channel?channel_id=${editingChannel.id}&channel_name=${values.channel_name}`,
        {
          method: "PUT",
          isAlert: false
        }
      );

      if (response?.status === 200) {
        setEditingChannel(null);
        mutate();
        setGlobalStatus({
          type: "success",
          message: "Channel updated successfully!"
        });
      }
    } catch (error: unknown) {
      setGlobalStatus({
        type: "error",
        message:
          (error as Error)?.message ||
          "Network error occurred while updating channel"
      });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  // Delete Channel Handler
  const handleDeleteChannel = async (
    channelId: string,
    channelName: string
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the channel "${channelName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setGlobalStatus(undefined);

      const response = await deleteMutation(
        `integrations/slack/delete-channel?channel_id=${channelId}`,
        {
          method: "DELETE",
          isAlert: false
        }
      );

      if (response?.status === 200) {
        mutate();
        setGlobalStatus({
          type: "success",
          message: `Channel "${channelName}" deleted successfully!`
        });
      }
    } catch (error: unknown) {
      setGlobalStatus({
        type: "error",
        message:
          (error as Error)?.message ||
          "Network error occurred while deleting channel"
      });
    }
  };

  // Disconnect Slack Handler
  const handleDisconnectSlack = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect Slack? This will remove all channels and require reconfiguration."
      )
    ) {
      return;
    }

    try {
      setGlobalStatus(undefined);

      const response = await disconnectMutation(
        "integrations/slack/disconnect",
        {
          method: "DELETE",
          isAlert: false
        }
      );

      if (response?.status === 200) {
        mutate();
        setGlobalStatus({
          type: "success",
          message: "Slack integration disconnected successfully!"
        });
        setShowConfiguration(true);
      }
    } catch (error: unknown) {
      setGlobalStatus({
        type: "error",
        message:
          (error as Error)?.message ||
          "Network error occurred while disconnecting Slack"
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
          <div className="border-b border-gray-200 bg-gradient-to-r from-tertiary-50 to-indigo-50 px-8 py-6 dark:border-gray-700 dark:from-tertiary-900/20 dark:to-indigo-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-100 dark:bg-tertiary-900/50">
                  <Settings className="h-6 w-6 text-tertiary-600 dark:text-tertiary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {isConfigured
                      ? "Reconfigure Integration"
                      : "Setup Integration"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter your Slack app credentials to get started
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfiguration(false)}
                className="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-8">
            <Formik<ConfigurationFormValues>
              initialValues={{
                slack_client_id: data?.slack_client_id || "",
                slack_client_secret: data?.slack_client_secret || ""
              }}
              validationSchema={SlackConfigurationSchema}
              onSubmit={handleConfigureSlack}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InputField
                      name="slack_client_id"
                      label="Slack Client ID"
                      placeholder="123456789.123456789"
                      description="Found in your Slack app's Basic Information"
                    />

                    <InputField
                      name="slack_client_secret"
                      label="Slack Client Secret"
                      type="password"
                      placeholder="Enter your client secret"
                      description="Keep this secret and secure"
                      showToggle={true}
                    />
                  </div>

                  <div>
                    <InputField
                      name="redirect_uri"
                      label="Redirect URI"
                      value={redirectUri}
                      readOnly={true}
                      description="Copy this URL to your Slack app's OAuth settings"
                    />
                    <div className="mt-2 flex">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(redirectUri)}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied ? "Copied!" : "Copy URI"}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || configLoading}
                      className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-tertiary-600 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-tertiary-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting || configLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <ExternalLink className="h-5 w-5" />
                      )}
                      {isConfigured
                        ? "Update Configuration"
                        : "Configure & Connect"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowConfiguration(false)}
                      className="rounded-xl bg-gray-500 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-600"
                    >
                      Cancel
                    </button>
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
            <div className="border-b border-gray-200 bg-gradient-to-r from-tertiary-50 to-indigo-50 px-8 py-6 dark:border-gray-700 dark:from-tertiary-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-100 dark:bg-tertiary-900/50">
                    <Settings className="h-6 w-6 text-tertiary-600 dark:text-tertiary-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Configuration Details
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your Slack app credentials and settings
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
                      onClick={handleDisconnectSlack}
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
                    Client ID
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={data?.slack_client_id || ""}
                      readOnly
                      className="font-mono flex-1 cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    />
                    <button
                      onClick={() => copyToClipboard(data?.slack_client_id)}
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
                    Client Secret
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value="••••••••••••••••••••••••••••••••"
                      readOnly
                      className="font-mono flex-1 cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    />
                    <button
                      onClick={() => copyToClipboard(data?.slack_client_secret)}
                      className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 shadow-sm transition-all duration-200 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Redirect URI
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={redirectUri}
                    readOnly
                    className="font-mono flex-1 cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  />
                  <button
                    onClick={() => copyToClipboard(redirectUri)}
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
                          <div className="h-3 w-3 animate-pulse rounded-full bg-amber-500"></div>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            OAuth Required
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
            </div>
          </div>

          {/* Channel Management - Only show if connected */}
          {isConnected && (
            <>
              {/* Channels Header with Add Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-tertiary-500 to-purple-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Add Channel
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {data?.slack_teams?.reduce(
                        (acc: number, team: SlackTeam) =>
                          acc + team.channels.length,
                        0
                      ) || 0}{" "}
                      channels configured for notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChannelForm(!showChannelForm)}
                  className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-emerald-600"
                >
                  <Plus className="h-5 w-5" />
                  Add Channel
                </button>
              </div>

              {/* Channel Form */}
              {showChannelForm && (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 p-8 dark:from-green-900/10 dark:to-emerald-900/10">
                    <Formik<ChannelFormValues>
                      initialValues={{
                        channel_id: "",
                        channel_name: ""
                      }}
                      validationSchema={ChannelSchema}
                      onSubmit={handleAddChannel}
                    >
                      {({ isSubmitting }) => (
                        <Form className="space-y-6">
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <InputField
                              name="channel_id"
                              label="Channel ID"
                              placeholder="C1234567890"
                              description="Found in channel details (right-click → View channel details)"
                            />

                            <InputField
                              name="channel_name"
                              label="Channel Name"
                              placeholder="general"
                              description="Display name for this channel"
                            />
                          </div>

                          <div className="flex justify-center gap-4">
                            <button
                              type="submit"
                              disabled={isSubmitting || channelLoading}
                              className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-green-600 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isSubmitting || channelLoading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              ) : (
                                <Plus className="h-5 w-5" />
                              )}
                              Add Channel
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowChannelForm(false)}
                              className="rounded-xl bg-gray-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              )}

              {/* Configured Channels - Card Grid */}
              {hasChannels ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {data.slack_teams.map((team: SlackTeam) =>
                    team.channels.map((channel: Channel) => (
                      <div
                        key={channel.id}
                        className={`rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800 ${
                          editingChannel?.id === channel.id
                            ? "border-tertiary-300 ring-2 ring-tertiary-100 dark:border-tertiary-600 dark:ring-tertiary-900/50"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                        }`}
                      >
                        {editingChannel?.id === channel.id ? (
                          /* Edit Mode */
                          <div className="p-6">
                            <div className="mb-4 flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-100 dark:bg-tertiary-900/50">
                                <Edit className="h-5 w-5 text-tertiary-600 dark:text-tertiary-400" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                  Edit Channel
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Update channel name
                                </p>
                              </div>
                            </div>

                            <Formik<UpdateChannelFormValues>
                              initialValues={{ channel_name: channel.name }}
                              validationSchema={UpdateChannelSchema}
                              onSubmit={handleUpdateChannel}
                            >
                              {({ isSubmitting }) => (
                                <Form className="space-y-4">
                                  <div>
                                    <Field
                                      name="channel_name"
                                      placeholder="Channel name"
                                      className="w-full rounded-xl border border-tertiary-300 bg-white px-4 py-3 font-medium text-gray-900 focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-500 dark:border-tertiary-600 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                    <ErrorMessage
                                      name="channel_name"
                                      component="div"
                                      className="mt-2 text-sm text-red-500 dark:text-red-400"
                                    />
                                  </div>

                                  <div className="flex gap-3 pt-2">
                                    <button
                                      type="submit"
                                      disabled={isSubmitting || updateLoading}
                                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 font-semibold text-white transition-all duration-200 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                                    >
                                      {isSubmitting || updateLoading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                      ) : (
                                        <Check className="h-5 w-5" />
                                      )}
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingChannel(null)}
                                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-500 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-600"
                                    >
                                      <X className="h-5 w-5" />
                                      Cancel
                                    </button>
                                  </div>
                                </Form>
                              )}
                            </Formik>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className="p-6">
                            <div className="mb-4 flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-400 to-tertiary-500">
                                  <MessageSquare className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    #{channel.name}
                                  </h4>
                                  <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                    Active
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                Channel ID
                              </p>
                              <code className="font-mono block break-all rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                {channel.id}
                              </code>
                            </div>

                            <div className="flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
                              {tabData.permission.actions.update && (
                                <button
                                  onClick={() => setEditingChannel(channel)}
                                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-tertiary-50 px-4 py-2.5 font-medium text-tertiary-700 transition-all duration-200 hover:bg-tertiary-100 dark:bg-tertiary-900/30 dark:text-tertiary-300 dark:hover:bg-tertiary-900/50"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                              )}
                              {tabData.permission.actions.delete && (
                                <button
                                  onClick={() =>
                                    handleDeleteChannel(
                                      channel.id,
                                      channel.name
                                    )
                                  }
                                  disabled={deleteLoading}
                                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 font-medium text-red-700 transition-all duration-200 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                                >
                                  {deleteLoading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* No Channels Empty State */
                <div className="overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
                  <div className="p-12 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
                      <MessageSquare className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                      No Channels Configured
                    </h3>
                    <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-400">
                      Get started by adding your first Slack channel to receive
                      notifications and updates.
                    </p>
                    <button
                      onClick={() => setShowChannelForm(true)}
                      className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Plus className="h-5 w-5" />
                      Add Your First Channel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* OAuth Required Prompt - Show when configured but not connected */}
      {isConfigured && !isConnected && !showConfiguration && (
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-700 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50">
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-amber-900 dark:text-amber-100">
                  Authorization Required
                </h3>
                <p className="mb-6 text-amber-800 dark:text-amber-200">
                  Your Slack app is configured but needs OAuth authorization to
                  connect to your workspace.
                </p>
                <button
                  onClick={() =>
                    handleConfigureSlack(
                      {
                        slack_client_id: data.slack_client_id,
                        slack_client_secret: data.slack_client_secret
                      },
                      {
                        setSubmitting: () => {},
                        resetForm: () => {},
                        setStatus: () => {}
                      } as unknown as FormikHelpers<ConfigurationFormValues>
                    )
                  }
                  disabled={configLoading}
                  className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {configLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <ExternalLink className="h-5 w-5" />
                  )}
                  Complete Authorization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Guide - Show when not configured and not reconfiguring */}
      {!showConfiguration && <SetupGuide />}
    </div>
  );
};

export default SlackIntegration;
