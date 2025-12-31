import * as Yup from "yup";
const NewSurveySchema = Yup.object().shape({
  formName: Yup.string().required("Survey name is required"),
  domain: Yup.string().required("Domain is required"),
  type: Yup.string().required("Subject type is required"),
  stakeholder: Yup.string().required("Stakeholder is required")
});

const QuestionSchema = Yup.object().shape({
  label: Yup.string()
    .required("Question label is required")
    .min(3, "Label must be at least 3 characters"),
  type: Yup.string().required("Field type is required"),
  required: Yup.boolean().default(false),
  options: Yup.array().when("type", {
    is: (type: string) =>
      ["select", "radio", "checkbox", "multipleselect"].includes(type),
    then: () =>
      Yup.array()
        .min(1, "At least one option is required")
        .of(
          Yup.object().shape({
            id: Yup.string().required(),
            value: Yup.string().required("Option cannot be empty")
          })
        ),
    otherwise: () => Yup.array().notRequired()
  })
});

const BasicDetailsSchema = Yup.object().shape({
  surveyName: Yup.string().required("Survey name is required"),
  surveyDescription: Yup.string().optional(),
  categoryName: Yup.string().optional(),
  categoryDescription: Yup.string().optional(),
  domain: Yup.string().required("Domain is required"),
  subjectType: Yup.string().required("Subject type is required"),
  stakeholder: Yup.string().required("Stakeholder is required")
});
export { NewSurveySchema, QuestionSchema, BasicDetailsSchema };
