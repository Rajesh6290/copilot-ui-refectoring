import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogTitle } from "@mui/material";
import { Field, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { CheckCircle2, Edit, Info, Plus, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
import { NewApplicationValidationSchema } from "../../schema/application.schema";

const CustomMultiSelect = dynamic(
  () => import("@/shared/core/CustomMultiSelect"),
  {
    ssr: false
  }
);

interface ApplicationFormValues {
  name: string;
  version: string;
  purpose: string;
  owner_name: string;
  use_case_type: string;
  department?: string;
  sensitivity?: string;
  compliance_status?: string[];
  risk_level?: string;
  deployment_context?: string;
  intended_users?: string;
  ai_behaviors?: string[];
  automation_level?: string;
  decision_binding?: boolean | undefined;
  human_oversight_required?: boolean | undefined;
  oversight_type?: string;
  oversight_role?: string;
}

// Existing options
const useCaseOptions = [
  { value: "transportation", label: "Transportation" },
  { value: "financial_services", label: "Financial Services" },
  { value: "healthcare_diagnostics", label: "Healthcare Diagnostics" },
  { value: "customer_support", label: "Customer Support" },
  { value: "speech_recognition_systems", label: "Speech Recognition Systems" },
  { value: "industrial_automation", label: "Industrial Automation" },
  { value: "marketing_and_advertising", label: "Marketing & Advertising" },
  { value: "ecommerce_and_retail", label: "E-commerce & Retail" },
  { value: "legal_document_review", label: "Legal Document Review" },
  { value: "agriculture", label: "Agriculture" },
  {
    value: "energy_management_and_utilities",
    label: "Energy Management & Utilities"
  },
  { value: "supply_chain_optimization", label: "Supply Chain Optimization" },
  {
    value: "fraud_detection_in_finance_and_security",
    label: "Fraud Detection in Finance & Security"
  },
  {
    value: "cybersecurity_and_threat_detection",
    label: "Cybersecurity & Threat Detection"
  },
  {
    value: "urban_planning_and_smart_infrastructure",
    label: "Urban Planning & Smart Infrastructure"
  },
  { value: "drug_discovery", label: "Drug Discovery" },
  { value: "education_and_edtech", label: "Education & EdTech" },
  {
    value: "retail_pricing_optimization",
    label: "Retail Pricing Optimization"
  },
  { value: "environmental_monitoring", label: "Environmental Monitoring" },
  { value: "mental_health_support", label: "Mental Health Support" },
  { value: "autonomous_drones", label: "Autonomous Drones" },
  {
    value: "fake_news_detection_in_media_and_journalism",
    label: "Fake News Detection in Media & Journalism"
  },
  {
    value: "insurance_claims_processing",
    label: "Insurance Claims Processing"
  },
  {
    value: "law_enforcement_and_public_safety",
    label: "Law Enforcement & Public Safety"
  },
  { value: "biometrics_system", label: "Biometrics System" },
  { value: "image_generation", label: "Image Generation" },
  { value: "robotics", label: "Robotics" },
  { value: "others", label: "Others" }
];

const complianceStatusOptions = [
  { value: "ccpa_compliant", label: "CCPA Compliant" },
  { value: "hipaa_compliant", label: "HIPAA Compliant" },
  { value: "iso_27001", label: "ISO 27001" },
  { value: "soc_2", label: "SOC 2" },
  { value: "not_assessed", label: "Not Assessed" },
  { value: "euro_ai", label: "EURO AI" },
  { value: "nist", label: "NIST" },
  { value: "internally_evaluated", label: "Internally Evaluated" }
];

// New TRACE-RAI options
const aiBehaviorOptions = [
  { value: "content_generation", label: "Content Generation" },
  { value: "classification", label: "Classification" },
  { value: "recommendation", label: "Recommendation" },
  { value: "decision_support", label: "Decision Support" },
  { value: "autonomous_action", label: "Autonomous Action" }
];

const HOVER_TEXT = {
  deployment_context:
    "Where this AI application is currently deployed and used.",
  intended_users:
    "Who primarily uses this AI system — within the organization or outside it.",
  ai_behaviors: "What the AI system actually does when running in production.",
  automation_level:
    "How independently the AI operates, from advisory to highly automated.",
  decision_binding:
    "Does the AI's output directly trigger real-world actions without mandatory human approval?",
  human_oversight_required:
    "Is a human required to review or approve AI decisions?",
  oversight_type: "When and how human oversight is applied to AI decisions.",
  oversight_role:
    "Which role is accountable for overseeing AI behavior and decisions."
};

const Tooltip = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative ml-1 inline-block">
      <Info
        size={16}
        className="cursor-help text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute -left-2 top-6 z-50 w-64 rounded-md bg-gray-900 p-2 text-xs text-white shadow-lg">
          {text}
          <div className="absolute -top-1 left-2 h-2 w-2 rotate-45 transform bg-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const AddApplication = ({
  open,
  onClose,
  mutate,
  selectedApplication,
  isEditMode,
  setIsEditMode,
  setSelectedApplication
}: {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  selectedApplication: {
    doc_id?: string;
    name?: string;
    version?: string;
    purpose?: string;
    owner_name?: string;
    use_case_type?: string;
    department?: string;
    sensitivity?: string;
    compliance_status?: string[];
    risk_level?: string;
    deployment_context?: string;
    intended_users?: string;
    ai_behaviors?: string[];
    automation_level?: string;
    decision_binding?: boolean;
    human_oversight_required?: boolean;
    oversight_type?: string;
    oversight_role?: string;
  };
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  setSelectedApplication: (value: null) => void;
}) => {
  const { isLoading, mutation } = useMutation();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);

  const handleClose = () => {
    setCurrentStep(1);
    setIsEditMode(false);
    setSelectedApplication(null);
    onClose();
  };

  // Validation for each step
  const validateStep = (
    step: number,
    values: ApplicationFormValues,
    errors: Record<string, string>
  ): boolean => {
    if (step === 1) {
      const step1Fields = [
        "name",
        "version",
        "owner_name",
        "use_case_type",
        "deployment_context",
        "intended_users",
        "purpose"
      ];
      const hasErrors = step1Fields.some((field) => errors[field]);
      const hasValues = step1Fields.every((field) => {
        const value = values[field as keyof ApplicationFormValues];
        return value !== "" && value !== undefined;
      });
      return !hasErrors && hasValues;
    } else if (step === 2) {
      const step2Fields = [
        "ai_behaviors",
        "automation_level",
        "decision_binding"
      ];
      const hasErrors = step2Fields.some((field) => errors[field]);
      const hasValues =
        values.ai_behaviors &&
        values.ai_behaviors.length > 0 &&
        values.automation_level &&
        values.decision_binding !== undefined;
      return !hasErrors && Boolean(hasValues);
    } else if (step === 3) {
      if (values.human_oversight_required === undefined) {
        return false;
      }
      if (values.human_oversight_required === true) {
        return (
          !errors["oversight_type"] &&
          !errors["oversight_role"] &&
          values.oversight_type !== "" &&
          values.oversight_role !== ""
        );
      }
      return true;
    }
    return false;
  };

  const getStepStatus = (
    step: number,
    activeStep: number,
    values: ApplicationFormValues,
    errors: Record<string, string>
  ): "complete" | "active" | "incomplete" => {
    if (step < activeStep) {
      return validateStep(step, values, errors) ? "complete" : "incomplete";
    }
    if (step === activeStep) {
      return "active";
    }
    return "incomplete";
  };

  const getInitialValues = (): ApplicationFormValues => {
    if (isEditMode && selectedApplication) {
      return {
        name: selectedApplication.name || "",
        version: selectedApplication.version || "1.0.0",
        purpose: selectedApplication.purpose || "",
        owner_name: selectedApplication.owner_name || "",
        use_case_type: selectedApplication.use_case_type || "",
        department: selectedApplication.department || "",
        sensitivity: selectedApplication.sensitivity || "",
        compliance_status: selectedApplication.compliance_status || [],
        risk_level: selectedApplication.risk_level || "",
        deployment_context: selectedApplication.deployment_context || "",
        intended_users: selectedApplication.intended_users || "",
        ai_behaviors: selectedApplication.ai_behaviors || [],
        automation_level: selectedApplication.automation_level || "",
        decision_binding: selectedApplication.decision_binding,
        human_oversight_required: selectedApplication.human_oversight_required,
        oversight_type: selectedApplication.oversight_type || "",
        oversight_role: selectedApplication.oversight_role || ""
      };
    }
    return {
      name: "",
      version: "1.0.0",
      purpose: "",
      owner_name: user?.fullName || "",
      use_case_type: "",
      department: "",
      sensitivity: "",
      compliance_status: [],
      risk_level: "",
      deployment_context: "",
      intended_users: "",
      ai_behaviors: [],
      automation_level: "",
      decision_binding: undefined,
      human_oversight_required: undefined,
      oversight_type: "",
      oversight_role: ""
    };
  };

  const handleSubmit = async (
    values: ApplicationFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ApplicationFormValues>
  ) => {
    // Prevent submission if not on the final step
    if (currentStep !== 3) {
      setSubmitting(false);
      return;
    }

    try {
      const endpoint = isEditMode
        ? `application?doc_id=${selectedApplication?.doc_id}`
        : "application";

      const payload = {
        name: values.name,
        version: values.version,
        purpose: values.purpose,
        owner_name: values.owner_name,
        use_case_type: values.use_case_type,
        owner_user_id: user?.id,
        department: values.department || undefined,
        sensitivity: values.sensitivity || undefined,
        compliance_status: values.compliance_status?.length
          ? values.compliance_status
          : undefined,
        risk_level: values.risk_level || undefined,
        deployment_context: values.deployment_context || undefined,
        intended_users: values.intended_users || undefined,
        ai_behaviors: values.ai_behaviors?.length
          ? values.ai_behaviors
          : undefined,
        automation_level: values.automation_level || undefined,
        decision_binding: values.decision_binding,
        human_oversight_required: values.human_oversight_required,
        oversight_type: values.oversight_type || undefined,
        oversight_role: values.oversight_role || undefined
      };

      const res = await mutation(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        isAlert: false,
        body: payload
      });

      if (res?.status === 201 || res?.status === 200) {
        mutate();
        handleClose();
        toast.success(
          isEditMode
            ? "Application updated successfully"
            : "Application created successfully"
        );
        if (!isEditMode) {
          resetForm();
        }
      } else {
        toast.error(
          isEditMode
            ? "Failed to update application"
            : "Failed to create application"
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-lg"
      }}
      onClose={handleClose}
    >
      <DialogTitle className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex-1">
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Application" : "Create Application"}
          </span>
        </div>
        <button
          onClick={handleClose}
          className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogTitle>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={NewApplicationValidationSchema}
        onSubmit={handleSubmit}
        validateOnMount={false}
        validateOnChange={true}
        enableReinitialize={true}
      >
        {({
          errors,
          touched,
          values,
          handleChange,
          handleBlur,
          isSubmitting,
          setFieldValue,
          submitForm
        }: FormikProps<ApplicationFormValues>) => {
          const canProceedToNext = validateStep(currentStep, values, errors);

          return (
            <Form
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentStep < 3) {
                  e.preventDefault();
                  if (canProceedToNext) {
                    setCurrentStep(currentStep + 1);
                  }
                }
                if (e.key === "Enter" && currentStep === 3) {
                  const target = e.target as HTMLElement;
                  if (
                    target.tagName === "INPUT" ||
                    target.tagName === "SELECT" ||
                    target.tagName === "TEXTAREA"
                  ) {
                    e.preventDefault();
                  }
                }
              }}
            >
              {/* Enhanced Stepper */}
              <div className="px-6 py-6">
                <div className="mx-auto flex max-w-3xl items-center justify-between">
                  {/* Step 1 */}
                  <div className="flex flex-1 flex-col items-center">
                    <div className="relative flex items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          getStepStatus(1, currentStep, values, errors) ===
                          "complete"
                            ? "border-green-500 bg-green-500 shadow-lg shadow-green-500/50"
                            : getStepStatus(1, currentStep, values, errors) ===
                                "active"
                              ? "border-blue-500 bg-blue-500 shadow-lg shadow-blue-500/50"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                        }`}
                      >
                        {getStepStatus(1, currentStep, values, errors) ===
                        "complete" ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <span
                            className={`text-lg font-semibold ${
                              getStepStatus(1, currentStep, values, errors) ===
                              "active"
                                ? "text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            1
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-sm font-medium ${
                          currentStep === 1
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Core Info
                      </p>
                    </div>
                  </div>

                  {/* Connector 1-2 */}
                  <div className="relative -mt-6 flex-1">
                    <div
                      className={`h-1 w-full transition-all duration-500 ${
                        getStepStatus(1, currentStep, values, errors) ===
                        "complete"
                          ? "bg-gradient-to-r from-green-500 to-blue-500"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    ></div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-1 flex-col items-center">
                    <div className="relative flex items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          getStepStatus(2, currentStep, values, errors) ===
                          "complete"
                            ? "border-green-500 bg-green-500 shadow-lg shadow-green-500/50"
                            : getStepStatus(2, currentStep, values, errors) ===
                                "active"
                              ? "border-blue-500 bg-blue-500 shadow-lg shadow-blue-500/50"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                        }`}
                      >
                        {getStepStatus(2, currentStep, values, errors) ===
                        "complete" ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <span
                            className={`text-lg font-semibold ${
                              getStepStatus(2, currentStep, values, errors) ===
                              "active"
                                ? "text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            2
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-sm font-medium ${
                          currentStep === 2
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        AI Behavior
                      </p>
                    </div>
                  </div>

                  {/* Connector 2-3 */}
                  <div className="relative -mt-6 flex-1">
                    <div
                      className={`h-1 w-full transition-all duration-500 ${
                        getStepStatus(2, currentStep, values, errors) ===
                        "complete"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    ></div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-1 flex-col items-center">
                    <div className="relative flex items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          getStepStatus(3, currentStep, values, errors) ===
                          "complete"
                            ? "border-green-500 bg-green-500 shadow-lg shadow-green-500/50"
                            : getStepStatus(3, currentStep, values, errors) ===
                                "active"
                              ? "border-purple-500 bg-purple-500 shadow-lg shadow-purple-500/50"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                        }`}
                      >
                        {getStepStatus(3, currentStep, values, errors) ===
                        "complete" ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <span
                            className={`text-lg font-semibold ${
                              getStepStatus(3, currentStep, values, errors) ===
                              "active"
                                ? "text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            3
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-sm font-medium ${
                          currentStep === 3
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Oversight
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-h-[calc(100vh-280px)] overflow-y-auto p-6">
                {/* STEP 1: CORE IDENTIFICATION */}
                {currentStep === 1 && (
                  <div className="animate-fadeIn space-y-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      Core Identification
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          AI Application Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.name}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-neutral-500">
                          E.g., Customer Support Chatbot, Credit Risk Prediction
                          Model
                        </p>
                        {touched.name && errors.name && (
                          <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Version (X.Y.Z format){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="version"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.version}
                          placeholder="1.0.0"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        {touched.version && errors.version && (
                          <p className="text-sm text-red-500">
                            {errors.version}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Application Owner{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="owner_name"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.owner_name}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        {touched.owner_name && errors.owner_name && (
                          <p className="text-sm text-red-500">
                            {errors.owner_name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Use Case Type <span className="text-red-500">*</span>
                        </span>
                        <select
                          name="use_case_type"
                          value={values.use_case_type}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">Select a use case</option>
                          {useCaseOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {touched.use_case_type && errors.use_case_type && (
                          <p className="text-sm text-red-500">
                            {errors.use_case_type}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          Deployment Context{" "}
                          <span className="text-red-500">*</span>
                          <Tooltip text={HOVER_TEXT.deployment_context} />
                        </label>
                        <select
                          name="deployment_context"
                          value={values.deployment_context}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">Select deployment context</option>
                          <option value="development">Development</option>
                          <option value="production">Production</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          Intended Users <span className="text-red-500">*</span>
                          <Tooltip text={HOVER_TEXT.intended_users} />
                        </span>
                        <select
                          name="intended_users"
                          value={values.intended_users}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">Select intended users</option>
                          <option value="internal">Internal</option>
                          <option value="external">External</option>
                        </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Purpose <span className="text-red-500">*</span>
                        </span>
                        <textarea
                          name="purpose"
                          rows={3}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.purpose}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {values.purpose?.length || 0}/500 characters
                        </div>
                        {touched.purpose && errors.purpose && (
                          <p className="text-sm text-red-500">
                            {errors.purpose}
                          </p>
                        )}
                      </div>

                      {isEditMode && (
                        <>
                          <div className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                              Department
                            </span>
                            <input
                              type="text"
                              name="department"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.department}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                              Sensitivity
                            </span>
                            <select
                              name="sensitivity"
                              value={values.sensitivity}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                              <option value="">Select Sensitivity</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                              Compliance Status
                            </span>
                            <Field
                              name="compliance_status"
                              component={CustomMultiSelect}
                              options={complianceStatusOptions}
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                              Risk Level
                            </span>
                            <select
                              name="risk_level"
                              value={values.risk_level}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                              <option value="">Select Risk Level</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: AI BEHAVIOR & AUTONOMY */}
                {currentStep === 2 && (
                  <div className="animate-fadeIn space-y-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      AI Behavior & Autonomy
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          AI Behaviors <span className="text-red-500">*</span>
                          <Tooltip text={HOVER_TEXT.ai_behaviors} />
                        </span>
                        <Field
                          name="ai_behaviors"
                          component={CustomMultiSelect}
                          options={aiBehaviorOptions}
                        />
                        <p className="text-xs text-gray-500 dark:text-neutral-500">
                          Select all behaviors that apply to this AI application
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          Automation Level{" "}
                          <span className="text-red-500">*</span>
                          <Tooltip text={HOVER_TEXT.automation_level} />
                        </span>
                        <select
                          name="automation_level"
                          value={values.automation_level}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">Select automation level</option>
                          <option value="low">Low - Advisory only</option>
                          <option value="medium">
                            Medium - Semi-automated
                          </option>
                          <option value="high">High - Fully automated</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          Decision Binding{" "}
                          <span className="text-red-500">*</span>
                          <Tooltip text={HOVER_TEXT.decision_binding} />
                        </span>
                        <div className="flex gap-4 pt-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="decision_binding"
                              value="true"
                              checked={values.decision_binding === true}
                              onChange={() =>
                                setFieldValue("decision_binding", true)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              Yes
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="decision_binding"
                              value="false"
                              checked={values.decision_binding === false}
                              onChange={() =>
                                setFieldValue("decision_binding", false)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              No
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: HUMAN OVERSIGHT */}
                {currentStep === 3 && (
                  <div className="animate-fadeIn space-y-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      Human Oversight
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          Human Oversight Required{" "}
                          <span className="text-red-500">*</span>
                          <Tooltip text={HOVER_TEXT.human_oversight_required} />
                        </label>
                        <div className="flex gap-4 pt-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="human_oversight_required"
                              value="true"
                              checked={values.human_oversight_required === true}
                              onChange={() =>
                                setFieldValue("human_oversight_required", true)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              Yes
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="human_oversight_required"
                              value="false"
                              checked={
                                values.human_oversight_required === false
                              }
                              onChange={() =>
                                setFieldValue("human_oversight_required", false)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              No
                            </span>
                          </label>
                        </div>
                      </div>

                      {values.human_oversight_required && (
                        <>
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                              Oversight Type{" "}
                              <span className="text-red-500">*</span>
                              <Tooltip text={HOVER_TEXT.oversight_type} />
                            </label>
                            <select
                              name="oversight_type"
                              value={values.oversight_type}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                              <option value="">Select oversight type</option>
                              <option value="pre_decision_approval">
                                Pre-Decision Approval
                              </option>
                              <option value="post_decision_review">
                                Post-Decision Review
                              </option>
                              <option value="exception_only_review">
                                Exception-Only Review
                              </option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                              Oversight Role{" "}
                              <span className="text-red-500">*</span>
                              <Tooltip text={HOVER_TEXT.oversight_role} />
                            </label>
                            <select
                              name="oversight_role"
                              value={values.oversight_role}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                              <option value="">Select oversight role</option>
                              <option value="risk_officer">Risk Officer</option>
                              <option value="compliance_reviewer">
                                Compliance Reviewer
                              </option>
                              <option value="product_owner">
                                Product Owner
                              </option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between space-x-3 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="rounded-md border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Previous
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-md border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  {currentStep < 3 ? (
                    <CustomButton
                      type="button"
                      onClick={() => {
                        if (canProceedToNext) {
                          setCurrentStep(currentStep + 1);
                        } else {
                          toast.error(
                            "Please fill in all required fields before continuing"
                          );
                        }
                      }}
                      disabled={!canProceedToNext}
                      className={`${!canProceedToNext ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      Continue
                    </CustomButton>
                  ) : (
                    <CustomButton
                      loading={isLoading || isSubmitting}
                      loadingText={isEditMode ? "Updating..." : "Creating..."}
                      type="button"
                      onClick={() => {
                        submitForm();
                      }}
                      startIcon={
                        isEditMode ? <Edit size={16} /> : <Plus size={16} />
                      }
                    >
                      {isEditMode ? "Update Application" : "Create Application"}
                    </CustomButton>
                  )}
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default AddApplication;
