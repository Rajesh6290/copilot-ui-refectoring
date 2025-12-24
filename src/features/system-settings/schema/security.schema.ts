import * as Yup from "yup";
const SecuritySchema = Yup.object().shape({
  mfaRequired: Yup.boolean(),
  apiAccessControl: Yup.boolean(),
  sessionTimeout: Yup.string().required("Session timeout is required"),
  dataEncryption: Yup.boolean()
});
export { SecuritySchema };
