import * as Yup from "yup";
const NewAuditValidationSchemas = [
  // Step 1: Basic Information
  Yup.object().shape({
    title: Yup.string().required("Assessment name is required"),
    description: Yup.string().required("Description is required"),
    audit_window: Yup.object().shape({
      start_date: Yup.string().required("Start date is required"),
      end_date: Yup.string()
        .required("End date is required")
        .test(
          "is-after-start",
          "End date must be after start date",
          function (value) {
            const { start_date } = this.parent;
            if (!value || !start_date) {
              return true;
            }
            return new Date(value) >= new Date(start_date);
          }
        )
    })
  }),
  // Step 2: Framework Selection
  Yup.object().shape({
    framework_ids: Yup.array()
      .min(1, "Please select at least one framework")
      .required("Please select at least one framework")
  }),
  // Step 3: Auditor Information (Optional)
  Yup.object().shape({
    auditor_name: Yup.string(),
    auditor_email: Yup.string().email("Invalid email format"),
    auditor_role: Yup.string()
  })
];
// Validation schemas for each step
const UpdateAuditValidationSchemas = [
  // Step 1: Basic Information with Status
  Yup.object().shape({
    title: Yup.string().required("Assessment name is required"),
    description: Yup.string().required("Description is required"),
    status: Yup.string().required("Status is required"),
    audit_window: Yup.object().shape({
      start_date: Yup.string().required("Start date is required"),
      end_date: Yup.string()
        .required("End date is required")
        .test(
          "is-after-start",
          "End date must be after start date",
          function (value) {
            const { start_date } = this.parent;
            if (!value || !start_date) {
              return true;
            }
            return new Date(value) >= new Date(start_date);
          }
        )
    })
  }),
  // Step 2: Framework Selection
  Yup.object().shape({
    framework_ids: Yup.array()
      .min(1, "Please select at least one framework")
      .required("Please select at least one framework")
  })
];
// Validation schema for Add Auditor form
const AddAuditorSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  role: Yup.string().required("Role is required")
});

export {
  NewAuditValidationSchemas,
  UpdateAuditValidationSchemas,
  AddAuditorSchema
};
