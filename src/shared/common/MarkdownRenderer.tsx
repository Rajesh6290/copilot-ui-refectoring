import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 text-xl font-medium tracking-wider text-gray-900 dark:text-white">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 font-light text-gray-700 dark:text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 font-light text-gray-700 dark:text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="mb-2 font-normal">{children}</li>
          ),
          a: ({ href, children }) => {
            const isExternal = (href ?? "").startsWith("http");
            return isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-tertiary-500 underline"
              >
                {children}
              </a>
            ) : (
              <Link
                href={href || "#"}
                className="font-semibold text-tertiary-500 underline"
              >
                {children}
              </Link>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-tertiary-500 pl-4 italic text-gray-500">
              {children}
            </blockquote>
          ),
          code: ({ children, ...props }: React.ComponentProps<"code">) => {
            const isInline = props.className === undefined;
            return (
              <code
                className={
                  isInline
                    ? "rounded bg-gray-100 p-1 text-red-500"
                    : "block rounded bg-gray-100 p-2"
                }
              >
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-200 dark:bg-gray-700">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border border-gray-300 dark:border-gray-600">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-4 py-2 font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-4 py-2 text-gray-700 dark:border-gray-600 dark:text-gray-300">
              {children}
            </td>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
