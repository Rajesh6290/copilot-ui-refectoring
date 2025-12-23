import * as Yup from "yup";
const ShareValidationSchema = Yup.object({
    email: Yup.string()
        .required("Email is required")
        .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please enter a valid email address"
        ),
    role: Yup.string().optional(),
    group: Yup.array().optional(),
});
export { ShareValidationSchema }