"use client";
import CustomLoading from "@/shared/common/CustomLoading";
import usePermission from "@/shared/hooks/usePermission";
import { useScrollAnchor } from "@/shared/hooks/useScrollAnchor";
import useSwr from "@/shared/hooks/useSwr";
import { getFromLocalStorage, removeFromLocalStorage } from "@/shared/utils";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
const ChatBox = dynamic(() => import("./ChatBox"), {
  ssr: false
});
const Conversation = dynamic(() => import("./Conversation"), {
  ssr: false
});
interface IsAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
    };
  }[];
}
interface CollectionItem {
  collection_id: string;
  collection_name: string;
}
export interface ALLCHATDATA {
  user_query: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  AI_response: string;
  metadata: EnhancedMetadata[];
}
interface EnhancedMetadata {
  name: string;
  version: string;
  jurisdiction: string;
  description: string;
  link: string;
  title: string;
  organization: string;
  release_date: string;
  type: string;
  scope: string;
  status: string;
  key_features: string;
  favicon: string;
}

interface Message {
  query: string;
  response: string;
  isLoading: boolean;
  error?: string;
  collection_id?: string | undefined;
  showForm?: boolean;
  showArtifactCard?: boolean;
  enhancedMetadata?: EnhancedMetadata[];
}

const Chats = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isSessionValidated, setIsSessionValidated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const currentResponseRef = useRef<string>("");
  const showFormRef = useRef<boolean>(false);
  const showArtifactCardRef = useRef<boolean>(false);
  const hasReceivedDataRef = useRef<boolean>(false);
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldAutoScrollRef = useRef<boolean>(true);
  const enhancedMetadataRef = useRef<EnhancedMetadata[]>([]);
  const { user, isUserLoading } = usePermission();
  const currentAccess = isUserLoading
    ? {}
    : user?.resources?.UI?.[0]?.features?.[0];
  const [selectedCollections, setSelectedCollections] =
    useState<CollectionItem | null>(null);
  const [buildScore, setBuildScore] = useState<boolean>(false);
  const { data, isValidating } = useSwr(
    `conversation/user/chats?session_id=${params["id"]}`
  );
  const { messagesRef, scrollRef, visibilityRef, scrollToBottom, isAtBottom } =
    useScrollAnchor();

  // Update message response
  const updateMessageResponse = useCallback(
    (
      response: string,
      isError: boolean = false,
      showForm: boolean = false,
      showArtifactCard: boolean = false,
      enhancedMetadata?: EnhancedMetadata[]
    ) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (lastMessage) {
          if (!isError || !lastMessage.response) {
            lastMessage.response = response;
          }
          lastMessage.isLoading = false;
          lastMessage.showForm = showForm;
          lastMessage.showArtifactCard = showArtifactCard;
          if (enhancedMetadata && enhancedMetadata.length > 0) {
            lastMessage.enhancedMetadata = enhancedMetadata;
          }
          if (isError) {
            lastMessage.error = "Connection lost. Please try again.";
          } else {
            delete lastMessage.error;
          }
        }

        return updatedMessages;
      });
    },
    []
  );

  // Finalize message
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
      showFormRef.current,
      showArtifactCardRef.current,
      enhancedMetadataRef.current.length > 0
        ? enhancedMetadataRef.current
        : undefined
    );

    setLoading(false);
    currentResponseRef.current = "";
    showFormRef.current = false;
    showArtifactCardRef.current = false;
    hasReceivedDataRef.current = false;
    shouldAutoScrollRef.current = false;
    enhancedMetadataRef.current = [];
  }, [updateMessageResponse]);
  // Initialize WebSocket connection
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
          session_id: params["id"]
        })
      );
    };

    wsRef.current.onmessage = (event) => {
      try {
        const resData = JSON.parse(event.data);

        if (
          resData.type === "status" &&
          resData.message === "session_validated"
        ) {
          setIsSessionValidated(true);
          return;
        }

        if (resData.type === "ping") {
          wsRef.current?.send(JSON.stringify({ type: "pong" }));
          return;
        }

        if (resData.type === "token" && resData.token) {
          hasReceivedDataRef.current = true;
          currentResponseRef.current += resData.token;
          updateMessageResponse(
            currentResponseRef.current,
            false,
            showFormRef.current,
            showArtifactCardRef.current
          );

          if (shouldAutoScrollRef.current) {
            setTimeout(() => {
              scrollToBottom();
            }, 0);
          }

          if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
          }
          messageTimeoutRef.current = setTimeout(() => {
            finalizeMessage();
          }, 1000);
        }

        if (resData.artifact === "SHOW FORM") {
          showArtifactCardRef.current = true;
          updateMessageResponse(
            currentResponseRef.current,
            false,
            showFormRef.current,
            showArtifactCardRef.current
          );
        }

        if (resData.type === "done") {
          // Handle enhanced metaresData
          if (resData.metadata && Array.isArray(resData.metadata)) {
            enhancedMetadataRef.current = resData.metadata;
          }
          finalizeMessage();
        }

        if (data.error) {
          updateMessageResponse(
            currentResponseRef.current || "Stream error occurred.",
            true,
            showFormRef.current,
            showArtifactCardRef.current
          );
          setLoading(false);
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error?.message : "An error occurred."
        );
      }
    };

    wsRef.current.onerror = () => {
      setIsSocketConnected(false);
      setIsSessionValidated(false);
      updateMessageResponse(
        currentResponseRef.current || "WebSocket connection error.",
        true,
        showFormRef.current,
        showArtifactCardRef.current
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
          showFormRef.current,
          showArtifactCardRef.current
        );
      }
    };
  }, [params["id"], scrollToBottom]);

  // Handle message submission
  const handleSubmit = useCallback(
    (responsibleQuery?: string, buildScores?: boolean) => {
      if (query.trim() === "" || !isSocketConnected || !isSessionValidated) {
        if (!isSocketConnected || !isSessionValidated) {
          return;
        }
        return;
      }

      setLoading(true);
      const newMessage: Message = {
        query: buildScores ? (responsibleQuery as string) : query,
        response: "",
        isLoading: true,
        collection_id: selectedCollections?.collection_id,
        showForm: false,
        showArtifactCard: false
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setQuery("");
      removeFromLocalStorage("initialQuery");

      shouldAutoScrollRef.current = isAtBottom;

      setTimeout(() => {
        scrollToBottom();
      }, 0);

      currentResponseRef.current = "";
      showFormRef.current = false;
      showArtifactCardRef.current = false;
      hasReceivedDataRef.current = false;

      try {
        wsRef.current?.send(
          JSON.stringify({
            user_query:
              query === "Step-by-step help to use the platform"
                ? "@Help Step-by-step help to use the platform"
                : query ===
                    "Policy Assistant Guide: Steps to draft policies with AI"
                  ? "@Help Policy Assistant Guide: Steps to draft policies with AI"
                  : buildScores
                    ? responsibleQuery
                    : query,
            session_id: params["id"],
            assesment_rag: false,
            attachment: selectedCollections?.collection_id ? true : undefined,
            collection_id: selectedCollections?.collection_id || null,
            build_score: buildScore || buildScores ? true : undefined,
            flag: null
          })
        );
      } catch {
        updateMessageResponse(
          "Failed to send message. Please try again.",
          true,
          showFormRef.current,
          showArtifactCardRef.current
        );
        setLoading(false);
      }
    },
    [
      query,
      params["id"],
      isSocketConnected,
      isSessionValidated,
      selectedCollections?.collection_id,
      buildScore,
      isAtBottom,
      scrollToBottom
    ]
  );

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
      setLoading(false);
      finalizeMessage();
    }
  }, [finalizeMessage]);

  // Initialize WebSocket on mount and cleanup on unmount
  useEffect(() => {
    initializeWebSocket();
    return () => {
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
  }, [initializeWebSocket]);

  // Add scroll event listener
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return;
    }

    const handleScroll = () => {
      if (loading && !isAtBottom) {
        shouldAutoScrollRef.current = false;
      }
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [loading, isAtBottom]);

  if (!isSocketConnected) {
    return <CustomLoading message="" />;
  }

  if (isSocketConnected && !isSessionValidated) {
    return <CustomLoading message="" />;
  }

  return (
    <div
      ref={scrollRef}
      className="flex w-full items-start justify-center transition-all duration-300"
    >
      <div
        ref={messagesRef}
        style={{ paddingLeft: 0 }}
        className={`flex w-full flex-col gap-5 pt-5 lg:w-3/4 2xl:w-3/5 ${
          selectedCollections?.collection_id ? "pb-[8.9rem]" : "pb-24"
        }`}
      >
        {!loading && query?.length === 0 && isValidating ? (
          <CustomLoading message="Please wait, fetching data..." />
        ) : (
          data &&
          data?.messages?.length > 0 &&
          data?.messages?.map((item: ALLCHATDATA, index: number) => (
            <Conversation
              key={index}
              query={item?.user_query}
              response={item?.AI_response}
              isLoading={isValidating}
              error={""}
              enhancedMetadata={item?.metadata}
            />
          ))
        )}

        {messages.map((item, index) => (
          <Conversation
            key={index}
            query={item.query}
            response={item.response}
            isLoading={item.isLoading}
            loading={loading}
            error={item.error || ""}
            {...(item.collection_id && { collection_id: item.collection_id })}
            {...(item.showArtifactCard !== undefined && {
              showArtifactCard: item.showArtifactCard
            })}
            {...(item.enhancedMetadata && {
              enhancedMetadata: item.enhancedMetadata
            })}
          />
        ))}
        <div className="h-px w-full" ref={visibilityRef} />
      </div>
      <ChatBox
        setQuery={setQuery}
        query={query}
        handleSubmit={handleSubmit}
        loading={loading}
        stopStreaming={stopStreaming}
        setSelectedCollections={setSelectedCollections}
        selectedCollections={selectedCollections as CollectionItem}
        isAccess={currentAccess as IsAccess}
        buildScore={buildScore}
        setBuildScore={setBuildScore}
      />
    </div>
  );
};

export default Chats;
