import { ErrorMessage, Field, Form, Formik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Edit2,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import FAQValidationSchema from "../../schema/faq.schema";

// Define types
interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface NewFAQ {
  question: string;
  answer: string;
}

// Validation schemas

export interface FAQIsAccess {
  button_name: string;
  metadata: {
    reference: string;
    resource_type: string;
    route: string;
    label: string;
  };
  permission: {
    is_shown: boolean;
    permission_set: string;
    actions: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
  buttons: {
    button_name: string;
    metadata: {
      reference: string;
      resource_type: string;
      route: string;
      label: string;
    };
    permission: {
      is_shown: boolean;
      permission_set: string;
      actions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
    };
  }[];
}
const FAQsSkeleton = () => {
  return (
    <div className="mx-auto w-full animate-pulse px-2 py-3 sm:w-4/5 sm:px-6 sm:py-12 lg:px-8">
      {/* Header Skeleton */}
      <div className="mb-16 text-center">
        <div className="mx-auto mb-4 h-10 w-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="mx-auto h-4 w-full max-w-3xl rounded-md bg-gray-200 dark:bg-gray-700"></div>
        <div className="mx-auto mt-2 h-4 w-3/4 max-w-3xl rounded-md bg-gray-200 dark:bg-gray-700"></div>

        {/* Search Bar Skeleton */}
        <div className="mx-auto mt-10 max-w-xl">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-300 dark:text-gray-600" />
            </div>
            <div className="block h-14 w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 shadow-lg dark:bg-darkSidebarBackground"></div>
          </div>
        </div>
      </div>

      {/* Control Bar Skeleton */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <div className="h-6 w-32 rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="h-10 w-36 rounded-md bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* FAQ Items Skeleton */}
      <div className="w-full space-y-4">
        {Array(5)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className="w-full overflow-hidden rounded-2xl bg-white shadow-md dark:bg-darkSidebarBackground"
            >
              <div className="flex items-center justify-between px-6 py-5">
                <div className="h-6 w-3/4 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
// Main FAQs Component
const FAQs = ({ isAccess }: { isAccess: FAQIsAccess }) => {
  const { isLoading, mutation } = useMutation();
  const { data, isValidating, mutate } = useSwr("trust-center/faqs");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const filteredFaqs: FAQ[] =
    data?.faqs?.length > 0
      ? data?.faqs?.filter(
          (faq: { question: string; answer: string }) =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const handleEdit = (faqId: string): void => {
    setEditingFaqId(faqId);
    setActiveAccordion(null);
  };

  const handleSaveEdit = async (
    values: NewFAQ,
    faqId: string
  ): Promise<void> => {
    try {
      const res = await mutation(`trust-center/faqs?id=${faqId}`, {
        method: "PUT",
        isAlert: false,
        body: values
      });
      if (res?.status === 200) {
        toast.success("FAQ updated successfully");
        mutate();
        setEditingFaqId(null);
      }
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };

  const handleDelete = (id: string) => {
    try {
      Swal.fire({
        title: "Delete this question",
        text: "Are you sure you want to delete ? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await mutation(`trust-center/faqs?id=${id}`, {
            method: "DELETE",
            isAlert: false
          });
          if (res?.status === 200) {
            toast.success("Question deleted successfully");
            mutate();
          }
        }
      });
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };

  const handleAddNew = async (
    values: NewFAQ,
    { resetForm }: { resetForm: () => void }
  ) => {
    try {
      const res = await mutation("trust-center/faqs", {
        method: "POST",
        isAlert: false,
        body: values
      });
      if (res?.status === 201) {
        toast.success("FAQ added successfully");
        mutate();
        setIsAddingNew(false);
        resetForm();
      }
    } catch (error) {
      toast.error(error instanceof Error);
    }
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="mx-auto w-full px-2 py-2 sm:w-4/5 sm:px-6 sm:py-12 lg:px-8">
      {isValidating ? (
        <FAQsSkeleton />
      ) : (
        <>
          {/* Premium Header */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-2xl font-bold tracking-tight text-[#1e293b] dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto w-full text-sm text-[#64748b] dark:text-gray-400 sm:max-w-3xl sm:text-lg">
              {
                "Create and manage your AI platform's security, privacy, and compliance FAQs"
              }
            </p>

            {/* Premium Search Bar */}
            <div className="mx-auto mt-10 max-w-xl">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-[#94a3b8]" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-xl border-0 bg-white py-4 pl-12 pr-4 text-[#475569] shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6366f1] dark:bg-darkSidebarBackground dark:text-white"
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-5 w-5 text-[#94a3b8] hover:text-[#475569]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#334155] dark:text-white sm:text-xl">
                {searchTerm
                  ? `Search Results ${filteredFaqs?.length > 0 ? `(${filteredFaqs?.length})` : ""}`
                  : "All Questions"}
              </h2>
              {searchTerm && filteredFaqs.length > 0 && (
                <p className="mt-1 text-sm text-[#64748b] dark:text-white">
                  {` Showing results for "${searchTerm}"`}
                </p>
              )}
            </div>
            {isAccess?.buttons?.[0]?.permission?.is_shown && (
              <CustomButton
                type="button"
                onClick={() => setIsAddingNew(true)}
                disabled={!isAccess?.buttons?.[0]?.permission?.actions?.create}
                startIcon={<Plus className="mr-2 h-5 w-5" />}
              >
                Add New Question
              </CustomButton>
            )}
          </div>

          {/* Empty State */}
          {filteredFaqs?.length === 0 && !isValidating && (
            <div className="mx-auto w-full rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-darkSidebarBackground">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eff6ff]">
                <AlertCircle className="h-8 w-8 text-[#3b82f6]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-[#1e293b]">
                {searchTerm
                  ? "No matching questions found"
                  : "No questions available"}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-[#64748b]">
                {searchTerm
                  ? `We couldn't find any FAQs matching "${searchTerm}". Try different keywords or add a new question.`
                  : "Get started by adding your first question and answer using the button above."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center rounded-lg bg-[#eff6ff] px-4 py-2 text-[#3b82f6] transition-colors duration-200 hover:bg-[#dbeafe]"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Add New FAQ Form with Formik */}
          <Dialog
            open={isAddingNew}
            maxWidth="md"
            fullWidth
            PaperProps={{
              className: "bg-white dark:bg-gray-900 rounded-lg"
            }}
          >
            <DialogTitle className="border-b border-gray-200 dark:border-neutral-700 dark:bg-darkSidebarBackground">
              <span className="text-gray-900 dark:text-white">
                Add New Question
              </span>
            </DialogTitle>
            <Formik
              initialValues={{ question: "", answer: "" }}
              validationSchema={FAQValidationSchema}
              onSubmit={handleAddNew}
            >
              {({ isSubmitting, resetForm }) => (
                <Form>
                  <div className="space-y-4 p-6 dark:bg-darkSidebarBackground">
                    <div>
                      <label
                        htmlFor="question"
                        className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                      >
                        Question
                      </label>
                      <Field
                        type="text"
                        id="question"
                        name="question"
                        className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-700 dark:text-white"
                        placeholder="Enter the question..."
                      />
                      <ErrorMessage
                        name="question"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="answer"
                        className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                      >
                        Answer
                      </label>
                      <Field
                        as="textarea"
                        id="answer"
                        name="answer"
                        rows={5}
                        className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 outline-none transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] dark:border-neutral-700 dark:text-white"
                        placeholder="Enter the answer..."
                      />
                      <ErrorMessage
                        name="answer"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                  </div>
                  <DialogActions className="border-t border-gray-200 p-4 dark:border-neutral-700 dark:bg-darkSidebarBackground">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsAddingNew(false);
                      }}
                      className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <div className="w-fit">
                      <CustomButton
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        loading={isLoading}
                        startIcon={<Check className="h-4 w-4" />}
                        loadingText="Saving..."
                      >
                        Save Question
                      </CustomButton>
                    </div>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </Dialog>

          {/* FAQ Accordion List */}
          <motion.div
            className="w-full space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredFaqs?.map((faq) => (
              <motion.div
                key={faq?.id}
                className="w-full overflow-hidden rounded-2xl bg-white shadow-md dark:bg-darkSidebarBackground"
                variants={itemVariants}
              >
                {editingFaqId === faq?.id ? (
                  // Edit Form with Formik
                  <div className="border-l-4 border-[#4f46e5] p-6">
                    <h3 className="mb-4 text-lg font-semibold text-[#1e293b] dark:text-white">
                      Edit Question
                    </h3>
                    <Formik
                      initialValues={{
                        question: faq?.question,
                        answer: faq?.answer
                      }}
                      validationSchema={FAQValidationSchema}
                      onSubmit={(values) => handleSaveEdit(values, faq?.id)}
                    >
                      {({ isSubmitting }) => (
                        <Form className="space-y-4">
                          <div>
                            <label
                              htmlFor={`edit-question-${faq?.id}`}
                              className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                            >
                              Question
                            </label>
                            <Field
                              type="text"
                              id={`edit-question-${faq?.id}`}
                              name="question"
                              className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]"
                            />
                            <ErrorMessage
                              name="question"
                              component="div"
                              className="mt-1 text-sm text-red-500"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`edit-answer-${faq?.id}`}
                              className="mb-1 block text-sm font-medium text-[#475569] dark:text-white"
                            >
                              Answer
                            </label>
                            <Field
                              as="textarea"
                              id={`edit-answer-${faq?.id}`}
                              name="answer"
                              rows={4}
                              className="w-full rounded-xl border border-[#e2e8f0] px-4 py-3 transition-colors duration-200 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]"
                            />
                            <ErrorMessage
                              name="answer"
                              component="div"
                              className="mt-1 text-sm text-red-500"
                            />
                          </div>
                          <div className="flex justify-end space-x-3 pt-2">
                            <button
                              type="button"
                              className="rounded-lg border border-[#e2e8f0] px-4 py-2 text-[#64748b] transition-colors duration-200 hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:ring-offset-2 dark:border-neutral-600 dark:text-white dark:hover:bg-darkMainBackground"
                              onClick={() => setEditingFaqId(null)}
                            >
                              Cancel
                            </button>
                            <CustomButton
                              type="submit"
                              disabled={isSubmitting || isLoading}
                              loading={isLoading}
                              startIcon={<Check className="h-4 w-4" />}
                              loadingText="updating..."
                            >
                              Save Changes
                            </CustomButton>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                ) : (
                  <>
                    <button
                      className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                      onClick={() => toggleAccordion(faq.id)}
                    >
                      <span className="pr-6 text-lg font-medium text-[#1e293b] dark:text-white">
                        {faq.question}
                      </span>
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${activeAccordion === faq?.id ? "bg-tertiary text-white" : "bg-[#f1f5f9] text-[#64748b]"} transition-colors duration-200`}
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-200 ${activeAccordion === faq?.id ? "rotate-180 transform" : ""}`}
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {activeAccordion === faq?.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full overflow-hidden"
                        >
                          <div className="border-t border-[#f1f5f9] px-6 pb-6 dark:border-neutral-600">
                            <div className="pt-4">
                              <p className="text-wrap leading-relaxed text-[#475569] dark:text-white">
                                {faq?.answer}
                              </p>
                              <div className="mt-6 flex justify-end space-x-3">
                                {isAccess?.buttons?.[1]?.permission
                                  ?.is_shown && (
                                  <button
                                    type="button"
                                    className="inline-flex items-center rounded-lg bg-[#eef2ff] px-3 py-1.5 text-sm text-[#4f46e5] transition-colors duration-200 hover:bg-[#e0e7ff]"
                                    onClick={() => {
                                      if (
                                        isAccess?.buttons?.[1]?.permission
                                          ?.actions?.update
                                      ) {
                                        handleEdit(faq?.id);
                                      } else {
                                        toast.error(
                                          "You do not have permission to edit this FAQ."
                                        );
                                      }
                                    }}
                                  >
                                    <Edit2 className="mr-1.5 h-4 w-4" />
                                    Edit
                                  </button>
                                )}
                                {isAccess?.buttons?.[2]?.permission
                                  ?.is_shown && (
                                  <button
                                    type="button"
                                    className="inline-flex items-center rounded-lg bg-[#fef2f2] px-3 py-1.5 text-sm text-[#ef4444] transition-colors duration-200 hover:bg-[#fee2e2]"
                                    onClick={() => {
                                      if (
                                        isAccess?.buttons?.[2]?.permission
                                          ?.actions?.delete
                                      ) {
                                        handleDelete(faq?.id);
                                      } else {
                                        toast.error(
                                          "You do not have permission to delete this FAQ."
                                        );
                                      }
                                    }}
                                  >
                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default FAQs;
