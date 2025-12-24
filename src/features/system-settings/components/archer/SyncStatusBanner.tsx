import { motion } from "framer-motion";

const SyncStatusBanner = ({
  taskId
}: {
  status: string;
  taskId: string | null;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="mb-6 overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Animated Spinner */}
        <div className="relative flex h-10 w-10 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute h-10 w-10 rounded-full border-2 border-blue-200 border-t-blue-600 dark:border-blue-700 dark:border-t-blue-400"
          />
          <div className="h-4 w-4 rounded-full bg-blue-500"></div>
        </div>

        {/* Status Text */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            Sync in Progress
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Synchronizing data... Please wait
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="h-2 w-2 rounded-full bg-blue-500"
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-1 overflow-hidden bg-blue-100 dark:bg-blue-900/30">
        <motion.div
          animate={{
            x: ["-100%", "100%"]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        />
      </div>

      {taskId && (
        <div className="border-t border-blue-200 bg-blue-50/50 px-4 py-2 dark:border-blue-800 dark:bg-blue-900/10">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Task ID: <code className="font-mono">{taskId}</code>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default SyncStatusBanner;
