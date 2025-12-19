interface PermissionActions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

interface Permission {
  is_shown: boolean;
  permission_set: string; // e.g., "manager" | "no_access"
  actions: PermissionActions;
}

interface Metadata {
  reference: string;
  resource_type: string; // "feature" | "feature_group" | "side_button" | "tab" | "feature_children";
  label: string;
  icon?: string;
  route?: string;
  [key: string]: unknown;
}

interface Button {
  button_name: string;
  resource_id: string;
  metadata: Metadata;
  permission: Permission;
  buttons?: Button[]; // for nested buttons (e.g., view-application → add-model, etc.)
  tabs?: Tab[]; // rare case, but exists in view-application
}

interface Tab {
  tab_name: string;
  resource_id: string;
  buttons?: Button[];
  metadata: Metadata;
  permission: Permission;
  sub_tabs?: Tab[]; // used in integration section
}

interface SubFeature {
  sub_feature_name: string;
  resource_id: string;
  buttons?: Button[];
  tabs?: Tab[];
  sub_features?: SubFeature[];
  metadata: Metadata;
  permission: Permission;
}

interface Feature {
  feature_name: string;
  resource_id: string;
  buttons?: Button[];
  tabs?: Tab[];
  sub_features?: SubFeature[];
  metadata?: Metadata | Record<string, unknown>;
  permission: Permission;
}

interface FeatureGroup {
  feature_group_name: string;
  resource_id: string;
  features: Feature[];
  metadata: Metadata;
  permission: Permission;
}

interface DateTimeConfig {
  timezone: string; // e.g., "Asia/Kolkata"
  date_format: string; // e.g., "MM/DD/YYYY"
}

interface SubscriptionStatus {
  is_subscription_ended: boolean;
  status_message: string;
}

interface LandingPageResources {
  trust_center_view: boolean;
  rai_view: boolean;
  trust_center_generate?: boolean;
}

interface Resources {
  landing_page: LandingPageResources;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  UI: FeatureGroup[];
}

export interface UserPermissionPayload {
  client_id: string;
  tenant_id: string;
  user_id: string;
  role: string; // e.g., "System Admin"
  plan: string; // e.g., "Standard enterprise plan"
  company_logo_url: string;
  subscription_status: SubscriptionStatus;
  date_time: DateTimeConfig;
  language: string; // e.g., "en"
  resources: Resources;
  trust_center_generate: boolean;
}
