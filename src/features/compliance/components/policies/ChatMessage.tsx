"use client";
import MarkdownRenderer from "@/shared/common/MarkdownRenderer";
import useMutation from "@/shared/hooks/useMutation";
import { useResponsiveBreakpoints } from "@/shared/utils";
import { Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import {
  Bot,
  Clock,
  Copy,
  Download,
  Eye,
  FileDown,
  FileText,
  HelpCircle,
  Pencil,
  User
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { toast } from "sonner";
import { Message } from "./PolicyAssistant";
const OpenArtifact = dynamic(() => import("./OpenArtifact"), {
  ssr: false
});
interface ChatMessageProps extends Message {
  onEditDocument?: (messageId: string) => void;
  onViewDocument?: (messageId: string) => void;
  onGeneratePDF?: (messageId: string) => void;
  getActiveDocumentContent: () => string;
  currentView?: "chat" | "document";
  setCurrentView?: (view: "chat" | "document") => void;
  progressState?: {
    value: number;
    status: string;
    message?: string;
    isStreaming?: boolean;
  };
}

const ChatMessage = React.memo(
  ({
    id,
    query,
    response,
    isUser,
    timestamp,
    isLoading,
    isQuestion,
    isStreaming,
    isStreamingCompleted,
    onEditDocument,
    onViewDocument,
    onGeneratePDF,
    getActiveDocumentContent,
    currentView,
    setCurrentView,
    isDocument,
    progressState
  }: ChatMessageProps) => {
    const { isMobile } = useResponsiveBreakpoints();
    const textContentRef = useRef<HTMLDivElement>(null!);
    const documentLength = response?.length || 0;
    const tokenCount = documentLength ? Math.round(documentLength / 4) : 0;
    const readingTime = Math.max(1, Math.round(documentLength / 5 / 200));
    const [open, setOpen] = useState<boolean>(false);
    const { isLoading: saveLoading, mutation } = useMutation();
    useEffect(() => {
      if ((isStreaming || isStreamingCompleted) && textContentRef.current) {
        textContentRef.current.scrollTop = textContentRef.current.scrollHeight;
      }
    }, [response, isStreaming, isStreamingCompleted]);

    // Calculate completion percentage based on progress state if available
    const completionPercentage =
      progressState && isStreaming
        ? Math.min(98, progressState.value)
        : isStreaming
          ? Math.min(98, Math.ceil((tokenCount / (tokenCount + 200)) * 100))
          : 100;
    const handleSavedocument = async () => {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(response);
        const base64Content = btoa(String.fromCharCode(...data));

        const res = await mutation("policies/create-from-content", {
          method: "POST",
          body: {
            content: base64Content
          }
        });
        if (res?.status === 201) {
          toast.success("Document saved successfully");
        } else {
          toast.info("Document save failed");
        }
      } catch {
        toast.error("Failed to save document");
      }
    };
    if (isQuestion) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 flex w-full justify-start"
          data-message-id={id}
        >
          <div className="flex w-full items-start gap-3">
            <motion.div
              className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-tertiary-100 text-tertiary-600 dark:bg-tertiary-900/30 dark:text-tertiary-400"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(99, 102, 241, 0.2)",
                  "0 0 0 8px rgba(99, 102, 241, 0)",
                  "0 0 0 0 rgba(99, 102, 241, 0.2)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <HelpCircle size={18} />
            </motion.div>
            <motion.div
              className="relative w-auto max-w-[calc(100%-3rem)] rounded-xl border-2 border-tertiary-100 bg-tertiary-50 px-4 py-3.5 shadow-sm dark:border-tertiary-900/50 dark:bg-tertiary-900/20 dark:text-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <div className="break-words text-sm leading-relaxed text-gray-800 dark:text-gray-200 md:text-base">
                {response.split("").map((char, index) => (
                  <motion.span
                    key={`${id}-char-${index}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(0.8, index * 0.005), // Limit max delay for long text
                      duration: 0.2
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-end text-xs text-tertiary-600/70 dark:text-tertiary-400/70">
                <Clock size={12} className="mr-1" /> {timestamp}
              </div>
            </motion.div>
          </div>
        </motion.div>
      );
    }

    if ((isStreaming || isStreamingCompleted) && isDocument) {
      return (
        <div className="mb-6 flex w-full justify-start" data-message-id={id}>
          <OpenArtifact
            id={id}
            open={open}
            onClose={() => setOpen(false)}
            getActiveDocumentContent={getActiveDocumentContent}
            response={response}
            textContentRef={textContentRef}
            currentView={currentView || "chat"}
            onEditDocument={onEditDocument || (() => {})}
            onGeneratePDF={onGeneratePDF || (() => {})}
            onViewDocument={onViewDocument || (() => {})}
            setCurrentView={setCurrentView || (() => {})}
          />
          <div className="flex w-full items-start">
            {/* Bot avatar with enhanced pulsing animation during streaming */}
            <motion.div
              className="relative mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-tertiary-100 text-tertiary-600 dark:bg-tertiary-900/30 dark:text-tertiary-400"
              animate={
                isStreaming
                  ? {
                      boxShadow: [
                        "0 0 0 0 rgba(99, 102, 241, 0)",
                        "0 0 0 8px rgba(99, 102, 241, 0.15)",
                        "0 0 0 0 rgba(99, 102, 241, 0)"
                      ]
                    }
                  : {}
              }
              transition={
                isStreaming
                  ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                  : {}
              }
            >
              <Bot size={20} />
            </motion.div>
            {/* Document card with enhanced styling and full-width design */}
            <div className="flex w-full flex-col gap-2">
              <div
                className="ml-3 w-[calc(100%-3.5rem)] overflow-hidden rounded-xl bg-white shadow-lg transition-all dark:border dark:border-neutral-700/70 dark:bg-darkSidebarBackground dark:text-gray-100"
                style={{
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)"
                }}
              >
                {/* Header with dynamic status badge and improved styling */}
                <motion.div
                  className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-neutral-600/50"
                  animate={{
                    backgroundColor: isStreamingCompleted
                      ? "rgba(, 250, 251, 0.5)"
                      : "rgba(249, 250, 251, 0)"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    {isStreaming ? (
                      <div className="flex items-center gap-3">
                        {/* StatusMessage-style animation for left side */}
                        <div className="relative">
                          <motion.div
                            className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-100 to-tertiary-200 text-tertiary-600 dark:from-tertiary-900/70 dark:to-tertiary-800/50 dark:text-tertiary-400"
                            animate={{
                              boxShadow: [
                                "0 0 0 0 rgba(99, 102, 241, 0.2)",
                                "0 0 0 8px rgba(99, 102, 241, 0)",
                                "0 0 0 0 rgba(99, 102, 241, 0.2)"
                              ]
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <motion.div
                              initial={{ rotate: 0 }}
                              animate={{
                                rotate: [0, 5, 0, -5, 0],
                                scale: [1, 1.05, 1, 1.05, 1]
                              }}
                              transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <FileText size={22} />
                            </motion.div>
                          </motion.div>

                          {/* Orbiting dots */}
                          {[...Array(4)].map((_, i) => (
                            <motion.div
                              key={`orbit-${i}`}
                              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary-400 dark:bg-tertiary-500"
                              animate={{
                                x: Math.cos((i * Math.PI * 2) / 4) * 18,
                                y: Math.sin((i * Math.PI * 2) / 4) * 18,
                                opacity: [0.4, 1, 0.4],
                                scale: [0.6, 1, 0.6]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: "easeInOut"
                              }}
                            />
                          ))}
                        </div>

                        <div className="ml-1 flex flex-col">
                          <motion.div
                            className="flex items-center gap-1.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <motion.span
                              className="bg-gradient-to-r from-tertiary-600 to-tertiary-500 bg-clip-text text-sm font-semibold text-transparent dark:from-tertiary-400 dark:to-tertiary-300"
                              animate={{
                                filter: [
                                  "brightness(1)",
                                  "brightness(1.2)",
                                  "brightness(1)"
                                ]
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              Preparing your policy ready to go…
                            </motion.span>
                            <motion.span
                              animate={{
                                opacity: [0, 1, 1, 0]
                              }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                times: [0, 0.2, 0.8, 1],
                                ease: "easeInOut"
                              }}
                              className="text-tertiary-500 dark:text-tertiary-400"
                            >
                              ✨
                            </motion.span>
                          </motion.div>

                          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {/* Progress bar for streaming state */}
                            <div className="w-full max-w-[220px]">
                              <div className="flex justify-between text-xs">
                                <span
                                  className="font-medium"
                                  style={{
                                    color: `hsl(${225 + completionPercentage * 0.6}, ${70 + completionPercentage * 0.3}%, ${50 + completionPercentage * 0.2}%)`
                                  }}
                                >
                                  {Math.round(completionPercentage)}%
                                </span>
                                {isStreaming && (
                                  <span className="text-tertiary-500/80 dark:text-tertiary-400/80">
                                    Generating...
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-tertiary-500 to-tertiary-400 dark:from-tertiary-600 dark:to-tertiary-500"
                                  initial={{ width: "0%" }}
                                  animate={{
                                    width: `${completionPercentage}%`
                                  }}
                                  transition={{
                                    duration: 0.4,
                                    ease: "easeOut"
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {/* Enhanced completion indicator with confetti effect */}
                        <motion.div
                          className="relative flex h-12 w-12 items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          {/* Background ring with gradient fill */}
                          <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-100 to-tertiary-100 dark:from-green-900/30 dark:to-tertiary-900/30"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              delay: 0.1,
                              duration: 0.5,
                              ease: "easeOut"
                            }}
                          />

                          {/* Animated success checkmark */}
                          <motion.div
                            className="relative z-10 flex h-12 w-12 items-center justify-center"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              delay: 0.3,
                              type: "spring",
                              stiffness: 200,
                              damping: 12
                            }}
                          >
                            <motion.div
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{
                                pathLength: {
                                  delay: 0.3,
                                  duration: 0.6,
                                  ease: "easeOut"
                                },
                                opacity: { delay: 0.3, duration: 0.3 }
                              }}
                              className="relative"
                            >
                              <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-green-500 dark:text-green-400"
                              >
                                <motion.path
                                  d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{
                                    delay: 0.3,
                                    duration: 0.8,
                                    ease: "easeOut"
                                  }}
                                />
                                <motion.path
                                  d="M22 4L12 14.01l-3-3"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{
                                    delay: 0.8,
                                    duration: 0.5,
                                    ease: "easeOut"
                                  }}
                                />
                              </svg>
                            </motion.div>
                          </motion.div>

                          {/* Confetti particles */}
                          {Array.from({ length: 12 }).map((_, i) => (
                            <motion.div
                              key={`confetti-${i}`}
                              className="absolute h-1.5 w-1.5 rounded-sm"
                              style={{
                                backgroundColor:
                                  i % 4 === 0
                                    ? "#22c55e"
                                    : i % 4 === 1
                                      ? "#6366f1"
                                      : i % 4 === 2
                                        ? "#fcd34d"
                                        : "#ec4899",
                                top: "50%",
                                left: "50%",
                                zIndex: 0,
                                originX: "50%",
                                originY: "50%"
                              }}
                              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                              animate={{
                                x: (Math.random() - 0.5) * 40,
                                y: (Math.random() - 0.5) * 40,
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                rotate: Math.random() * 360
                              }}
                              transition={{
                                duration: 1 + Math.random() * 0.5,
                                delay: 0.8 + i * 0.05,
                                ease: [0.2, 0.9, 0.4, 1]
                              }}
                            />
                          ))}
                        </motion.div>

                        <div className="flex flex-col">
                          <motion.div
                            className="flex items-center gap-2"
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, type: "spring" }}
                          >
                            <span className="bg-gradient-to-r from-green-600 to-tertiary-600 bg-clip-text font-medium text-transparent dark:from-green-400 dark:to-tertiary-400">
                              Your policy is ready !
                            </span>
                          </motion.div>

                          <motion.div
                            className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, type: "spring" }}
                          >
                            <div className="flex items-center">
                              <Clock size={12} className="mr-1" />~{readingTime}{" "}
                              min read
                            </div>
                            {/* <div className="h-3 w-0.5 rounded-full bg-gray-300 dark:bg-gray-600"></div> */}
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Header Actions with consistent buttons */}
                  <div className="flex items-center gap-2">
                    {isStreamingCompleted && (
                      <motion.div
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        <Tooltip title="Edit document">
                          <motion.button
                            whileHover={{
                              scale: 1.15,
                              backgroundColor: "rgba(59, 130, 246, 0.15)",
                              color: "#3b82f6"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onEditDocument && onEditDocument(id)}
                            className="rounded-full bg-blue-50 p-3 text-blue-600 shadow-sm transition-colors duration-200 ease-in-out hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                            aria-label="Edit document"
                          >
                            <Pencil size={20} />
                          </motion.button>
                        </Tooltip>
                        <Tooltip title="View document">
                          <motion.button
                            whileHover={{
                              scale: 1.15,
                              backgroundColor: "rgba(59, 130, 246, 0.15)",
                              color: "#3b82f6"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              onViewDocument?.(id);
                              setOpen(true);
                            }}
                            className="rounded-full bg-blue-50 p-3 text-blue-600 shadow-sm transition-colors duration-200 ease-in-out hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                            aria-label="View document"
                          >
                            <Eye size={20} />
                          </motion.button>
                        </Tooltip>
                        <Tooltip title="Download as PDF">
                          <motion.button
                            whileHover={{
                              scale: 1.15,
                              backgroundColor: "rgba(59, 130, 246, 0.15)",
                              color: "#3b82f6"
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onGeneratePDF && onGeneratePDF(id)}
                            className="rounded-full bg-blue-50 p-3 text-blue-600 shadow-sm transition-colors duration-200 ease-in-out hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                            aria-label="Download as PDF"
                          >
                            <FileDown size={20} />
                          </motion.button>
                        </Tooltip>
                      </motion.div>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 rounded-full bg-transparent px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:bg-gray-100/80 hover:text-tertiary-600 dark:text-gray-300 dark:hover:bg-gray-700/80 dark:hover:text-tertiary-400"
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setOpen(true)}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative"
                      >
                        <CgArrowsExpandLeft className="text-xl" />
                        {!isStreamingCompleted && (
                          <motion.span
                            className="absolute -right-6 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-tertiary-500 text-[10px] font-bold text-white dark:bg-tertiary-600"
                            initial={{ scale: 0 }}
                            animate={{
                              scale: [0, 1.2, 1],
                              boxShadow: [
                                "0 0 0 0 rgba(99, 102, 241, 0)",
                                "0 0 0 4px rgba(99, 102, 241, 0.3)",
                                "0 0 0 0 rgba(99, 102, 241, 0)"
                              ]
                            }}
                            transition={{
                              scale: { duration: 0.4, ease: "backOut" },
                              boxShadow: {
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }
                            }}
                          >
                            !
                          </motion.span>
                        )}
                      </motion.span>
                    </motion.button>
                  </div>
                </motion.div>

                {/* Content area with enhanced reveal animation */}
                <div className="overflow-hidden">
                  {/* Decorative top border with animation */}
                  <motion.div
                    className="h-0.5 w-full bg-gradient-to-r from-tertiary-300/20 via-tertiary-500/60 to-tertiary-300/20 dark:from-tertiary-600/30 dark:via-tertiary-500/40 dark:to-tertiary-600/30"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />

                  <div
                    ref={textContentRef}
                    className="h-[12rem] overflow-y-auto p-5"
                  >
                    {response ? (
                      <MarkdownRenderer content={response} />
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No content available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {isStreamingCompleted && (
                <div className="flex w-full items-center gap-3 px-4 py-2">
                  <div className="group relative inline-block">
                    <button
                      type="button"
                      onClick={handleSavedocument}
                      disabled={saveLoading}
                      className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-4 py-2 transition-colors duration-200 hover:bg-gray-300 dark:bg-darkMainBackground dark:hover:bg-darkHoverBackground"
                    >
                      {saveLoading ? (
                        <div className="flex items-center">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="mx-[1px] h-1.5 w-1.5 rounded-full bg-current"
                              animate={{
                                opacity: [0.4, 1, 0.4],
                                y: [0, -3, 0]
                              }}
                              transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: "easeInOut"
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Download size={20} className="text-tertiary" />
                      )}
                      <span className="text-sm font-semibold tracking-wider text-gray-600 dark:text-white">
                        {saveLoading ? "Saving..." : "Save Document"}
                      </span>
                    </button>

                    <div className="absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 transform text-nowrap rounded bg-gray-900 px-3 py-1.5 text-sm text-white shadow-lg transition-opacity duration-150 group-hover:block">
                      Save to Policy Register
                      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform bg-gray-900"></div>
                    </div>
                  </div>
                  <div className="group relative inline-block">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(response)
                          .then(() => {
                            toast.success("Sentence copied to clipboard!");
                          })
                          .catch((err) => {
                            toast.error("Failed to copy: ", err);
                          });
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-4 py-2 transition-colors duration-200 hover:bg-gray-300 dark:bg-darkMainBackground dark:hover:bg-darkHoverBackground"
                    >
                      <Copy size={20} className="text-tertiary" />
                      <span className="text-sm font-semibold tracking-wider text-gray-600 dark:text-white">
                        Copy
                      </span>
                    </button>

                    <div className="absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 transform text-nowrap rounded bg-gray-900 px-3 py-1.5 text-sm text-white shadow-lg transition-opacity duration-150 group-hover:block">
                      Copy your document
                      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform bg-gray-900"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Regular chat message (user or bot) with improved styling
    return (
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`mb-6 flex w-full ${isUser ? "justify-end" : "justify-start"}`}
        style={{
          paddingLeft: isUser ? (isMobile ? "1.5rem" : "4rem") : "0",
          paddingRight: !isUser ? (isMobile ? "1.5rem" : "4rem") : "0"
        }}
        data-message-id={id}
      >
        <div
          className={`flex w-full items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
          <motion.div
            className={`relative mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white ${
              isUser
                ? "bg-tertiary-600 dark:bg-tertiary-700"
                : "bg-tertiary-100 text-tertiary-600 dark:bg-tertiary-900/30 dark:text-tertiary-400"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isUser ? <User size={20} /> : <Bot size={20} />}
          </motion.div>
          <motion.div
            className={`relative w-auto max-w-[calc(100%-3.5rem)] rounded-xl px-4 py-3.5 shadow-md ${
              isUser
                ? "bg-gradient-to-br from-tertiary-500 to-tertiary-600 text-white dark:from-tertiary-600 dark:to-tertiary-700"
                : "bg-white text-gray-800 dark:border dark:border-neutral-700 dark:bg-darkSidebarBackground dark:text-gray-100"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
          >
            <div className="break-words text-sm leading-relaxed md:text-base">
              {isLoading && !isUser ? (
                <div className="flex items-center space-x-2">
                  {response && <MarkdownRenderer content={response} />}
                  {!response ? (
                    <div className="flex items-center gap-2">
                      <span className="italic text-gray-400 dark:text-gray-500">
                        Thinking
                      </span>
                      <div className="flex items-center">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="mx-[1px] h-1.5 w-1.5 rounded-full bg-current"
                            animate={{ opacity: [0.4, 1, 0.4], y: [0, -3, 0] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <MarkdownRenderer content={isUser ? query : response} />
              )}
            </div>
            {!isUser && (
              <div className="mt-1.5 flex items-center justify-end text-xs text-gray-500/80 dark:text-gray-500/70">
                <Clock size={12} className="mr-1" /> {timestamp}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    // Optimize re-renders with custom comparison
    if (prevProps.isStreaming && nextProps.isStreaming) {
      // For streaming messages, only check response changes and progress state
      return (
        prevProps.response === nextProps.response &&
        prevProps.currentView === nextProps.currentView &&
        prevProps.getActiveDocumentContent() ===
          nextProps.getActiveDocumentContent() &&
        prevProps.progressState?.value === nextProps.progressState?.value
      );
    }

    return (
      prevProps.id === nextProps.id &&
      prevProps.query === nextProps.query &&
      prevProps.response === nextProps.response &&
      prevProps.isUser === nextProps.isUser &&
      prevProps.timestamp === nextProps.timestamp &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.isQuestion === nextProps.isQuestion &&
      prevProps.isStreaming === nextProps.isStreaming &&
      prevProps.isStreamingCompleted === nextProps.isStreamingCompleted &&
      prevProps.setCurrentView === nextProps.setCurrentView &&
      prevProps.currentView === nextProps.currentView &&
      prevProps.getActiveDocumentContent() ===
        nextProps.getActiveDocumentContent() &&
      prevProps.progressState?.value === nextProps.progressState?.value
    );
  }
);

ChatMessage.displayName = "ChatMessage";
export default ChatMessage;
