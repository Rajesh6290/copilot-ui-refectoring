import CustomButton from "@/shared/core/CustomButton";
import CustomInputField from "@/shared/core/CustomInputField";
import useMutation from "@/shared/hooks/useMutation";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import * as Yup from "yup";
export interface PROJECTDATA {
  project_id: string;
  project_name: string;
  user_id: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  session_ids: string[];
}
const AddToProject = ({
  open,
  setOpen,
  mutate,
  projectMutate,
  userId,
  projectData,
  sessionId
}: {
  open: boolean;
  setOpen: () => void;
  mutate: () => void;
  projectMutate: () => void;
  userId: string;
  projectData: PROJECTDATA[];
  sessionId: string;
}) => {
  const { isLoading, mutation } = useMutation();
  const Schema = [
    {
      key: "1",
      label: "Add To Project *",
      name: "project",
      options:
        projectData?.length > 0
          ? projectData?.map(
              (item: { project_id: string; project_name: string }) => {
                return {
                  label: item?.project_name,
                  value: item?.project_id
                };
              }
            )
          : [],
      type: "select",
      initialValue: "",
      className: "col-span-12",
      loading: false,
      validationSchema: Yup.string().required("Required")
    }
  ];
  const initialValues = Schema?.reduce(
    (accumulator: Record<string, string>, currentValue) => {
      accumulator[currentValue?.name] = currentValue.initialValue;
      return accumulator;
    },
    {} as Record<string, string>
  );
  const validationSchema = Schema?.reduce(
    (accumulator: Record<string, Yup.StringSchema>, currentValue) => {
      accumulator[currentValue?.name] = currentValue.validationSchema;
      return accumulator;
    },
    {} as Record<string, Yup.StringSchema>
  );
  const handleOperation = async (
    values: Record<string, string>,
    { resetForm }: FormikHelpers<Record<string, string>>
  ) => {
    try {
      const res = await mutation("projects/chat/", {
        method: "POST",
        body: {
          user_id: userId,
          project_id: values["project"],
          session_id: sessionId
        }
      });
      if (res?.status === 200) {
        toast.success("Project created successfully");
        resetForm();
        setOpen();
        mutate();
        projectMutate();
      } else {
        toast.error("Failed to create project");
      }
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={setOpen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-lg"
      }}
    >
      <DialogTitle className="border-b border-gray-200 dark:border-gray-700">
        <span className="text-gray-900 dark:text-white">Add To Project</span>
      </DialogTitle>
      <div className="flex w-full flex-col gap-6 bg-white dark:bg-[#09090B]">
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object(validationSchema)}
          onSubmit={handleOperation}
          enableReinitialize={true}
        >
          {(formik) => (
            <Form className="grid w-full grid-cols-12 gap-2 md:gap-4">
              {Schema.map((inputItem) => (
                <Field name={inputItem?.name} key={inputItem?.key}>
                  {() => (
                    <div
                      className={`flex flex-col justify-start gap-2 p-6 ${inputItem?.className}`}
                    >
                      <CustomInputField
                        key={inputItem?.key}
                        label={"Select Project"}
                        name={inputItem?.name}
                        type={inputItem?.type}
                        options={inputItem?.options}
                        value={formik?.values[inputItem?.name] || ""}
                        onChange={(
                          e:
                            | React.ChangeEvent<
                                HTMLInputElement | HTMLTextAreaElement
                              >
                            | React.ChangeEvent<HTMLSelectElement>
                        ) => {
                          formik.handleChange(e);
                        }}
                        onBlur={formik.handleBlur}
                        fullWidth
                        formik={formik}
                        loading={inputItem?.loading}
                        error={Boolean(
                          formik?.touched[inputItem?.name] &&
                          formik?.errors[inputItem?.name]
                        )}
                        helperText={
                          (formik?.touched[inputItem?.name] &&
                            (formik?.errors[inputItem?.name] as string)) ||
                          false
                        }
                      />
                    </div>
                  )}
                </Field>
              ))}
              <DialogActions className="col-span-12 flex items-center justify-end gap-5 border-t border-gray-200 p-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={setOpen}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <div className="w-fit">
                  <CustomButton
                    loading={isLoading}
                    loadingText="Adding..."
                    type="submit"
                    className="w-fit"
                    startIcon={<Plus />}
                  >
                    Add To Project
                  </CustomButton>
                </div>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </div>
    </Dialog>
  );
};

export default AddToProject;
