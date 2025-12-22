"use client";
import { AlertCircle, Loader2, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@mui/material";
import useSwr from "@/shared/hooks/useSwr";
import useMutation from "@/shared/hooks/useMutation";
import CustomButton from "@/shared/core/CustomButton";

interface SubmitTestDataProps {
  open: boolean;
  onClose: () => void;
  testId: string;
  mutate: () => void;
}

interface MetricValues {
  [key: string]: string;
}

const SubmitTestData = ({
  open,
  onClose,
  testId,
  mutate
}: SubmitTestDataProps) => {
  const { data, isValidating } = useSwr(
    testId ? `test/relevant_metrics?test_id=${testId}` : null
  );
  const { isLoading, mutation } = useMutation();
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [metricKeys, setMetricKeys] = useState<string[]>([]);
  const [metricValues, setMetricValues] = useState<MetricValues>({});

  const providers = data?.payloads || [];

  // Handle provider selection
  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    const payload = providers.find(
      (p: { eval_provider: string }) => p.eval_provider === provider
    );

    if (payload) {
      const providerKey = Object.keys(payload).find(
        (key) => key !== "test_id" && key !== "eval_provider"
      );

      if (providerKey && payload[providerKey]) {
        const keys = Object.keys(payload[providerKey]);
        setMetricKeys(keys);

        // Initialize metric values with empty strings
        const initialValues: MetricValues = {};
        keys.forEach((key) => {
          initialValues[key] = "";
        });
        setMetricValues(initialValues);
      }
    }
  };

  // Handle metric value change
  const handleMetricChange = (key: string, value: string) => {
    // Only allow numbers, decimal point, and empty string
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);

      // Validate range 0-100
      if (value === "" || (numValue >= 0 && numValue <= 100)) {
        setMetricValues((prev) => ({
          ...prev,
          [key]: value
        }));
      } else {
        toast.info("Values must be between 0 and 100");
      }
    }
  };
  // Reset form
  const resetForm = () => {
    setSelectedProvider("");
    setMetricKeys([]);
    setMetricValues({});
  };
  // Handle form submission
  const handleSubmit = async () => {
    // Validate all fields are filled
    const emptyFields = metricKeys.filter((key) => metricValues[key] === "");
    if (emptyFields.length > 0) {
      toast.info("Please fill all metric values");
      return;
    }

    // Convert string values to numbers
    const numericMetrics: { [key: string]: number } = {};
    metricKeys.forEach((key) => {
      numericMetrics[key] = parseFloat(metricValues[key] || "0");
    });

    // Build payload
    const payload = {
      test_id: testId,
      eval_provider: selectedProvider,
      [selectedProvider]: numericMetrics
    };

    try {
      const response = await mutation("ccm-metrics", {
        method: "POST",

        body: payload
      });

      if (response?.status === 200 || response?.status === 201) {
        toast.success("Data submitted successfully!");
        mutate();
        onClose();
        resetForm();
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting data"
      );
    }
  };

  // Close handler
  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-xl shadow-2xl"
      }}
    >
      <div className="flex w-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-600 p-2">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Submit Test Data
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Test ID: {testId}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 transition-colors hover:bg-white/50 disabled:opacity-50 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isValidating ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {/* Provider Selection */}
              <div className="mb-6">
                <span className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Select Evaluation Provider
                </span>
                <select
                  value={selectedProvider}
                  onChange={(e) => handleProviderSelect(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Choose an evaluation provider...</option>
                  {providers.map((provider: { eval_provider: string }) => (
                    <option
                      key={provider.eval_provider}
                      value={provider.eval_provider}
                    >
                      {provider.eval_provider.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metrics Form */}
              {selectedProvider && metricKeys.length > 0 && (
                <div className="space-y-4">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="size-2 rounded-full bg-indigo-600"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Enter Metric Values (0-100)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {metricKeys.map((key) => (
                      <div
                        key={key}
                        className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-indigo-600"
                      >
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {key}
                          </label>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            Enter a value between 0 and 100 (decimals allowed)
                          </p>
                        </div>
                        <div className="w-48">
                          <input
                            type="text"
                            value={metricValues[key]}
                            onChange={(e) =>
                              handleMetricChange(key, e.target.value)
                            }
                            placeholder="0.0"
                            disabled={isLoading}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-lg font-semibold text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {selectedProvider && metricKeys.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No metrics found for this provider
                  </p>
                </div>
              )}

              {!selectedProvider && !isValidating && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                  <p className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                    Select a Provider to Get Started
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Choose an evaluation provider from the dropdown above
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Actions */}
        {selectedProvider && metricKeys.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metricKeys.length} metric{metricKeys.length !== 1 ? "s" : ""}{" "}
                to submit
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <div className="w-fit">
                  <CustomButton
                    onClick={handleSubmit}
                    loading={isLoading}
                    loadingText="Submitting..."
                  >
                    Submit Data
                  </CustomButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default SubmitTestData;
