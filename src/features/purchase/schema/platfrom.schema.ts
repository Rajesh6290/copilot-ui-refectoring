import * as Yup from "yup";
const PlatformPurchaseSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  companyName: Yup.string().required("Company name is required"),
  companyEmail: Yup.string()
    .email("Invalid email")
    .required("Company email is required"),
  companyPhone: Yup.string().optional(),
  websiteURL: Yup.string().optional(),
  description: Yup.string().optional(),
  useCase: Yup.string().optional(),
  companyAddress: Yup.string().optional(),
  agreement: Yup.boolean().oneOf([true], "You must agree to the terms")
});
export default PlatformPurchaseSchema;
