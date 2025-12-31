import { toast } from "sonner";
import { Agent, Dataset, Model } from "../types/overview.types";
import useMutation from "@/shared/hooks/useMutation";

interface UseEditSubmissionProps {
  selectedModel: Model | null;
  selectedAgent: Agent | null;
  selectedDataset: Dataset | null;
  setShowModelDialog: (show: boolean) => void;
  setShowAgentDialog: (show: boolean) => void;
  setShowDatasetDialog: (show: boolean) => void;
  mutate: () => void;
}

export const useEditSubmission = ({
  selectedModel,
  selectedAgent,
  selectedDataset,
  setShowModelDialog,
  setShowAgentDialog,
  setShowDatasetDialog,
  mutate
}: UseEditSubmissionProps) => {
  const { mutation, isLoading } = useMutation();

  const handleSubmitEditModel = async (
    values: {
      model_name: string;
      model_description: string;
      model_type: string;
      provider: string;
      model_version: string;
      model_status: string;
      compliance_status: string[];
      fine_tuned: string;
      eval_metrics: string;
    },
    {
      setSubmitting,
      resetForm
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: () => void;
    }
  ) => {
    try {
      const payload = {
        ...values,
        fine_tuned: values.fine_tuned === "true"
      };
      const res = await mutation(`model?doc_id=${selectedModel?.doc_id}`, {
        method: "PUT",
        isAlert: false,
        body: payload
      });

      if (res?.status === 200) {
        toast.success("Model updated successfully");
        mutate();
        resetForm();
        setShowModelDialog(false);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEditAgent = async (
    values: {
      agent_name: string;
      purpose: string;
      version: string;
      action_supported: string;
      human_in_loop: string;
      is_active: string;
    },
    {
      setSubmitting,
      resetForm
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: () => void;
    }
  ) => {
    try {
      const payload = {
        ...values,
        action_supported: values.action_supported
          ? [values.action_supported]
          : [],
        human_in_loop: values.human_in_loop === "true",
        is_active: values.is_active === "true"
      };
      const res = await mutation(`agent?doc_id=${selectedAgent?.doc_id}`, {
        method: "PUT",
        isAlert: false,
        body: payload
      });

      if (res?.status === 200) {
        toast.success("Agent updated successfully");
        mutate();
        resetForm();
        setShowAgentDialog(false);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEditDataset = async (
    values: {
      name: string;
      dataset_version: string;
      contains_sensitive_data: string;
      data_sources: string;
      used_for: string;
      size_in_gb: number | null;
      preprocessing_steps: string[];
    },
    {
      setSubmitting,
      resetForm
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: () => void;
    }
  ) => {
    try {
      const payload = {
        ...values,
        contains_sensitive_data: values.contains_sensitive_data === "true"
      };
      const res = await mutation(`dataset?doc_id=${selectedDataset?.doc_id}`, {
        method: "PUT",
        isAlert: false,
        body: payload
      });

      if (res?.status === 200) {
        toast.success("Dataset updated successfully");
        mutate();
        resetForm();
        setShowDatasetDialog(false);
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    handleSubmitEditModel,
    handleSubmitEditAgent,
    handleSubmitEditDataset,
    isLoading
  };
};
