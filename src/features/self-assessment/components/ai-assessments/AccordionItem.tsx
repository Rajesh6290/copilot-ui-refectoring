"use client";
import MarkdownRenderer from "@/shared/common/MarkdownRenderer";
import { getFromLocalStorage } from "@/shared/utils";
import { TextareaAutosize } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { Check, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
export interface IsAccess {
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      update: boolean;
      delete: boolean;
      read: boolean;
    };
  };
}
interface AccordionItemProps {
  id: string;
  question: string;
  answer?: string;
  isCompleted?: boolean;
  isOpen: boolean;
  toggle: () => void;
  onUpdateResponse: (id: string, answer: string) => Promise<void>;
  isLoading: boolean;
  isAccess?: IsAccess;
}

const AccordionItem = ({
  id,
  question,
  answer = "",
  isCompleted = false,
  isOpen,
  toggle,
  onUpdateResponse,
  isLoading,
  isAccess
}: AccordionItemProps) => {
  const [editedAnswer, setEditedAnswer] = useState(answer || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestedResponse, setSuggestedResponse] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState(""); // New state for generated response
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const variants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: { height: { duration: 0.3 }, opacity: { duration: 0.2 } }
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: { height: { duration: 0.3 }, opacity: { duration: 0.2 } }
    }
  };

  // Memoized debounced save function
  const debouncedSave = useCallback(
    debounce(async (value: string) => {
      if (value !== answer) {
        await onUpdateResponse(id, value);
      }
    }, 1000),
    [id, answer, onUpdateResponse]
  );

  // Memoized change handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (!isGenerating) {
        setEditedAnswer(newValue);
        debouncedSave(newValue);
      }
    },
    [debouncedSave, isGenerating]
  );

  // Focus textarea only when isOpen changes to true
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart || editedAnswer.length;
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [isOpen, editedAnswer.length]);

  // Sync with external answer changes
  useEffect(() => {
    setEditedAnswer(answer || "");
  }, [answer]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Handle streaming response for both generate and suggest
  const handleStreamingRequest = async (type: "generate" | "suggest") => {
    try {
      // Set appropriate loading state
      const token = getFromLocalStorage("ACCESS_TOKEN");
      if (type === "generate") {
        setIsGenerating(true);
        setGeneratedResponse(""); // Clear previous generated response
      } else {
        setIsSuggesting(true);
        setSuggestedResponse("");
      }

      // Create the request payload with exactly three key-pair values
      const payload = {
        question: question,
        answer: answer || "", // Existing answer or empty string
        flag: type // Either 'generate' or 'suggest'
      };

      // Make the streaming request
      const response = await fetch("/api/help-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Process the streaming response in text/event-stream format
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";
      let buffer = "";

      // Read the stream
      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;

          if (value) {
            // Decode the current chunk
            const chunk = decoder.decode(value, { stream: !done });
            buffer += chunk;

            // Process complete data: lines
            const lines = buffer.split("\n");

            // Keep the last (potentially incomplete) line in the buffer
            buffer = lines.pop() || "";

            // Process each complete line
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  // Extract the JSON data after "data: "
                  const jsonStr = line.substring(6);
                  const data = JSON.parse(jsonStr);

                  // Extract token from the data
                  if (data && data.token) {
                    result += data.token;

                    // Update the appropriate state based on the request type
                    if (type === "generate") {
                      // No longer auto-update the textarea
                      setGeneratedResponse(result); // Store in generatedResponse instead
                    } else {
                      setSuggestedResponse(result);
                    }
                  }
                } catch (e: unknown) {
                  toast.error(
                    e instanceof Error ? e.message : "An error occurred"
                  );
                }
              }
            }
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      // Reset loading state
      if (type === "generate") {
        setIsGenerating(false);
      } else {
        setIsSuggesting(false);
      }
    }
  };

  const applySuggestion = async (content: string) => {
    // Extract only the content after "Example:"
    const exampleStartIndex = content.indexOf("Example:");

    // If "Example:" exists in the suggested response
    if (exampleStartIndex !== -1) {
      // Get just the content after "Example:" by adding 8 characters to skip "Example:"
      const exampleContentOnly = content
        .substring(exampleStartIndex + 8)
        .trim();

      // Update the edited answer with just the example content
      setEditedAnswer(exampleContentOnly);

      // Save just the example content
      await onUpdateResponse(id, exampleContentOnly);
    } else {
      // If no example is found, just use the whole suggestion
      setEditedAnswer(content);
      await onUpdateResponse(id, content);
    }

    // Clear the responses
    if (content === suggestedResponse) {
      setSuggestedResponse("");
    } else if (content === generatedResponse) {
      setGeneratedResponse("");
    }
  };

  return (
    <div className="border-b border-neutral-300 last:border-b-0 dark:border-neutral-600">
      <div
        tabIndex={0}
        role="button"
        className="flex w-full cursor-pointer items-center justify-between p-4"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (toggle) {
              toggle();
            }
          }
        }}
      >
        <div className="flex w-full items-center">
          <div
            className={`mr-3 flex aspect-square size-6 min-w-6 items-center justify-center rounded-full ${
              isCompleted
                ? "bg-tertiary text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isCompleted ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              )}
            </svg>
          </div>
          <h3 className="text-sm font-medium leading-tight text-gray-800 dark:text-white sm:line-clamp-none sm:text-base">
            {question}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="size-5"
        >
          <PlusIcon className="h-5 w-5 text-gray-500" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={variants}
            initial="closed"
            animate="open"
            exit="closed"
            className="relative flex flex-col overflow-hidden bg-white dark:bg-darkSidebarBackground"
          >
            <div className="px-4 py-2">
              <TextareaAutosize
                ref={textareaRef}
                minRows={3}
                maxRows={10}
                value={editedAnswer}
                onChange={handleChange}
                placeholder="Type your answer here..."
                className="w-full rounded-lg border bg-white p-2 shadow-sm outline-none dark:border-neutral-600 dark:bg-darkMainBackground dark:text-white"
                disabled={
                  isGenerating ||
                  isSuggesting ||
                  !isAccess?.permission?.actions?.update
                }
              />
              {(isLoading || isGenerating || isSuggesting) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-7 top-5 mt-1 flex justify-end"
                >
                  <div className="relative h-6 w-6">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 opacity-20"></div>
                    <div className="h-full w-full animate-spin rounded-full border-4 border-t-transparent from-indigo-600 to-blue-500"></div>
                  </div>
                </motion.div>
              )}
            </div>

            {generatedResponse && (
              <div className="mx-4 mb-3 mt-1 rounded-lg border border-tertiary-200 bg-tertiary-50 p-3 dark:border-tertiary-800 dark:bg-tertiary-900/20">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-tertiary-700 dark:text-tertiary-300">
                    Generated Response
                  </span>
                  <button
                    onClick={() => applySuggestion(generatedResponse)}
                    className="inline-flex items-center rounded-md bg-tertiary-100 px-2 py-1 text-xs font-medium text-tertiary-700 hover:bg-tertiary-200 dark:bg-tertiary-800/30 dark:text-tertiary-300 dark:hover:bg-tertiary-800/50"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Insert Response
                  </button>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <MarkdownRenderer content={generatedResponse || ""} />
                </div>
              </div>
            )}

            {suggestedResponse && (
              <div className="mx-4 mb-3 mt-1 rounded-lg border border-tertiary-200 bg-tertiary-50 p-3 dark:border-tertiary-800 dark:bg-tertiary-900/20">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-tertiary-700 dark:text-tertiary-300">
                    Suggested Response
                  </span>
                  <button
                    onClick={() => applySuggestion(suggestedResponse)}
                    className="inline-flex items-center rounded-md bg-tertiary-100 px-2 py-1 text-xs font-medium text-tertiary-700 hover:bg-tertiary-200 dark:bg-tertiary-800/30 dark:text-tertiary-300 dark:hover:bg-tertiary-800/50"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Insert Example
                  </button>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <MarkdownRenderer content={suggestedResponse || ""} />
                </div>
              </div>
            )}

            <div className="flex w-full items-center justify-end p-2">
              {isAccess?.permission?.is_shown && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (isAccess?.permission?.actions?.update) {
                        handleStreamingRequest("generate");
                      } else {
                        toast.error(
                          "You don't have permission to generate responses"
                        );
                      }
                    }}
                    disabled={isGenerating || isSuggesting}
                    className={`inline-flex items-center rounded-full border-2 border-tertiary px-4 py-1.5 font-[family-name:var(--font-geist-mono)] text-xs font-medium text-tertiary transition-all duration-200 sm:text-base ${
                      isGenerating ? "bg-tertiary/10" : "hover:bg-tertiary/5"
                    } ${
                      isGenerating || isSuggesting
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <svg
                          className="mr-2 h-3.5 w-3.5 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>Generate Response</>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (isAccess?.permission?.actions?.update) {
                        handleStreamingRequest("suggest");
                      } else {
                        toast.error(
                          "You don't have permission to review responses"
                        );
                      }
                    }}
                    disabled={isGenerating || isSuggesting}
                    className={`inline-flex items-center rounded-full border-2 border-tertiary px-4 py-1.5 font-[family-name:var(--font-geist-mono)] text-xs font-medium text-tertiary transition-all duration-200 sm:text-base ${
                      isSuggesting ? "bg-tertiary/10" : "hover:bg-tertiary/5"
                    } ${
                      isGenerating || isSuggesting
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
                  >
                    {isSuggesting ? (
                      <>
                        <svg
                          className="mr-2 h-3.5 w-3.5 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Reviewing...
                      </>
                    ) : (
                      <>Review Response</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AccordionItem;
