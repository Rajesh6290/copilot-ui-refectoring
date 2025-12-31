import {
  ActionSupportedOption,
  ComplianceStatusOption,
  DataSourceOption,
  ModelTypeOption,
  PreprocessingStepOption,
  UsedForOption
} from "../types/overview.types";

export const useAssetFormOptions = () => {
  const complianceStatusOptions: ComplianceStatusOption[] = [
    { value: "ccpa_compliant", label: "CCPA Compliant" },
    { value: "hipaa_compliant", label: "HIPAA Compliant" },
    { value: "iso_27001", label: "ISO 27001" },
    { value: "soc_2", label: "SOC 2" },
    { value: "not_assessed", label: "Not Assessed" },
    { value: "euro_ai", label: "EURO AI" },
    { value: "nist", label: "NIST" }
  ];

  const modelTypeOptions: ModelTypeOption[] = [
    { value: "generative", label: "Generative" },
    { value: "predictive", label: "Predictive" },
    { value: "other", label: "Other" }
  ];

  const dataSourcesOptions: DataSourceOption[] = [
    { value: "internal", label: "Internal" },
    { value: "public", label: "Public" },
    { value: "third_party", label: "Third-party" }
  ];

  const usedForOptions: UsedForOption[] = [
    { value: "training", label: "Training" },
    { value: "validation", label: "Validation" },
    { value: "testing", label: "Testing" },
    { value: "rag", label: "RAG" },
    { value: "fine-tuning", label: "Fine-Tuning" },
    { value: "other", label: "Other" }
  ];

  const preprocessingStepsOptions: PreprocessingStepOption[] = [
    { value: "normalization", label: "Normalization" },
    { value: "tokenization", label: "Tokenization" },
    { value: "data_cleaning", label: "Data Cleaning" },
    { value: "feature_extraction", label: "Feature Extraction" },
    { value: "encoding", label: "Encoding" }
  ];

  const actionSupportedOptions: ActionSupportedOption[] = [
    { value: "classification", label: "Classification" },
    { value: "regression", label: "Regression" },
    { value: "clustering", label: "Clustering" },
    { value: "recommendation", label: "Recommendation" },
    { value: "generation", label: "Generation" },
    { value: "other", label: "Other" }
  ];

  return {
    complianceStatusOptions,
    modelTypeOptions,
    dataSourcesOptions,
    usedForOptions,
    preprocessingStepsOptions,
    actionSupportedOptions
  };
};
