import * as Yup from "yup";
const FAQValidationSchema = Yup.object().shape({
  question: Yup.string()
    .required("Question is required")
    .min(5, "Question must be at least 5 characters"),
  answer: Yup.string()
    .required("Answer is required")
    .min(10, "Answer must be at least 10 characters"),
});
export default FAQValidationSchema;