"use client";
import useSwr from "@/shared/hooks/useSwr";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
interface CollectionItem {
  collection_id: string;
  collection_name: string;
}

const AttachedCollection = ({
  open,
  onClose,
  selectedCollections,
  setSelectedCollections,
  setSearchString
}: {
  open: boolean;
  onClose: () => void;
  selectedCollections: CollectionItem;
  setSelectedCollections: (collection: CollectionItem) => void;
  setSearchString: (searchString: string) => void;
}) => {
  const [collectionSearch, setCollectionSearch] = useState<string>("");
  const { data } = useSwr("knowledge/collections");
  const filteredCollections =
    data?.collections?.length > 0
      ? data?.collections?.filter((item: { collection_name: string }) =>
          item?.collection_name
            ?.toLowerCase()
            .includes(collectionSearch.toLowerCase())
        )
      : [];

  const handleSelectCollection = (item: CollectionItem) => {
    setSearchString("");
    setSelectedCollections(item);
    onClose();
    setCollectionSearch("");
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-2xl"
      }}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle className="border-b border-gray-200 dark:border-gray-700">
        <span className="font-satoshi font-medium text-gray-900 dark:text-white">
          Select Collection
        </span>
      </DialogTitle>
      <DialogContent
        style={{
          padding: "16px"
        }}
        className="bg-[#ffffff] dark:bg-gray-900"
      >
        <input
          type="text"
          placeholder="Search collections..."
          value={collectionSearch}
          onChange={(e) => setCollectionSearch(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-300"
        />
        <ul className="max-h-60 space-y-2 overflow-y-auto">
          {filteredCollections?.length > 0 ? (
            filteredCollections?.map((item: CollectionItem, index: number) => (
              <li key={item?.collection_id}>
                <button
                  onClick={() => handleSelectCollection(item)}
                  className={`flex w-full cursor-pointer items-center rounded-lg p-3 text-sm font-medium transition-all duration-200 ${
                    selectedCollections?.collection_id === item?.collection_id
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="flex-1 text-left">
                    {index + 1}. {item?.collection_name}
                  </span>
                  {selectedCollections?.collection_id ===
                    item?.collection_id && (
                    <span className="text-blue-500">✓</span>
                  )}
                </button>
              </li>
            ))
          ) : (
            <li className="p-3 text-sm text-gray-500 dark:text-gray-400">
              No collections found
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default AttachedCollection;
