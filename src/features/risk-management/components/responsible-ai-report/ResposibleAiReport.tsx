"use client";
import useSwr from "@/shared/hooks/useSwr";
import { useMyContext } from "@/shared/providers/AppProvider";
import { useCurrentMenuItem } from "@/shared/utils";
import { useEffect, useState } from "react";
import { HeaderCard, IsAccess } from "./HeaderCard";
import { ComplianceDashboardProps } from "./NewComplianceCard";
import { LoadingState, NoDataState } from "./StateComponents";
import dynamic from "next/dynamic";
const RiskDetailsCard = dynamic(() => import("./RiskDetailsCard"), {
  ssr: false
});
const ResponsibleIndexCard = dynamic(() => import("./ResponsibleIndexCard"), {
  ssr: false
});
const PillarPerformance = dynamic(() => import("./PillarPerformance"), {
  ssr: false
});
const PillarDetailView = dynamic(() => import("./PillarDetailView"), {
  ssr: false
});
const NewComplianceCard = dynamic(() => import("./NewComplianceCard"), {
  ssr: false
});
const GapMapVisualization = dynamic(() => import("./GapMapVisualization"), {
  ssr: false
});
const CombinedActionsCard = dynamic(() => import("./CombinedActionsCard"), {
  ssr: false
});

export interface CanonicalDetail {
  name: string;
  description: string;
}

export interface ControlDetail {
  id: string;
  name: string;
  description: string;
  compliance_details: {
    framework: string;
    reference: string;
    objective: string;
    short_description: string;
    obligation_title: string;
    regulatory_source_version: string;
    reference_keywords: string[];
  }[];
}

export interface CommonRiskDetail {
  id: string;
  name: string;
  description: string;
}

export interface BusinessImpact {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  severity: string;
  example: string;
  risk_types: string[];
  explaination: string;
  created_at: string;
  updated_at: string;
}

export interface ActionDetail {
  action_id: string;
  ml_engineer_action: string[];
  business_manager_action: string[];
  compliance_manager_action: string[];
  description: string;
  source: string[];
  control_ids: string[];
  common_metric: string;
}

export interface Metric {
  metric_name: string;
  canonical_details: CanonicalDetail[];
  common_metric_name: string;
  common_metric_description: string;
  raw_value: number;
  original_value: number;
  risk_score: number;
  risk_band: "low" | "med" | "high";
  risk_name: string;
  risk_id: string;
  risk_description: string;
  control_details: ControlDetail[];
  common_risk_details: CommonRiskDetail[];
  business_impact: BusinessImpact[];
  pillar: string[];
  threshold_min: number;
  threshold_max: number;
  better_high: boolean;
  action_details: ActionDetail[];
  task_completed?: boolean;
}

export interface PillarMetric {
  pillar: string;
  score: number;
  colour: string;
  metrics_count: number;
  metrics: Metric[];
}

export interface ComplianceSummary {
  framework: string;
  high: number;
  med: number;
  low: number;
}

export interface ComplianceReport {
  metric: string;
  framework: string;
  clause?: string;
  eu_article?: string;
  status: "low" | "med" | "high";
}

export interface ApiData {
  tenant_id: string;
  client_id: string;
  report_id: string;
  application_id: string;
  application_name: string;
  resource_type: string;
  health_index: number;
  stars: number;
  colour: string;
  metrics_processed: number;
  created_at: string;
  pillar_metrics: PillarMetric[];
  compliance_summary: ComplianceSummary[];
  compliance_report: ComplianceReport[];
  provider?: string;
  use_case?: string;
  compliance_failed: unknown[];
}

export interface RadarPoint {
  name: string;
  value: number;
  color: string;
  metrics_count: number;
  metrics: Metric[];
  hasData: boolean;
}

export interface StarRatingProps {
  rating: number;
  total?: number;
}

export type MetricDetailTab =
  | "risks"
  | "actions"
  | "compliance"
  | "businessImpact";

// Helper function to check if data is valid
const isValidApiData = (data: ApiData): data is ApiData => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.health_index === "number" &&
    Array.isArray(data.pillar_metrics)
  );
};

const ResponsibleAIReport = () => {
  const { data, isValidating, mutate } = useSwr("responsible-ai/report");
  const { setFullScreen } = useMyContext();
  const [selectedPillar, setSelectedPillar] = useState<PillarMetric | null>(
    null
  );
  const [selectedMetricId, setSelectedMetricId] = useState<string | undefined>(
    undefined
  );
  const currentAccess = useCurrentMenuItem();
  // Enhanced setSelectedPillar function
  const handleSetSelectedPillar = (pillar: PillarMetric, metricId?: string) => {
    setSelectedPillar(pillar);
    setSelectedMetricId(metricId);

    // Scroll to metric if metricId is provided
    if (metricId) {
      setTimeout(() => {
        const element = document.getElementById(metricId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };
  useEffect(() => {
    if (!isValidating && data) {
      setFullScreen(true);
    }
  }, [isValidating, data]);
  if (isValidating && !data) {
    return <LoadingState />;
  }

  if (!data || !isValidApiData(data)) {
    return <NoDataState />;
  }

  // If a pillar is selected, show the detail view
  if (selectedPillar) {
    return (
      <div className="flex w-full items-center justify-center px-2 pt-5 sm:px-6 lg:px-8">
        <PillarDetailView
          pillar={selectedPillar}
          onBack={() => {
            setSelectedPillar(null);
            setSelectedMetricId(undefined);
          }}
          {...(selectedMetricId && { selectedMetricId })}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pt-5 2xl:container lg:space-y-8 xl:px-10 2xl:mx-auto">
      {/* Header Card */}
      <HeaderCard
        data={data}
        mutate={mutate}
        isAccess={currentAccess?.buttons?.[0] as IsAccess}
      />
      <ResponsibleIndexCard data={data} />

      <PillarPerformance data={data} onPillarClick={handleSetSelectedPillar} />
      <GapMapVisualization data={data} />
      <RiskDetailsCard data={data} />
      {/* <ComplianceOverviewCard data={data} /> */}
      <NewComplianceCard data={data as ComplianceDashboardProps["data"]} />
      <CombinedActionsCard
        data={data}
        setSelectedPillar={handleSetSelectedPillar}
        mutate={mutate}
      />
    </div>
  );
};

export default ResponsibleAIReport;
