"use client";
import { useResponsiveBreakpoints } from "@/shared/utils";
import { X } from "lucide-react";
import { marked } from "marked"; // Ensure marked is imported
import React, { useEffect, useMemo, useRef, useState } from "react";

const LoadingAnimation: React.FC = () => (
  <div className="flex items-center justify-center space-x-2 py-2">
    <div
      className="h-2 w-2 animate-pulse rounded-full bg-tertiary-500"
      style={{ animationDelay: "0ms" }}
    ></div>
    <div
      className="h-2 w-2 animate-pulse rounded-full bg-tertiary-500"
      style={{ animationDelay: "300ms" }}
    ></div>
    <div
      className="h-2 w-2 animate-pulse rounded-full bg-tertiary-500"
      style={{ animationDelay: "600ms" }}
    ></div>
  </div>
);

const CustomPDFViewer: React.FC<{
  pdfContent: string;
  title: string;
  onClose?: () => void;
}> = React.memo(({ pdfContent, title, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isMobile } = useResponsiveBreakpoints();

  const htmlContent = useMemo(() => {
    if (!pdfContent) {
      return null;
    }
    try {
      // Extract the document title from the first heading, or use the provided title
      let documentTitle = title;
      const firstHeadingMatch = pdfContent.match(/^#\s+(.+)$/m);
      if (firstHeadingMatch && firstHeadingMatch[1]) {
        documentTitle = firstHeadingMatch[1].trim();
      }

      // Parse the documentTitle with marked to convert markdown (e.g., **text**) to HTML
      const parsedDocumentTitle = marked.parseInline(documentTitle, {
        gfm: true,
        breaks: false
      });

      // Parse the main content with marked
      const processedContent = marked(pdfContent, {
        gfm: true, // Enable GitHub Flavored Markdown
        breaks: false // Don’t convert single line breaks to <br>
      });

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${documentTitle}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');
              
              body { 
                font-family: 'Merriweather', serif;
                margin: 0; 
                padding: ${isMobile ? "10mm" : "15mm"};
                background-color: white;
                color: #333333;
                line-height: 1.6;
              }
              .page { 
                max-width: 100%; 
                min-height: ${isMobile ? "auto" : "297mm"}; 
                background: white; 
                page-break-after: always;
              }
              h1, h2, h3, h4, h5, h6, table { 
                page-break-after: avoid;
                page-break-inside: avoid;
              }
              h1 { 
                font-size: ${isMobile ? "20pt" : "24pt"}; 
                color: #212121; 
                margin-bottom: 16pt;
                font-weight: 700;
              }
              h2 { 
                font-size: ${isMobile ? "16pt" : "18pt"}; 
                color: #292929; 
                margin-top: 14pt;
                font-weight: 700;
              }
              h3 { 
                font-size: ${isMobile ? "14pt" : "16pt"}; 
                color: #333333; 
                margin-top: 12pt; 
                font-weight: 700;
              }
              h4, h5, h6 {
                font-size: ${isMobile ? "12pt" : "14pt"};
                margin-top: 10pt;
                font-weight: 700;
              }
              p { 
                font-size: ${isMobile ? "10pt" : "11pt"}; 
                line-height: 1.5; 
                margin-bottom: 12pt; 
                color: #333333;
              }
              ul, ol { 
                margin: 12pt 0; 
                padding-left: ${isMobile ? "25px" : "40px"};
                page-break-inside: avoid; 
              }
              li { 
                font-size: ${isMobile ? "10pt" : "11pt"}; 
                line-height: 1.5; 
                margin-bottom: 6pt; 
                color: #333333;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 12pt 0;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                font-size: ${isMobile ? "9pt" : "10pt"};
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
                font-weight: bold;
                color: #212121;
              }
              strong { 
                font-weight: bold; 
                color: #1a1a1a;
              }
              em { 
                font-style: italic; 
              }
              code {
                font-family: 'Courier New', Courier, monospace;
                background-color: #f5f5f5;
                padding: 2px 4px;
                border-radius: 4px;
              }
              pre {
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 4px;
                overflow-x: auto;
              }
              pre code {
                padding: 0;
                background-color: transparent;
              }
              blockquote {
                border-left: 4px solid #ccc;
                padding-left: 10px;
                margin: 12pt 0;
                color: #666;
              }
              hr {
                border: none;
                border-top: 1px solid #ccc;
                margin: 12pt 0;
              }
              .document-title {
                text-align: center;
                font-size: ${isMobile ? "24pt" : "28pt"};
                margin-bottom: 24pt;
                border-bottom: 1px solid #ccc;
                padding-bottom: 12pt;
              }
              .no-break {
                page-break-inside: avoid;
              }
              @media print { 
                body { background: none; } 
                .page { margin: 0; box-shadow: none; } 
              }
            </style>
          </head>
          <body>
            <div class="page">
              <h1 class="document-title">${parsedDocumentTitle}</h1>
              ${processedContent}
            </div>
          </body>
        </html>
      `;
    } catch {
      setError("Failed to render PDF.");
      return null;
    }
  }, [pdfContent, title, isMobile]);

  useEffect(() => {
    if (htmlContent) {
      setIsLoading(true);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setTimeout(() => setIsLoading(false), 500);
      return () => URL.revokeObjectURL(url);
    }
    return () => {};
  }, [htmlContent]);

  const handleIframeLoad = (): void => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      setTimeout(() => setIsLoading(false), 200);
    }
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }
  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 p-2 dark:border-neutral-600">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title || "Document Preview"}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <iframe
        ref={iframeRef}
        src={pdfUrl || undefined}
        className="h-full w-full rounded-md border-0"
        title={title}
        sandbox="allow-same-origin"
        style={{
          maxWidth: "100%",
          overflowX: "hidden",
          backgroundColor: "white",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}
        onLoad={handleIframeLoad}
      />
    </div>
  );
});

CustomPDFViewer.displayName = "CustomPDFViewer";
export default CustomPDFViewer;
