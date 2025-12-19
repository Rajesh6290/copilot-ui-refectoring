"use client";
import { getinitialQuery } from "@/shared/utils";
import { BadgeHelp, DatabaseZap, FileText, SearchCheck } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { FaRegCircleStop } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";
import AttachedCollection from "./AttachedCollection";
import BrowsePrompt from "./BrowsePrompt";

interface CollectionItem {
  collection_id: string;
  collection_name: string;
}

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

const ChatBox = ({
  setQuery,
  query,
  handleSubmit,
  loading,
  stopStreaming,
  selectedCollections,
  setSelectedCollections,
  isAccess,
  buildScore,
  setBuildScore
}: {
  setQuery: Dispatch<SetStateAction<string>>;
  query: string;
  handleSubmit: (responsibleQuery?: string, build_Score?: boolean) => void;
  loading: boolean;
  stopStreaming: () => void;
  selectedCollections: CollectionItem | null;
  setSelectedCollections: (items: CollectionItem | null) => void;
  isAccess: IsAccess;
  buildScore?: boolean;
  setBuildScore: Dispatch<SetStateAction<boolean>>;
}) => {
  const initialQuery = getinitialQuery();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const collectionId = useSearchParams().get("collectionId");
  const collectionName = useSearchParams().get("collectionName");
  const buildScoreValue = useSearchParams().get("build_score");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = new URLSearchParams(searchParams.toString());
  const [openPromptsDialog, setOpenPromptsDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const helpModeActive = query.startsWith("@Help");

  useEffect(() => {
    if (collectionId && collectionName) {
      setSelectedCollections({
        collection_id: collectionId,
        collection_name: collectionName
      });
    }
  }, [collectionId, collectionName, setSelectedCollections]);

  useEffect(() => {
    if (buildScoreValue) {
      setBuildScore(true);
    }
  }, [buildScoreValue, setBuildScore]);

  const removeFromUrl = () => {
    const current = new URL(window.location.href);
    current.searchParams.delete("build_score");
    router.replace(current.pathname + current.search, { scroll: false });
  };

  const handleDeleteCollection = () => {
    if (collectionId && collectionName) {
      setSelectedCollections(null);
      params.delete("collectionId");
      params.delete("collectionName");
      router.replace(`${pathname}?${params.toString()}`);
    } else {
      setSelectedCollections(null);
    }
  };

  // Handle Enter key press
  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey && query?.length > 0) {
        handleSubmit();
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", handleEnter);
    return () => {
      document.removeEventListener("keydown", handleEnter);
    };
  }, [query, handleSubmit]);

  // Handle initial query
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSubmit();
    }
  }, [initialQuery, handleSubmit, setQuery]);

  const handleHelpClick = () => {
    if (helpModeActive) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    } else {
      setSelectedCollections(null);
      let newSearchString = "@Help ";
      if (query.trim().length > 0) {
        newSearchString += query.trim();
      }
      setQuery(newSearchString);
      setBuildScore(false);
      removeFromUrl();
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = newSearchString.length;
          textareaRef.current.selectionEnd = newSearchString.length;
        }
      }, 0);
    }
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const renderTextarea = () => {
    const handleTextareaChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      let value = e.target.value;

      if (helpModeActive) {
        value = value.replace(/@Help/g, "");
        setQuery("@Help " + value);
      } else {
        setQuery(value);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Backspace" && helpModeActive) {
        const textAfterHelp = query.replace("@Help ", "").trim();
        if (textAfterHelp.length === 0) {
          setQuery("");
          e.preventDefault();
        }
      }
    };

    return (
      <div className="relative w-full">
        {helpModeActive && (
          <div className="absolute left-2 top-2.5 z-10 rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-600">
            @Help
          </div>
        )}

        <Textarea
          ref={textareaRef}
          tabIndex={0}
          placeholder={
            helpModeActive
              ? "Try asking: How can I publish my Trust Center Report ? and more..."
              : "Ask Something..."
          }
          className={`w-full resize-none bg-transparent p-2 dark:placeholder:text-neutral-400 ${helpModeActive ? "pl-18 dark:pl-18" : ""} focus:outline-none dark:text-white placeholder:dark:text-white sm:text-base`}
          spellCheck={false}
          autoComplete="on"
          autoCorrect="on"
          name="message"
          minRows={1}
          maxRows={10}
          disabled={loading}
          value={helpModeActive ? query.replace("@Help ", "") : query}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 z-999 flex h-fit w-full items-center justify-center px-2 duration-300 lg:absolute lg:px-0">
        <div className="flex h-fit w-full items-start justify-center rounded-2xl bg-lightMainBackground drop-shadow-lg dark:bg-darkMainBackground lg:w-3/4 2xl:w-3/5">
          <div className="shadow-2 mb-2 flex w-full flex-wrap items-end justify-center rounded-xl border-[#D7D7D7] drop-shadow-2 dark:border dark:border-[#272729]">
            <span className="mx-2 flex w-full grow flex-col">
              {selectedCollections && selectedCollections?.collection_id && (
                <div className="relative my-2 flex w-52 max-w-md items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1">
                  <button
                    onClick={() => handleDeleteCollection()}
                    className="absolute -right-1 -top-1 cursor-pointer"
                    aria-label="Remove collection"
                  >
                    <MdCancel className="text-sm text-black dark:invert" />
                  </button>
                  <span className="flex size-8 items-center justify-center rounded-md bg-tertiary">
                    <FileText size={16} className="text-white" />
                  </span>
                  <span className="flex w-full flex-col">
                    <p className="line-clamp-1 w-full text-sm font-medium text-gray-900 dark:invert">
                      {selectedCollections?.collection_name}
                    </p>
                    <p className="text-xs font-medium text-gray-600">
                      Collection
                    </p>
                  </span>
                </div>
              )}

              <div className="flex w-full grow pt-3" ref={inputContainerRef}>
                {renderTextarea()}
              </div>
            </span>
            <div className="flex w-full items-center justify-between rounded-b-xl bg-gray-100/80 p-2 dark:bg-gray-800/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {isAccess?.buttons?.[0]?.permission?.is_shown && (
                  <div className="group relative">
                    <button
                      onClick={() => {
                        if (
                          isAccess?.buttons?.[0]?.permission.actions?.create
                        ) {
                          setOpenDialog(true);
                          setBuildScore(false);
                          removeFromUrl();
                        } else {
                          toast.info(
                            "You do not have permission to add a collection."
                          );
                        }
                      }}
                      className="group ml-2 flex items-center rounded-lg border-0 bg-gray-200/60 p-1.5 text-gray-800 transition-all duration-200 hover:bg-gray-200 dark:gap-1 dark:rounded-3xl dark:border dark:border-neutral-700 dark:bg-transparent dark:px-3 dark:py-2 dark:text-white"
                    >
                      <DatabaseZap
                        size={17}
                        className="text-gray-500 dark:invert"
                      />
                      <h3 className="ml-2 hidden font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-wide text-gray-600 dark:text-white md:block">
                        All Sources
                      </h3>
                    </button>
                    <span className="absolute -top-8 left-1/2 z-9999 hidden w-fit -translate-x-1/2 transform text-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                      Add collection from knowledge
                    </span>
                  </div>
                )}
                {isAccess?.buttons?.[1]?.permission?.is_shown && (
                  <div className="group relative">
                    <button
                      onClick={() => {
                        if (
                          isAccess?.buttons?.[1]?.permission?.actions?.create
                        ) {
                          handleHelpClick();
                        } else {
                          toast.info(
                            "You do not have permission to access Help Center."
                          );
                        }
                      }}
                      className={`group flex items-center rounded-[8px] border-0 ${
                        helpModeActive
                          ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900/40 dark:text-tertiary-300"
                          : "bg-gray-200/60 text-gray-800 hover:bg-gray-200 dark:bg-transparent dark:text-white"
                      } p-1.5 transition-all duration-200 dark:gap-1 dark:rounded-3xl dark:border dark:border-neutral-700 dark:px-3 dark:py-2`}
                    >
                      <BadgeHelp
                        className={`${helpModeActive ? "text-tertiary-600 dark:text-tertiary-400" : "text-gray-500 dark:invert"}`}
                        size={17}
                      />
                      <h3
                        className={`ml-2 hidden font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-wide text-gray-600 md:block ${helpModeActive ? "text-tertiary" : "dark:text-white"}`}
                      >
                        Help Center
                      </h3>
                    </button>
                    <span className="absolute -top-8 left-1/2 hidden w-fit -translate-x-1/2 transform text-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                      Ask help related query
                    </span>
                  </div>
                )}
                <AttachedCollection
                  open={openDialog}
                  onClose={() => setOpenDialog(false)}
                  selectedCollections={selectedCollections as CollectionItem}
                  setSelectedCollections={setSelectedCollections}
                  setSearchString={setQuery}
                />
                {isAccess?.buttons?.[2]?.permission?.is_shown && (
                  <div className="group relative">
                    <button
                      onClick={() => {
                        if (
                          isAccess?.buttons?.[2]?.permission?.actions?.create
                        ) {
                          setOpenPromptsDialog(true);
                        } else {
                          toast.info(
                            "You do not have permission to access Browse Prompts."
                          );
                        }
                      }}
                      className="group flex items-center rounded-[8px] border-0 bg-gray-200/60 p-1.5 text-gray-800 transition-all duration-200 hover:bg-gray-200 dark:gap-1 dark:rounded-3xl dark:border dark:border-neutral-700 dark:bg-transparent dark:px-3 dark:py-2 dark:text-white"
                    >
                      <SearchCheck
                        className="text-gray-500 dark:invert"
                        size={17}
                      />
                      <h3 className="ml-2 hidden font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-wide text-gray-600 dark:text-white md:block">
                        Browse Prompt
                      </h3>
                    </button>
                    <span className="absolute -top-8 left-1/2 hidden w-fit -translate-x-1/2 transform text-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                      Quick prompts for compliance & governance
                    </span>
                  </div>
                )}
                <BrowsePrompt
                  open={openPromptsDialog}
                  onClose={() => setOpenPromptsDialog(false)}
                  onSelectPrompts={(prompts) => {
                    setQuery(prompts);
                    setSelectedCollections(null);
                    setBuildScore(false);
                    removeFromUrl();
                    // Immediately trigger submit after setting prompt
                    setTimeout(() => {
                      if (prompts.trim().length > 0) {
                        handleSubmit();
                      }
                    }, 0);
                  }}
                />
                {isAccess?.buttons?.[3]?.permission?.is_shown && (
                  <div className="group relative">
                    <button
                      onClick={() => {
                        const hasPermission =
                          isAccess?.buttons?.[3]?.permission?.actions?.create;
                        if (!hasPermission) {
                          toast.error(
                            "You don't have permission to access responsible AI"
                          );
                          return;
                        }
                        const traceQuery =
                          "Help me build my Responsible AI score using Trace.";
                        setQuery(traceQuery);
                        setBuildScore(true);
                        setSelectedCollections(null);
                        removeFromUrl();
                        // Immediately trigger submit after setting query
                        setTimeout(() => {
                          handleSubmit(traceQuery, true);
                        }, 0);
                      }}
                      className={`group flex items-center rounded-[8px] border-0 ${
                        buildScore
                          ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900/40 dark:text-tertiary-300"
                          : "bg-gray-200/60 text-gray-800 hover:bg-gray-200 dark:bg-transparent dark:text-white"
                      } p-1.5 transition-all duration-200 dark:gap-1 dark:rounded-3xl dark:border dark:border-neutral-700 dark:px-3 dark:py-2`}
                    >
                      <TbReportAnalytics
                        className={`${buildScore ? "text-tertiary-600 dark:text-tertiary-400" : "text-gray-500 dark:invert"}`}
                        size={17}
                      />
                      <h3
                        className={`ml-2 hidden font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-wide text-gray-600 md:block ${buildScore ? "text-tertiary" : "dark:text-white"}`}
                      >
                        Run a Trace
                      </h3>
                    </button>
                    <span className="absolute -top-8 left-1/2 hidden w-fit -translate-x-1/2 transform text-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                      Know your Responsible AI Score.
                    </span>
                  </div>
                )}
              </div>

              <div className="ml-auto mr-2 flex items-center justify-center gap-5">
                <button
                  type="submit"
                  onClick={() => {
                    if (query?.length > 0 && !loading) {
                      handleSubmit();
                    }
                  }}
                  className={`flex size-8 items-center justify-center rounded-full ${
                    query?.length > 0 && !loading
                      ? "cursor-pointer bg-gray-900 text-white dark:bg-white dark:text-gray-800"
                      : "cursor-not-allowed bg-gray-200/60 text-gray-700 dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  {loading ? (
                    <FaRegCircleStop
                      className="cursor-pointer text-xl"
                      onClick={stopStreaming}
                    />
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-4 pl-0.5"
                    >
                      <g clipPath="url(#clip0_13_57)">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.42933 0.535103C1.57625 -0.878102 -1.22326 2.54068 0.724874 5.05901L2.2264 7.00001H5.99999C6.55228 7.00001 6.99999 7.44773 6.99999 8.00001C6.99999 8.5523 6.55228 9.00001 5.99999 9.00001H2.22641L0.724874 10.941C-1.22326 13.4593 1.57624 16.8781 4.42931 15.4649L14.0727 10.6883C16.2973 9.58642 16.2973 6.41361 14.0727 5.31173L4.42933 0.535103Z"
                          fill="currentColor"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_13_57">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBox;
