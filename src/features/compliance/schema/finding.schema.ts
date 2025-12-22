import * as Yup from "yup";
const NewFindingValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must not exceed 100 characters"),
  message: Yup.string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters long")
});
const UpdateFindingValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must not exceed 100 characters"),
  message: Yup.string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters long"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["pass", "fail", "other"], "Invalid status selected")
});
export { NewFindingValidationSchema, UpdateFindingValidationSchema };
