import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { Dialog, DialogTitle } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Plus, Save, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { SelectionValidationSchema } from "../../schema/application.schema";
import Application from "./Application";
import dynamic from "next/dynamic";
interface LinkSelectionFormValues {
  selectedItem: string[];
}
const CustomMultiSelect = dynamic(
  () => import("@/shared/core/CustomMultiSelect"),
  {
    ssr: false
  }
);
const LinkSelectionDialog = ({
  showLinkSelectionDialog,
  setShowLinkSelectionDialog,
  selectedApplicationForAsset,
  setSelectedApplicationForAsset,
  setAssetCreationMode,
  setActiveStep,
  setShowAssetDialog,
  listOfAgents,
  listOfModels,
  mutate
}: {
  showLinkSelectionDialog: "agent" | "model" | null;
  setShowLinkSelectionDialog: React.Dispatch<
    React.SetStateAction<"agent" | "model" | null>
  >;
  selectedApplicationForAsset: Application | null;
  setSelectedApplicationForAsset: React.Dispatch<
    React.SetStateAction<Application | null>
  >;
  setAssetCreationMode: React.Dispatch<
    React.SetStateAction<"agent" | "direct" | null>
  >;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  setShowAssetDialog: React.Dispatch<React.SetStateAction<boolean>>;
  listOfAgents: Array<{
    agent_name: string;
    version: string;
    doc_id: string;
  }> | null;
  listOfModels: Array<{
    model_name: string;
    model_version: string;
    doc_id: string;
  }> | null;
  mutate: () => void;
}) => {
  const handleCloseLinkSelectionDialog = () => {
    setShowLinkSelectionDialog(null);
    setSelectedApplicationForAsset(null);
  };
  const { mutation } = useMutation();
  const handleLinkSelectionSubmit = async (values: LinkSelectionFormValues) => {
    try {
      if (!selectedApplicationForAsset?.doc_id) {
        toast.error("No application selected for linking.");
        return;
      }

      if (showLinkSelectionDialog === "agent") {
        for (const agentId of values.selectedItem) {
          const res = await mutation(`agent?doc_id=${agentId}`, {
            method: "PUT",
            isAlert: false,
            body: { application_ids: [selectedApplicationForAsset.doc_id] }
          });
          if (res?.status !== 200) {
            toast.error(`Failed to link agent with ID: ${agentId}`);
            return;
          }
        }
        toast.success("Agents linked successfully");
      } else if (showLinkSelectionDialog === "model") {
        for (const modelId of values.selectedItem) {
          const res = await mutation(`model?doc_id=${modelId}`, {
            method: "PUT",
            isAlert: false,
            body: { application_ids: [selectedApplicationForAsset.doc_id] }
          });
          if (res?.status !== 200) {
            toast.error(`Failed to link model with ID: ${modelId}`);
            return;
          }
        }
        toast.success("Models linked successfully");
      }

      handleCloseLinkSelectionDialog();
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  return (
    <Dialog
      open={!!showLinkSelectionDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-darkSidebarBackground rounded-lg"
      }}
      onClose={handleCloseLinkSelectionDialog}
    >
      <DialogTitle className="flex items-center justify-between border-b border-gray-200 px-6 py-2.5 dark:border-gray-700">
        <span className="text-gray-900 dark:text-white">
          Continue with{" "}
          {showLinkSelectionDialog === "agent" ? "Agent" : "Model"}
        </span>
        <button
          onClick={handleCloseLinkSelectionDialog}
          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogTitle>

      <div className="p-6">
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Do you want to create a new{" "}
          {showLinkSelectionDialog === "agent" ? "agent" : "model"} or continue
          with an existing one?
        </p>

        <div className="flex flex-col space-y-4">
          <CustomButton
            onClick={() => {
              setShowLinkSelectionDialog(null);
              setAssetCreationMode(
                showLinkSelectionDialog === "agent" ? "agent" : "direct"
              );
              setActiveStep(0);
              setShowAssetDialog(true);
            }}
            startIcon={<Plus size={16} />}
          >
            Create New {showLinkSelectionDialog === "agent" ? "Agent" : "Model"}
          </CustomButton>

          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <h3 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              Continue with Existing{" "}
              {showLinkSelectionDialog === "agent" ? "Agent" : "Model"}
            </h3>
            <Formik
              initialValues={{ selectedItem: [] }}
              validationSchema={SelectionValidationSchema}
              onSubmit={handleLinkSelectionSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select{" "}
                      {showLinkSelectionDialog === "agent" ? "Agent" : "Model"}{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <Field
                      name="selectedItem"
                      component={CustomMultiSelect}
                      options={
                        showLinkSelectionDialog === "agent"
                          ? listOfAgents?.map(
                              (item: {
                                agent_name: string;
                                version: string;
                                doc_id: string;
                              }) => ({
                                label: `${item?.agent_name} (${item?.version})`,
                                value: item?.doc_id
                              })
                            ) || []
                          : listOfModels?.map(
                              (item: {
                                model_name: string;
                                model_version: string;
                                doc_id: string;
                              }) => ({
                                label: `${item?.model_name} (${item?.model_version})`,
                                value: item?.doc_id
                              })
                            ) || []
                      }
                    />
                    <ErrorMessage
                      name="selectedItem"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseLinkSelectionDialog}
                      className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <CustomButton
                      type="submit"
                      loading={isSubmitting}
                      loadingText="Saving..."
                      startIcon={<Save size={16} />}
                    >
                      Save
                    </CustomButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default LinkSelectionDialog;
