import * as Yup from "yup";
const CustomMetricSchema = ({
  hasExistingApplication
}: {
  hasExistingApplication: boolean;
}) => {
  return Yup.object({
    application_name: hasExistingApplication
      ? Yup.string()
      : Yup.string()
          .required("Application name is required")
          .min(2, "Application name must be at least 2 characters")
          .max(100, "Application name must not exceed 100 characters"),
    application_id: hasExistingApplication
      ? Yup.string().required("Please select an application")
      : Yup.string(),
    use_case: Yup.string()
      .required("Use case is required")
      .notOneOf([""], "Please select a use case")
  });
};
export default CustomMetricSchema;
