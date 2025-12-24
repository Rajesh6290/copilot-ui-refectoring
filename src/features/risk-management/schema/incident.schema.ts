import * as Yup from "yup";
const NewIncidentValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  root_cause_summary: Yup.string(),
  status: Yup.string().required("Status is required"),
  tags: Yup.array().of(Yup.string()),
  impact_scope: Yup.string().required("Impact scope is required"),
  reported_at: Yup.string(),
  due_date: Yup.string().required("Due Date is required")
});

export { NewIncidentValidationSchema };
