import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";

const InitialLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <motion.div
      className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 text-center shadow-xl backdrop-blur-md dark:border-gray-700/20 dark:bg-gray-800/70 sm:p-10"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className="relative z-10 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-600 shadow-lg sm:mb-8 sm:h-16 sm:w-16"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.svg
          className="h-7 w-7 text-white sm:h-8 sm:w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </motion.svg>
      </motion.div>

      <motion.div
        className="mb-6 flex justify-center sm:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <LoadingSpinner size="large" />
      </motion.div>

      <motion.h2
        className="mb-2 text-xl font-bold text-gray-900 dark:text-white sm:mb-3 sm:text-2xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Initializing Authentication
      </motion.h2>

      <motion.p
        className="text-sm text-gray-600 dark:text-gray-400 sm:text-base"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Setting up your secure session...
      </motion.p>
    </motion.div>
  </div>
);
export default InitialLoading;
