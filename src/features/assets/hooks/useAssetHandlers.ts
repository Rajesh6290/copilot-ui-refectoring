import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  Agent,
  AssetCreationMode,
  Dataset,
  Model
} from "../types/overview.types";
import useMutation from "@/shared/hooks/useMutation";

interface UseAssetHandlersProps {
  setAssetCreationMode: (mode: AssetCreationMode) => void;
  setActiveStep: (step: number) => void;
  setShowAssetDialog: (show: boolean) => void;
  setSelectedModel: (model: Model | null) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  setSelectedDataset: (dataset: Dataset | null) => void;
  setIsEditMode: (edit: boolean) => void;
  setShowModelDialog: (show: boolean) => void;
  setShowAgentDialog: (show: boolean) => void;
  setShowDatasetDialog: (show: boolean) => void;
  setAgentData: (data: string) => void;
  setModelData: (data: string) => void;
  mutate: () => void;
}

export const useAssetHandlers = ({
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
}: UseAssetHandlersProps) => {
  const { mutation, isLoading } = useMutation();

  const handleAddModel = () => {
    setAssetCreationMode("direct");
    setActiveStep(0);
    setShowAssetDialog(true);
  };

  const handleAddAgent = () => {
    setAssetCreationMode("agent");
    setActiveStep(0);
    setShowAssetDialog(true);
  };

  const handleEditModel = (model: Model) => {
    setSelectedModel(model);
    setIsEditMode(true);
    setShowModelDialog(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsEditMode(true);
    setShowAgentDialog(true);
  };

  const handleEditDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setIsEditMode(true);
    setShowDatasetDialog(true);
  };

  const handleDeleteModel = (model: Model) => {
    Swal.fire({
      title: "Delete Model",
      text: `Are you sure you want to delete the model "${model.model_name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await mutation(`model?doc_id=${model.doc_id}`, {
            method: "DELETE",
            isAlert: false,
            body: null
          });
          if (res?.status === 200) {
            toast.success("Model deleted successfully");
            mutate();
          }
        } catch (error: unknown) {
          toast.error(
            error instanceof Error ? error.message : "Failed to delete model"
          );
        }
      }
    });
  };

  const handleDeleteAgent = (agent: Agent) => {
    Swal.fire({
      title: "Delete Agent",
      text: `Are you sure you want to delete the agent "${agent.agent_name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await mutation(`agent?doc_id=${agent.doc_id}`, {
            method: "DELETE",
            isAlert: false,
            body: null
          });
          if (res?.status === 200) {
            toast.success("Agent deleted successfully");
            mutate();
          }
        } catch (error: unknown) {
          toast.error(
            error instanceof Error ? error.message : "Failed to delete model"
          );
        }
      }
    });
  };

  const handleDeleteDataset = (dataset: Dataset) => {
    Swal.fire({
      title: "Delete Dataset",
      text: `Are you sure you want to delete the dataset "${dataset.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await mutation(`dataset?doc_id=${dataset.doc_id}`, {
            method: "DELETE",
            isAlert: false,
            body: null
          });
          if (res?.status === 200) {
            toast.success("Dataset deleted successfully");
            mutate();
          }
        } catch (error: unknown) {
          toast.error(
            error instanceof Error ? error.message : "Failed to delete model"
          );
        }
      }
    });
  };

  const closeAssetDialog = () => {
    setShowAssetDialog(false);
    setActiveStep(0);
    setAgentData("");
    setModelData("");
    setAssetCreationMode(null);
  };

  return {
    handleAddModel,
    handleAddAgent,
    handleEditModel,
    handleEditAgent,
    handleEditDataset,
    handleDeleteModel,
    handleDeleteAgent,
    handleDeleteDataset,
    closeAssetDialog,
    isLoading
  };
};
