"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useCurrentMenuItem } from "@/shared/utils";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
const AddNewSubProcessor = dynamic(() => import("./AddNewSubProcessor"), {
  ssr: false
});
const UpdateSubprocessor = dynamic(() => import("./UpdateSubprocessor"), {
  ssr: false
});
// Define types
export interface SubProcessor extends Record<string, unknown> {
  id: string;
  name: string;
  purpose: string;
  location: string;
  compliance_cert?: string;
  img: string;
  trust_center_url?: string;
}

const SubProcessors: React.FC = () => {
  const { mutation } = useMutation();
  const { data, isValidating, mutate } = useSwr("trust-center/sub-processors");
  const [searchTerm] = useState<string>("");
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false);
  const [editData, setEditdata] = useState<SubProcessor | null>(null);
  const currentAccess = useCurrentMenuItem();
  // Pagination for mobile view
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const filteredProcessors: SubProcessor[] =
    data?.sub_processor?.length > 0
      ? data?.sub_processor?.filter(
          (processor: {
            id: string;
            name: string;
            purpose: string;
            location: string;
            compliance_cert?: string;
            img: string;
          }) =>
            processor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            processor?.purpose
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            processor?.location
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
      : [];

  // Calculate pagination for mobile view
  const totalPages = Math.ceil(filteredProcessors.length / itemsPerPage);
  const paginatedProcessors = filteredProcessors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (id: string) => {
    try {
      Swal.fire({
        title: "Delete Sub-processor",
        text: "Are you sure you want to delete this sub-processor? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await mutation(`trust-center/sub-processors?id=${id}`, {
            method: "DELETE",
            isAlert: false
          });
          if (res?.status === 200) {
            toast.success("Sub-processor deleted successfully");
            mutate();
            // Reset to page 1 if current page is now empty
            if (
              currentPage > 1 &&
              filteredProcessors.length - 1 <= (currentPage - 1) * itemsPerPage
            ) {
              setCurrentPage(1);
            }
          } else {
            toast.error("Failed to delete sub-processor");
          }
        }
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const CustomToolbar = () => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:p-4">
      <div className="flex flex-col gap-1">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          Sub Processors
        </p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {
            "View third party service providers involved in processing your AI data supporting transparency and compliance."
          }
        </p>
      </div>
      {currentAccess?.buttons?.[0]?.permission?.is_shown && (
        <div className="w-fit">
          <CustomButton
            type="button"
            disabled={!currentAccess?.buttons?.[0]?.permission?.actions?.create}
            onClick={() => setIsAddFormOpen(true)}
            startIcon={<Plus className="mr-2 h-5 w-5" />}
            className="w-fit text-nowrap"
          >
            Add New Sub-processor
          </CustomButton>
        </div>
      )}
    </div>
  );

  // Mobile pagination controls
  const MobilePagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    return (
      <div className="mt-6 flex items-center justify-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            currentPage === 1
              ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
              : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          } border border-gray-200 dark:border-gray-700`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{currentPage}</span> / {totalPages}
        </div>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            currentPage === totalPages
              ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
              : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          } border border-gray-200 dark:border-gray-700`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // Card view for mobile screens
  const SubProcessorCard = ({ processor }: { processor: SubProcessor }) => (
    <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-neutral-800 dark:bg-darkSidebarBackground">
      {/* Card Header with Logo and Name */}
      <div className="border-b border-gray-100 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-darkSidebarBackground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white p-2 shadow-sm dark:bg-darkMainBackground">
              <Image
                src={processor?.img || ""}
                alt={`${processor.name} logo`}
                width={60}
                height={60}
                className="max-h-12 max-w-12 object-contain"
                priority={true}
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {processor?.name || "Not Provided"}
            </h3>
          </div>
        </div>
      </div>

      {/* Card Body with Details */}
      <div className="p-4">
        <div className="mb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Purpose
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {processor?.purpose || "Not Provided"}
          </p>
        </div>
        <div className="mb-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Location
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {processor?.location || "Not Provided"}
          </p>
        </div>
      </div>

      {/* Card Footer with Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-darkSidebarBackground">
        {currentAccess?.buttons?.[1]?.permission?.is_shown && (
          <button
            onClick={() => {
              if (currentAccess?.buttons?.[1]?.permission?.actions?.update) {
                setEditdata(processor);
                setIsEditFormOpen(true);
              } else {
                toast.error(
                  "You don't have permission to edit this sub-processor."
                );
              }
            }}
            className="flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <Pencil className="mr-1 h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
        {currentAccess?.buttons?.[2]?.permission?.is_shown && (
          <button
            onClick={() => {
              if (currentAccess?.buttons?.[2]?.permission?.actions?.delete) {
                handleDelete(processor.id);
              } else {
                toast.error(
                  "You don't have permission to delete this sub-processor."
                );
              }
            }}
            className="flex items-center justify-center rounded-lg bg-red-50 px-4 py-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-2 py-4">
      <AddNewSubProcessor
        open={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        mutate={mutate}
      />
      <UpdateSubprocessor
        open={isEditFormOpen}
        onClose={() => setIsEditFormOpen(false)}
        mutate={mutate}
        item={editData as SubProcessor}
      />

      {/* Desktop view - Table */}
      <div className="hidden sm:block">
        <CustomTable<SubProcessor>
          columns={[
            {
              field: "img",
              title: "Logo",
              sortable: false,
              filterable: false,
              render: (row: SubProcessor) => (
                <span className="flex items-center justify-center">
                  <Image
                    src={row?.img || ""}
                    alt={`${row.name} logo`}
                    width={60}
                    height={60}
                    className="object-contain"
                    priority={true}
                  />
                </span>
              )
            },
            {
              field: "name",
              title: "Name",
              sortable: true,
              filterable: true,
              render: (row: SubProcessor) => (
                <span className="flex w-fit items-center justify-center text-nowrap text-center font-medium">
                  {row?.name || "Not Provided"}
                </span>
              )
            },
            {
              field: "purpose",
              title: "Purpose",
              sortable: true,
              filterable: true,
              cellClassName: "w-[40rem] ",
              render: (row: SubProcessor) => (
                <span className="flex w-full items-center justify-start text-left">
                  {row?.purpose || "Not Provided"}
                </span>
              )
            },
            {
              field: "location",
              title: "Location",
              sortable: true,
              filterable: true,
              render: (row: SubProcessor) => (
                <div className="flex w-full items-center justify-center">
                  <span>{row?.location || "Not Provided"}</span>
                </div>
              )
            },
            {
              field: "view",
              title: "Actions",
              sortable: false,
              filterable: false,
              render: (row: SubProcessor) => (
                <div className="flex w-full items-center justify-center">
                  <div className="flex w-fit items-center gap-5">
                    {currentAccess?.buttons?.[1]?.permission?.is_shown && (
                      <Pencil
                        onClick={() => {
                          if (
                            currentAccess?.buttons?.[1]?.permission?.actions
                              ?.update
                          ) {
                            setEditdata(row);
                            setIsEditFormOpen(true);
                          } else {
                            toast.error(
                              "You don't have permission to edit this sub-processor."
                            );
                          }
                        }}
                        className="h-5 w-5 cursor-pointer text-blue-600"
                      />
                    )}
                    {currentAccess?.buttons?.[2]?.permission?.is_shown && (
                      <Trash2
                        onClick={() => {
                          if (
                            currentAccess?.buttons?.[2]?.permission?.actions
                              ?.delete
                          ) {
                            handleDelete(row.id);
                          } else {
                            toast.error(
                              "You don't have permission to delete this sub-processor."
                            );
                          }
                        }}
                        className="h-5 w-5 cursor-pointer text-red-600"
                      />
                    )}
                  </div>
                </div>
              )
            }
          ]}
          data={filteredProcessors?.length > 0 ? filteredProcessors : []}
          isLoading={isValidating}
          title=""
          selection={false}
          filtering={false}
          customToolbar={<CustomToolbar />}
          options={{
            toolbar: false,
            search: false,
            filtering: true,
            sorting: true,
            pagination: true // Make sure pagination is enabled for desktop
          }}
          className="flex-1"
        />
      </div>

      {/* Mobile view - Card list */}
      <div className="sm:hidden">
        <div className="mb-6 px-4">
          <CustomToolbar />
        </div>

        <div className="space-y-0">
          {isValidating ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          ) : filteredProcessors.length > 0 ? (
            <>
              {paginatedProcessors.map((processor) => (
                <SubProcessorCard key={processor.id} processor={processor} />
              ))}
              <MobilePagination />
            </>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-800/50">
              <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                No sub-processors found
              </p>
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="mt-2 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubProcessors;
