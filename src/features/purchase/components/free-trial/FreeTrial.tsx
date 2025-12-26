"use client";
import { ErrorMessage, Field, Formik } from "formik";
import React, { useEffect, useState } from "react";

import useMutation from "@/shared/hooks/useMutation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import FreeTrialValidationSchema, {
  isPersonalEmail
} from "../../schema/freetrial.schema";

interface FormValues {
  fullName: string;
  workEmail: string;
  company: string;
  role: string;
  contactMethod: string;
  phoneNumber: string;
  goals: string;
  updatesOptIn: boolean;
}

type EmailVerifyStatus =
  | "idle"
  | "checking"
  | "deliverable"
  | "undeliverable"
  | "risky"
  | "unknown"
  | "personal";
type SubmitStatus = "idle" | "success" | "error";

// Common personal email domains to block

const initialValues: FormValues = {
  fullName: "",
  workEmail: "",
  company: "",
  role: "",
  contactMethod: "email",
  phoneNumber: "",
  goals: "",
  updatesOptIn: false
};

const FreeTrial = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [emailVerifyStatus, setEmailVerifyStatus] =
    useState<EmailVerifyStatus>("idle");
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(5);
  const { mutation } = useMutation();
  // Auto-redirect functionality
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (submitStatus === "success") {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            window.location.href = "https://www.cognitiveview.com/";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [submitStatus]);

  // Reset countdown when success status changes
  useEffect(() => {
    if (submitStatus === "success") {
      setCountdown(5);
    }
  }, [submitStatus]);

  const handleEmailNext = (): void => {
    if (emailVerifyStatus === "deliverable") {
      setCurrentStep(2);
    }
  };

  const handleGoToHome = (): void => {
    window.location.href = "https://www.cognitiveview.com/";
  };

  const handleBackToStep1 = (): void => {
    setCurrentStep(1);
    // Reset email verification if user goes back
    setEmailVerifyStatus("idle");
    setVerifiedEmail("");
  };

  const handleSubmit = async (values: FormValues): Promise<void> => {
    setIsSubmitting(true);
    try {
      const res = await mutation(
        "provision-trial?subscription_id=standard_trial_plan",
        {
          method: "POST",
          isAlert: false,
          body: {
            customer_data: {
              client_name: values.fullName,
              tenant_name: "",
              tenant_id: "",
              description: values.goals,
              usecase: "",
              website: "",
              contact: {
                phone_number: values.phoneNumber,
                email: values.workEmail,
                contact_address: ""
              },
              primary_poc_name: values.fullName,
              primary_poc_role: values.role,
              primary_poc_contact: {
                phone_number: values.phoneNumber,
                email: values.workEmail,
                contact_address: ""
              },
              secondary_poc_name: values.fullName,
              secondary_poc_role: values.role,
              secondary_poc_contact: {
                phone_number: values.phoneNumber,
                email: values.workEmail,
                contact_address: ""
              },
              primary_admin_user_name: values.fullName,
              primary_admin_contact_info: {
                phone_number: values.phoneNumber,
                email: values.workEmail,
                contact_address: ""
              },
              secondary_admin_user_name: values.fullName,
              secondary_admin_contact_info: {
                phone_number: values.phoneNumber,
                email: values.workEmail,
                contact_address: ""
              },
              database_name: "governance_db",
              payment_mode: "subscription",
              updatesOptIn: values.updatesOptIn,
              contactMethod: values.contactMethod,
              company: values.company
            }
          }
        }
      );
      if (res?.status === 201) {
        setCurrentStep(3);
        setSubmitStatus("success");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailVerification = async (email: string): Promise<void> => {
    if (!email || !email.includes("@")) {
      setEmailVerifyStatus("idle");
      return;
    }

    // First check if it's a personal email domain
    if (isPersonalEmail(email)) {
      setEmailVerifyStatus("personal");
      return;
    }

    setEmailVerifyStatus("checking");
    try {
      // Simulate email verification
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, randomly assign verification status
      const outcomes = ["deliverable", "undeliverable", "risky", "unknown"];
      const randomOutcome =
        outcomes[Math.floor(Math.random() * outcomes.length)];

      if (randomOutcome === "deliverable") {
        setEmailVerifyStatus("deliverable");
        setVerifiedEmail(email);
      } else {
        setEmailVerifyStatus(randomOutcome as EmailVerifyStatus);
      }
    } catch {
      setEmailVerifyStatus("unknown");
    }
  };

  const handleVerifyButtonClick = () => {
    if (currentEmail) {
      handleEmailVerification(currentEmail);
    }
  };
  useEffect(() => {
    document.title =
      "AI Risk Assessment | Responsible Governance AI | Cognitiveview ";

    function setMeta(
      attrType: "name" | "property",
      attr: string,
      content: string
    ) {
      let element = document.head.querySelector(`meta[${attrType}="${attr}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrType, attr);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    }

    // Set meta tags
    setMeta(
      "name",
      "description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "property",
      "og:title",
      "Free Trial | Responsible Governance AI | Cognitiveview "
    );
    setMeta(
      "property",
      "og:description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "property",
      "og:image",
      "https://app.cognitiveview.com/images/sideBarLogo.png"
    );
    setMeta("property", "og:url", "https://app.cognitiveview.com");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta(
      "name",
      "twitter:title",
      "Cognitive View: AI-Driven Compliance & Conduct Risk Automation"
    );
    setMeta(
      "name",
      "twitter:description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "name",
      "twitter:image",
      "https://app.cognitiveview.com/images/sideBarLogo.png"
    );
  }, []);
  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* Dashboard Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat p-2 blur-sm transition-all duration-300"
        style={{
          backgroundImage: "url('/resback.svg')"
        }}
      >
        <div className="absolute inset-0 bg-gray-900 bg-opacity-20"></div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="h-fit w-full max-w-xs overflow-y-auto rounded-xl bg-white shadow-2xl sm:max-w-sm md:max-w-4xl lg:max-w-6xl xl:max-w-7xl"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Side - Form */}
              <div className="h-fit p-4 sm:p-6 lg:p-8">
                <div className="mb-4 flex items-center justify-between sm:mb-6">
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <img
                      src="/images/sideBarLogoDark.png"
                      alt="Cognitiveview"
                      className="h-8 sm:h-10 lg:h-12"
                    />
                  </motion.div>
                </div>

                <motion.div
                  className="mb-4 sm:mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <h3 className="mb-1 text-lg font-semibold text-gray-900 sm:mb-2 sm:text-xl">
                    AI Risk & Compliance, Mapped in Minutes
                  </h3>
                  <p className="pb-2 text-xs font-medium text-gray-600">
                    {
                      "TRACE-RAI instantly flags risks, checks compliance, and gives every team a clear ‘ready / not ready’ score without touching your data."
                    }
                  </p>
                  <p className="text-xs font-medium text-tertiary-600 sm:text-sm">
                    14 DAY FREE TRIAL
                  </p>
                </motion.div>

                {/* Form Content Container */}
                <div className="h-fit">
                  {currentStep === 1 ? (
                    // Step 1 - Email Only - FIXED MOBILE SPACING
                    <motion.div
                      className="flex flex-col space-y-4"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="mb-2 sm:mb-4">
                        <motion.div
                          className="mb-2 flex items-center justify-between text-xs text-gray-500 sm:mb-4 sm:text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <span>Step 1 of 3</span>
                        </motion.div>
                        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 sm:mb-6 sm:h-2">
                          <motion.div
                            className="h-1.5 rounded-full bg-tertiary-600 sm:h-2"
                            initial={{ width: 0 }}
                            animate={{ width: "33%" }}
                            transition={{
                              delay: 0.5,
                              duration: 0.8,
                              ease: "easeOut"
                            }}
                          />
                        </div>
                      </div>

                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <span className="mb-1 block text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">
                          Work Email*
                        </span>
                        <input
                          type="email"
                          value={currentEmail}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-500 sm:px-4 sm:py-3 sm:text-base"
                          placeholder="Enter your work email"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setCurrentEmail(e.target.value);
                            if (e.target.value === "") {
                              setEmailVerifyStatus("idle");
                              setVerifiedEmail("");
                            }
                          }}
                        />

                        <AnimatePresence mode="wait">
                          {emailVerifyStatus === "checking" && (
                            <motion.div
                              className="mt-1 flex items-center gap-2 text-xs text-tertiary-600 sm:mt-2 sm:text-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-tertiary-600 border-t-transparent sm:h-4 sm:w-4"></div>
                              Verifying email...
                            </motion.div>
                          )}

                          {emailVerifyStatus === "personal" && (
                            <motion.div
                              className="mt-1 text-xs text-red-500 sm:mt-2 sm:text-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              Please use a business email address, not a
                              personal email
                            </motion.div>
                          )}

                          {emailVerifyStatus === "undeliverable" && (
                            <motion.div
                              className="mt-1 text-xs text-red-500 sm:mt-2 sm:text-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              This email address cannot receive emails
                            </motion.div>
                          )}

                          {emailVerifyStatus === "risky" && (
                            <motion.div
                              className="mt-1 text-xs text-yellow-600 sm:mt-2 sm:text-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              This email may be risky - please double-check the
                              address
                            </motion.div>
                          )}

                          {emailVerifyStatus === "deliverable" && (
                            <motion.div
                              className="mt-1 flex items-center gap-1 text-xs text-green-600 sm:mt-2 sm:text-sm"
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: 0.2,
                                  type: "spring",
                                  stiffness: 200
                                }}
                              >
                                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                              </motion.div>
                              Work email verified successfully
                            </motion.div>
                          )}

                          {emailVerifyStatus === "unknown" && (
                            <motion.div
                              className="mt-1 text-xs text-orange-600 sm:mt-2 sm:text-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              {` Unable to verify email. Please ensure it's a valid
                              business email.`}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Button with fixed spacing */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="pt-4"
                      >
                        <motion.button
                          onClick={
                            emailVerifyStatus === "deliverable"
                              ? handleEmailNext
                              : handleVerifyButtonClick
                          }
                          disabled={
                            !currentEmail || emailVerifyStatus === "checking"
                          }
                          className="w-full rounded-lg bg-tertiary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-tertiary-700 disabled:bg-gray-400 sm:py-3 sm:text-base"
                          whileHover={{
                            scale:
                              !currentEmail || emailVerifyStatus === "checking"
                                ? 1
                                : 1.02
                          }}
                          whileTap={{
                            scale:
                              !currentEmail || emailVerifyStatus === "checking"
                                ? 1
                                : 0.98
                          }}
                        >
                          {emailVerifyStatus === "checking" ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Verifying...
                            </div>
                          ) : emailVerifyStatus === "deliverable" ? (
                            "Next"
                          ) : (
                            "Verify Email"
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  ) : submitStatus === "success" ? (
                    // Step 3 - Success State
                    <motion.div
                      className="flex flex-grow flex-col items-center justify-center py-4 text-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <motion.div
                        className="mb-2 w-full sm:mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="mb-2 flex items-center justify-between text-xs text-gray-500 sm:text-sm">
                          <span>Step 3 of 3</span>
                        </div>
                        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 sm:mb-6 sm:h-2">
                          <motion.div
                            className="h-1.5 rounded-full bg-green-600 sm:h-2"
                            initial={{ width: "66%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 sm:mb-4 sm:h-16 sm:w-16"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: 0.4,
                          duration: 0.8,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        <Check className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
                      </motion.div>

                      <motion.h3
                        className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        Request Submitted!
                      </motion.h3>

                      <motion.p
                        className="mb-4 px-4 text-sm text-gray-600 sm:text-base"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      >
                        {
                          "We'll contact you within 24 hours to set up your trial."
                        }
                      </motion.p>

                      {/* Countdown and redirect message */}
                      <motion.div
                        className="mb-6 text-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.0, duration: 0.5 }}
                      >
                        <p className="mb-2 text-sm text-gray-500">
                          Redirecting to home page in {countdown} seconds...
                        </p>
                        <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-gray-200">
                          <motion.div
                            className="h-1 rounded-full bg-tertiary-600"
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 5, ease: "linear" }}
                          />
                        </div>
                      </motion.div>

                      {/* Go to Home Button */}
                      <motion.button
                        onClick={handleGoToHome}
                        className="rounded-lg bg-tertiary-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-tertiary-700 sm:py-3 sm:text-base"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Go to Home
                      </motion.button>
                    </motion.div>
                  ) : (
                    // Step 2 - Full Form
                    <Formik
                      initialValues={{
                        ...initialValues,
                        workEmail: verifiedEmail
                      }}
                      validationSchema={FreeTrialValidationSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ values, handleSubmit: formikHandleSubmit }) => (
                        <motion.div
                          className="flex flex-grow flex-col"
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="mb-2 flex items-center justify-between text-xs text-gray-500 sm:text-sm">
                              <span>Step 2 of 3</span>
                              <motion.button
                                onClick={handleBackToStep1}
                                className="flex items-center gap-1 text-xs text-tertiary-600 hover:text-tertiary-700 sm:text-sm"
                                type="button"
                                whileHover={{ x: -3 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <ArrowLeft className="h-3 w-3" />
                                Back
                              </motion.button>
                            </div>
                            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 sm:mb-6 sm:h-2">
                              <motion.div
                                className="h-1.5 rounded-full bg-tertiary-600 sm:h-2"
                                initial={{ width: "33%" }}
                                animate={{ width: "66%" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                          </motion.div>

                          {/* Form fields with staggered animation */}
                          <div className="flex-grow space-y-3 sm:space-y-4">
                            {/* Full Name */}
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                            >
                              <span className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                                Full Name *
                              </span>
                              <Field
                                name="fullName"
                                type="text"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-500 sm:text-base"
                                placeholder="Enter name"
                              />
                              <ErrorMessage
                                name="fullName"
                                component="div"
                                className="mt-1 text-xs text-red-500"
                              />
                            </motion.div>

                            {/* Company */}
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4, duration: 0.5 }}
                            >
                              <span className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                                Company / Organization *
                              </span>
                              <Field
                                name="company"
                                type="text"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-500 sm:text-base"
                                placeholder="Your Company"
                              />
                              <ErrorMessage
                                name="company"
                                component="div"
                                className="mt-1 text-xs text-red-500"
                              />
                            </motion.div>

                            {/* Role */}
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.5, duration: 0.5 }}
                            >
                              <span className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                                Role / Title *
                              </span>
                              <Field
                                name="role"
                                type="text"
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-500 sm:text-base"
                                placeholder="CEO, CTO, Data Scientist, etc."
                              />
                              <ErrorMessage
                                name="role"
                                component="div"
                                className="mt-1 text-xs text-red-500"
                              />
                            </motion.div>

                            {/* Contact Method */}
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.6, duration: 0.5 }}
                            >
                              <span className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                                Preferred Contact Method *
                              </span>
                              <div className="relative">
                                <Field
                                  as="select"
                                  name="contactMethod"
                                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-500 sm:text-base"
                                >
                                  <option value="email">Email</option>
                                  <option value="phone">Phone</option>
                                </Field>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 transform text-gray-400 sm:h-4 sm:w-4" />
                              </div>
                            </motion.div>

                            {/* Phone Number (Conditional) */}
                            <AnimatePresence>
                              {values.contactMethod === "phone" && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <span className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                                    Phone Number *
                                  </span>
                                  <Field
                                    name="phoneNumber"
                                    type="tel"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-500 sm:text-base"
                                    placeholder="+1 (555) 123-4567"
                                  />
                                  <ErrorMessage
                                    name="phoneNumber"
                                    component="div"
                                    className="mt-1 text-xs text-red-500"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Goals */}
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.7, duration: 0.5 }}
                            >
                              <span className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                                Goals for the Trial (Optional)
                              </span>
                              <Field
                                as="textarea"
                                name="goals"
                                rows={2}
                                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-500 sm:text-base"
                                placeholder="What would you like to evaluate during the trial?"
                              />
                            </motion.div>

                            {/* Updates Opt-in */}
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.8, duration: 0.5 }}
                            >
                              <label
                                htmlFor="updatesOptIn"
                                className="flex items-start gap-2"
                              >
                                <Field
                                  id="updatesOptIn"
                                  name="updatesOptIn"
                                  type="checkbox"
                                  className="mt-0.5 h-3 w-3 rounded border-gray-300 text-tertiary-600 focus:ring-tertiary-500 sm:mt-1 sm:h-4 sm:w-4"
                                />
                                <span className="text-xs text-gray-600 sm:text-sm">
                                  Product & Compliance Updates Opt-in
                                </span>
                              </label>
                            </motion.div>
                          </div>

                          {/* Submit Button at bottom */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                            className="mt-auto pt-4 sm:pt-6"
                          >
                            <motion.button
                              type="button"
                              onClick={() => formikHandleSubmit()}
                              disabled={isSubmitting}
                              className="flex w-full items-center justify-center gap-2 rounded-lg bg-tertiary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-tertiary-700 disabled:bg-gray-400 sm:py-3 sm:text-base"
                              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                            >
                              <AnimatePresence mode="wait">
                                {isSubmitting ? (
                                  <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-5 sm:w-5"></div>
                                    Processing...
                                  </motion.div>
                                ) : (
                                  <motion.span
                                    key="text"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  >
                                    Get Free Trial
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      )}
                    </Formik>
                  )}
                </div>
              </div>

              {/* Right Side - Benefits */}
              <motion.div
                className="hidden bg-gradient-to-br from-tertiary-50 to-purple-50 p-4 sm:p-6 md:block lg:p-8"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <motion.h3
                  className="mb-4 text-base font-bold text-gray-900 sm:mb-6 sm:text-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  💡 Why Try TRACE-RAI?
                </motion.h3>

                <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
                  {[
                    {
                      title: "Smart Risk Map",
                      description:
                        "Spot fairness, privacy, accuracy, and safety risks instantly before they become headlines.",
                      delay: 0.7
                    },
                    {
                      title: "Compliance Scorecards",
                      description:
                        "See in one click what’s met and what’s missing across NIST AI RMF, EU AI Act, ISO 42001, Australian AI Safety Standards, and more.",
                      delay: 0.8
                    },
                    {
                      title: "Role-Based Action Cards",
                      description: "Clear next steps for every role:",
                      subItems: [
                        "Engineers: what to test next",
                        "Risk & Legal: controls to add",
                        'Product Managers: a clear "ready / not ready" score'
                      ],
                      delay: 0.9
                    },
                    {
                      title: "No Raw Data Required",
                      description:
                        "Your sensitive content never leaves your environment TRACE-RAI reads metrics only.t.",
                      delay: 1.0
                    },
                    {
                      title: "Trusted in Regulated Industries",
                      description:
                        "Relied on by finance, healthcare, and government teams to meet AI compliance and evaluation needs.",
                      delay: 1.1
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-2 sm:gap-3"
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: item.delay, duration: 0.5 }}
                    >
                      <motion.div
                        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-tertiary-100 sm:h-6 sm:w-6"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: item.delay + 0.1,
                          duration: 0.4,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        <Check className="h-3 w-3 text-tertiary-600 sm:h-4 sm:w-4" />
                      </motion.div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 sm:text-base">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs font-medium text-gray-600 sm:text-sm">
                            {item.description}
                          </p>
                        )}
                        {item.subItems && (
                          <div className="mt-1 space-y-1 text-xs text-gray-600">
                            {item.subItems.map((subItem, subIndex) => (
                              <motion.p
                                key={subIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                  delay: item.delay + 0.2 + subIndex * 0.1
                                }}
                              >
                                •{" "}
                                <span className="font-medium">
                                  {subItem.split(":")[0]}:
                                </span>{" "}
                                {subItem.split(":")[1]}
                              </motion.p>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="rounded-lg bg-white p-3 text-center sm:p-4"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <p className="mb-2 text-xs text-gray-600 sm:text-sm">
                    {"Pinpoint your AI’s risk and compliance readiness today."}
                  </p>
                  <p className="text-xs font-medium text-gray-700 sm:text-sm">
                    {
                      "Fill out the form and get your guided, no-cost trial see your AI’s risk profile in minutes."
                    }
                  </p>
                </motion.div>
              </motion.div>

              {/* Mobile Benefits Section - EXACT SAME CONTENT AS DESKTOP */}
              <motion.div
                className="bg-gradient-to-br from-tertiary-50 to-purple-50 p-3 md:hidden"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <motion.h3
                  className="mb-3 text-sm font-bold text-gray-900"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  💡 Why Try TRACE?
                </motion.h3>

                <div className="mb-4 space-y-2">
                  {[
                    {
                      title: "Smart Risk Map",
                      description:
                        "Spot fairness, privacy, accuracy, and safety risks instantly before they become headlines.",
                      delay: 0.7
                    },
                    {
                      title: "Compliance Scorecards",
                      description:
                        "See in one click what’s met and what’s missing across NIST AI RMF, EU AI Act, ISO 42001, Australian AI Safety Standards, and more.",
                      delay: 0.8
                    },
                    {
                      title: "Role-Based Action Cards",
                      description: "Clear next steps for every role:",
                      subItems: [
                        "Engineers: what to test next",
                        "Risk & Legal: controls to add",
                        'Product Managers: a clear "ready / not ready" score'
                      ],
                      delay: 0.9
                    },
                    {
                      title: "No Raw Data Required",
                      description:
                        "Your sensitive content never leaves your environment TRACE-RAI reads metrics only.t.",
                      delay: 1.0
                    },
                    {
                      title: "Trusted in Regulated Industries",
                      description:
                        "Relied on by finance, healthcare, and government teams to meet AI compliance and evaluation needs.",
                      delay: 1.1
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-2"
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                    >
                      <motion.div
                        className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded bg-tertiary-100"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                      >
                        <Check className="h-2.5 w-2.5 text-tertiary-600" />
                      </motion.div>
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-600">
                            {item.description}
                          </p>
                        )}
                        {item.subItems && (
                          <div className="mt-1 space-y-1 text-xs text-gray-600">
                            {item.subItems.map((subItem, subIndex) => (
                              <p key={subIndex}>
                                •{" "}
                                <span className="font-medium">
                                  {subItem.split(":")[0]}:
                                </span>{" "}
                                {subItem.split(":")[1]}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="rounded-lg bg-white p-3 text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                >
                  <p className="text-xs font-medium text-gray-600">
                    {
                      "Pinpoint your AI’s risk and compliance readiness today. • Fill out the form and get your guided, no-cost trial see your AI’s risk profile in minutes."
                    }
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FreeTrial;
