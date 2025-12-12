"use client";

import { MoveLeft, Download } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
// import StatusUpdateDialog from "../Collections/StatusUpdateDialog";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import CustomButton from "../core/CustomButton";

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  // styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

// Simple in-memory cache with TTL
const fileCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CustomFilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
  isAction?: boolean;
  actionItems?: {
    documentId: string;
    collectionId: string;
    currentStatus: string;
    mutate: () => void;
    onClose: () => void;
    isAccess?: boolean;
  };
}

interface CSVData {
  headers: string[];
  rows: string[][];
}

interface CacheEntry {
  data: CSVData;
  timestamp: number;
}

const CustomFilePreview: React.FC<CustomFilePreviewProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName = "Document",
  actionItems,
  isAction
}) => {
  const [fileType, setFileType] = useState<string>("unknown");
  const [viewerUrl, setViewerUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  // Cleanup function
  const cleanup = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Reset state when dialog closes
  const resetState = useCallback(() => {
    setLoading(true);
    setError("");
    setCsvData(null);
    setViewerUrl("");
    setRetryCount(0);
    cleanup();
  }, [cleanup]);

  // Clean expired cache entries
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of fileCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        fileCache.delete(key);
      }
    }
  }, []);

  const parseCSV = useCallback((text: string): CSVData => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) {
      throw new Error("Empty CSV file");
    }

    // Enhanced CSV parser that handles quotes, commas, and different delimiters
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Handle escaped quotes
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (
          (char === "," || char === ";" || char === "\t") &&
          !inQuotes
        ) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result.map((cell) => cell.replace(/^"|"$/g, "")); // Remove surrounding quotes
    };

    const headers = parseCSVLine(lines[0] ?? "");
    const rows = lines.slice(1).map((line) => parseCSVLine(line));

    // Filter out completely empty rows
    const filteredRows = rows.filter((row) =>
      row.some((cell) => cell.trim() !== "")
    );

    return { headers, rows: filteredRows };
  }, []);

  const fetchCSVData = useCallback(
    async (url: string): Promise<CSVData> => {
      // Clean expired cache first
      cleanExpiredCache();

      // Check cache first
      const cacheEntry = fileCache.get(url) as CacheEntry;
      if (cacheEntry && Date.now() - cacheEntry.timestamp < CACHE_TTL) {
        return cacheEntry.data;
      }

      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "text/csv,text/plain,*/*",
            "Cache-Control": "no-cache"
          },
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        if (!text.trim()) {
          throw new Error("File is empty");
        }

        const csvDataVal = parseCSV(text);

        // Cache the parsed data with timestamp
        fileCache.set(url, {
          data: csvDataVal,
          timestamp: Date.now()
        });

        return csvDataVal;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error("Request was cancelled");
        }
        throw new Error(
          `Failed to fetch CSV: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    },
    [cleanExpiredCache, parseCSV]
  );

  const retryWithDelay = useCallback(
    (fn: () => Promise<void>, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          try {
            await fn();
            resolve();
          } catch {
            resolve(); // Don't throw, let the calling function handle it
          }
        }, delay);
      });
    },
    []
  );

  const processFile = useCallback(
    async (url: string): Promise<void> => {
      setLoading(true);
      setError("");
      setCsvData(null);
      setViewerUrl("");

      // Clear any existing timeout and abort controller
      cleanup();

      // Detect file type from URL and filename
      const lowercaseUrl = url.toLowerCase();
      const lowercaseFileName = fileName.toLowerCase();
      let detectedType = "unknown";

      if (lowercaseUrl.includes(".pdf") || lowercaseFileName.includes(".pdf")) {
        detectedType = "pdf";
      } else if (
        lowercaseUrl.includes(".csv") ||
        lowercaseFileName.includes(".csv")
      ) {
        detectedType = "csv";
      } else if (
        lowercaseUrl.includes(".xlsx") ||
        lowercaseUrl.includes(".xls") ||
        lowercaseFileName.includes(".xlsx") ||
        lowercaseFileName.includes(".xls")
      ) {
        detectedType = "excel";
      } else if (
        lowercaseUrl.includes(".doc") ||
        lowercaseUrl.includes(".docx") ||
        lowercaseFileName.includes(".doc") ||
        lowercaseFileName.includes(".docx")
      ) {
        detectedType = "doc";
      } else if (
        lowercaseUrl.includes(".ppt") ||
        lowercaseUrl.includes(".pptx") ||
        lowercaseFileName.includes(".ppt") ||
        lowercaseFileName.includes(".pptx")
      ) {
        detectedType = "ppt";
      }

      setFileType(detectedType);

      // Handle CSV files specially
      if (detectedType === "csv") {
        try {
          const data = await fetchCSVData(url);
          setCsvData(data);
          setLoading(false);
          setRetryCount(0); // Reset retry count on success
          return;
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to load CSV file";

          // Retry logic for CSV
          if (retryCount < MAX_RETRIES && !errorMessage.includes("cancelled")) {
            setRetryCount((prev) => prev + 1);
            await retryWithDelay(
              () => processFile(url),
              RETRY_DELAY * (retryCount + 1)
            );
            return;
          }

          setError(errorMessage);
          setLoading(false);
          return;
        }
      }

      // For other file types, use iframe viewers
      let embedUrl = "";
      const encodedUrl = encodeURIComponent(url);

      try {
        switch (detectedType) {
          case "pdf":
            embedUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodedUrl}`;
            loadingTimeoutRef.current = setTimeout(() => {
              if (loading) {
                setLoading(false);
              }
            }, 8000); // Increased timeout for PDF
            break;

          case "excel":
            embedUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
            loadingTimeoutRef.current = setTimeout(() => {
              if (loading) {
                setLoading(false);
              }
            }, 6000);
            break;

          case "doc":
          case "ppt":
            embedUrl = `https://docs.google.com/viewerng/viewer?url=${encodedUrl}&embedded=true`;
            loadingTimeoutRef.current = setTimeout(() => {
              if (loading) {
                setLoading(false);
              }
            }, 6000);
            break;

          default:
            embedUrl = url;
            loadingTimeoutRef.current = setTimeout(() => {
              if (loading) {
                setLoading(false);
              }
            }, 4000);
        }

        setViewerUrl(embedUrl);
      } catch {
        setError("Failed to generate viewer URL");
        setLoading(false);
      }
    },
    [fileName, fetchCSVData, retryCount, loading, cleanup, retryWithDelay]
  );
  useEffect(() => {
    if (isOpen && fileUrl) {
      resetState();
      processFile(fileUrl);
    } else if (!isOpen) {
      resetState();
    }

    return cleanup;
  }, [isOpen, fileUrl, resetState, cleanup]);
  const handleIframeError = useCallback((): void => {
    cleanup();
    setLoading(false);

    // Retry logic for iframe loading
    if (retryCount < MAX_RETRIES) {
      setRetryCount((prev) => prev + 1);
      setError(
        `Loading failed, retrying... (${retryCount + 1}/${MAX_RETRIES})`
      );

      setTimeout(() => {
        const encodedUrl = encodeURIComponent(fileUrl);
        let fallbackUrl = "";

        switch (fileType) {
          case "pdf":
            fallbackUrl =
              retryCount === 0
                ? `${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
                : `https://docs.google.com/viewerng/viewer?url=${encodedUrl}&embedded=true`;
            break;

          case "excel":
            fallbackUrl =
              retryCount === 0
                ? `https://docs.google.com/viewerng/viewer?url=${encodedUrl}&embedded=true`
                : `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
            break;

          case "doc":
          case "ppt":
            fallbackUrl =
              retryCount === 0
                ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`
                : `https://docs.google.com/viewerng/viewer?url=${encodedUrl}&embedded=true`;
            break;

          default:
            setError("Cannot preview this file type. Please download to view.");
            return;
        }

        setLoading(true);
        setError("");
        setViewerUrl(fallbackUrl);

        loadingTimeoutRef.current = setTimeout(() => {
          if (loading) {
            setLoading(false);
          }
        }, 5000);
      }, RETRY_DELAY);
    } else {
      setError(
        "Failed to load file after multiple attempts. Please try downloading the file."
      );
    }
  }, [fileUrl, fileType, retryCount, loading, cleanup]);

  const handleIframeLoad = useCallback((): void => {
    if (fileType !== "pdf") {
      cleanup();
      setLoading(false);
      setError("");
      setRetryCount(0); // Reset retry count on success
    }
  }, [fileType, cleanup]);

  // Fixed download function to actually download the file
  const downloadFile = useCallback(async (): Promise<void> => {
    if (isDownloading) {
      return;
    } // Prevent multiple downloads

    setIsDownloading(true);

    try {
      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "download";
      link.style.display = "none";

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: try direct download with proper headers
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "download";
      link.setAttribute("target", "_self"); // Force same tab
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      // Add a small delay to show the loading state
      setTimeout(() => {
        setIsDownloading(false);
      }, 500);
    }
  }, [fileUrl, fileName, isDownloading]);

  // Generate column letters like Google Sheets (A, B, C, etc.)
  const getColumnLetter = useCallback((index: number): string => {
    let result = "";
    let temp = index;
    while (temp >= 0) {
      result = String.fromCharCode(65 + (temp % 26)) + result;
      temp = Math.floor(temp / 26) - 1;
    }
    return result;
  }, []);

  const renderLoadingState = () => (
    <div className="flex h-full items-center justify-center bg-white/95 backdrop-blur-sm dark:bg-gray-900/95">
      <div className="w-full max-w-md px-8">
        {/* File Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-20 items-center justify-center rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
              {fileType === "pdf" && (
                <svg
                  className="h-10 w-10 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              )}
              {(fileType === "excel" || fileType === "csv") && (
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16,2H14L12,5L10,2H8L11,7L8,12H10L12,9L14,12H16L13,7L16,2M6,2V22H18V2H6Z" />
                </svg>
              )}
              {fileType === "doc" && (
                <svg
                  className="h-10 w-10 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              )}
              {fileType === "ppt" && (
                <svg
                  className="h-10 w-10 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              )}
              {!["pdf", "excel", "csv", "doc", "ppt"].includes(fileType) && (
                <svg
                  className="h-10 w-10 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              )}
            </div>
            <div className="absolute -top-2 -right-2 h-5 w-5 animate-pulse rounded-full bg-blue-500 shadow-lg"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="animate-fade-in text-center">
          <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">
            Loading {fileName}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {retryCount > 0 && `Retry ${retryCount}/${MAX_RETRIES} - `}
            {fileType === "pdf"
              ? "Preparing PDF viewer..."
              : fileType === "excel"
                ? "Processing spreadsheet..."
                : fileType === "csv"
                  ? "Parsing CSV data..."
                  : fileType === "doc"
                    ? "Loading document..."
                    : fileType === "ppt"
                      ? "Loading presentation..."
                      : "Preparing file..."}
          </p>
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-6 text-6xl">⚠️</div>
        <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
          Cannot preview file
        </h3>
        <p className="mb-6 max-w-md text-gray-600 dark:text-gray-300">
          {error}
        </p>
        <div className="space-x-3">
          {retryCount < MAX_RETRIES && (
            <button
              onClick={() => processFile(fileUrl)}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              Retry
            </button>
          )}
          <button
            onClick={downloadFile}
            disabled={isDownloading}
            className={`relative inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
              isDownloading ? "cursor-not-allowed opacity-75" : ""
            }`}
          >
            <Download
              className={`mr-2 h-4 w-4 ${isDownloading ? "opacity-30" : ""}`}
            />
            {isDownloading && (
              <div className="absolute top-1/2 left-3 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              </div>
            )}
            {isDownloading ? "Downloading..." : "Download File"}
          </button>
          <button
            onClick={() => window.open(fileUrl, "_blank")}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Open in New Tab
          </button>
        </div>
      </div>
    </div>
  );

  const renderCSVTable = () => {
    if (!csvData) {
      return null;
    }

    const maxRowsToShow = 100; // Limit rows for performance
    const displayRows = csvData.rows.slice(0, maxRowsToShow);

    return (
      <div className="csv-table-container flex h-full flex-col bg-white dark:bg-gray-900">
        {/* Google Sheets-like toolbar */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {csvData.rows.length.toLocaleString()} rows ×{" "}
                {csvData.headers.length} columns
              </span>
              {csvData.rows.length > maxRowsToShow && (
                <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  Showing first {maxRowsToShow} rows
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Scroll to view more data
            </div>
          </div>
        </div>

        {/* Scrollable table container */}
        <div className="flex-1 overflow-auto">
          <div className="relative">
            {/* Table */}
            <table className="w-full border-collapse bg-white text-sm dark:bg-gray-900">
              {/* Column headers with letters */}
              <thead className="sticky top-0 z-10">
                <tr>
                  {/* Row number column header */}
                  <th className="sticky left-0 z-20 w-16 border-r border-b-2 border-gray-300 bg-gray-100 px-3 py-3 text-center text-xs font-semibold text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    #
                  </th>
                  {csvData.headers.map((header, index) => (
                    <th
                      key={index}
                      className="max-w-64 min-w-32 border-r border-b-2 border-gray-300 bg-gray-100 px-4 py-3 text-left dark:border-gray-600 dark:bg-gray-800"
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                          {getColumnLetter(index)}
                        </span>
                        <span
                          className="truncate font-semibold text-gray-700 dark:text-gray-300"
                          title={header}
                        >
                          {header || `Column ${index + 1}`}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table body */}
              <tbody>
                {displayRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="group hover:bg-blue-50 dark:hover:bg-gray-800/50"
                  >
                    {/* Row number */}
                    <td className="sticky left-0 z-10 w-16 border-r border-b border-gray-200 bg-gray-50 px-3 py-2 text-center text-xs font-medium text-gray-500 group-hover:bg-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-gray-700">
                      {rowIndex + 1}
                    </td>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="max-w-64 min-w-32 border-r border-b border-gray-200 px-4 py-2 dark:border-gray-700"
                      >
                        <div
                          className="csv-cell min-h-6 w-full cursor-text truncate rounded px-2 py-1 text-gray-900 transition-colors dark:text-gray-100"
                          title={cell}
                        >
                          {cell || (
                            <span className="text-gray-400 dark:text-gray-500">
                              —
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty state for no data */}
            {displayRows.length === 0 && (
              <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="mb-4 text-6xl">📊</div>
                  <h3 className="mb-2 text-lg font-medium">
                    No data to display
                  </h3>
                  <p className="text-sm">The CSV file appears to be empty</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Load more indicator */}
        {csvData.rows.length > maxRowsToShow && (
          <div className="flex-shrink-0 border-t-2 border-gray-200 bg-gradient-to-t from-gray-50 to-transparent p-4 text-center dark:border-gray-700 dark:from-gray-800">
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
              <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                📈 {(csvData.rows.length - maxRowsToShow).toLocaleString()} more
                rows available
              </p>
              <button
                onClick={downloadFile}
                disabled={isDownloading}
                className={`relative inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600 ${
                  isDownloading ? "cursor-not-allowed opacity-75" : ""
                }`}
              >
                <Download
                  className={`mr-2 h-4 w-4 ${isDownloading ? "opacity-30" : ""}`}
                />
                {isDownloading && (
                  <div className="absolute top-1/2 left-3 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  </div>
                )}
                {isDownloading ? "Downloading..." : "Download Complete File"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDialogHeader = () => (
    <div className="flex w-full items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-600 dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 p-2.5 text-gray-600 transition-all hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            title="Close (Esc)"
          >
            <MoveLeft className="h-5 w-5" />
          </button>
          <button
            onClick={downloadFile}
            disabled={isDownloading}
            className={`relative rounded-lg bg-gray-100 p-2.5 text-gray-600 transition-all hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${
              isDownloading ? "cursor-not-allowed opacity-75" : ""
            }`}
            title="Download File"
          >
            <Download
              className={`h-5 w-5 ${isDownloading ? "opacity-30" : ""}`}
            />
            {isDownloading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 dark:border-gray-600 dark:border-t-blue-400"></div>
              </div>
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
            {fileName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {fileType.toUpperCase()} File
            {fileType === "csv" && csvData && (
              <span className="ml-2">
                • {csvData.rows.length.toLocaleString()} rows ×{" "}
                {csvData.headers.length} columns
              </span>
            )}
          </p>
        </div>

        {loading && (
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 dark:border-gray-600"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </span>
          </div>
        )}
      </div>

      {isAction && actionItems?.documentId && (
        <CustomButton
          disabled={!actionItems?.isAccess}
          // onClick={() => setStatusDialogOpen(true)}
        >
          Update Status
        </CustomButton>
      )}
    </div>
  );

  const renderDialogContent = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (error) {
      return renderErrorState();
    }

    if (fileType === "csv" && csvData) {
      return renderCSVTable();
    }

    if (viewerUrl && fileType !== "csv") {
      return (
        <iframe
          ref={iframeRef}
          src={viewerUrl}
          className="h-full w-full border-0"
          title={`${fileName} Viewer`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-downloads"
          allow="fullscreen"
        />
      );
    }

    return null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      // Clean up cache on component unmount
      fileCache.clear();
    };
  }, [cleanup]);

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* <StatusUpdateDialog
        isOpen={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
        }}
        documentId={actionItems?.documentId || ""}
        collectionId={actionItems?.collectionId as string}
        currentStatus={actionItems?.currentStatus || ""}
        documentName={fileName || ""}
        onStatusUpdate={() => {
          actionItems?.mutate();
        }}
      /> */}

      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth={false}
        fullWidth
        fullScreen
        PaperProps={{
          sx: {
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            width: "100vw",
            margin: 0,
            maxHeight: "100vh",
            maxWidth: "100vw",
            borderRadius: 0,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }
        }}
        sx={{
          "& .MuiDialog-container": {
            height: "100vh",
            width: "100vw",
            alignItems: "stretch",
            justifyContent: "stretch"
          }
        }}
      >
        <DialogTitle sx={{ padding: 0, flexShrink: 0 }}>
          {renderDialogHeader()}
        </DialogTitle>

        <DialogContent
          sx={{
            padding: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            height: "calc(100vh - 80px)" // Subtract header height
          }}
        >
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomFilePreview;
