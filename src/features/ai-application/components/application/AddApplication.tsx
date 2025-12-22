import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogTitle } from "@mui/material";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { Edit, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { NewApplicationValidationSchema } from "../../schema/application.schema";
import dynamic from "next/dynamic";
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
}
// Options for MultiSelect and Dropdowns
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
  };
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  setSelectedApplication: (value: null) => void;
}) => {
  const { isLoading, mutation } = useMutation();
  const { user } = useUser();
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
        risk_level: selectedApplication.risk_level || ""
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
      risk_level: ""
    };
  };
  const handleSubmit = async (
    values: ApplicationFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ApplicationFormValues>
  ) => {
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
        risk_level: values.risk_level || undefined
      };

      const res = await mutation(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        isAlert: false,
        body: payload
      });

      if (res?.status === 201 || res?.status === 200) {
        mutate();
        onClose();
        setIsEditMode(false);
        setSelectedApplication(null);
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-lg"
      }}
      onClose={onClose}
    >
      <DialogTitle className="flex items-center justify-between border-b border-gray-200 px-6 py-2.5 dark:border-gray-700">
        <span className="text-gray-900 dark:text-white">
          {isEditMode ? "Edit Application" : "Create Application"}
        </span>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogTitle>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={NewApplicationValidationSchema}
        onSubmit={handleSubmit}
      >
        {({
          errors,
          touched,
          values,
          handleChange,
          handleBlur,
          isSubmitting
        }) => (
          <Form className="w-full">
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-4 space-y-2">
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
                      {
                        "E.g., Customer Support Chatbot, Credit Risk Prediction Model"
                      }
                    </p>
                    {touched.name && errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="mb-4 space-y-2">
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
                      <p className="text-sm text-red-500">{errors.version}</p>
                    )}
                  </div>

                  <div className="mb-4 space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Application Owner <span className="text-red-500">*</span>
                    </span>
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

                  {isEditMode && (
                    <>
                      <div className="mb-4 space-y-2">
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
                        {touched.department && errors.department && (
                          <p className="text-sm text-red-500">
                            {errors.department}
                          </p>
                        )}
                      </div>

                      <div className="mb-4 space-y-2">
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
                        {touched.sensitivity && errors.sensitivity && (
                          <p className="text-sm text-red-500">
                            {errors.sensitivity}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <div className="mb-4 space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Use Case Type <span className="text-red-500">*</span>
                    </span>
                    <div className="relative">
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
                    </div>
                    {touched.use_case_type && errors.use_case_type && (
                      <p className="text-sm text-red-500">
                        {errors.use_case_type}
                      </p>
                    )}
                  </div>

                  {isEditMode && (
                    <>
                      <div className="mb-4 space-y-2">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Compliance Status
                        </span>
                        <Field
                          name="compliance_status"
                          component={CustomMultiSelect}
                          options={complianceStatusOptions}
                        />
                        {touched.compliance_status &&
                          errors.compliance_status && (
                            <p className="text-sm text-red-500">
                              {errors.compliance_status}
                            </p>
                          )}
                      </div>

                      <div className="mb-4 space-y-2">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Risk Level
                        </span>
                        <div className="relative">
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
                      </div>
                    </>
                  )}
                  <div className="mb-4 space-y-2">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Purpose <span className="text-red-500">*</span>
                    </span>
                    <textarea
                      name="purpose"
                      rows={2}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.purpose}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {values.purpose?.length || 0}/500 characters
                    </div>
                    {touched.purpose && errors.purpose && (
                      <p className="text-sm text-red-500">{errors.purpose}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t border-gray-200 p-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <CustomButton
                loading={isLoading || isSubmitting}
                loadingText={isEditMode ? "Updating..." : "Creating..."}
                type="submit"
                startIcon={isEditMode ? <Edit size={16} /> : <Plus size={16} />}
              >
                {isEditMode ? "Update Application" : "Create Application"}
              </CustomButton>
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default AddApplication;
