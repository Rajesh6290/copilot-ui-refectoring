import * as Yup from "yup";
const UpdateRiskSchema =Yup.object({
      likelihood: Yup.number()
        .min(1, "Please select a score")
        .max(5, "Please select a score")
        .required("Required"),
      impact: Yup.number()
        .min(1, "Please select a score")
        .max(5, "Please select a score")
        .required("Required"),
      riskLevel: Yup.string().required("Risk level is required"),
    });
const NewScenarioSchema=Yup.object({
      riskId: Yup.string().required("Risk ID is required"),
      riskName: Yup.string().required("Risk Name is required"),
      description: Yup.string()
        .required("Description is required")
        .min(10, "Description should be at least 10 characters"),
      probability: Yup.number()
        .min(1, "Please select a score")
        .max(5, "Please select a score")
        .required("Required"),
      impact: Yup.number()
        .min(1, "Please select a score")
        .max(5, "Please select a score")
        .required("Required"),
      riskLevel: Yup.string().required("Risk Level is required"),
      riskType: Yup.string().required("Risk Type is required"),
      customRiskType: Yup.string().when("riskType", {
        is: "Other",
        then: (schema) => schema.required("Custom Risk Type is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      mitigationStrategy: Yup.string()
        .required("Mitigation Strategy is required")
        .min(5, "Mitigation Strategy should be at least 5 characters"),
      controlEffectiveness: Yup.number()
        .min(0, "Value must be between 0 and 1")
        .max(1, "Value must be between 0 and 1")
        .required("Control Effectiveness is required"),
      tags: Yup.array().of(Yup.string()).notRequired(),
      nots: Yup.string().notRequired(),
    })
const UpdateScenarioSchema=Yup.object({
      riskId: Yup.string().required("Risk ID is required"),
      riskName: Yup.string().required("Risk Name is required"),
      description: Yup.string()
        .required("Description is required")
        .min(10, "Description should be at least 10 characters"),
      probability: Yup.number()
        .min(1, "Please select a score")
        .max(5, "Please select a score")
        .required("Required"),
      impact: Yup.number()
        .min(1, "Please select a score")
        .max(5, "Please select a score")
        .required("Required"),
      riskLevel: Yup.string().required("Risk Level is required"),
      riskType: Yup.string().required("Risk Type is required"),
      customRiskType: Yup.string().when("riskType", {
        is: "Other",
        then: (schema) => schema.required("Custom Risk Type is required"),
        otherwise: (schema) => schema.notRequired()
      }),
      mitigationStrategy: Yup.string()
        .required("Mitigation Strategy is required")
        .min(5, "Mitigation Strategy should be at least 5 characters"),
      controlEffectiveness: Yup.number()
        .min(0, "Value must be between 0 and 1")
        .max(1, "Value must be between 0 and 1")
        .required("Control Effectiveness is required"),
        notes: Yup.string().notRequired(),
        tags: Yup.array().of(Yup.string()).notRequired()
    })
export { UpdateRiskSchema,NewScenarioSchema,UpdateScenarioSchema };