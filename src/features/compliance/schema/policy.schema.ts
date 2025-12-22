import * as Yup from "yup";
// / File validation function
const validateFile = (file: File): boolean => {
  const supportedFormats = ["pdf"];
  const extension = file.name.split(".").pop()?.toLowerCase() || "";

  // Check if file is too large (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return false;
  }

  return supportedFormats.includes(extension);
};

const NewPolicySchema = Yup.object({
  name: Yup.string()
    .required("Policy name is required")
    .min(3, "Policy name must be at least 3 characters")
    .max(50, "Policy name must be less than 50 characters"),
  description: Yup.string()
    .max(500, "Description must be less than 500 characters")
    .required("Policy description is required"),
  policyFiles: Yup.array()
    .of(
      Yup.mixed<File>().test(
        "fileFormat",
        "Only PDF files under 10MB are allowed",
        (value) => value && validateFile(value)
      )
    )
    .min(1, "At least one policy file is required")
    .required("At least one policy file is required")
});
export { NewPolicySchema };
