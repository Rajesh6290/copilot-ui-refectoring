"use client";
import useMutation from "@/shared/hooks/useMutation";
import usePermission from "@/shared/hooks/usePermission";
import { useMyContext } from "@/shared/providers/AppProvider";
import {
  saveToLocalStorage,
  SpeechRecognition,
  useCurrentMenuItem
} from "@/shared/utils";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { BadgeHelp, BadgeInfo } from "lucide-react";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Chat from "../chat/Chat";

interface RecommendProps {
  id: number;
  name: string;
  icon?: React.ReactNode;
}

interface CollectionItem {
  collection_id: string;
  collection_name: string;
}

const Homechat: React.FC = () => {
  const [searchString, setSearchString] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [buildScore, setBuildScore] = useState<boolean>(false);
  const [selectedCollections, setSelectedCollections] =
    useState<CollectionItem | null>(null);
  const { isLoading, mutation } = useMutation();
  const { userId } = useAuth();
  const { user, isUserLoading } = usePermission();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { setMetaTitle } = useMyContext();
  const currentMenuItem = useCurrentMenuItem();
  const handleGenerateSession = useCallback(
    async (query?: string, buildScores?: boolean) => {
      try {
        const res = await mutation("conversation/chat_id", {
          method: "POST",
          body: { user_id: userId }
        });
        if (res?.status === 200) {
          const effectiveQuery = query || searchString;
          saveToLocalStorage("initialQuery", effectiveQuery);
          const url = selectedCollections?.collection_id
            ? `/c/${res?.results?.session_id}?collectionId=${selectedCollections?.collection_id}&collectionName=${selectedCollections?.collection_name}`
            : buildScore || buildScores
              ? `/c/${res?.results?.session_id}?build_score=true`
              : `/c/${res?.results?.session_id}`;
          router.push(url);
          setMetaTitle(effectiveQuery);
        } else {
          toast.error("Failed to generate session");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    },
    [userId, router, searchString, mutation, selectedCollections, buildScore]
  );
  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey && searchString.length > 0) {
        event.preventDefault();
        handleGenerateSession();
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    };
    document.addEventListener("keydown", handleEnter);
    return () => document.removeEventListener("keydown", handleEnter);
  }, [searchString, handleGenerateSession]);
  useEffect(() => {
    if (
      currentMenuItem &&
      currentMenuItem?.buttons?.[2]?.permission?.is_shown
    ) {
      setSearchString("@Help ");
    }
  }, []);
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognitionConstructor =
        window["webkitSpeechRecognition"] || window["SpeechRecognition"];
      const recognition = new SpeechRecognitionConstructor();

      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript)
          .filter(Boolean)
          .join(" ")
          .trim();
        if (event.results[0]?.isFinal) {
          setSearchString((prev) => prev + " " + transcript);
        }
      };
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = "";
        switch (event.error) {
          case "not-allowed":
            errorMessage =
              "Microphone access denied. Please check permissions.";
            break;
          case "no-speech":
            errorMessage = "No speech detected. Try again.";
            break;
          default:
            errorMessage = `Error occurred: ${event.error}`;
        }
        setIsListening(false);
        toast.error(errorMessage);
      };
      recognition.onend = () => {
        setIsListening(false);
        textareaRef.current?.focus();
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => recognitionRef.current?.start())
        .catch(() => toast.error("Microphone access denied."));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };
  const RECOMMEND: RecommendProps[] = (() => {
    const all = [
      {
        id: 0,
        name: "Run a trace to know your Responsible AI score",
        icon: <BadgeInfo size={17} className="text-red-500" />
      },
      {
        id: 1,
        name: "Step-by-step help to use the platform",
        icon: <BadgeHelp size={17} className="text-green-500" />
      },
      {
        id: 2,
        name: "EU AI Act: High-Risk AI: Guidelines for high-risk AI systems",
        icon: <BadgeInfo size={17} className="text-red-500" />
      },
      {
        id: 3,
        name: "Policy Assistant Guide: Steps to draft policies with AI",
        icon: <BadgeHelp size={17} className="text-green-500" />
      }
    ];

    return !isUserLoading && user && user.plan === "Trial plan"
      ? all.filter((_, i) => i === 0) // Show only index 0 for trial users
      : all; // Show all items for non-trial users
  })();
  const isTrialUser = !isUserLoading && user && user.plan === "Trial plan";
  const isSingleRecommendation = RECOMMEND.length === 1;
  return (
    <div className="flex size-full flex-col items-center justify-center overflow-y-auto px-5 lg:px-0">
      <div className="flex w-full flex-col items-center gap-5">
        <div className="flex size-full items-center justify-center">
          <div className="w-full max-w-3xl">
            <div className="mb-8 flex flex-col items-center">
              <Image
                src="/logo.svg"
                alt="Product_logo"
                className="rounded md:mb-5"
                width={70}
                height={70}
                priority={true}
              />
              <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
                Welcome to Chat+
              </h2>
              <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 sm:text-base">
                Your trusted AI assistant for compliance, governance, and guided
                support
              </p>
            </div>
          </div>
        </div>
        <Chat
          loading={isLoading}
          searchString={searchString}
          setSearchString={setSearchString}
          handleGenerateSession={handleGenerateSession}
          startListening={startListening}
          stopListening={stopListening}
          isListening={isListening}
          selectedCollections={selectedCollections}
          setSelectedCollections={setSelectedCollections}
          setBuildScore={setBuildScore}
          buildScore={buildScore}
        />

        <div className="hidden w-full items-center justify-center lg:flex lg:w-4/5">
          <div
            className={`w-full ${
              isTrialUser && isSingleRecommendation
                ? "flex justify-center"
                : "grid grid-cols-1 gap-3 xl:grid-cols-4"
            }`}
          >
            {RECOMMEND.map(({ id, name, icon }) => (
              <div
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSearchString(name);
                  setTimeout(() => textareaRef.current?.focus(), 0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSearchString(name);
                    setTimeout(() => textareaRef.current?.focus(), 0);
                  }
                }}
                className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-darkSidebarBackground dark:shadow-gray-900/10 dark:hover:bg-darkMainBackground"
                aria-label={name}
              >
                <div className="flex size-10 items-center justify-center">
                  <motion.div
                    className="relative z-10 flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-50 to-tertiary-100 text-tertiary-600 dark:from-tertiary-900/70 dark:to-tertiary-800/50 dark:text-tertiary-400"
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
                      {icon}
                    </motion.div>
                  </motion.div>
                </div>

                <p className="line-clamp-1 text-xs font-medium text-gray-700 dark:text-gray-300 lg:line-clamp-none">
                  {name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homechat;
