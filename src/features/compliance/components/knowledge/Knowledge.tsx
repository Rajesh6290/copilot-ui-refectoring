"use client";
import CustomButton from "@/shared/core/CustomButton";
import Empty from "@/shared/core/Empty";
import useSwr from "@/shared/hooks/useSwr";
import { useCurrentMenuItem } from "@/shared/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Folder, Menu, Plus, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CurrentAccess } from "./KnowledgeCard";
const KnowledgeCard = dynamic(() => import("./KnowledgeCard"), {
  ssr: false
});
const AddNewKnowledge = dynamic(() => import("./AddNewKnowledge"), {
  ssr: false
});
export interface Collection {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  tenant_id: string;
  client_id: string;
  user_id: string;
  collection_id: string;
  collection_name: string;
  created_at: string;
  updated_at: string;
}

const Knowledge: React.FC = () => {
  const parma = useSearchParams().get("name");
  const { data, mutate, isValidating, error } = useSwr("knowledge/collections");
  const [filterData, setFilterData] = useState<Collection[]>([]);
  const [searchTerm] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const useCurrentAccess = useCurrentMenuItem();
  const [open, setOpen] = useState<boolean>(false);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Safe access to collections count
  const collectionsCount = data?.collections?.length ?? 0;
  useEffect(() => {
    if (parma) {
      const filtered = data?.collections?.filter((collection: Collection) =>
        collection.collection_name.toLowerCase().includes(parma.toLowerCase())
      );
      setFilterData(filtered || []);
    } else {
      setFilterData(data?.collections || []);
    }
  }, [parma, data]);

  // Loading skeleton component
  const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/70"
        >
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-slate-300 dark:bg-slate-600"></div>
            <div className="flex-1">
              <div className="h-4 w-3/4 rounded bg-slate-300 dark:bg-slate-600"></div>
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-300 dark:bg-slate-600"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error component
  const ErrorMessage: React.FC<{ err: unknown }> = ({ err }) => (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
      <p className="text-red-600 dark:text-red-400">
        Error loading collections:{" "}
        {err instanceof Error ? err.message : "Something went wrong"}
      </p>
      <button
        onClick={() => mutate()}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );

  // Empty state component
  const EmptyState: React.FC = () => (
    <div className="flex h-[calc(100dvh-250px)] w-full items-center justify-center">
      <Empty
        title="No Collections Found"
        subTitle={
          searchTerm
            ? `No collections match "${searchTerm}"`
            : "Create your first collection to get started"
        }
        pathName={!searchTerm ? "Create Collection" : ""}
        onClick={() => setOpen(true)}
        link={
          !searchTerm && useCurrentAccess?.permission?.actions?.create
            ? "#"
            : ""
        }
      />
    </div>
  );

  // Handle loading state first
  if (isValidating && !data) {
    return (
      <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <LoadingSkeleton />
      </div>
    );
  }

  // Handle error state
  if (error && !data) {
    return (
      <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <ErrorMessage err={error} />
      </div>
    );
  }

  return (
    <>
      <AddNewKnowledge
        open={open}
        close={() => setOpen(!open)}
        mutate={mutate}
      />

      <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        {/* Mobile Header */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="rounded-xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 p-2 shadow-lg">
                <Folder className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                <span className="text-xs font-bold text-white">
                  {collectionsCount}
                </span>
              </div>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:to-gray-300">
                Document Management
              </h1>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-white/20 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Desktop Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 hidden items-center justify-between lg:flex"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="rounded-xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 p-3 shadow-lg">
                <Folder className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
                <span className="text-xs font-bold text-white">
                  {collectionsCount}
                </span>
              </div>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-gray-300">
                Document Management
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Manage your documents and collections
              </p>
            </div>
          </div>

          {useCurrentAccess?.buttons?.[0]?.permission?.is_shown && (
            <div className="flex items-center space-x-3">
              <CustomButton
                onClick={() => setOpen(true)}
                startIcon={<Plus className="h-4 w-4" />}
                disabled={
                  isValidating ||
                  !useCurrentAccess?.buttons?.[0]?.permission?.actions?.create
                }
              >
                Create Collection
              </CustomButton>
            </div>
          )}
        </motion.div>

        {/* Mobile Action Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/70 lg:hidden"
            >
              <div className="space-y-3 p-4">
                <button
                  onClick={() => setOpen(true)}
                  disabled={isValidating}
                  className="flex w-full items-center space-x-2 rounded-xl bg-gradient-to-r from-tertiary-600 to-tertiary-700 px-4 py-3 text-white shadow-lg disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Collection</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collections Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Show loading skeleton only when validating and no existing data */}
          {isValidating && !data ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorMessage err={error} />
          ) : filterData?.length > 0 ? (
            filterData?.map((collection: Collection) => (
              <KnowledgeCard
                key={collection._id}
                collection={collection}
                mutate={mutate}
                currentAccess={useCurrentAccess as CurrentAccess}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Knowledge;
