import { motion } from "framer-motion";
import React from "react";

const ArcherStepper: React.FC<{
  steps: { id: number; title: string; description: string }[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}> = ({ steps, currentStep, setCurrentStep }) => {
  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step Container */}
              <div
                tabIndex={0}
                role="button"
                onClick={() => isCompleted && setCurrentStep(step?.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (isCompleted) {
                      setCurrentStep(step?.id);
                    }
                  }
                }}
                className={`relative flex flex-1 flex-col items-center duration-300 ${
                  isCompleted
                    ? "cursor-pointer hover:scale-105"
                    : isCurrent
                      ? "cursor-default"
                      : "cursor-not-allowed"
                } `}
              >
                {/* Circle */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1 : 0.9
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full border-4 text-lg font-bold transition-all duration-300 ${
                      isCompleted
                        ? "border-green-500 bg-green-500 text-white shadow-lg"
                        : isCurrent
                          ? "border-tertiary-500 bg-tertiary-500 text-white shadow-lg shadow-tertiary-500/50"
                          : "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-7 w-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                </motion.div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? "text-tertiary-600 dark:text-tertiary-400"
                        : isCompleted
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className="relative mx-3 flex-1"
                  style={{ marginTop: "-50px" }}
                >
                  <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <motion.div
                      initial={false}
                      animate={{
                        width: currentStep > step.id ? "100%" : "0%"
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className={`h-full ${
                        currentStep > step.id + 1
                          ? "bg-green-500"
                          : "bg-tertiary-500"
                      }`}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
export default ArcherStepper;
