import { motion } from "framer-motion";

const LoadingSpinner = ({
  size = "default"
}: {
  size?: "small" | "default" | "large";
}) => {
  const sizeClasses = {
    small: { container: "flex space-x-1", dot: "h-2 w-2" },
    default: { container: "flex space-x-1.5", dot: "h-3 w-3" },
    large: { container: "flex space-x-2", dot: "h-4 w-4" }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={currentSize.container}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${currentSize.dot} rounded-full bg-tertiary-600 dark:bg-tertiary-400`}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: [0.4, 0, 0.6, 1]
          }}
        />
      ))}
    </div>
  );
};
export default LoadingSpinner;
