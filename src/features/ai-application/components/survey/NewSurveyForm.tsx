"use client";
import { Dialog } from "@mui/material";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { toast } from "sonner";
import { NewSurveySchema } from "../../schema/survey.schema";
import useMutation from "@/shared/hooks/useMutation";
import CustomButton from "@/shared/core/CustomButton";

interface FormValues {
  id?: number;
  createdAt?: Date;
  formName: string;
  domain: string;
  type: string;
  stakeholder: string;
}
const NewSurveyForm = ({
  open,
  close,
  mutate
}: {
  open: boolean;
  close: () => void;
  mutate: () => void;
}) => {
  const { isLoading, mutation } = useMutation();

  const initialValues: FormValues = {
    formName: "",
    domain: "",
    type: "",
    stakeholder: ""
  };

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      const res = await mutation("survey", {
        method: "POST",
        isAlert: false,
        body: {
          title: values?.formName,
          domain: values?.domain,
          subject_type: values?.type,
          stakeholder_role: values?.stakeholder
        }
      });
      if (res?.status === 201) {
        mutate();
        close();
        toast.success("Survey created successfully");
        resetForm(); // Reset form fields
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: "dark:bg-darkMainBackground dark:text-white  shadow-xl",
        style: {
          borderRadius: "5px"
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full flex-col rounded bg-white shadow-xl dark:bg-darkMainBackground">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-3 dark:border-gray-700 dark:bg-darkMainBackground">
          <h2 className="font-satoshi text-2xl font-semibold text-gray-800 dark:text-white">
            Create New Survey
          </h2>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={NewSurveySchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="flex h-full flex-col">
              <div className="max-h-[calc(90vh-8rem)] flex-1 space-y-8 overflow-y-auto p-6">
                {/* Form Details Section */}
                <div className="space-y-6 rounded-xl bg-gray-50 p-6 dark:bg-darkSidebarBackground">
                  <h3 className="text-lg font-medium dark:text-white">
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="mb-1.5 block text-sm font-medium dark:text-gray-200">
                        Survey Name
                      </span>
                      <Field
                        name="formName"
                        className="w-full rounded-lg border bg-white px-4 py-2.5 outline-none transition-shadow dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                        placeholder="Enter a descriptive name"
                      />
                      <ErrorMessage
                        name="formName"
                        component="div"
                        className="mt-1.5 text-sm text-red-500"
                      />
                    </div>

                    <div>
                      <span className="mb-1.5 block text-sm font-medium dark:text-gray-200">
                        Domain
                      </span>
                      <Field
                        name="domain"
                        className="w-full rounded-lg border bg-white px-4 py-2.5 outline-none transition-shadow dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                        placeholder="Enter domain"
                      />
                      <ErrorMessage
                        name="domain"
                        component="div"
                        className="mt-1.5 text-sm text-red-500"
                      />
                    </div>

                    <div>
                      <span className="mb-1.5 block text-sm font-medium dark:text-gray-200">
                        Subject Type
                      </span>
                      <Field
                        as="select"
                        name="type"
                        className="w-full rounded-lg border bg-white px-4 py-2.5 outline-none transition-shadow dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                      >
                        <option value="">Subject type</option>
                        <option value="application">Application</option>
                        <option value="vendor">Vendor</option>
                        <option value="process">process</option>
                        <option value="system">system</option>
                        <option value="organization">organization</option>
                      </Field>
                      <ErrorMessage
                        name="type"
                        component="div"
                        className="mt-1.5 text-sm text-red-500"
                      />
                    </div>

                    <div>
                      <span className="mb-1.5 block text-sm font-medium dark:text-gray-200">
                        Stakeholder
                      </span>
                      <Field
                        as="select"
                        name="stakeholder"
                        className="w-full rounded-lg border bg-white px-4 py-2.5 outline-none transition-shadow dark:border-neutral-800 dark:bg-darkMainBackground dark:text-white"
                      >
                        <option value="">Select stakeholder</option>
                        <option value="data_scientist">Data Scientist</option>
                        <option value="business_teams">Business Teams</option>
                        <option value="vendor_management">
                          Vendor Management
                        </option>
                      </Field>
                      <ErrorMessage
                        name="stakeholder"
                        component="div"
                        className="mt-1.5 text-sm text-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="border-t bg-gray-50 p-3 dark:border-gray-700 dark:bg-darkMainBackground">
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-lg border border-gray-200 px-6 py-2 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <div className="w-fit">
                    <CustomButton
                      type="submit"
                      className="w-fit"
                      disabled={isLoading}
                      loading={isLoading}
                    >
                      {isLoading ? "Creating..." : "Create Survey"}
                    </CustomButton>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Dialog>
  );
};

export default NewSurveyForm;
