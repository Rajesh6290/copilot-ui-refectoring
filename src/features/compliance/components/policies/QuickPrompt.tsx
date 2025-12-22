"use client";
import { useResponsiveBreakpoints } from "@/shared/utils";
import { motion } from "framer-motion";
import React from "react";

const QuickPrompts = ({
  setQuery,
  inputRef
}: {
  setQuery: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  const { isMobile } = useResponsiveBreakpoints();
  const prompts = [
    "Generate a data privacy policy for [Company Name].",
    "Draft an Ethical AI Policy focused on transparency.",
    "Build a Risk Management Policy.",
    "Develop a Bias & Fairness Policy for our organization.",
    "Compose a concise summary of our AI Risk Management Policy.",
    "Generate a Data Governance Policy with compliance details.",
    "What are the legal obligations for AI transparency under GDPR?",
    "Insert citations for GDPR and CCPA compliance.",
    "List the regulatory requirements for our AI ethics policy.",
    "Suggest improvements for our risk management section.",
    "What enhancements can be made to our compliance framework?",
    "Revise this policy to include the latest regulatory changes."
  ];

  // Only show a subset of prompts on mobile
  const displayedPrompts = isMobile ? prompts.slice(0, 6) : prompts;

  return (
    <div className="space-y-3">
      <h3 className="border-b font-medium text-gray-900 dark:text-white">
        Quick Prompts
      </h3>
      <div className="grid grid-cols-1">
        {displayedPrompts.map((prompt, idx) => (
          <motion.button
            key={idx}
            onClick={() => {
              setQuery(prompt);
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
            className="flex items-center rounded-lg p-1.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:text-gray-300 dark:hover:bg-darkMainBackground"
            whileTap={{ scale: 0.98 }}
          >
            <span className="line-clamp-1">{prompt}</span>
          </motion.button>
        ))}
        {isMobile && prompts.length > 6 && (
          <button
            className="mt-1 text-center text-xs text-tertiary-500"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
          >
            + {prompts.length - 6} more prompts
          </button>
        )}
      </div>
    </div>
  );
};
export default QuickPrompts;
