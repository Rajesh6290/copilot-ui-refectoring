import * as Yup from "yup";
const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "live.com",
  "msn.com",
  "ymail.com",
  "protonmail.com",
  "mail.com",
  "zoho.com",
  "fastmail.com",
  "gmx.com",
  "rediffmail.com",
  "tutanota.com",
  "guerrillamail.com",
  "tempmail.org",
  "10minutemail.com",
  "mailinator.com",
  "yopmail.com"
];

export const isPersonalEmail = (email: string): boolean => {
  if (!email || !email.includes("@")) {
    return false;
  }
  const domain = email.split("@")[1]?.toLowerCase() || "";
  return PERSONAL_EMAIL_DOMAINS.includes(domain);
};
const FreeTrialValidationSchema = Yup.object({
  fullName: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Full name is required"),
  workEmail: Yup.string()
    .email("Invalid email format")
    .test("business-domain", "Please use a business email address", (value) => {
      if (!value) {
        return false;
      }
      return !isPersonalEmail(value);
    })
    .required("Work email is required"),
  company: Yup.string()
    .min(2, "Company name must be at least 2 characters")
    .required("Company/Organization is required"),
  role: Yup.string()
    .min(2, "Role must be at least 2 characters")
    .required("Role/Title is required"),
  contactMethod: Yup.string().required("Please select a contact method"),
  phoneNumber: Yup.string().when("contactMethod", {
    is: "phone",
    then: (schema) =>
      schema.required(
        "Phone number is required when phone contact is selected"
      ),
    otherwise: (schema) => schema.notRequired()
  }),
  goals: Yup.string(),
  updatesOptIn: Yup.boolean()
});

export default FreeTrialValidationSchema;
