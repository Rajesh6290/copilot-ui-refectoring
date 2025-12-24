import * as Yup from "yup";
const NewGroupSchema = Yup.object({
  groupName: Yup.string().required("Group Name is required"),
  description: Yup.string().required("Description is required"),
  role: Yup.string().required("Role is required"),
  user: Yup.array().optional(),
});


export { NewGroupSchema }