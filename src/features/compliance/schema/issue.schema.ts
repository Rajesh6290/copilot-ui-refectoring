import * as Yup from "yup";
const IssueValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  priority: Yup.string().required("Priority is required"),
  type: Yup.string().required("Type is required"),
  status: Yup.string().required("Status is required"),
  assigned_to: Yup.object().shape({
    user_id: Yup.string().required("Please select an assignee"),
    email: Yup.string().nullable(),
    username: Yup.string().nullable(),
    role: Yup.string().nullable(),
  }),
  due_date: Yup.string().required("Due Date is required"),
  tags: Yup.array().of(Yup.string()),
});
export { IssueValidationSchema };