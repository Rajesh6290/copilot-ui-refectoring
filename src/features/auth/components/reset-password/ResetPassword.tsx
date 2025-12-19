"use client";
import { useSignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "nextjs-toploader/app";
import React, { useCallback, useMemo, useState } from "react";
import AuthenticationLayout from "../../layouts/AuthenticationLayout";

const ResetPassword = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"code" | "password">("code");
  const [errors, setErrors] = useState<{
    code?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const passwordValidation = useMemo(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const isValid = Object.values(checks).every(Boolean);
    return { checks, isValid };
  }, [password]);

  const handleCodeSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoaded || !code) {
        setErrors({ code: "Please enter the verification code" });
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code
        });

        if (result.status === "needs_new_password") {
          setStep("password");
        } else if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/auth/process-selection");
        }
      } catch (err: unknown) {
        setErrors({
          code: err instanceof Error ? err.message : "Invalid verification code"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [code, isLoaded, signIn, setActive, router]
  );

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!passwordValidation.isValid) {
        setErrors({ password: "Password does not meet requirements" });
        return;
      }

      if (password !== confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return;
      }

      if (!isLoaded) {
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const result = await signIn.resetPassword({
          password
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/auth/process-selection");
        }
      } catch (err: unknown) {
        setErrors({
          general:
            err instanceof Error ? err.message : "Failed to reset password"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      password,
      confirmPassword,
      passwordValidation.isValid,
      isLoaded,
      signIn,
      setActive,
      router
    ]
  );

  const handleBackToForgot = useCallback(() => {
    router.push("/auth/forgot-password");
  }, [router]);

  const codeForm = useMemo(
    () => (
      <motion.form
        onSubmit={handleCodeSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-semibold text-gray-700">
            Verification Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`block w-full rounded-xl border px-4 py-3.5 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none ${
              errors.code
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "focus:border-tertiary-500 focus:ring-tertiary-500/20 border-gray-200"
            }`}
            placeholder="Enter verification code from email"
          />
          {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || !code}
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
              <span>Verifying...</span>
            </div>
          ) : (
            "Verify code"
          )}
        </button>

        <button
          type="button"
          onClick={handleBackToForgot}
          className="w-full text-sm text-gray-600 transition-colors hover:text-gray-800"
        >
          ← Back to forgot password
        </button>
      </motion.form>
    ),
    [code, errors.code, isLoading, handleCodeSubmit, handleBackToForgot]
  );

  const passwordForm = useMemo(
    () => (
      <motion.form
        onSubmit={handlePasswordSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {errors.general && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-gray-700"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`block w-full rounded-xl border px-4 py-3.5 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none ${
                errors.password
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "focus:border-tertiary-500 focus:ring-tertiary-500/20 border-gray-200"
              }`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}

          {/* Password Requirements */}
          {password && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Password requirements:
              </p>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {Object.entries({
                  "At least 8 characters": passwordValidation.checks.length,
                  "One uppercase letter": passwordValidation.checks.uppercase,
                  "One lowercase letter": passwordValidation.checks.lowercase,
                  "One number": passwordValidation.checks.number,
                  "One special character": passwordValidation.checks.special
                }).map(([requirement, met]) => (
                  <div
                    key={requirement}
                    className={`flex items-center space-x-2 ${met ? "text-green-600" : "text-gray-400"}`}
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={met ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}
                      />
                    </svg>
                    <span>{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-semibold text-gray-700"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`block w-full rounded-xl border px-4 py-3.5 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none ${
                errors.confirmPassword
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "focus:border-tertiary-500 focus:ring-tertiary-500/20 border-gray-200"
              }`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
          )}
          {confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-red-600">Passwords do not match</p>
          )}
          {confirmPassword && password === confirmPassword && password && (
            <p className="text-sm text-green-600">Passwords match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            isLoading ||
            !passwordValidation.isValid ||
            password !== confirmPassword
          }
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
              <span>Resetting...</span>
            </div>
          ) : (
            "Reset password"
          )}
        </button>
      </motion.form>
    ),
    [
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      errors,
      isLoading,
      passwordValidation,
      handlePasswordSubmit
    ]
  );

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
              {step === "code"
                ? "Enter verification code"
                : "Create new password"}
            </h1>
            <p className="mt-2 text-gray-600">
              {step === "code"
                ? "Check your email for the verification code"
                : "Your new password must be different from previous passwords"}
            </p>
          </motion.div>

          {/* Form Content */}
          {step === "code" ? codeForm : passwordForm}
        </div>
      </div>
    </AuthenticationLayout>
  );
};

export default ResetPassword;
