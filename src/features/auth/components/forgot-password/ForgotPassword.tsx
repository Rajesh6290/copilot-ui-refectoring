"use client";
import { useSignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "nextjs-toploader/app";
import React, { useCallback, useMemo, useState } from "react";
import AuthenticationLayout from "../../layouts/AuthenticationLayout";

const ForgotPassword = () => {
  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateEmail = useCallback((emaile: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emaile);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoaded || !validateEmail(email)) {
        setErrors({ email: "Please enter a valid email address" });
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const signInAttempt = await signIn.create({
          identifier: email
        });
        const emailAddressId = signInAttempt.supportedFirstFactors?.find(
          (
            factor
          ): factor is {
            strategy: "email_code";
            emailAddressId: string;
            safeIdentifier: string;
          } =>
            factor.strategy === "email_code" &&
            "emailAddressId" in factor &&
            "safeIdentifier" in factor
        )?.emailAddressId;
        if (!emailAddressId) {
          throw new Error("Password reset not available for this email");
        }

        await signIn.prepareFirstFactor({
          strategy: "reset_password_email_code",
          emailAddressId: emailAddressId
        });

        setIsSuccess(true);
      } catch (err: unknown) {
        setErrors({
          email:
            err instanceof Error ? err.message : "Failed to send reset email"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [email, isLoaded, signIn, validateEmail]
  );

  const handleBackToSignIn = useCallback(() => {
    router.push("/auth/signin");
  }, [router]);

  const formContent = useMemo(() => {
    if (isSuccess) {
      return (
        <motion.div
          className="space-y-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
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
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Check your email
            </h3>
            <p className="text-sm text-gray-600">
              {"We've sent a password reset link to"} <strong>{email}</strong>
            </p>
          </div>
          <button
            onClick={() => router.push("/auth/reset-password")}
            className="group from-tertiary-600 hover:from-tertiary-700 focus:ring-tertiary-500/50 relative w-full overflow-hidden rounded-xl bg-gradient-to-r to-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:to-indigo-700 hover:shadow-xl focus:ring-2 focus:outline-none"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            Enter reset code
          </button>
          <button
            onClick={handleBackToSignIn}
            className="w-full text-sm text-gray-600 transition-colors hover:text-gray-800"
          >
            ← Back to sign in
          </button>
        </motion.div>
      );
    }

    return (
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-gray-700"
          >
            Email address
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`block w-full rounded-xl border bg-white px-4 py-3.5 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none ${
                errors.email
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "focus:border-tertiary-500 focus:ring-tertiary-500/20 border-gray-200"
              }`}
              placeholder="Enter your email address"
            />
            {validateEmail(email) && email && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <svg
                  className="h-5 w-5 text-green-500"
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
              </div>
            )}
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !validateEmail(email)}
          className="group from-tertiary-600 hover:from-tertiary-700 focus:ring-tertiary-500/50 relative w-full overflow-hidden rounded-xl bg-gradient-to-r to-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:to-indigo-700 hover:shadow-xl focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Sending...</span>
            </div>
          ) : (
            "Send reset email"
          )}
        </button>

        <button
          type="button"
          onClick={handleBackToSignIn}
          className="w-full text-sm text-gray-600 transition-colors hover:text-gray-800"
        >
          ← Back to sign in
        </button>
      </motion.form>
    );
  }, [
    isSuccess,
    email,
    errors,
    isLoading,
    validateEmail,
    handleSubmit,
    handleBackToSignIn,
    router
  ]);

  return (
    <AuthenticationLayout>
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            className="mb-8 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mobile Logo */}
            <div className="mb-6 flex items-center justify-center lg:hidden">
              <div className="from-tertiary-600 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br to-indigo-600">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
            </div>
            <img
              src="/sideBarLogoDark.svg"
              alt="logo"
              className="mb-8 h-fit w-72 object-center"
            />
            <h1 className="text-3xl font-bold text-gray-900">
              {isSuccess ? "Check your email" : "Forgot password?"}
            </h1>
            <p className="mt-2 text-gray-600">
              {isSuccess
                ? "We've sent you a password reset link"
                : "No worries! Enter your email and we'll send you reset instructions"}
            </p>
          </motion.div>

          {/* Form Content */}
          {formContent}
        </div>
      </div>
    </AuthenticationLayout>
  );
};

export default ForgotPassword;
