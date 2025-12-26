"use client";
import { AlertTriangle, CheckCircle, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const PaymentConfirmation = () => {
  const params = useSearchParams();
  const clientId = params.get("client_id");
  const payment_id = params.get("payment_id");
  const status = params.get("status");
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  const handleFetchPaymentData = useCallback(async () => {
    if (clientId && payment_id) {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/cv/v1/get-reciept?payment_id=default&client_id=${clientId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        if (res.status === 200) {
          const data = await res.json();
          setPaymentStatus(data?.payment_status);
          setUserEmail(data?.customer_email || "your email address");

          if (data?.payment_status === "completed") {
            if (data?.stripe_invoice_url) {
              setInvoiceUrl(data?.stripe_invoice_url);
              // Open the URL in a popup window
              const width = 1000;
              const height = 800;
              const left = (window.innerWidth - width) / 2;
              const top = (window.innerHeight - height) / 2;
              window.open(
                data?.stripe_invoice_url,
                "invoice",
                `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
              );
            } else {
              toast.error("No invoice URL found");
            }
          } else if (data?.payment_status === "pending") {
            if (data?.stripe_payment_link && status === "failed") {
              setPaymentLink(data?.stripe_payment_link);
            } else {
              window.location.href = data?.stripe_payment_link;
            }
          }
        } else {
          toast.error("Failed to fetch payment data");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Invalid payment data");
      setLoading(false);
    }
  }, [clientId, payment_id, status]);

  const handleRetry = () => {
    if (paymentLink) {
      window.location.href = paymentLink;
    } else {
      handleFetchPaymentData();
    }
  };

  const handleOpenInvoice = () => {
    if (invoiceUrl) {
      const width = 1000;
      const height = 800;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      window.open(
        invoiceUrl,
        "invoice",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
      );
    }
  };

  useEffect(() => {
    handleFetchPaymentData();
  }, [handleFetchPaymentData]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
          {/* Processing Header */}
          <div className="bg-blue-500 p-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-blue-300 border-opacity-25"></div>
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Processing Payment
            </h1>
            <p className="mt-1 text-blue-100">
              Please wait while we complete your transaction
            </p>
          </div>

          {/* Processing Body */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
                </div>
                <div className="flex-1">
                  <div className="h-2.5 w-full animate-pulse rounded-full bg-gray-200"></div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500 delay-150"></div>
                </div>
                <div className="flex-1">
                  <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-gray-200 delay-150"></div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500 delay-300"></div>
                </div>
                <div className="flex-1">
                  <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-gray-200 delay-300"></div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                This may take a few moments.
              </p>
              <p className="text-sm text-gray-500">
                Please do not close this window.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact our support team at{" "}
              <span className="text-blue-600">accounts@cognitiveview.com</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success message when payment is completed
  if (paymentStatus === "completed") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
          {/* Success Header */}
          <div className="bg-green-500 p-6 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Payment Successful
            </h1>
            <p className="mt-1 text-green-100">
              Your transaction has been completed
            </p>
          </div>

          {/* Success Body */}
          <div className="p-6">
            <div className="mb-6 flex flex-col items-center justify-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                Your Sign-up Invitation Has Been Sent
              </h2>
              <p className="text-center text-gray-600">
                {"We've sent an invitation to "}
                <span className="font-medium">{userEmail}</span>. Please check
                your inbox and complete the registration process.
              </p>
            </div>

            <div className="mt-8 space-y-4 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Check your email for the invitation link
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Click the link to set up your account
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Complete your profile and get started
                  </p>
                </div>
              </div>
            </div>

            {/* View Invoice Button */}
            {invoiceUrl && (
              <button
                onClick={handleOpenInvoice}
                className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition duration-200 hover:bg-blue-700"
              >
                View Invoice
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact our support team at{" "}
              <span className="text-blue-600">accounts@cognitiveview.com</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show failure message and retry button when payment failed
  if (status === "failed") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
          {/* Failed Header */}
          <div className="bg-red-500 p-6 text-center">
            <div className="mb-4 flex justify-center">
              <AlertTriangle className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
            <p className="mt-1 text-red-100">
              Your transaction could not be completed
            </p>
          </div>

          {/* Actions */}
          <div className="p-6">
            <p className="mb-6 text-center text-gray-600">
              We were unable to process your payment. Please try again or
              contact support if the issue persists.
            </p>
            <button
              onClick={handleRetry}
              className="mb-4 w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition duration-200 hover:bg-red-700"
            >
              Retry Payment
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-xs text-gray-500">
              Need help with your order? Contact our support team at{" "}
              <span className="text-blue-600">accounts@cognitiveview.com</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default UI (should rarely be seen as most cases redirect)
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
        {/* Processing Header */}
        <div className="bg-blue-500 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-blue-300 border-opacity-25"></div>
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Processing Payment</h1>
          <p className="mt-1 text-blue-100">
            Please wait while we complete your transaction
          </p>
        </div>

        {/* Processing Body */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
              </div>
              <div className="flex-1">
                <div className="h-2.5 w-full animate-pulse rounded-full bg-gray-200"></div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500 delay-150"></div>
              </div>
              <div className="flex-1">
                <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-gray-200 delay-150"></div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500 delay-300"></div>
              </div>
              <div className="flex-1">
                <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-gray-200 delay-300"></div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              This may take a few moments.
            </p>
            <p className="text-sm text-gray-500">
              Please do not close this window.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at{" "}
            <span className="text-blue-600">accounts@cognitiveview.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
