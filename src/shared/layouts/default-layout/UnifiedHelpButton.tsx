"use client";
import useMutation from "@/shared/hooks/useMutation";
import { useUser } from "@clerk/nextjs";
import Intercom from "@intercom/messenger-js-sdk";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react";
import {
  RiCloseLine,
  RiCustomerService2Fill,
  RiQuestionLine,
  RiRobot2Line
} from "react-icons/ri";
import { toast } from "sonner";

const UnifiedHelpButton = ({
  setHelpOpen,
  helpOpen,
  setSessionId,
  userId,
  setHelpOpenMax
}: {
  setHelpOpen: Dispatch<SetStateAction<boolean>>;
  helpOpen: boolean;
  setSessionId: Dispatch<SetStateAction<string>>;
  userId: string;
  setHelpOpenMax: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isIntercomInitialized, setIsIntercomInitialized] = useState(false);
  const { isLoading, mutation } = useMutation();
  const { user } = useUser();

  useEffect(() => {
    if (user && !isIntercomInitialized) {
      try {
        const intercomConfig: {
          app_id: string;
          hide_default_launcher: boolean;
          user_id?: string;
          name?: string;
          email?: string;
        } = {
          app_id: "m4ovt1ip",
          hide_default_launcher: true
        };

        const userIds = user?.publicMetadata?.["user_id"];
        if (typeof userIds === "string") {
          intercomConfig.user_id = userIds;
        }

        if (user?.fullName) {
          intercomConfig.name = user.fullName;
        }

        if (user?.primaryEmailAddress?.emailAddress) {
          intercomConfig.email = user.primaryEmailAddress.emailAddress;
        }

        Intercom(intercomConfig);
        setIsIntercomInitialized(true);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    }
  }, [user, isIntercomInitialized]);

  const handleAIAssistant = useCallback(async () => {
    try {
      const res = await mutation("conversation/chat_id", {
        method: "POST",
        body: { user_id: userId }
      });
      if (res?.status === 200) {
        if (res?.results?.session_id) {
          setSessionId(res?.results?.session_id);
          setHelpOpen(true);
          setHelpOpenMax(true);
          setIsExpanded(false);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  }, [userId, mutation, setSessionId, setHelpOpen, setHelpOpenMax]);

  const handleCustomerSupport = () => {
    if (isIntercomInitialized && typeof window !== "undefined") {
      try {
        if (window.Intercom) {
          window.Intercom("show");
        }
      } catch {
        toast.error("Unable to open customer support. Please try again.");
      }
    } else {
      toast.error(
        "Customer support is loading. Please wait a moment and try again."
      );
    }
    setIsExpanded(false);
  };

  if (helpOpen || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-6 z-50 hidden sm:block">
      <div className="relative flex flex-col items-end gap-3">
        <AnimatePresence>
          {isExpanded && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="flex items-center gap-3"
              >
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md"
                >
                  AI Assistant
                </motion.span>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAIAssistant}
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-tertiary text-white shadow-lg hover:bg-[#6160b0]"
                >
                  {isLoading ? (
                    <CircularProgress size={20} className="!text-white" />
                  ) : (
                    <RiRobot2Line size={22} />
                  )}
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md"
                >
                  Customer Support
                </motion.span>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCustomerSupport}
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#2563eb] text-white shadow-lg hover:bg-[#1d4ed8]"
                >
                  <RiCustomerService2Fill size={22} />
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="relative">
          {!isExpanded && (
            <>
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-tertiary"
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{
                    opacity: [0, 0.5, 0],
                    scale: [1, 1.5, 2],
                    borderWidth: ["2px", "1px", "0px"]
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.6,
                    repeat: Infinity,
                    repeatDelay: 0,
                    ease: "easeOut"
                  }}
                />
              ))}

              <motion.div
                className="absolute inset-0 rounded-full bg-tertiary blur-sm"
                animate={{
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.15, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </>
          )}

          <motion.div
            className="relative z-10 cursor-pointer overflow-hidden rounded-full bg-tertiary text-white shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            animate={{
              rotate: isExpanded ? 90 : 0,
              backgroundColor: isExpanded ? "#ef4444" : undefined
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <div className="flex size-10 items-center justify-center">
              <Tooltip
                title={isExpanded ? "Close" : "Help"}
                placement="left"
                arrow
              >
                <IconButton>
                  <AnimatePresence mode="wait">
                    {isExpanded ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <RiCloseLine
                          size={20}
                          className="text-white drop-shadow-md"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="help"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <RiQuestionLine
                          size={20}
                          className="text-white drop-shadow-md"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </IconButton>
              </Tooltip>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedHelpButton;
