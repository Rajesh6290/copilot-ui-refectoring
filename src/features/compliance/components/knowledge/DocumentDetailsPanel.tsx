"use client";
import useSwr from "@/shared/hooks/useSwr";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Eye,
  FileText,
  Globe,
  History,
  LucideIcon,
  MessageSquare,
  RefreshCw,
  Upload,
  User,
  X,
  XCircle
} from "lucide-react";

interface AuditTrailItem {
  action: string;
  status: string;
  reviewed_by: string;
  reviewed_at: string;
  comments: string;
  ip: string;
}
const AuditTrailSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="flex items-start space-x-4">
          <div className="h-10 w-10 rounded-full bg-slate-300 dark:bg-slate-600"></div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-20 rounded bg-slate-300 dark:bg-slate-600"></div>
              <div className="h-4 w-16 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              <div className="h-4 w-24 rounded bg-slate-300 dark:bg-slate-600"></div>
            </div>
            <div className="h-3 w-32 rounded bg-slate-300 dark:bg-slate-600"></div>
            <div className="h-8 w-full rounded bg-slate-300 dark:bg-slate-600"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
const getActionIcon = (action: string): LucideIcon => {
  switch (action.toLowerCase()) {
    case "uploaded":
      return Upload;
    case "updated":
      return RefreshCw;
    case "approved":
      return CheckCircle;
    case "rejected":
      return XCircle;
    case "reviewed":
      return Eye;
    default:
      return History;
  }
};

const getActionColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "approved":
      return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20";
    case "draft":
      return "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20";
    case "reviewed":
      return "text-tertiary-600 bg-tertiary-50 border-tertiary-200 dark:text-tertiary-400 dark:bg-tertiary-500/10 dark:border-tertiary-500/20";
    case "rejected":
      return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/20";
  }
};
const DocumentDetailsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  collectionId: string;
}> = ({ isOpen, onClose, documentId, collectionId }) => {
  const {
    data: documentDetails,
    isValidating: isLoading,
    error,
    mutate: refetchDetails
  } = useSwr(
    isOpen && documentId && collectionId
      ? `knowledge/document?document_id=${documentId}&collection_id=${collectionId}`
      : null
  );

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  const getOwnerInitials = (ownerName: string): string => {
    return (
      ownerName
        ?.split(" ")
        ?.map((n: string) => n[0])
        ?.join("")
        ?.toUpperCase() || "??"
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-8 z-99999 h-full w-full max-w-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b border-slate-200 bg-gradient-to-r from-tertiary-50 via-tertiary-50 to-tertiary-50 px-6 py-5 dark:border-slate-700 dark:from-tertiary-900/20 dark:via-tertiary-900/20 dark:to-tertiary-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-xl bg-gradient-to-r from-tertiary-500 via-tertiary-500 to-tertiary-500 p-3 shadow-lg">
                      <History className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Document History
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Audit trail and details
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="rounded-xl p-2.5 text-slate-400 transition-all duration-200 hover:bg-white/50 hover:text-slate-600 dark:hover:bg-slate-800/50 dark:hover:text-slate-300"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
                {isLoading ? (
                  <div className="p-8">
                    <AuditTrailSkeleton />
                  </div>
                ) : error ? (
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                        Failed to load document details
                      </h3>
                      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        There was an error loading the audit trail information.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => refetchDetails()}
                        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
                      >
                        Try Again
                      </motion.button>
                    </div>
                  </div>
                ) : documentDetails?.document ? (
                  <div className="space-y-8 p-8">
                    {/* Document Info Card */}
                    <div className="rounded-2xl border border-slate-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/70">
                      <div className="mb-4 flex items-center space-x-3">
                        <div className="rounded-lg bg-gradient-to-r from-tertiary-500 to-cyan-500 p-2">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Document Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            File Name
                          </p>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">
                            {documentDetails.document.file_name || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Version
                          </p>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">
                            {documentDetails.document.version || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Owner
                          </p>
                          <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                              <span className="text-xs font-bold text-white">
                                {getOwnerInitials(
                                  documentDetails.document.owner_name || ""
                                )}
                              </span>
                            </div>
                            <p className="text-base font-semibold text-slate-900 dark:text-white">
                              {documentDetails.document.owner_name || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Current Status
                          </p>
                          <span
                            className={`inline-flex items-center space-x-2 rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${getActionColor(
                              documentDetails.document.status || "unknown"
                            )}`}
                          >
                            <div className="h-2 w-2 rounded-full bg-current"></div>
                            <span>
                              {documentDetails.document.status || "Unknown"}
                            </span>
                          </span>
                        </div>
                      </div>

                      {documentDetails.document.comment && (
                        <div className="mt-6 rounded-xl bg-slate-100/50 p-4 dark:bg-slate-700/30">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Latest Comment
                          </p>
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5 rounded-full bg-slate-400 p-1">
                              <MessageSquare className="h-3 w-3 text-white" />
                            </div>
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                              {documentDetails.document.comment}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Audit Trail Card */}
                    <div className="rounded-2xl border border-slate-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/70">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-lg bg-gradient-to-r from-violet-500 to-tertiary-500 p-2">
                            <History className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                              Audit Trail
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {documentDetails.document.audit_trail?.length ||
                                0}{" "}
                              entries
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Check if audit_trail exists and has items */}
                      {documentDetails.document.audit_trail &&
                      documentDetails.document.audit_trail.length > 0 ? (
                        <div className="space-y-6">
                          {documentDetails.document.audit_trail.map(
                            (entry: AuditTrailItem, index: number) => {
                              const ActionIcon = getActionIcon(
                                entry.action || "unknown"
                              );
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="relative"
                                >
                                  {/* Timeline line */}
                                  {index !==
                                    documentDetails.document.audit_trail
                                      .length -
                                      1 && (
                                    <div className="absolute left-6 top-14 h-12 w-0.5 bg-gradient-to-b from-slate-300 to-transparent dark:from-slate-600"></div>
                                  )}

                                  <div className="flex items-start space-x-4">
                                    {/* Action Icon */}
                                    <div
                                      className={`relative z-10 flex-shrink-0 rounded-full border-2 border-white p-2.5 shadow-lg ${getActionColor(
                                        entry.status || "unknown"
                                      )} dark:border-slate-800`}
                                    >
                                      <ActionIcon className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0 flex-1 rounded-xl border border-slate-200/50 bg-white/50 p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                                      {/* Action Header */}
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <span className="text-lg font-semibold capitalize text-slate-900 dark:text-white">
                                            {entry.action || "Unknown Action"}
                                          </span>
                                          <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getActionColor(
                                              entry.status || "unknown"
                                            )}`}
                                          >
                                            {entry.status || "Unknown"}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Metadata */}
                                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center space-x-2">
                                          <div className="rounded-full bg-slate-200 p-1 dark:bg-slate-700">
                                            <User className="h-3 w-3" />
                                          </div>
                                          <span className="font-medium">
                                            {entry.reviewed_by ||
                                              "Unknown User"}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <div className="rounded-full bg-slate-200 p-1 dark:bg-slate-700">
                                            <Calendar className="h-3 w-3" />
                                          </div>
                                          <span>
                                            {entry.reviewed_at
                                              ? formatDate(entry.reviewed_at)
                                              : "N/A"}
                                          </span>
                                        </div>
                                        {entry.ip && (
                                          <div className="flex items-center space-x-2">
                                            <div className="rounded-full bg-slate-200 p-1 dark:bg-slate-700">
                                              <Globe className="h-3 w-3" />
                                            </div>
                                            <span className="font-mono text-xs">
                                              {entry.ip}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Comments */}
                                      {entry.comments && (
                                        <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
                                          <div className="flex items-start space-x-2">
                                            <div className="mt-0.5 rounded-full bg-slate-400 p-1">
                                              <MessageSquare className="h-3 w-3 text-white" />
                                            </div>
                                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                              {` "${entry.comments}"`}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 dark:border-slate-600 dark:bg-slate-700/30">
                          <div className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                              <History className="h-6 w-6 text-slate-400" />
                            </div>
                            <h4 className="mb-1 font-medium text-slate-900 dark:text-white">
                              No History Available
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              No audit trail entries found for this document
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-6">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                        <History className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400">
                        No document details found
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default DocumentDetailsPanel;
