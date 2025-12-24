"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
interface Framework {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  color: string;
  badge: string;
}

const frameworks: Framework[] = [
  {
    id: "NIST",
    name: "NIST",
    imageUrl: "/api/placeholder/64/64",
    description: "NIST AI Risk Management Framework",
    color: "from-blue-500 to-blue-700",
    badge: "Cybersecurity"
  },
  {
    id: "EURO_AI",
    name: "EURO_AI",
    imageUrl: "/api/placeholder/64/64",
    description: "EURO AI Act",
    color: "from-purple-500 to-purple-700",
    badge: "AI Regulation"
  },
  {
    id: "HAIGS_AI",
    name: "HAIGS_AI",
    imageUrl: "/api/placeholder/64/64",
    description: "Healthcare AI Governance Standard (HAIGS)",
    color: "from-green-500 to-green-700",
    badge: "Healthcare AI"
  },
  {
    id: "NSW_AI",
    name: "NSW_AI",
    imageUrl: "/api/placeholder/64/64",
    description: "NSW AI Assessment Framework",
    color: "from-amber-500 to-amber-700",
    badge: "InfoSec"
  },
  {
    id: "Voluntary_AI",
    name: "Voluntary_AI",
    imageUrl: "/api/placeholder/64/64",
    description: "Voluntary AI Safety Standard",
    color: "from-amber-500 to-amber-700",
    badge: "InfoSec"
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const cardTap = {
  scale: 0.97,
  transition: { duration: 0.2, ease: "easeInOut" }
};

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <div className="grid h-full grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl bg-white shadow-md dark:bg-gray-800"
        >
          <div className="flex h-full min-h-[120px] sm:min-h-[140px]">
            {/* Left letter area */}
            <div className="h-full w-16 rounded-l-xl bg-gray-200 dark:bg-gray-700 sm:w-20 md:w-24"></div>
            {/* Right content area */}
            <div className="flex flex-1 flex-col justify-center p-3 sm:p-4">
              <div className="mb-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700 sm:h-5 sm:w-1/3"></div>
              <div className="mb-1 h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700 sm:h-4 sm:w-2/3"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700 sm:h-4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
interface IsAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        update: boolean;
        delete: boolean;
        create: boolean;
      };
    };
  }[];
}
// ComplianceFramework component
const ComplianceFramework = ({ isAccess }: { isAccess: IsAccess }) => {
  const { isLoading, mutation } = useMutation();
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const { data, isValidating, mutate } = useSwr("get-user-frameworks");
  const handleSelectFramework = (id: string): void => {
    if (selectedFrameworks.includes(id)) {
      setSelectedFrameworks(selectedFrameworks.filter((fid) => fid !== id));
    } else {
      setSelectedFrameworks([...selectedFrameworks, id]);
    }
  };

  // Handle save action
  const handleSave = async () => {
    try {
      const res = await mutation("update-framework", {
        method: "PUT",
        isAlert: false,
        body: selectedFrameworks
      });
      if (res?.status === 200) {
        mutate();
        toast.success("Frameworks updated successfully");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  useEffect(() => {
    if (!isValidating) {
      if (data?.framework?.length > 0) {
        setSelectedFrameworks(data?.framework);
      } else {
        setSelectedFrameworks(["NIST", "EURO_AI"]);
      }
    }
  }, [isValidating, data]);

  return (
    <div className="flex h-fit w-full flex-col gap-4 rounded-xl p-4 sm:gap-6 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-3 dark:border-gray-700 sm:pb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
          Compliance Frameworks
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 sm:mt-2">
          Select one or more regulatory frameworks to ensure compliance with
          industry standards
        </p>
      </div>

      {/* Skeleton Loader or Framework Grid */}
      {isValidating ? (
        <SkeletonLoader />
      ) : (
        <motion.div
          className="grid h-full grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {frameworks.map((framework: Framework) => (
            <motion.div
              key={framework.id}
              variants={itemVariants}
              className={`relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 ${
                selectedFrameworks.includes(framework.id)
                  ? "shadow-lg ring-2 ring-tertiary"
                  : "hover:shadow-lg"
              }`}
              onClick={() => handleSelectFramework(framework.id)}
              whileTap={cardTap}
              aria-label={`Select ${framework.name} framework`}
            >
              <div className="flex h-full min-h-[120px] cursor-pointer sm:min-h-[140px]">
                {/* Left letter area - Responsive width */}
                <div className="relative flex h-full w-16 flex-shrink-0 items-center justify-center bg-gradient-to-br from-tertiary-500 to-tertiary sm:w-20 md:w-24 lg:w-28">
                  <div className="text-center text-sm font-bold leading-tight text-white sm:text-lg md:text-xl lg:text-2xl">
                    {framework.name.includes(" ")
                      ? framework.name
                          .split(" ")
                          .map((word) => word.charAt(0))
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : framework.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                {/* Right content area */}
                <div className="relative flex min-w-0 flex-1 flex-col justify-center p-3 sm:p-4">
                  {/* Checkbox */}
                  <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
                    <div
                      className={`h-4 w-4 rounded border-2 sm:h-5 sm:w-5 ${
                        selectedFrameworks.includes(framework.id)
                          ? "border-tertiary-500 bg-tertiary-500"
                          : "border-gray-300 bg-white dark:border-gray-500 dark:bg-gray-700"
                      } flex flex-shrink-0 items-center justify-center`}
                    >
                      {selectedFrameworks.includes(framework.id) && (
                        <motion.svg
                          className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      )}
                    </div>
                  </div>

                  {/* Framework name */}
                  <h4 className="pr-6 text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100 sm:pr-8 sm:text-base">
                    {framework?.name?.replace(/_/g, " ")}
                  </h4>

                  {/* Description */}
                  <p className="mt-1 line-clamp-2 pr-6 text-xs leading-relaxed text-gray-600 dark:text-gray-300 sm:mt-2 sm:pr-8 sm:text-sm">
                    {framework.description}
                  </p>

                  {/* Status indicator */}
                  <div className="mt-2 flex items-center sm:mt-3">
                    <span
                      className={`mr-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-br sm:mr-2 sm:h-2 sm:w-2 ${
                        selectedFrameworks.includes(framework.id)
                          ? "from-green-500 to-green-600"
                          : "from-violet-600 to-indigo-600"
                      } flex-shrink-0`}
                    ></span>
                    <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {selectedFrameworks.includes(framework.id)
                        ? "Selected"
                        : "Select to comply"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Save Button */}
      {isAccess?.buttons?.[0]?.permission?.is_shown && (
        <div className="mt-4 flex justify-end sm:mt-6">
          <div className="w-full sm:w-auto">
            <CustomButton
              onClick={handleSave}
              disabled={
                selectedFrameworks.length === 0 ||
                isValidating ||
                !isAccess?.buttons?.[0]?.permission?.actions?.update
              }
              loading={isLoading}
              loadingText="Saving..."
              className="w-full sm:w-auto"
            >
              Save Frameworks
            </CustomButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceFramework;
