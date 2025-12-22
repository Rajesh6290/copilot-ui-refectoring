"use client";
import MarkdownRenderer from "@/shared/common/MarkdownRenderer";
import { Drawer } from "@mui/material";
import { motion } from "framer-motion";
import React from "react";
import { AiOutlineFileMarkdown } from "react-icons/ai";
import { FaRegFilePdf } from "react-icons/fa6";
import { GrDocumentPdf } from "react-icons/gr";
import { LuPencil } from "react-icons/lu";
import { RiArrowDownDoubleLine } from "react-icons/ri";
import dynamic from "next/dynamic";
const CustomPDFViewer = dynamic(() => import("./CustomPDFViewer"), {
  ssr: false
});
interface OpenArtifactProps {
  id: string;
  open: boolean;
  onClose: () => void;
  onEditDocument?: (messageId: string) => void;
  onViewDocument?: (messageId: string) => void;
  onGeneratePDF?: (messageId: string) => void;
  getActiveDocumentContent: () => string; // Add this
  currentView?: "chat" | "document"; // Add this\
  textContentRef: React.RefObject<HTMLDivElement>; // Add this
  response: string; // Add this
  setCurrentView: (view: "chat" | "document") => void; // Add this
}

const OpenArtifact: React.FC<OpenArtifactProps> = ({
  id,
  open,
  onClose,
  getActiveDocumentContent,
  currentView,
  textContentRef,
  response,
  onEditDocument,
  onViewDocument,
  onGeneratePDF,
  setCurrentView
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      classes={{
        paper:
          "dark:bg-darkSidebarBackground dark:text-white w-full sm:w-3/4 md:w-2/3 lg:w-1/2 border-l-2 dark:border-neutral-700"
      }}
    >
      <div className="flex w-full items-center gap-6 p-2">
        <div
          tabIndex={0}
          role="button"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (onClose) {
                onClose();
              }
            }
          }}
          className="group relative flex size-8 cursor-pointer items-center justify-center rounded dark:hover:bg-darkMainBackground"
        >
          <RiArrowDownDoubleLine className="-rotate-90 text-2xl dark:text-neutral-400" />
          <div className="absolute left-0 top-9 hidden w-fit flex-col rounded-md bg-gray-300 p-1.5 group-hover:flex dark:bg-darkHoverBackground">
            <p className="text-nowrap text-sm font-medium dark:text-white">
              Close
            </p>
            <p className="text-nowrap text-xs font-medium dark:text-neutral-700">
              Escape
            </p>
          </div>
        </div>
        {currentView === "document" ? (
          <div
            tabIndex={0}
            role="button"
            onClick={() => setCurrentView("chat")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCurrentView("chat");
              }
            }}
            className="group relative flex size-8 cursor-pointer items-center justify-center rounded dark:hover:bg-darkMainBackground"
          >
            <AiOutlineFileMarkdown className="text-xl text-blue-500" />
            <div className="absolute left-0 top-9 hidden w-fit flex-col rounded-md bg-gray-300 p-1.5 group-hover:flex dark:bg-darkHoverBackground">
              <p className="text-nowrap text-sm font-medium dark:text-white">
                View As Markdown
              </p>
              <p className="text-nowrap text-xs font-medium dark:text-neutral-700">
                Ctl + M
              </p>
            </div>
          </div>
        ) : (
          <div
            tabIndex={0}
            role="button"
            onClick={() => onViewDocument && onViewDocument(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (onViewDocument) {
                  onViewDocument(id);
                }
              }
            }}
            className="group relative flex size-8 cursor-pointer items-center justify-center rounded dark:hover:bg-darkMainBackground"
          >
            <GrDocumentPdf className="text-xl text-blue-500" />
            <div className="v absolute left-0 top-9 hidden w-fit flex-col rounded-md bg-gray-300 p-1.5 group-hover:flex dark:bg-darkHoverBackground">
              <p className="text-nowrap text-sm font-medium dark:text-white">
                View As PDF
              </p>
              <p className="text-nowrap text-xs font-medium dark:text-neutral-700">
                Escape + P
              </p>
            </div>
          </div>
        )}
        <div
          tabIndex={0}
          role="button"
          onClick={() => onEditDocument && onEditDocument(id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (onEditDocument) {
                onEditDocument(id);
              }
            }
          }}
          className="group relative flex size-8 cursor-pointer items-center justify-center rounded dark:hover:bg-darkMainBackground"
        >
          <LuPencil className="text-xl text-green-500" />
          <div className="absolute left-0 top-9 hidden w-fit flex-col rounded-md bg-gray-300 p-1.5 group-hover:flex dark:bg-darkHoverBackground">
            <p className="text-nowrap text-sm font-medium dark:text-white">
              Edit Document
            </p>
            <p className="text-nowrap text-xs font-medium dark:text-neutral-700">
              Escape + E
            </p>
          </div>
        </div>
        <div
          tabIndex={0}
          role="button"
          onClick={() => onGeneratePDF && onGeneratePDF(id)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (onGeneratePDF) {
                onGeneratePDF(id);
              }
            }
          }}
          className="group relative flex size-8 cursor-pointer items-center justify-center rounded dark:hover:bg-darkMainBackground"
        >
          <FaRegFilePdf className="text-xl text-red-500" />
          <div className="v absolute left-0 top-9 hidden w-fit flex-col rounded-md bg-gray-300 p-1.5 group-hover:flex dark:bg-darkHoverBackground">
            <p className="text-nowrap text-sm font-medium dark:text-white">
              Generate PDF
            </p>
            <p className="text-nowrap text-xs font-medium dark:text-neutral-700">
              Ctl + G + P
            </p>
          </div>
        </div>
      </div>
      <div ref={textContentRef} className="h-dvh overflow-y-auto px-5 py-5">
        {currentView === "document" ? (
          getActiveDocumentContent() && (
            <div className="h-full w-full">
              <CustomPDFViewer
                pdfContent={getActiveDocumentContent()}
                title="Policy Document"
              />
            </div>
          )
        ) : response ? (
          <motion.div
            className="prose prose-sm dark:prose-invert max-w-none break-words text-sm leading-relaxed md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            {response.split("\n\n").map((paragraph, idx) => (
              <motion.div
                key={`p-${idx}`}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.1 + idx * 0.05,
                  duration: 0.4,
                  ease: "easeOut"
                }}
                className="mb-4"
              >
                <MarkdownRenderer content={paragraph} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No content available.
          </div>
        )}
      </div>
    </Drawer>
  );
};

export default OpenArtifact;
