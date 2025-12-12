"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Maximize2,
  MessageSquare,
  Minimize2,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  X
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Dispatch,
  JSX,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { FaStop } from "react-icons/fa6";
import { RiRobot2Line } from "react-icons/ri";
import { toast } from "sonner";
import { getFromLocalStorage } from "../utils";
import MarkdownRenderer from "./MarkdownRenderer";

type MessageType = "user" | "bot" | "typing" | "system";

interface Message {
  type: MessageType;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
  showActions?: boolean;
}

interface SuggestionTip {
  id: string;
  text: string;
  icon: JSX.Element;
  used?: boolean;
}

const INITIAL_SUGGESTION_TIPS: SuggestionTip[] = [
  {
    id: "summarize",
    text: "Summarize this page",
    icon: <MessageSquare size={14} className="text-indigo-400" />
  }
];

const QUICK_ACTIONS = [
  { id: "summarize", label: "Summarize again", icon: <RefreshCw size={14} /> },
  { id: "copy", label: "Copy text", icon: <Copy size={14} /> },
  { id: "thanks", label: "Thanks", icon: <ThumbsUp size={14} /> }
];

const HelpArea = ({
  setHelpOpenMax,
  helpOpenMax,
  setHelpOpen,
  sessionId
}: {
  setHelpOpenMax: Dispatch<SetStateAction<boolean>>;
  setHelpOpen: Dispatch<SetStateAction<boolean>>;
  helpOpenMax: boolean;
  sessionId: string;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const url = useMemo(
    () =>
      pathname
        ? `${pathname.slice(1)}?${decodeURIComponent(searchParams.toString())}`
        : "",
    [pathname, searchParams]
  );

  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionTips, setSuggestionTips] = useState<SuggestionTip[]>(
    INITIAL_SUGGESTION_TIPS
  );
  const [recentUsedSuggestion, setRecentUsedSuggestion] = useState<
    string | null
  >(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isSessionValidated, setIsSessionValidated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const currentResponseRef = useRef<string>("");
  const hasReceivedDataRef = useRef<boolean>(false);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialCallMade = useRef(false);
  const isMounted = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end"
        });
      });
    }
  }, []);

  const copyMessageContent = useCallback(
    (content: string) => {
      const cleanContent = content.replace(
        /```([\s\S]*?)```/g,
        (_, codeContent) => codeContent.trim()
      );
      navigator.clipboard.writeText(cleanContent);

      setShowFeedback(true);
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content: "Content copied to clipboard!",
          timestamp: new Date()
        }
      ]);
      scrollToBottom();

      setTimeout(() => {
        if (isMounted.current) {
          setShowFeedback(false);
        }
      }, 3000);
    },
    [scrollToBottom]
  );
  const updateMessageResponse = useCallback(
    (response: string, isError: boolean = false, errorMessage?: string) => {
      if (!isMounted.current) {
        return;
      }

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (lastMessage && lastMessage.type === "bot") {
          lastMessage.content = isError ? lastMessage.content : response;
          lastMessage.isLoading = false;
          if (isError) {
            lastMessage.error = errorMessage || "Connection lost.";
          } else {
            delete lastMessage.error;
          }
          if (!isError) {
            lastMessage.showActions = true;
          }
        }
        return updatedMessages;
      });

      if (!isError) {
        setShowSuggestions(true);
      }

      scrollToBottom();
    },
    [scrollToBottom]
  );

  const finalizeMessage = useCallback(() => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    updateMessageResponse(
      currentResponseRef.current ||
        (hasReceivedDataRef.current
          ? currentResponseRef.current
          : "No response received."),
      !hasReceivedDataRef.current,
      !hasReceivedDataRef.current
        ? "No response received from server."
        : undefined
    );
    setLoading(false);
    setInitialLoading(false);
    currentResponseRef.current = "";
    hasReceivedDataRef.current = false;
  }, [updateMessageResponse]);

  const initializeWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    const accessToken = getFromLocalStorage("ACCESS_TOKEN");
    const wsUrl = `${process.env["NEXT_PUBLIC_CHAT_WEB_SOCKET_URL"]}?authorization=bearer%20${accessToken}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsSocketConnected(true);
      wsRef.current?.send(
        JSON.stringify({
          session_id: sessionId
        })
      );
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "status" && data.message === "session_validated") {
          setIsSessionValidated(true);
          return;
        }

        if (data.type === "ping") {
          wsRef.current?.send(JSON.stringify({ type: "pong" }));
          return;
        }

        if (data.type === "token" && data.token) {
          hasReceivedDataRef.current = true;
          currentResponseRef.current += data.token;
          updateMessageResponse(currentResponseRef.current, false);

          setTimeout(() => {
            scrollToBottom();
          }, 0);

          if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
          }
          messageTimeoutRef.current = setTimeout(() => {
            finalizeMessage();
          }, 1000);
        }

        if (data.type === "done") {
          finalizeMessage();
        }

        if (data.error) {
          updateMessageResponse(
            currentResponseRef.current || "Stream error occurred.",
            true,
            "Connection error occurred. Please try again."
          );
          setLoading(false);
        }
      } catch {
        toast.error("Error parsing WebSocket message.");
      }
    };

    wsRef.current.onerror = () => {
      setIsSocketConnected(false);
      setIsSessionValidated(false);
      updateMessageResponse(
        currentResponseRef.current || "WebSocket connection error.",
        true,
        "Network error occurred. Please try again."
      );
      setLoading(false);
    };

    wsRef.current.onclose = () => {
      setIsSocketConnected(false);
      setIsSessionValidated(false);
      setLoading(false);
      if (hasReceivedDataRef.current || currentResponseRef.current) {
        updateMessageResponse(
          currentResponseRef.current || "Connection closed unexpectedly.",
          true,
          "Connection was lost. Please try again."
        );
      }
    };
  }, [sessionId, scrollToBottom]);

  const markSuggestionAsUsed = useCallback((id: string) => {
    setSuggestionTips((prev) =>
      prev.map((tip) => (tip.id === id ? { ...tip, used: true } : tip))
    );
    setRecentUsedSuggestion(id);

    setTimeout(() => {
      if (isMounted.current) {
        setRecentUsedSuggestion(null);
      }
    }, 2000);
  }, []);

  const sendMessageViaWebSocket = useCallback(
    (userQuery: string, isInitial: boolean = false) => {
      if ((loading && !isInitial) || !isMounted.current) {
        return;
      }

      if (!isSocketConnected || !isSessionValidated) {
        return;
      }

      setLoading(true);

      if (isInitial && messages.length === 0) {
        setMessages([
          {
            type: "system",
            content:
              "Welcome to Help Center! I'm your personal page assistant.",
            timestamp: new Date()
          }
        ]);
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "typing",
          content: "",
          timestamp: new Date(),
          isLoading: true
        }
      ]);

      scrollToBottom();

      currentResponseRef.current = "";
      hasReceivedDataRef.current = false;

      try {
        if (isMounted.current) {
          setMessages((prev) => {
            const filtered = prev.filter((msg) => msg.type !== "typing");
            return [
              ...filtered,
              {
                type: "bot",
                content: "",
                timestamp: new Date(),
                isLoading: true,
                showActions: false
              }
            ];
          });

          scrollToBottom();
        }

        wsRef.current?.send(
          JSON.stringify({
            user_query: isInitial
              ? `@Help Summarize and analyze the current page: ${url}`
              : `@Help ${userQuery}`,
            session_id: sessionId,
            assesment_rag: false,
            attachment: undefined,
            collection_id: null,
            build_score: undefined,
            flag: null
          })
        );
      } catch {
        updateMessageResponse(
          "Failed to send message. Please try again.",
          true,
          "Network error occurred. Please try again."
        );
        setLoading(false);
        if (isInitial) {
          setInitialLoading(false);
        }
      }
    },
    [
      loading,
      url,
      messages.length,
      updateMessageResponse,
      scrollToBottom,
      sessionId,
      isSocketConnected,
      isSessionValidated
    ]
  );

  const handleSendMessage = useCallback(
    async (text: string = inputValue, suggestionId?: string): Promise<void> => {
      if (!text.trim() || !isMounted.current) {
        return;
      }

      if (suggestionId) {
        markSuggestionAsUsed(suggestionId);
      }

      const userMessage: Message = {
        type: "user",
        content: text,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, userMessage]);
      const query = text;
      setInputValue("");

      scrollToBottom();

      await sendMessageViaWebSocket(query);
    },
    [inputValue, sendMessageViaWebSocket, scrollToBottom, markSuggestionAsUsed]
  );
  const handleQuickAction = useCallback(
    (action: string, messageContent: string) => {
      switch (action) {
        case "summarize":
          handleSendMessage("Summarize this page again please");
          break;
        case "copy":
          copyMessageContent(messageContent);
          break;
        case "thanks":
          setShowFeedback(true);
          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              content: "Feedback sent! Thank you.",
              timestamp: new Date()
            }
          ]);
          scrollToBottom();

          setTimeout(() => {
            if (isMounted.current) {
              setShowFeedback(false);
            }
          }, 3000);
          break;
        default:
          break;
      }
    },
    [copyMessageContent, scrollToBottom]
  );

  const stopStreaming = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      finalizeMessage();
    }
  }, [finalizeMessage]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      setLoading(false);
      setIsSocketConnected(false);
      setIsSessionValidated(false);
    };
  }, []);

  useEffect(() => {
    initializeWebSocket();
  }, [initializeWebSocket]);

  useEffect(() => {
    if (
      !isMounted.current ||
      isInitialCallMade.current ||
      !url ||
      !isSocketConnected ||
      !isSessionValidated
    ) {
      return;
    }

    setTimeout(() => {
      if (inputRef.current && isMounted.current) {
        inputRef.current.focus();
      }
    }, 300);

    const timer = setTimeout(() => {
      if (isMounted.current && !isInitialCallMade.current) {
        isInitialCallMade.current = true;
        sendMessageViaWebSocket("", true);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [url, sendMessageViaWebSocket, isSocketConnected, isSessionValidated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(date);
  };

  const messageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.2
      }
    }
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/```([\s\S]*?)```/);

    return (
      <>
        {parts.map((part, i) => {
          if (i % 2 === 0) {
            return <MarkdownRenderer key={i} content={part} />;
          } else {
            const coloredAsciiArt = part
              .split("\n")
              .map((line) => {
                if (line.includes("*")) {
                  return line.replace(
                    /(\* [\w\s]+:)/g,
                    '<span class="text-red-500 font-semibold">$1</span>'
                  );
                }
                if (line.includes("[") && line.includes("]")) {
                  return line.replace(
                    /(\[[\w\s]+\])/g,
                    '<span class="text-red-500 font-semibold">$1</span>'
                  );
                }
                return line;
              })
              .join("\n");

            return (
              <div
                key={i}
                className="dark:bg-darkSidebarBackground my-2 overflow-x-auto rounded-md bg-gray-50 p-3 font-mono text-xs text-gray-800 dark:text-white"
              >
                <pre
                  className="whitespace-pre"
                  dangerouslySetInnerHTML={{ __html: coloredAsciiArt }}
                />
              </div>
            );
          }
        })}
      </>
    );
  };

  if (!isSocketConnected || !isSessionValidated) {
    return (
      <div
        ref={chatContainerRef}
        className="dark:bg-darkSidebarBackground relative flex size-full flex-col overflow-hidden rounded-2xl shadow-xl"
      >
        <div className="bg-tertiary-600 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-tertiary-500 flex h-10 w-10 items-center justify-center rounded-full shadow-md">
              <RiRobot2Line size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                AI Help Assistant
              </h2>
              <p className="text-tertiary-100 flex flex-col gap-1 text-xs">
                <span className="bg-tertiary-500 inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] font-medium text-white">
                  <Sparkles size={10} className="text-tertiary-200" />
                  AI Powered
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHelpOpenMax && setHelpOpenMax(!helpOpenMax)}
              className="rounded-full p-1.5 text-white transition-colors hover:bg-indigo-500"
              aria-label={helpOpenMax ? "Collapse" : "Expand"}
            >
              {helpOpenMax ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={() => {
                setHelpOpen(false);
                setHelpOpenMax(false);
                stopStreaming();
              }}
              className="rounded-full p-1.5 text-white transition-colors hover:bg-indigo-500"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex space-x-2">
              <div
                className="h-3 w-3 animate-bounce rounded-full bg-indigo-400"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="h-3 w-3 animate-bounce rounded-full bg-indigo-400"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="h-3 w-3 animate-bounce rounded-full bg-indigo-400"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {!isSocketConnected ? "Connecting..." : "Validating session..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chatContainerRef}
      className="dark:bg-darkSidebarBackground relative flex size-full flex-col overflow-hidden rounded-2xl shadow-xl"
    >
      <div className="bg-tertiary-600 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-tertiary-500 flex h-10 w-10 items-center justify-center rounded-full shadow-md">
            <RiRobot2Line size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              AI Help Assistant
            </h2>
            <p className="text-tertiary-100 flex flex-col gap-1 text-xs">
              <span className="bg-tertiary-500 inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] font-medium text-white">
                <Sparkles size={10} className="text-tertiary-200" />
                AI Powered
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHelpOpenMax && setHelpOpenMax(!helpOpenMax)}
            className="rounded-full p-1.5 text-white transition-colors hover:bg-indigo-500"
            aria-label={helpOpenMax ? "Collapse" : "Expand"}
          >
            {helpOpenMax ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={() => {
              setHelpOpen(false);
              setHelpOpenMax(false);
              stopStreaming();
            }}
            className="rounded-full p-1.5 text-white transition-colors hover:bg-indigo-500"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="h-[calc(100dvh-230px)] overflow-hidden">
        <div
          className="h-full overflow-y-auto scroll-smooth px-4 py-3"
          style={{ paddingBottom: "80px" }}
        >
          {initialLoading && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex space-x-2">
                  <div
                    className="h-3 w-3 animate-bounce rounded-full bg-indigo-400"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="h-3 w-3 animate-bounce rounded-full bg-indigo-400"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="h-3 w-3 animate-bounce rounded-full bg-indigo-400"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">Analyzing this page...</p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`mb-4 flex ${
                    message.type === "user"
                      ? "justify-end"
                      : message.type === "system"
                        ? "justify-center"
                        : "justify-start"
                  }`}
                >
                  {message.type === "typing" ? (
                    <div className="flex items-center space-x-1.5 rounded-full bg-indigo-100 px-4 py-2.5 shadow-sm">
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  ) : message.type === "system" ? (
                    <div className="dark:bg-darkMainBackground mb-2 max-w-[90%] rounded-full bg-gray-100 px-4 py-2 text-center text-sm text-gray-700 dark:text-gray-200">
                      {message.content}
                    </div>
                  ) : (
                    <div
                      className={`max-w-full ${
                        message.type === "user"
                          ? "from-tertiary-500 to-tertiary-600 rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-gradient-to-tr text-white shadow-sm"
                          : "dark:bg-darkMainBackground rounded-tl-xl rounded-tr-xl rounded-br-xl border border-gray-200 bg-white text-gray-800 shadow-sm dark:border-neutral-700 dark:text-gray-200"
                      } relative px-4 py-3`}
                    >
                      <div className="font-satoshi text-sm leading-relaxed font-medium">
                        {renderMessageContent(message.content || "")}
                        {message.error && (
                          <span className="mt-2 block text-xs font-medium text-red-500">
                            {message.error}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-right text-xs ${
                          message.type === "user"
                            ? "text-indigo-200"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>

                      {message.type === "bot" && message.showActions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {QUICK_ACTIONS.map((action) => (
                            <button
                              key={action.id}
                              onClick={() =>
                                handleQuickAction(action.id, message.content)
                              }
                              className="dark:bg-darkSidebarBackground flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 shadow-sm hover:bg-gray-50 dark:border-neutral-700 dark:text-white"
                            >
                              <span className="text-indigo-500">
                                {action.icon}
                              </span>
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {showSuggestions && !initialLoading && !showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="my-4"
            >
              <p className="mb-2 text-center text-xs font-medium text-gray-500">
                Try asking:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestionTips
                  .filter((tip) => !tip.used || tip.id === recentUsedSuggestion)
                  .map((tip) => (
                    <button
                      key={tip.id}
                      onClick={() => handleSendMessage(tip.text, tip.id)}
                      className={`flex items-center gap-1 rounded-full ${
                        tip.id === recentUsedSuggestion
                          ? "border border-indigo-300 bg-indigo-100 text-indigo-800"
                          : "border border-indigo-100 bg-indigo-50 text-indigo-700 hover:border-indigo-200 hover:bg-indigo-100"
                      } px-3 py-1.5 text-sm transition-all`}
                      disabled={tip.id === recentUsedSuggestion}
                    >
                      {tip.id === recentUsedSuggestion ? (
                        <Check size={14} className="text-indigo-600" />
                      ) : (
                        tip.icon
                      )}
                      {tip.text}
                    </button>
                  ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="dark:bg-darkSidebarBackground absolute right-0 bottom-0 left-0 border-t border-gray-100 bg-white p-3 dark:border-neutral-800">
        <div className="dark:bg-darkMainBackground flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 shadow-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-neutral-700">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Ask for help with this page..."
            className="w-full bg-transparent py-2 text-sm outline-none focus:outline-none"
            disabled={
              loading ||
              initialLoading ||
              !isSocketConnected ||
              !isSessionValidated
            }
          />
          <div className="absolute right-5 flex space-x-2">
            {loading ? (
              <div className="flex items-center">
                <div className="relative">
                  <button
                    onClick={stopStreaming}
                    className="bg-tertiary-100 text-tertiary-800 hover:bg-tertiary-200 dark:bg-tertiary-700/30 dark:text-tertiary-200 dark:hover:bg-tertiary-700/50 flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                  >
                    <div className="relative mr-1 flex items-center justify-center">
                      <FaStop className="mr-3 size-3" />
                      <div className="absolute -top-1.5 right-1.5">
                        <div className="border-tertiary size-6 animate-spin rounded-full border-[3px] border-t-transparent"></div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">Stop</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleSendMessage()}
                disabled={
                  !inputValue.trim() ||
                  loading ||
                  initialLoading ||
                  !isSocketConnected ||
                  !isSessionValidated
                }
                className={`flex items-center justify-center rounded-full px-4 py-1 text-xs font-medium transition-colors ${
                  !inputValue.trim() ||
                  !isSocketConnected ||
                  !isSessionValidated
                    ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                    : "bg-tertiary text-white"
                }`}
              >
                Run
                <span className="ml-1 text-base">↵</span>
              </button>
            )}
          </div>
        </div>
        <p className="mt-1 text-center text-xs text-gray-400">
          Your AI help assistant is dedicated to this page
        </p>
      </div>
    </div>
  );
};

export default HelpArea;
