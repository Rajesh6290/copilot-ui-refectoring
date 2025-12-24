"use client";
import { ErrorMessage, Field, Formik } from "formik";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { FieldConfig, ServiceCredential } from "./SystemConnection";
const ViewArcherDataAndConfig = dynamic(
  () => import("../archer/ViewArcherDataAndConfig"),
  {
    ssr: false
  }
);
const ArcherSync = dynamic(() => import("../archer/ArcherSync"), {
  ssr: false
});
const ArcherStepper = dynamic(() => import("../archer/ArcherStepper"), {
  ssr: false
});
const ArcherFieldConfig = dynamic(() => import("../archer/ArcherFieldConfig"), {
  ssr: false
});

const generateValidationSchema = (fields: FieldConfig[]) => {
  const schemaFields: Record<string, Yup.StringSchema> = {};
  fields.forEach((field) => {
    if (field.field_name.includes("uri") || field.field_name.includes("url")) {
      schemaFields[field.field_name] = Yup.string()
        .url("Please enter a valid URL")
        .required("This field is required");
    } else if (
      field.field_name.includes("key") ||
      field.field_name.includes("secret")
    ) {
      schemaFields[field.field_name] = Yup.string()
        .min(8, "Must be at least 8 characters")
        .required("This field is required");
    } else if (field.field_name.includes("region")) {
      schemaFields[field.field_name] = Yup.string()
        .matches(
          /^[a-z]{2}-[a-z]+-\d$/,
          "Must be a valid AWS region format (e.g. us-east-1)"
        )
        .required("This field is required");
    } else {
      schemaFields[field.field_name] = Yup.string().required(
        "This field is required"
      );
    }
  });
  return Yup.object().shape(schemaFields);
};

const generateInitialValues = (fields: FieldConfig[]) => {
  const values: Record<string, string> = {};
  fields.forEach((field) => {
    values[field.field_name] = field.value !== "N/A" ? field.value : "";
  });
  return values;
};

const getFieldDescription = (fieldName: string): string => {
  const desc: Record<string, string> = {
    aws_region:
      "The AWS region where your resources are located (example: us-east-1).",
    aws_access_key_id: "Your AWS access key ID for authentication.",
    aws_secret_access_key: "Your AWS secret access key for authentication.",
    tracking_uri: "The URI where your MLflow tracking server is hosted.",
    api_key: "Your API key for authentication.",
    endpoint_url: "The endpoint URL for the service."
  };
  return (
    desc[fieldName] ||
    `Enter your ${fieldName.replace(/_/g, " ")} for this integration.`
  );
};
const ConfigurationForm: React.FC<{
  service: ServiceCredential;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onBack: () => void;
  isEditMode: boolean;
  isLoading: boolean;
}> = ({ service, onSubmit, onBack, isEditMode, isLoading }) => {
  const validationSchema = generateValidationSchema(service.fields);
  const initialValues = generateInitialValues(service.fields);
  const isArcher = service.name.toLowerCase() === "archer";

  // Stepper state for Archer
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window === "undefined" || !(isArcher && isEditMode)) {
      return 1;
    }
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("step");
    const step = parseInt(stepParam || "1", 10);
    return step >= 1 && step <= 4 ? step : 1;
  });

  // Sync step to URL param
  useEffect(() => {
    if (!(isArcher && isEditMode)) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set("step", currentStep.toString());
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  }, [currentStep, isArcher, isEditMode]);

  const steps = [
    {
      id: 1,
      title: "Connection",
      description: "Setup credentials"
    },
    {
      id: 2,
      title: "Configure Fields",
      description: "Field settings"
    },
    {
      id: 3,
      title: "Map Data",
      description: "Data mapping"
    },
    {
      id: 4,
      title: "Sync",
      description: "Synchronize"
    }
  ];

  return (
    <div className="h-fit w-full px-4 py-6 sm:px-6">
      {/* Compact Header */}
      <div className="mb-6 flex w-full items-center gap-6">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Integrations
        </button>

        <div className="flex items-center gap-4">
          <img
            src={service.img}
            alt={service.name}
            className="size-20 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold capitalize text-gray-900 dark:text-white">
              {service.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEditMode ? "Update connection" : "Configure connection"}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper for Archer */}
      {isArcher && isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ArcherStepper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        </motion.div>
      )}

      {/* Content Area */}
      {/* <AnimatePresence mode="wait"> */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
      >
        {isArcher && isEditMode && currentStep === 2 ? (
          <ArcherFieldConfig setCurrentStep={setCurrentStep} />
        ) : isArcher && isEditMode && currentStep === 3 ? (
          <ViewArcherDataAndConfig />
        ) : isArcher && isEditMode && currentStep === 4 ? (
          <ArcherSync />
        ) : (
          <div className="mx-auto max-w-2xl">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ isSubmitting, errors, touched, handleSubmit }) => (
                <div className="space-y-5">
                  {service.fields.map((field, index) => {
                    const hasError =
                      errors[field.field_name] && touched[field.field_name];
                    return (
                      <motion.div
                        key={field.field_name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <label
                          className={`mb-1.5 block text-sm font-medium ${
                            hasError
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {field.field_name
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </label>
                        <Field
                          name={field.field_name}
                          type={
                            field.field_name.includes("key") ||
                            field.field_name.includes("secret")
                              ? "password"
                              : "text"
                          }
                          className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
                            hasError
                              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20 dark:bg-red-900/10"
                              : "border-gray-300 bg-white focus:border-tertiary-500 focus:ring-tertiary-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-tertiary-400"
                          }`}
                          placeholder={`Enter ${field.field_name.replace(/_/g, " ")}`}
                        />
                        <ErrorMessage
                          name={field.field_name}
                          component="div"
                          className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
                        >
                          {(msg) => (
                            <>
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {msg}
                            </>
                          )}
                        </ErrorMessage>
                        {!hasError && (
                          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                            {getFieldDescription(field.field_name)}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}

                  <div className="flex justify-between gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                    {isArcher && isEditMode && currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Previous
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onBack}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    )}

                    {isArcher && isEditMode && currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => prev + 1)}
                        className="flex items-center gap-2 rounded-lg bg-tertiary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-tertiary-700"
                      >
                        Next
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting || isLoading}
                        className="flex items-center gap-2 rounded-lg bg-tertiary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-tertiary-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSubmitting || isLoading ? (
                          <>
                            <svg
                              className="h-4 w-4 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            {isEditMode ? "Update" : "Connect"}
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Formik>
          </div>
        )}
      </motion.div>
      {/* </AnimatePresence> */}
    </div>
  );
};

export default ConfigurationForm;
