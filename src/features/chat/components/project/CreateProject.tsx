"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomInputField from "@/shared/core/CustomInputField";
import useMutation from "@/shared/hooks/useMutation";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import * as Yup from "yup";
const CreateProject = ({
  open,
  setOpen,
  projectMutate,
  userId
}: {
  open: boolean;
  setOpen: () => void;
  projectMutate: () => void;
  userId: string;
}) => {
  const { isLoading, mutation } = useMutation();
  const Schema = [
    {
      key: "1",
      label: "Project Name *",
      name: "projectName",
      type: "text",
      initialValue: "",
      className: "col-span-12",
      validationSchema: Yup.string().required("Project name is required")
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
      const res = await mutation("projects/", {
        method: "POST",
        body: {
          project_name: values["projectName"],
          user_id: userId
        }
      });
      if (res?.status === 200) {
        toast.success("Project created successfully");
        resetForm();
        setOpen();
        projectMutate();
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
      <DialogTitle className="flex flex-col border-b border-gray-200 dark:border-gray-700">
        <span className="text-gray-900 dark:text-white">Create Project</span>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-500">
          {"Let′s create project to collect chats"}{" "}
        </p>
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={Yup?.object(validationSchema)}
        onSubmit={handleOperation}
        enableReinitialize={true}
      >
        {(formik) => (
          <Form className="grid w-full grid-cols-12 gap-2 md:gap-4">
            {Schema?.map((inputItem) => (
              <Field name={inputItem?.name} key={inputItem?.key}>
                {() => (
                  <div
                    className={`flex flex-col justify-start gap-2 p-4 ${inputItem?.className}`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {inputItem?.label}
                    </div>
                    <CustomInputField
                      key={inputItem?.key}
                      name={inputItem?.name}
                      type={inputItem?.type}
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
                      error={Boolean(
                        formik?.touched[inputItem?.name] &&
                        formik?.errors[inputItem?.name]
                      )}
                      placeholder="Enter Project Name"
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
            <DialogActions className="col-span-12 flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700">
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
                  loadingText="Creating..."
                  type="submit"
                  className="w-fit"
                  startIcon={<Plus />}
                >
                  Create Project
                </CustomButton>
              </div>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default CreateProject;
