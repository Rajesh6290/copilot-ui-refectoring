"use client";
import { motion } from "framer-motion";
import { Check, CheckCircle, Mail } from "lucide-react";
import { useEffect, useState } from "react";

const ConfirmationPage = () => {
  const [step, setStep] = useState<number>(1);
  useEffect(() => {
    // Auto advance through steps for demo
    const timer = setTimeout(() => {
      if (step < 3) {
        setStep(step + 1);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [step]);
  useEffect(() => {
    document.title =
      step === 1
        ? "Registration Complete | Cognitiveview"
        : step === 2
          ? "Email Sent | Cognitiveview"
          : step === 3
            ? "Check your email for invite link | Cognitiveview"
            : "Cognitiveview: AI-Driven Compliance & Conduct Risk Automation";

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
      step === 1
        ? "Registration Complete | Cognitiveview"
        : step === 2
          ? "Email Sent | Cognitiveview"
          : step === 3
            ? "Ready to Sign In | Cognitiveview"
            : "Cognitiveview: AI-Driven Compliance & Conduct Risk Automation"
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
  }, [step]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 text-gray-800 dark:bg-gray-900 dark:text-white">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-800"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            className="mb-6 flex justify-center"
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute inset-0 rounded-full bg-green-400 opacity-20 blur-xl dark:bg-green-500"
              />
              <CheckCircle
                size={80}
                className="relative z-10 text-green-600 dark:text-green-500"
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-2 text-center text-2xl font-bold"
          >
            Registration Successful!
          </motion.h1>

          {/* Simple Progress Bar */}
          <div className="mb-6 mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <motion.div
                className="h-full rounded-full bg-green-600 dark:bg-green-500"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-500">
              <span>Step {step} of 3</span>
              <span>{Math.round((step / 3) * 100)}% Complete</span>
            </div>
          </div>

          {/* All Steps Shown Together */}
          <div className="space-y-4">
            {/* Step 1 - Registration Complete */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1
              }}
              transition={{ delay: 0.6 }}
              className={`rounded-lg p-4 ${
                step >= 1
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
                    step >= 1
                      ? "bg-green-600 dark:bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  {step >= 1 ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-sm font-bold text-gray-600 dark:text-white">
                      1
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Account Created</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your registration was completed successfully
                  </p>
                </div>
                {step === 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="ml-auto"
                  >
                    <CheckCircle className="text-green-600 dark:text-green-500" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Step 2 - Email Sent */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1
              }}
              transition={{ delay: 0.7 }}
              className={`rounded-lg p-4 ${
                step >= 2
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
                    step >= 2
                      ? "bg-green-600 dark:bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  {step >= 2 ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span className="text-sm font-bold text-gray-600 dark:text-white">
                      2
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Registration Email Sent</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {"We've sent a registration link to your email"}
                  </p>
                </div>
                {step === 2 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="ml-auto"
                  >
                    <Mail className="text-green-600 dark:text-green-500" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sign In Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 20 }}
            transition={{ delay: 0.9 }}
            className="mt-8"
          >
            <motion.p className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-medium text-white transition-colors hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
              Check your email for invite link
            </motion.p>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500"
          >
            Accept the invite in the email to login to the platform.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
