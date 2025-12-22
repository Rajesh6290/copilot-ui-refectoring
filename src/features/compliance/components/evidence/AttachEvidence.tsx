import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useUser } from "@clerk/nextjs";
import { Dialog } from "@mui/material";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  Filter,
  Info,
  Layers,
  Search,
  Shield,
  Tag,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Document {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  doc_id: string;
  name: string;
  description: string;
  version?: string;
  framework?: string[];
  category?: string[];
  keywords?: string[];
  tags?: string[];
  file_types?: string[];
  created_at: string;
  updated_at: string;
  status?: string;
  source_type: string;
  collection_name?: string;
  is_attached?: boolean;
}

interface AttachedEvidenceProps {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  controlId: string;
  isAccess?: ISAccess;
}
interface ISAccess {
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
    };
  }[];
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
}
const AttachedEvidence: React.FC<AttachedEvidenceProps> = ({
  open,
  onClose,
  mutate,
  controlId,
  isAccess
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "policy" | "knowledge">(
    "all"
  );
  const { user, isLoaded } = useUser();
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const { mutation } = useMutation();
  const { data, isValidating, error } = useSwr(
    open
      ? `evidence/policies?page=${currentPage}&limit=${limit}&control_id=${controlId}`
      : null
  );

  // Reset selections when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedDocs(new Set());
      setCurrentPage(1);
      setSearchTerm("");
      setFilterType("all");
    }
  }, [open]);

  // Combine all documents from policies and knowledge
  const allDocuments: Document[] = [
    ...(data?.policies?.documents || []),
    ...(data?.knowledge?.documents || [])
  ];

  // Filter documents based on search and filter type
  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesSearch =
      searchTerm === "" ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.doc_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" || doc.source_type === filterType;

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil((data?.pagination?.total_records || 0) / limit);

  const toggleDocSelection = (docId: string, isAttached?: boolean) => {
    // Prevent selection of already attached documents
    if (isAttached) {
      return;
    }
    const newSelected = new Set(selectedDocs);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocs(newSelected);
  };
  const handleAttach = async () => {
    try {
      setLoading(true);
      const selected = allDocuments.filter(
        (doc) => selectedDocs.has(doc.doc_id) && !doc.is_attached
      );
      let successCount = 0;
      for (const doc of selected) {
        const res = await mutation("evidence/attach-policy", {
          method: "POST",
          isAlert: false,
          body: {
            evidence_overrides: {
              control_id: controlId,
              collected_by: isLoaded
                ? user?.fullName
                  ? user?.fullName
                  : user?.firstName + " " + user?.lastName
                : undefined
            },
            source_document_id: doc?.doc_id,
            source_type: doc?.source_type
          }
        });
        if (res?.status !== 201) {
          return;
        }
        successCount++;
        continue;
      }
      if (successCount === selected.length) {
        toast.success(
          `${successCount} document${successCount > 1 ? "s" : ""} attached successfully.`
        );
        mutate();
        onClose();
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "An error occurred while attaching documents."
      );
    } finally {
      setLoading(false);
    }
  };

  const getSourceTypeIcon = (type: string) => {
    if (type === "policy") {
      return <Shield className="h-4 w-4" />;
    }
    return <BookOpen className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getSourceTypeLabel = (type: string) => {
    return type === "policy" ? "Policy Document" : "Knowledge Base";
  };

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className:
          "bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[90vh]"
      }}
    >
      {/* Header with Gradient */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-tertiary-50 to-tertiary-50 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary-600 dark:bg-tertiary-500">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Attach Evidence
                </h2>
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                  Select documents to support your compliance requirements
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-all hover:bg-white hover:text-gray-600 hover:shadow-md dark:hover:bg-gray-800 dark:hover:text-gray-300"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mt-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, description, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-tertiary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value as "all" | "policy" | "knowledge"
                  )
                }
                className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-gray-900 shadow-sm transition-all focus:border-tertiary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500/50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="policy">Policy Documents</option>
                <option value="knowledge">Knowledge Base</option>
              </select>
            </div>
          </div>

          {/* Selected Count Banner */}
          {selectedDocs.size > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-tertiary-200 bg-gradient-to-r from-tertiary-50 to-tertiary-100 px-4 py-3 shadow-sm dark:border-tertiary-800 dark:from-tertiary-900/20 dark:to-tertiary-900/30">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-tertiary-600 dark:text-tertiary-400" />
                <span className="text-sm font-semibold text-tertiary-900 dark:text-tertiary-300">
                  {selectedDocs.size} document
                  {selectedDocs.size !== 1 ? "s" : ""} selected for attachment
                </span>
              </div>
              <button
                onClick={() => setSelectedDocs(new Set())}
                className="text-xs font-medium text-tertiary-700 hover:text-tertiary-900 dark:text-tertiary-400 dark:hover:text-tertiary-300"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className="overflow-y-auto bg-gray-50 px-6 py-4 dark:bg-gray-900"
        style={{ maxHeight: "55vh" }}
      >
        {isValidating && !data ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <svg
                className="h-10 w-10 animate-spin text-tertiary-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <div className="text-center">
                <p className="font-medium text-gray-900 dark:text-white">
                  Loading documents...
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Please wait while we fetch available evidence
                </p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="mt-4 font-semibold text-gray-900 dark:text-white">
                Failed to load documents
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please try again or contact support if the issue persists
              </p>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <FileText className="h-8 w-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="mt-4 font-semibold text-gray-900 dark:text-white">
                No documents found
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Try adjusting your search or filter criteria"
                  : "No evidence documents are currently available"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <button
                key={doc.doc_id}
                onClick={() => toggleDocSelection(doc.doc_id, doc.is_attached)}
                disabled={doc.is_attached}
                className={`group w-full rounded-xl border-2 bg-white p-5 text-left shadow-sm transition-all ${
                  doc.is_attached
                    ? "cursor-not-allowed opacity-60"
                    : "hover:shadow-lg"
                } dark:bg-gray-800`}
              >
                <div className="flex items-start gap-4">
                  {/* Selection Indicator */}
                  <div className="flex-shrink-0 pt-1">
                    {doc.is_attached ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 dark:bg-green-500">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    ) : selectedDocs.has(doc.doc_id) ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-tertiary-600 dark:bg-tertiary-500">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-tertiary-400 dark:border-gray-600 dark:group-hover:border-tertiary-500">
                        <Circle className="h-3 w-3 text-gray-400 group-hover:text-tertiary-500 dark:group-hover:text-tertiary-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                          {doc.name}
                        </h3>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        {doc.is_attached && (
                          <span className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Already Attached
                          </span>
                        )}
                        <span
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            doc.source_type === "policy"
                              ? "border-tertiary-200 bg-tertiary-100 text-tertiary-800 dark:border-tertiary-800 dark:bg-tertiary-900/30 dark:text-tertiary-400"
                              : "border-tertiary-200 bg-tertiary-100 text-tertiary-800 dark:border-tertiary-800 dark:bg-tertiary-900/30 dark:text-tertiary-400"
                          }`}
                        >
                          {getSourceTypeIcon(doc.source_type)}
                          {getSourceTypeLabel(doc.source_type)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {doc.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {doc.description}
                      </p>
                    )}

                    {/* Metadata Row */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {doc.version && (
                        <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 dark:bg-gray-700">
                          <Info className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            v{doc.version}
                          </span>
                        </div>
                      )}
                      {doc.file_types && doc.file_types.length > 0 && (
                        <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 dark:bg-gray-700">
                          <FileText className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs font-medium uppercase text-gray-700 dark:text-gray-300">
                            {doc.file_types[0]}
                          </span>
                        </div>
                      )}
                      {doc.collection_name && (
                        <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 dark:bg-gray-700">
                          <Layers className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {doc.collection_name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 dark:bg-gray-700">
                        <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Updated {formatDate(doc.updated_at)}
                        </span>
                      </div>
                    </div>

                    {/* Tags and Frameworks */}
                    {((doc.framework && doc.framework.length > 0) ||
                      (doc.tags && doc.tags.length > 0)) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {doc.framework?.slice(0, 3).map((fw, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-full bg-tertiary-50 px-2.5 py-1 text-xs font-medium text-tertiary-700 ring-1 ring-tertiary-200 dark:bg-tertiary-900/20 dark:text-tertiary-400 dark:ring-tertiary-800"
                          >
                            <Shield className="h-3 w-3" />
                            {fw}
                          </span>
                        ))}
                        {doc.tags?.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600"
                          >
                            <Tag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                        {((doc.framework?.length ?? 0) > 3 ||
                          (doc.tags?.length ?? 0) > 2) && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            +
                            {(doc.framework?.length ?? 0) +
                              (doc.tags?.length ?? 0) -
                              5}{" "}
                            more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  ({data.pagination.total_records} total documents)
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isValidating}
                className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages || isValidating}
                className="rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {selectedDocs.size > 0
              ? `Ready to attach ${selectedDocs.size} document${selectedDocs.size !== 1 ? "s" : ""}`
              : "Select documents to continue"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            {isAccess?.buttons?.[3]?.permission?.is_shown && (
              <CustomButton
                onClick={handleAttach}
                loading={loading}
                loadingText="Processing....."
                disabled={
                  selectedDocs.size === 0 ||
                  !isAccess?.buttons?.[3]?.permission?.actions?.create
                }
                startIcon={<CheckCircle2 size={18} />}
                className="shadow-md hover:shadow-lg"
              >
                Attach Evidence{" "}
                {selectedDocs.size > 0 && `(${selectedDocs.size})`}
              </CustomButton>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AttachedEvidence;
