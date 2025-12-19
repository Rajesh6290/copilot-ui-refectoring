import * as Yup from "yup";
const SubProcessorValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  purpose: Yup.string()
    .required("Purpose is required")
    .min(3, "Purpose must be at least 3 characters"),
  location: Yup.string().required("Location is required"),
  trust_center_url: Yup.string().url().optional(),
});
export default SubProcessorValidationSchema;