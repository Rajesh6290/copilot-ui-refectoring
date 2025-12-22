import * as Yup from "yup";
const FILE_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
const CompanyInfoSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name is too short")
    .max(50, "Name is too long")
    .required("Company name is required"),

  website: Yup.string()
    .url("Please enter a valid URL (e.g., https://example.com)")
    .required("Company website is required"),

  email: Yup.string()
    // .email("Please enter a valid email")
    .required("Company email is required"),
  phone: Yup.string().optional(),

  description: Yup.string()
    .min(10, "Description is too short")
    .max(2000, "Description is too long")
    .required("Company description is required"),

  logo: Yup.mixed()
    .test(
      "fileSize",
      "File is too large (max 2MB)",
      (file) =>
        typeof file === "string" ||
        !file ||
        (file instanceof File && file.size <= FILE_SIZE)
    )
    .test(
      "fileFormat",
      "Unsupported format (only JPG, JPEG, PNG)",
      (file) =>
        typeof file === "string" ||
        !file ||
        (file instanceof File && SUPPORTED_FORMATS.includes(file.type))
    )
});
export default CompanyInfoSchema;
