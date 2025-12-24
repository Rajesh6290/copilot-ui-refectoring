"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Eye,
  EyeOff,
  Key,
  Lock,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SkeletonLoader = () => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
    </div>
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-4 w-1/2 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
);

const ApiKey = () => {
  const { data, isValidating, mutate } = useSwr("api-subscriptions/secrets");
  const { isLoading: isGenerating, mutation: generateMutation } = useMutation();
  const { isLoading: isRefreshing, mutation: refreshMutation } = useMutation();
  const { isLoading: isDeleting, mutation: deleteMutation } = useMutation();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const createApiSubscription = async () => {
    try {
      const res = await generateMutation("api-subscriptions/init", {
        method: "POST",
        isAlert: false
      });
      if (res?.status === 200) {
        toast.success("API keys generated successfully");
        mutate();
      }
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };
  const refreshApiKeys = async () => {
    try {
      const res = await refreshMutation("api-subscriptions/refresh-keys", {
        method: "POST",
        isAlert: false
      });
      if (res?.status === 200) {
        toast.success("API keys refreshed successfully");
        mutate();
      }
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };
  const deleteApiSubscription = async () => {
    try {
      const res = await deleteMutation("api-subscriptions/delete", {
        method: "DELETE",
        isAlert: false
      });
      if (res?.status === 200) {
        toast.success("API keys deleted successfully");
        mutate();
      }
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };

  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success("API key copied to clipboard");
    } catch {
      toast.error("Could not copy API key to clipboard");
    }
  };
  const toggleKeyVisibility = (keyType: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyType)) {
        newSet.delete(keyType);
      } else {
        newSet.add(keyType);
      }
      return newSet;
    });
  };
  const maskApiKey = (key: string): string => {
    if (key.length <= 8) {
      return key;
    }
    return key.substring(0, 8) + "•".repeat(12) + key.substring(key.length - 4);
  };
  return (
    <div className="flex h-fit w-full flex-col gap-5 p-4 md:p-6">
      <div className="border-b border-gray-100 pb-5 dark:border-neutral-700">
        <div className="flex w-full flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Api Key Settings
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configure access control via API key
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-fit">
              <CustomButton
                onClick={refreshApiKeys}
                disabled={isRefreshing}
                className="w-fit !text-[0.7rem]"
                loading={isRefreshing}
                loadingText="Refreshing Api Key..."
                startIcon={<RefreshCw className="size-4" />}
              >
                Refresh API Key
              </CustomButton>
            </div>
            <div className="w-fit">
              <CustomButton
                onClick={deleteApiSubscription}
                disabled={isDeleting}
                loading={isDeleting}
                loadingText="Deleting..."
                className="w-fit !bg-red-500 !text-[0.7rem]"
                startIcon={<Trash2 className="size-4" />}
              >
                Delete API Key
              </CustomButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {isValidating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SkeletonLoader />
          </motion.div>
        ) : !data || data?.detail === "No subscription found for user" ? (
          <motion.div
            key="no-subscription"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            {/* Generate Subscription Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-tertiary-600 to-violet-600 shadow-2xl dark:from-gray-800 dark:to-gray-900">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative p-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <h2 className="flex items-center gap-4 text-3xl font-bold text-white">
                      <Zap className="h-8 w-8" />
                      Create API Subscription
                    </h2>
                    <p className="text-lg text-white/80">
                      Initialize your API subscription to start building amazing
                      applications
                    </p>
                  </div>
                  <button
                    onClick={createApiSubscription}
                    disabled={isGenerating}
                    className="flex items-center space-x-3 rounded-2xl bg-white/20 px-8 py-4 font-semibold text-white shadow-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-6 w-6" />
                        <span>Create Subscription</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div className="py-16 text-center">
              <div className="mb-8 inline-flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <Key className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="mb-4 text-3xl font-semibold text-gray-700 dark:text-gray-300">
                No API Subscription
              </h3>
              <p className="mx-auto mb-8 max-w-md text-lg text-gray-500 dark:text-gray-400">
                Create your first API subscription to start managing your keys
                and accessing our services
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subscription-exists"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* API Keys Cards */}
            {data && data?.primaryKey && data?.secondaryKey && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Primary Key */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:border-neutral-800 dark:bg-darkSidebarBackground"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                      <Key className="h-5 w-5 text-indigo-500" />
                      Primary Key
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleKeyVisibility("primary")}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        {visibleKeys.has("primary") ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(data?.primaryKey)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-darkMainBackground">
                    <code className="font-mono break-all text-sm text-gray-800 dark:text-gray-200">
                      {visibleKeys.has("primary")
                        ? data.primaryKey
                        : maskApiKey(data.primaryKey)}
                    </code>
                  </div>
                </motion.div>

                {/* Secondary Key */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl dark:border-neutral-800 dark:bg-darkSidebarBackground"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                      <Lock className="h-5 w-5 text-purple-500" />
                      Secondary Key
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleKeyVisibility("secondary")}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        {visibleKeys.has("secondary") ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(data?.secondaryKey)}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-darkMainBackground">
                    <code className="font-mono break-all text-sm text-gray-800 dark:text-gray-200">
                      {visibleKeys.has("secondary")
                        ? data?.secondaryKey
                        : maskApiKey(data?.secondaryKey)}
                    </code>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Security Guidelines */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="rounded-2xl border border-l-4 border-amber-200 border-l-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg dark:border-amber-800 dark:border-l-amber-500 dark:from-amber-900/20 dark:to-orange-900/20"
            >
              <div className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                    <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-amber-800 dark:text-amber-200">
                      Security Best Practices
                    </h3>
                    <div className="grid gap-4 text-sm text-amber-700 dark:text-amber-300 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></div>
                          <span>
                            Never share API keys publicly or in client-side code
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></div>
                          <span>
                            Store keys securely using environment variables
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></div>
                          <span>
                            Rotate keys regularly for enhanced security
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400"></div>
                          <span>
                            Monitor usage and delete unused keys promptly
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ApiKey;
