"use client";
import CustomTabBar from "@/shared/core/CustomTabBar";
import useSwr from "@/shared/hooks/useSwr";
import { useCurrentMenuItem } from "@/shared/utils";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
const TaskData = dynamic(() => import("./TaskData"), {
  ssr: false
});
const RiskTable = dynamic(() => import("./RiskTable"), {
  ssr: false
});
const RenderOverviewContent = dynamic(() => import("./RenderOverviewContent"), {
  ssr: false
});
const MinimalTraceReport = dynamic(() => import("./MinimalTraceReport"), {
  ssr: false
});
const Graph = dynamic(() => import("./Graph"), {
  ssr: false
});
const ApplicationSurvey = dynamic(() => import("./ApplicationSurvey"), {
  ssr: false
});
const ApplicationControl = dynamic(() => import("./ApplicationControl"), {
  ssr: false
});
const CustomNotes = dynamic(() => import("@/shared/core/CustomNotes"), {
  ssr: false
});
const RiskFilter = dynamic(
  () =>
    import("@/features/risk-management/components/risk-management/RiskFilter"),
  {
    ssr: false
  }
);
export interface AIApplication {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  tenant_id: string;
  client_id: string;
  doc_id: string;
  application_id: string | null;
  version: string;
  name: string;
  purpose: string;
  use_case_type: string;
  description: string | null;
  vendor_id: string | null;
  owner_user_id: string;
  owner_name: string;
  shared_with: string[];
  sensitivity: string;
  project_name: string | null;
  department: string | null;
  ai_application_type: string | null;
  portfolio: string | null;
  privacy: string | null;
  lifecycle_stage: string | null;
  is_active: boolean;
  agent_ids: string[];
  model_ids: string[];
  dataset_ids: string[];
  survey_ids: string[];
  risk_ids: string[];
  control_ids: string[];
  deployment_environment: string | null;
  compliance_status: string[];
  compliance_issues: number;
  risk_level: string | null;
  status: string | null;
  audit_status: string | null;
  ai_scorecard: string[];
  end_user: string | null;
  task_type: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  last_audit_date: string;
  agent_details: AgentDetail[];
  model_details: ModelDetail[];
  dataset_details: DatasetDetail[];
  data_sensitivity: string[];

  deployment_context?: string | null;
  intended_users?: string | null;
  ai_behaviors?: string[];
  automation_level?: string | null;
  decision_binding?: boolean;
  human_oversight_required?: boolean;
  oversight_type?: string | null;
  oversight_role?: string | null;
}

// Agent Detail
export interface AgentDetail {
  tenant_id: string;
  client_id: string;
  doc_id: string;
  agent_id: string | null;
  agent_name: string;
  purpose: string;
  description: string | null;
  asset_source: string | null;
  version: string;
  action_supported: string[];
  human_in_loop: boolean;
  is_active: boolean;
  is_scanned: boolean;
  risks: string[]; // assuming risk IDs or empty
  lifecycle_state: string;
  application_ids: string[];
  model_ids: string[];
  created_at: string;
  updated_at: string;
}

// Model Detail
export interface ModelDetail {
  tenant_id: string;
  client_id: string;
  doc_id: string;
  model_id: string | null;
  model_name: string;
  model_description: string;
  model_type: "predictive" | "generative" | string;
  asset_source: string | null;
  provider: string;
  model_version: string;
  model_status: string;
  fine_tuned: boolean;
  output_type: string | null;
  model_application: string | null;
  created_by: string | null;
  creation_timestamp: string | null;
  last_updated: string | null;
  model_location: string | null;
  is_scanned: boolean;
  compliance_status: string[];
  risks: string[];
  application_ids: string[];
  agent_ids: string[];
  dataset_ids: string[];
  created_at: string;
  updated_at: string;
}

// Dataset Detail
export interface DatasetDetail {
  tenant_id: string;
  client_id: string;
  doc_id: string;
  dataset_id: string | null;
  name: string;
  dataset_version: string;
  dataset_type: string | null;
  contains_sensitive_data: boolean;
  mlops_platforms: string[];
  data_sources: string;
  size_in_gb: number | null;
  preprocessing_steps: string[];
  used_in_training_jobs: string[];
  is_scanned: boolean;
  risks: string[];
  used_for: string;
  model_ids: string[];
  application_ids: string[];
  created_at: string;
  updated_at: string;
}
interface ISAccess {
  tab_name: string;
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        update: boolean;
        delete: boolean;
        read: boolean;
      };
    };
  }[];
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      update: boolean;
      delete: boolean;
      read: boolean;
    };
  };
}
const ApplicationDetails = () => {
  const id = useParams()["id"];
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [tab, setTab] = useState("");
  const { data, isValidating, mutate } = useSwr(`application?doc_id=${id}`);
  const [filterUrl, setFilterUrl] = useState("");
  const baseUrl = useMemo(
    () =>
      !isValidating && data
        ? `risks?page=${page + 1}&limit=${pageSize}&application_id=${id}`
        : "",
    [page, pageSize, id, isValidating, data]
  );
  const finalUrl = useMemo(() => {
    if (filterUrl && filterUrl !== baseUrl) {
      const filterParams = filterUrl.replace(baseUrl, "").replace(/^&/, "");
      return filterParams ? `${baseUrl}&${filterParams}` : baseUrl;
    }
    return baseUrl;
  }, [baseUrl, filterUrl]);
  const { data: riskData, isValidating: isRiskLoading } = useSwr(finalUrl);
  const handleUrlChange = useCallback((newUrl: string) => {
    setFilterUrl(newUrl);
  }, []);
  const currentAccess = useCurrentMenuItem();
  const visibleTabs =
    currentAccess?.tabs?.[0]?.buttons?.[0]?.tabs?.filter(
      (tabItem: { permission: { is_shown: boolean } }) =>
        tabItem?.permission?.is_shown === true
    ) || [];
  const createTabLabel = (tabItem: {
    tab_name: string;
    metadata?: { label?: string };
  }) => {
    const tabName = tabItem.tab_name;
    const metaLabel = tabItem.metadata?.label;

    if (!metaLabel || metaLabel === currentAccess?.metadata?.label) {
      return tabName.charAt(0).toUpperCase() + tabName.slice(1);
    }
    return metaLabel;
  };
  const tabMapping = visibleTabs.reduce(
    (
      acc: Record<string, string>,
      tabItem: { tab_name: string; metadata?: { label?: string } }
    ) => {
      const displayLabel = createTabLabel(tabItem);
      acc[displayLabel] = tabItem.tab_name;
      return acc;
    },
    {}
  );

  const tabLabels = visibleTabs.map(
    (tabItem: { tab_name: string; metadata?: { label?: string } }) =>
      createTabLabel(tabItem)
  );
  const activeReference =
    tabMapping[tab] || tabMapping[tabLabels[0] || "Overview"];
  const currentTab = tab || tabLabels[0] || "Overview";
  const getTabContent = () => {
    const backendTabName = activeReference || tabLabels[0];
    const contentMapping: { [key: string]: React.ReactNode } = {
      overview: (
        <RenderOverviewContent
          data={data}
          mutate={mutate}
          isValidating={isValidating}
          isAccess={
            visibleTabs?.find(
              (tabItem: ISAccess) => tabItem.tab_name === "overview"
            ) as ISAccess
          }
        />
      ),
      model_performance: <Graph />,
      task: <TaskData />,
      tasks: <TaskData />,
      risks: (
        <div className="flex w-full flex-col gap-5">
          <RiskFilter
            baseUrl={baseUrl}
            onUrlChange={handleUrlChange}
            showApplication={false}
          />
          <RiskTable
            data={riskData || []}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            isValidating={isValidating || isRiskLoading}
            isAccess={
              visibleTabs?.find(
                (tabItem: ISAccess) => tabItem.tab_name === "risks"
              ) as ISAccess
            }
          />
        </div>
      ),
      controls: <ApplicationControl applicationId={id as string} />,
      survey: <ApplicationSurvey />,
      notes: (
        <div className="h-[calc(100vh-200px)] w-full">
          <CustomNotes id={id as string} type="application" />
        </div>
      ),
      "TRACE Report": <MinimalTraceReport />
    };

    // Also support frontend display names as fallback
    const displayNameMapping: { [key: string]: React.ReactNode } = {
      Overview: (
        <RenderOverviewContent
          data={data}
          mutate={mutate}
          isValidating={isValidating}
          isAccess={
            visibleTabs?.find(
              (tabItem: ISAccess) => tabItem.tab_name === "overview"
            ) as ISAccess
          }
        />
      ),
      "Model Performance": <Graph />,
      Task: <TaskData />,
      Tasks: <TaskData />,
      Risks: (
        <RiskTable
          data={riskData || []}
          page={page}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          isValidating={isValidating}
          isAccess={
            visibleTabs?.find(
              (tabItem: ISAccess) => tabItem.tab_name === "risks"
            ) as ISAccess
          }
        />
      ),
      Controls: <ApplicationControl applicationId={id as string} />,
      Survey: <ApplicationSurvey />,
      Notes: (
        <div className="h-[calc(100vh-200px)] w-full">
          <CustomNotes id={id as string} type="application" />
        </div>
      ),
      "Trace Report": <MinimalTraceReport />
    };

    // Try backend name first, then display name, then default
    return (
      (backendTabName && contentMapping[backendTabName.toLowerCase()]) ||
      displayNameMapping[currentTab] || (
        <RenderOverviewContent
          data={data}
          mutate={mutate}
          isValidating={isValidating}
          isAccess={
            visibleTabs?.find(
              (tabItem: ISAccess) => tabItem.tab_name === "overview"
            ) as ISAccess
          }
        />
      )
    );
  };

  return (
    <div className="relative flex w-full flex-col gap-5 overflow-y-auto px-2 pt-3">
      <CustomTabBar
        tabs={tabLabels}
        defaultTab={tabLabels[0] || "Overview"}
        activeTab={currentTab}
        setActiveTab={setTab}
        className="rounded-lg bg-white drop-shadow-2 dark:bg-darkSidebarBackground"
        instanceId="Main-Tab"
      />

      <div className="h-fit w-full">{getTabContent()}</div>
    </div>
  );
};

export default ApplicationDetails;
