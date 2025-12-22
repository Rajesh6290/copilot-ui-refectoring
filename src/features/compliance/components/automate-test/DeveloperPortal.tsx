"use client";
import useSwr from "@/shared/hooks/useSwr";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DeveloperPortal = ({ id }: { id: string }) => {
  const { data, isValidating } = useSwr(
    id ? `test/relevant_metrics?test_id=${id}` : null
  );
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Get available providers from payloads
  const availableProviders =
    data?.payloads?.map(
      (payload: {
        eval_provider: string;
        test_id: string;
        [key: string]: unknown;
      }) => ({
        name: payload.eval_provider,
        testId: payload.test_id
      })
    ) || [];

  // Get selected provider data
  const getSelectedProviderData = () => {
    if (!selectedProvider) {
      return null;
    }

    const payload = data?.payloads?.find(
      (p: { eval_provider: string }) => p.eval_provider === selectedProvider
    );
    if (!payload) {
      return null;
    }

    const providerKey = Object.keys(payload).find(
      (key) => key !== "test_id" && key !== "eval_provider"
    );

    return {
      provider: payload.eval_provider,
      testId: payload.test_id,
      metrics: providerKey ? payload[providerKey] : {}
    };
  };

  const selectedData = getSelectedProviderData();

  // Format JSON string for display
  const generateJsonString = () => {
    if (!selectedData) {
      return "";
    }

    const jsonObj = {
      test_id: selectedData.testId,
      eval_provider: selectedData.provider,
      [selectedData.provider]: selectedData.metrics
    };

    return JSON.stringify(jsonObj, null, 2);
  };

  // Generate cURL command
  const generateCurlCommand = () => {
    if (!selectedData) {
      return "";
    }

    const jsonBody = generateJsonString();

    return `curl -X POST https://api.cognitiveview.com/ccm-metrics \\
  -H "Content-Type: application/json" \\
  -H "Ocp-Apim-Subscription-Key: <YOUR_ACTUAL_SUBSCRIPTION_KEY>" \\
  -d '${jsonBody.replace(/\n/g, "\n  ")}'`;
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: "json" | "curl") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "json") {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      } else {
        setCopiedCurl(true);
        setTimeout(() => setCopiedCurl(false), 2000);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to copy to clipboard"
      );
    }
  };

  // Check if data is empty or doesn't require submission
  const isEmptyData = !data || !data.payloads || data.payloads.length === 0;

  // Skeleton Loader Component
  if (isValidating) {
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="animate-pulse border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50 px-6 py-5 dark:border-gray-700 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="space-y-2">
                <div className="h-6 w-64 rounded bg-gray-300 dark:bg-gray-600"></div>
                <div className="h-4 w-48 rounded bg-gray-300 dark:bg-gray-600"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6 h-24 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="mb-6 h-48 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  // Empty data message
  if (isEmptyData) {
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              This Test contains Controls which do not require data submission.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {/* Content */}
      <div className="h-fit">
        {/* Endpoint Info */}
        <div className="mb-6 w-full rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="mb-3 font-semibold">Here are the next steps:</p>
          <ol className="list-disc space-y-2 pl-5">
            <li className="text-sm font-medium">
              {
                'Visit "System Settings" under Settings tab of the navigation pane.'
              }
            </li>
            <li className="text-sm font-medium">{'Visit the "API" menu.'}</li>
            <li className="text-sm font-medium">
              {
                'Click on the "Create Subscription" button to generate your API Key for our platform\'s Developer API System.'
              }
            </li>
            <li className="text-sm font-medium">
              {
                "Once generated, use either the Primary Key or the Secondary Key to send data via POST request periodically as per the Test Run frequency."
              }
            </li>
            <li className="text-sm font-medium">
              {
                "The request body example for each Evaluation provider is provided below."
              }
            </li>
            <li className="text-sm font-medium">
              {
                "Please visit our Developer API Portal for additional help and guidance."
              }
            </li>
          </ol>
        </div>
        <div className="mb-6 flex w-full items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                POST
              </span>
              <code className="text-sm text-gray-700 dark:text-gray-300">
                {"https://api.cognitiveview.com/ccm-metrics"}
              </code>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Please make sure the Request Body matches the structure accepted
              by our API
            </p>
          </div>

          {/* Provider Selector */}
          <div className="space-y-1">
            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
              Select Evaluation Provider:
            </span>
            <div className="relative">
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Choose a provider to view metrics...</option>
                {availableProviders?.map((provider: { name: string }) => (
                  <option key={provider.name} value={provider.name}>
                    {provider.name.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Display Selected Provider Data */}
        {selectedProvider ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Left Side - JSON Body */}
            <div className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Request Body ({selectedProvider.toUpperCase()})
                </h3>
                <button
                  onClick={() => copyToClipboard(generateJsonString(), "json")}
                  className="flex items-center gap-1 rounded-md bg-gray-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-600"
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy JSON
                    </>
                  )}
                </button>
              </div>
              <div className="flex-1 rounded-lg border border-gray-200 bg-gray-900 dark:border-gray-700">
                <div className="overflow-x-auto p-4">
                  <pre className="text-xs leading-relaxed text-green-500">
                    <code>{generateJsonString()}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Right Side - cURL Request */}
            <div className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  cURL Command
                </h3>
                <button
                  onClick={() => copyToClipboard(generateCurlCommand(), "curl")}
                  className="flex items-center gap-1 rounded-md bg-gray-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-600"
                >
                  {copiedCurl ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy cURL
                    </>
                  )}
                </button>
              </div>
              <div className="flex-1 rounded-lg border border-gray-200 bg-gray-900 dark:border-gray-700">
                <div className="overflow-x-auto p-4">
                  <pre className="text-xs leading-relaxed text-cyan-400">
                    <code>{generateCurlCommand()}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Select an evaluation provider above to view the request body
              format
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Available providers:{" "}
              {availableProviders
                ?.map((p: { name: string }) => p.name)
                .join(", ") || "None"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperPortal;
