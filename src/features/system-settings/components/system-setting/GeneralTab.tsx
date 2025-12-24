"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import usePermission from "@/shared/hooks/usePermission";
import useSwr from "@/shared/hooks/useSwr";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Calendar, ChevronDown, Globe, Save, User } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
interface IsAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        update: boolean;
        delete: boolean;
        create: boolean;
      };
    };
  }[];
}
const GeneralSchema = Yup.object().shape({
  platformName: Yup.string()
    .min(2, "Platform name must be at least 2 characters")
    .max(50, "Platform name must not exceed 50 characters")
    .required("Platform name is required"),
  timeZone: Yup.string().required("Time zone is required"),
  dateFormat: Yup.string().required("Date format is required"),
  language: Yup.string().required("Language is required")
});
const GeneralTabSkeleton = () => {
  return (
    <div className="mt-6 w-full space-y-8 px-4 md:px-0">
      <div className="grid grid-cols-1 gap-y-6">
        {/* Platform Name Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Time Zone Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700 sm:w-96"></div>
        </div>

        {/* Date Format Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Language Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
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
const InfoIcon = (
  props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};

const GeneralTab = ({ isAccess }: { isAccess: IsAccess }) => {
  const { data, mutate, isValidating } = useSwr("general");
  const { isLoading, mutation } = useMutation();
  const { getUser, isUserLoading } = usePermission();
  const [detectedSettings, setDetectedSettings] = useState({
    timeZone: "",
    dateFormat: "",
    language: ""
  });
  const [showTimezoneAlert, setShowTimezoneAlert] = useState(false);

  // Get the list of available timezone options for matching
  const timeZoneOptions = useMemo(
    () => [
      { value: "UTC", label: "UTC - Coordinated Universal Time" },
      { value: "Etc/GMT+12", label: "UTC-12:00 - Baker Island Time" },
      { value: "Pacific/Honolulu", label: "UTC-10:00 - Hawaii Standard Time" },
      { value: "America/Anchorage", label: "UTC-09:00 - Alaska Standard Time" },
      {
        value: "America/Los_Angeles",
        label: "UTC-08:00 - Pacific Standard Time (US & Canada)"
      },
      {
        value: "America/Denver",
        label: "UTC-07:00 - Mountain Standard Time (US & Canada)"
      },
      {
        value: "America/Chicago",
        label: "UTC-06:00 - Central Standard Time (US & Canada)"
      },
      {
        value: "America/New_York",
        label: "UTC-05:00 - Eastern Standard Time (US & Canada)"
      },
      { value: "America/Caracas", label: "UTC-04:00 - Venezuela Time" },
      { value: "America/Santiago", label: "UTC-04:00 - Chile Standard Time" },
      {
        value: "America/Halifax",
        label: "UTC-04:00 - Atlantic Standard Time (Canada)"
      },
      {
        value: "America/St_Johns",
        label: "UTC-03:30 - Newfoundland Standard Time"
      },
      {
        value: "America/Argentina/Buenos_Aires",
        label: "UTC-03:00 - Argentina Time"
      },
      { value: "America/Sao_Paulo", label: "UTC-03:00 - Brasília Time" },
      {
        value: "Atlantic/South_Georgia",
        label: "UTC-02:00 - South Georgia Time"
      },
      { value: "Atlantic/Azores", label: "UTC-01:00 - Azores Standard Time" },
      { value: "Europe/London", label: "UTC+00:00 - Greenwich Mean Time" },
      { value: "Europe/Berlin", label: "UTC+01:00 - Central European Time" },
      { value: "Europe/Helsinki", label: "UTC+02:00 - Eastern European Time" },
      { value: "Europe/Moscow", label: "UTC+03:00 - Moscow Standard Time" },
      { value: "Asia/Tehran", label: "UTC+03:30 - Iran Standard Time" },
      { value: "Asia/Dubai", label: "UTC+04:00 - Gulf Standard Time" },
      { value: "Asia/Kabul", label: "UTC+04:30 - Afghanistan Time" },
      { value: "Asia/Kolkata", label: "UTC+05:30 - India Standard Time" },
      { value: "Asia/Kathmandu", label: "UTC+05:45 - Nepal Time" },
      { value: "Asia/Dhaka", label: "UTC+06:00 - Bangladesh Standard Time" },
      { value: "Asia/Yangon", label: "UTC+06:30 - Myanmar Time" },
      { value: "Asia/Bangkok", label: "UTC+07:00 - Indochina Time" },
      { value: "Asia/Shanghai", label: "UTC+08:00 - China Standard Time" },
      { value: "Asia/Tokyo", label: "UTC+09:00 - Japan Standard Time" },
      {
        value: "Australia/Adelaide",
        label: "UTC+09:30 - Australian Central Standard Time"
      },
      {
        value: "Australia/Sydney",
        label: "UTC+10:00 - Australian Eastern Standard Time"
      },
      { value: "Pacific/Noumea", label: "UTC+11:00 - New Caledonia Time" },
      {
        value: "Pacific/Auckland",
        label: "UTC+12:00 - New Zealand Standard Time"
      },
      { value: "Pacific/Chatham", label: "UTC+12:45 - Chatham Islands Time" },
      { value: "Pacific/Tongatapu", label: "UTC+13:00 - Tonga Time" },
      { value: "Pacific/Kiritimati", label: "UTC+14:00 - Line Islands Time" }
    ],
    []
  );

  // Map timezone regions to approximate matches if exact match not found
  const getClosestTimezone = useCallback(
    (browserTz: string) => {
      // First try exact match
      const exactMatch = timeZoneOptions.find(
        (option) => option.value === browserTz
      );
      if (exactMatch) {
        return exactMatch.value;
      }

      // Map common regions to closest options in our dropdown
      const timezoneMap: { [key: string]: string } = {
        "Asia/Calcutta": "Asia/Kolkata",
        "Asia/Colombo": "Asia/Kolkata",
        "Europe/Paris": "Europe/Berlin",
        "Europe/Rome": "Europe/Berlin",
        "Europe/Madrid": "Europe/Berlin",
        "America/Toronto": "America/New_York",
        "America/Montreal": "America/New_York",
        "Australia/Melbourne": "Australia/Sydney",
        "Australia/Brisbane": "Australia/Sydney",
        "Asia/Seoul": "Asia/Tokyo",
        "Asia/Hong_Kong": "Asia/Shanghai",
        "Asia/Singapore": "Asia/Shanghai",
        "Asia/Jakarta": "Asia/Bangkok"
      };

      if (timezoneMap[browserTz]) {
        return timezoneMap[browserTz];
      }

      // If still no match, try to match by prefix (continent/region)
      const parts = browserTz.split("/");
      if (parts.length > 0) {
        const continent = parts[0];
        const matchByContinentAndOffset = timeZoneOptions.find((option) =>
          option.value.startsWith(String(continent))
        );

        if (matchByContinentAndOffset) {
          return matchByContinentAndOffset.value;
        }
      }

      // Last resort - just return UTC
      return "UTC";
    },
    [timeZoneOptions]
  );

  // Function to detect user's timezone, date format and language
  const detectUserSettings = useCallback(() => {
    try {
      // Get timezone from browser
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Find a matching timezone from our select options
      const matchedTimeZone = getClosestTimezone(userTimeZone);

      // Try to get user's locale from browser
      const userLocale = navigator.language || navigator.languages[0] || "en";
      const languageCode = userLocale.split("-")[0];

      // Determine common date format for the locale
      let preferredDateFormat = "MM/DD/YYYY"; // Default US format

      // Simple mapping of common locale patterns to date formats
      if (
        ["en-GB", "en-IN", "en-AU", "en-NZ"].some((code) =>
          userLocale.startsWith(code)
        ) ||
        ["fr", "de", "es", "it", "pt", "pl", "nl", "sv", "da", "fi"].includes(
          String(languageCode)
        )
      ) {
        preferredDateFormat = "DD/MM/YYYY";
      } else if (["zh", "ja", "ko"].includes(String(languageCode))) {
        preferredDateFormat = "YYYY/MM/DD";
      }

      setDetectedSettings({
        timeZone: matchedTimeZone,
        dateFormat: preferredDateFormat,
        language: String(languageCode)
      });

      // Check if user's settings are different from detected ones
      if (
        data &&
        (data.time_zone !== matchedTimeZone ||
          data.date_format !== preferredDateFormat)
      ) {
        setShowTimezoneAlert(true);
      }
    } catch {
      toast.error("Failed to detect user settings");
    }
  }, [data, getClosestTimezone]);

  // Run detection once when component mounts and data is available
  useEffect(() => {
    if (data) {
      detectUserSettings();
    }
  }, [data, detectUserSettings]);

  // Automatically set timezone if it's empty (first load)
  useEffect(() => {
    if (data && !data.time_zone && detectedSettings.timeZone) {
      // Auto-apply detected timezone if none is set
      setTimeout(() => {
        setShowTimezoneAlert(true);
      }, 500);
    }
  }, [data, detectedSettings.timeZone]);

  // Function to apply detected settings
  const applyDetectedSettings = (formikProps: {
    values: {
      platformName: string;
      timeZone: string;
      dateFormat: string;
      language: string;
    };
    setValues: (values: {
      platformName: string;
      timeZone: string;
      dateFormat: string;
      language: string;
    }) => void;
  }) => {
    formikProps.setValues({
      ...formikProps.values,
      timeZone: detectedSettings.timeZone,
      dateFormat: detectedSettings.dateFormat,
      language: detectedSettings.language
    });
    setShowTimezoneAlert(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="border-b border-gray-100 pb-5 dark:border-neutral-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          General System Settings
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure basic system preferences
        </p>
      </div>
      {isValidating ? (
        <GeneralTabSkeleton />
      ) : (
        <Formik
          initialValues={{
            platformName: data?.platform_name || "",
            timeZone: data?.time_zone || "",
            dateFormat: data?.date_format || "",
            language: data?.language || ""
          }}
          validationSchema={GeneralSchema}
          enableReinitialize={true}
          onSubmit={async (values) => {
            try {
              const res = await mutation("general", {
                method: "PUT",
                isAlert: false,
                body: {
                  platform_name: values.platformName,
                  time_zone: values.timeZone,
                  date_format: values.dateFormat,
                  language: values.language
                }
              });
              if (res?.status === 200) {
                toast.success("General settings saved successfully!");
                await getUser(true); // Force refresh after update
                mutate();
              }
            } catch (error) {
              toast.error(error instanceof Error);
            }
          }}
        >
          {({ isSubmitting, ...formikProps }) => (
            <Form className="mt-6 w-full space-y-8">
              {showTimezoneAlert && (
                <div className="mb-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <InfoIcon
                        className="h-5 w-5 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3 flex-1 md:flex md:justify-between">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        We detected different timezone/format settings for your
                        location. Would you like to update your settings?
                      </p>
                      <p className="mt-3 text-sm md:ml-6 md:mt-0">
                        <button
                          type="button"
                          onClick={() => applyDetectedSettings(formikProps)}
                          className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          Apply detected settings
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-5">
                {/* Platform Name */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User
                      size={16}
                      className="mr-2 text-gray-400 dark:text-gray-500"
                    />
                    <label
                      htmlFor="platformName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Platform Name
                    </label>
                  </div>
                  <Field
                    type="text"
                    name="platformName"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-tertiary-500 focus:ring focus:ring-tertiary-200 focus:ring-opacity-50 dark:border-neutral-700 dark:bg-darkMainBackground dark:text-gray-100 dark:focus:ring-tertiary-600"
                    placeholder="Enter platform name"
                  />
                  <ErrorMessage
                    name="platformName"
                    component="div"
                    className="text-xs text-red-600 dark:text-red-400"
                  />
                </div>

                {/* Time Zone */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Globe
                      size={16}
                      className="mr-2 text-gray-400 dark:text-gray-500"
                    />
                    <label
                      htmlFor="timeZone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Time Zone
                    </label>
                  </div>
                  <div className="relative">
                    <Field
                      as="select"
                      name="timeZone"
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-tertiary-500 focus:ring focus:ring-tertiary-200 focus:ring-opacity-50 dark:border-neutral-700 dark:bg-darkMainBackground dark:text-gray-100 dark:focus:ring-tertiary-600"
                    >
                      <option value="">Select Timezone</option>
                      {timeZoneOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Field>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 dark:text-gray-500">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                  <ErrorMessage
                    name="timeZone"
                    component="div"
                    className="text-xs text-red-600 dark:text-red-400"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This will affect how dates and times are displayed
                    throughout the application
                  </p>
                </div>

                {/* Date Format */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar
                      size={16}
                      className="mr-2 text-gray-400 dark:text-gray-500"
                    />
                    <label
                      htmlFor="dateFormat"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Date Format
                    </label>
                  </div>
                  <div className="relative">
                    <Field
                      as="select"
                      name="dateFormat"
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-tertiary-500 focus:ring focus:ring-tertiary-200 focus:ring-opacity-50 dark:border-neutral-700 dark:bg-darkMainBackground dark:text-gray-100 dark:focus:ring-tertiary-600"
                    >
                      <option value="">Select Dateformat</option>
                      <option value="MM/DD/YYYY">
                        MM/DD/YYYY (e.g., 04/10/2025)
                      </option>
                      <option value="DD/MM/YYYY">
                        DD/MM/YYYY (e.g., 10/04/2025)
                      </option>
                      <option value="YYYY-MM-DD">
                        YYYY-MM-DD (e.g., 2025-04-10)
                      </option>
                      <option value="DD.MM.YYYY">
                        DD.MM.YYYY (e.g., 10.04.2025)
                      </option>
                      <option value="YYYY/MM/DD">
                        YYYY/MM/DD (e.g., 2025/04/10)
                      </option>
                      <option value="D MMM YYYY">
                        D MMM YYYY (e.g., 10 Apr 2025)
                      </option>
                      <option value="MMM D, YYYY">
                        MMM D, YYYY (e.g., Apr 10, 2025)
                      </option>
                      <option value="MMMM D, YYYY">
                        MMMM D, YYYY (e.g., April 10, 2025)
                      </option>
                      <option value="D MMMM YYYY">
                        D MMMM YYYY (e.g., 10 April 2025)
                      </option>
                      <option value="YYYY.MM.DD">
                        YYYY.MM.DD (e.g., 2025.04.10)
                      </option>
                      <option value="DD-MM-YYYY">
                        DD-MM-YYYY (e.g., 10-04-2025)
                      </option>
                      <option value="MM-DD-YYYY">
                        MM-DD-YYYY (e.g., 04-10-2025)
                      </option>
                      <option value="YYYYMMDD">
                        YYYYMMDD (e.g., 20250410)
                      </option>
                    </Field>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 dark:text-gray-500">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                  <ErrorMessage
                    name="dateFormat"
                    component="div"
                    className="text-xs text-red-600 dark:text-red-400"
                  />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Globe
                      size={16}
                      className="mr-2 text-gray-400 dark:text-gray-500"
                    />
                    <label
                      htmlFor="language"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Language
                    </label>
                  </div>
                  <div className="relative">
                    <Field
                      as="select"
                      name="language"
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-tertiary-500 focus:ring focus:ring-tertiary-200 focus:ring-opacity-50 dark:border-neutral-700 dark:bg-darkMainBackground dark:text-gray-100 dark:focus:ring-tertiary-600"
                    >
                      <option value="">Select Language</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ar">Arabic</option>
                      <option value="zh">Mandarin Chinese</option>
                      <option value="ru">Russian</option>
                      <option value="hi">Hindi</option>
                      <option value="en">English</option>
                    </Field>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 dark:text-gray-500">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                  <ErrorMessage
                    name="language"
                    component="div"
                    className="text-xs text-red-600 dark:text-red-400"
                  />
                </div>
              </div>

              <div className="mt-10 flex flex-col-reverse justify-end gap-3 sm:flex-row sm:gap-0">
                <button
                  type="button"
                  className="mr-0 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2 dark:border-neutral-700 dark:bg-darkMainBackground dark:text-gray-300 dark:hover:bg-darkHoverBackground dark:focus:ring-offset-gray-900 sm:mr-3 sm:w-auto"
                >
                  Cancel
                </button>
                {isAccess?.buttons?.[0]?.permission?.is_shown && (
                  <CustomButton
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !isAccess?.buttons?.[0]?.permission?.actions?.update
                    }
                    loading={isLoading || isUserLoading}
                    loadingText="Saving...."
                    startIcon={<Save size={16} className="mr-2" />}
                  >
                    Save
                  </CustomButton>
                )}
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};
export default GeneralTab;
