"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import { useAssetHandlers } from "../../hooks/useAssetHandlers";
import { useOverviewData } from "../../hooks/useOverviewData";
import {
  Agent,
  AssetCreationMode,
  Dataset,
  ExpandedCards,
  Model
} from "../../types/overview.types";
import { AIApplication } from "./ApplicationDetails";
import dynamic from "next/dynamic";
const ResourceRelationships = dynamic(() => import("./ResourceRelationships"), {
  ssr: false
});
const ModelsSection = dynamic(() => import("./ModelsSection"), {
  ssr: false
});
const EditDialogs = dynamic(() => import("./EditDialogs"), {
  ssr: false
});
const DatasetsSection = dynamic(() => import("./DatasetsSection"), {
  ssr: false
});
const AssetCreationDialog = dynamic(() => import("./AssetCreationDialog"), {
  ssr: false
});
const ApplicationInfo = dynamic(() => import("./ApplicationInfo"), {
  ssr: false
});
const ApplicationDetailsContent = dynamic(
  () => import("./ApplicationDetailsContent"),
  {
    ssr: false
  }
);
const AgentsSection = dynamic(() => import("./AgentsSection"), {
  ssr: false
});
// Skeleton Components
const SkeletonBox = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`} />
);

const SectionSkeleton = () => (
  <motion.div
    className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-xl dark:border-neutral-700 dark:from-darkSidebarBackground dark:to-gray-900/20"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <SkeletonBox className="h-12 w-12 rounded-xl" />
        <div>
          <SkeletonBox className="h-6 w-32 rounded" />
          <SkeletonBox className="mt-2 h-4 w-24 rounded" />
        </div>
      </div>
      <SkeletonBox className="h-10 w-32 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center space-x-2">
                <SkeletonBox className="h-5 w-5 rounded" />
                <SkeletonBox className="h-6 w-48 rounded" />
              </div>
              <SkeletonBox className="h-4 w-full rounded" />
              <SkeletonBox className="mt-2 h-4 w-3/4 rounded" />
            </div>
            <div className="flex space-x-2">
              <SkeletonBox className="h-8 w-8 rounded-lg" />
              <SkeletonBox className="h-8 w-8 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_i, i) => (
              <div
                key={i}
                className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
              >
                <SkeletonBox className="h-4 w-16 rounded" />
                <SkeletonBox className="mt-1 h-6 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};
interface ISAccess {
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
interface RenderOverviewContentProps {
  data: AIApplication;
  mutate: () => void;
  isAccess: ISAccess;
  isValidating?: boolean;
}

const RenderOverviewContent: React.FC<RenderOverviewContentProps> = ({
  data,
  mutate,
  isAccess,
  isValidating = false
}) => {
  // State management
  const [expandedCards, setExpandedCards] = useState<ExpandedCards>({});
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [assetCreationMode, setAssetCreationMode] =
    useState<AssetCreationMode>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [agentData, setAgentData] = useState<string>("");
  const [modelData, setModelData] = useState<string>("");
  const [anotherDatasetLoading, setAnotherDatasetLoading] =
    useState<boolean>(false);
  const [saveWithoutDatasetLoading, setSaveWithoutDatasetLoading] =
    useState<boolean>(false);

  // Edit dialog states
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [showDatasetDialog, setShowDatasetDialog] = useState(false);
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  // Custom hooks
  const { linkedModels, linkedAgents, linkedDatasets } = useOverviewData({
    ...data,
    risk_level: data?.risk_level ?? "",
    audit_status: data?.audit_status ?? "",
    dataset_details:
      data?.dataset_details?.map((dataset) => ({
        ...dataset,
        size_in_gb: dataset.size_in_gb ?? 0
      })) ?? []
  });
  const {
    handleAddModel,
    handleAddAgent,
    handleEditModel,
    handleEditAgent,
    handleEditDataset,
    handleDeleteModel,
    handleDeleteAgent,
    handleDeleteDataset,
    closeAssetDialog,
    isLoading: isHandlerLoading
  } = useAssetHandlers({
    setAssetCreationMode,
    setActiveStep,
    setShowAssetDialog,
    setSelectedModel,
    setSelectedAgent,
    setSelectedDataset,
    setIsEditMode,
    setShowModelDialog,
    setShowAgentDialog,
    setShowDatasetDialog,
    setAgentData,
    setModelData,
    mutate
  });

  const toggleCardExpansion = (cardType: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardType]: !prev[cardType]
    }));
  };

  const assetDialogProps = {
    isLoading: isHandlerLoading,
    anotherDatasetLoading,
    showAssetDialog,
    closeAssetDialog,
    assetCreationMode,
    activeStep,
    getSteps: () => [],
    setActiveStep,
    getStepInitialValues: () => ({}),
    getStepValidationSchema: () => ({}),
    agentData,
    setAgentData,
    modelData,
    setModelData,
    setAnotherDatasetLoading,
    saveWithoutDatasetLoading,
    setSaveWithoutDatasetLoading,
    selectedApplicationForAsset: {
      ...data,
      risk_level: data?.risk_level ?? "",
      audit_status: data?.audit_status ?? "",
      lifecycle_stage: data?.lifecycle_stage ?? "",
      department: data?.department ?? "",
      shared_with: Array.isArray(data?.shared_with)
        ? data?.shared_with.join(", ")
        : (data?.shared_with ?? "")
    },
    mutate,
    handleSubmitAgent: async () => {},
    handleSubmitAgentOnly: async () => {},
    handleSubmitModel: async () => {},
    handleSubmitModelWithoutDataset: async () => {},
    handleSubmitDataset: async () => {},
    handleAnotherDataset: async () => {},
    handleAddAnotherDataset: async () => {}
  };

  const editDialogsProps = {
    showModelDialog,
    setShowModelDialog,
    showDatasetDialog,
    setShowDatasetDialog,
    showAgentDialog,
    setShowAgentDialog,
    selectedModel,
    selectedDataset,
    selectedAgent,
    isEditMode,
    mutate
  };

  // Determine if we should show loading state
  const shouldShowLoading = isValidating || isHandlerLoading;
  const shouldShowResourceRelationShip = () => {
    return (
      isAccess?.buttons?.[1]?.permission?.is_shown ||
      isAccess?.buttons?.[5]?.permission?.is_shown
    );
  };
  return (
    <div className="w-full space-y-8">
      <ApplicationInfo
        handleAddModel={handleAddModel}
        handleAddAgent={handleAddAgent}
      />

      <ApplicationDetailsContent data={data} />

      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Resource Relationships */}
        {shouldShowResourceRelationShip() &&
          (linkedAgents?.length > 0 || linkedModels?.length > 0) && (
            <ResourceRelationships
              data={{
                ...data,
                risk_level: data.risk_level ?? "",
                audit_status: data.audit_status ?? "",
                dataset_details:
                  data.dataset_details?.map((dataset) => ({
                    ...dataset,
                    size_in_gb: dataset.size_in_gb ?? 0
                  })) ?? []
              }}
              linkedModels={linkedModels}
              linkedAgents={linkedAgents}
              linkedDatasets={linkedDatasets}
              cardVariants={cardVariants}
            />
          )}

        {/* Show skeleton loading or actual content */}
        {shouldShowLoading && !data ? (
          <>
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </>
        ) : (
          <>
            {/* Models Section */}
            {isAccess?.buttons?.[1]?.permission?.is_shown && (
              <ModelsSection
                linkedModels={linkedModels}
                expandedCards={expandedCards}
                toggleCardExpansion={toggleCardExpansion}
                handleAddModel={handleAddModel}
                handleEditModel={handleEditModel}
                handleDeleteModel={handleDeleteModel}
                isAccess={isAccess}
                cardVariants={cardVariants}
                mutate={mutate}
                isRefreshing={shouldShowLoading}
              />
            )}

            {/* Agents Section */}
            {isAccess?.buttons?.[5]?.permission?.is_shown && (
              <AgentsSection
                linkedAgents={linkedAgents}
                expandedCards={expandedCards}
                toggleCardExpansion={toggleCardExpansion}
                handleAddAgent={handleAddAgent}
                handleEditAgent={handleEditAgent}
                handleDeleteAgent={handleDeleteAgent}
                isAccess={isAccess}
                cardVariants={cardVariants}
                mutate={mutate}
                isRefreshing={shouldShowLoading}
              />
            )}

            {/* Datasets Section */}
            {isAccess?.buttons?.[1]?.permission?.is_shown && (
              <DatasetsSection
                linkedDatasets={linkedDatasets}
                expandedCards={expandedCards}
                toggleCardExpansion={toggleCardExpansion}
                handleEditDataset={handleEditDataset}
                handleDeleteDataset={handleDeleteDataset}
                cardVariants={cardVariants}
                mutate={mutate}
                isRefreshing={shouldShowLoading}
                isAccess={isAccess}
              />
            )}

            {/* Compliance & Risk Assessment */}
            {/* <ComplianceSection data={data} cardVariants={cardVariants} /> */}
          </>
        )}
      </motion.div>

      {/* Asset Creation Dialog */}
      <AssetCreationDialog {...assetDialogProps} />

      {/* Edit Dialogs */}
      <EditDialogs {...editDialogsProps} />
    </div>
  );
};

export default RenderOverviewContent;
