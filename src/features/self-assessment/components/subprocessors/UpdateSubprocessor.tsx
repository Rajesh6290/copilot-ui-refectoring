"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { Check } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import SubProcessorValidationSchema from "../../schema/subprocessor.schema";
import { SubProcessor } from "./SubProcessors";

interface NewSubProcessor {
  name: string;
  purpose: string;
  location: string;
  trust_center_url: string;
}
const UpdateSubprocessor = ({
  open,
  onClose,
  mutate,
  item
}: {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  item: SubProcessor;
}) => {
  const { isLoading, mutation } = useMutation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileData, setFileData] = useState<File | null>(null);

  // Initialize the preview image with the existing item image when component mounts or item changes
  useEffect(() => {
    if (item?.img) {
      setPreviewImage(item.img);
    } else {
      setPreviewImage(null);
    }
  }, [item]);
  const handleSuccess = (resetForm: () => void) => {
    mutate();
    toast.success("Sub-processor updated successfully");
    resetForm();
    setFileData(null);
    onClose();
  };
  const handleUpdate = async (
    values: NewSubProcessor,
    { resetForm }: FormikHelpers<NewSubProcessor>
  ) => {
    try {
      // Only handle image upload if there's a new file
      if (fileData) {
        const res = await mutation(
          `trust-center/sub-processors?id=${item?.id}&file_type=${fileData?.type.slice(6)}&image_file=true`,
          {
            method: "PUT",
            isAlert: false,
            body: {
              ...values,
              compliance_cert: ""
            }
          }
        );

        if (res?.status === 202 && res?.results?.blob_url) {
          const uploadResponse = await fetch(res?.results?.blob_url, {
            method: "PUT",
            body: fileData,
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "Content-Type": fileData?.type || "application/octet-stream"
            }
          });

          if (uploadResponse.ok && uploadResponse?.status === 201) {
            const confirmResponse = await mutation(
              `trust-center/sub-processors/confirm-upload?id=${res?.results?.sub_processor_id}&status=true`,
              {
                method: "POST",
                isAlert: false
              }
            );

            if (confirmResponse?.status === 200) {
              handleSuccess(resetForm);
            }
          } else {
            toast.error("Error uploading file. Please try again.");
          }
        }
      } else {
        // If no new image, just update the text fields
        const updateResponse = await mutation(
          `trust-center/sub-processors?id=${item?.id}&image_file=false`,
          {
            method: "PUT",
            isAlert: false,
            body: values
          }
        );

        if (updateResponse?.status === 200) {
          handleSuccess(resetForm);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        // Show toast for invalid file type
        toast.info("Only JPG, JPEG, and PNG files are allowed.");
        return;
      }
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        // Show toast for file size exceeded
        toast.info("File size must not exceed 2MB.");
        return;
      }
      setFileData(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setPreviewImage(null);
    setFileData(null);
  };

  const initialValues: NewSubProcessor = {
    name: item?.name || "",
    purpose: item?.purpose || "",
    location: item?.location || "",
    trust_center_url: item?.trust_center_url || ""
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-lg"
      }}
    >
      <DialogTitle className="border-b border-gray-200 dark:border-gray-700 dark:bg-darkSidebarBackground">
        <span className="text-gray-900 dark:text-white">
          Update Sub-processor
        </span>
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={SubProcessorValidationSchema}
        onSubmit={handleUpdate}
        enableReinitialize={true}
      >
        {({ isSubmitting }) => (
          <Form className="dark:bg-darkSidebarBackground">
            <div className="w-full p-6">
              <div className="grid w-full grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
                <div className="w-full">
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Name
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:text-white"
                    placeholder="Enter sub-processor name..."
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="purpose"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Purpose
                  </label>
                  <Field
                    type="text"
                    id="purpose"
                    name="purpose"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:text-white"
                    placeholder="Enter purpose..."
                  />
                  <ErrorMessage
                    name="purpose"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="trust_center_url"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Company URL
                  </label>
                  <Field
                    type="text"
                    id="trust_center_url"
                    name="trust_center_url"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:text-white"
                    placeholder="Enter trust center url..."
                  />
                  <ErrorMessage
                    name="trust_center_url"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="location"
                    className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                  >
                    Location
                  </label>
                  <Field
                    type="text"
                    id="location"
                    name="location"
                    className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-600 dark:text-white"
                    placeholder="Enter location..."
                  />
                  <ErrorMessage
                    name="location"
                    component="div"
                    className="mt-1 text-sm text-red-500"
                  />
                </div>
              </div>

              {/* Image upload and preview section */}
              <div className="mt-2 sm:mt-6">
                <p className="text-sm font-medium text-[#475569] dark:text-white">
                  Upload Logo Image
                </p>
                <div className="flex w-full items-center gap-2 sm:gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="add-logo-upload"
                    />
                    <label
                      htmlFor="add-logo-upload"
                      aria-label="Upload logo image"
                      className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-4 text-gray-500 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>
                          {previewImage ? "Change image" : "Upload image"}
                        </span>
                      </div>
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, JPEG max up to 2MB
                    </p>
                  </div>

                  {/* Image Preview */}
                  {previewImage && (
                    <div className="flex flex-col items-center">
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        Preview:
                      </p>
                      <div className="relative h-24 w-24 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                        <Image
                          src={previewImage}
                          alt="Logo preview"
                          fill
                          className="object-contain p-1 dark:invert"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="mt-2 text-xs text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogActions className="border-t border-gray-200 p-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <div className="w-fit">
                <CustomButton
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  loading={isLoading}
                  startIcon={<Check className="h-4 w-4" />}
                  loadingText="Updating..."
                >
                  Update Sub-processor
                </CustomButton>
              </div>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default UpdateSubprocessor;
