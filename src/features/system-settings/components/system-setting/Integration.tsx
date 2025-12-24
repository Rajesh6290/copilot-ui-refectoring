import useSwr from "@/shared/hooks/useSwr";
import {
  AlertCircle,
  BarChart3,
  ChevronRight,
  Settings,
  Slack
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { JSX, useEffect, useState } from "react";
import JiraIntegration from "./JiraIntegration";
const IntegrationCard = dynamic(() => import("./IntegrationCard"), {
  ssr: false
});
const SlackIntegration = dynamic(() => import("./SlackIntegration"), {
  ssr: false
});

// Types from your existing code
export interface Permission {
  is_shown: boolean;
  permission_set: string;
  actions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

export interface Button {
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

export interface SubTab {
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

export interface IntegrationData {
  tab_name: string;
  resource_id: string;
  sub_tabs: SubTab[];
  metadata: {
    reference: string;
    resource_type: string;
    label: string;
    icon: string;
    route: string;
  };
  permission: Permission;
}

// Integration metadata type
export interface IntegrationMetadata {
  name: string;
  description: string;
  image: string;
  bgColor: string;
  darkBgColor: string;
  status: "connected" | "partial" | "disconnected";
  channelsConfigured?: boolean; // For Slack-specific channel status
}

// Skeleton Card Component
const SkeletonCard: React.FC = () => {
  return (
    <div className="min-w-[280px] max-w-sm animate-pulse rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
            <div className="min-w-0 flex-1">
              <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-1 h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
        <div className="mb-4 flex flex-col gap-2">
          <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-6 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
          <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </div>
  );
};

// Component mapping
const TabComponentMapper: Record<
  string,
  React.ComponentType<{ tabData: SubTab }>
> = {
  "settings-slack-integration": SlackIntegration,
  "jira-integration": JiraIntegration
};

// Get icon based on integration reference
export const getIntegrationIcon = (reference: string): JSX.Element => {
  const iconMap: Record<string, JSX.Element> = {
    "settings-slack-integration": <Slack className="h-8 w-8" />,
    "jira-integration": <BarChart3 className="h-8 w-8" />
  };
  return iconMap[reference] || <Settings className="h-8 w-8" />;
};
interface IntegrationProps {
  isAccess: IntegrationData;
}

const Integration: React.FC<IntegrationProps> = ({ isAccess }) => {
  const [activeTab, setActiveTab] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "details">("cards");

  // Fetch both Slack and Jira data
  const { data: slackData, isValidating: slackValidating } = useSwr(
    "integrations/slack/credintials"
  );
  const { data: jiraData, isValidating: jiraValidating } = useSwr(
    "integrations/jira/credentials"
  );

  // Calculate Slack integration status
  const getSlackStatus = (): {
    status: "connected" | "partial" | "disconnected";
    channelsConfigured: boolean;
  } => {
    if (!slackData) {
      return { status: "disconnected", channelsConfigured: false };
    }
    const isConfigured =
      slackData.slack_client_id && slackData.slack_client_secret;
    const isConnected = slackData.config_enabled === true;
    const hasChannels =
      slackData.slack_teams?.some(
        (team: { channels?: Array<{ length: number }> }) =>
          team?.channels && team.channels.length > 0
      ) || false;

    if (isConnected && hasChannels) {
      return { status: "connected", channelsConfigured: true };
    } else if (isConfigured || isConnected) {
      return { status: "partial", channelsConfigured: hasChannels };
    }
    return { status: "disconnected", channelsConfigured: hasChannels };
  };

  // Calculate Jira integration status
  const getJiraStatus = (): "connected" | "partial" | "disconnected" => {
    if (!jiraData) {
      return "disconnected";
    }
    const isConfigured =
      jiraData.jira_base_url && jiraData.jira_email && jiraData.jira_api_token;
    const isConnected = jiraData.config_enabled === true;

    if (isConfigured && isConnected) {
      return "connected";
    } else if (isConfigured) {
      return "partial";
    }
    return "disconnected";
  };

  const slackStatus = getSlackStatus();
  const jiraStatus = getJiraStatus();

  // Integration metadata with dynamic status
  const integrationMetadata: Record<string, IntegrationMetadata> = {
    "settings-slack-integration": {
      name: "Slack",
      description:
        "Team communication and collaboration platform for modern workspaces",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/1024px-Slack_icon_2019.svg.png",
      bgColor: "bg-purple-50",
      darkBgColor: "dark:bg-purple-900/10",
      status: slackStatus.status,
      channelsConfigured: slackStatus.channelsConfigured
    },
    "jira-integration": {
      name: "Jira",
      description:
        "Project management and issue tracking for agile development teams",
      image:
        "https://w7.pngwing.com/pngs/992/738/png-transparent-jira-hd-logo-thumbnail.png",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-900/10",
      status: jiraStatus
    }
  };

  // Get visible integrations based on permissions
  const visibleIntegrations = isAccess.sub_tabs.filter(
    (tab) => tab.permission.is_shown
  );

  // Initialize active tab from URL hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("integration-sub-tab=")) {
      const tabName = hash.replace("integration-sub-tab=", "");
      const foundTab = visibleIntegrations.find(
        (tab) => tab.metadata.reference === tabName
      );
      if (foundTab) {
        setActiveTab(tabName);
        setViewMode("details");
      }
    }
  }, [visibleIntegrations]);

  // Handle integration configuration
  const handleConfigure = (integration: SubTab) => {
    setActiveTab(integration.metadata.reference);
    setViewMode("details");
    window.location.hash = `integration-sub-tab=${integration.metadata.reference}`;
  };

  // Handle back to cards view
  const handleBackToCards = () => {
    setViewMode("cards");
    setActiveTab("");
    window.location.hash = "";
  };

  // Render tab content for details view
  const renderTabContent = () => {
    const activeTabData = visibleIntegrations.find(
      (tab) => tab.metadata.reference === activeTab
    );
    if (!activeTabData) {
      return null;
    }

    const TabComponent = TabComponentMapper[activeTabData.metadata.reference];

    if (TabComponent) {
      return <TabComponent tabData={activeTabData} />;
    }

    const metadata = integrationMetadata[activeTabData.metadata.reference];
    return (
      <div className="p-8">
        <div className="py-12 text-center">
          <div
            className={`h-24 w-24 ${metadata?.bgColor || "bg-gray-100"} ${metadata?.darkBgColor || "dark:bg-gray-700"} mx-auto mb-6 flex items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-600`}
          >
            {getIntegrationIcon(activeTabData.metadata.reference)}
          </div>
          <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {metadata?.name || activeTabData.metadata.label}
          </h3>
          <p className="mx-auto mb-4 max-w-md text-gray-600 dark:text-gray-400">
            {metadata?.description || "Configuration interface coming soon..."}
          </p>
          <div className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-4 py-2 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            <AlertCircle className="h-4 w-4" />
            Component not implemented yet
          </div>
          <div className="mx-auto mt-6 max-w-md rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              <strong>To implement this integration:</strong>
            </p>
            <ol className="space-y-1 text-left text-sm text-gray-600 dark:text-gray-400">
              <li>1. Create your integration component</li>
              <li>2. Import it in this file</li>
              <li>3. Add it to the TabComponentMapper</li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  // Check if we're still loading data
  const isLoading = slackValidating || jiraValidating;

  // Cards view
  if (viewMode === "cards") {
    return (
      <div className="h-fit w-full p-4 sm:p-6">
        <div className="w-full">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <Settings className="h-8 w-8 text-tertiary-600 dark:text-tertiary-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Integrations
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
              Configure and manage your system integrations
            </p>
          </div>

          {isLoading ? (
            <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              {visibleIntegrations.map((integration) => {
                const metadata =
                  integrationMetadata[integration.metadata.reference];
                if (!metadata) {
                  return null;
                }

                return (
                  <IntegrationCard
                    key={integration.resource_id}
                    integration={integration}
                    metadata={metadata}
                    onConfigure={handleConfigure}
                  />
                );
              })}
            </div>
          )}

          {!isLoading && visibleIntegrations.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700">
                <Settings className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                No integrations available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Contact your administrator to enable integrations
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-fit p-4 sm:p-6">
      <div className="w-full">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={handleBackToCards}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:text-base"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to Integrations
            </button>
          </div>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Integration;
