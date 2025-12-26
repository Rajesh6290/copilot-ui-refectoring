"use client";
import useMutation from "@/shared/hooks/useMutation";
import { getFromLocalStorage } from "@/shared/utils";
import { Turnstile } from "@marsidev/react-turnstile";
import { FormikHelpers } from "formik";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Feature } from "./CheckoutForm";
import dynamic from "next/dynamic";
const CheckoutForm = dynamic(() => import("./CheckoutForm"), {
  ssr: false
});
export interface FormValues {
  name: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  websiteURL: string;
  useCase: string;
  companyAddress: string;
  coupionCode: string;
  agreement: boolean;
}

// FloatingBalls component (unchanged)
const FloatingBalls = React.memo(() => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-float-slow absolute right-1/4 top-1/4 h-32 w-32 rounded-full bg-tertiary-400 opacity-20 blur-sm"></div>
      <div className="animate-float-medium absolute right-1/3 top-1/2 h-24 w-24 rounded-full bg-purple-400 opacity-20 blur-sm"></div>
      <div className="animate-float-fast absolute bottom-1/4 right-1/2 h-48 w-48 rounded-full bg-indigo-400 opacity-10 blur-sm"></div>
      <div className="animate-float-slow-reverse absolute right-1/2 top-1/3 h-16 w-16 rounded-full bg-tertiary-500 opacity-20 blur-sm"></div>
      <div className="animate-float-medium-reverse absolute bottom-1/3 right-1/4 h-40 w-40 rounded-full bg-indigo-500 opacity-15 blur-sm"></div>
      <div className="animate-float-fast-reverse absolute right-1/3 top-2/3 h-20 w-20 rounded-full bg-purple-500 opacity-20 blur-sm"></div>
      <div className="animate-float-medium absolute right-10 top-10 h-28 w-28 rounded-full bg-tertiary-300 opacity-15 blur-sm"></div>
      <div className="animate-float-slow absolute bottom-10 right-1/4 h-36 w-36 rounded-full bg-indigo-300 opacity-10 blur-sm"></div>
    </div>
  );
});

FloatingBalls.displayName = "FloatingBalls";

// SkeletonLoader component (unchanged)
const SkeletonLoader = React.memo(() => {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center px-4 py-8">
      <div className="mx-auto w-full max-w-full sm:max-w-[95%] lg:max-w-[90%] xl:max-w-[80%]">
        <div className="relative flex flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:rounded-2xl md:rounded-3xl lg:flex-row">
          <div
            style={{
              background:
                "linear-gradient(135deg, #bfdbfe 0%, #3b82f6 50%, #4f46e5 100%)"
            }}
            className="p-8 text-white lg:w-2/5 lg:p-10"
          >
            <div className="sticky top-10">
              <div className="mb-12">
                <div className="mb-8">
                  <div className="h-12 w-36 animate-pulse rounded-lg bg-white/20"></div>
                </div>
                <div className="mb-6 h-10 w-4/5 animate-pulse rounded-lg bg-white/20"></div>
                <div className="mb-6 h-24 animate-pulse rounded-lg bg-white/20"></div>
                <div className="h-1 w-20 rounded-full bg-tertiary-300"></div>
              </div>
              <div className="mb-12 space-y-4">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-start space-x-4">
                    <div className="mt-1 h-6 w-6 flex-shrink-0 animate-pulse rounded-full bg-white/20"></div>
                    <div className="h-6 w-4/5 animate-pulse rounded-lg bg-white/20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative h-auto max-h-[70vh] overflow-y-auto p-4 sm:max-h-[calc(100vh-100px)] sm:p-6 md:p-8 lg:w-3/5 lg:p-10">
            <div className="mx-auto">
              <div className="space-y-8">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:p-6">
                  <div className="mb-4 flex items-center">
                    <div className="mr-2 h-6 w-6 animate-pulse rounded-full bg-tertiary-200"></div>
                    <div className="h-6 w-48 animate-pulse rounded-lg bg-gray-200"></div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <div key={item} className="space-y-2">
                        <div className="h-5 w-32 animate-pulse rounded-md bg-gray-200"></div>
                        <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  <div className="h-14 w-full animate-pulse rounded-xl bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SkeletonLoader.displayName = "SkeletonLoader";

const AppSumo = () => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const searchParams = useSearchParams();
  const featureId = useMemo(
    () => searchParams?.get("featureId") || "",
    [searchParams]
  );
  const frequency = useMemo(
    () => searchParams?.get("frequency") || "",
    [searchParams]
  );
  const [isValidating, setIsValidating] = useState(true);
  const [data, setData] = useState<Feature | null>(null);
  const router = useRouter();

  const defaultRedirectUrl =
    "/purchase/appsumo?featureId=S-XYAY97T1&frequency=month";

  const fetchSubscriptiondata = useCallback(async () => {
    if (!featureId) {
      return null;
    }

    try {
      const token = getFromLocalStorage("ACCESS_TOKEN");
      const res = await fetch(
        `/api/cv/v1/subscription?subscription_id=${featureId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res?.ok) {
        return null;
      }

      const result = await res.json();
      return result;
    } catch {
      return null;
    }
  }, [featureId]);

  // Separate validation effect - only runs once on mount
  useEffect(() => {
    const validFrequencies = ["month", "year", "one-time"];

    // Check if parameters are valid
    if (!featureId || !validFrequencies.includes(frequency || "")) {
      toast.error("Unauthorized access - Invalid parameters");
      window.location.href = defaultRedirectUrl; // Use direct navigation instead of router
      return;
    }
  }, []); // Empty dependency array means this only runs once on mount

  useEffect(() => {
    if (!featureId) {
      return;
    }

    setIsValidating(true);

    async function fetchData() {
      try {
        const subscriptionData = await fetchSubscriptiondata();

        if (subscriptionData) {
          setData(subscriptionData);
          setIsValidating(false);
        } else {
          toast.error("Plan not available");
          window.location.href = defaultRedirectUrl; // Use direct navigation instead of router
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch data"
        );
        window.location.href = defaultRedirectUrl; // Use direct navigation instead of router
      }
    }

    fetchData();
  }, [featureId, frequency, fetchSubscriptiondata, defaultRedirectUrl]);
  const { isLoading, mutation } = useMutation();

  useEffect(() => {
    document.title = "AppSumo | Cognitiveview";

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
    setMeta("property", "og:title", "AppSumo | Cognitiveview");
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
  const formStyles = useMemo(
    () => ({
      inputClass:
        "w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-800 shadow-sm focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-200 focus:ring-opacity-50 outline-none transition-all",
      inputError: "border-red-300 focus:border-red-500 focus:ring-red-200",
      labelClass: "block text-sm font-medium text-gray-700 mb-1",
      errorClass: "mt-1 text-sm text-red-500"
    }),
    []
  );

  // Improved form submission handler with better error handling
  const handleSubmit = useCallback(
    async (values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
      if (!featureId || !frequency) {
        toast.error("Missing required parameters");
        return;
      }

      try {
        const {
          name,
          companyName,
          companyPhone,
          companyEmail,
          companyAddress,
          websiteURL,
          useCase,
          agreement
        } = values;

        const body = {
          customer_data: {
            tenant_id: "",
            client_name: companyName,
            tenant_name: companyName,
            description: "Not Provided",
            usecase: useCase || "Not Provided",
            website: websiteURL || "Not Provided",
            contact: {
              phone_num: companyPhone || "Not Provided",
              email: companyEmail || "Not Provided",
              contact_address: companyAddress
            },
            primary_poc_name: name,
            primary_poc_role: "Billing",
            primary_poc_contact: {
              phone_num: companyPhone || "Not Provided",
              email: companyEmail || "Not Provided",
              contact_address: companyAddress || "Not Provided"
            },
            secondary_poc_name: name,
            secondary_poc_role: "Procurement",
            secondary_poc_contact: {
              phone_num: companyPhone || "Not Provided",
              email: companyEmail || "Not Provided",
              contact_address: companyAddress || "Not Provided"
            },
            primary_admin_user_name: name,
            primary_admin_contact_info: {
              phone_num: companyPhone || "Not Provided",
              email: companyEmail || "Not Provided",
              contact_address: companyAddress || "Not Provided"
            },
            secondary_admin_user_name: name,
            secondary_admin_contact_info: {
              phone_num: companyPhone || "Not Provided",
              email: companyEmail || "Not Provided",
              contact_address: companyAddress || "Not Provided"
            },
            database_name: "governance_db",
            payment_mode: frequency === "one-time" ? "payment" : "subscription",
            app_sumo_license_key: values.coupionCode
          },
          agreement
        };

        const res = await mutation(
          `app-sumo-registration?subscription_id=${featureId}&payment_freq=one-time`,
          {
            method: "POST",
            isAlert: false,
            body
          }
        );

        if (res?.status === 200) {
          toast.success("App Sumo coupon applied successfully");
          resetForm();
          router.push("/purchase/confirmation");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to submit checkout form"
        );
      }
    },
    [featureId, frequency, mutation]
  );

  // Improved captcha verification handler with better error handling
  const handleCaptchaToken = useCallback(
    async (token: string) => {
      if (!token) {
        toast.error("Captcha token is missing");
        return;
      }

      try {
        setIsVerifyingToken(true);

        const res = await mutation("verify-turnstile", {
          method: "POST",
          isAlert: false,
          body: { token }
        });

        if (res?.status === 200 && res?.results?.success) {
          setCaptchaToken(token);
        } else {
          throw new Error(
            res?.results?.message || "Captcha verification failed"
          );
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Captcha verification failed"
        );
      } finally {
        setIsVerifyingToken(false);
      }
    },
    [mutation]
  );

  // Show captcha verification UI when token is NOT available
  if (captchaToken) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="p-8 text-center">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            {"Please verify you're not a bot"}
          </h2>
          <Turnstile
            siteKey="0x4AAAAAABGh1deyYXgaBfdQ"
            onSuccess={handleCaptchaToken}
            options={{
              theme: "light",
              size: "normal"
            }}
          />
          {isVerifyingToken && (
            <div className="mt-4 text-tertiary-600">
              <p>Verifying...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show loading state when validating or missing parameters
  if (isValidating) {
    return (
      <div className="relative min-h-dvh w-full overflow-x-hidden bg-gradient-to-br from-white to-tertiary-50">
        <FloatingBalls />
        <SkeletonLoader />
      </div>
    );
  }

  // Main component render when everything is ready
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-gradient-to-br from-white to-tertiary-50">
      <FloatingBalls />
      <CheckoutForm
        onSubmit={handleSubmit}
        inputClass={formStyles.inputClass}
        inputError={formStyles.inputError}
        labelClass={formStyles.labelClass}
        errorClass={formStyles.errorClass}
        feature={data as Feature}
        isLoading={isLoading}
        frequency={frequency as string}
      />
    </div>
  );
};

export default AppSumo;
