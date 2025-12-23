"use client";
import CustomFilePreview from "@/shared/common/CustomFilePreview";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Edit,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  History,
  LucideIcon,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa6";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Collection } from "./Knowledge";
import dynamic from "next/dynamic";
const UploadKnowledgeDocument = dynamic(
  () => import("./UploadKnowledgeDocument"),
  {
    ssr: false
  }
);
const UpdateKnowledgeDocument = dynamic(
  () => import("./UpdateKnowledgeDocument"),
  {
    ssr: false
  }
);
const StatusUpdateDialog = dynamic(() => import("./StatusUpdateDialog"), {
  ssr: false
});
const DocumentDetailsPanel = dynamic(() => import("./DocumentDetailsPanel"), {
  ssr: false
});
const AddNewKnowledge = dynamic(() => import("./AddNewKnowledge"), {
  ssr: false
});

// TypeScript interfaces for the API response
interface AssociatedDocument {
  document_id: string;
  file_name: string;
  version: string;
  owner_name: string;
  status: "draft" | "reviewed" | "approved" | "rejected";
  action: string | null;
  reviewed_by: string;
  reviewed_at: string;
  doc_url?: string;
}

export interface Template {
  template_id: string;
  template_name: string;
  doc_url: string;
  type?: "pdf" | "docx" | "csv";
}
export interface CurrentAccess {
  permission: {
    is_shown: boolean;
    actions: {
      create: boolean;
      update: boolean;
      read: boolean;
      delete: boolean;
    };
  };
  buttons: {
    permission: {
      is_shown: boolean;
      actions: {
        create: boolean;
        update: boolean;
        read: boolean;
        delete: boolean;
      };
    };
  }[];
}
interface KnowledgeCardProps {
  collection: Collection;
  mutate: () => void;
  currentAccess: CurrentAccess;
}

interface StatusConfig {
  color: string;
  icon: LucideIcon;
}

interface FileIconConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

interface ActionButton {
  icon: LucideIcon;
  color: string;
  title: string;
}

const getStatusConfig = (
  status: AssociatedDocument["status"]
): StatusConfig => {
  switch (status) {
    case "approved":
      return {
        color:
          "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
        icon: CheckCircle
      };
    case "draft":
      return {
        color:
          "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
        icon: Edit
      };
    case "reviewed":
      return {
        color:
          "bg-tertiary-50 text-tertiary-700 ring-tertiary-600/20 dark:bg-tertiary-500/10 dark:text-tertiary-400 dark:ring-tertiary-500/20",
        icon: Clock
      };
    case "rejected":
      return {
        color:
          "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
        icon: AlertCircle
      };
    default:
      return {
        color:
          "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20",
        icon: AlertCircle
      };
  }
};

const getFileIcon = (type?: string): FileIconConfig => {
  switch (type) {
    case "pdf":
      return {
        icon: File,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800"
      };
    case "docx":
      return {
        icon: FileText,
        color: "text-tertiary-600 dark:text-tertiary-400",
        bg: "bg-tertiary-100 dark:bg-tertiary-900/20",
        border: "border-tertiary-200 dark:border-tertiary-800"
      };
    case "csv":
      return {
        icon: FileSpreadsheet,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800"
      };
    default:
      return {
        icon: FileText,
        color: "text-tertiary-600 dark:text-tertiary-400",
        bg: "bg-tertiary-100 dark:bg-tertiary-900/20",
        border: "border-tertiary-200 dark:border-tertiary-800"
      };
  }
};

const getCollectionColor = (color: string = "tertiary"): string => {
  const colorMap: Record<string, string> = {
    tertiary: "from-tertiary-500 to-tertiary-600",
    green: "from-green-500 to-green-600",
    purple: "from-tertiary-500 to-tertiary-600"
  };
  return colorMap[color] || "from-tertiary-500 to-tertiary-600";
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const actionButtons: ActionButton[] = [
  {
    icon: Eye,
    color:
      "bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    title: "View"
  },
  {
    icon: Edit,
    color:
      "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    title: "Update"
  },
  {
    icon: Trash2,
    color:
      "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    title: "Delete"
  },
  {
    icon: History,
    color:
      "bg-purple-50 hover:bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    title: "History"
  }
];
// All statuses for showing in status column
const allStatuses = ["draft", "reviewed", "approved", "rejected"];

// Skeleton loaders
const DocumentRowSkeleton: React.FC = () => (
  <tr className="animate-pulse">
    <td className="whitespace-nowrap px-4 py-4 lg:px-8 lg:py-6">
      <div className="flex items-center space-x-3 lg:space-x-4">
        <div className="h-8 w-8 rounded-lg bg-slate-300 dark:bg-slate-600"></div>
        <div className="min-w-0 flex-1">
          <div className="h-4 w-3/4 rounded bg-slate-300 dark:bg-slate-600"></div>
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-300 dark:bg-slate-600"></div>
        </div>
      </div>
    </td>
    <td className="whitespace-nowrap px-4 py-4 lg:px-8 lg:py-6">
      <div className="h-6 w-16 rounded-full bg-slate-300 dark:bg-slate-600"></div>
    </td>
    <td className="whitespace-nowrap px-4 py-4 lg:px-8 lg:py-6">
      <div className="flex items-center space-x-2">
        <div className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-600 lg:h-8 lg:w-8"></div>
        <div className="h-4 w-24 rounded bg-slate-300 dark:bg-slate-600"></div>
      </div>
    </td>
    <td className="whitespace-nowrap px-4 py-4 lg:px-8 lg:py-6">
      <div className="space-y-2">
        {[1].map((i) => (
          <div
            key={i}
            className="h-6 w-20 rounded-full bg-slate-300 dark:bg-slate-600"
          ></div>
        ))}
      </div>
    </td>
    <td className="whitespace-nowrap px-4 py-4 lg:px-8 lg:py-6">
      <div className="flex items-center space-x-1 lg:space-x-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-8 rounded-lg bg-slate-300 dark:bg-slate-600"
          ></div>
        ))}
      </div>
    </td>
  </tr>
);

const TemplateSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="animate-pulse rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-600 dark:bg-slate-700"
      >
        <div className="mb-3 flex items-center space-x-3">
          <div className="h-8 w-8 rounded bg-slate-300 dark:bg-slate-600"></div>
          <div className="h-4 w-32 rounded bg-slate-300 dark:bg-slate-600"></div>
        </div>
        <div className="h-8 w-full rounded bg-slate-300 dark:bg-slate-600"></div>
      </div>
    ))}
  </div>
);

const TableSkeleton: React.FC = () => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 dark:border-slate-700 dark:from-slate-700/50 dark:to-slate-600/50">
          <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 lg:px-8">
            Document Name
          </th>
          <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 lg:px-8">
            Version
          </th>
          <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 lg:px-8">
            Owner
          </th>
          <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 lg:px-8">
            Status
          </th>
          <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 lg:px-8">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
        {[1, 2, 3].map((i) => (
          <DocumentRowSkeleton key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  collection,
  mutate,
  currentAccess
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const { isLoading: deleteLoading, mutation: deleteMutation } = useMutation();
  const { isLoading: deleteDocLoading, mutation: deleteDocMutation } =
    useMutation();
  const [selectedDocument, setSelectedDocument] =
    useState<AssociatedDocument | null>(null);
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const [openUpload, setOpenUpload] = useState<boolean>(false);
  const [updateCollection, setUpdateCollection] = useState<boolean>(false);
  const [openFile, setOpenFile] = useState<boolean>(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [updateDocumentOpen, setUpdateDocumentOpen] = useState<boolean>(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState<boolean>(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [fileData, setFileData] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [selectedDocumentForStatusUpdate, setSelectedDocumentForStatusUpdate] =
    useState<{
      documentId: string;
      currentStatus: string;
      documentName: string;
    } | null>(null);
  const {
    data,
    isValidating: documentsLoading,
    error,
    mutate: documentMutate
  } = useSwr(
    collection?.collection_id && open
      ? `knowledge/documents?collection_id=${collection?.collection_id}`
      : null
  );
  const deleteCollection = async (): Promise<void> => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the collection.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteMutation(
          `knowledge/collection?collection_id=${collection?.collection_id}`,
          {
            method: "DELETE",
            isAlert: false
          }
        );

        if (res?.status === 200) {
          mutate();
          toast.success("Collection deleted successfully");
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete collection"
        );
      }
    }
  };

  const deleteDocument = async (documentIde: string): Promise<void> => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the document.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteDocMutation(
          `knowledge/document?document_id=${documentIde}&collection_id=${collection?.collection_id}`,
          {
            method: "DELETE",
            isAlert: false
          }
        );

        if (res?.status === 200) {
          documentMutate();
          setDeleteDocumentId(null);
          toast.success("Document deleted successfully");
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete document"
        );
      }
    }
  };

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

  const handleActionClick = (
    actionTitle: string,
    document: AssociatedDocument
  ) => {
    try {
      switch (actionTitle) {
        case "View":
          setFileData({
            name: document.file_name || "Unknown File",
            url: document.doc_url || ""
          });
          setSelectedDocumentForStatusUpdate({
            documentId: document.document_id,
            currentStatus: document.status,
            documentName: document.file_name
          });
          setOpenFile(true);
          break;
        case "Update":
          // Check permission for update action
          if (currentAccess?.buttons?.[2]?.permission?.actions?.update) {
            setDocumentId(document.document_id);
            setUpdateDocumentOpen(true);
          } else {
            toast.warning("You don't have access to update this document.");
          }
          break;
        case "Download":
          if (document.doc_url) {
            const link = window.document.createElement("a");
            link.href = document.doc_url;
            link.download = document.file_name || "download";
            link.click();
          } else {
            toast.error("Download URL not available");
          }
          break;
        case "Delete":
          // Check permission for delete action
          if (currentAccess?.buttons?.[3]?.permission?.actions?.delete) {
            deleteDocument(document.document_id);
            setDeleteDocumentId(document.document_id);
          } else {
            toast.warning("You don't have access to delete this document.");
          }
          break;
        case "History":
          if (document.document_id && collection?.collection_id) {
            setSelectedDocumentId(document.document_id);
            setDetailsPanelOpen(true);
          } else {
            toast.error("Document or collection ID not available");
          }
          break;
        default:
          break;
      }
    } catch {
      toast.error("An error occurred while performing the action");
    }
  };

  const handleTemplateView = (template: Template) => {
    setFileData({
      name: template.template_name || "Unknown Template",
      url: template.doc_url || ""
    });
    setOpenFile(true);
  };

  return (
    <>
      <CustomFilePreview
        fileUrl={fileData?.url as string}
        fileName={fileData?.name || "Unknown File"}
        isOpen={openFile}
        onClose={() => setOpenFile(false)}
        isAction={true}
        actionItems={{
          documentId: selectedDocumentForStatusUpdate?.documentId || "",
          collectionId: collection?.collection_id || "",
          currentStatus: selectedDocumentForStatusUpdate?.currentStatus || "",
          mutate: documentMutate,
          onClose: () => {
            setSelectedDocumentForStatusUpdate(null);
          },
          ...(currentAccess?.buttons?.[2]?.permission?.actions?.update !==
            undefined && {
            isAccess: currentAccess.buttons[2].permission.actions.update
          })
        }}
      />
      <StatusUpdateDialog
        isOpen={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
          setSelectedDocument(null);
        }}
        documentId={selectedDocument?.document_id || ""}
        collectionId={collection?.collection_id as string}
        currentStatus={selectedDocument?.status || ""}
        documentName={selectedDocument?.file_name || ""}
        onStatusUpdate={() => {
          documentMutate(); // Refresh the documents
        }}
      />
      <DocumentDetailsPanel
        isOpen={detailsPanelOpen}
        onClose={() => setDetailsPanelOpen(false)}
        documentId={selectedDocumentId}
        collectionId={collection?.collection_id}
      />

      <motion.div
        key={collection?.collection_id}
        variants={itemVariants}
        className="group overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/80"
      >
        <AddNewKnowledge
          open={updateCollection}
          close={() => setUpdateCollection(false)}
          mutate={mutate}
          collection={collection}
        />

        <UploadKnowledgeDocument
          collectionId={collection?.collection_id}
          open={openUpload}
          onClose={() => setOpenUpload(false)}
          mutate={() => {
            documentMutate();
          }}
          templates={data?.collection?.templates || []}
        />
        <UpdateKnowledgeDocument
          collectionId={collection?.collection_id}
          open={updateDocumentOpen}
          onClose={() => setUpdateDocumentOpen(false)}
          mutate={() => {
            documentMutate();
          }}
          documentId={documentId as string}
          templates={data?.collection?.templates || []}
        />

        {/* Collection Header */}
        <div className="relative overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${getCollectionColor("tertiary")} opacity-5`}
          ></div>
          <div className="relative border-b border-slate-200/50 p-4 dark:border-slate-700/50 lg:p-6">
            <div
              tabIndex={0}
              role="button"
              onClick={() => setOpen(!open)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOpen(!open);
                }
              }}
              className="flex cursor-pointer items-center justify-between"
            >
              <div className="flex min-w-0 flex-1 items-center space-x-3">
                <div
                  className={`bg-gradient-to-r p-2 lg:p-3 ${getCollectionColor("tertiary")} flex-shrink-0 rounded-xl shadow-lg`}
                >
                  <Folder className="h-5 w-5 text-white lg:h-6 lg:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white lg:text-xl">
                    {collection?.collection_name}
                  </h2>
                  {data?.collection?.associated_documents &&
                    data.collection.associated_documents.length > 0 && (
                      <div className="mt-1 flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 lg:text-sm">
                        <span className="flex items-center space-x-1">
                          <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>
                            {data.collection.associated_documents.length}{" "}
                            document
                            {data.collection.associated_documents.length !== 1
                              ? "s"
                              : ""}
                          </span>
                        </span>
                        {data?.collection?.templates &&
                          data.collection.templates.length > 0 && (
                            <span className="flex items-center space-x-1">
                              <File className="h-3 w-3 lg:h-4 lg:w-4" />
                              <span>
                                {data.collection.templates.length} template
                                {data.collection.templates.length !== 1
                                  ? "s"
                                  : ""}
                              </span>
                            </span>
                          )}
                      </div>
                    )}
                </div>
              </div>

              <div className="hidden flex-shrink-0 items-center space-x-2 sm:flex">
                <motion.button
                  whileHover={{
                    rotate: open ? 180 : 0
                  }}
                  onClick={() => setOpen(!open)}
                  className="flex-shrink-0 rounded-xl p-2 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${
                      open ? "rotate-180 transform" : ""
                    }`}
                  />
                </motion.button>
                {currentAccess?.buttons?.[0]?.permission?.is_shown && (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Edit Collection"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        currentAccess?.buttons?.[0]?.permission?.actions?.update
                      ) {
                        setUpdateCollection(true);
                      } else {
                        toast.warning(
                          "You do not have permission to edit this collection."
                        );
                      }
                    }}
                    className="flex items-center space-x-2 rounded-xl px-3 py-2 text-tertiary-600 transition-all duration-300 hover:bg-tertiary-50 dark:text-tertiary-400 dark:hover:bg-tertiary-500/10"
                  >
                    <Pencil className="h-4 w-4" />
                  </motion.button>
                )}

                {currentAccess?.buttons?.[1]?.permission?.is_shown && (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        currentAccess?.buttons?.[1]?.permission?.actions?.delete
                      ) {
                        deleteCollection();
                      } else {
                        toast.warning(
                          "You do not have permission to delete this collection."
                        );
                      }
                    }}
                    className="flex items-center space-x-2 rounded-xl px-3 py-2 text-red-600 transition-all duration-300 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    {deleteLoading ? (
                      <FaSpinner className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </motion.button>
                )}
                {open && currentAccess?.buttons?.[2]?.permission?.is_shown && (
                  <div className="w-fit">
                    <CustomButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenUpload(true);
                      }}
                      disabled={
                        !currentAccess?.buttons?.[2]?.permission?.actions
                          ?.create
                      }
                      className="!text-[0.8rem]"
                    >
                      Add Document
                    </CustomButton>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {documentsLoading ? (
                <div className="p-4">
                  <TableSkeleton />
                  {/* Templates Skeleton */}
                  <div className="mt-6 border-t border-slate-200/50 pt-6 dark:border-slate-700/50">
                    <div className="mb-3 flex items-center space-x-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-slate-300 dark:bg-slate-600"></div>
                      <div className="h-4 w-24 rounded bg-slate-300 dark:bg-slate-600"></div>
                    </div>
                    <TemplateSkeleton />
                  </div>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-red-600 dark:text-red-400">
                    Failed to load documents
                  </p>
                  <button
                    onClick={() => documentMutate()}
                    className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    Retry
                  </button>
                </div>
              ) : data?.collection?.associated_documents &&
                data.collection.associated_documents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 dark:border-slate-700 dark:from-slate-700/50 dark:to-slate-600/50">
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 lg:px-8">
                          Document Name
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 lg:px-8">
                          Version
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 lg:px-8">
                          Owner
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 lg:px-8">
                          Status
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 lg:px-8">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                      {data.collection.associated_documents.map(
                        (document: AssociatedDocument) => {
                          const fileIconConfig: FileIconConfig = getFileIcon(
                            document?.file_name?.split(".").pop()?.toLowerCase()
                          );
                          const FileIcon: LucideIcon = fileIconConfig.icon;

                          return (
                            <motion.tr
                              key={document?.document_id}
                              className="group transition-all duration-300 hover:bg-gradient-to-r hover:from-tertiary-50/30 hover:to-tertiary-50/30 dark:hover:from-tertiary-500/5 dark:hover:to-tertiary-500/5"
                            >
                              <td className="w-fit px-4 py-4 lg:px-8 lg:py-6">
                                <div className="flex items-center space-x-3 lg:space-x-4">
                                  <div
                                    className={`rounded-lg p-2 ${fileIconConfig?.bg} ${fileIconConfig?.border} flex-shrink-0 border`}
                                  >
                                    <FileIcon
                                      className={`h-4 w-4 lg:h-5 lg:w-5 ${fileIconConfig?.color}`}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-tertiary-600 dark:text-white dark:group-hover:text-tertiary-400">
                                      {document?.file_name}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                      Modified:{" "}
                                      {formatDate(document?.reviewed_at || "")}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 lg:px-8 lg:py-6">
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                  {document?.version}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 lg:px-8 lg:py-6">
                                <div className="flex items-center space-x-2">
                                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-tertiary-500 to-tertiary-500 lg:h-8 lg:w-8">
                                    <span className="text-xs font-bold text-white">
                                      {getOwnerInitials(
                                        document?.owner_name || ""
                                      )}
                                    </span>
                                  </div>
                                  <span className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                    {document?.owner_name}
                                  </span>
                                </div>
                              </td>
                              {/* Status Column - Shows all statuses with current one checked */}
                              <td className="whitespace-nowrap px-4 py-4 lg:px-8 lg:py-6">
                                <div className="space-y-1">
                                  {allStatuses.map((status) => {
                                    const statusConfig = getStatusConfig(
                                      status as AssociatedDocument["status"]
                                    );
                                    const StatusIcon = statusConfig.icon;
                                    const isCurrentStatus =
                                      document?.status === status;

                                    return (
                                      <div
                                        key={status}
                                        className={`relative flex items-center space-x-2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-all ${
                                          isCurrentStatus
                                            ? `${statusConfig.color} ring-1 ring-inset`
                                            : "text-slate-400 dark:text-slate-500"
                                        }`}
                                      >
                                        {isCurrentStatus ? (
                                          <Check className="h-3 w-3" />
                                        ) : (
                                          <div className="h-3 w-3" />
                                        )}
                                        <StatusIcon className="h-3 w-3" />
                                        <span className="capitalize">
                                          {status.replace("-", " ")}
                                        </span>
                                        {isCurrentStatus &&
                                          document?.status !== "approved" &&
                                          currentAccess?.buttons?.[2]
                                            ?.permission?.is_shown && (
                                            <button
                                              title="Update Document Status"
                                              className="inset-y-0 right-0 flex cursor-pointer items-center pr-2 2xl:absolute"
                                            >
                                              <Pencil
                                                onClick={() => {
                                                  if (
                                                    currentAccess?.buttons?.[2]
                                                      ?.permission?.actions
                                                      ?.update
                                                  ) {
                                                    setSelectedDocument(
                                                      document
                                                    );
                                                    setStatusDialogOpen(true);
                                                  } else {
                                                    toast.warning(
                                                      "You do not have permission to update this document."
                                                    );
                                                  }
                                                }}
                                                className="size-4"
                                              />
                                            </button>
                                          )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 lg:px-8 lg:py-6">
                                <div className="flex flex-col space-y-2">
                                  {actionButtons
                                    .filter((action) => {
                                      // Hide Delete button if status is approved
                                      if (
                                        action.title === "Delete" &&
                                        document.status === "approved"
                                      ) {
                                        return false;
                                      } else if (
                                        action.title === "Update" &&
                                        document.status === "approved"
                                      ) {
                                        return false;
                                      } else {
                                        return true;
                                      }
                                    })
                                    .map(
                                      (
                                        action: ActionButton,
                                        actionIndex: number
                                      ) => {
                                        const ActionIcon: LucideIcon =
                                          action.icon;
                                        const isDeleteAction =
                                          action.title === "Delete";
                                        const isLoading =
                                          isDeleteAction && deleteDocLoading;

                                        return (
                                          <motion.button
                                            key={actionIndex}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex items-center justify-center space-x-2 px-3 py-2 ${action.color} w-24 rounded-full text-sm font-medium shadow-sm transition-all duration-300 hover:shadow-md disabled:opacity-50`}
                                            title={
                                              action.title === "Delete"
                                                ? "Delete Document"
                                                : action.title === "Update"
                                                  ? "Update Document"
                                                  : action.title === "View"
                                                    ? "View Document"
                                                    : "View History"
                                            }
                                            disabled={isLoading}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleActionClick(
                                                action.title,
                                                document
                                              );
                                            }}
                                          >
                                            {isLoading &&
                                            deleteDocumentId ===
                                              document?.document_id ? (
                                              <FaSpinner className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <ActionIcon className="size-3.5" />
                                            )}
                                            <span className="text-xs">
                                              {action.title}
                                            </span>
                                          </motion.button>
                                        );
                                      }
                                    )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-white">
                    No Documents Found
                  </h3>
                  <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                    {"This collection doesn't have any documents yet."}
                  </p>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenUpload(true);
                    }}
                    className="inline-flex items-center space-x-2 rounded-xl bg-tertiary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-tertiary-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add First Document</span>
                  </motion.button>
                </div>
              )}
              {/* Enhanced Templates Section */}
              {data?.collection?.templates &&
                data?.collection?.templates?.length > 0 && (
                  <div className="border-t border-slate-200/50 bg-gradient-to-r from-tertiary-50/50 to-tertiary-50/50 px-4 py-6 dark:border-slate-700/50 dark:from-tertiary-500/5 dark:to-tertiary-500/5 lg:px-8 lg:py-8">
                    <div className="mb-6 flex items-center space-x-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-tertiary-500"></div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Template Documents ({data.collection.templates.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {data?.collection?.templates?.map(
                        (template: Template) => {
                          const templateIconConfig: FileIconConfig =
                            getFileIcon(
                              template?.doc_url?.split(".").pop()?.toLowerCase()
                            );
                          const TemplateIcon: LucideIcon =
                            templateIconConfig.icon;

                          return (
                            <motion.div
                              key={template?.template_id}
                              className="group rounded-xl border border-tertiary-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-tertiary-500/20 dark:bg-slate-800"
                            >
                              <div className="flex w-full items-center justify-between gap-3">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`rounded-lg p-2 ${templateIconConfig?.bg} ${templateIconConfig?.border} border`}
                                  >
                                    <TemplateIcon
                                      className={`h-5 w-5 ${templateIconConfig?.color}`}
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                      {template?.template_name}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      Template Document
                                    </p>
                                  </div>
                                </div>

                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTemplateView(template);
                                  }}
                                  className="flex w-fit items-center justify-end space-x-2 rounded-lg bg-tertiary-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-tertiary-700 focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View</span>
                                </motion.button>
                              </div>
                            </motion.div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default KnowledgeCard;
