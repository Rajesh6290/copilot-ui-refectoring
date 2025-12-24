"use client";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
const IntegrationList = dynamic(() => import("./IntegrationList"), {
  ssr: false
});
const ConfigurationForm = dynamic(() => import("./ConfigurationForm"), {
  ssr: false
});

// Types
export interface FieldConfig {
  field_name: string;
  value: string;
}

export interface ServiceCredential {
  name: string;
  fields: FieldConfig[];
  configured: boolean;
  desc: string;
  img: string;
}
const SkeletonCard: React.FC = () => (
  <div className="overflow-hidden rounded-lg border-l-4 border-gray-200 bg-white shadow-sm dark:bg-gray-800">
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-start sm:mb-6">
        <div className="animate-pulse rounded-md border border-gray-100 bg-gray-100 p-2 dark:border-gray-700 dark:bg-gray-700 sm:p-3">
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-600 sm:h-10 sm:w-10"></div>
        </div>
        <div className="ml-3 min-w-0 flex-1 sm:ml-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-600 sm:h-6 sm:w-32"></div>
            <div className="h-4 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600 sm:h-5 sm:w-20"></div>
          </div>
        </div>
      </div>
      <div className="mb-4 space-y-2 sm:mb-6">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
      </div>
    </div>
  </div>
);

const SkeletonLoader: React.FC = () => (
  <div className="min-h-fit">
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-8 sm:mb-12">
        <div className="mb-2 flex items-center">
          <div className="mr-3 h-4 w-1 animate-pulse rounded-full bg-gray-200 dark:bg-gray-600 sm:h-6 sm:w-1.5"></div>
          <div className="h-6 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-600 sm:h-8 sm:w-48"></div>
        </div>
        <div className="ml-4 h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-600 sm:ml-6 sm:w-96"></div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  </div>
);
const SystemConnection: React.FC = () => {
  const { data, mutate, isValidating } = useSwr("get_config");
  const [view, setView] = useState<"list" | "detail">("list");
  const [activeService, setActiveService] = useState<ServiceCredential | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const { isLoading, mutation } = useMutation();

  // Initialize from URL params on mount
  useEffect(() => {
    if (typeof window === "undefined" || !data?.data?.credential) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get("service");

    if (serviceParam) {
      // Find the service from data
      const service = data?.data?.credential?.find(
        (s: ServiceCredential) =>
          s?.name?.toLowerCase() === serviceParam.toLowerCase()
      );

      if (service) {
        setActiveService(service);
        setView("detail");
      } else {
        // Service not found, reset to list
        setView("list");
        setActiveService(null);
        window.history.replaceState({}, "", window.location.pathname);
      }
    } else {
      setView("list");
      setActiveService(null);
    }
  }, [data]);

  // Update URL when view changes
  const updateURL = (serviceName: string | null) => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (serviceName) {
      params.set("service", serviceName.toLowerCase());
    } else {
      params.delete("service");
    }
    const paramString = params.toString();
    window.history.pushState(
      {},
      "",
      paramString
        ? `${window.location.pathname}?${paramString}`
        : window.location.pathname
    );
  };

  const handleCardClick = (service: ServiceCredential) => {
    setActiveService(service);
    setView("detail");
    updateURL(service.name);
  };

  const handleBackToList = () => {
    setView("list");
    setActiveService(null);
    updateURL(null);
  };

  const handleDelete = (serviceName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowDeleteConfirm(serviceName);
  };

  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm) {
      return;
    }

    try {
      let endpoint = `delete_config?platform=${showDeleteConfirm}`;
      if (data?.data?._id) {
        endpoint += `&doc_id=${data.data._id}`;
      }

      const res = await mutation(endpoint, {
        method: "DELETE",
        isAlert: false
      });
      if (res?.status === 200) {
        toast.success("Integration deleted!");
        await mutate();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const handleSubmit = async (values: Record<string, string>) => {
    if (!activeService) {
      return;
    }
    const isEditMode = activeService.configured;

    try {
      const formattedValues = { [activeService.name]: values };
      const method = isEditMode ? "PUT" : "POST";
      let endpoint = `${isEditMode ? "update_config" : "add_config"}?platform=${activeService.name}`;
      if (isEditMode && data?.data?._id) {
        endpoint += `&doc_id=${data.data._id}`;
      }

      const res = await mutation(endpoint, {
        method,
        isAlert: false,
        body: { credential: formattedValues }
      });

      if (res?.status === 200) {
        toast.success(
          isEditMode ? "Integration updated!" : "Integration configured!"
        );

        // Refresh data from server
        const refreshedData = await mutate();

        // Find updated service from refreshed data
        if (refreshedData?.data?.credential) {
          const updatedService = refreshedData.data.credential.find(
            (s: ServiceCredential) => s.name === activeService.name
          );

          if (updatedService) {
            // Update active service with fresh data from server
            setActiveService(updatedService);
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  if (isValidating) {
    return <SkeletonLoader />;
  }

  return (
    <AnimatePresence mode="wait">
      {view === "list" && (
        <IntegrationList
          services={data?.data?.credential || []}
          onCardClick={handleCardClick}
          onDelete={handleDelete}
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
          isLoading={isLoading}
          handleDeleteConfirm={handleDeleteConfirm}
        />
      )}

      {view === "detail" && activeService && (
        <ConfigurationForm
          service={activeService}
          onSubmit={handleSubmit}
          onBack={handleBackToList}
          isEditMode={activeService.configured}
          isLoading={isLoading}
        />
      )}
    </AnimatePresence>
  );
};

export default SystemConnection;
