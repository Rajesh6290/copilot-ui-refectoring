"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useCurrentMenuItem } from "@/shared/utils";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import CompanyInfoSchema from "../../schema/company.schema";
import CompanyFormSkeleton from "./CompanyFormSkeleton";

interface CompanyFormValues {
  name: string;
  website: string;
  email: string;
  description: string;
  logo: File | string;
  is_new_image: boolean;
  phone: string;
}
const CompanyInfo = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isValidating, mutate } = useSwr("trust-center/company-info");
  const [loading, setLoading] = useState<boolean>(false);
  const currentAccess = useCurrentMenuItem();
  const { mutation } = useMutation();
  const initialValues: CompanyFormValues = {
    name: data?.org_name || "",
    website: data?.org_website || "",
    email: data?.org_email || "",
    description: data?.overview || "",
    logo: data?.org_logo || "",
    phone: data?.org_phone || "",
    is_new_image: false
  };

  const handleSubmit = async (values: CompanyFormValues) => {
    try {
      setLoading(true);
      const fileName =
        values.logo instanceof File ? values.logo.name.toLowerCase() : "";
      const fileExt = fileName.slice(fileName.lastIndexOf("."));
      const res = await mutation(
        `trust-center/company-info?image_file=${values?.is_new_image}&file_type=${fileExt}`,
        {
          method: "PUT",
          isAlert: false,
          body: {
            org_name: values.name,
            org_website: values.website,
            org_email: values.email,
            overview: values.description,
            org_phone: values?.phone
          }
        }
      );
      if (res?.status === 202 && res?.results?.presigned_url) {
        const presignedUrl = res.results.presigned_url;
        const res2 = await fetch(presignedUrl, {
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type":
              values.logo instanceof File
                ? values.logo.type
                : "application/octet-stream"
          },
          method: "PUT",
          body: values.logo
        });
        if (res2?.status === 201) {
          const res3 = await mutation(
            "/trust-center/confirm-photo-upload?status=true",
            {
              method: "POST",
              isAlert: false
            }
          );
          if (res3?.status === 200) {
            toast.success("Company information saved successfully");
            mutate();
            setLoading(false);
          }
        }
      } else if (res?.status === 200) {
        mutate();
        toast.success("Company information saved successfully");
      }
    } catch (error) {
      toast.error(error instanceof Error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: string | File | boolean) => void
  ) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        // Show toast for invalid file type
        toast.info("Only JPG, JPEG, and PNG files are allowed.");
        return;
      }

      // Validate file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        // Show toast for file size exceeded
        toast.info("File size must not exceed 2MB.");
        return;
      }

      // If validation passes, proceed with file handling
      setFieldValue("logo", file);
      // Set is_new_image to true when a new file is selected
      setFieldValue("is_new_image", true);

      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReset = (
    resetForm: (
      nextState?: Partial<{
        values: CompanyFormValues;
        errors: Record<string, string>;
        touched: Record<string, boolean>;
        status?: unknown;
      }>
    ) => void
  ) => {
    // Reset to initial values
    setLogoPreview(null);
    // Make sure to reset the is_new_image flag
    resetForm({
      values: {
        ...initialValues,
        logo: data?.org_logo || "", // Make sure logo is not null
        is_new_image: false
      }
    });
  };

  return (
    <div className="flex w-full items-start justify-center p-2 sm:p-5">
      {isValidating ? (
        <CompanyFormSkeleton />
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={CompanyInfoSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ errors, touched, setFieldValue, resetForm }) => (
            <Form className="shadow-1 flex w-full flex-col overflow-y-auto rounded-xl bg-white p-5 dark:bg-darkSidebarBackground">
              <div className="flex items-center gap-10">
                <div className="relative mb-4 h-28 w-fit min-w-32">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company logo preview"
                      className="h-full w-full rounded-lg bg-tertiary-50 object-contain p-2 dark:bg-darkMainBackground"
                    />
                  ) : data?.org_logo_url ? (
                    <img
                      src={data.org_logo_url}
                      alt="Company logo preview"
                      className="h-full w-full rounded-lg bg-tertiary-50 object-contain p-2 dark:bg-darkMainBackground"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-indigo-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-indigo-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 11a3 3 0 1 0 6 0 3 3 0 0 0-6 0z" />
                        <path d="M17 21v-2a4 4 0 0 0-4-4H11a4 4 0 0 0-4 4v2" />
                        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(event) => handleFileChange(event, setFieldValue)}
                    accept=".jpg,.jpeg,.png"
                  />

                  {currentAccess?.buttons?.[0]?.permission?.is_shown && (
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      disabled={
                        !currentAccess?.buttons?.[0]?.permission?.actions
                          ?.update
                      }
                      className="w-fit rounded-md bg-gray-900 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-darkHoverBackground sm:text-sm"
                    >
                      Change logo
                    </button>
                  )}

                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-300">
                    Allowed JPG, JPEG or PNG. Max size of 2MB
                  </p>

                  <ErrorMessage
                    name="logo"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid w-full grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1 block text-sm font-medium capitalize text-gray-700 dark:text-white"
                    >
                      Company name
                    </label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className={`w-full rounded-md border px-4 py-3 ${
                        errors.name && touched.name
                          ? "border-red-500"
                          : "border-gray-300 dark:border-neutral-700"
                      } transition-colors focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-darkMainBackground dark:text-white`}
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="website"
                      className="mb-1 block text-sm font-medium capitalize text-gray-700 dark:text-white"
                    >
                      Company website
                    </label>
                    <Field
                      type="text"
                      id="website"
                      name="website"
                      className={`w-full rounded-md border px-4 py-3 ${
                        errors.website && touched.website
                          ? "border-red-500"
                          : "border-gray-300 dark:border-neutral-700"
                      } transition-colors focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-darkMainBackground dark:text-white`}
                    />
                    <ErrorMessage
                      name="website"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1 block text-sm font-medium capitalize text-gray-700 dark:text-white"
                    >
                      Company email
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className={`w-full rounded-md border px-4 py-3 ${
                        errors.email && touched.email
                          ? "border-red-500"
                          : "border-gray-300 dark:border-neutral-700"
                      } transition-colors focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-darkMainBackground dark:text-white`}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1 block text-sm font-medium capitalize text-gray-700 dark:text-white"
                    >
                      Company phone
                    </label>
                    <Field
                      type="text"
                      id="phone"
                      name="phone"
                      className={`w-full rounded-md border px-4 py-3 ${
                        errors.phone && touched.phone
                          ? "border-red-500"
                          : "border-gray-300 dark:border-neutral-700"
                      } transition-colors focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-darkMainBackground dark:text-white`}
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium capitalize text-gray-700 dark:text-white"
                  >
                    Company description
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    rows="5"
                    className={`w-full rounded-md border px-4 py-3 ${
                      errors.description && touched.description
                        ? "border-red-500"
                        : "border-gray-300 dark:border-neutral-700"
                    } transition-colors focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-darkMainBackground dark:text-white`}
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
              </div>
              <div className="flex w-full items-center gap-5 pt-5">
                <CustomButton
                  className="!w-fit !bg-red-300"
                  type="button"
                  onClick={() => handleReset(resetForm)}
                >
                  Reset
                </CustomButton>
                {currentAccess?.buttons?.[0]?.permission?.is_shown && (
                  <CustomButton
                    loading={loading}
                    disabled={
                      loading ||
                      !currentAccess?.buttons?.[0]?.permission?.actions?.update
                    }
                    loadingText="Updating..."
                    type="submit"
                  >
                    Update
                  </CustomButton>
                )}
              </div>

              {/* Hidden field to track if image is new */}
              <Field type="hidden" name="is_new_image" />
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default CompanyInfo;
