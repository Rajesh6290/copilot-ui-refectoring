import { FormikHelpers, useFormik } from "formik";
import React, { useMemo } from "react";

import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { UpdateRiskSchema } from "../../schema/risk.schema";
import { Risk } from "./RiskRegister";

// Define interfaces for the component props and form values
interface Props {
  isOpen: boolean;
  onClose: () => void;
  mutate: () => void;
  data: Risk | null;
}

interface FormValues {
  likelihood: number;
  impact: number;
  riskLevel: string;
}

// Define interface for the ScoreSelector component props
interface ScoreSelectorProps {
  name: string;
  value: number;
  onChange: (field: string, value: number) => void;
  onBlur: (field: string, touched: boolean) => void;
}

// Enum mappings
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

// Reverse mappings - convert string labels back to numbers
const LikelihoodValues = Object.fromEntries(
  Object.entries(LikelihoodLabels).map(([key, value]) => [value, parseInt(key)])
) as Record<string, number>;

const ImpactValues = Object.fromEntries(
  Object.entries(ImpactLabels).map(([key, value]) => [value, parseInt(key)])
) as Record<string, number>;

const RiskLevelOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" }
];

const UpdateRisk: React.FC<Props> = ({ isOpen, onClose, mutate, data }) => {
  const { isLoading, mutation } = useMutation();

  const initialValue = useMemo(() => {
    // Convert string values to numbers, with fallbacks
    const likelihoodScore =
      typeof data?.likelihood === "string"
        ? LikelihoodValues[data.likelihood] || 1
        : data?.likelihood || 1;

    const impactScore =
      typeof data?.impact === "string"
        ? ImpactValues[data.impact] || 1
        : data?.impact || 1;

    return {
      likelihood: likelihoodScore,
      impact: impactScore,
      riskLevel: data?.risk_level || ""
    };
  }, [data?.likelihood, data?.impact, data?.risk_level]);

  const formik = useFormik<FormValues>({
    initialValues: initialValue,
    enableReinitialize: true, // Important: reinitialize when initialValue changes
    validationSchema: UpdateRiskSchema,
    onSubmit: async (values, { resetForm }: FormikHelpers<FormValues>) => {
      try {
        const res = await mutation(
          `risk?doc_id=${data?.doc_id}&impact=${ImpactLabels[values.impact as keyof typeof ImpactLabels]}&likelihood=${LikelihoodLabels[values.likelihood as keyof typeof LikelihoodLabels]}&risk_level=${values.riskLevel}`,
          {
            method: "PATCH",
            isAlert: false
          }
        );
        if (res?.status === 200) {
          toast.success("Risk updated successfully");
          mutate();
          onClose();
          resetForm();
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

  const ScoreSelector: React.FC<
    ScoreSelectorProps & { type: "likelihood" | "impact" }
  > = ({ name, value, onChange, onBlur, type }) => {
    const labels = type === "likelihood" ? LikelihoodLabels : ImpactLabels;

    return (
      <div className="mt-2">
        {/* Score display */}
        <div className="mb-1 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <div className="text-sm font-medium text-gray-600">
            {labels[value as keyof typeof labels]}
          </div>
        </div>

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
                className={`h-5 w-5 cursor-pointer rounded-md ${
                  score <= value
                    ? "border-2 border-white bg-tertiary shadow-sm"
                    : "border-2 border-tertiary-200 bg-white"
                } transition-all duration-200 hover:scale-110 hover:border-tertiary-300`}
              />
            ))}
          </div>

          {/* Score labels */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between">
            <div className="text-sm text-gray-500">1</div>
            {[2, 3, 4, 5].map((score) => (
              <div key={score} className="text-sm text-gray-500">
                {score}
              </div>
            ))}
          </div>
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
          Update Risk
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
          {/* Likelihood Field */}
          <div className="space-y-2">
            <div>
              <span className="block font-medium">Likelihood</span>
              <p className="text-sm text-gray-500">
                Select a score that represents how likely it is that an
                intentional or accidental incident will take place based on this
                risk.
              </p>
            </div>
            <div className="h-fit w-full rounded-lg bg-gray-100 px-5 pb-10 pt-5">
              <ScoreSelector
                name="likelihood"
                value={formik.values.likelihood}
                onChange={formik.setFieldValue}
                onBlur={formik.setFieldTouched}
                type="likelihood"
              />
            </div>
            <ErrorMessage fieldName="likelihood" />
          </div>

          {/* Impact Field */}
          <div className="space-y-2">
            <div>
              <span className="block font-medium">Impact</span>
              <p className="text-sm text-gray-500">
                {`Select a score that represents how much the exploitation of this
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
                type="impact"
              />
            </div>
            <ErrorMessage fieldName="impact" />
          </div>

          {/* Risk Level Field */}
          <div className="space-y-2">
            <div>
              <span className="block font-medium">Risk Level</span>
              <p className="text-sm text-gray-500">
                Select the overall risk level for this risk assessment.
              </p>
            </div>
            <select
              name="riskLevel"
              value={formik.values.riskLevel}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={getInputClass("riskLevel")}
            >
              <option value="" disabled>
                Select Risk Level
              </option>
              {RiskLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ErrorMessage fieldName="riskLevel" />
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
              loadingText="Updating..."
            >
              Update Risk
            </CustomButton>
          </div>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateRisk;
