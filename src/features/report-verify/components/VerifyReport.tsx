"use client";
import useMutation from "@/shared/hooks/useMutation";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, XCircle } from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UploadState {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  verifying: boolean;
  verified: boolean | null;
  error: string | null;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      duration: 0.6
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const progressVariants = {
  initial: { width: "0%" },
  animate: {
    width: "100%",
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
};

const buttonVariants = {
  initial: { opacity: 1, scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

const successBadgeVariants = {
  hidden: { scale: 0, rotate: -90 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 12,
      duration: 0.8
    }
  }
};

const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.8, delay: 0.3, ease: "easeInOut" },
      opacity: { duration: 0.1, delay: 0.3 }
    }
  }
};

const VerifyReport: React.FC = () => {
  const { isLoading, mutation } = useMutation();
  const [state, setState] = useState<UploadState>({
    file: null,
    uploading: false,
    uploaded: false,
    verifying: false,
    verified: null,
    error: null
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const resetState = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setState({
      file: null,
      uploading: false,
      uploaded: false,
      verifying: false,
      verified: null,
      error: null
    });
    setShowPreview(false);
    setPreviewUrl("");
  };

  const verifyDocument = async () => {
    if (!state.file) {
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        uploading: true,
        error: null
      }));

      const formData = new FormData();
      formData.append("file", state.file);

      // Upload complete, now start verification
      setState((prev) => ({
        ...prev,
        uploading: false,
        uploaded: true,
        verifying: true
      }));

      const res = await mutation("verify-responsible-ai-report", {
        method: "POST",
        body: formData,
        isFormData: true,
        isAlert: false
      });

      if (res?.status === 200) {
        toast.success("Document verified successfully");
        setState((prev) => ({
          ...prev,
          verifying: false,
          verified: true
        }));
      } else {
        setState((prev) => ({
          ...prev,
          verifying: false,
          verified: false
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during verification";
      toast.error(errorMessage);
      setState((prev) => ({
        ...prev,
        uploading: false,
        verifying: false,
        verified: false,
        error: errorMessage
      }));
    }
  };

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type === "application/pdf") {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setState((prev) => ({ ...prev, file, error: null }));
      } else {
        setState((prev) => ({
          ...prev,
          error: "Please select a valid PDF file."
        }));
      }
    },
    []
  );

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setState((prev) => ({ ...prev, file, error: null }));
    } else {
      setState((prev) => ({
        ...prev,
        error: "Please select a valid PDF file."
      }));
    }
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    []
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const isProcessing = isLoading || state.uploading || state.verifying;

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Layer - Animated */}
      <motion.div
        className="absolute left-0 top-16 z-0 h-[25rem] w-full bg-tertiary/10"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "25rem" }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Header - Slide in from top */}
      <motion.header
        className="relative z-50 border-b bg-white px-4 py-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center">
            <motion.img
              src="/sideBarLogo.svg"
              alt="sidebar logo"
              className="h-fit w-52 object-contain"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
            {/* <motion.div
              className="flex items-center space-x-2 text-sm text-gray-600"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span></span>
            </motion.div> */}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Title Section - Staggered animation */}
          <motion.div
            className="mb-12 text-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
          >
            <motion.h1
              className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl"
              variants={{
                hidden: { y: 30, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }
                }
              }}
            >
              Verify Responsible AI Report
            </motion.h1>
            <motion.p
              className="max-w-9xl mx-auto font-medium leading-relaxed text-gray-800"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }
                }
              }}
            >
              {` Upload your document to confirm it’s the original, untampered version issued by us.
Each PDF we provide is cryptographically protected and embedded with a digital fingerprint. This verification tool checks the uploaded file against our original records to ensure it hasn’t been modified, altered, or forged in any way.`}
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Upload Area */}
            {!state.file &&
              !state.uploading &&
              !state.verifying &&
              state.verified === null && (
                <motion.div
                  className="mx-auto max-w-4xl"
                  key="upload-area"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div
                    className="group relative z-20 cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center transition-all duration-300 hover:border-tertiary-400 hover:bg-tertiary-50/50"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="mx-auto mb-6 flex h-16 w-16 items-center justify-center"
                      variants={iconVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <FileText className="h-12 w-12 text-gray-400 transition-colors group-hover:text-tertiary-500" />
                    </motion.div>
                    <motion.h3
                      className="mb-4 text-xl font-medium text-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      Drop document here to upload
                    </motion.h3>
                    <motion.button
                      className="mb-6 rounded-lg bg-tertiary-500 px-8 py-3 font-medium text-white transition-colors hover:bg-tertiary-600"
                      variants={buttonVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Select from device
                    </motion.button>
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </motion.div>
                </motion.div>
              )}

            {/* PDF Preview */}
            {state.file && !state.uploading && !state.uploaded && (
              <motion.div
                className="mx-auto max-w-4xl"
                key="pdf-preview"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  className="relative z-20 mb-8 rounded-2xl border bg-white p-6 shadow-sm"
                  variants={cardVariants}
                  whileHover={{
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div
                    className="mb-6 flex items-center space-x-4"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <motion.div
                      className="flex h-16 w-12 items-center justify-center rounded bg-red-500"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-xs font-bold text-white">PDF</span>
                    </motion.div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {state.file.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(state.file.size)}
                      </p>
                    </div>
                    <motion.button
                      onClick={resetState}
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <XCircle className="h-5 w-5" />
                    </motion.button>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="flex w-full items-center justify-between gap-10">
                    <motion.button
                      onClick={() => setShowPreview(true)}
                      className="w-full rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                      variants={buttonVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      Preview PDF
                    </motion.button>

                    <motion.button
                      onClick={verifyDocument}
                      disabled={isProcessing}
                      className="w-full rounded-lg bg-tertiary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-tertiary-600 disabled:cursor-not-allowed disabled:opacity-50"
                      variants={buttonVariants}
                      initial="initial"
                      whileHover={!isProcessing ? "hover" : "initial"}
                      whileTap={!isProcessing ? "tap" : "initial"}
                      layoutId="verify-button"
                    >
                      {isProcessing ? "Processing..." : "Verify Document"}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Processing States */}
            {(state.uploading || state.verifying) && (
              <motion.div
                className="mx-auto max-w-4xl"
                key="processing"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  className="relative z-20 rounded-2xl border bg-white p-8 shadow-sm"
                  variants={cardVariants}
                >
                  <div className="text-center">
                    <motion.div
                      className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </motion.div>
                    <motion.h3
                      className="mb-2 text-xl font-medium text-gray-900"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {state.uploading
                        ? "Uploading Document"
                        : "Verifying Document"}
                    </motion.h3>
                    <motion.p
                      className="text-gray-600"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {state.uploading
                        ? "Securely transferring your PDF"
                        : "Running security validation checks"}
                    </motion.p>
                    <motion.div
                      className="mx-auto mt-6 h-2 w-64 overflow-hidden rounded-full bg-gray-200"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div
                        className="h-full bg-blue-500"
                        variants={progressVariants}
                        initial="initial"
                        animate="animate"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Verification Result */}
            {state.verified !== null && (
              <motion.div
                className="mx-auto max-w-4xl"
                key="result"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  className="relative z-20 rounded-2xl border bg-white p-8 shadow-sm"
                  variants={cardVariants}
                >
                  {state.verified ? (
                    <div className="text-center">
                      {/* Large Verification Badge */}
                      <motion.div
                        className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full border-4 border-green-200 bg-green-50"
                        variants={successBadgeVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div
                          className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <motion.svg
                            className="h-12 w-12 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <motion.path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                              variants={checkmarkVariants}
                              initial="hidden"
                              animate="visible"
                            />
                          </motion.svg>
                        </motion.div>
                      </motion.div>
                      <motion.h3
                        className="mb-2 text-2xl font-bold text-green-900"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      >
                        PDF Verified
                      </motion.h3>
                      <motion.p
                        className="mb-6 text-green-700"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                      >
                        Document has been successfully verified and is authentic
                      </motion.p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <motion.div
                        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 150,
                          damping: 15
                        }}
                      >
                        <XCircle className="h-8 w-8 text-red-600" />
                      </motion.div>
                      <motion.h3
                        className="mb-2 text-xl font-medium text-red-900"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        Verification Failed
                      </motion.h3>
                      <motion.p
                        className="mb-6 text-red-700"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        Unable to verify document authenticity
                      </motion.p>
                    </div>
                  )}

                  <motion.button
                    onClick={resetState}
                    className="w-full rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    layoutId="reset-button"
                  >
                    Verify Another Document
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PDF Preview Dialog */}
          <AnimatePresence>
            {showPreview && previewUrl && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setShowPreview(false)}
              >
                <motion.div
                  className="relative mx-4 h-[90vh] w-full max-w-4xl rounded-2xl bg-white shadow-2xl"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.4
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Dialog Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-8 items-center justify-center rounded bg-red-500">
                        <span className="text-xs font-bold text-white">
                          PDF
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          PDF Preview
                        </h3>
                        <p className="text-sm text-gray-500">
                          {state.file?.name}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setShowPreview(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <XCircle className="h-5 w-5" />
                    </motion.button>
                  </div>

                  {/* PDF Iframe */}
                  <div className="h-[calc(90vh-80px)] p-6">
                    <motion.iframe
                      src={previewUrl}
                      className="h-full w-full rounded-lg border border-gray-200"
                      title="PDF Preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          <AnimatePresence>
            {state.error && (
              <motion.div
                className="mx-auto mt-6 max-w-2xl"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <motion.div
                  className="relative z-20 rounded-lg border border-red-200 bg-red-50 p-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                      }}
                    >
                      <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                    </motion.div>
                    <p className="text-sm text-red-700">{state.error}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default VerifyReport;
