export interface MENUARRPROPS {
  id: number;
  name: string;
  icon?: React.ReactNode;
  menus: boolean;
  item?: SUBMENU[];
  route?: string;
}
export interface SUBMENU {
  id: number;
  name: string;
  icon: React.ReactNode;
  route?: string;
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

interface Metadata {
  reference?: string;
  resource_type?: string;
  label?: string;
  icon?: string;
  route?: string;
}

interface Button {
  button_name: string;
  resource_id: string;
  metadata?: Metadata;
  permission: Permission;
  tabs?: Tab[];
}

interface Tab {
  tab_name: string;
  resource_id: string;
  buttons: Button[];
  metadata?: Metadata;
  permission: Permission;
}

interface SubFeature {
  sub_feature_name: string;
  resource_id: string;
  metadata?: Metadata;
  permission: Permission;
  buttons?: Button[];
  tabs?: Tab[];
}

interface Feature {
  feature_name: string;
  resource_id: string;
  metadata?: Metadata;
  permission: Permission;
  buttons?: Button[];
  tabs?: Tab[];
  sub_features?: SubFeature[];
}

interface FeatureGroup {
  feature_group_name: string;
  resource_id: string;
  features: Feature[];
  metadata?: Metadata;
  permission: Permission;
}

interface FlattenedMenuItem {
  feature_name?: string;
  sub_feature_name?: string;
  resource_id: string;
  metadata: Metadata;
  permission: Permission;
  route: string;
  label: string;
  parentLabel?: string;
  type: "feature" | "sub_feature";
  buttons?: Button[];
  tabs?: Tab[];
}
