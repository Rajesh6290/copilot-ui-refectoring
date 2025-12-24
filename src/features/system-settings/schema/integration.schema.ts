import * as Yup from "yup";
const JiraConfigurationSchema = Yup.object({
  jira_base_url: Yup.string()
    .required("Jira Base URL is required")
    .url("Please enter a valid URL")
    .matches(
      /^https:\/\/.*\.atlassian\.net$/,
      "URL must be a valid Atlassian domain (e.g., https://yourcompany.atlassian.net)"
    ),
  jira_email: Yup.string()
    .required("Jira Email is required")
    .email("Please enter a valid email address"),
  jira_api_token: Yup.string()
    .required("Jira API Token is required")
    .min(50, "API Token must be at least 50 characters")
    .matches(/^[A-Za-z0-9+/=_-]+$/, "API Token contains invalid characters"),
  default_project_key: Yup.string()
    .required("Default Project Key is required")
    .min(2, "Project Key must be at least 2 characters")
    .max(10, "Project Key must be less than 10 characters")
    .matches(
      /^[A-Z0-9]+$/,
      "Project Key must contain only uppercase letters and numbers"
    )
});
const SlackConfigurationSchema = Yup.object({
  slack_client_id: Yup.string()
    .required("Slack Client ID is required")
    .min(10, "Client ID must be at least 10 characters")
    .matches(/^[0-9.]+$/, "Client ID should contain only numbers and dots"),
  slack_client_secret: Yup.string()
    .required("Slack Client Secret is required")
    .min(32, "Client Secret must be at least 32 characters")
    .matches(
      /^[a-f0-9]+$/,
      "Client Secret should contain only lowercase letters and numbers"
    )
});

const ChannelSchema = Yup.object({
  channel_id: Yup.string()
    .required("Channel ID is required")
    .matches(
      /^C[A-Z0-9]+$/,
      'Channel ID must start with "C" followed by alphanumeric characters'
    ),
  channel_name: Yup.string()
    .required("Channel Name is required")
    .min(1, "Channel name must be at least 1 character")
    .max(80, "Channel name must be less than 80 characters")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Channel name can only contain letters, numbers, hyphens, and underscores"
    )
});
const UpdateChannelSchema = Yup.object({
  channel_name: Yup.string()
    .required("Channel Name is required")
    .min(1, "Channel name must be at least 1 character")
    .max(80, "Channel name must be less than 80 characters")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Channel name can only contain letters, numbers, hyphens, and underscores"
    )
});

export {
  JiraConfigurationSchema,
  SlackConfigurationSchema,
  ChannelSchema,
  UpdateChannelSchema
};
