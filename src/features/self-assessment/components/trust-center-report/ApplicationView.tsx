import ApplicationCard from "./ApplicationCard";

export interface Agent {
  agent_name: string;
  purpose: string;
  action_supported: string[];
}

export interface Model {
  model_name: string;
  model_description: string;
  model_type: string;
  provider: string;
  compliance_status: string[];
}

export interface Dataset {
  name: string;
  contains_sensitive_data: boolean;
  used_for: string;
}
export interface Metric {
  metric_name: string;
  canonical_name: string;
  raw_value: number;
  original_value: number;
  risk: number;
  risk_band: string;
  pillar: string[];
  nist: string;
  eu_article: string;
  threshold_min: number;
  threshold_max: number;
  better_high: boolean;
  compliance_note: string;
  action: string;
}
export interface Pillar {
  pillar: string;
  score: number;
  colour: string;
  metrics_count: number;
}

export interface RadarCoordinate extends Pillar {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  angle: number;
}

export interface RAIData {
  tenant_id: string;
  client_id: string;
  report_id: string;
  application_name: string;
  resource_type: string;
  pillars: Pillar[];
  metrics: Metric[];
  health_index: number;
  stars: number;
  colour: string;
  metrics_processed: number;
  created_at: string;
}
export interface Application {
  name: string;
  description?: string;
  purpose?: string;
  owner_name: string;
  use_case_type: string;
  ai_application_type: string;
  agents: Agent[];
  models: Model[];
  datasets: Dataset[];
  rai_data?: RAIData;
}
interface ApplicationViewProps {
  applications: Application[];
}

const ApplicationView: React.FC<ApplicationViewProps> = ({ applications }) => {
  return (
    <div className="space-y-4">
      {applications.map((application, index) => (
        <ApplicationCard key={index} application={application} />
      ))}
    </div>
  );
};
export default ApplicationView;
