"use client";
import CustomButton from "@/shared/core/CustomButton";
import useSwr from "@/shared/hooks/useSwr";
import { Drawer } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  MapPin,
  User,
  X
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";

const RiskDetails = ({
  open,
  onClose,
  riskId
}: {
  open: boolean;
  onClose: () => void;
  riskId: string;
}) => {
  const router = useRouter();
  const { data, isValidating } = useSwr(
    riskId ? `risk?doc_id=${riskId}` : null
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"controls" | "audit">("controls");

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-5 sm:space-y-6">
      <div className="h-fit w-full px-4 sm:px-5 lg:px-6">
        <div className="flex h-fit w-full flex-col gap-5 rounded-xl bg-white p-5 shadow-lg dark:bg-darkSidebarBackground sm:gap-6 sm:p-6">
          <div className="h-7 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex w-full flex-col gap-2.5">
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-5 w-full rounded bg-gray-100 dark:bg-gray-600"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="relative flex h-dvh w-full flex-col gap-4 overflow-y-auto bg-white dark:bg-darkMainBackground sm:w-[28rem] sm:gap-5 md:w-[32rem] lg:w-[40rem]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex w-full shrink-0 items-center justify-between bg-tertiary px-4 py-2.5 sm:px-6 sm:py-3"
        >
          <p className="min-w-0 flex-1 break-words pr-3 text-base font-bold text-white sm:text-lg md:text-xl">
            Risk Details
          </p>
          <motion.span
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white transition-all duration-200 hover:bg-gray-100 sm:size-8"
          >
            <X className="text-primary" size={18} />
          </motion.span>
        </motion.div>

        {/* Content */}
        {isValidating ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-fit w-full px-3 sm:px-4"
            >
              <div className="flex h-fit w-full flex-col gap-4 rounded-lg bg-white p-4 drop-shadow-3 transition-all duration-300 hover:drop-shadow-4 dark:bg-darkSidebarBackground sm:gap-5 sm:p-5">
                <p className="font-satoshi text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Details
                </p>

                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex w-full flex-col gap-1.5 sm:gap-2"
                >
                  <p className="text-xs font-normal text-gray-400 sm:text-sm">
                    Title
                  </p>
                  <p className="break-words text-xs font-normal text-gray-400 sm:text-sm">
                    {data?.name}
                  </p>
                </motion.span>

                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex w-full flex-col gap-1.5 sm:gap-2"
                >
                  <p className="text-xs font-normal text-gray-400 sm:text-sm">
                    Description
                  </p>
                  <p className="break-words text-xs font-normal text-gray-400 sm:text-sm">
                    {data?.description}
                  </p>
                </motion.span>

                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex w-full flex-col gap-1.5 sm:gap-2"
                >
                  <p className="text-xs font-normal text-gray-400 sm:text-sm">
                    Categories
                  </p>
                  <p className="break-words text-xs font-normal capitalize text-gray-400 sm:text-sm">
                    {data?.risk_category}
                  </p>
                </motion.span>

                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="flex w-full flex-col gap-1.5 sm:gap-2"
                >
                  <p className="text-xs font-normal text-gray-400 sm:text-sm">
                    Risk Owner
                  </p>
                  <p className="break-words text-xs font-normal text-gray-400 sm:text-sm">
                    {data?.risk_owner || "Not Provided"}
                  </p>
                </motion.span>
              </div>
            </motion.div>

            {/* Tabs Section */}
            {(data?.controls?.length > 0 || data?.audit_trail?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-fit w-full px-3 sm:px-4"
              >
                <div className="flex h-fit w-full flex-col gap-4 rounded-lg bg-white p-4 drop-shadow-3 transition-all duration-300 hover:drop-shadow-4 dark:bg-darkSidebarBackground sm:gap-5 sm:p-5">
                  {/* Tab Headers */}
                  <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveTab("controls")}
                      className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 sm:text-base ${
                        activeTab === "controls"
                          ? "text-tertiary"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      }`}
                    >
                      Mapped Controls
                      {activeTab === "controls" && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("audit")}
                      className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 sm:text-base ${
                        activeTab === "audit"
                          ? "text-tertiary"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      }`}
                    >
                      Audit Trail
                      {activeTab === "audit" && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-tertiary"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        />
                      )}
                    </button>
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    {activeTab === "controls" ? (
                      <motion.div
                        key="controls"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 sm:space-y-4"
                      >
                        {data?.controls?.map(
                          (
                            item: {
                              id: string;
                              name: string;
                              description: string;
                              readiness_status: string;
                              doc_id: string;
                            },
                            index: number
                          ) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * index, duration: 0.4 }}
                              className="rounded-lg bg-white drop-shadow-3 transition-all duration-300 hover:drop-shadow-4 dark:bg-gray-800"
                            >
                              <button
                                onClick={() => toggleAccordion(index)}
                                className="flex w-full items-center justify-between gap-3 p-3 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:p-4"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                                  <motion.span
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 sm:size-8 ${
                                      item?.readiness_status === "ready"
                                        ? "bg-green-50 text-green-500"
                                        : "bg-red-100 text-red-500"
                                    } `}
                                  >
                                    {item?.readiness_status !== "ready" ? (
                                      <CircleX
                                        size={18}
                                        className="sm:h-5 sm:w-5"
                                      />
                                    ) : (
                                      <CircleCheck
                                        size={18}
                                        className="sm:h-5 sm:w-5"
                                      />
                                    )}
                                  </motion.span>
                                  <span className="break-words font-satoshi text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                                    {item?.name}
                                  </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                                  <span
                                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all duration-200 sm:px-4 sm:py-2 ${
                                      item?.readiness_status === "ready"
                                        ? "bg-green-50 text-green-500"
                                        : "bg-red-100 text-red-500"
                                    } `}
                                  >
                                    {item?.readiness_status !== "ready" ? (
                                      <X
                                        size={13}
                                        className="sm:h-3.5 sm:w-3.5"
                                      />
                                    ) : (
                                      <Check
                                        size={13}
                                        className="sm:h-3.5 sm:w-3.5"
                                      />
                                    )}{" "}
                                    <span className="hidden sm:inline">
                                      {item?.id}
                                    </span>
                                  </span>
                                  <motion.span
                                    animate={{
                                      rotate: openIndex === index ? 90 : 0
                                    }}
                                    transition={{
                                      duration: 0.3,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    <ChevronRight
                                      className="text-tertiary"
                                      size={18}
                                    />
                                  </motion.span>
                                </div>
                              </button>
                              <motion.div
                                initial={false}
                                animate={{
                                  height: openIndex === index ? "auto" : 0,
                                  opacity: openIndex === index ? 1 : 0
                                }}
                                transition={{
                                  duration: 0.4,
                                  ease: "easeInOut"
                                }}
                                className="overflow-hidden"
                              >
                                <div className="break-words px-3 pb-3 text-xs font-normal text-gray-400 dark:text-gray-300 sm:px-4 sm:pb-4 sm:text-sm">
                                  {item?.description}
                                </div>
                                <div className="-mt-2 flex w-full items-center justify-end pb-2 pr-2 sm:-mt-3">
                                  <div className="w-fit">
                                    <CustomButton
                                      className="!px-3 !py-1.5 !text-[0.65rem] transition-all duration-200 hover:scale-105 sm:!text-[0.7rem]"
                                      onClick={() =>
                                        router.push(
                                          `/compliance/controls/${item?.doc_id}`
                                        )
                                      }
                                    >
                                      Go to Control
                                    </CustomButton>
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          )
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="audit"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        {data?.audit_trail && data.audit_trail.length > 0 ? (
                          <div className="relative space-y-0">
                            {/* Timeline Line */}
                            <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gradient-to-b from-tertiary via-purple-500 to-pink-500 sm:left-5"></div>

                            {data.audit_trail.flat().map(
                              (
                                entry: {
                                  action: string;
                                  action_by: string;
                                  action_at: string;
                                  ip: string;
                                  status: string;
                                },
                                index: number
                              ) => {
                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      delay: 0.15 * index,
                                      duration: 0.5
                                    }}
                                    className="relative flex gap-4 pb-6 sm:gap-6"
                                  >
                                    {/* Timeline Dot */}
                                    <div className="relative z-10 flex flex-col items-center">
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                          delay: 0.15 * index + 0.3,
                                          type: "spring",
                                          stiffness: 200
                                        }}
                                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-tertiary/20 dark:bg-gray-800 sm:size-10"
                                      >
                                        <motion.div
                                          animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 180, 360]
                                          }}
                                          transition={{
                                            delay: 0.15 * index + 0.5,
                                            duration: 0.8,
                                            ease: "easeInOut"
                                          }}
                                        >
                                          <Clock className="size-4 text-tertiary sm:size-5" />
                                        </motion.div>
                                      </motion.div>
                                    </div>

                                    {/* Content Card */}
                                    <motion.div
                                      whileHover={{ scale: 1.02, x: 5 }}
                                      className="flex-1 rounded-lg bg-gradient-to-br from-white to-gray-50 p-4 shadow-md transition-all duration-300 hover:shadow-xl dark:from-gray-800 dark:to-gray-800/80 sm:p-5"
                                    >
                                      {/* Header */}
                                      <div className="mb-3 flex items-start justify-between">
                                        <div>
                                          <h4 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                                            {entry.action}
                                          </h4>
                                          {entry.status && (
                                            <span className="mt-1.5 inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs font-semibold capitalize text-white shadow-sm">
                                              {entry?.status?.replace(
                                                /_/g,
                                                " "
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Info Grid */}
                                      <div className="space-y-2.5">
                                        {/* User */}
                                        <div className="flex items-center gap-3 rounded-md bg-white/60 p-3 backdrop-blur-sm dark:bg-gray-700/40">
                                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tertiary to-purple-600">
                                            <User className="size-4 text-white" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                              Modified by
                                            </p>
                                            <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                              {entry.action_by ||
                                                "Unknown User"}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Time and IP */}
                                        <div className="grid gap-2.5 sm:grid-cols-2">
                                          <div className="flex items-center gap-2 rounded-md bg-white/60 p-3 backdrop-blur-sm dark:bg-gray-700/40">
                                            <Clock className="size-4 shrink-0 text-tertiary" />
                                            <div className="min-w-0">
                                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                Time
                                              </p>
                                              <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                                                {formatDate(entry.action_at)}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2 rounded-md bg-white/60 p-3 backdrop-blur-sm dark:bg-gray-700/40">
                                            <MapPin className="size-4 shrink-0 text-tertiary" />
                                            <div className="min-w-0">
                                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                IP Address
                                              </p>
                                              <p className="font-mono truncate text-xs font-semibold text-gray-900 dark:text-white">
                                                {entry.ip || "N/A"}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </motion.div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                              <Clock className="size-8 text-gray-400 dark:text-gray-600" />
                            </div>
                            <p className="text-base font-semibold text-gray-900 dark:text-white">
                              No Audit Trail
                            </p>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              No changes have been recorded yet
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
};

export default RiskDetails;
