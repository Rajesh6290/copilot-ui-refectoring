"use client";
import useMutation from "@/shared/hooks/useMutation";
import { Dialog } from "@mui/material";
import { Form, Formik } from "formik";
import { FaSpinner } from "react-icons/fa6";
import { FiCheck, FiX } from "react-icons/fi";
import { toast } from "sonner";

import { Collection } from "./Knowledge";
import { NewKnowledgeValidationSchema } from "../../schema/knowledge.schema";

interface CollectionDialogProps {
  open: boolean;
  close: () => void;
  mutate: () => void;
  collection?: Collection | null;
}

const AddNewKnowledge = ({
  open,
  close,
  mutate,
  collection = null
}: CollectionDialogProps) => {
  const { isLoading, mutation } = useMutation();

  const isUpdateMode = Boolean(collection);

  const handleSubmits = async (values: { collectionName: string }) => {
    try {
      let res;

      if (isUpdateMode) {
        // Update existing collection
        res = await mutation(
          `knowledge/collection?collection_id=${collection!.collection_id}`,
          {
            method: "PUT",
            isAlert: false,
            body: {
              collection_name: values.collectionName
            }
          }
        );
      } else {
        // Create new collection
        res = await mutation("knowledge/collection", {
          method: "POST",
          isAlert: false,
          body: {
            collection_name: values.collectionName
          }
        });
      }

      if (res?.status === 201 || res?.status === 200) {
        toast.success(
          isUpdateMode
            ? "Collection updated successfully"
            : "Collection created successfully"
        );
        mutate();
        close();
      } else {
        toast.error(
          isUpdateMode
            ? "Failed to update collection"
            : "Failed to create collection"
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Dialog open={open} maxWidth="md" onClose={close}>
      <div className="min-w-96 rounded-lg bg-white dark:bg-gray-800">
        {/* Dialog Title */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            {isUpdateMode ? "Update Collection" : "Create New Collection"}
          </h2>
        </div>

        <Formik
          initialValues={{
            collectionName: collection?.collection_name || ""
          }}
          validationSchema={NewKnowledgeValidationSchema}
          onSubmit={handleSubmits}
          enableReinitialize={true}
        >
          {({
            errors,
            touched,
            handleSubmit,
            values,
            handleChange,
            handleBlur
          }) => (
            <Form onSubmit={handleSubmit}>
              {/* Dialog Content */}
              <div className="space-y-4 px-6 py-4">
                <div>
                  <label
                    htmlFor="collectionName"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Collection Name
                  </label>
                  <input
                    id="collectionName"
                    name="collectionName"
                    type="text"
                    value={values.collectionName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-tertiary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                      touched.collectionName && errors.collectionName
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter collection name"
                  />
                  {touched.collectionName &&
                    errors.collectionName &&
                    typeof errors.collectionName === "string" && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.collectionName}
                      </p>
                    )}
                </div>
              </div>

              {/* Dialog Actions */}
              <div className="flex justify-end space-x-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <FiX className="mr-2 h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center rounded-md border border-transparent bg-tertiary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-tertiary-700 focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-tertiary-700 dark:hover:bg-tertiary-800"
                >
                  {isLoading ? (
                    <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FiCheck className="mr-2 h-4 w-4" />
                  )}
                  {isLoading
                    ? isUpdateMode
                      ? "Updating..."
                      : "Creating..."
                    : isUpdateMode
                      ? "Update"
                      : "Create"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Dialog>
  );
};

export default AddNewKnowledge;
