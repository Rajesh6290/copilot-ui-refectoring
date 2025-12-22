"use client";

import { Dialog } from "@mui/material";
import {
  Bold,
  ChevronDown,
  ChevronUp,
  Code,
  Heading1,
  Heading2,
  HelpCircle,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PlusSquare,
  Quote,
  Redo,
  SquareCode,
  Strikethrough,
  Table,
  Undo,
  X
} from "lucide-react";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

// Tiptap Imports
import CustomButton from "@/shared/core/CustomButton";
import { useResponsiveBreakpoints } from "@/shared/utils";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TiptapTable from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { BubbleMenu, Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Message } from "./PolicyAssistant";

// --- CSS Styles (Enhanced) ---
const tiptapCss = `
/* Basic Tiptap content styling - Enhanced by Tailwind Prose */
.tiptap > * + * {
  margin-top: 0.75em;
}

/* --- List Styling --- */
.tiptap ul,
.tiptap ol {
  padding: 0 1rem;
  margin: 0.75em 0; /* Add some vertical space */
  padding-left: 1.5rem; /* Increase indentation */
}
.tiptap li {
  margin-top: 0.25em; /* Space between list items */
  position: relative; /* Needed for ::marker positioning sometimes */
}
.tiptap li > p {
    margin: 0; /* Prevent extra space from paragraphs inside list items */
}
/* Ensure markers (bullets/numbers) are clearly visible */
.tiptap ul {
  list-style-type: disc;
}
.tiptap ol {
  list-style-type: decimal;
}
.tiptap li::marker {
  /* You can style markers directly if needed, e.g., color, font-size */
  /* color: inherit; */
  font-weight: bold; /* Make markers slightly bolder */
}


.tiptap h1,
.tiptap h2,
.tiptap h3,
.tiptap h4,
.tiptap h5,
.tiptap h6 {
  line-height: 1.1;
}

/* Inline Code */
.tiptap code:not(pre > code) {
  background-color: rgba(97, 97, 97, 0.1);
  color: #616161;
  padding: 0.1em 0.3em;
  border-radius: 0.25em;
  box-decoration-break: clone;
  font-size: 0.9em; /* Slightly smaller */
}
.dark .tiptap code:not(pre > code) {
   background-color: rgba(180, 180, 180, 0.2);
   color: #bdbdbd;
}

/* Code Block */
.tiptap pre {
  background: #0d0d0d;
  color: #fff;
  font-family: 'JetBrainsMono', monospace;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1em 0; /* Add vertical margin */
}
.tiptap pre code {
  color: inherit;
  padding: 0;
  background: none;
  font-size: 0.85rem;
}

.tiptap img {
  max-width: 100%;
  height: auto;
}

/* Blockquote */
.tiptap blockquote {
  padding-left: 1rem;
  border-left: 3px solid rgba(13, 13, 13, 0.1);
  margin: 1em 0; /* Add vertical margin */
}
.dark .tiptap blockquote {
   border-left: 3px solid rgba(200, 200, 200, 0.2);
}

/* Horizontal Rule */
.tiptap hr {
  border: none;
  border-top: 2px solid rgba(13, 13, 13, 0.1);
  margin: 2rem 0;
}
.dark .tiptap hr {
   border-top: 2px solid rgba(200, 200, 200, 0.2);
}

/* Link Styling */
.tiptap a {
    color: #3b82f6; /* Example blue */
    text-decoration: underline;
    cursor: pointer;
}
.dark .tiptap a {
    color: #60a5fa; /* Lighter blue for dark mode */
}

/* Placeholder Styling */
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd; /* Placeholder text color */
  pointer-events: none;
  height: 0;
}
.dark .tiptap p.is-editor-empty:first-child::before {
    color: #6c757d; /* Dark mode placeholder color */
}


/* --- Table Styling (Keep existing) --- */
.tiptap table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 1em 0;
  overflow: hidden;
  border: 1px solid #ced4da;
  border-radius: 4px;
}
.dark .tiptap table {
   border: 1px solid #495057;
}
.tiptap td,
.tiptap th {
  min-width: 1em;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}
.dark .tiptap td,
.dark .tiptap th {
   border: 1px solid #495057;
}
.tiptap th {
  font-weight: bold;
  text-align: left;
  background-color: #f8f9fa;
}
.dark .tiptap th {
   background-color: #343a40;
}
.tiptap .column-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: -2px;
  width: 4px;
  cursor: col-resize;
  background-color: #52aeff;
  z-index: 10;
}
.tiptap .column-resize-handle:hover {
   background-color: #007bff;
}
.tiptap .selectedCell:after {
  z-index: 2;
  position: absolute;
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(173, 216, 230, 0.4);
  pointer-events: none;
}
.dark .tiptap .selectedCell:after {
    background: rgba(70, 130, 180, 0.5);
}
.tiptap p {
  /* Prevent default paragraph margins inside table cells/lists if needed */
  /* margin: 0; Let prose handle this mostly */
}

/* Ensure editor takes height */
.tiptap {
   min-height: 100%;
   height: 100%;
   outline: none;
}
`;

const CSS_INJECT_ID = "tiptap-dynamic-styles";

// --- Tiptap Toolbar Component (Extended) ---
interface TiptapToolbarProps {
  editor: Editor | null;
  showToolbar: boolean;
  toggleToolbar: () => void;
  toggleTableHelp: () => void;
}

const TiptapToolbar: React.FC<TiptapToolbarProps> = ({
  editor,
  showToolbar,
  toggleToolbar,
  toggleTableHelp
}) => {
  const { isMobile } = useResponsiveBreakpoints();
  const iconSize = isMobile ? 16 : 18;

  // Callback for setting link
  const setLink = useCallback(() => {
    if (!editor) {
      return;
    }
    const previousUrl = editor.getAttributes("link")["href"];
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Helper Button component
  const Button = ({
    onClick,
    title,
    isActive,
    children,
    disabled = false
  }: {
    onClick: () => void;
    title: string;
    isActive?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md p-1.5 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 ${
        isActive ? "bg-gray-200 dark:bg-gray-700" : ""
      }`}
      title={title}
      disabled={disabled || !editor.isEditable}
    >
      {children}
    </button>
  );

  const isTableContext =
    editor.isActive("tableRow") ||
    editor.isActive("tableCell") ||
    editor.isActive("tableHeader");

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-2 dark:border-neutral-600 ${
        !showToolbar ? "hidden" : ""
      }`}
    >
      {/* Formatting Buttons */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
          disabled={!editor.can().undo()}
        >
          <Undo size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
          disabled={!editor.can().redo()}
        >
          <Redo size={iconSize} />
        </Button>
        <div className="h-5 w-px bg-gray-300 dark:bg-gray-700"></div>
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
          isActive={editor.isActive("bold")}
        >
          <Bold size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
          isActive={editor.isActive("italic")}
        >
          <Italic size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          isActive={editor.isActive("strike")}
        >
          <Strikethrough size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
          isActive={editor.isActive("code")}
        >
          <Code size={iconSize} />
        </Button>
        <Button
          onClick={setLink}
          title="Set Link"
          isActive={editor.isActive("link")}
        >
          <Link2 size={iconSize} />
        </Button>
        <div className="h-5 w-px bg-gray-300 dark:bg-gray-700"></div>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Heading 1"
          isActive={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 size={iconSize} />
        </Button>
        <Button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
          isActive={editor.isActive("bulletList")}
        >
          <List size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
          isActive={editor.isActive("orderedList")}
        >
          <ListOrdered size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
          isActive={editor.isActive("codeBlock")}
        >
          <SquareCode size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
          isActive={editor.isActive("blockquote")}
        >
          <Quote size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={iconSize} />
        </Button>
        <div className="h-5 w-px bg-gray-300 dark:bg-gray-700"></div>
        <Button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Insert Table"
        >
          <Table size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          title="Add Table Row After"
          disabled={!isTableContext}
        >
          <PlusSquare size={iconSize} />
        </Button>
        <Button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          title="Add Table Column After"
          disabled={!isTableContext}
        >
          <PlusSquare size={iconSize} style={{ transform: "rotate(90deg)" }} />
        </Button>
        <div className="h-5 w-px bg-gray-300 dark:bg-gray-700"></div>
        <Button onClick={toggleTableHelp} title="Formatting Help">
          <HelpCircle size={iconSize} />
        </Button>
      </div>

      {/* Toolbar Toggle Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={toggleToolbar}
          className="rounded-md p-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title={showToolbar ? "Hide Toolbar" : "Show Toolbar"}
        >
          {showToolbar ? (
            <ChevronUp size={iconSize} />
          ) : (
            <ChevronDown size={iconSize} />
          )}
        </button>
      </div>
    </div>
  );
};

// --- Main Edit Dialog Component ---
interface EditDialogProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  editedContent: string;
  setEditedContent: (content: string) => void;
  setFinalDocument: (content: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const EditDialog = memo(
  ({
    isEditDialogOpen,
    setIsEditDialogOpen,
    editedContent,
    setEditedContent,
    setFinalDocument,
    setMessages
  }: EditDialogProps) => {
    const [localMarkdownContent, setLocalMarkdownContent] =
      useState<string>("");
    const [originalMarkdownContent, setOriginalMarkdownContent] =
      useState<string>("");
    const [showToolbar, setShowToolbar] = useState(true);
    const [showTableHelp, setShowTableHelp] = useState(false);

    // Inject CSS Effect
    useEffect(() => {
      const styleElement = document.createElement("style");
      styleElement.id = CSS_INJECT_ID;
      styleElement.innerHTML = tiptapCss;

      const existingStyle = document.getElementById(CSS_INJECT_ID);
      if (!existingStyle) {
        document.head.appendChild(styleElement);
      } else {
        // Optional: replace existing if styles need dynamic updates
        // existingStyle.innerHTML = tiptapCss;
      }

      // Basic cleanup (consider more robust cleanup if multiple instances)
      return () => {
        // const el = document.getElementById(CSS_INJECT_ID);
        // if (el) el.remove(); // Only remove if sure no other instance needs it
      };
    }, []);

    // Tiptap Editor Instance Setup
    const editor = useEditor(
      {
        extensions: [
          StarterKit.configure({
            // history: true, // Handled by default
            // codeBlock: { // Customize code block if needed
            //    HTMLAttributes: { class: '...' },
            // },
            // Disable default markdown shortcuts if they conflict
            horizontalRule: {
              // Ensures HR button works correctly
            },
            blockquote: {
              // Ensures blockquote button works correctly
            }
            // heading, bold, italic etc handled by default
          }),
          Markdown.configure({
            html: true,
            tightLists: true,
            linkify: true, // Auto-link URLs typed/pasted
            breaks: false, // Prefer paragraphs over <br> for cleaner Markdown
            transformPastedText: true,
            transformCopiedText: true
          }),
          TiptapTable.configure({
            resizable: true
          }),
          TableRow,
          TableHeader,
          TableCell,
          TiptapLink.configure({
            // Configure link behavior
            openOnClick: false, // Don't open link on click in editor
            autolink: true, // Automatically detect links
            validate: (href) => /^https?:\/\//.test(href) // Basic validation
          }),
          Placeholder.configure({
            placeholder: "Start writing your policy content here..." // Add placeholder text
          })
        ],
        content: "", // Set via useEffect
        editable: true,
        onUpdate: ({ editor: editorInstance }) => {
          const markdown = editorInstance.storage["markdown"].getMarkdown();
          setLocalMarkdownContent(markdown);
        },
        editorProps: {
          attributes: {
            // Apply Prose for typography, max-w-none, focus outline removal
            class:
              "prose prose-sm sm:prose-base dark:prose-invert dark:text-white max-w-none focus:outline-none p-4 h-full"
          }
        }
      },
      []
    );

    // Load Initial Content Effect
    useEffect(() => {
      if (!editor) {
        return;
      }
      if (isEditDialogOpen) {
        if (editedContent !== originalMarkdownContent) {
          setOriginalMarkdownContent(editedContent);
          setLocalMarkdownContent(editedContent);
          editor.commands.setContent(editedContent, false);
        }
        requestAnimationFrame(() => {
          editor.commands.focus("end"); // Focus at the end
        });
      }
    }, [isEditDialogOpen, editedContent, editor, originalMarkdownContent]); // Added originalMarkdownContent dependency

    // State Checks & Handlers
    const hasContentChanged = useMemo(() => {
      return localMarkdownContent.trim() !== originalMarkdownContent.trim();
    }, [localMarkdownContent, originalMarkdownContent]);

    const handleSave = useCallback(() => {
      if (!editor) {
        return;
      }
      const finalMarkdown = editor.storage["markdown"].getMarkdown();
      setEditedContent(finalMarkdown);
      setFinalDocument(finalMarkdown);
      setMessages((prev) => {
        const lastAssistantMessageIndex = prev.findLastIndex(
          (msg) => !msg.isUser
        );
        if (lastAssistantMessageIndex !== -1) {
          const updatedMessages = [...prev];
          const existingMessage = updatedMessages[lastAssistantMessageIndex];
          if (existingMessage) {
            updatedMessages[lastAssistantMessageIndex] = {
              id: existingMessage.id || "",
              query: existingMessage.query,
              isUser: existingMessage.isUser,
              timestamp: existingMessage.timestamp,
              isLoading: existingMessage.isLoading ?? false,
              isStreaming: existingMessage.isStreaming ?? false,
              isStreamingCompleted:
                existingMessage.isStreamingCompleted ?? false,
              isQuestion: existingMessage.isQuestion ?? false,
              isStatus: existingMessage.isStatus ?? false,
              queryId: existingMessage.queryId ?? "",
              isDocument: existingMessage.isDocument ?? false,
              response: finalMarkdown
            };
            return updatedMessages;
          }
        }
        return prev;
      });
      setIsEditDialogOpen(false);
    }, [
      editor,
      setEditedContent,
      setFinalDocument,
      setMessages,
      setIsEditDialogOpen
    ]);

    const handleCancel = useCallback(() => {
      if (hasContentChanged) {
        if (window.confirm("Discard unsaved changes?")) {
          setIsEditDialogOpen(false);
        }
      } else {
        setIsEditDialogOpen(false);
      }
    }, [hasContentChanged, setIsEditDialogOpen]);

    const toggleToolbar = useCallback(
      () => setShowToolbar((prev) => !prev),
      []
    );
    const toggleTableHelp = useCallback(
      () => setShowTableHelp((prev) => !prev),
      []
    );
    useEffect(() => {
      // Only add listener if the dialog is open
      if (!isEditDialogOpen) {
        return;
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        // Check for Ctrl+S or Cmd+S
        if (event.key === "s" && (event.ctrlKey || event.metaKey)) {
          // Prevent the browser's default save action
          event.preventDefault();

          // Check if there are changes to save before triggering
          if (hasContentChanged && editor?.isEditable) {
            // Also check if editor is editable
            handleSave();
          } else {
            alert(
              "Ctrl+S detected, but no changes to save or editor not editable."
            );
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      // Cleanup function to remove the listener when the dialog closes or component unmounts
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
      // Dependencies: Re-run the effect if the dialog opens/closes,
      // or if the save handler or change status changes.
    }, [isEditDialogOpen, handleSave, hasContentChanged, editor]);
    // Reading time calculation (remains the same)
    const readTime = useMemo(() => {
      if (!localMarkdownContent) {
        return "< 1 min read";
      }
      const wordsPerMinute = 200;
      const textContent = localMarkdownContent
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`[^`]*`/g, " ")
        .replace(/\[.*?\]\(.*?\)/g, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/[#*~_>|-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const wordCount = textContent.split(" ").filter(Boolean).length;
      const minutes = Math.ceil(wordCount / wordsPerMinute);
      return minutes < 1 ? "< 1 min read" : `${minutes} min read`;
    }, [localMarkdownContent]);
    const Kbd = ({ children }: { children: React.ReactNode }) => (
      <kbd className="mx-0.5 rounded border bg-gray-100 px-1.5 py-0.5 text-xs font-semibold dark:border-gray-600 dark:bg-gray-700">
        {children}
      </kbd>
    );
    // Help Dialog Content (Updated)
    const tableHelpDialog = useMemo(
      () => (
        <div
          className={`fixed inset-0 z-[1400] flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
            showTableHelp ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-labelledby="help-dialog-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[85vh] w-11/12 max-w-3xl transform overflow-auto rounded-lg bg-white p-5 shadow-xl transition-all duration-300 dark:bg-gray-800 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3
                id="help-dialog-title"
                className="text-lg font-medium text-gray-900 dark:text-white"
              >
                Editor Formatting Help
              </h3>
              <button
                type="button"
                onClick={toggleTableHelp}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-700"
                aria-label="Close help"
              >
                <X size={20} />
              </button>
            </div>

            <div className="markdown-help grid grid-cols-1 gap-6 text-sm text-gray-700 dark:text-gray-300 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">Toolbar Basics</h4>
                <p>
                  Click buttons on the toolbar to apply formatting. Select text
                  first to format existing content, or just click and start
                  typing for new formatted text.
                </p>
                <h4 className="mb-2 mt-4 font-semibold">Common Formatting</h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    <Bold size={14} className="mr-1 inline align-middle" /> Bold
                    (<Kbd>Ctrl+B</Kbd>)
                  </li>
                  <li>
                    <Italic size={14} className="mr-1 inline align-middle" />{" "}
                    Italic (<Kbd>Ctrl+I</Kbd>)
                  </li>
                  <li>
                    <Strikethrough
                      size={14}
                      className="mr-1 inline align-middle"
                    />{" "}
                    Strikethrough
                  </li>
                  <li>
                    <Code size={14} className="mr-1 inline align-middle" />{" "}
                    Inline Code
                  </li>
                  <li>
                    <Link2 size={14} className="mr-1 inline align-middle" />{" "}
                    Link (select text, click, enter URL)
                  </li>
                </ul>
                <h4 className="mb-2 mt-4 font-semibold">Headings</h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    <Heading1 size={14} className="mr-1 inline align-middle" />{" "}
                    Heading 1
                  </li>
                  <li>
                    <Heading2 size={14} className="mr-1 inline align-middle" />{" "}
                    Heading 2
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Lists</h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    <List size={14} className="mr-1 inline align-middle" />{" "}
                    Bullet List
                  </li>
                  <li>
                    <ListOrdered
                      size={14}
                      className="mr-1 inline align-middle"
                    />{" "}
                    Numbered List
                  </li>
                  <li>
                    Press <Kbd>Enter</Kbd> for new item, <Kbd>Shift+Tab</Kbd>/
                    <Kbd>Tab</Kbd> to indent/outdent (if applicable).
                  </li>
                </ul>
                <h4 className="mb-2 mt-4 font-semibold">Blocks</h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    <SquareCode
                      size={14}
                      className="mr-1 inline align-middle"
                    />{" "}
                    Code Block (for multiple lines of code)
                  </li>
                  <li>
                    <Quote size={14} className="mr-1 inline align-middle" />{" "}
                    Blockquote (for indented quotes)
                  </li>
                  <li>
                    <Minus size={14} className="mr-1 inline align-middle" />{" "}
                    Horizontal Rule (separator line)
                  </li>
                </ul>
                <h4 className="mb-2 mt-4 font-semibold">Tables</h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    <Table size={14} className="mr-1 inline align-middle" />{" "}
                    Insert Table
                  </li>
                  <li>
                    <PlusSquare
                      size={14}
                      className="mr-1 inline align-middle"
                    />{" "}
                    Add Row (when cursor is in table)
                  </li>
                  <li>
                    <PlusSquare
                      size={14}
                      className="mr-1 inline rotate-90 align-middle"
                    />{" "}
                    Add Column (when cursor is in table)
                  </li>
                  <li>Resize columns by dragging borders.</li>
                </ul>
                <h4 className="mb-2 mt-4 font-semibold">Undo/Redo</h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    <Undo size={14} className="mr-1 inline align-middle" /> Undo
                    (<Kbd>Ctrl+Z</Kbd>)
                  </li>
                  <li>
                    <Redo size={14} className="mr-1 inline align-middle" /> Redo
                    (<Kbd>Ctrl+Y</Kbd>)
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={toggleTableHelp}
                className="rounded-md bg-tertiary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-tertiary-700 focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2 dark:bg-tertiary-500 dark:hover:bg-tertiary-600 dark:focus:ring-offset-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ),
      [showTableHelp, toggleTableHelp]
    ); // Memoize help dialog

    // Render Dialog
    return (
      <Dialog
        open={isEditDialogOpen}
        onClose={handleCancel}
        fullScreen
        PaperProps={{
          style: {
            display: "flex",
            flexDirection: "column",
            height: "100%"
            // Use theme background color from MUI or Tailwind directly
          },
          className:
            "flex flex-col h-full bg-white dark:bg-darkSidebarBackground" // Tailwind bg as fallback/override
        }}
        disableEscapeKeyDown={hasContentChanged}
      >
        <div className="flex h-full w-full flex-col">
          {" "}
          {/* Ensure inner div takes full height */}
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-4 py-2 shadow-sm dark:border-neutral-600">
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleCancel}
                className="mr-3 rounded-full p-1 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Close editor"
              >
                <X size={22} />
              </button>
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Edit Content
              </span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden text-sm text-gray-500 dark:text-gray-400 sm:inline">
                {readTime}
              </span>
              <div className="w-fit">
                <CustomButton
                  type="button"
                  onClick={handleSave}
                  disabled={!hasContentChanged || !editor?.isEditable}
                  className="!text-[0.6rem]"
                >
                  Save
                </CustomButton>
              </div>
            </div>
          </div>
          {/* Tiptap Toolbar */}
          <TiptapToolbar
            editor={editor}
            showToolbar={showToolbar}
            toggleToolbar={toggleToolbar}
            toggleTableHelp={toggleTableHelp}
          />
          {/* Tiptap Editor Content Area */}
          <div className="flex-grow overflow-y-auto">
            {" "}
            {/* Make editor area scrollable */}
            <EditorContent editor={editor} className="h-full" />
            {/* Optional: Bubble Menu for Links */}
            {editor && (
              <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: 100, placement: "bottom" }}
                shouldShow={({ editor: editorInstance }) =>
                  editorInstance.isActive("link")
                }
              >
                <div className="flex items-center space-x-2 rounded-md border bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                  <a
                    href={editor.getAttributes("link")["href"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {editor.getAttributes("link")["href"]?.length > 30
                      ? editor.getAttributes("link")["href"].substring(0, 30) +
                        "..."
                      : editor.getAttributes("link")["href"]}
                  </a>
                  {/* <button onClick={setLink} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"><Link2 size={16} /></button> */}
                  <button
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Unlink
                  </button>
                </div>
              </BubbleMenu>
            )}
          </div>
          {/* Help Dialog */}
          {tableHelpDialog}
        </div>
      </Dialog>
    );
  }
);

EditDialog.displayName = "EditDialog";
export default EditDialog;
