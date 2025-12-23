import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { FormikHelpers, useFormik } from "formik";
import { AlertCircle, Plus, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { NewScenarioSchema } from "../../schema/risk.schema";
interface RiskScenarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  mutate: () => void;
}

interface FormValues {
  riskId: string;
  riskName: string;
  description: string;
  probability: number;
  impact: number;
  riskLevel: string;
  riskType: string;
  customRiskType: string;
  mitigationStrategy: string;
  tags: string[];
  controlEffectiveness: number;
  notes: string;
}

// Define interface for the ScoreSelector component props
interface ScoreSelectorProps {
  name: string;
  value: number;
  onChange: (field: string, value: number) => void;
  onBlur: (field: string, touched: boolean) => void;
  labels: Record<number, string>;
}

const LikelihoodLabels = {
  1: "Very Unlikely",
  2: "Unlikely",
  3: "Somewhat Likely",
  4: "Likely",
  5: "Very Likely"
};

const ImpactLabels = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High"
};

const RiskLevelOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" }
];

const RiskTypeOptions = [
  "Security & Cyber Risks",
  "Ethical & Societal Risks",
  "Compliance & Regulatory Risks",
  "AI Safety & Reliability Risks",
  "Inherent Risks",
  "Operational Risks",
  "Third-party & Vendor Risks",
  "Other"
];

const AddNewScenario: React.FC<RiskScenarioFormProps> = ({
  isOpen,
  onClose,
  mutate
}) => {
  const { isLoading, mutation } = useMutation();
  const [newTag, setNewTag] = useState("");
  const [showCustomRiskType, setShowCustomRiskType] = useState(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      riskId: "",
      riskName: "",
      description: "",
      probability: 1,
      impact: 1,
      riskLevel: "",
      riskType: "",
      customRiskType: "",
      mitigationStrategy: "",
      tags: [],
      controlEffectiveness: 0,
      notes: ""
    },
    validationSchema: NewScenarioSchema,
    onSubmit: async (values, { resetForm }: FormikHelpers<FormValues>) => {
      try {
        const finalRiskType =
          values.riskType === "Other" ? values.customRiskType : values.riskType;
        const probabilityText =
          LikelihoodLabels[values.probability as keyof typeof LikelihoodLabels];
        const impactText =
          ImpactLabels[values.impact as keyof typeof ImpactLabels];
        const res = await mutation("risk", {
          method: "POST",
          isAlert: false,
          body: {
            id: values.riskId,
            name: values.riskName,
            description: values.description,
            likelihood: probabilityText,
            impact: impactText,
            risk_level: values.riskLevel,
            risk_type: finalRiskType,
            mitigation_strategy: values.mitigationStrategy,
            tags: values.tags,
            control_effectiveness: values.controlEffectiveness,
            notes: values.notes
          }
        });
        if (res?.status === 201 || res?.status === 200) {
          toast.success("Risk created successfully");
          mutate();
          onClose();
          resetForm();
          setShowCustomRiskType(false);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    }
  });

  // Helper function to determine if field has error
  const hasError = (fieldName: keyof FormValues): boolean =>
    Boolean(formik.touched[fieldName] && formik.errors[fieldName]);

  // Helper function to get input class based on error state
  const getInputClass = (fieldName: keyof FormValues): string => `
    w-full border rounded-lg p-2 focus:outline-none focus:ring-2
    ${
      hasError(fieldName)
        ? "border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:ring-tertiary-500 focus:border-transparent"
    }
  `;

  const ScoreSelector: React.FC<ScoreSelectorProps> = ({
    name,
    value,
    onChange,
    onBlur,
    labels
  }) => {
    return (
      <div className="mt-2">
        {/* Main slider container */}
        <div className="relative h-16">
          {/* Base track line */}
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-neutral-300" />

          {/* Progress track - only show for values > 1 */}
          {value > 1 && (
            <div
              className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-tertiary transition-all duration-200"
              style={{
                width: `${((value - 1) / 4) * 100}%`
              }}
            />
          )}

          {/* Score dots container */}
          <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 items-center justify-between">
            {[1, 2, 3, 4, 5].map((score) => (
              <div
                key={score}
                tabIndex={0}
                role="button"
                onClick={() => {
                  onChange(name, score);
                  onBlur(name, true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onChange(name, score);
                    onBlur(name, true);
                  }
                }}
                className={`h-5 w-5 cursor-pointer rounded-full ${
                  score <= value
                    ? "border-2 border-white bg-tertiary shadow-sm"
                    : "border-2 border-tertiary-200 bg-white"
                } transition-all duration-200 hover:border-tertiary-300`}
              />
            ))}
          </div>

          {/* Score labels */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between">
            {[1, 2, 3, 4, 5].map((score) => (
              <div key={score} className="text-center text-xs text-gray-500">
                {score}
              </div>
            ))}
          </div>
        </div>

        {/* Selected label */}
        <div className="mt-8 text-center">
          <span className="text-sm font-medium text-gray-700">
            {labels[value]}
          </span>
        </div>
      </div>
    );
  };

  // Error message component
  const ErrorMessage: React.FC<{ fieldName: keyof FormValues }> = ({
    fieldName
  }) => {
    if (!hasError(fieldName)) {
      return null;
    }

    return (
      <div className="mt-1 flex items-center gap-1 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span>{formik.errors[fieldName]}</span>
      </div>
    );
  };

  // Handle adding new tag
  const handleAddTag = () => {
    if (newTag.trim() && !formik.values.tags.includes(newTag.trim())) {
      formik.setFieldValue("tags", [...formik.values.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  // Handle removing tag
  const handleRemoveTag = (tagToRemove: string) => {
    formik.setFieldValue(
      "tags",
      formik.values.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Handle risk type change
  const handleRiskTypeChange = (value: string) => {
    formik.setFieldValue("riskType", value);
    setShowCustomRiskType(value === "Other");
    if (value !== "Other") {
      formik.setFieldValue("customRiskType", "");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      classes={{
        paper: "flex flex-col h-[90vh]"
      }}
    >
      <DialogTitle className="flex flex-shrink-0 items-center justify-between border-b">
        <span className="text-xl font-semibold capitalize text-gray-700">
          Add new risk scenario
        </span>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogTitle>

      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <DialogContent className="flex-1 space-y-6 overflow-y-auto">
          {/* Risk ID Field */}
          <div>
            <label htmlFor="riskId" className="mb-1 block font-medium">
              Risk ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="riskId"
              {...formik.getFieldProps("riskId")}
              className={getInputClass("riskId")}
              placeholder="Enter risk ID..."
            />
            <ErrorMessage fieldName="riskId" />
          </div>

          {/* Risk Name Field */}
          <div>
            <label htmlFor="riskName" className="mb-1 block font-medium">
              Risk Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="riskName"
              {...formik.getFieldProps("riskName")}
              className={getInputClass("riskName")}
              placeholder="Enter risk name..."
            />
            <ErrorMessage fieldName="riskName" />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="mb-1 block font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              {...formik.getFieldProps("description")}
              className={`${getInputClass("description")} h-24 resize-none`}
              placeholder="Describe the risk scenario..."
            />
            <ErrorMessage fieldName="description" />
          </div>

          {/* Probability Field */}
          <div className="space-y-2">
            <div>
              <span className="block font-medium">
                Probability <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-500">
                Select a score that represents how likely it is that an
                intentional or accidental incident will take place based on this
                risk.
              </p>
            </div>
            <div className="h-fit w-full rounded-lg bg-gray-100 px-5 pb-10 pt-5">
              <ScoreSelector
                name="probability"
                value={formik.values.probability}
                onChange={formik.setFieldValue}
                onBlur={formik.setFieldTouched}
                labels={LikelihoodLabels}
              />
            </div>
            <ErrorMessage fieldName="probability" />
          </div>

          {/* Impact Field */}
          <div className="space-y-2">
            <div>
              <span className="block font-medium">
                Impact <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-500">
                {` Select a score that represents how much the exploitation of this
                risk would harm your organization's ability to continue to
                operate.`}
              </p>
            </div>
            <div className="h-fit w-full rounded-lg bg-gray-100 px-5 pb-10 pt-5">
              <ScoreSelector
                name="impact"
                value={formik.values.impact}
                onChange={formik.setFieldValue}
                onBlur={formik.setFieldTouched}
                labels={ImpactLabels}
              />
            </div>
            <ErrorMessage fieldName="impact" />
          </div>

          {/* Risk Level Field */}
          <div>
            <label htmlFor="riskLevel" className="mb-1 block font-medium">
              Risk Level <span className="text-red-500">*</span>
            </label>
            <select
              id="riskLevel"
              {...formik.getFieldProps("riskLevel")}
              className={getInputClass("riskLevel")}
            >
              <option value="">Select risk level</option>
              {RiskLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ErrorMessage fieldName="riskLevel" />
          </div>

          {/* Risk Type Field */}
          <div>
            <label htmlFor="riskType" className="mb-1 block font-medium">
              Risk Type <span className="text-red-500">*</span>
            </label>
            <select
              id="riskType"
              value={formik.values.riskType}
              onChange={(e) => handleRiskTypeChange(e.target.value)}
              className={getInputClass("riskType")}
            >
              <option value="">Select risk type</option>
              {RiskTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ErrorMessage fieldName="riskType" />
          </div>

          {/* Custom Risk Type Field */}
          {showCustomRiskType && (
            <div>
              <label
                htmlFor="customRiskType"
                className="mb-1 block font-medium"
              >
                Custom Risk Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customRiskType"
                {...formik.getFieldProps("customRiskType")}
                className={getInputClass("customRiskType")}
                placeholder="Enter custom risk type..."
              />
              <ErrorMessage fieldName="customRiskType" />
            </div>
          )}

          {/* Mitigation Strategy Field */}
          <div>
            <label
              htmlFor="mitigationStrategy"
              className="mb-1 block font-medium"
            >
              Mitigation Strategy <span className="text-red-500">*</span>
            </label>
            <textarea
              id="mitigationStrategy"
              {...formik.getFieldProps("mitigationStrategy")}
              className={`${getInputClass("mitigationStrategy")} h-24 resize-none`}
              placeholder="Describe the mitigation strategy..."
            />
            <ErrorMessage fieldName="mitigationStrategy" />
          </div>

          {/* Control Effectiveness Field */}
          <div>
            <label
              htmlFor="controlEffectiveness"
              className="mb-1 block font-medium"
            >
              Control Effectiveness (0-1){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="controlEffectiveness"
              step="0.1"
              min="0"
              max="1"
              {...formik.getFieldProps("controlEffectiveness")}
              className={getInputClass("controlEffectiveness")}
              placeholder="Enter value between 0 and 1..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter a decimal value between 0 and 1 (e.g., 0.1, 0.5, 0.9)
            </p>
            <ErrorMessage fieldName="controlEffectiveness" />
          </div>
          {/* Tags Field */}
          <div>
            <span className="mb-1 block font-medium">Tags</span>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-tertiary-500"
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="flex items-center gap-1 rounded-lg bg-tertiary px-3 py-2 text-white hover:bg-tertiary-600"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              {/* Display tags */}
              {formik.values.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formik.values.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-sm text-gray-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Notes Field */}
          <div>
            <span className="mb-1 block font-medium">
              Notes
              <span className="ml-2 text-sm text-gray-500">Optional</span>
            </span>
            <textarea
              {...formik.getFieldProps("notes")}
              className={`${getInputClass("notes")} h-24 resize-none`}
              placeholder="Additional notes..."
            />
          </div>
        </DialogContent>

        <DialogActions className="flex-shrink-0 border-t p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <div className="w-fit">
            <CustomButton
              type="submit"
              loading={isLoading}
              className="w-fit rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
              disabled={!formik.isValid || formik.isSubmitting || isLoading}
            >
              Create risk scenario
            </CustomButton>
          </div>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddNewScenario;
