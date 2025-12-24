import * as Yup from "yup";
const InviteUserValidationSchema = Yup.object({
  email: Yup.string()
    .required("Email is required")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    ),
  role: Yup.string().required("Role is required"),
  group: Yup.array().optional(),
});
const UpdateUserValidationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  role: Yup.string().required("Role is required"),
  group: Yup.array().optional()
});
export { InviteUserValidationSchema,UpdateUserValidationSchema };