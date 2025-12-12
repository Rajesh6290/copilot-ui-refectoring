"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const Slack = () => {
  const params = useSearchParams();
  const router = useRouter();
  const code = params.get("code");
  const state = params.get("state");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);
  const hasRequestedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchStatus = async () => {
    if (hasRequestedRef.current) {
      return;
    }

    try {
      hasRequestedRef.current = true;
      setStatus("loading");
      const res = await fetch(
        `/api/cv/v1/integrations/slack/oauth/callback?code=${code}&state=${state}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStatus("success");
        setMessage(data.message || "Integration completed successfully!");
        toast.success(data.message || "Integration completed successfully!");

        let counter = 5;
        timerRef.current = setInterval(() => {
          counter--;
          setCountdown(counter);
          if (counter === 0) {
            clearInterval(timerRef.current!);

            if (window.opener && !window.opener.closed) {
              window.opener.postMessage(
                {
                  type: "INTEGRATION_SUCCESS",
                  message: data.message || "Integration completed successfully!"
                },
                "*"
              );
              window.close();
            } else {
              router.push("/system-settings?system-settings-tab=integration");
            }
          }
        }, 1000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to complete integration");
      }
    } catch (error) {
      setStatus("error");
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (code && state && !hasRequestedRef.current) {
      fetchStatus();
    } else if (!code || !state) {
      setStatus("error");
      setMessage("Missing required parameters");
      toast.error("Missing required parameters");
    }
  }, [code, state]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const progressVariants = {
    initial: { width: "0%" },
    animate: {
      width: `${((5 - countdown) / 5) * 100}%`,
      transition: {
        duration: 1,
        ease: "linear"
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10 dark:border-slate-700/50 dark:bg-slate-800/80">
          <AnimatePresence mode="wait">
            {/* Loading State */}
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="mx-auto h-16 w-16"
                  >
                    <div className="h-16 w-16 rounded-full border-4 border-slate-200 border-t-blue-500 dark:border-slate-600 dark:border-t-blue-400"></div>
                  </motion.div>
                </div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-3 text-2xl font-bold text-slate-800 dark:text-white"
                >
                  Setting up Integration
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-600 dark:text-slate-300"
                >
                  Please wait while we configure your Slack integration...
                </motion.p>
              </motion.div>
            )}

            {/* Success State */}
            {status === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-6"
                >
                  <div className="relative mx-auto h-20 w-20">
                    <motion.div
                      variants={pulseVariants}
                      animate="pulse"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white dark:bg-slate-800">
                      <svg
                        className="h-8 w-8 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <motion.path
                          variants={checkmarkVariants}
                          initial="hidden"
                          animate="visible"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-3 text-2xl font-bold text-slate-800 dark:text-white"
                >
                  🎉 Integration Successful!
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6 text-slate-600 dark:text-slate-300"
                >
                  {message}
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-slate-700 dark:to-slate-600"
                >
                  <p className="mb-3 text-sm text-slate-700 dark:text-slate-200">
                    Redirecting to settings in{" "}
                    <motion.span
                      key={countdown}
                      initial={{ scale: 1.2, color: "#3b82f6" }}
                      animate={{ scale: 1, color: "#1e40af" }}
                      className="font-bold text-blue-600 dark:text-blue-400"
                    >
                      {countdown}
                    </motion.span>{" "}
                    seconds...
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                    <motion.div
                      variants={progressVariants}
                      initial="initial"
                      animate="animate"
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    />
                  </div>
                </motion.div>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    router.push(
                      "/system-settings?system-settings-tab=integration"
                    )
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-800"
                >
                  Go to Settings Now
                </motion.button>
              </motion.div>
            )}

            {/* Error State */}
            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-6"
                >
                  <div className="relative mx-auto h-20 w-20">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-rose-500"
                    />
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white dark:bg-slate-800">
                      <svg
                        className="h-8 w-8 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-3 text-2xl font-bold text-slate-800 dark:text-white"
                >
                  Integration Failed
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6 text-slate-600 dark:text-slate-300"
                >
                  {message}
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      hasRequestedRef.current = false;
                      setStatus("loading");
                      fetchStatus();
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-800"
                  >
                    Try Again
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      router.push(
                        "/system-settings?system-settings-tab=integration"
                      )
                    }
                    className="w-full rounded-xl bg-slate-200 px-6 py-3 font-semibold text-slate-800 shadow-md transition-all duration-200 hover:bg-slate-300 hover:shadow-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 dark:focus:ring-offset-slate-800"
                  >
                    Back to Settings
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Slack;
