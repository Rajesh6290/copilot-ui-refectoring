"use client";
import { useCurrentMenuItem } from "@/shared/utils";
import { BadgeHelp, DatabaseZap, FileText, SearchCheck } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from "react";
import { FaMicrophone } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";
import AttachedCollection from "../chat/AttachedCollection";
import BrowsePrompt from "../chat/BrowsePrompt";

interface CollectionItem {
  collection_id: string;
  collection_name: string;
}

interface ChatProps {
  loading: boolean;
  searchString: string;
  setSearchString: (value: string) => void;
  handleGenerateSession: (query?: string, build_Score?: boolean) => void;
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  selectedCollections: CollectionItem | null;
  setSelectedCollections: (items: CollectionItem | null) => void;
  buildScore: boolean;
  setBuildScore: Dispatch<SetStateAction<boolean>>;
}

const Chat: React.FC<ChatProps> = ({
  loading,
  searchString,
  setSearchString,
  handleGenerateSession,
  startListening,
  stopListening,
  isListening,
  selectedCollections,
  setSelectedCollections,
  buildScore,
  setBuildScore
}) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openPromptsDialog, setOpenPromptsDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const currentMenuItem = useCurrentMenuItem();
  // Check if help mode is active - handle "@Help" with or without space
  const helpModeActive = searchString.startsWith("@Help");

  // Focus textarea and set cursor position on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      if (helpModeActive) {
        // Set textarea value and cursor position
        const textAfterHelp = searchString.replace("@Help ", "");
        textareaRef.current.value = textAfterHelp;
        const cursorPosition = textAfterHelp.length;
        textareaRef.current.selectionStart = cursorPosition;
        textareaRef.current.selectionEnd = cursorPosition;
      }
    }
  }, []); // Run only on mount

  const handleDeleteCollection = () => {
    setSelectedCollections(null);
  };

  // Handle Help button click
  const handleHelpClick = () => {
    if (helpModeActive) {
      // Exit help mode, keep any text after "@Help "
      const textAfterHelp = searchString.replace("@Help ", "").trim();
      setSearchString(textAfterHelp);
      setTimeout(() => textareaRef.current?.focus(), 0);
    } else {
      // Enter help mode
      setSelectedCollections(null);
      let newSearchString = "@Help ";
      if (searchString.trim().length > 0) {
        newSearchString += searchString.trim();
      }
      setSearchString(newSearchString);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = newSearchString.length;
          textareaRef.current.selectionEnd = newSearchString.length;
        }
      }, 0);
    }
  };

  const renderTextarea = () => {
    const handleTextareaChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      let value = e.target.value;

      if (helpModeActive) {
        // Remove any additional "@Help" mentions to prevent duplication
        value = value.replace(/@Help/g, "");
        // Prepend "@Help " to maintain help mode
        setSearchString("@Help " + value);
      } else {
        setSearchString(value);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Backspace" && helpModeActive) {
        const textAfterHelp = searchString.replace("@Help ", "").trim();
        if (textAfterHelp.length === 0) {
          // Exit help mode if backspace is pressed and no text remains
          setSearchString("");
          e.preventDefault(); // Prevent default backspace behavior
        }
      }
    };

    return (
      <div className="relative w-full">
        {/* Help mode badge */}
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
          className={`w-full resize-none bg-transparent p-2 dark:placeholder:text-sm dark:placeholder:text-neutral-500 ${helpModeActive ? "pl-18 dark:pl-18" : ""} focus:outline-none dark:text-white sm:text-base`}
          spellCheck={false}
          autoComplete="on"
          autoCorrect="on"
          name="message"
          minRows={1}
          maxRows={10}
          disabled={loading}
          value={
            helpModeActive ? searchString.replace("@Help ", "") : searchString
          }
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  };

  return (
    <div className="fixed bottom-2 z-10 flex h-fit w-full items-center justify-center px-2 duration-300 dark:bg-transparent lg:relative lg:z-10 lg:px-0">
      <div className="flex h-fit w-full items-start justify-center rounded-2xl bg-lightMainBackground drop-shadow-lg dark:bg-darkSidebarBackground lg:w-4/5 xl:w-2/3">
        <div className="flex w-full flex-col rounded-xl dark:shadow-md">
          {/* Attached Collection Display */}
          {selectedCollections && selectedCollections?.collection_id && (
            <div className="relative ml-2 mt-2 flex w-52 max-w-md items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1">
              <button
                onClick={() => handleDeleteCollection()}
                className="absolute -right-1 -top-1 cursor-pointer border-none bg-transparent p-0 transition-transform hover:scale-110"
                aria-label="Remove collection"
                type="button"
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
                <p className="text-xs font-medium text-gray-600">Collection</p>
              </span>
            </div>
          )}

          {/* Input Area */}
          <div className="flex w-full grow px-2 pt-2" ref={inputContainerRef}>
            {renderTextarea()}
          </div>

          {/* Action Buttons */}
          <div className="flex w-full items-center justify-between rounded-b-2xl bg-gray-100/80 p-1.5 dark:bg-transparent dark:p-2 dark:pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Attach Button */}
              {currentMenuItem?.buttons?.[0]?.permission?.is_shown && (
                <div className="group relative">
                  <button
                    onClick={() => {
                      if (
                        currentMenuItem?.buttons?.[0]?.permission?.actions
                          ?.create
                      ) {
                        setOpenDialog(true);
                      } else {
                        toast.error(
                          "You don't have permission to add a collection"
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
              <AttachedCollection
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                selectedCollections={selectedCollections as CollectionItem}
                setSelectedCollections={setSelectedCollections}
                setSearchString={setSearchString}
              />

              {/* Help Button with Enhanced Tooltip */}
              {currentMenuItem?.buttons?.[2]?.permission?.is_shown && (
                <div className="group relative">
                  <button
                    onClick={() => {
                      if (
                        currentMenuItem?.buttons?.[2]?.permission?.actions
                          ?.create
                      ) {
                        handleHelpClick();
                        setBuildScore(false);
                      } else {
                        toast.error(
                          "You don't have permission to access Help Center"
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
                      className={`${
                        helpModeActive
                          ? "text-tertiary-600 dark:text-tertiary-400"
                          : "text-gray-500 dark:invert"
                      }`}
                      size={17}
                    />
                    <h3
                      className={`ml-2 hidden font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-wide text-gray-600 md:block ${
                        helpModeActive ? "text-tertiary" : "dark:text-white"
                      }`}
                    >
                      Help Center
                    </h3>
                  </button>
                  <span className="absolute -top-8 left-1/2 hidden w-fit -translate-x-1/2 transform text-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                    Ask help related query
                  </span>
                </div>
              )}
              {/* Browse Prompt Button */}
              {currentMenuItem?.buttons?.[2]?.permission?.is_shown && (
                <div className="group relative">
                  <button
                    onClick={() => {
                      if (
                        currentMenuItem?.buttons?.[2]?.permission?.actions
                          ?.create
                      ) {
                        setOpenPromptsDialog(true);
                      } else {
                        toast.error(
                          "You don't have permission to access Browse Prompts"
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
                  setSearchString(prompts);
                  setTimeout(() => textareaRef.current?.focus(), 0);
                  setSelectedCollections(null);
                }}
              />
              <div className="group relative">
                <button
                  onClick={() => {
                    const hasPermission =
                      currentMenuItem?.buttons?.[3]?.permission?.actions
                        ?.create;

                    if (!hasPermission) {
                      toast.error(
                        "You don't have permission to access responsible AI"
                      );
                      return;
                    }

                    // Define the trace query
                    const traceQuery =
                      "Help me build my Responsible AI score using Trace.";

                    // User has permission
                    if (helpModeActive) {
                      setBuildScore(true);
                      // setSearchString(traceQuery); // Update UI
                      handleGenerateSession(traceQuery, true); // Pass query directly
                    } else if (!buildScore) {
                      setBuildScore(true);
                      // setSearchString(traceQuery); // Update UI
                      handleGenerateSession(traceQuery, true); // Pass query directly
                    } else {
                      setSearchString("");
                      setBuildScore(false);
                    }
                  }}
                  className={`group flex items-center rounded-[8px] border-0 ${
                    buildScore
                      ? "bg-tertiary-100 text-tertiary-800 dark:bg-tertiary-900/40 dark:text-tertiary-300"
                      : "bg-gray-200/60 text-gray-800 hover:bg-gray-200 dark:bg-transparent dark:text-white"
                  } p-1.5 transition-all duration-200 dark:gap-1 dark:rounded-3xl dark:border dark:border-neutral-700 dark:px-3 dark:py-2`}
                >
                  <TbReportAnalytics
                    className={`${
                      buildScore
                        ? "text-tertiary-600 dark:text-tertiary-400"
                        : "text-gray-500 dark:invert"
                    }`}
                    size={17}
                  />
                  <h3
                    className={`ml-2 hidden font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-wide text-gray-600 md:block ${
                      buildScore ? "text-tertiary" : "dark:text-white"
                    }`}
                  >
                    Run a Trace
                  </h3>
                </button>
                <span className="absolute -top-8 left-1/2 hidden w-fit -translate-x-1/2 transform text-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-md group-hover:block">
                  Know your Responsible AI Score.
                </span>
              </div>
            </div>

            {/* Right-side Controls */}
            <div className="ml-auto mr-2 flex items-center gap-5">
              {/* Voice Recognition Button */}
              {searchString?.length === 0 && (
                <button
                  type="button"
                  aria-label={
                    isListening ? "Stop listening" : "Start voice input"
                  }
                  className={`flex size-8 cursor-pointer items-center justify-center rounded-full px-2 transition-all duration-300 ${
                    isListening
                      ? "scale-110 bg-red-500"
                      : "bg-gray-200/60 hover:scale-105 dark:bg-gray-700"
                  }`}
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onMouseLeave={stopListening}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                >
                  {isListening ? (
                    <div className="flex items-center gap-2 px-2">
                      <div className="animate-pulse">
                        <div className="flex gap-1">
                          <div className="h-3 w-1 animate-[wave_0.5s_ease-in-out_infinite] rounded-[7px] bg-white"></div>
                          <div className="h-3 w-1 animate-[wave_0.5s_ease-in-out_infinite_0.3s] rounded-[7px] bg-white"></div>
                          <div className="h-3 w-1 animate-[wave_0.5s_ease-in-out_infinite_0.5s] rounded-[7px] bg-white"></div>
                        </div>
                      </div>
                      <span className="text-sm text-white">Listening...</span>
                    </div>
                  ) : (
                    <FaMicrophone className="text-sm text-gray-700 transition-transform duration-200 hover:scale-110 dark:text-white" />
                  )}
                </button>
              )}

              {/* Send Button */}
              <button
                type="submit"
                onClick={() =>
                  searchString.length > 0 && handleGenerateSession()
                }
                className={`flex size-8 items-center justify-center rounded-full ${
                  searchString.length > 0
                    ? "cursor-pointer bg-gray-900 text-white dark:bg-white dark:text-gray-800"
                    : "cursor-text border-[#D7D7D7] bg-gray-200/60 text-gray-700 dark:border-[#272729] dark:bg-gray-700 dark:text-white"
                }`}
              >
                {loading ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    fill="currentColor"
                    className="animate-spin"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                    <path
                      fillRule="evenodd"
                      d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 pl-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4.42933 0.535103C1.57625 -0.878102 -1.22326 2.54068 0.724874 5.05901L2.2264 7.00001H5.99999C6.55228 7.00001 6.99999 7.44773 6.99999 8.00001C6.99999 8.5523 6.55228 9.00001 5.99999 9.00001H2.22641L0.724874 10.941C-1.22326 13.4593 1.57624 16.8781 4.42931 15.4649L14.0727 10.6883C16.2973 9.58642 16.2973 6.41361 14.0727 5.31173L4.42933 0.535103Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Chat;
