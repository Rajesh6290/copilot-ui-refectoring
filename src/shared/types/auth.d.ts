interface Metadata {
  resource_type: "UI";
  name: string;
  icon: string;
}

interface PermissionActions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

interface Permission {
  permission_level: "manager";
  actions: PermissionActions;
}

interface Tab {
  tab_name: string;
  resource_id: string;
  metadata: Metadata;
  permission: Permission;
}

interface Feature {
  feature_name: string;
  resource_id: string;
  metadata: Metadata;
  permission: Permission;
  tabs: Tab[];
  sub_features: Feature[];
  buttons: {
    feature_name: string;
    resource_id: string;
    metadata: Metadata;
    permission: Permission;
    tabs: Tab[];
  }[];
}

interface FeatureGroup {
  feature_group_name: string;
  resource_id: string;
  metadata: Metadata;
  permission: Permission;
  features: Feature[];
}

interface UserData {
  user_id: string;
  email_id: string;
  database_name: string;
  sensitivity: boolean;
  account_type: "single_account";
  tenant_id: string;
  client_id: string;
  partner_id: string | null;
  role_id: string;
  provider: string;
  provider_id: string;
  plan_id: string;
  first_name: string;
  last_name: string;
  region: string;
  user_name: string | null;
  multifactor_enabled: boolean;
  group_ids: string[];
  created_at: string;
  updated_at: string;
  last_login: string;
  ui_permissions: FeatureGroup[];
}

interface ResponseMetadata {
  request_id: string;
  timestamp: string;
  pagination: null;
}
