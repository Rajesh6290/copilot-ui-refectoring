"use client";
import useSwr from "@/shared/hooks/useSwr";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import React, { useEffect, useState } from "react";

// TypeScript interfaces
interface PlanLimits {
  api_calls: number;
  users: number;
  storage: number;
  priority_support: boolean;
  reporting: boolean;
  ai_policy_left: number;
  tokens_remaining: number;
  input_tokens: number;
  output_tokens: number;
  token_amount_remaining: number;
}

interface Plan {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  name: string;
  description: string;
  price_per_month: string;
  price_per_year: string;
  features_to_show: string[];
  limits: PlanLimits;
  subscription_id: string;
}

const Selection: React.FC = () => {
  const { data, isValidating } = useSwr("get-starter-options");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get URL parameters
  const featureId = searchParams.get("featureId");
  const frequency = searchParams.get("frequency");
  const tenantId = searchParams.get("tenantId");
  const clientId = searchParams.get("clientId");

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    frequency === "year" ? "yearly" : "monthly"
  );
  const [expandedFeatures, setExpandedFeatures] = React.useState<{
    [key: string]: boolean;
  }>({});

  // Effect to handle pre-selection when data loads
  useEffect(() => {
    if (data && featureId && !selectedPlan) {
      const matchingPlan = data?.find(
        (plan: Plan) => plan?.subscription_id === featureId
      );
      if (matchingPlan?.subscription_id) {
        setSelectedPlan(matchingPlan?.subscription_id);
      }
    }
  }, [data, featureId, selectedPlan]);

  // Effect to handle billing cycle from URL
  useEffect(() => {
    if (frequency) {
      setBillingCycle(frequency === "year" ? "yearly" : "monthly");
    }
  }, [frequency]);

  useEffect(() => {
    document.title = "Plan Selection | Cognitiveview";

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
    setMeta("property", "og:title", "Plan Selection | Cognitiveview,");
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

  const formatPrice = (price: string): string => {
    return `$${parseFloat(price).toFixed(0)}`;
  };

  const calculateYearlySavings = (
    monthlyPrice: string,
    yearlyPrice: string
  ): number => {
    const monthly = parseFloat(monthlyPrice) * 12;
    const yearly = parseFloat(yearlyPrice);
    return Math.round(((monthly - yearly) / monthly) * 100);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const toggleFeatures = (planId: string) => {
    setExpandedFeatures((prev) => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  if (isValidating) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 rounded-lg bg-white p-3 shadow-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h8a2 2 0 012 2v4M6 13h12"
              />
            </svg>
            <p className="mt-2 text-gray-600">No plans available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-3">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header Section */}
        <div className="mb-6 text-center">
          <div className="mb-4 flex w-full items-center justify-center py-2">
            <button
              onClick={() => router.push("/")}
              className="cursor-pointer border-none bg-transparent p-0"
              aria-label="Go to home page"
            >
              <img src="/sideBarLogo.svg" alt="sidebar logo" className="h-12" />
            </button>
          </div>
          <div className="mb-4 inline-flex items-center rounded-full bg-tertiary-100 px-4 py-2 text-sm font-medium text-tertiary">
            <svg
              className="mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Pricing Plan
          </div>
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            Explore Our Pricing Offerings
          </h1>
          <p className="mx-auto max-w-2xl text-sm font-medium text-gray-600">
            {
              "Payments are securely processed by Stripe. We never store or manage your credit card details. Stripe handles everything for your protection."
            }
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="relative inline-flex items-center rounded-xl bg-white px-1.5 py-1 shadow-xl">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`relative rounded-lg p-6 py-2 text-sm font-medium transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-tertiary text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative rounded-lg px-6 py-2 text-sm font-medium transition-all duration-300 ${
                billingCycle === "yearly"
                  ? "bg-tertiary text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <span className="flex items-center">
                Yearly
                <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  Save{" "}
                  {data && data.length > 0
                    ? calculateYearlySavings(
                        data[0]?.price_per_month || "0",
                        data[0]?.price_per_year || "0"
                      )
                    : "20"}
                  %
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          {data?.map((plan: Plan, index: number) => {
            const isPopular = plan.name === "Standard starter plan - solo";
            const isSelected = selectedPlan === plan.subscription_id;
            const planTitle = plan.name;
            const currentPrice =
              billingCycle === "monthly"
                ? plan.price_per_month
                : plan.price_per_year;
            const isExpanded = expandedFeatures[plan._id] || false;

            // Combine user limit with features
            const allFeatures = [
              "Up to " +
                plan.limits.users +
                " User" +
                (plan.limits.users > 1 ? "s" : ""),
              ...plan.features_to_show
            ];
            const displayFeatures = isExpanded
              ? allFeatures
              : allFeatures.slice(0, 4);
            const remainingCount = Math.max(0, allFeatures.length - 4);

            return (
              <div
                key={index + 1}
                tabIndex={0}
                role="button"
                onClick={() => handlePlanSelect(plan?.subscription_id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePlanSelect(plan?.subscription_id);
                  }
                }}
                className={`group relative z-20 cursor-pointer overflow-hidden rounded-3xl bg-white p-10 shadow-lg transition-all duration-300 hover:shadow-2xl ${
                  isSelected
                    ? "shadow-blue-500/20 ring-2 ring-blue-500"
                    : "ring-1 ring-gray-200 hover:ring-gray-300"
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -left-8 top-3 z-0">
                    <div className="-rotate-45 transform rounded-lg bg-gradient-to-r from-violet-500 to-tertiary-500 px-8 py-1 shadow-lg">
                      <span className="text-xs font-bold text-white">
                        POPULAR
                      </span>
                    </div>
                  </div>
                )}

                {/* Selected Check Icon */}
                {isSelected && (
                  <div className="absolute right-6 top-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Decorative dots pattern - only show when not selected */}
                {!isSelected && (
                  <div className="absolute right-8 top-8">
                    <div className="grid grid-cols-3 gap-1">
                      {[...Array(9)].map((_, i) => (
                        <div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-gray-300"
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <h3 className="mb-4 text-3xl font-bold capitalize text-gray-900">
                    {planTitle?.replace("-", "")}
                  </h3>
                  <p className="text-base leading-relaxed text-gray-600">
                    {plan.description}
                  </p>
                </div>

                {/* Features - 2 column layout for better readability */}
                <div className="mb-8">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {displayFeatures.map((feature, i: number) => (
                      <div key={i} className="flex items-start">
                        <div className="mr-3 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-tertiary-100">
                          <svg
                            className="h-3 w-3 text-tertiary"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Show More/Less Button */}
                  {remainingCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFeatures(plan._id);
                      }}
                      className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {isExpanded
                        ? "Show less"
                        : `Show ${remainingCount} more feature${remainingCount > 1 ? "s" : ""}`}
                    </button>
                  )}
                </div>

                {/* Price and CTA */}
                <div className="flex items-end justify-between">
                  <div>
                    <div className="mb-2 text-5xl font-bold text-gray-900">
                      {formatPrice(currentPrice)}
                      <span className="text-base font-medium tracking-wider text-gray-700">
                        / {billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      let url = `/purchase/purchase-cognitiveview-starter?featureId=${plan?.subscription_id}&frequency=${billingCycle === "monthly" ? "month" : "year"}`;
                      if (tenantId) {
                        url += `&tenantId=${tenantId}&type=marketplace`;
                      }
                      if (clientId) {
                        url += `&clientId=${clientId}`;
                      }
                      router.push(url);
                    }}
                    className={`rounded-md px-6 py-2 text-base font-semibold transition-all duration-200 hover:shadow-lg ${
                      isSelected
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-tertiary text-white hover:bg-tertiary-600"
                    }`}
                  >
                    {isSelected ? "✓ Proceed" : "Select Plan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <button
            onClick={() =>
              window.open("https://www.cognitiveview.com/pricing-01", "_blank")
            }
            className="group inline-flex items-center text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-tertiary"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            For more information on pricing, click here
            <svg
              className="ml-1 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1"
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
        </div>
      </div>
    </div>
  );
};

export default Selection;
