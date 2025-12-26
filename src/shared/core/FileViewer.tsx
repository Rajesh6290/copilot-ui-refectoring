"use client";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";

const FileViewer = () => {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<string>("unknown");
  const [viewerUrl, setViewerUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const params = useSearchParams();
  const url = params.get("url");
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const processFile = (urls: string): void => {
    setLoading(true);
    setError("");

    // Detect file type from URL
    const lowercaseUrl = urls.toLowerCase();
    let detectedType = "unknown";

    if (lowercaseUrl.includes(".pdf")) {
      detectedType = "pdf";
    } else if (
      lowercaseUrl.includes(".xlsx") ||
      lowercaseUrl.includes(".xls") ||
      lowercaseUrl.includes(".csv")
    ) {
      detectedType = "excel";
    } else if (
      lowercaseUrl.includes(".doc") ||
      lowercaseUrl.includes(".docx")
    ) {
      detectedType = "doc";
    } else if (
      lowercaseUrl.includes(".ppt") ||
      lowercaseUrl.includes(".pptx")
    ) {
      detectedType = "ppt";
    }

    setFileType(detectedType);

    // Auto-select best viewer based on file type
    let embedUrl = "";
    const encodedUrl = encodeURIComponent(urls);

    switch (detectedType) {
      case "pdf":
        // Use Mozilla PDF.js viewer for PDFs
        embedUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodedUrl}`;
        break;

      case "excel":
        // Use Office 365 for Excel/CSV files
        embedUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
        break;

      case "doc":
      case "ppt":
        // Use Google Docs viewer for Word/PowerPoint
        embedUrl = `https://docs.google.com/viewerng/viewer?url=${encodedUrl}&embedded=true`;
        break;

      default:
        // Direct view for other files
        embedUrl = urls;
    }

    setViewerUrl(embedUrl);
    setLoading(false);
  };
  useEffect(() => {
    if (isLoaded) {
      if (user && user?.id) {
        if (url && typeof url === "string") {
          setFileUrl(url);
          processFile(url);
        }
      } else {
        router.push("/sign-in");
      }
    }
  }, [url, user, isLoaded, isSignedIn]);
  useEffect(() => {
    document.title =
      "Document Viewer | Cognitive View: AI-Driven Compliance & Conduct Risk Automation";

    function setMeta(
      attrType: "name" | "property",
      attr: string,
      content: string
    ) {
      let element = document.head.querySelector(`meta[${attrType}="${attr}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrType, attr);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    }

    // Set meta tags
    setMeta(
      "name",
      "description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "property",
      "og:title",
      "Document Viewer | Cognitive View: AI-Driven Compliance & Conduct Risk Automation"
    );
    setMeta(
      "property",
      "og:description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "property",
      "og:image",
      "https://app.cognitiveview.com/images/sideBarLogo.png"
    );
    setMeta("property", "og:url", "https://app.cognitiveview.com");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta(
      "name",
      "twitter:title",
      "Cognitive View: AI-Driven Compliance & Conduct Risk Automation"
    );
    setMeta(
      "name",
      "twitter:description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "name",
      "twitter:image",
      "https://app.cognitiveview.com/images/sideBarLogo.png"
    );
  }, []);

  const handleIframeError = (): void => {
    const encodedUrl = encodeURIComponent(fileUrl);
    let fallbackUrl = "";

    switch (fileType) {
      case "pdf":
        // Fallback to direct PDF view
        fallbackUrl = `${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`;
        break;

      case "excel":
        // Fallback to Google Docs for Excel/CSV
        fallbackUrl = `https://docs.google.com/viewerng/viewer?url=${encodedUrl}&embedded=true`;
        break;

      case "doc":
      case "ppt":
        // Fallback to Office 365 for Word/PowerPoint
        fallbackUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
        break;

      default:
        setError("Cannot preview this file type");
        return;
    }

    setViewerUrl(fallbackUrl);
  };

  const handleIframeLoad = (): void => {
    setLoading(false);
    setError("");
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="mx-4 max-w-md text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-xl text-gray-900">Cannot preview file</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={() => window.open(fileUrl, "_blank")}
            className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600"
          >
            Open Original File
          </button>
        </div>
      </div>
    );
  }

  // No file URL provided
  if (!fileUrl) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 text-6xl">📄</div>
          <h2 className="mb-2 text-xl text-gray-600">No file URL provided</h2>
          <p className="text-gray-500">
            Add ?url=YOUR_FILE_URL to the page URL
          </p>
        </div>
      </div>
    );
  }

  // Full-page document viewer (no headers, no borders)
  return (
    <div className="h-screen w-screen overflow-hidden">
      <iframe
        src={viewerUrl}
        className="m-0 h-full w-full border-0 p-0"
        title="Document Viewer"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-downloads"
        allow="fullscreen"
        style={{
          width: "100dvw",
          height: "100dvh",
          border: "none",
          margin: 0,
          padding: 0,
          display: "block"
        }}
      />
    </div>
  );
};

export default FileViewer;
