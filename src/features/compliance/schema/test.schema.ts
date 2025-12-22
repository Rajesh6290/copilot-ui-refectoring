import * as Yup from "yup";
const NewTestValidationSchema = Yup.object({
  firstName: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  description: Yup.string()
    .max(500, "Description must be less than 500 characters")
    .required("Test description is required"),
  frequency: Yup.string()
    .required("Frequency is required")
    .oneOf(
      ["10sec", "daily", "weekly", "monthly", "quarterly", "yearly"],
      "Please select a valid frequency",
    ),
  preferredRunTime: Yup.string().required("Preferred run time is required"),
  application: Yup.string().required("Application is required"),
  notes: Yup.string().max(1000, "Notes must be less than 1000 characters"),
});
const UpdateTestValidationSchema = Yup.object({
  firstName: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  description: Yup.string()
    .max(500, "Description must be less than 500 characters")
    .required("Test description is required"),
  frequency: Yup.string()
    .required("Frequency is required")
    .oneOf(
      ["10sec", "daily", "weekly", "monthly", "quarterly", "yearly"],
      "Please select a valid frequency",
    ),
  preferredRunTime: Yup.string().required("Preferred run time is required"),
  application: Yup.string().required("Application is required"),
  notes: Yup.string().max(1000, "Notes must be less than 1000 characters"),
});
export { NewTestValidationSchema,UpdateTestValidationSchema }