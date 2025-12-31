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
  Loader2,
  X
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";

// Skeleton Components
const SkeletonLine = ({
  width = "100%",
  height = "16px"
}: {
  width?: string;
  height?: string;
}) => (
  <div
    className="animate-pulse rounded bg-gray-200"
    style={{ width, height }}
  />
);

const DetailsSkeleton = () => (
  <div className="flex h-fit w-full flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4 drop-shadow-lg sm:gap-5 sm:p-5">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="flex w-full flex-col gap-2">
        <SkeletonLine width="30%" height="14px" />
        <SkeletonLine width="80%" height="18px" />
      </div>
    ))}
  </div>
);

const ControlsSkeleton = () => (
  <div className="flex h-fit w-full flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4 drop-shadow-lg sm:gap-5 sm:p-5">
    <SkeletonLine width="40%" height="24px" />
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="rounded-lg border border-gray-100 bg-gray-50 p-3 sm:p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200 sm:h-8 sm:w-8" />
            <SkeletonLine width="150px" height="20px" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-12 animate-pulse rounded bg-gray-200 sm:w-16" />
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
// Helper Component for Detail Items
const DetailItem = ({
  label,
  value,
  isDescription = false
}: {
  label: string;
  value: string;
  isDescription?: boolean;
}) => (
  <div className="flex w-full flex-col gap-1.5 sm:gap-2">
    <p className="text-xs font-semibold capitalize tracking-wide text-gray-700 sm:text-sm">
      {label}
    </p>
    <p
      className={`break-words text-xs font-normal text-gray-600 sm:text-sm ${isDescription ? "leading-relaxed" : ""}`}
    >
      {value || `No ${label.toLowerCase()} available`}
    </p>
  </div>
);

const FrameworkControlDetails = ({
  open,
  onClose,
  controlId
}: {
  open: boolean;
  onClose: () => void;
  controlId: string;
}) => {
  const router = useRouter();
  const { data, isValidating } = useSwr(
    controlId ? `requirement?doc_id=${controlId}` : ""
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getStatusColor = (status: string) => {
    return status === "ready"
      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
      : "bg-red-50 text-red-600 border-red-200";
  };

  const getIconBgColor = (status: string) => {
    return status === "ready"
      ? "bg-emerald-100 text-emerald-600"
      : "bg-red-100 text-red-600";
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.12)",
          width: "100%",
          maxWidth: { xs: "100%", sm: "28rem", lg: "42rem" }
        }
      }}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative flex h-dvh w-full flex-col gap-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white sm:gap-6"
      >
        {/* Header */}
        <div className="flex w-full items-center justify-between bg-tertiary px-4 py-3 shadow-lg sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-6 w-1.5 rounded-full bg-white opacity-80 sm:h-8 sm:w-2" />
            <h1 className="text-base font-bold text-white sm:text-xl">
              Requirement Details
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 sm:size-9"
          >
            <X className="text-white" size={18} />
          </motion.button>
        </div>

        <div className="flex flex-col gap-4 px-4 pb-6 sm:gap-6 sm:px-6">
          {/* Loading State */}
          {isValidating && !data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 sm:gap-6"
            >
              <DetailsSkeleton />
              <ControlsSkeleton />
            </motion.div>
          )}

          {/* Main Content */}
          <AnimatePresence>
            {data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 sm:gap-6"
              >
                {/* Details Card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-fit w-full flex-col gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl sm:gap-6 sm:rounded-xl sm:p-6"
                >
                  <div className="grid grid-cols-1 gap-4 sm:gap-5">
                    <DetailItem label="Name" value={data?.requirement_name} />
                    <DetailItem label="Title" value={data?.requirement_name} />
                    <DetailItem
                      label="Description"
                      value={data?.description}
                      isDescription
                    />
                    <DetailItem
                      label="Framework Category"
                      value={data?.framework_category}
                    />
                  </div>
                </motion.div>

                {/* Controls Card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex h-fit w-full flex-col gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl sm:gap-5 sm:rounded-xl sm:p-6"
                >
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500 sm:h-6" />
                    <h2 className="font-satoshi text-lg font-semibold text-gray-900 sm:text-xl">
                      Mapped Controls
                    </h2>
                    {data?.controls?.length > 0 && (
                      <span className="ml-auto rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 sm:px-3 sm:text-sm">
                        {data.controls.length}{" "}
                        {data.controls.length === 1 ? "Control" : "Controls"}
                      </span>
                    )}
                  </div>

                  {data?.controls?.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {data.controls.map(
                        (
                          item: {
                            name: string;
                            doc_id: string;
                            description: string;
                            readiness_status: string;
                          },
                          index: number
                        ) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 transition-all duration-200 hover:border-gray-300 sm:rounded-xl"
                          >
                            <motion.button
                              whileHover={{
                                backgroundColor: "rgb(249, 250, 251)"
                              }}
                              onClick={() => toggleAccordion(index)}
                              className="flex w-full items-center justify-between p-3 text-left transition-colors sm:p-5"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
                                <motion.span
                                  whileHover={{ scale: 1.1 }}
                                  className={`flex size-8 flex-shrink-0 items-center justify-center rounded-full ${getIconBgColor(item?.readiness_status)} shadow-sm sm:size-10`}
                                >
                                  {item?.readiness_status !== "ready" ? (
                                    <CircleX size={18} className="sm:hidden" />
                                  ) : (
                                    <CircleCheck
                                      size={18}
                                      className="sm:hidden"
                                    />
                                  )}
                                  {item?.readiness_status !== "ready" ? (
                                    <CircleX
                                      size={22}
                                      className="hidden sm:block"
                                    />
                                  ) : (
                                    <CircleCheck
                                      size={22}
                                      className="hidden sm:block"
                                    />
                                  )}
                                </motion.span>
                                <span className="truncate font-satoshi text-xs font-semibold text-gray-900 sm:text-sm lg:text-base">
                                  {item?.name}
                                </span>
                              </div>
                              <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
                                <span
                                  className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${getStatusColor(item?.readiness_status)}`}
                                >
                                  <span className="hidden sm:inline">
                                    {item?.readiness_status !== "ready" ? (
                                      <X size={16} />
                                    ) : (
                                      <Check size={16} />
                                    )}
                                  </span>
                                  <span className="whitespace-nowrap capitalize">
                                    {item?.readiness_status
                                      ?.replace("not_ready", "Not Ready")
                                      .replace("ready", "Ready") || "Pending"}
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
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <ChevronRight
                                    size={18}
                                    className="sm:hidden"
                                  />
                                  <ChevronRight
                                    size={20}
                                    className="hidden sm:block"
                                  />
                                </motion.span>
                              </div>
                            </motion.button>

                            <AnimatePresence>
                              {openIndex === index && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeInOut"
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3 sm:px-5 sm:pb-5">
                                    <div className="rounded-lg border border-gray-100 bg-white p-3 sm:p-4">
                                      <p className="mb-3 text-xs leading-relaxed text-gray-600 sm:mb-4 sm:text-sm">
                                        {item?.description ||
                                          "No description available"}
                                      </p>
                                      <div className="flex justify-end">
                                        <CustomButton
                                          className="bg-gradient-to-r from-indigo-500 to-purple-500 !px-3 !py-1.5 !text-xs transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 sm:!px-4 sm:!py-2 sm:!text-sm"
                                          onClick={() =>
                                            router.push(
                                              `/compliance/controls/${item?.doc_id}?_name=${item?.name}`
                                            )
                                          }
                                        >
                                          View Details
                                        </CustomButton>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      )}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-8 text-center sm:py-12"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 sm:mb-4 sm:h-16 sm:w-16">
                        <CircleX className="text-gray-400" size={24} />
                      </div>
                      <p className="mb-1 text-sm font-medium text-gray-700 sm:mb-2 sm:text-base">
                        No Mapped Controls Found
                      </p>
                      <p className="px-4 text-xs text-gray-500 sm:text-sm">
                        {` This requirement doesn't have any associated controls
                        yet.`}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent Loading Indicator */}
          {isValidating && data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed bottom-4 right-4 rounded-full border border-gray-200 bg-white p-2.5 shadow-lg sm:bottom-6 sm:right-6 sm:p-3"
            >
              <Loader2 className="animate-spin text-indigo-500" size={18} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </Drawer>
  );
};

export default FrameworkControlDetails;
