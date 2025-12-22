"use client";
import { IconButton, Tooltip } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  CheckCircle,
  Menu,
  Plus,
  TrendingUpDown,
  X,
  Zap
} from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import ClickOutside from "@/shared/common/ClickOutside";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useMyContext } from "@/shared/providers/AppProvider";
import { getFromLocalStorage, useResponsiveBreakpoints } from "@/shared/utils";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { FaStop } from "react-icons/fa6";
import { MdOutlineHistory } from "react-icons/md";
import { toast } from "sonner";
const TabbedSidebar = dynamic(() => import("./TabbedSidebar"), {
  ssr: false
});
const PolicyHistory = dynamic(() => import("./PolicyHistory"), {
  ssr: false
});
const EditDialog = dynamic(() => import("./EditDialog"), {
  ssr: false
});
const ChatMessage = dynamic(() => import("./ChatMessage"), {
  ssr: false
});

export interface Message {
  id: string;
  query: string;
  response: string;
  isUser: boolean;
  timestamp: string;
  isLoading?: boolean;
  isStreaming?: boolean;
  isStreamingCompleted?: boolean;
  isQuestion?: boolean;
  isStatus?: boolean;
  queryId?: string;
  isDocument?: boolean;
}

export interface PolicyTemplate {
  doc_id: string;
  id: string;
  name: string;
  description?: string;
  framework?: string[];
  citation?: string;
  category?: string;
  version?: string;
  effective_date?: string;
  readiness_status?: string;
  scope?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
}
const PolicyAssistant = ({
  sessionId,
  setSessionId
}: {
  sessionId: string;
  setSessionId: Dispatch<SetStateAction<string>>;
}) => {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [finalDocument, setFinalDocument] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [currentView, setCurrentView] = useState<"chat" | "document">("chat");
  const [selectedTemplate, setSelectedTemplate] =
    useState<PolicyTemplate | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<
    "disconnected" | "connecting" | "connected" | "reconnecting" | "error"
  >("disconnected");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [originalQuery, setOriginalQuery] = useState<string>("");
  const [isReceivingTokens, setIsReceivingTokens] = useState(false);
  const [originalQueryId, setOriginalQueryId] = useState<string>("");
  const [isSkipClicked, setIsSkipClicked] = useState(false);
  // Add progress state
  const [progressState, setProgressState] = useState<{
    value: number;
    status: string;
    message?: string;
    isStreaming?: boolean;
  }>({
    value: 0,
    status: "idle",
    message: "",
    isStreaming: false
  });

  const documentRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const { data } = useSwr("policies-common?page=1&limit=100");
  const { isMobile } = useResponsiveBreakpoints();
  const { isLoading, mutation } = useMutation();
  const { isLoading: deleteLoading, mutation: deleteMutation } = useMutation();
  const { isLoading: tokenLoading, mutation: tokenMutation } = useMutation();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPingTimeRef = useRef<number>(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const tokenBufferRef = useRef("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loadingSessionHistory, setLoadingSessionHistory] =
    useState<boolean>(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    data: policySessionsHistory,
    isValidating,
    mutate
  } = useSwr("conversation/policy-history");
  const {
    data: policySessionIdsHistory,
    isValidating: policySessionIdsHistoryLoading
  } = useSwr(
    selectedSessionId
      ? `conversation/policy_session-history?session_id=${selectedSessionId}`
      : null
  );
  const { data: fetchLimits, mutate: limitMutate } = useSwr("fetch-limits");
  const { setMetaTitle } = useMyContext();
  useEffect(() => {
    if (policySessionIdsHistory?.messages?.length > 0) {
      setLoadingSessionHistory(true);
      // Create a new array to hold all messages from the history
      const historicalMessages: Message[] = [];

      // Process each message in the history
      policySessionIdsHistory.messages.forEach(
        (item: {
          user_query: string;
          user_answers: Record<string, string>;
          // eslint-disable-next-line @typescript-eslint/naming-convention
          AI_response: { content: string; type: string } | null;
          timestamp: string;
        }) => {
          const timestamp = new Date(item.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });

          // Step 1: Add the main user query first
          if (item.user_query) {
            historicalMessages.push({
              id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              query: item.user_query,
              response: "",
              isUser: true,
              timestamp
            });
          }

          // Step 2: Add question-answer pairs in sequence
          if (item.user_answers && Object.keys(item.user_answers).length > 0) {
            Object.entries(item.user_answers).forEach(([question, answer]) => {
              // Add the question from AI
              historicalMessages.push({
                id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                query: "",
                response: question,
                isUser: false,
                timestamp,
                isQuestion: true
              });

              // Add the user's answer or indicate it was skipped
              if (answer === "SKIP") {
                // If user skipped, add a special user message indicating skip
                historicalMessages.push({
                  id: `skip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  query: "SKIP",
                  response: "",
                  isUser: true,
                  timestamp
                });
              } else {
                // Add the user's actual answer
                historicalMessages.push({
                  id: `answer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  query: answer as string,
                  response: "",
                  isUser: true,
                  timestamp
                });
              }
            });
          }

          // Step 3: Finally add the AI response with the document
          if (item.AI_response?.content) {
            historicalMessages.push({
              id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              query: "",
              response: item.AI_response.content,
              isUser: false,
              timestamp,
              isDocument: item.AI_response.type === "full_policy",
              isStreamingCompleted: true // Mark as completed since it's historical
            });
          }
        }
      );

      // Update messages state with the processed historical messages
      if (historicalMessages.length > 0) {
        setMessages(historicalMessages);

        // If there's final document content in the last AI response, update the document states
        const lastAIMessage = historicalMessages
          .filter((msg) => !msg.isUser && msg.response)
          .pop();

        if (lastAIMessage?.response) {
          setFinalDocument(lastAIMessage.response);
          setEditedContent(lastAIMessage.response);
        }
        setLoadingSessionHistory(false);
        // Scroll to bottom after setting messages
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  }, [policySessionIdsHistory]);
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);
  const processTokenBuffer = useCallback((forceFlush = false) => {
    if (tokenBufferRef.current.length > 0 || forceFlush) {
      const tokensToProcess = tokenBufferRef.current;
      tokenBufferRef.current = "";

      if (tokensToProcess.length > 0) {
        documentRef.current += tokensToProcess;
      }
    }
  }, []);
  const connectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (reconnectAttempts.current >= maxReconnectAttempts) {
      toast.error(
        "Failed to connect after multiple attempts. Please refresh the page.",
        {
          position: "bottom-right",
          duration: 5000
        }
      );
      setWsStatus("error");
      setStatusMessage("Connection failed. Please refresh the page.");
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close(1000, "Reconnecting");
      } catch {
        // handle error
      }
    }

    setWsStatus(reconnectAttempts.current > 0 ? "reconnecting" : "connecting");

    try {
      const socket = new WebSocket(
        `${process.env["NEXT_PUBLIC_WEB_SOCKET_URL"]}?authorization=${`Bearer ${getFromLocalStorage("ACCESS_TOKEN")}`}`
      );
      wsRef.current = socket;

      socket.onopen = () => {
        setWsStatus("connected");
        reconnectAttempts.current = 0;
        setStatusMessage(null);

        socket.send(
          JSON.stringify({
            session_id: sessionId
          })
        );

        lastPingTimeRef.current = Date.now();
      };

      socket.onmessage = (event) => {
        try {
          const streamData = JSON.parse(event.data);
          lastPingTimeRef.current = Date.now();
          const timestamp = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });

          if (streamData.type === "ping") {
            socket.send(JSON.stringify({ type: "pong" }));
            setWsStatus("connected");
            limitMutate();
            return;
          }

          if (
            streamData.type === "status" &&
            streamData.message === "session_validated"
          ) {
            setStatusMessage(null);
            setWsStatus("connected");
            limitMutate();
            return;
          }

          // Handle progress updates in status messages
          if (streamData.status && streamData.message) {
            // Update progress state based on status message
            if (streamData.progress !== undefined) {
              setProgressState(() => ({
                value: streamData.progress,
                status: streamData.status,
                message: streamData.message,
                isStreaming: false
              }));
            }

            setStatusMessage(streamData.message);
            setLoading(true);
            limitMutate();
            return;
          }

          if (streamData.type === "question" && streamData.question) {
            processTokenBuffer(true);
            setIsReceivingTokens(false);
            setCurrentQuestion(streamData.question);
            setIsSkipClicked(false);
            setOriginalQuery(streamData.original_query || "");
            setOriginalQueryId(streamData.query_id || "");
            setMessages((prev) => [
              ...prev.filter((msg) => !msg.isStatus && !msg.isLoading),
              {
                id: `question-${Date.now()}`,
                query: "",
                response: streamData.question,
                isUser: false,
                timestamp,
                isQuestion: true,
                queryId: streamData.query_id
              }
            ]);
            setStatusMessage(null);
            setLoading(false);
            scrollToBottom();
            limitMutate();
            return;
          }
          if (streamData.type === "info" && streamData.message) {
            processTokenBuffer(true);
            setIsReceivingTokens(false);
            setIsSkipClicked(false);
            setMessages((prev) => [
              ...prev.filter((msg) => !msg.isStatus && !msg.isLoading),
              {
                id: `info-${Date.now()}`,
                query: "",
                response: streamData.message,
                isUser: false,
                timestamp,
                isQuestion: false
              }
            ]);
            setStatusMessage(null);
            setLoading(false);
            scrollToBottom();
            limitMutate();
            return;
          }

          // Handle token streaming with a unified approach
          if (streamData.token) {
            if (!isReceivingTokens) {
              setIsReceivingTokens(true);
              documentRef.current = "";
              tokenBufferRef.current = "";

              // Update progress for streaming phase
              setProgressState((prev) => ({
                value: prev.value || 0, // Keep previous value as starting point
                status: "streaming",
                isStreaming: true
              }));

              // Create a new streaming message if none exists
              setMessages((prevMessages) => {
                const hasStreamingMessage = prevMessages.some(
                  (msg) => msg.isStreaming
                );

                if (!hasStreamingMessage) {
                  return [
                    ...prevMessages.filter(
                      (msg) => !msg.isStatus && !msg.isLoading
                    ),
                    {
                      id: `resp-${Date.now()}`,
                      query: "",
                      response: "",
                      isUser: false,
                      timestamp,
                      isLoading: false,
                      isStreaming: true,
                      isStreamingCompleted: false,
                      isDocument: false
                    }
                  ];
                }

                return prevMessages;
              });
            }

            // Gradually increase progress during streaming
            if (progressState.isStreaming) {
              // Calculate new progress during streaming
              // Make sure it doesn't go beyond a certain threshold until we get "completed"
              setProgressState((prev) => {
                // If already high, don't keep increasing
                if (prev.value >= 98) {
                  return prev;
                }

                // Incrementally increase by small amount
                return {
                  ...prev,
                  value: Math.min(prev.value + 0.2, 98)
                };
              });
            }

            tokenBufferRef.current += streamData.token;
            setStatusMessage(null);

            // Update the existing streaming message with new content
            setMessages((prevMessages) => {
              return prevMessages.map((msg) => {
                if (msg.isStreaming) {
                  return {
                    ...msg,
                    isDocument: streamData?.response_category === "full_policy",
                    response: msg.response + streamData.token
                  };
                }
                return msg;
              });
            });

            documentRef.current += streamData.token;
            return;
          }

          // When streaming is done, update progress to 100%
          if (streamData.type === "done") {
            setIsReceivingTokens(false);
            limitMutate();
            mutate();
            // Set progress to 100% when complete
            setProgressState({
              value: 100,
              status: "completed",
              isStreaming: false
            });

            // Update messages to mark streaming as completed
            setMessages((prev) => {
              return prev
                .map((msg) => {
                  if (msg.isStreaming) {
                    return {
                      ...msg,
                      isStreaming: false,
                      isStreamingCompleted: true
                    };
                  }
                  return msg;
                })
                .filter((msg) => !msg.isStatus && !msg.isLoading);
            });

            setFinalDocument(documentRef.current);
            setEditedContent(documentRef.current);
            setLoading(false);
            setIsSkipClicked(false);
            setStatusMessage(null);
            setCurrentQuestion(null);
            setOriginalQuery("");
            setOriginalQueryId("");
            scrollToBottom();
          }

          // Handle explicit progress updates (if API explicitly sends them)
          if (
            streamData.type === "progress" &&
            streamData.progress !== undefined
          ) {
            setProgressState((prev) => ({
              ...prev,
              value: streamData.progress,
              status: streamData.status || prev.status
            }));
            return;
          }
        } catch {
          toast.error("Error processing server response", {
            position: "bottom-right"
          });
          setLoading(false);
          setIsReceivingTokens(false);
          limitMutate();
          // Reset progress state on error
          setProgressState({
            value: 0,
            status: "error",
            isStreaming: false
          });
        }
      };

      socket.onclose = (event) => {
        setWsStatus("disconnected");

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        if (event.code !== 1000) {
          reconnectAttempts.current += 1;
          const delay = Math.min(
            1000 * Math.pow(1.5, reconnectAttempts.current),
            10000
          );
          setStatusMessage(
            `Connection lost. Reconnecting in ${Math.round(delay / 1000)}s...`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          setStatusMessage(null);
        }
      };

      socket.onerror = () => {
        setWsStatus("error");
        toast.error("Connection error. Trying to reconnect...", {
          position: "bottom-right",
          duration: 3000
        });

        // Reset progress state on connection error
        setProgressState({
          value: 0,
          status: "error",
          isStreaming: false
        });
      };
    } catch {
      setWsStatus("error");
      setStatusMessage("Failed to establish connection");

      reconnectAttempts.current += 1;
      const delay = Math.min(
        1000 * Math.pow(1.5, reconnectAttempts.current),
        10000
      );
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, delay);
    }
  }, [sessionId, scrollToBottom, processTokenBuffer]);

  const handleSelectSession = useCallback(
    (sessionIds: string) => {
      setSelectedSessionId(sessionIds);
      setSessionId(sessionIds);
      setMessages([]);
      setFinalDocument("");
      setEditedContent("");
      setCurrentView("chat");
      setActiveDocumentId(null);
      setCurrentQuestion(null);
      setOriginalQuery("");
      setIsReceivingTokens(false);
      // Reset progress state
      setProgressState({
        value: 0,
        status: "idle",
        message: "",
        isStreaming: false
      });
      connectWebSocket();
    },
    [setSessionId]
  );

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!loading && inputRef.current && currentView === "chat") {
      inputRef.current.focus();
    }
  }, [loading, currentView]);

  useEffect(() => {
    let tokenFlushInterval: NodeJS.Timeout | null = null;
    let forcedFlushInterval: NodeJS.Timeout | null = null;

    const flushTokens = () => {
      processTokenBuffer(false);
    };

    const forceFlushTokens = () => {
      processTokenBuffer(true);
    };

    if (isReceivingTokens) {
      tokenFlushInterval = setInterval(flushTokens, 300);
      forcedFlushInterval = setInterval(forceFlushTokens, 1000);
    }

    return () => {
      if (tokenFlushInterval) {
        clearInterval(tokenFlushInterval);
      }
      if (forcedFlushInterval) {
        clearInterval(forcedFlushInterval);
      }
    };
  }, [isReceivingTokens, processTokenBuffer]);

  useEffect(() => {
    if (sessionId) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
        wsRef.current = null;
      }

      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [sessionId, connectWebSocket]);

  const handleSubmit = useCallback(
    (inputQuery: string) => {
      if (!inputQuery.trim()) {
        return;
      }
      if (loading) {
        toast.info("Still processing your previous request", {
          position: "bottom-right",
          duration: 2000
        });
        return;
      }
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        toast.error("Connection lost. Reconnecting...", {
          position: "bottom-right"
        });
        connectWebSocket();
        return;
      }
      setLoading(true);
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      const queryId = `query-${Date.now()}`;
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        query: inputQuery,
        response: "",
        isUser: true,
        timestamp,
        queryId
      };
      setMessages((prev) => [...prev, userMessage]);
      setStatusMessage("Processing...");
      documentRef.current = "";
      tokenBufferRef.current = "";
      setIsReceivingTokens(false);

      // Reset progress state when submitting new query
      setProgressState({
        value: 0,
        status: "processing",
        isStreaming: false
      });

      const payload: {
        session_id: string;
        user_query: string;
        query_id: string;
        policy_id?: string;
        answers?: Record<string, string>;
        original_query?: string;
      } = {
        session_id: sessionId,
        user_query: inputQuery,
        query_id: queryId
      };
      if (selectedTemplate) {
        payload.policy_id = selectedTemplate.id;
      }
      if (currentQuestion) {
        payload.answers = { [currentQuestion]: inputQuery };
        payload.original_query = originalQuery;
        payload.query_id = originalQueryId;
      }
      try {
        wsRef.current.send(JSON.stringify(payload));
        setQuery("");
        setIsSkipClicked(true);
        scrollToBottom();
      } catch {
        toast.error("Failed to send message. Reconnecting...", {
          position: "bottom-right"
        });
        setLoading(false);
        connectWebSocket();
      }
    },
    [
      loading,
      sessionId,
      currentQuestion,
      originalQuery,
      originalQueryId,
      selectedTemplate,
      scrollToBottom,
      connectWebSocket
    ]
  );

  const handleEditDocument = useCallback(
    (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (message && message.response) {
        setEditedContent(message.response);
        setIsEditDialogOpen(true);
      }
    },
    [messages]
  );

  const handleViewDocument = useCallback(
    (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (message && message.response) {
        setFinalDocument(message.response);
        setEditedContent(message.response);
      }
      setActiveDocumentId(messageId);
      setCurrentView("document");
    },
    [messages]
  );

  const generatePDF = useCallback(
    async (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (!message || !message.response) {
        toast.error("No content available to generate PDF.");
        return;
      }
      const token = getFromLocalStorage("ACCESS_TOKEN");
      setGenerating(true);

      try {
        const encoder = new TextEncoder();
        const datas = encoder.encode(message.response);
        const base64Content = btoa(String.fromCharCode(...datas));

        const res = await fetch("/api/cv/v1/conversation/generate-pdf", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content: base64Content
          })
        });

        if (res.ok && res.status === 200) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "policy.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success("PDF generated successfully", {
            position: "bottom-right"
          });
          limitMutate();
        } else {
          const errorData = await res
            .json()
            .catch(() => ({ message: "Unknown error" }));
          toast.error(
            `Failed to generate PDF: ${errorData.message || res.statusText}`,
            {
              position: "bottom-right"
            }
          );
        }
      } catch {
        toast.error("Failed to generate PDF. Please try again.", {
          position: "bottom-right"
        });
      } finally {
        setGenerating(false);
      }
    },
    [messages]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    processTokenBuffer(true);

    setLoading(false);
    setIsReceivingTokens(false);
    setFinalDocument(documentRef.current);
    setEditedContent(documentRef.current);
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    setMessages((prev) => [
      ...prev
        .filter((msg) => !msg.isLoading)
        .map((msg) =>
          msg.isStreaming
            ? { ...msg, isStreaming: false, isStreamingCompleted: true }
            : msg
        ),
      {
        id: `stopped-${Date.now()}`,
        query: "",
        response:
          "Generation stopped. You can continue editing or start a new request.",
        isUser: false,
        timestamp
      }
    ]);

    // Reset progress state on stop
    setProgressState({
      value: 0,
      status: "stopped",
      isStreaming: false
    });

    setStatusMessage(null);
    setCurrentQuestion(null);
    setOriginalQuery("");

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: "stop_generation" }));
      } catch {
        // Handle error
      }
    }
  }, [processTokenBuffer]);

  const toggleMobileNav = useCallback(() => {
    setShowMobileNav((prev) => !prev);
  }, []);

  const getActiveDocumentContent = useCallback(() => {
    if (!activeDocumentId) {
      return finalDocument || editedContent || "";
    }
    const message = messages.find((msg) => msg.id === activeDocumentId);
    return message?.response || finalDocument || editedContent || "";
  }, [activeDocumentId, messages, finalDocument, editedContent]);

  const handleGenerateSession = useCallback(async () => {
    try {
      if (wsRef.current) {
        wsRef.current.close(1000, "New session initiated");
        wsRef.current = null;
        setSessionId("");
      }

      setWsStatus("disconnected");
      reconnectAttempts.current = 0;
      setLoading(false);
      setIsReceivingTokens(false);

      const res = await mutation("conversation/chat_id", {
        method: "POST",
        body: { user_id: userId }
      });

      if (res?.status === 200 && res?.results?.session_id) {
        limitMutate();
        mutate();
        setSessionId(res.results.session_id);
        setSelectedSessionId("");
        setMessages([]);
        setFinalDocument("");
        setEditedContent("");
        setSelectedTemplate(null);
        setCurrentView("chat");
        setActiveDocumentId(null);
        setCurrentQuestion(null);
        setOriginalQuery("");
        setStatusMessage(null);
        documentRef.current = "";
        tokenBufferRef.current = "";

        // Reset progress state
        setProgressState({
          value: 0,
          status: "idle",
          isStreaming: false
        });

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        toast.success("New session created", {
          position: "bottom-right",
          duration: 2000
        });
      } else {
        toast.error("Failed to generate session. Please try again.", {
          position: "bottom-right"
        });
        setWsStatus("error");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create session",
        {
          position: "bottom-right"
        }
      );
      setWsStatus("error");
    }
  }, [userId, mutation, setSessionId]);

  const handleDeleteSession = useCallback(
    async (sessionIds: string) => {
      try {
        const res = await deleteMutation(
          `conversation/session/?session_id=${sessionIds}`,
          {
            method: "DELETE"
          }
        );
        if (res?.status === 200) {
          toast.success("Chat deleted successfully", {
            position: "bottom-right"
          });
          mutate();
          setMessages([]);
          setSelectedSessionId("");
          limitMutate();
          // If we deleted the current session, create a new one
          if (sessionIds === selectedSessionId) {
            handleGenerateSession();
          }
        } else {
          toast.error("Failed to delete chat", {
            position: "bottom-right"
          });
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred",
          { position: "bottom-right" }
        );
      }
    },
    [deleteMutation, mutate, selectedSessionId, handleGenerateSession]
  );

  const hasValidContent = useCallback(
    (messageId: string): boolean => {
      const message = messages.find((msg) => msg.id === messageId);
      return !!(
        message &&
        message.response &&
        message.response.trim().length > 10 &&
        !message.isQuestion
      );
    },
    [messages]
  );

  // Filter messages for rendering
  const renderedMessages = useMemo(() => {
    // Filter out empty or status messages
    const filteredMessages = messages.filter(
      (msg) =>
        !msg.isStatus &&
        (msg.isUser ||
          msg.isQuestion ||
          (msg.response && msg.response.trim().length > 0))
    );

    return filteredMessages.map((msg) => {
      const baseProps = {
        ...msg,
        getActiveDocumentContent,
        currentView,
        setCurrentView,
        isDocument: msg.isDocument ?? false,
        progressState
      };

      // Only add callback props for non-user messages
      if (!msg.isUser) {
        return (
          <ChatMessage
            key={msg.id}
            {...baseProps}
            onEditDocument={handleEditDocument}
            onViewDocument={handleViewDocument}
            onGeneratePDF={generatePDF}
          />
        );
      }

      return <ChatMessage key={msg.id} {...baseProps} />;
    });
  }, [
    messages,
    handleEditDocument,
    handleViewDocument,
    generatePDF,
    hasValidContent,
    getActiveDocumentContent,
    currentView,
    setCurrentView,
    progressState
  ]);
  const handlePurchaseToken = async () => {
    try {
      const res = await tokenMutation("buy-additional-tokens", {
        method: "POST",
        isAlert: false
      });

      if (res?.status === 200) {
        window.open(res?.results?.payment_url, "_blank");
        toast.success("Redirecting to payment page...");
      } else {
        toast.error("Failed to purchase additional policy documents");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  // Enhanced status message with progress bar
  const StatusMessage = ({
    message,
    progress
  }: {
    message: string;
    progress?: number;
  }) => {
    const progressValue =
      progress !== undefined ? progress : progressState.value;
    const showProgress =
      progressState.status !== "idle" &&
      progressState.status !== "stopped" &&
      !progressState.isStreaming;

    return (
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: "spring", damping: 14 }}
      >
        <div className="flex justify-start">
          <motion.div
            className="relative max-w-full overflow-hidden rounded-2xl border border-gray-100/70 bg-gradient-to-br from-white to-tertiary-50/80 px-5 py-4 shadow-lg dark:border-neutral-700/50 dark:bg-gradient-to-br dark:from-darkSidebarBackground dark:to-darkMainBackground/80 dark:text-gray-200"
            initial={{ boxShadow: "0 8px 24px -6px rgba(99, 102, 241, 0.08)" }}
            animate={{
              boxShadow: [
                "0 8px 24px -6px rgba(99, 102, 241, 0.08)",
                "0 12px 32px -4px rgba(99, 102, 241, 0.18)",
                "0 8px 24px -6px rgba(99, 102, 241, 0.08)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Animated background elements */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{ overflow: "hidden" }}
            >
              {/* Animated gradient orbs */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`orb-${i}`}
                  className="absolute rounded-full bg-gradient-to-br from-tertiary-400 to-tertiary-600 opacity-40 blur-2xl dark:from-tertiary-600 dark:to-tertiary-900"
                  style={{
                    width: 30 + Math.random() * 120,
                    height: 30 + Math.random() * 120,
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`
                  }}
                  animate={{
                    x: [
                      Math.random() * 40 - 20,
                      Math.random() * 40 - 20,
                      Math.random() * 40 - 20
                    ],
                    y: [
                      Math.random() * 40 - 20,
                      Math.random() * 40 - 20,
                      Math.random() * 40 - 20
                    ],
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 8 + Math.random() * 8,
                    times: [0, 0.5, 1],
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}

              {/* Light beam effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-tertiary-300/10 to-transparent dark:via-tertiary-600/5"
                animate={{
                  backgroundPosition: ["200% 100%", "-100% 100%"]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: "200% 100%" }}
              />
            </motion.div>

            <div className="relative flex items-center gap-4 text-gray-900 dark:text-gray-200">
              {/* Animated avatar with enhanced effects */}
              <div className="relative">
                <motion.div
                  className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-100 to-tertiary-200 text-tertiary-600 dark:from-tertiary-900/70 dark:to-tertiary-800/50 dark:text-tertiary-400"
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
                    <Bot size={24} />
                  </motion.div>
                </motion.div>

                {/* Orbiting dots */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`orbit-${i}`}
                    className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary-400 dark:bg-tertiary-500"
                    animate={{
                      x: Math.cos((i * Math.PI * 2) / 3) * 16,
                      y: Math.sin((i * Math.PI * 2) / 3) * 16,
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

              <div className="flex flex-col">
                {/* Enhanced text animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={message}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden"
                  >
                    <motion.div
                      className="flex flex-wrap items-center text-sm font-medium md:text-base"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                      {message.split(" ").map((word, wordIdx) => (
                        <motion.span
                          key={`${message}-word-${wordIdx}`}
                          className="mr-1.5 inline-block"
                          initial={{ opacity: 0, y: 15, filter: "blur(2px)" }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)"
                          }}
                          transition={{
                            delay: 0.1 + wordIdx * 0.04,
                            duration: 0.4,
                            ease: "easeOut"
                          }}
                        >
                          {word}
                        </motion.span>
                      ))}

                      {/* Animated cursor with glow effect */}
                      <motion.div
                        className="relative ml-1 inline-block h-5 w-0.5 rounded bg-tertiary-500 dark:bg-tertiary-400"
                        animate={{
                          opacity: [1, 1, 0, 0, 1],
                          height: [14, 20, 20, 14, 14],
                          scaleY: [1, 1.1, 1.1, 1, 1]
                        }}
                        transition={{
                          times: [0, 0.3, 0.5, 0.7, 1],
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          boxShadow: "0 0 8px 1px rgba(99, 102, 241, 0.3)"
                        }}
                      />
                    </motion.div>

                    {/* Subtle text underline effect */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-gradient-to-r from-tertiary-400/20 via-tertiary-500/40 to-tertiary-400/0 dark:from-tertiary-400/30 dark:via-tertiary-300/60"
                      initial={{ width: "0%" }}
                      animate={{
                        width: ["0%", "100%"],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        times: [0, 0.6, 1],
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Progress bar when available */}
                {showProgress &&
                  message !== "Processing..." &&
                  progressValue > 0 && (
                    <motion.div
                      className="mt-2 w-full"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-tertiary-600 dark:text-tertiary-400">
                          {progressState.status === "completed"
                            ? "Completed"
                            : "Processing"}
                        </span>
                        <span className="text-xs font-medium text-tertiary-600 dark:text-tertiary-400">
                          {Math.round(progressValue)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-tertiary-500 to-tertiary-400 dark:from-tertiary-600 dark:to-tertiary-500"
                          initial={{ width: "0%" }}
                          animate={{ width: `${progressValue}%` }}
                          transition={{
                            duration: 0.4,
                            ease: "easeOut"
                          }}
                        />
                      </div>
                    </motion.div>
                  )}

                {/* Advanced loader with dot and line animations */}
                <div className="mt-3 flex flex-col">
                  <div className="flex items-center gap-2">
                    {/* Animated dots */}
                    <div className="flex items-center gap-1">
                      {[...Array(3)].map((_, idx) => (
                        <motion.div
                          key={`dot-${idx}`}
                          className="h-1.5 w-1.5 rounded-full bg-tertiary-400 dark:bg-tertiary-500"
                          animate={{
                            scale: [0.5, 1.2, 0.5],
                            opacity: [0.4, 1, 0.4]
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: idx * 0.2,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>

                    {/* Status text */}
                    <motion.span
                      className="text-xs text-tertiary-500/80 dark:text-tertiary-400/80"
                      animate={{
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      Processing your request
                    </motion.span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const StatusIndicator = () => {
    const color =
      wsStatus === "connected"
        ? "bg-green-500"
        : wsStatus === "connecting"
          ? "bg-yellow-500"
          : "bg-red-500";
    return (
      <motion.div
        className={`h-3 w-3 rounded-full ${color}`}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1 }}
      />
    );
  };

  if (sessionId?.length === 0) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-tertiary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Generating Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-600 dark:bg-darkSidebarBackground"
    >
      {showMobileNav && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleMobileNav}
        />
      )}

      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-tertiary-600"></div>
            <p className="mt-4 text-gray-800 dark:text-white">
              Generating your PDF...
            </p>
          </div>
        </motion.div>
      )}

      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-neutral-600 dark:bg-darkSidebarBackground">
        <div className="flex items-center">
          {isMobile && (
            <button
              onClick={toggleMobileNav}
              className="mr-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="flex items-center">
            <span className="text-base font-semibold text-gray-900 dark:text-white md:text-lg">
              Policy Assistant
            </span>
            {!isMobile && (
              <span className="ml-2 rounded-full bg-indigo-700 px-3 py-0.5 font-semibold text-white">
                Beta Mode
              </span>
            )}
            <div className="pl-2">
              <Tooltip title={"Chat History"} arrow placement="top">
                <IconButton onClick={() => setHistoryOpen(!historyOpen)}>
                  <MdOutlineHistory className="text-xl text-tertiary" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <CustomButton
            loading={isLoading}
            disabled={isLoading}
            startIcon={<Plus size={16} />}
            onClick={handleGenerateSession}
            loadingText="Intializing..."
            className="!text-[0.6rem]"
          >
            New Chat
          </CustomButton>
          <div className="w-fit">
            <StatusIndicator />
          </div>
          <div className="hidden md:block">
            <Tooltip
              title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={async () => {
                  if (isFullScreen) {
                    try {
                      await document.exitFullscreen();
                    } catch {
                      toast.error("Failed to exit full-screen mode");
                    }
                  } else {
                    try {
                      if (rootRef.current) {
                        await rootRef.current.requestFullscreen();
                      }
                    } catch {
                      toast.error("Failed to enter full-screen mode");
                    }
                  }
                }}
                className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label={
                  isFullScreen ? "Exit full screen" : "Enter full screen"
                }
              >
                {isFullScreen ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                )}
              </motion.button>
            </Tooltip>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <motion.div
            className="flex-shrink-0 overflow-hidden border-r border-gray-200 bg-white dark:border-neutral-600 dark:bg-darkSidebarBackground"
            initial={false}
            animate={{ width: isSidebarOpen ? 320 : 0 }}
          >
            <TabbedSidebar
              data={data}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              setQuery={setQuery}
              inputRef={inputRef}
            />
          </motion.div>
        )}

        {isMobile && showMobileNav && (
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-4/5 overflow-y-auto bg-white shadow-xl dark:bg-darkSidebarBackground"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-neutral-600">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Policy Assistant
                </h2>
                <button
                  onClick={toggleMobileNav}
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <TabbedSidebar
                  data={data}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={(template: PolicyTemplate | null) => {
                    setSelectedTemplate(template);
                    if (template) {
                      toggleMobileNav();
                    }
                  }}
                  setQuery={(querys: React.SetStateAction<string>) => {
                    setQuery(querys);
                    toggleMobileNav();
                  }}
                  inputRef={inputRef}
                />
              </div>
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <Zap size={18} className="mb-2 text-tertiary-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Powered by
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Policy AI Assistant
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <EditDialog
            isEditDialogOpen={isEditDialogOpen}
            setIsEditDialogOpen={setIsEditDialogOpen}
            editedContent={editedContent}
            setEditedContent={setEditedContent}
            setFinalDocument={setFinalDocument}
            setMessages={setMessages}
          />

          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key="chat-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative flex h-full w-full flex-col"
              >
                <ClickOutside onClick={() => setHistoryOpen(false)}>
                  <PolicyHistory
                    sessions={policySessionsHistory?.policy_sessions || null}
                    loading={isValidating}
                    currentSessionId={selectedSessionId}
                    onSelectSession={handleSelectSession}
                    onDeleteSession={handleDeleteSession}
                    isLoading={deleteLoading}
                    open={historyOpen}
                    setOpen={setHistoryOpen}
                  />
                </ClickOutside>
                <div className="flex-1 overflow-y-auto p-4">
                  {policySessionIdsHistoryLoading || loadingSessionHistory ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-tertiary-500 border-t-transparent"></div>
                    </div>
                  ) : messages.length === 0 && !selectedSessionId ? (
                    <div className="flex h-full w-full items-start justify-center p-8">
                      <div className="w-full max-w-2xl">
                        {/* Clean Header */}
                        <div className="mb-6">
                          <div className="flex items-center gap-6">
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                AI Policy Assistant
                              </h2>
                              <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                                {` In just a few minutes you'll have a policy your
                                team can trust.`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div>
                          {/* Steps */}
                          <div className="mb-10">
                            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                              <CheckCircle
                                size={20}
                                className="text-tertiary-500"
                              />
                              Getting Started
                            </h3>

                            <div className="space-y-3">
                              {[
                                "Pick a template on the left or build from scratch.",
                                "Answer a handful of required questions (optional ones to enhance policy).",
                                "Edit live once the draft appears, then save or download.",
                                "Typically takes 2–5 minutes. You can always come back and pick up from your chat history."
                              ].map((step, index) => (
                                <div
                                  key={index}
                                  tabIndex={0}
                                  role="button"
                                  className={`flex items-start gap-4 ${
                                    index === 3 ? "cursor-pointer" : ""
                                  }`}
                                  onClick={() => {
                                    if (index === 3) {
                                      setHistoryOpen(true);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      if (index === 3) {
                                        setHistoryOpen(true);
                                      }
                                    }
                                  }}
                                >
                                  <div className="mt-0.5 font-medium text-tertiary-500">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-base text-gray-700 dark:text-gray-300">
                                      {step}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Disclaimer */}
                          <div className="mt-8">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                Note:{" "}
                              </span>
                              For tailored legal advice and to ensure full
                              compliance with applicable laws, please consult
                              with a qualified lawyer.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative mx-auto w-full pb-32 2xl:max-w-5xl">
                      {renderedMessages}
                      {statusMessage && (
                        <StatusMessage message={statusMessage} />
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 bg-white p-4 dark:border-neutral-600 dark:bg-darkSidebarBackground">
                  <div className="mx-auto max-w-3xl">
                    <div className="relative flex items-center">
                      {/* Input field */}
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={
                          selectedTemplate
                            ? "Answer the question..."
                            : "Type something"
                        }
                        className="w-full rounded-full border border-gray-300 bg-white py-3 pl-6 pr-28 text-gray-800 shadow-sm outline-none transition-all focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-700 dark:bg-darkMainBackground dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-gray-600 dark:focus:ring-gray-600"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !loading && query.trim()) {
                            handleSubmit(query);
                            if (messages.length === 0) {
                              setMetaTitle(
                                query.charAt(0).toUpperCase() + query.slice(1)
                              );
                            }
                          }
                        }}
                        disabled={loading || fetchLimits?.ai_policy_left === 0}
                      />
                      {currentQuestion && !isSkipClicked && (
                        <div className="absolute right-24 top-2.5">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSubmit("SKIP")}
                            className="rounded-full bg-tertiary-600 px-4 py-1.5 text-sm font-medium text-white"
                          >
                            Skip question
                          </motion.button>
                        </div>
                      )}
                      {/* Action buttons */}
                      <div className="absolute right-2 flex space-x-2">
                        {loading ? (
                          <div className="flex items-center">
                            {/* Stop button with circular loader */}
                            <div className="relative">
                              <button
                                onClick={stopStreaming}
                                className="flex items-center justify-center rounded-full bg-tertiary-100 px-4 py-2 text-sm font-medium text-tertiary-800 transition-colors hover:bg-tertiary-200 dark:bg-tertiary-700/30 dark:text-tertiary-200 dark:hover:bg-tertiary-700/50"
                              >
                                <div className="relative mr-1 flex items-center justify-center">
                                  <FaStop className="mr-3 size-3" />
                                  <div className="absolute -top-1.5 right-1.5">
                                    <div className="size-6 animate-spin rounded-full border-[3px] border-tertiary border-t-transparent"></div>
                                  </div>
                                </div>
                                <span className="font-semibold">Stop</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (query.trim()) {
                                handleSubmit(query);
                              }
                              if (messages.length === 0) {
                                setMetaTitle(
                                  query.charAt(0).toUpperCase() + query.slice(1)
                                );
                              }
                            }}
                            disabled={
                              !query.trim() || fetchLimits?.ai_policy_left === 0
                            }
                            className={`flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                              !query.trim()
                                ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                                : "bg-tertiary text-white"
                            }`}
                          >
                            Run
                            <span className="ml-1 text-lg">↵</span>
                          </button>
                        )}
                      </div>

                      {/* Rest of your component remains the same */}
                      {selectedTemplate && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -top-4 left-4"
                        >
                          <span className="inline-flex items-center rounded-full bg-tertiary-100 px-2 py-1 text-xs font-medium text-tertiary-800 dark:bg-darkSidebarBackground dark:text-tertiary-300">
                            Template: {selectedTemplate.name}
                            <button
                              onClick={() => {
                                if (!loading) {
                                  setSelectedTemplate(null);
                                } else {
                                  toast.error(
                                    "Please wait until the current process is finished."
                                  );
                                }
                              }}
                              className="ml-1 text-tertiary-600 hover:text-tertiary-800 dark:text-tertiary-300"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        </motion.div>
                      )}
                      {fetchLimits &&
                        (fetchLimits?.ai_policy_left <= 2 ||
                          fetchLimits?.ai_policy_left === 0) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-20 left-0 w-full"
                          >
                            <div className="w-full">
                              <div className="flex items-center justify-between rounded-full border border-tertiary-400 bg-white p-1.5 text-xs font-medium text-tertiary dark:bg-darkSidebarBackground dark:text-tertiary-300">
                                <div className="flex-1">
                                  <p className="pl-4 text-sm">
                                    {fetchLimits?.ai_policy_left === 0
                                      ? ` You've reached the current usage cap for AI
                                  policy generation. You can continue
                                  purchasing more tokens`
                                      : `You are running low on tokens. You have ${fetchLimits?.ai_policy_left} AI policy left.`}
                                  </p>
                                </div>
                                {fetchLimits?.subscription_status !==
                                  "trial" && (
                                  <div className="ml-4">
                                    <button
                                      type="button"
                                      onClick={handlePurchaseToken}
                                      className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-4 py-2 transition-colors duration-200 hover:bg-gray-200 dark:bg-darkMainBackground dark:hover:bg-darkHoverBackground"
                                    >
                                      <TrendingUpDown
                                        size={20}
                                        className="text-tertiary"
                                      />
                                      <span className="text-sm font-semibold tracking-wider text-gray-600 dark:text-white">
                                        {tokenLoading
                                          ? "Redirecting..."
                                          : " Get Token"}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                    </div>

                    <div className="flex w-full items-center justify-center gap-1 pt-2 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Powered by{" "}
                        <span className="font-medium text-tertiary-600 dark:text-tertiary-400">
                          Cognitiveview AI
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyAssistant;
