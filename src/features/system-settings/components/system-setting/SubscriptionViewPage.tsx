"use client";
import React, { useState } from "react";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { Tooltip } from "@mui/material";
import useSwr from "@/shared/hooks/useSwr";
import useMutation from "@/shared/hooks/useMutation";
import usePermission from "@/shared/hooks/usePermission";
import { formatDateTime } from "@/shared/utils";
interface Payment {
  payment_id: string;
  payment_date: string;
  amount: number;
  status: string;
  payment_method: string;
  stripe_invoice_url: string;
  subscription_plan_id: string;
  plan_name: string;
  plan_type: string;
  plan_features: string[];
  type?: string;
}

interface Limits {
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

interface ClientInfo {
  billing_cycle_pref: string;
  subscription_start_date: string;
  subscription_end_date: string;
  customer_subscription_status: string;
  entitlement: string;
  limits: Limits;
  plan_features: string[];
}

interface Subscription {
  payment_id: string;
  payment_date: string;
  amount: number;
  status: string;
  payment_method: string;
  stripe_invoice_url: string;
  subscription_plan_id: string;
  plan_name: string;
  plan_type: string;
  plan_features: string[];
}

interface AddOn {
  payment_id: string;
  payment_date: string;
  amount: number;
  status: string;
  payment_method: string;
  stripe_invoice_url: string;
  type?: string;
}

type PaymentTransaction =
  | (AddOn & { type: "addon" })
  | (Subscription & { type: "subscription" })
  | Payment;
const SubscriptionViewPage = () => {
  const { data, mutate, isValidating } = useSwr("payment");
  const { isLoading, mutation } = useMutation();
  const { isLoading: upgradeloading, mutation: upgradeMutation } =
    useMutation();
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const { user, isUserLoading } = usePermission();
  const [activeTab, setActiveTab] = useState<
    "all" | "subscriptions" | "addons"
  >("all");

  // Safely access API response data with optional chaining
  const payments = data?.payments || [];
  const clientInfo = data?.client_info || ({} as ClientInfo);
  const limits = clientInfo?.limits || ({} as Limits);
  const addOns =
    data?.add_ons?.map((item: AddOn) => ({ ...item, type: "addon" })) || [];
  const subscriptions =
    data?.subscriptions?.map((item: Subscription) => ({
      ...item,
      type: "subscription"
    })) || [];
  const allTransaction: PaymentTransaction[] = [...addOns, ...subscriptions];
  // Get active transactions based on selected tab
  const getActiveTransactions = () => {
    switch (activeTab) {
      case "subscriptions":
        return subscriptions;
      case "addons":
        return addOns;
      case "all":
      default:
        return payments;
    }
  };

  // Format currency
  const formatCurrency = (amount: number | undefined): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num?.toLocaleString() || "0";
  };

  // Get plan cycle (monthly/annual)
  const getPlanCycle = (): string => {
    return clientInfo?.billing_cycle_pref === "year"
      ? "Annual"
      : clientInfo?.billing_cycle_pref === "one-time"
        ? "Lifetime"
        : "Monthly";
  };

  // Calculate days remaining in subscription
  const getDaysRemaining = (): number => {
    const endDateRaw = clientInfo?.subscription_end_date;
    if (!endDateRaw) {
      return 0;
    }

    const endDate = new Date(endDateRaw);
    if (isNaN(endDate.getTime())) {
      return 0;
    }

    // Normalize both dates to UTC midnight to avoid timezone issues
    const todayUTC = new Date(
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate()
      )
    );

    const endDateUTC = new Date(
      Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate()
      )
    );

    const diffTime = endDateUTC.getTime() - todayUTC.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(days, 0); // Ensure non-negative days
  };

  // Check if subscription is canceled
  const isCanceled = ["cancelled", "pending cancellation"].includes(
    clientInfo?.customer_subscription_status || ""
  );

  // Check if policy limit is low
  const isPolicyLimitLow = (limits?.ai_policy_left || 0) <= 2;
  const handleCancelSubscription = async (): Promise<void> => {
    try {
      // Show confirmation dialog with SweetAlert
      const result = await Swal.fire({
        title: "Cancel Subscription?",
        html: `You'll still have access to <strong style="text-transform: capitalize;">${clientInfo?.entitlement?.replace("_", " ")} plan</strong> until ${moment(clientInfo?.subscription_end_date).format("MMMM D, YYYY")}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel it",
        confirmButtonColor: "#ef4444",
        cancelButtonText: "No, keep it",
        cancelButtonColor: "#3b82f6",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#f3f4f6"
          : "#1f2937"
      });

      // If the user clicks 'Yes', proceed with the cancellation
      if (result.isConfirmed) {
        const res = await mutation("cancel-subscription", {
          method: "POST",
          isAlert: false
        });
        if (res?.status === 200) {
          toast.success("Subscription cancelled successfully");
          mutate();
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  // Handle buying more policy documents
  const handleBuyMorePolicies = async (): Promise<void> => {
    try {
      const result = await Swal.fire({
        title: "Buy More Token",
        html: "Purchase 500,000 more tokens for chat+ and policy assistant?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Proceed to pay $20",
        confirmButtonColor: "#3b82f6",
        cancelButtonText: "Cancel",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#f3f4f6"
          : "#1f2937"
      });

      if (result.isConfirmed) {
        const res = await mutation("buy-additional-tokens", {
          method: "POST",
          isAlert: false
        });

        if (res?.status === 200) {
          window.open(res?.results?.payment_url, "_blank");
          toast.success("Redirecting to payment page...");
          mutate();
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  const handleUpgradePlan = async () => {
    try {
      const res = await upgradeMutation("upgrade-to-yearly", {
        method: "POST",
        isAlert: false
      });

      if (res?.status === 200) {
        window.open(res?.results?.billing_url, "_blank");
        toast.success("Redirecting to payment page...");
        mutate();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  // Show plan features in a modal
  const showPlanFeatures = () => {
    if (clientInfo?.plan_features && clientInfo?.plan_features?.length > 0) {
      Swal.fire({
        title: `${clientInfo?.entitlement?.charAt(0).toUpperCase()}${clientInfo?.entitlement?.slice(1)} Plan Features`,
        html: `
          <ul class="mt-4 space-y-2 text-left">
            ${(Array.isArray(clientInfo?.plan_features)
              ? clientInfo.plan_features
              : typeof clientInfo?.plan_features === "string"
                ? [clientInfo.plan_features]
                : []
            )
              .map(
                (feature: unknown) =>
                  `<li class="flex items-start">
                <svg class="mr-2 h-5 w-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                ${feature}
              </li>`
              )
              .join("")}
          </ul>
        `,
        confirmButtonColor: "#4f46e5",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#f3f4f6"
          : "#1f2937"
      });
    } else {
      Swal.fire({
        title: "No Features Available",
        text: "This plan does not have any specific features listed.",
        icon: "info",
        confirmButtonColor: "#4f46e5",
        background: document.documentElement.classList.contains("dark")
          ? "#1f2937"
          : "#ffffff",
        color: document.documentElement.classList.contains("dark")
          ? "#f3f4f6"
          : "#1f2937"
      });
    }
  };

  // Loading skeleton for entire component
  const ContentSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-9 w-48 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
          <div className="mt-2 h-5 w-64 rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
        <div className="mt-4 h-12 w-32 rounded-lg bg-gray-300 dark:bg-gray-700 sm:mt-0"></div>
      </div>

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Plan card skeleton */}
          <div className="rounded-2xl bg-white bg-opacity-90 p-6 shadow-lg dark:bg-gray-800 dark:bg-opacity-90">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-gray-300 dark:bg-gray-700"></div>
                <div>
                  <div className="h-7 w-40 rounded bg-gray-300 dark:bg-gray-700"></div>
                  <div className="mt-2 h-5 w-28 rounded bg-gray-300 dark:bg-gray-700"></div>
                  <div className="mt-2 h-4 w-56 rounded bg-gray-300 dark:bg-gray-700"></div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="h-8 w-24 rounded-md bg-gray-300 dark:bg-gray-700"></div>
                <div className="mt-2 h-4 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>
              </div>
            </div>
            <div className="mt-6 h-10 w-full rounded-lg bg-gray-300 dark:bg-gray-700"></div>
          </div>

          {/* Usage metrics skeleton */}
          <div className="rounded-2xl bg-white shadow-lg dark:bg-gray-800">
            <div className="h-24 rounded-t-2xl bg-gray-300 dark:bg-gray-700"></div>
            <div className="space-y-6 p-6">
              <div className="h-36 rounded-xl bg-gray-300 dark:bg-gray-700"></div>
              <div className="h-36 rounded-xl bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="rounded-2xl bg-white shadow-lg dark:bg-gray-800">
            <div className="border-b border-gray-100 p-6 dark:border-gray-700">
              <div className="h-7 w-40 rounded bg-gray-300 dark:bg-gray-700"></div>
              <div className="mt-2 h-4 w-48 rounded bg-gray-300 dark:bg-gray-700"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700"
                  >
                    <div className="h-20 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <div className="h-10 w-40 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Redesigned Transaction Card
  const TransactionCard: React.FC<{
    transaction: PaymentTransaction;
    index: number;
    isCompact?: boolean;
  }> = ({ transaction, index, isCompact = false }) => {
    const isLatest = index === 0;
    const isSubscription = transaction?.type === "subscription";
    const isAddon = transaction?.type === "addon";

    return (
      <div
        className={`group overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-md ${
          isLatest && !isCompact
            ? "border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-blue-50/70 dark:border-indigo-800/50 dark:from-indigo-900/30 dark:to-blue-900/20"
            : "border-gray-100 bg-white hover:border-indigo-100 hover:bg-indigo-50/30 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/20"
        }`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    isSubscription
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                      : isAddon
                        ? "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {isSubscription ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  ) : isAddon ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  )}
                </div>

                <div>
                  <h3
                    className={`font-medium ${isLatest && !isCompact ? "text-indigo-900 dark:text-indigo-300" : "text-gray-900 dark:text-white"}`}
                  >
                    {isSubscription
                      ? `${transaction.plan_name?.charAt(0).toUpperCase()}${transaction.plan_name?.slice(1)} Plan`
                      : isAddon
                        ? "Additional Policies"
                        : "Payment"}

                    {isLatest && !isCompact && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                        Latest
                      </span>
                    )}
                  </h3>

                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {!isUserLoading &&
                        user &&
                        transaction.payment_date &&
                        moment(
                          formatDateTime(
                            transaction.payment_date,
                            user?.date_time
                          )
                        ).format("lll")}
                    </span>
                    {/* {!isCompact && (
                      <span className="text-gray-400 dark:text-gray-600">
                        •
                      </span>
                    )}
                    {!isCompact && (
                      <span>{formatTime(transaction.payment_date)}</span>
                    )} */}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div
                className={`font-bold ${isLatest && !isCompact ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}
              >
                {formatCurrency(transaction.amount)}
              </div>

              <div className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    transaction.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                  }`}
                >
                  {transaction.status === "completed"
                    ? "Paid"
                    : transaction.status}
                </span>
              </div>
            </div>
          </div>

          {!isCompact && (
            <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <svg
                    className="mr-1.5 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  {transaction.payment_method || "CARD"}

                  {transaction.payment_id && (
                    <span className="ml-3 text-gray-400 dark:text-gray-600">
                      ID: {transaction.payment_id.substring(0, 8)}...
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  {transaction.stripe_invoice_url && (
                    <button
                      onClick={() =>
                        transaction.stripe_invoice_url &&
                        window.open(transaction.stripe_invoice_url, "_blank")
                      }
                      className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium shadow-sm transition-all ${
                        isLatest
                          ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:text-indigo-200 dark:hover:bg-indigo-800"
                          : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      <svg
                        className="mr-1.5 h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Receipt
                    </button>
                  )}

                  {isSubscription &&
                    transaction.plan_features &&
                    transaction.plan_features.length > 0 && (
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: `${transaction.plan_name?.charAt(0).toUpperCase()}${transaction.plan_name?.slice(1)} Plan Features`,
                            html: `
                            <ul class="mt-4 space-y-2 text-left">
                              ${transaction?.plan_features
                                ?.map(
                                  (feature: string) =>
                                    `<li class="flex items-start">
                                  <svg class="mr-2 h-5 w-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  ${feature}
                                </li>`
                                )
                                .join("")}
                            </ul>
                          `,
                            confirmButtonColor: "#4f46e5",
                            background:
                              document.documentElement.classList.contains(
                                "dark"
                              )
                                ? "#1f2937"
                                : "#ffffff",
                            color: document.documentElement.classList.contains(
                              "dark"
                            )
                              ? "#f3f4f6"
                              : "#1f2937"
                          });
                        }}
                        className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        <svg
                          className="mr-1.5 h-3.5 w-3.5"
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
                        Features
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Transaction History Modal
  const TransactionHistoryModal: React.FC = () => {
    const activeTransactions = getActiveTransactions();

    return (
      <div
        className={`fixed inset-0 z-999999 flex items-center justify-center p-4 transition-all duration-300 ${
          showAllTransactions ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          tabIndex={0}
          role="button"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAllTransactions(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowAllTransactions(false);
            }
          }}
        ></div>

        <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 dark:bg-gray-800">
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 p-5 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                Transaction History
              </h2>

              <button
                onClick={() => setShowAllTransactions(false)}
                className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex space-x-1 overflow-x-auto rounded-lg bg-gray-100 p-1 text-sm dark:bg-gray-700">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-md px-4 py-2 font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-white text-indigo-600 shadow dark:bg-gray-800 dark:text-indigo-400"
                    : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                }`}
              >
                All Transactions
              </button>

              <button
                onClick={() => setActiveTab("subscriptions")}
                className={`rounded-md px-4 py-2 font-medium transition-colors ${
                  activeTab === "subscriptions"
                    ? "bg-white text-indigo-600 shadow dark:bg-gray-800 dark:text-indigo-400"
                    : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                }`}
              >
                Subscriptions
              </button>

              <button
                onClick={() => setActiveTab("addons")}
                className={`rounded-md px-4 py-2 font-medium transition-colors ${
                  activeTab === "addons"
                    ? "bg-white text-indigo-600 shadow dark:bg-gray-800 dark:text-indigo-400"
                    : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                }`}
              >
                Add-ons
              </button>
            </div>
          </div>

          <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-5">
            {activeTransactions.length > 0 ? (
              <div className="space-y-4">
                {activeTransactions.map(
                  (transaction: PaymentTransaction, index: number) => (
                    <TransactionCard
                      key={transaction.payment_id || `transaction-${index}`}
                      transaction={transaction}
                      index={index}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg
                    className="h-8 w-8 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                  No{" "}
                  {activeTab === "all"
                    ? "transactions"
                    : activeTab === "subscriptions"
                      ? "subscription payments"
                      : "add-on purchases"}{" "}
                  found
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {activeTab === "all"
                    ? "Your payment history will appear here"
                    : activeTab === "subscriptions"
                      ? "Your subscription payments will appear here"
                      : "Your add-on purchases will appear here"}
                </p>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-gray-100 bg-white/90 p-4 text-center backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/90">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activeTransactions.length} transactions found • Last updated{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Main render method
  return (
    <div className="h-full p-4 sm:p-6">
      <div className="w-full">
        {isValidating ? (
          <ContentSkeleton />
        ) : (
          <>
            {/* Header with subscription summary */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  Your Subscription
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {isCanceled
                    ? `Active until ${
                        !isUserLoading &&
                        user &&
                        clientInfo?.subscription_end_date &&
                        moment(
                          formatDateTime(
                            clientInfo?.subscription_end_date,
                            user?.date_time
                          )
                        ).format("ll")
                      }`
                    : "Manage your plan, billing and subscription settings"}
                </p>
              </div>

              <div className="flex h-14 items-center gap-2 rounded-full bg-white px-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isCanceled
                      ? "animate-pulse bg-amber-500"
                      : "animate-pulse bg-green-500"
                  }`}
                ></div>
                <span className="font-medium capitalize text-gray-900 dark:text-white">
                  {isCanceled
                    ? clientInfo?.customer_subscription_status
                    : "Active"}

                  {!isCanceled && (
                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                      ({getDaysRemaining()} days left)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left column - Plan summary and management */}
              <div className="lg:col-span-2">
                {/* Current Plan Card - Redesigned to remove background */}
                <div className="relative mb-8 overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-gray-800">
                  <div className="absolute left-0 top-0 h-32 w-32 rounded-br-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 transition-all duration-1000"></div>
                  <div className="absolute bottom-0 right-0 h-40 w-40 rounded-tl-full bg-gradient-to-tl from-purple-500 to-pink-600 opacity-10 transition-all duration-1000"></div>
                  <div className="p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                          <svg
                            className="h-8 w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                            />
                          </svg>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                              {clientInfo?.entitlement?.replace("_", " ")} plan
                            </h2>
                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                              {clientInfo?.customer_subscription_status !==
                              "trial"
                                ? getPlanCycle()
                                : "Trial"}
                            </span>
                          </div>
                          {clientInfo?.customer_subscription_status !==
                            "trial" && (
                            <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(subscriptions[0]?.amount || 0)}
                              <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                                {getPlanCycle() === "Monthly"
                                  ? "/month"
                                  : getPlanCycle() === "Lifetime"
                                    ? "/lifetime"
                                    : "/year"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Next billing date */}
                      <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-700/50 sm:mt-0">
                        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          {isCanceled
                            ? "Access Until"
                            : clientInfo?.customer_subscription_status !==
                                "trial"
                              ? "Next Billing Date"
                              : " Trial Ends On"}
                        </span>
                        <span className="mt-1 block text-lg font-semibold text-gray-900 dark:text-white">
                          {!isUserLoading &&
                            user &&
                            clientInfo?.subscription_end_date &&
                            moment(
                              formatDateTime(
                                clientInfo?.subscription_end_date,
                                user?.date_time
                              )
                            ).format("ll")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 p-6 dark:border-gray-700">
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          onClick={showPlanFeatures}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          See Features
                        </button>
                        <button
                          // onClick={() =>
                          //   toast.info("This feature is coming soon.")
                          // }
                          onClick={handleUpgradePlan}
                          disabled={
                            clientInfo?.customer_subscription_status === "trial"
                          }
                          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                            clientInfo?.customer_subscription_status !== "trial"
                              ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                              : "bg-neutral-300"
                          } `}
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
                              strokeWidth="2"
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                          {upgradeloading ? "Redirecting..." : "Upgrade Plan"}
                        </button>
                      </div>
                      {!isCanceled &&
                        clientInfo?.customer_subscription_status !==
                          "trial" && (
                          <button
                            onClick={handleCancelSubscription}
                            disabled={isLoading}
                            className="z-99 flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                          >
                            <Tooltip
                              title="Cancel Subscription"
                              placement="top"
                              arrow
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
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </Tooltip>
                            {isLoading ? "Cancelling..." : ""}
                          </button>
                        )}
                    </div>
                  </div>
                </div>

                {/* Usage Metrics - Simplified */}
                <div className="rounded-2xl bg-white shadow-lg dark:bg-gray-800">
                  <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-6">
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white opacity-10"></div>
                    <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-white opacity-10"></div>

                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-white sm:text-2xl">
                          Usage Metrics
                        </h2>
                        <p className="mt-1 text-sm text-indigo-100">
                          Monitor your subscription resources
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="w-full p-6">
                    <div className="grid w-full grid-cols-1 gap-6">
                      {/* AI Policy Documents card */}
                      <div
                        className={`w-full transform overflow-hidden rounded-xl ${
                          isPolicyLimitLow
                            ? "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30"
                            : "bg-white dark:bg-gray-700"
                        } p-0.5 shadow-md transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/30`}
                      >
                        <div
                          className={`h-full rounded-xl ${
                            isPolicyLimitLow
                              ? "border border-amber-200 dark:border-amber-700"
                              : "border border-gray-100 dark:border-gray-600"
                          } bg-white p-4 dark:bg-gray-800`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="mb-1 flex items-center gap-2">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                    isPolicyLimitLow
                                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                                      : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                                  }`}
                                >
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  AI Policy Documents
                                </h3>
                                {isPolicyLimitLow && (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                    Low
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Available documents for policy generation
                              </p>
                            </div>
                            <div
                              className={`flex size-fit flex-shrink-0 items-center justify-center rounded-xl px-4 py-3 ${
                                isPolicyLimitLow
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                              }`}
                            >
                              <span className="text-3xl font-bold">
                                {Math.floor(limits?.ai_policy_left) || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-full transform overflow-hidden rounded-xl ${
                          isPolicyLimitLow
                            ? "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30"
                            : "bg-white dark:bg-gray-700"
                        } p-0.5 shadow-md transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/30`}
                      >
                        <div
                          className={`h-full rounded-xl ${
                            isPolicyLimitLow
                              ? "border border-amber-200 dark:border-amber-700"
                              : "border border-gray-100 dark:border-gray-600"
                          } bg-white p-4 dark:bg-gray-800`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="mb-1 flex items-center gap-2">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                    isPolicyLimitLow
                                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                                      : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                                  }`}
                                >
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                    />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  Token Remaining
                                </h3>
                                {isPolicyLimitLow && (
                                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                    Low
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Available tokens for policy generation & chat.
                              </p>
                            </div>
                            <div
                              className={`flex size-fit flex-shrink-0 items-center justify-center rounded-xl px-4 py-3 ${
                                isPolicyLimitLow
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                              }`}
                            >
                              <span className="text-3xl font-bold">
                                {formatNumber(limits?.tokens_remaining || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleBuyMorePolicies}
                        disabled={
                          clientInfo?.customer_subscription_status === "trial"
                        }
                        className={`mt-4 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 active:translate-y-0 dark:from-amber-600 dark:to-amber-700 ${
                          clientInfo?.customer_subscription_status !== "trial"
                            ? "bg-gradient-to-br from-violet-600 to-indigo-600 dark:hover:from-amber-700 dark:hover:to-amber-800"
                            : "bg-neutral-300"
                        } `}
                      >
                        Buy more tokens
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Billing history */}
              <div>
                {/* Recent Transactions Card */}
                <div className="mb-6 rounded-2xl bg-white shadow-lg dark:bg-gray-800">
                  <div className="border-b border-gray-100 p-6 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Recent Transactions
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Your billing activity history
                        </p>
                      </div>

                      <div className="flex -space-x-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-xs font-bold text-white dark:border-gray-800">
                          <span>$</span>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-purple-500 text-xs font-bold text-white dark:border-gray-800">
                          <span>+</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {allTransaction?.length > 0 ? (
                        allTransaction
                          ?.slice(0, 3)
                          .map((payment: PaymentTransaction, index: number) => (
                            <TransactionCard
                              key={payment.payment_id || `transaction-${index}`}
                              transaction={payment}
                              index={index}
                              isCompact
                            />
                          ))
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center dark:border-gray-700">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <svg
                              className="h-6 w-6 text-gray-400 dark:text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                          </div>
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No transactions found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Your payment history will appear here
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setShowAllTransactions(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                      >
                        View all transactions
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transactions History Modal */}
      <TransactionHistoryModal />
    </div>
  );
};

export default SubscriptionViewPage;
