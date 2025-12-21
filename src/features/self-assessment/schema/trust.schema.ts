import * as Yup from "yup";
const EmailSchema = Yup.object().shape({
  emailInput: Yup.string().test(
    "emails",
    "Contains invalid emails",
    (value) => {
      if (!value || value.trim() === "") {return true;}
      const emails = value.split(/[\s,]+/).filter(Boolean);
      return emails.every((email) => Yup.string().email().isValidSync(email));
    },
  ),
  emailArray: Yup.array()
    .of(Yup.string().email("Invalid email format"))
    .min(1, "At least one email is required")
    .required("At least one email is required")
    .test("unique", "Duplicate emails found", (array) => {
      if (!array) {return true;}
      const uniqueEmails = new Set(array);
      return uniqueEmails.size === array.length;
    }),
  expiryTime: Yup.date()
    .required("Please select an expiry date and time")
    .min(new Date(), "Expiry must be in the future")
    .typeError("Invalid date format"),
});
export default EmailSchema;