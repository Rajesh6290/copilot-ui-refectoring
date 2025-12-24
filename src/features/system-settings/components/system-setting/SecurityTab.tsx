"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { ChevronDown, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { SecuritySchema } from "../../schema/security.schema";

const SecurityTabSkeleton = () => {
  return (
    <div className="mt-6 w-full space-y-6 px-4 md:px-0">
      <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-neutral-700 dark:bg-darkSidebarBackground">
        {/* Section Header Skeleton */}
        <div className="border-b border-gray-200 bg-gray-100 px-4 py-4 dark:border-neutral-700 dark:bg-darkSidebarBackground sm:px-6">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-4 w-48 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-neutral-700">
          {/* MFA Setting Skeleton */}
          <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="mb-3 flex-1 sm:mb-0">
              <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-1 h-3 w-80 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="sm:ml-4">
              <div className="flex items-center">
                <div className="h-5 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="ml-2 h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>

          {/* API Access Skeleton */}
          <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="mb-3 flex-1 sm:mb-0">
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-1 h-3 w-80 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="sm:ml-4">
              <div className="flex items-center">
                <div className="h-5 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="ml-2 h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>

          {/* Session Timeout Skeleton */}
          <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="mb-3 flex-1 sm:mb-0">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-1 h-3 w-80 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="w-full sm:ml-4 sm:w-48">
              <div className="h-8 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>

          {/* Data Encryption Skeleton */}
          <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="mb-3 flex-1 sm:mb-0">
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-1 h-3 w-80 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="sm:ml-4">
              <div className="flex items-center">
                <div className="h-5 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="ml-2 h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons Skeleton */}
      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-0">
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 sm:mr-3 sm:w-auto"></div>
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 sm:w-auto"></div>
      </div>
    </div>
  );
};

const SecurityTab = () => {
  const { data, mutate, isValidating } = useSwr("security");
  const { isLoading, mutation } = useMutation();
  return (
    <div className="p-4 md:p-6">
      <div className="border-b border-gray-100 pb-5 dark:border-neutral-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Security & Authentication
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage security features and authentication methods
        </p>
      </div>
      {isValidating ? (
        <SecurityTabSkeleton />
      ) : (
        <Formik
          initialValues={{
            mfaRequired: data?.mfa_required || false,
            apiAccessControl:
              data?.api_access_control === "restricted" ? true : false,
            sessionTimeout: data?.session_timeout_minutes || 0,
            dataEncryption: data?.data_encryption_enabled || false
          }}
          validationSchema={SecuritySchema}
          enableReinitialize={true}
          onSubmit={async (values) => {
            try {
              const res = await mutation("security", {
                method: "PUT",
                isAlert: false,
                body: {
                  mfa_required: values.mfaRequired,
                  api_access_control:
                    values.apiAccessControl === true ? "restricted" : "public",
                  session_timeout_minutes: values.sessionTimeout,
                  data_encryption_enabled: values.dataEncryption
                }
              });
              if (res?.status === 200) {
                toast.success("Security settings saved successfully!");
                mutate();
              } else {
                toast.error("Failed to save security settings");
              }
            } catch (error) {
              toast.error(error instanceof Error);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="mt-6 w-full space-y-6">
              <div className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-neutral-700 dark:bg-darkSidebarBackground">
                <div className="border-b border-gray-200 bg-gray-100 px-4 py-4 dark:border-neutral-700 dark:bg-darkSidebarBackground sm:px-6">
                  <div className="flex items-center">
                    <Lock
                      size={16}
                      className="mr-2 text-gray-500 dark:text-gray-400"
                    />
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Authentication Settings
                    </h4>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {/* MFA */}
                  <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="mb-3 flex-1 sm:mb-0">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Multi-Factor Authentication (MFA)
                      </h5>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Require users to provide additional verification when
                        signing in
                      </p>
                    </div>
                    <div className="sm:ml-4">
                      <span className="relative inline-flex cursor-pointer items-center">
                        <Field
                          type="checkbox"
                          name="mfaRequired"
                          className="peer sr-only"
                        />
                        <div className="h-5 w-10 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-tertiary-600 peer-checked:after:translate-x-5 peer-focus:outline-none dark:bg-gray-600 dark:after:bg-gray-200 dark:peer-checked:bg-tertiary-500" />
                        <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                          Required for Admins
                        </span>
                      </span>
                      <ErrorMessage
                        name="mfaRequired"
                        component="div"
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      />
                    </div>
                  </div>

                  {/* API Access */}
                  <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="mb-3 flex-1 sm:mb-0">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        API Access Control
                      </h5>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Restrict API access to specific users and roles
                      </p>
                    </div>
                    <div className="sm:ml-4">
                      <label
                        htmlFor="apiAccessControl"
                        className="relative inline-flex cursor-pointer items-center"
                      >
                        <Field
                          type="checkbox"
                          name="apiAccessControl"
                          id="apiAccessControl"
                          className="peer sr-only"
                        />
                        <div className="h-5 w-10 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-tertiary-600 peer-checked:after:translate-x-5 peer-focus:outline-none dark:bg-gray-600 dark:after:bg-gray-200 dark:peer-checked:bg-tertiary-500" />
                        <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                          Restricted to Admins
                        </span>
                      </label>
                      <ErrorMessage
                        name="apiAccessControl"
                        component="div"
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      />
                    </div>
                  </div>

                  {/* Session Timeout */}
                  <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="mb-3 flex-1 sm:mb-0">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Session Timeout
                      </h5>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Automatically log users out after a period of inactivity
                      </p>
                    </div>
                    <div className="w-full sm:ml-4 sm:w-48">
                      <div className="relative">
                        <Field
                          as="select"
                          name="sessionTimeout"
                          className="w-full appearance-none rounded-md border border-gray-200 bg-white p-2 pr-8 text-xs text-gray-900 shadow-sm outline-none focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-neutral-700 dark:bg-darkMainBackground dark:text-gray-100 dark:focus:ring-tertiary-600"
                        >
                          <option value={10}>10 mins</option>
                          <option value={15}>15 mins</option>
                          <option value={30}>30 mins</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                        </Field>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 dark:text-gray-500">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                      <ErrorMessage
                        name="sessionTimeout"
                        component="div"
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      />
                    </div>
                  </div>

                  {/* Data Encryption */}
                  <div className="flex flex-col px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="mb-3 flex-1 sm:mb-0">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Data Encryption
                      </h5>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Enable encryption for all stored data and communications
                      </p>
                    </div>
                    <div className="sm:ml-4">
                      <label
                        htmlFor="dataEncryption"
                        className="relative inline-flex cursor-pointer items-center"
                      >
                        <Field
                          type="checkbox"
                          name="dataEncryption"
                          id="dataEncryption"
                          className="peer sr-only"
                        />
                        <div className="h-5 w-10 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-tertiary-600 peer-checked:after:translate-x-5 peer-focus:outline-none dark:bg-gray-600 dark:after:bg-gray-200 dark:peer-checked:bg-tertiary-500" />
                        <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                          Enabled
                        </span>
                      </label>
                      <ErrorMessage
                        name="dataEncryption"
                        component="div"
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-0">
                <button
                  type="button"
                  className="mr-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2 dark:border-neutral-700 dark:bg-darkMainBackground dark:text-gray-300 dark:hover:bg-darkHoverBackground dark:focus:ring-offset-gray-900 sm:mr-3 sm:w-auto"
                >
                  Cancel
                </button>
                <div className="w-fit">
                  <CustomButton
                    type="submit"
                    disabled={isSubmitting}
                    loading={isLoading}
                    loadingText="Saving...."
                    startIcon={<Save size={16} className="mr-2" />}
                    className="w-fit"
                  >
                    Save
                  </CustomButton>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};
export default SecurityTab;
