"use client";
import useSwr from "@/shared/hooks/useSwr";
import { Drawer } from "@mui/material";
import {
  Download,
  Eye,
  FileIcon,
  FileText,
  Info,
  Shield,
  X
} from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import CustomButton from "@/shared/core/CustomButton";
import dynamic from "next/dynamic";
const PolicyStatusUpdate = dynamic(() => import("./PolicyStatusUpdate"), {
  ssr: false
});
const CustomFilePreview = dynamic(
  () => import("@/shared/common/CustomFilePreview"),
  {
    ssr: false
  }
);

interface AllAccess {
  is_shown: boolean;
  actions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}
// Helper component for detail items
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 dark:border-gray-700">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="text-base text-gray-800 dark:text-gray-300">
      {value || "N/A"}
    </p>
  </div>
);
const PolicyDetails = ({
  open,
  onClose,
  policyId,
  setPolicyId,
  isAccess,
  isUpdateDocumentStatus
}: {
  open: boolean;
  onClose: () => void;
  policyId: string;
  setPolicyId: Dispatch<SetStateAction<string>>;
  isAccess: AllAccess;
  isUpdateDocumentStatus: boolean;
}) => {
  const { data, isValidating, mutate } = useSwr(
    policyId ? `policy?doc_id=${policyId}` : null
  );
  const [statusOpen, setStatusOpen] = useState<boolean>(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const isLoading = isValidating || !data;
  const [openFile, setOpenFile] = useState<boolean>(false);
  const [fileData, setFileData] = useState<{ url: string; name: string }>();
  const handleDownload = (url: string, index: number) => {
    setDownloadingIndex(index);

    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        // Create blob link to download
        const fileUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", `policy-document-${index + 1}.pdf`);

        // Append to html
        document.body.appendChild(link);

        // Force download
        link.click();

        // Clean up and remove the link
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(fileUrl);
      })
      .finally(() => {
        // Reset downloading state
        setDownloadingIndex(null);
      });
  };
  return (
    <>
      <PolicyStatusUpdate
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        documentId={policyId}
        currentStatus={data?.status}
        documentName={data?.name}
        mutate={() => mutate()}
      />
      <Drawer
        anchor="right"
        open={open}
        onClose={() => {
          onClose();
          setPolicyId("");
        }}
      >
        <div className="relative flex h-dvh w-full max-w-3xl flex-col overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <CustomFilePreview
            fileUrl={fileData?.url as string}
            fileName={fileData?.name as string}
            isOpen={openFile}
            onClose={() => setOpenFile(false)}
          />
          <div className="sticky top-0 z-999 flex w-full items-center justify-between bg-gradient-to-r from-tertiary to-primary px-8 py-3 shadow-sm">
            <div className="flex items-center">
              <Shield className="mr-3 text-white" size={24} />
              {isLoading ? (
                <div className="h-8 w-48 animate-pulse rounded-md bg-white/20"></div>
              ) : (
                <h1 className="text-xl font-bold text-white">{data?.name}</h1>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/20 transition-all hover:bg-white/30"
              aria-label="Close"
            >
              <X className="text-white" size={20} />
            </button>
          </div>

          <div className="px-8 py-6">
            {/* Details Section */}
            <div className="mb-6 rounded-xl bg-white p-0 shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
              <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <Info className="mr-2 text-primary" size={18} />
                    <h2 className="font-satoshi text-lg font-semibold text-gray-900 dark:text-white">
                      Policy Details
                    </h2>
                  </div>
                  <div className="w-fit">
                    <CustomButton
                      onClick={() => setStatusOpen(true)}
                      className="!text-[0.7rem]"
                      disabled={!isUpdateDocumentStatus}
                    >
                      Update Status
                    </CustomButton>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  // Skeleton loading for details section
                  <>
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <span
                        key={item}
                        className="mb-4 flex w-full flex-col gap-2"
                      >
                        <div className="h-4 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-5 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-600"></div>
                      </span>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <DetailItem label="ID" value={data?.id} />
                    <DetailItem label="Name" value={data?.name} />
                    <DetailItem label="Description" value={data?.description} />
                    <DetailItem label="Categories" value={data?.category} />
                  </div>
                )}
              </div>
            </div>

            {/* Documents Section */}
            <div className="rounded-xl bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-800">
              <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center">
                  <FileText className="mr-2 text-primary" size={18} />
                  <h2 className="font-satoshi text-lg font-semibold text-gray-900 dark:text-white">
                    Policy Documents
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {isLoading ? (
                  // Skeleton loading for documents section
                  <div className="grid gap-6 md:grid-cols-2">
                    {[1, 2].map((item) => (
                      <div
                        key={item}
                        className="relative flex overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="flex w-24 items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <div className="h-12 w-12 animate-pulse rounded-md bg-gray-300 dark:bg-gray-600"></div>
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <div className="mb-2 h-5 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
                          <div className="mt-auto flex justify-end gap-2">
                            <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : data?.files?.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {data?.files?.map(
                      (item: { name: string; url: string }, index: number) => (
                        <div
                          key={index}
                          className="relative flex overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-indigo-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-900/40"
                        >
                          <div className="flex w-24 items-center justify-center bg-indigo-50 dark:bg-indigo-900/20">
                            <Image
                              alt="PDF Document"
                              src="/file/pdf.png"
                              width={40}
                              height={40}
                              className="drop-shadow-sm transition-all hover:scale-110"
                            />
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <h3 className="mb-2 text-base font-medium capitalize text-gray-900 dark:text-white">
                              {item?.name}
                            </h3>
                            <div className="mt-auto flex justify-end gap-2">
                              {isAccess?.is_shown && (
                                <button
                                  onClick={() => {
                                    if (isAccess?.actions?.read) {
                                      setFileData({
                                        url: item?.url,
                                        name: item?.name
                                      });
                                      setOpenFile(true);
                                    } else {
                                      toast.info(
                                        "You do not have permission to view this document."
                                      );
                                    }
                                  }}
                                  className="group flex items-center gap-1.5 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                                >
                                  <Eye
                                    size={16}
                                    className="transition-all group-hover:scale-110"
                                  />
                                  View
                                </button>
                              )}
                              {isAccess?.is_shown && (
                                <button
                                  onClick={() => {
                                    if (isAccess?.actions?.read) {
                                      handleDownload(item?.url, index);
                                    } else {
                                      toast.info(
                                        "You do not have permission to download this document."
                                      );
                                    }
                                  }}
                                  disabled={downloadingIndex === index}
                                  className="group flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                  {downloadingIndex === index ? (
                                    <>
                                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-gray-400 border-t-transparent"></span>
                                      <span className="ml-1">...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download
                                        size={16}
                                        className="transition-all group-hover:scale-110"
                                      />
                                      Download
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      <FileIcon className="text-gray-400" size={28} />
                    </div>
                    <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-gray-200">
                      No Documents Available
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Any policy documents will be displayed here when available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default PolicyDetails;
