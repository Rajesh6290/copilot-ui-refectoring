"use client";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { Search, X } from "lucide-react";
import React, { useState } from "react";
interface BrowsePromptsDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPrompts: (prompts: string) => void;
}
interface Prompt {
  id: string;
  text: string;
}

const PROMPTS: Prompt[] = [
  {
    id: "1",
    text: "What are the unique governance challenges of Generative AI?"
  },
  {
    id: "2",
    text: "How can organizations implement ethical AI governance structures?"
  },
  {
    id: "3",
    text: "What role does AI governance play in mitigating bias and misinformation?"
  },
  {
    id: "4",
    text: "How can AI governance frameworks help in legal and regulatory compliance for Generative AI?"
  },
  {
    id: "5",
    text: "What GDPR principles apply to AI, such as purpose limitation and data minimization?"
  },
  {
    id: "6",
    text: "What are the compliance requirements for high-risk AI systems under the EU AI Act?"
  },
  { id: "7", text: "What are the four core functions of the AI RMF?" },
  { id: "8", text: "How does the AI RMF help organizations manage AI risks?" },
  { id: "9", text: "What are the trustworthiness considerations in AI RMF?" },
  {
    id: "10",
    text: "What are the best practices for pre-deployment testing of Generative AI?"
  }
];

const BrowsePrompt: React.FC<BrowsePromptsDialogProps> = ({
  open,
  onClose,
  onSelectPrompts
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrompts] = useState<string>("");

  const filteredPrompts = PROMPTS.filter((prompt) =>
    prompt.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTogglePrompt = (promptId: string) => {
    const selectedPromptObjects = PROMPTS.find(
      (prompt) => prompt.id === promptId
    );
    if (selectedPromptObjects) {
      onSelectPrompts(selectedPromptObjects.text);
      onClose();
    }
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-xl"
      }}
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-2 dark:border-gray-700">
        <DialogTitle className="p-0 text-xl font-semibold text-gray-900 dark:text-white">
          Browse Prompts
        </DialogTitle>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <DialogContent className="p-4">
        <div className="mb-4 flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-2 w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredPrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleTogglePrompt(prompt.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleTogglePrompt(prompt.id);
                }
              }}
              className={`mb-2 w-full cursor-pointer rounded-lg p-3 text-left transition-colors ${
                prompt.id === selectedPrompts
                  ? "bg-blue-50 dark:bg-blue-900"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-1 text-gray-900 dark:text-white">
                  {prompt.text}
                </div>
                {prompt.id === selectedPrompts && (
                  <div className="ml-2 text-blue-600 dark:text-blue-400">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrowsePrompt;
