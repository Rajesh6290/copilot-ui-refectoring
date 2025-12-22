"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTabBar from "@/shared/core/CustomTabBar";
import CustomTable from "@/shared/core/CustomTable";
import useCustomTab from "@/shared/hooks/useCustomTab";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useMyContext } from "@/shared/providers/AppProvider";
import { FormikHelpers } from "formik";
import { ArchiveRestore, Pencil, Plus } from "lucide-react";
import moment from "moment";
import { useRouter } from "nextjs-toploader/app";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import * as Yup from "yup";
import {
  AgentValidationSchema,
  DataSetsValidationSchema,
  ModelValidationSchema
} from "../../schema/application.schema";
import dynamic from "next/dynamic";
const AddApplication = dynamic(() => import("./AddApplication"), {
  ssr: false
});
const AssetCreationDialog = dynamic(() => import("./AssetCreationDialog"), {
  ssr: false
});
const LinkSelectionDialog = dynamic(() => import("./LinkSelectionDialog"), {
  ssr: false
});
interface Application extends Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  doc_id: string;
  name: string;
  version: string;
  purpose: string;
  owner_name: string;
  use_case_type: string;
  created_at: string;
  updated_at: string;
  last_audit_date: string;
  agent_ids?: string[];
  model_ids?: string[];
  dataset_ids?: string[];
  agent_details?: AgentDetail[];
  model_details?: ModelDetail[];
  compliance_issues?: number;
  risk_level?: string;
  lifecycle_stage?: string;
  department?: string;
  sensitivity?: string;
  compliance_status?: string[];
  shared_with?: string;
}

interface AgentDetail {
  doc_id: string;
  agent_name: string;
  version: string;
}

interface ModelDetail {
  doc_id: string;
  model_name: string;
  model_version: string;
}

export interface AgentFormValues {
  agent_name: string;
  purpose: string;
  version: string;
  action_supported: string[];
}

export interface ModelFormValues {
  model_name: string;
  model_description: string;
  model_type: string;
  provider: string;
  model_version: string;
  model_status: string;
  compliance_status: string[];
}

export interface DatasetFormValues {
  name: string;
  dataset_version: string;
  contains_sensitive_data: boolean;
  data_sources: string;
  used_for: string;
}

interface TabItem {
  metadata?: {
    label?: string;
    reference?: string;
  };
  permission: {
    is_shown: boolean;
  };
  buttons?: ButtonItem[];
}

interface ButtonItem {
  permission: {
    is_shown: boolean;
    actions?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      delete?: boolean;
    };
  };
}

// CustomToolBar Component
interface CustomToolBarProps {
  setOpen: Dispatch<SetStateAction<boolean>>;
  isAccess: TabItem[];
  tab: string;
  tabMapping: Record<string, string>;
  tabLabels: string[];
}

const CustomToolBar = ({
  setOpen,
  isAccess,
  tab,
  tabMapping,
  tabLabels
}: CustomToolBarProps) => {
  const activeReference = tabMapping[tab] || tabMapping[tabLabels[0] || ""];
  const findTab = isAccess?.find(
    (i: TabItem) => i?.metadata?.reference === activeReference
  );
  const canView = findTab?.buttons?.[1]?.permission?.is_shown;
  const canDisabled = !findTab?.buttons?.[1]?.permission?.actions?.create;
  return (
    <div className="flex h-fit w-full flex-col gap-3 px-3 pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full items-center justify-between px-2 pt-4">
        <p className="font-satoshi text-lg font-semibold text-gray-900 dark:text-white">
          Applications
        </p>
        {canView && (
          <CustomButton
            startIcon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
            className="!w-fit"
            disabled={canDisabled}
          >
            Add Application
          </CustomButton>
        )}
      </div>
    </div>
  );
};

const Application = () => {
  const router = useRouter();
  const [tab, setTab] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showAssetDialog, setShowAssetDialog] = useState<boolean>(false);
  const [anotherDatasetLoading, setAnotherDatasetLoading] =
    useState<boolean>(false);
  const [assetCreationMode, setAssetCreationMode] = useState<
    "agent" | "direct" | null
  >(null);
  const [showLinkSelectionDialog, setShowLinkSelectionDialog] = useState<
    "agent" | "model" | null
  >(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [agentData, setAgentData] = useState<string>("");
  const [modelData, setModelData] = useState<string>("");
  const [selectedApplicationForAsset, setSelectedApplicationForAsset] =
    useState<Application | null>(null);
  const closeAssetDialog = () => {
    setShowAssetDialog(false);
    setActiveStep(0);
    setAgentData("");
    setModelData("");
    setAssetCreationMode(null);
  };
  const { mutation, isLoading } = useMutation();
  const { setMetaTitle } = useMyContext();
  const { data: listOfAgents, mutate: listOfAgentsMutate } =
    useSwr("get_agents");
  const { data: listOfModels, mutate: listOfModelsMutate } =
    useSwr("get_models");
  const { tabLabels, activeReference, visibleTabs } = useCustomTab(tab);

  const tabMapping: Record<string, string> =
    visibleTabs?.reduce(
      (acc: Record<string, string>, tabs: TabItem) => {
        const label = tabs.metadata?.label;
        const reference = tabs.metadata?.reference;
        if (label && reference) {
          acc[label] = reference;
        }
        return acc;
      },
      {} as Record<string, string>
    ) || {};
  const isActiveTab =
    activeReference === "application-active" ||
    (!activeReference &&
      (tab === "Active" || (!tab && tabLabels[0] === "Active")));
  const { data, isValidating, mutate } = useSwr(
    `applications?page=${page + 1}&limit=${pageSize}&is_active=${isActiveTab ? true : false}`
  );
  const isAccess = visibleTabs
    ?.find((i: { tab_name: string }) => i?.tab_name === "active")
    ?.buttons?.find(
      (j: { button_name: string }) => j?.button_name === "view-application"
    )
    ?.tabs?.find((k: { tab_name: string }) => k?.tab_name === "overview");

  const handleArchive = async (row: Application) => {
    const isActivee = isActiveTab ? false : true;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `This will ${!isActivee ? "archive" : "unarchive"} the application.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, continue",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        const res = await mutation(`application?doc_id=${row.doc_id}`, {
          method: "PUT",
          body: { is_active: isActivee },
          isAlert: false
        });

        if (res?.status === 200) {
          mutate();
          toast.success("Application status updated successfully.");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    }
  };

  const handleOpenLinkSelectionDialog = (
    application: Application,
    mode: "agent" | "model"
  ) => {
    setSelectedApplicationForAsset(application);
    setShowLinkSelectionDialog(mode);
  };

  const getStepInitialValues = (
    step: number
  ): AgentFormValues | ModelFormValues | DatasetFormValues => {
    if (assetCreationMode === "agent") {
      if (step === 0) {
        return {
          agent_name: "",
          purpose: "",
          version: "1.0.0",
          action_supported: []
        } as AgentFormValues;
      } else if (step === 1) {
        return {
          model_name: "",
          model_description: "",
          model_type: "",
          provider: "",
          model_version: "1.0.0",
          model_status: "",
          compliance_status: []
        } as ModelFormValues;
      } else if (step === 2) {
        return {
          name: "",
          dataset_version: "1.0.0",
          contains_sensitive_data: false,
          data_sources: "",
          used_for: ""
        } as DatasetFormValues;
      }
    } else {
      if (step === 0) {
        return {
          model_name: "",
          model_description: "",
          model_type: "",
          provider: "",
          model_version: "1.0.0",
          model_status: "",
          compliance_status: []
        } as ModelFormValues;
      } else if (step === 1) {
        return {
          name: "",
          dataset_version: "1.0.0",
          contains_sensitive_data: false,
          data_sources: "",
          used_for: ""
        } as DatasetFormValues;
      }
    }
    return {
      agent_name: "",
      purpose: "",
      version: "1.0.0",
      action_supported: []
    } as AgentFormValues;
  };

  const getStepValidationSchema = (step: number) => {
    if (assetCreationMode === "agent") {
      if (step === 0) {
        return AgentValidationSchema;
      }
      if (step === 1) {
        return ModelValidationSchema;
      }
      if (step === 2) {
        return DataSetsValidationSchema;
      }
    } else {
      if (step === 0) {
        return ModelValidationSchema;
      }
      if (step === 1) {
        return DataSetsValidationSchema;
      }
    }
    return Yup.object({});
  };

  const getSteps = (): string[] => {
    return assetCreationMode === "agent"
      ? ["Agent", "Model", "Dataset"]
      : ["Model", "Dataset"];
  };

  const handleSubmitAgent = async (
    values: AgentFormValues,
    { setSubmitting }: FormikHelpers<AgentFormValues>
  ) => {
    try {
      const res = await mutation("agent", {
        method: "POST",
        isAlert: false,
        body: {
          agent_name: values.agent_name,
          purpose: values.purpose,
          version: values.version,
          action_supported: values.action_supported,
          application_ids: [selectedApplicationForAsset?.doc_id]
        }
      });

      if (res?.status === 201 || res?.status === 200) {
        listOfModelsMutate();
        listOfAgentsMutate();
        toast.success("Agent created successfully");
        setAgentData(res?.results?.doc_id);
        setActiveStep(1);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAgentOnly = async (
    values: AgentFormValues,
    formikBag: FormikHelpers<AgentFormValues>
  ) => {
    try {
      const errors = await formikBag.validateForm();
      if (Object.keys(errors).length > 0) {
        formikBag.setErrors(errors);
        formikBag.setTouched(
          Object.keys(errors).reduce(
            (acc, key) => {
              acc[key] = true;
              return acc;
            },
            {} as Record<string, boolean>
          )
        );
        return;
      }

      formikBag.setSubmitting(true);

      const res = await mutation("agent", {
        method: "POST",
        isAlert: false,
        body: {
          agent_name: values.agent_name,
          purpose: values.purpose,
          version: values.version,
          action_supported: values.action_supported,
          application_ids: [selectedApplicationForAsset?.doc_id]
        }
      });

      if (res?.status === 201 || res?.status === 200) {
        toast.success("Agent created successfully");
        listOfModelsMutate();
        listOfAgentsMutate();
        closeAssetDialog();
        mutate();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      formikBag.setSubmitting(false);
    }
  };

  const handleSubmitModel = async (
    values: ModelFormValues,
    { setSubmitting }: FormikHelpers<ModelFormValues>
  ) => {
    try {
      const payload = {
        model_name: values.model_name,
        model_description: values.model_description,
        model_type: values.model_type,
        provider: values.provider,
        model_version: values.model_version,
        model_status: values.model_status,
        compliance_status: values.compliance_status,
        application_ids: [selectedApplicationForAsset?.doc_id],
        ...(agentData && { agent_ids: [agentData] })
      };

      const res = await mutation("model", {
        method: "POST",
        isAlert: false,
        body: payload
      });

      if (res?.status === 201 || res?.status === 200) {
        toast.success("Model added successfully");
        listOfModelsMutate();
        listOfAgentsMutate();
        setModelData(res?.results?.doc_id || values.model_name);
        setActiveStep(assetCreationMode === "agent" ? 2 : 1);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitModelWithoutDataset = async (
    values: ModelFormValues,
    formikBag: FormikHelpers<ModelFormValues>
  ) => {
    try {
      const errors = await formikBag.validateForm();
      if (Object.keys(errors).length > 0) {
        formikBag.setErrors(errors);
        formikBag.setTouched(
          Object.keys(errors).reduce(
            (acc, key) => {
              acc[key] = true;
              return acc;
            },
            {} as Record<string, boolean>
          )
        );
        return;
      }

      formikBag.setSubmitting(true);

      const payload = {
        model_name: values.model_name,
        model_description: values.model_description,
        model_type: values.model_type,
        provider: values.provider,
        model_version: values.model_version,
        model_status: values.model_status,
        compliance_status: values.compliance_status,
        application_ids: [selectedApplicationForAsset?.doc_id],
        ...(agentData && { agent_ids: [agentData] })
      };

      const res = await mutation("model", {
        method: "POST",
        isAlert: false,
        body: payload
      });

      if (res?.status === 201 || res?.status === 200) {
        toast.success("Model added successfully");
        listOfModelsMutate();
        listOfAgentsMutate();
        closeAssetDialog();
        mutate();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      formikBag.setSubmitting(false);
    }
  };

  const handleSubmitDataset = async (
    values: DatasetFormValues,
    { setSubmitting }: FormikHelpers<DatasetFormValues>
  ) => {
    try {
      const payload = {
        name: values.name,
        dataset_version: values.dataset_version,
        contains_sensitive_data: values.contains_sensitive_data,
        data_sources: values.data_sources,
        used_for: values.used_for,
        application_ids: [selectedApplicationForAsset?.doc_id],
        ...(modelData && { model_ids: [modelData] })
      };

      const res = await mutation("dataset", {
        method: "POST",
        isAlert: false,
        body: payload
      });

      if (res?.status === 201 || res?.status === 200) {
        toast.success("Dataset added successfully");
        listOfModelsMutate();
        listOfAgentsMutate();
        closeAssetDialog();
        mutate();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnotherDataset = async (
    values: DatasetFormValues,
    formikBag: FormikHelpers<DatasetFormValues>,
    resetForm: () => void
  ) => {
    try {
      setAnotherDatasetLoading(true);
      const errors = await formikBag.validateForm();
      if (Object.keys(errors).length > 0) {
        formikBag.setErrors(errors);
        formikBag.setTouched(
          Object.keys(errors).reduce(
            (acc, key) => {
              acc[key] = true;
              return acc;
            },
            {} as Record<string, boolean>
          )
        );
        return;
      }

      formikBag.setSubmitting(true);
      const payload = {
        name: values.name,
        dataset_version: values.dataset_version,
        contains_sensitive_data: values.contains_sensitive_data,
        data_sources: values.data_sources,
        used_for: values.used_for,
        application_ids: [selectedApplicationForAsset?.doc_id],
        ...(modelData && { model_ids: [modelData] })
      };

      const res = await mutation("dataset", {
        method: "POST",
        isAlert: false,
        body: payload
      });

      if (res?.status === 201 || res?.status === 200) {
        toast.success("Dataset added successfully");
        listOfModelsMutate();
        listOfAgentsMutate();
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      formikBag.setSubmitting(false);
      setAnotherDatasetLoading(false);
    }
  };

  // Table actions based on permissions
  const tableActions = [];

  // Get current active tab
  const currentTab = visibleTabs?.find((tabItem: TabItem) => {
    const displayLabel = tabItem.metadata?.label;
    return (
      displayLabel === tab || tabItem.metadata?.reference === activeReference
    );
  });
  if (currentTab?.buttons?.[2]?.permission?.is_shown) {
    tableActions.push({
      icon: <Pencil className="mr-2 h-5 w-5 text-green-600" />,
      tooltip: "Update Application",
      onClick: (row: Application) => {
        if (currentTab?.buttons?.[2]?.permission?.actions?.update) {
          setIsEditMode(true);
          setSelectedApplication(row);
          setOpen(true);
        } else {
          toast.error("You don't have permission to perform this action.");
        }
      }
    });
  }

  if (currentTab?.buttons?.[3]?.permission?.is_shown) {
    tableActions.push({
      icon: <ArchiveRestore className="h-5 w-5 text-purple-600" />,
      tooltip: isActiveTab ? "Archive" : "Restore",
      onClick: (row: Application) => {
        if (currentTab?.buttons?.[3]?.permission?.actions?.delete) {
          handleArchive(row);
        } else {
          toast.error("You don't have permission to perform this action.");
        }
      }
    });
  }

  return (
    <div className="flex w-full flex-col gap-2 overflow-y-auto px-2 pt-3">
      {currentTab?.buttons?.[2]?.permission?.is_shown && (
        <AddApplication
          open={open}
          onClose={() => setOpen(false)}
          mutate={mutate}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          selectedApplication={selectedApplication as Application}
          setSelectedApplication={setSelectedApplication}
        />
      )}

      <span className="h-1 w-full" />

      {/* Dynamic tabs */}
      {visibleTabs.length > 0 ? (
        <CustomTabBar
          tabs={tabLabels}
          defaultTab={tabLabels[0] || ""}
          activeTab={tab}
          setActiveTab={setTab}
          className="rounded-lg bg-white drop-shadow-2 dark:bg-darkSidebarBackground"
          instanceId="application-Tab"
        />
      ) : (
        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
          No tabs available based on your permissions
        </div>
      )}

      <span className="h-1 w-full" />

      {/* Enhanced Table */}
      <CustomTable<Application>
        columns={[
          {
            field: "name",
            title: "Name",
            sortable: true,
            filterable: true,
            render: (row: Application) => (
              <span className="text-nowrap font-medium capitalize">
                {row?.name ?? "Not Provided"}
              </span>
            )
          },
          // {
          //   field: "portfolio",
          //   title: "Portfolio",
          //   sortable: true,
          //   filterable: true,
          //   render: (row: any) => (
          //     <span className="capitalize">
          //       {row?.portfolio ?? "Not Provided"}
          //     </span>
          //   ),
          // },
          {
            field: "use_case_type",
            title: "Usecase Type",
            sortable: true,
            filterable: true,
            render: (row: Application) => (
              <span className="capitalize">
                {row?.use_case_type?.replace(/_/g, " ") ?? "Not Provided"}
              </span>
            )
          },
          // {
          //   field: "lifecycle_stage",
          //   title: "Review Status",
          //   sortable: true,
          //   filterable: true,
          //   render: (row: any) => (
          //     <span className="capitalize">
          //       {row?.lifecycle_stage ?? "Not Provided"}
          //     </span>
          //   ),
          // },
          {
            field: "last_audit_date",
            title: "Last Review Date",
            sortable: true,
            render: (row: Application) =>
              moment(row?.last_audit_date).format("DD-MM-YYYY")
          },
          {
            field: "link-agent",
            title: "Link Agent",
            sortable: true,
            render: (row: Application) => {
              // Temporary: Show Link Agent button only on Active tab
              const showOnActiveTab = isActiveTab; // Show only when on Active tab

              return (
                <div className="flex w-full items-center justify-center">
                  <div className="w-fit">
                    {showOnActiveTab &&
                      isAccess?.buttons?.[5]?.permission?.is_shown && (
                        <CustomButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLinkSelectionDialog(row, "agent");
                          }}
                          disabled={
                            !isAccess?.buttons?.[4]?.permission?.actions?.create
                          }
                          className="w-fit text-nowrap !text-[0.6rem] !uppercase"
                        >
                          Link Agent
                        </CustomButton>
                      )}
                  </div>
                </div>
              );
            }
          },
          {
            field: "link-models",
            title: "Link Models",
            sortable: true,
            render: (row: Application) => {
              const showOnActiveTab = isActiveTab;

              return (
                <div className="flex w-full items-center justify-center">
                  <div className="w-fit">
                    {showOnActiveTab &&
                      isAccess?.buttons?.[1]?.permission?.is_shown && (
                        <CustomButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLinkSelectionDialog(row, "model");
                          }}
                          disabled={
                            !isAccess?.buttons?.[0]?.permission?.actions?.create
                          }
                          className="w-fit text-nowrap !text-[0.6rem] !uppercase"
                        >
                          Link Model
                        </CustomButton>
                      )}
                  </div>
                </div>
              );
            }
          },
          {
            field: "view",
            title: "View",
            sortable: true,
            render: (row: Application) => {
              const viewPermission = currentTab?.buttons?.[0]?.permission;

              return (
                <div className="flex w-full items-center justify-center">
                  {viewPermission?.is_shown && (
                    <div className="w-fit">
                      <CustomButton
                        onClick={() => {
                          router.push(
                            `/ai-application/application/${row.doc_id}?_name=${encodeURIComponent(row.name)}`
                          );
                          setMetaTitle(
                            `${row.name} | Application | Cognitiveview`
                          );
                        }}
                        disabled={!viewPermission?.actions?.read}
                        className="w-fit !text-[0.6rem] !uppercase"
                      >
                        VIEW
                      </CustomButton>
                    </div>
                  )}
                </div>
              );
            }
          }
        ]}
        data={data?.applications || []}
        actions={tableActions}
        isLoading={isValidating}
        page={page}
        pageSize={pageSize}
        totalCount={data?.pagination?.total_records}
        onPageChange={setPage}
        onRowsPerPageChange={setPageSize}
        title=""
        selection={true}
        filtering={false}
        customToolbar={
          <CustomToolBar
            setOpen={setOpen}
            isAccess={visibleTabs}
            tab={tab}
            tabMapping={tabMapping}
            tabLabels={tabLabels}
          />
        }
        options={{
          toolbar: false,
          search: false,
          filtering: true,
          sorting: true,
          pagination: true
        }}
        className="flex-1"
      />
      <LinkSelectionDialog
        listOfAgents={listOfAgents}
        listOfModels={listOfModels}
        mutate={mutate}
        selectedApplicationForAsset={selectedApplicationForAsset}
        setActiveStep={setActiveStep}
        setAssetCreationMode={setAssetCreationMode}
        setSelectedApplicationForAsset={setSelectedApplicationForAsset}
        setShowAssetDialog={setShowAssetDialog}
        setShowLinkSelectionDialog={setShowLinkSelectionDialog}
        showLinkSelectionDialog={showLinkSelectionDialog}
      />

      {/* Asset Creation Dialog */}
      <AssetCreationDialog
        isLoading={isLoading}
        anotherDatasetLoading={anotherDatasetLoading}
        activeStep={activeStep}
        assetCreationMode={assetCreationMode}
        getStepInitialValues={getStepInitialValues}
        getStepValidationSchema={getStepValidationSchema}
        getSteps={getSteps}
        handleSubmitAgent={handleSubmitAgent}
        handleSubmitAgentOnly={handleSubmitAgentOnly}
        handleSubmitModel={handleSubmitModel}
        handleSubmitModelWithoutDataset={handleSubmitModelWithoutDataset}
        handleSubmitDataset={handleSubmitDataset}
        handleAddAnotherDataset={handleAddAnotherDataset}
        closeAssetDialog={closeAssetDialog}
        showAssetDialog={showAssetDialog}
        selectedApplicationForAsset={selectedApplicationForAsset}
      />
    </div>
  );
};

export default Application;
