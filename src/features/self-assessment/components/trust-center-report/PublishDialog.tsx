"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { Dialog, DialogContent } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import EmailSchema from "../../schema/trust.schema";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  isAccess: {
    buttons: {
      permission: {
        is_shown: boolean;
        actions: {
          create: boolean;
          update: boolean;
          delete: boolean;
          read: boolean;
        };
      };
    }[];
  };
}

interface MagicLinkResponse {
  magic_link: string;
  expires_at: string;
}

const SkeletonLoader = memo(() => (
  <div className="animate-pulse space-y-4">
    <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
    <div className="h-10 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
    <div className="h-24 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
  </div>
));
SkeletonLoader.displayName = "SkeletonLoader";

// Fixed helper function to format date for datetime-local input
// Uses local timezone format (YYYY-MM-DDTHH:mm) without timezone conversion
const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date || isNaN(date.getTime())) {
    const now = new Date();
    // Format in local timezone
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
  // Format in local timezone
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// Helper function to format date for display - keeping the exact time that was input
const formatDateForDisplay = (date: Date | null | undefined): string => {
  if (!date || isNaN(date.getTime())) {
    return "Not set";
  }
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Explicitly use local timezone
  });
};

// Helper function to calculate days until expiry
const calculateDaysUntilExpiry = (expiryDate: Date | null): number => {
  if (!expiryDate || isNaN(expiryDate.getTime())) {
    return 0;
  }
  const now = new Date();
  // Reset hours to get accurate day difference
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiry = new Date(
    expiryDate.getFullYear(),
    expiryDate.getMonth(),
    expiryDate.getDate()
  );
  const diffMs = expiry.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

// Default expiry time (7 days from now, set to 12:00 PM)
const defaultExpiryTime = (() => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(12, 0, 0, 0); // Set to 12:00 PM
  return date;
})();

// Minimum date for datetime-local input (current time in local format)
const minDateTime = (() => {
  const now = new Date();
  return formatDateForInput(now);
})();

const ShareDialog: React.FC<ShareDialogProps> = memo(
  ({ open, onClose, isAccess }) => {
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [magicLinkResponse, setMagicLinkResponse] =
      useState<MagicLinkResponse | null>(null);
    const { isLoading, mutation } = useMutation();
    const { data, isValidating, mutate } = useSwr("trust-center/get-domains");
    const [url, setUrl] = useState<string>("");
    const [published, setIsPublished] = useState<boolean>(false);
    const [emailArray, setEmailArray] = useState<string[]>([]);

    const handleSubmit = useCallback(
      async (values: {
        emailInput: string;
        emailArray: string[];
        expiryTime: Date;
      }) => {
        try {
          const epochExpiryTime = Math.floor(
            values.expiryTime.getTime() / 1000
          );

          const res = await mutation("trust-center/generate-magic-links", {
            method: "POST",
            isAlert: false,
            body: {
              recipients: values.emailArray.map((email) => email.trim()),
              expiry_time: epochExpiryTime
            }
          });

          if (res?.status === 200) {
            toast.success(
              `Trust Center links generated for ${values.emailArray.length} user${values.emailArray.length > 1 ? "s" : ""}`
            );
            setEmailArray([]);
            setMagicLinkResponse(res?.results); // Assuming res.results contains magic_link and expires_at
          }
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred"
          );
        }
      },
      [mutation]
    );

    const handleCopyLink = useCallback(() => {
      navigator.clipboard.writeText(url);
      toast.info("Link copied to clipboard");
    }, [url]);

    const handleCopyMagicLink = useCallback(() => {
      if (magicLinkResponse?.magic_link) {
        navigator.clipboard.writeText(magicLinkResponse.magic_link);
        toast.info("Magic link copied to clipboard");
      }
    }, [magicLinkResponse]);

    const handlePublish = useCallback(
      async (type: boolean) => {
        try {
          const res = await mutation("trust-center/publish", {
            method: "POST",
            isAlert: false,
            body: { type: "PRIVATE", publish: type }
          });
          if (res?.status === 200) {
            mutate();
            setIsPublished(type);
            toast.success(`${type ? "Published" : "Unpublished"} successfully`);
          }
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "An error occurred"
          );
        }
      },
      [mutation, mutate]
    );

    const handleAddEmail = useCallback(
      (
        currentInput: string,
        setFieldValue: (field: string, value: string | string[] | Date) => void
      ) => {
        const newEmails = currentInput
          .split(/[\s,]+/)
          .filter(
            (e: string) => e.trim() !== "" && !emailArray.includes(e.trim())
          );

        if (newEmails.length > 0) {
          const updatedEmails = [...emailArray, ...newEmails];
          setEmailArray(updatedEmails);
          setFieldValue("emailInput", "");
          setFieldValue("emailArray", updatedEmails);
        } else if (
          currentInput.trim() &&
          emailArray.includes(currentInput.trim())
        ) {
          toast.warning("Duplicate email not added");
        }
      },
      [emailArray]
    );

    const resetForm = useCallback(() => {
      setMagicLinkResponse(null);
      setEmailArray([]);
    }, []);

    const getEmailStatus = (email: string, emails: string[]) => {
      if (!Yup.string().email().isValidSync(email)) {
        return "invalid";
      }
      if (emails.filter((e) => e === email).length > 1) {
        return "duplicate";
      }
      const domain = email.split("@")[1]?.toLowerCase();
      const isCommonDomain = [
        "gmail.com",
        "outlook.com",
        "yahoo.com",
        "hotmail.com"
      ].includes(domain ?? "");
      return isCommonDomain ? "common" : "valid";
    };

    useEffect(() => {
      if (!isValidating && data) {
        setUrl(data?.private_domain || "");
        setIsPublished(!!data?.published);
      }
    }, [data, isValidating]);

    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          className: "bg-white dark:bg-darkMainBackground rounded-lg"
        }}
      >
        <div className="flex items-center justify-between border-b p-5 dark:border-gray-700 dark:bg-darkMainBackground">
          <h2 className="text-xl font-medium dark:text-white">Share page</h2>
        </div>

        <DialogContent className="p-0 dark:bg-darkMainBackground">
          <div className="space-y-5 p-5">
            <div className="mb-4 flex">
              {isAccess?.buttons?.[1]?.permission?.is_shown && (
                <button
                  onClick={() => {
                    if (isAccess?.buttons?.[1]?.permission?.actions?.create) {
                      setIsPublic(false);
                    } else {
                      toast.error(
                        "You do not have permission to invite others"
                      );
                    }
                  }}
                  className={`flex items-center rounded-l-md border border-r-0 border-gray-300 px-4 py-2 text-sm font-medium shadow-sm dark:border-neutral-700 ${
                    !isPublic
                      ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200"
                      : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-darkSidebarBackground dark:text-gray-200 dark:hover:bg-darkHoverBackground"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5">
                    <path
                      fill="currentColor"
                      d="M15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4M15,5.9C16.16,5.9 17.1,6.84 17.1,8C17.1,9.16 16.16,10.1 15,10.1A2.1,2.1 0 0,1 12.9,8A2.1,2.1 0 0,1 15,5.9M4,7V10H1V12H4V15H6V12H9V10H6V7H4M15,13C12.33,13 7,14.33 7,17V20H23V17C23,14.33 17.67,13 15,13M15,14.9C17.97,14.9 21.1,16.36 21.1,17V18.1H8.9V17C8.9,16.36 12,14.9 15,14.9Z"
                    />
                  </svg>
                  Invite others
                </button>
              )}
              <button
                onClick={() => setIsPublic(true)}
                className={`flex items-center rounded-r-md border border-gray-300 px-4 py-2 text-sm font-medium shadow-sm dark:border-neutral-700 ${
                  isPublic
                    ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900 dark:text-tertiary-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-darkSidebarBackground dark:text-gray-200 dark:hover:bg-darkHoverBackground"
                }`}
              >
                <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5">
                  <path
                    fill="currentColor"
                    d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"
                  />
                </svg>
                Share publicly
              </button>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5">
                  <path
                    fill="currentColor"
                    d="M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z"
                  />
                </svg>
                {isPublic
                  ? "Anyone with the link can view"
                  : "Only specific people"}
              </div>
            </div>

            {isValidating ? (
              <SkeletonLoader />
            ) : isPublic ? (
              <div className="relative rounded-lg border p-5 dark:border-gray-700">
                <div className="absolute -top-3 left-4 flex items-center rounded-lg bg-white px-2 dark:bg-transparent">
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-tertiary-50 text-tertiary-600 dark:bg-tertiary-900 dark:text-tertiary-400">
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium dark:text-white">
                    Allow Public Access
                  </span>
                </div>
                <div className="pt-3">
                  <div className="mb-6 flex w-full items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Anyone with this link can view the published trust center
                      report.
                    </p>
                    {isAccess?.buttons?.[0]?.permission?.is_shown && (
                      <span className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={published}
                          onChange={() => {
                            if (
                              isAccess?.buttons?.[0]?.permission?.actions
                                ?.create
                            ) {
                              handlePublish(!published);
                            } else {
                              toast.error(
                                "You do not have permission to publish"
                              );
                            }
                          }}
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-tertiary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-tertiary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-tertiary-800"></div>
                      </span>
                    )}
                  </div>
                  <div className="mb-4 flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {url}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          fill="currentColor"
                          d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
                        />
                      </svg>
                    </button>
                  </div>
                  {isAccess?.buttons?.[0]?.permission?.is_shown && (
                    <div className="flex w-full items-center justify-end">
                      <div className="w-fit">
                        <CustomButton
                          type="button"
                          onClick={() =>
                            window.open(`https://${url}`, "_blank")
                          }
                          className="w-fit !text-[0.6rem] !tracking-wider"
                          disabled={
                            !data?.published ||
                            !isAccess?.buttons?.[0]?.permission?.actions?.create
                          }
                        >
                          Open Link
                        </CustomButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : magicLinkResponse ? (
              <div className="relative rounded-lg border p-5 dark:border-gray-700">
                <div className="absolute -top-3 left-4 flex items-center rounded-lg bg-white px-2 dark:bg-transparent">
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-400">
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium dark:text-white">
                    Link Generated
                  </span>
                </div>
                <div className="space-y-4 pt-3">
                  <div className="flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600">
                    <span className="line-clamp-1 break-all text-sm text-gray-700 dark:text-gray-300">
                      {magicLinkResponse.magic_link}
                    </span>
                    <button
                      onClick={handleCopyMagicLink}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          fill="currentColor"
                          d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Expires:{" "}
                    {formatDateForDisplay(
                      new Date(magicLinkResponse.expires_at)
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <CustomButton
                      type="button"
                      onClick={resetForm}
                      className="border-tertiary-600 text-tertiary-600 hover:bg-tertiary-50 dark:border-tertiary-400 dark:text-tertiary-400 dark:hover:bg-tertiary-900"
                    >
                      Generate New Link
                    </CustomButton>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Formik
                  initialValues={{
                    emailInput: "",
                    emailArray,
                    expiryTime: defaultExpiryTime
                  }}
                  validationSchema={EmailSchema}
                  enableReinitialize
                  onSubmit={handleSubmit}
                >
                  {({ values, setFieldValue }) => (
                    <Form>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Field
                              name="emailInput"
                              type="text"
                              placeholder="Enter email and click Add"
                              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-tertiary-500 dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-white"
                            />
                          </div>
                          <CustomButton
                            type="button"
                            onClick={() =>
                              handleAddEmail(values.emailInput, setFieldValue)
                            }
                            disabled={!values.emailInput?.trim()}
                          >
                            Add
                          </CustomButton>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Expiry Date & Time:
                          </span>
                          <input
                            name="expiryTime"
                            type="datetime-local"
                            min={minDateTime} // Prevent past dates
                            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-tertiary-500 dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-white"
                            value={formatDateForInput(values.expiryTime)}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              // Create a date object from input's value preserving the exact time
                              if (e.target.value) {
                                const [datePart, timePart] =
                                  e.target.value.split("T");
                                if (datePart && timePart) {
                                  const [year, month, day] = datePart
                                    .split("-")
                                    .map(Number)
                                    .filter(
                                      (num): num is number => !isNaN(num)
                                    );
                                  const [hours, minutes] = timePart
                                    .split(":")
                                    .map(Number)
                                    .filter(
                                      (num): num is number => !isNaN(num)
                                    );

                                  // Create date with exact time components (subtract 1 from month as JS Date months are 0-indexed)
                                  if (
                                    year &&
                                    month &&
                                    day &&
                                    hours !== undefined &&
                                    minutes !== undefined
                                  ) {
                                    const selectedDate = new Date(
                                      year,
                                      month - 1,
                                      day,
                                      hours,
                                      minutes
                                    );
                                    setFieldValue("expiryTime", selectedDate);
                                  }
                                }
                              } else {
                                setFieldValue("expiryTime", defaultExpiryTime);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFieldValue("expiryTime", defaultExpiryTime)
                            }
                            className="text-sm text-tertiary-600 hover:text-tertiary-800"
                          >
                            Reset to 7 days
                          </button>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Expires: {formatDateForDisplay(values.expiryTime)} (
                          {calculateDaysUntilExpiry(values.expiryTime)} days
                          from now)
                        </div>
                        <ErrorMessage
                          name="expiryTime"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />

                        <div className="mt-2 flex flex-wrap gap-2">
                          {emailArray.map((email, index) => {
                            const status = getEmailStatus(email, emailArray);
                            const bgColor = {
                              invalid: "bg-red-100 dark:bg-red-900",
                              duplicate: "bg-orange-100 dark:bg-orange-900",
                              common: "bg-blue-100 dark:bg-blue-900",
                              valid: "bg-green-100 dark:bg-green-900"
                            }[status];

                            return (
                              <span
                                key={index}
                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${bgColor}`}
                              >
                                {email}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedEmails = emailArray.filter(
                                      (_, i) => i !== index
                                    );
                                    setEmailArray(updatedEmails);
                                    setFieldValue("emailArray", updatedEmails);
                                  }}
                                  className="ml-2 text-gray-500 hover:text-gray-700"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>

                        <ErrorMessage
                          name="emailInput"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />
                        <ErrorMessage
                          name="emailArray"
                          component="div"
                          className="mt-1 text-sm text-red-500"
                        />

                        <CustomButton
                          type="submit"
                          disabled={
                            emailArray.length === 0 ||
                            isLoading ||
                            !isAccess?.buttons?.[0]?.permission?.actions?.create
                          }
                          loading={isLoading}
                          loadingText="Generating Links..."
                        >
                          Invite
                        </CustomButton>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            )}
          </div>
        </DialogContent>

        <div className="flex justify-end border border-t p-4 dark:border-none dark:bg-darkMainBackground">
          <button
            onClick={onClose}
            className="inline-flex items-center rounded-md border border-transparent bg-tertiary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-tertiary-700 focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2 dark:bg-tertiary-700 dark:hover:bg-tertiary-800"
          >
            Done
          </button>
        </div>
      </Dialog>
    );
  }
);
ShareDialog.displayName = "ShareDialog";

export default ShareDialog;
