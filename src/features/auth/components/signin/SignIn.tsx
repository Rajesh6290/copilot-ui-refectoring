"use client";
import Loader from "@/shared/common/Loader";
import usePermission from "@/shared/hooks/usePermission";
import useSSOProviders from "@/shared/hooks/useSSOProviders";
import { getFromLocalStorage, removeFromLocalStorage } from "@/shared/utils";
import { useAuth, useClerk, useSignIn } from "@clerk/nextjs";
import type { OAuthStrategy } from "@clerk/types";
import { motion } from "framer-motion";
import { useRouter } from "nextjs-toploader/app";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AuthenticationLayout from "../../layouts/AuthenticationLayout";
const SignIn = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();

  const { signOut } = useClerk();
  const router = useRouter();
  const { logout } = usePermission();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState<
    "email" | "password" | "code" | "sso"
  >("email");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    code?: string;
  }>({});
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const initalLoad = useRef<boolean>(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getFromLocalStorage("ACCESS_TOKEN");
      if (token) {
        removeFromLocalStorage("ACCESS_TOKEN");
      }
    }
  }, []);
  const forceSignOut = async () => {
    logout();
    await signOut();
    setEmail("");
    setPassword("");
    setCode(["", "", "", "", "", ""]);
    setAuthStep("email");
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && initalLoad.current) {
      forceSignOut();
      initalLoad.current = false;
    } else if (initalLoad.current) {
      initalLoad.current = false;
    }
  }, [isLoaded, isSignedIn]);
  const ssoProviders = useSSOProviders();

  const validateEmail = useCallback((emaile: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emaile);
  }, []);

  const handleCodeChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        return;
      }

      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        codeInputRefs.current[index + 1]?.focus();
      }
    },
    [code]
  );

  const handleCodeKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        codeInputRefs.current[index - 1]?.focus();
      }
    },
    [code]
  );

  const handleCodePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedText = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);
      const newCode = [...code];

      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedText[i] || "";
      }

      setCode(newCode);
      const lastFilledIndex = pastedText.length - 1;
      if (lastFilledIndex < 5 && lastFilledIndex >= 0) {
        codeInputRefs.current[lastFilledIndex + 1]?.focus();
      }
    },
    [code]
  );

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoaded || !validateEmail(email)) {
        setErrors({ email: "Please enter a valid email address" });
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        await signIn.create({
          identifier: email
        });
        setAuthStep("password");
      } catch (err: unknown) {
        setErrors({
          email: err instanceof Error ? err.message : "Something went wrong"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [email, isLoaded, signIn, validateEmail]
  );

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isLoaded || !password) {
        setErrors({ password: "Please enter your password" });
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "password",
          password
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/process-selection");
        }
      } catch (err: unknown) {
        setErrors({
          password: err instanceof Error ? err.message : "Invalid password"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [password, isLoaded, signIn, setActive, router]
  );

  const handleEmailCodeRequest = useCallback(async () => {
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
        throw new Error(
          "Email code authentication not available for this account"
        );
      }

      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailAddressId
      });
      setAuthStep("code");
    } catch (err: unknown) {
      setErrors({
        email: err instanceof Error ? err.message : "Failed to send code"
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, isLoaded, signIn, validateEmail]);

  const handleCodeSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const codeString = code.join("");

      if (!isLoaded || codeString.length !== 6) {
        setErrors({
          code: "Please enter the complete 6-digit verification code"
        });
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: codeString
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/process-selection");
        }
      } catch (err: unknown) {
        setErrors({
          code: err instanceof Error ? err.message : "Invalid code"
        });
      } finally {
        setIsLoading(false);
      }
    },
    [code, isLoaded, signIn, setActive, router]
  );

  const handleSSOLogin = useCallback(
    async (provider: string) => {
      if (!isLoaded) {
        return;
      }

      setIsLoading(true);
      try {
        await signIn.authenticateWithRedirect({
          strategy: provider as OAuthStrategy,
          redirectUrl: "/process-selection",
          redirectUrlComplete: "/process-selection"
        });
      } catch {
        setErrors({ email: "SSO login failed. Please try again." });
        setIsLoading(false);
      }
    },
    [isLoaded, signIn]
  );

  const handleBackToEmail = useCallback(() => {
    setAuthStep("email");
    setPassword("");
    setCode(["", "", "", "", "", ""]);
    setErrors({});
  }, []);

  const handleUseAnotherMethod = useCallback(() => {
    if (authStep === "code") {
      setAuthStep("password");
    }
  }, [authStep]);

  if (!isLoaded) {
    return <Loader />;
  }

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
            <img
              src="/sideBarLogoDark.svg"
              alt="logo"
              className="mb-8 h-fit w-72 object-center"
            />
            <h1 className="text-3xl font-bold text-gray-900">
              {authStep === "email"
                ? "Welcome back"
                : authStep === "password"
                  ? "Enter your password"
                  : authStep === "code"
                    ? "Check your email"
                    : "Choose sign-in method"}
            </h1>
            <p className="mt-2 text-gray-600">
              {authStep === "email"
                ? "Please enter your email to continue"
                : authStep === "password"
                  ? `Signing in as ${email}`
                  : authStep === "code"
                    ? `Enter the 6-digit verification code sent to ${email}`
                    : "Sign in with your preferred method"}
            </p>
          </motion.div>

          {/* Dynamic Form Content */}
          <motion.div
            key={authStep}
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Email Step */}
            {authStep === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                      placeholder="Enter your email"
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
                  <div className="absolute inset-0 -translate-x-full cursor-pointer bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  {isLoading ? (
                    <div className="flex cursor-pointer items-center justify-center space-x-2">
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
                      <span>Continuing...</span>
                    </div>
                  ) : (
                    <span className="cursor-pointer">Continue</span>
                  )}
                </button>
              </form>
            )}

            {/* Password Step */}
            {authStep === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`focus:border-tertiary-500 focus:ring-tertiary-500/20 block w-full rounded-xl border bg-white px-4 py-3.5 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:ring-2 focus:outline-none ${
                        errors.password ? "border-red-300" : "border-gray-200"
                      }`}
                      placeholder="Enter your password"
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
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center space-x-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`h-5 w-5 rounded-md border-2 transition-all ${
                          rememberMe
                            ? "border-tertiary-600 bg-tertiary-600"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {rememberMe && (
                          <svg
                            className="h-full w-full text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="cursor-pointer text-sm font-medium text-gray-700">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => router.push("/auth/forgot-password")}
                    className="text-tertiary-600 hover:text-tertiary-800 cursor-pointer text-sm font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="group from-tertiary-600 hover:from-tertiary-700 focus:ring-tertiary-500/50 relative w-full overflow-hidden rounded-xl bg-gradient-to-r to-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:to-indigo-700 hover:shadow-xl focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  {isLoading ? (
                    <div className="flex cursor-pointer items-center justify-center space-x-2">
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
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleEmailCodeRequest}
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:opacity-70"
                >
                  Send code to email instead
                </button>

                <button
                  type="button"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                  className="w-full cursor-pointer text-sm text-gray-600 transition-colors hover:text-gray-800 disabled:opacity-70"
                >
                  ← Back to email
                </button>
              </form>
            )}

            {/* Email Code Step - 6 Digit Input Boxes */}
            {authStep === "code" && (
              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div className="space-y-4">
                  <span className="text-sm font-semibold text-gray-700">
                    Verification Code
                  </span>

                  {/* 6-Digit Code Input */}
                  <div className="flex justify-center space-x-3">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          codeInputRefs.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleCodeChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleCodeKeyDown(index, e)}
                        onPaste={index === 0 ? handleCodePaste : undefined}
                        className={`h-12 w-12 rounded-xl border bg-white text-center text-lg font-semibold transition-all duration-200 focus:ring-2 focus:outline-none ${
                          errors.code
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "focus:border-tertiary-500 focus:ring-tertiary-500/20 border-gray-200"
                        }`}
                        placeholder="•"
                      />
                    ))}
                  </div>

                  {errors.code && (
                    <p className="text-center text-sm text-red-600">
                      {errors.code}
                    </p>
                  )}

                  <p className="text-center text-xs text-gray-500">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || code.join("").length !== 6}
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
                    "Verify & Sign in"
                  )}
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleUseAnotherMethod}
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:opacity-70"
                  >
                    Use password
                  </button>

                  <button
                    type="button"
                    onClick={handleEmailCodeRequest}
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 disabled:opacity-70"
                  >
                    Resend code
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                  className="w-full text-sm text-gray-600 transition-colors hover:text-gray-800 disabled:opacity-70"
                >
                  ← Back to email
                </button>
              </form>
            )}

            {/* Dynamic SSO Options - Only if available */}
            {ssoProviders.length > 0 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-50 px-4 font-medium text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div
                  className={`grid gap-4 ${ssoProviders.length === 1 ? "grid-cols-1" : ssoProviders.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
                >
                  {ssoProviders?.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => handleSSOLogin(provider.id)}
                      disabled={isLoading}
                      className="flex cursor-pointer items-center justify-center space-x-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:ring-2 focus:ring-gray-500/20 focus:outline-none disabled:opacity-70"
                    >
                      {provider.icon}
                      <span>{provider.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
      {isLoading && (authStep === "sso" || isSignedIn) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Loader />
        </div>
      )}
    </AuthenticationLayout>
  );
};

export default SignIn;
