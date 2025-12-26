// types/overview.types.ts

export type AssetCreationMode = "agent" | "direct" | null;

export interface ExpandedCards {
  [key: string]: boolean;
}

export interface Model {
  doc_id: string;
  model_name: string;
  model_description: string;
  model_type: string;
  provider: string;
  model_version: string;
  model_status: string;
  compliance_status: string[];
  fine_tuned: boolean;
  eval_metrics?: string;
  created_at: string;
  dataset_ids?: string[];
  agent_ids?: string[];
  updated_at: string;
  is_scanned: boolean;
  application_ids?: string[];
}

export interface Agent {
  doc_id: string;
  agent_name: string;
  purpose: string;
  version: string;
  action_supported: string[];
  human_in_loop: boolean;
  is_active: boolean;
  created_at: string;
  model_ids?: string[];
  lifecycle_state?: string;
}

export interface Dataset {
  doc_id: string;
  name: string;
  dataset_version: string;
  contains_sensitive_data: boolean;
  data_sources: string;
  used_for: string;
  size_in_gb?: number;
  preprocessing_steps?: string[];
  created_at: string;
  is_scanned: boolean;
  model_ids: string[];
  application_ids: string[];
  updated_at: string;
}
export interface ComplianceStatusOption {
  value: string;
  label: string;
}

export interface ModelTypeOption {
  value: string;
  label: string;
}

export interface DataSourceOption {
  value: string;
  label: string;
}

export interface UsedForOption {
  value: string;
  label: string;
}

export interface PreprocessingStepOption {
  value: string;
  label: string;
}

export interface ActionSupportedOption {
  value: string;
  label: string;
}

export interface AssetHandlers {
  handleAddModel: () => void;
  handleAddAgent: () => void;
  handleEditModel: (model: Model) => void;
  handleEditAgent: (agent: Agent) => void;
  handleEditDataset: (dataset: Dataset) => void;
  handleDeleteModel: (model: Model) => void;
  handleDeleteAgent: (agent: Agent) => void;
  handleDeleteDataset: (dataset: Dataset) => void;
  closeAssetDialog: () => void;
}

export interface ApplicationData {
  doc_id: string;
  name: string;
  compliance_status?: string[];
  risk_level?: string;
  audit_status?: string;
  risk_ids?: string[];
  control_ids?: string[];
  survey_ids?: string[];
  model_details?: Model[];
  agent_details?: Agent[];
  dataset_details?: Dataset[];
}

export interface AccessPermissions {
  buttons?: Array<{
    permission?: {
      is_shown: boolean;
      actions?: {
        create: boolean;
      };
    };
  }>;
}
