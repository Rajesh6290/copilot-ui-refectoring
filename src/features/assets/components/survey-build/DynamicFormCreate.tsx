"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import SaveIcon from "@mui/icons-material/Save";
import { Button, CircularProgress } from "@mui/material";
import { useFormik } from "formik";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Edit,
  Edit as EditIcon,
  GripVertical,
  Plus,
  Rocket,
  Trash2,
  X
} from "lucide-react";
import { useParams } from "next/navigation";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { toast } from "sonner";
import { BasicDetailsSchema, QuestionSchema } from "../../schema/survey.schema";

// Enum for SubjectType and StakeholderRole
const SubjectType = {
  application: "application",
  vendor: "vendor",
  process: "process",
  organization: "organization",
  system: "system"
};

const StakeholderRole = {
  data_scientist: "data_scientist",
  business_teams: "business_teams",
  vendor_management: "vendor_management"
};

// Validation schemas

// Animation variants
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

const dragVariants = {
  initial: { scale: 1 },
  drag: {
    scale: 1.02,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    transition: { duration: 0.2 }
  }
};

// Types
type FieldType =
  | "text"
  | "email"
  | "phone"
  | "select"
  | "number"
  | "textarea"
  | "date"
  | "checkbox"
  | "radio"
  | "file"
  | "multipleselect";

interface Option {
  id: string;
  value: string;
  option_value?: string;
  option_id?: string;
}

interface FormField {
  id: string;
  label: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: Option[];
}

interface Category {
  id: string;
  name: string;
  questions: FormField[];
  isExpanded?: boolean;
}

// API Response Types
interface ApiQuestion {
  question_id?: string;
  question_text: string;
  question_type: string;
  question_required: boolean;
  options?: ApiOption[];
  expected_answer?: unknown[];
  question_response?: unknown[];
}

interface ApiOption {
  option_id?: string;
  option_value: string;
}

interface ApiSection {
  section_id?: string;
  section_title: string;
  questions: ApiQuestion[];
}

// Function to generate unique IDs
const generateUniqueId = (length = 8) => {
  const characters = "0123456789"; // Digits only
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result.toUpperCase();
};

const DynamicFormCreate = ({
  setSurveyName,
  setSurveyStatus
}: {
  setTab: Dispatch<SetStateAction<string>>;
  setSurveyName: Dispatch<SetStateAction<{ survey_name?: string }>>;
  setSurveyStatus: Dispatch<SetStateAction<string>>;
}) => {
  const param = useParams();
  const { data, mutate } = useSwr(`survey?doc_id=${param["id"]}`);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedField, setSelectedField] = useState<{
    categoryId: string;
    field: FormField;
  } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [newOption, setNewOption] = useState("");
  const [isBasicDetailsExpanded, setIsBasicDetailsExpanded] = useState(false);
  const { isLoading, mutation } = useMutation();
  const { isLoading: publishLoading, mutation: publishMutation } =
    useMutation();
  const { isLoading: updateDetailsLoading, mutation: updateMutation } =
    useMutation();

  // Memoized initial data mapping
  const mappedCategories = useMemo(() => {
    if (data?.sections) {
      return data.sections.map((section: ApiSection) => ({
        id: `SEC-${generateUniqueId()}`, // Generate unique section ID
        name: section.section_title,
        questions: section.questions.map((question: ApiQuestion) => ({
          id: `QUES-${generateUniqueId()}`, // Generate unique question ID
          label: question.question_text,
          name: question.question_text,
          type: question.question_type as FieldType,
          required: question.question_required,
          options: question.options?.map((option: ApiOption) => ({
            id: `OPTN-${generateUniqueId()}`, // Generate unique option ID
            value: option.option_value
          }))
        })),
        isExpanded: true
      }));
    }
    return [];
  }, [data?.sections]);

  // Initialize categories from fetched data
  useEffect(() => {
    if (mappedCategories.length && !categories.length) {
      setCategories(mappedCategories);
    }
  }, [mappedCategories, categories.length]);
  useEffect(() => {
    if (data?.survey_name && data?.survey_status) {
      setSurveyName(data ?? "");
      setSurveyStatus(data?.survey_status ?? "");
    } else {
      setSurveyName({});
      setSurveyStatus("");
    }
  }, [
    data?.survey_name,
    data?.survey_status,
    setSurveyName,
    setSurveyStatus,
    data
  ]);

  // Field management functions - defined before formik
  const updateField = useCallback(
    (categoryId: string, updatedField: FormField) => {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                questions: category.questions.map((field) =>
                  field.id === updatedField.id ? updatedField : field
                )
              }
            : category
        )
      );
    },
    []
  );

  // Formik setup for questions
  const formik = useFormik({
    initialValues: selectedField?.field || {
      label: "",
      type: "text",
      required: false,
      options: []
    },
    validationSchema: QuestionSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (selectedField) {
        const updatedField: FormField = {
          ...selectedField.field,
          ...values,
          name: values.label.toLowerCase().replace(/\s+/g, "_"),
          type: values.type as FieldType
        };
        updateField(selectedField.categoryId, updatedField);
        toast.success("Question updated");
        setSelectedField(null);
        formik.resetForm();
      }
    }
  });

  // Formik setup for basic details
  const basicDetailsFormik = useFormik({
    initialValues: {
      surveyName: data?.title ?? "",
      surveyDescription: data?.description ?? "",
      categoryName: data?.category_name ?? "",
      categoryDescription: data?.category_description ?? "",
      domain: data?.domain ?? "",
      subjectType: data?.subject_type ?? "",
      stakeholder: data?.stakeholder_role ?? ""
    },
    validationSchema: BasicDetailsSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const res = await updateMutation(`survey?doc_id=${param["id"]}`, {
          method: "PUT",
          isAlert: false,
          body: {
            survey_id: param["id"],
            subject_type: values?.subjectType,
            stakeholder_role: values?.stakeholder,
            title: values?.surveyName,
            description: values?.surveyDescription,
            category_name: values?.categoryName,
            category_description: values?.categoryDescription,
            domain: values?.domain
          }
        });

        if (res?.status === 200) {
          mutate();
          toast.success("Survey Details Updated successfully");
        } else {
          toast.error("Failed to save form");
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred while saving"
        );
      }
    }
  });

  // Create default field with validation
  const createDefaultField = (): FormField => ({
    id: `QUES-${generateUniqueId()}`, // Generate unique question ID
    label: "",
    name: "new_question",
    type: "text",
    required: false,
    options: []
  });

  // Category management
  const addCategory = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (newCategoryName.trim()) {
        const newCategory: Category = {
          id: `SEC-${generateUniqueId()}`, // Generate unique section ID
          name: newCategoryName.trim(),
          questions: [],
          isExpanded: true
        };
        setCategories((prev) => [...prev, newCategory]);
        setNewCategoryName("");
        toast.success("Section added");
      }
    },
    [newCategoryName]
  );

  // Field management
  const resetForm = useCallback(() => formik.resetForm(), [formik]);

  const addField = useCallback(
    (categoryId: string) => {
      const newField = createDefaultField();
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? { ...category, questions: [...category.questions, newField] }
            : category
        )
      );
      setSelectedField({ categoryId, field: newField });
      resetForm();
    },
    [resetForm]
  );

  const deleteField = useCallback((categoryId: string, fieldId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              questions: category.questions.filter((f) => f.id !== fieldId)
            }
          : category
      )
    );
    setSelectedField(null);
    toast.success("Question deleted");
  }, []);

  // Delete a section
  const deleteSection = useCallback((categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    toast.success("Section deleted");
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Check for empty sections
      const hasEmptySections = categories.some(
        (category) => category.questions.length === 0
      );

      if (hasEmptySections) {
        toast.error(
          "Some sections have no questions. Please add questions or remove the empty sections."
        );
        return;
      }

      // Validate all questions
      const hasEmptyQuestions = categories.some((category) =>
        category.questions.some((question) => !question.label)
      );

      if (hasEmptyQuestions) {
        toast.error("Please complete all questions before saving");
        return;
      }

      const sections = categories.map((section) => ({
        section_title: section.name,
        section_id: section.id,
        questions: section.questions.map((field) => ({
          question_id: field.id,
          question_type: field.type,
          question_text: field.label,
          question_required: field.required,
          options: field.options?.map((value) => ({
            option_value: value.value,
            option_id: value.id
          })),
          expected_answer: [],
          question_response: []
        }))
      }));
      const res = await mutation(`survey?doc_id=${param["id"]}`, {
        method: "PUT",
        isAlert: false,
        body: {
          survey_id: param["id"],
          survey_status: "draft",
          sections
        }
      });

      if (res?.status === 200) {
        mutate();
        toast.success("Survey Drafted successfully");
        setCategories([]);
      } else {
        toast.error("Failed to save form");
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "An error occurred while saving"
      );
    }
  };

  const handleSubmitPublish = async () => {
    try {
      // Check for empty sections
      const hasEmptySections = categories.some(
        (category) => category.questions.length === 0
      );

      if (hasEmptySections) {
        toast.error(
          "Some sections have no questions. Please add questions or remove the empty sections."
        );
        return;
      }

      // Validate all questions
      const hasEmptyQuestions = categories.some((category) =>
        category.questions.some((question) => !question.label)
      );

      if (hasEmptyQuestions) {
        toast.error("Please complete all questions before saving");
        return;
      }

      const sections = categories.map((section) => ({
        section_title: section.name,
        section_id: section.id,
        questions: section.questions.map((field) => ({
          question_id: field.id,
          question_type: field.type,
          question_text: field.label,
          question_required: field.required,
          options: field.options?.map((value) => ({
            option_value: value.value,
            option_id: value.id
          })),
          expected_answer: [],
          question_response: []
        }))
      }));

      const res = await publishMutation(`survey?doc_id=${param["id"]}`, {
        method: "PUT",
        isAlert: false,
        body: {
          survey_id: param["id"],
          survey_status: "published",
          sections
        }
      });

      if (res?.status === 200) {
        mutate();
        toast.success("Survey saved successfully");
        // setTab("Share");
        setCategories([]);
      } else {
        toast.error("Failed to save form");
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "An error occurred while saving"
      );
    }
  };

  // Drag and drop handler
  const reorderQuestions = useCallback(
    (categoryId: string, newOrder: FormField[]) => {
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? { ...category, questions: newOrder }
            : category
        )
      );
    },
    []
  );

  // QuestionItem Component
  const QuestionItem = React.memo(
    ({ field, categoryId }: { field: FormField; categoryId: string }) => (
      <motion.div
        variants={dragVariants}
        initial="initial"
        whileDrag="drag"
        layout
        className="cursor-move rounded-lg border bg-white p-3 transition-colors duration-200 hover:border-blue-500 dark:border-neutral-800 dark:bg-darkSidebarBackground"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="cursor-grab text-gray-400" size={16} />
            <span className="dark:text-white">
              {field.label || "Untitled Question"}
            </span>
            {field.required && <span className="text-red-500">*</span>}
            <span className="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-300">
              {field.type}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedField({ categoryId, field })}
              className="rounded-lg p-1 text-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <EditIcon size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const confirmed = window.confirm(
                  "Are you sure you want to delete this question?"
                );
                if (confirmed) {
                  deleteField(categoryId, field.id);
                }
              }}
              className="rounded-lg p-1 text-red-500 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    )
  );
  QuestionItem.displayName = "QuestionItem";

  return (
    <div className="h-fit w-full p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Survey Form Preview
        </h1>
        <div className="flex items-center gap-5">
          <div className="w-fit">
            <CustomButton
              loading={publishLoading}
              onClick={handleSubmitPublish}
              disabled={categories.length === 0}
              startIcon={<Rocket size={15} />}
              className="w-fit rounded-lg bg-blue-600 px-6 py-2 !capitalize text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Publish
            </CustomButton>
          </div>
          <div className="w-fit">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={15} /> : <SaveIcon />
              }
              className="!bg-orange-500 !px-6 !capitalize !text-white !drop-shadow-4 disabled:!cursor-not-allowed disabled:!bg-neutral-600 disabled:!opacity-50"
            >
              Save and Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Basic Details Section */}
      <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm dark:bg-darkSidebarBackground">
        <div
          tabIndex={0}
          role="button"
          onClick={() => setIsBasicDetailsExpanded(!isBasicDetailsExpanded)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsBasicDetailsExpanded(!isBasicDetailsExpanded);
            }
          }}
          className={`flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
            isBasicDetailsExpanded && "border-b dark:border-gray-700"
          } `}
        >
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-1 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              {isBasicDetailsExpanded ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </button>
            <span className="font-medium dark:text-white">Survey Details</span>
          </div>
        </div>

        {isBasicDetailsExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <form onSubmit={basicDetailsFormik.handleSubmit} className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="surveyName"
                    className="mb-2 block text-sm font-medium dark:text-gray-300"
                  >
                    Survey Name *
                  </label>
                  <input
                    id="surveyName"
                    type="text"
                    {...basicDetailsFormik.getFieldProps("surveyName")}
                    className="w-full rounded-lg border p-2 dark:border-neutral-800 dark:bg-darkHoverBackground dark:text-white"
                  />
                  {basicDetailsFormik.touched.surveyName &&
                    basicDetailsFormik.errors.surveyName && (
                      <div className="mt-1 text-sm text-red-500">
                        {typeof basicDetailsFormik.errors.surveyName ===
                          "string" && basicDetailsFormik.errors.surveyName}
                      </div>
                    )}
                </div>
                <div>
                  <label
                    htmlFor="surveyDescription"
                    className="mb-2 block text-sm font-medium dark:text-gray-300"
                  >
                    Survey Description
                  </label>
                  <textarea
                    id="surveyDescription"
                    rows={1}
                    {...basicDetailsFormik.getFieldProps("surveyDescription")}
                    className="w-full rounded-lg border p-2 dark:border-neutral-800 dark:bg-darkHoverBackground dark:text-white"
                  />
                  {basicDetailsFormik.touched.surveyDescription &&
                    basicDetailsFormik.errors.surveyDescription && (
                      <div className="mt-1 text-sm text-red-500">
                        {typeof basicDetailsFormik.errors.surveyDescription ===
                          "string" &&
                          basicDetailsFormik.errors.surveyDescription}
                      </div>
                    )}
                </div>
                <div>
                  <label
                    htmlFor="categoryName"
                    className="mb-2 block text-sm font-medium dark:text-gray-300"
                  >
                    Category Name
                  </label>
                  <input
                    id="categoryName"
                    type="text"
                    {...basicDetailsFormik.getFieldProps("categoryName")}
                    className="w-full rounded-lg border p-2 dark:border-neutral-800 dark:bg-darkHoverBackground dark:text-white"
                  />
                  {basicDetailsFormik.touched.categoryName &&
                    basicDetailsFormik.errors.categoryName && (
                      <div className="mt-1 text-sm text-red-500">
                        {typeof basicDetailsFormik.errors.categoryName ===
                          "string" && basicDetailsFormik.errors.categoryName}
                      </div>
                    )}
                </div>
                <div>
                  <label
                    htmlFor="categoryDescription"
                    className="mb-2 block text-sm font-medium dark:text-gray-300"
                  >
                    Category Description
                  </label>
                  <textarea
                    id="categoryDescription"
                    rows={1}
                    {...basicDetailsFormik.getFieldProps("categoryDescription")}
                    className="w-full rounded-lg border p-2 dark:border-neutral-800 dark:bg-darkHoverBackground dark:text-white"
                  />
                  {basicDetailsFormik.touched.categoryDescription &&
                    basicDetailsFormik.errors.categoryDescription && (
                      <div className="mt-1 text-sm text-red-500">
                        {typeof basicDetailsFormik.errors
                          .categoryDescription === "string" &&
                          basicDetailsFormik.errors.categoryDescription}
                      </div>
                    )}
                </div>
                <div>
                  <label
                    htmlFor="domain"
                    className="mb-2 block text-sm font-medium dark:text-gray-300"
                  >
                    Domain *
                  </label>
                  <input
                    id="domain"
                    type="text"
                    {...basicDetailsFormik.getFieldProps("domain")}
                    className="w-full rounded-lg border p-2 dark:border-neutral-800 dark:bg-darkHoverBackground dark:text-white"
                  />
                  {basicDetailsFormik.touched.domain &&
                    basicDetailsFormik.errors.domain && (
                      <div className="mt-1 text-sm text-red-500">
                        {typeof basicDetailsFormik.errors.domain === "string" &&
                          basicDetailsFormik.errors.domain}
                      </div>
                    )}
                </div>
                <div>
                  <label
                    htmlFor="subjectType"
                    className="mb-2 block text-sm font-medium dark:text-gray-300"
                  >
                    Subject Type *
                  </label>
                  <select
                    id="subjectType"
                    {...basicDetailsFormik.getFieldProps("subjectType")}
                    className="w-full rounded-lg border p-2 dark:border-neutral-800 dark:bg-darkHoverBackground dark:text-white"
                  >
                    <option value="">Select Subject Type</option>
                    {Object.values(SubjectType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {basicDetailsFormik.touched.subjectType &&
                    basicDetailsFormik.errors.subjectType && (
                      <div className="mt-1 text-sm text-red-500">
                        {typeof basicDetailsFormik.errors.subjectType ===
                          "string" && basicDetailsFormik.errors.subjectType}
                      </div>
                    )}
                </div>
                <div>
                  <label
                    htmlFor="stakeholder"
                    className="mb-2 block text-sm font-medium dark:text-gray-300"
                  >
                    Stakeholder *
                  </label>
                  <select
                    id="stakeholder"
                    {...basicDetailsFormik.getFieldProps("stakeholder")}
                    className="w-full rounded-lg border p-2 dark:border-neutral-800 dark:bg-darkHoverBackground dark:text-white"
                  >
                    <option value="">Select Stakeholder</option>
                    {Object.values(StakeholderRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {basicDetailsFormik.touched.stakeholder &&
                    basicDetailsFormik.errors.stakeholder && (
                      <div className="mt-1 text-sm text-red-500">
                        {typeof basicDetailsFormik.errors.stakeholder ===
                          "string" && basicDetailsFormik.errors.stakeholder}
                      </div>
                    )}
                </div>
                <div className="flex items-end justify-end">
                  <div className="w-fit">
                    <CustomButton
                      disabled={updateDetailsLoading}
                      loading={updateDetailsLoading}
                      type="submit"
                      className="w-fit rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
                    >
                      Update Survey Details
                    </CustomButton>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </div>

      <div className="flex w-full flex-col gap-5 rounded-xl bg-white p-6 shadow-sm dark:bg-darkSidebarBackground">
        {/* Add Category Form */}
        <div className="flex w-full items-center justify-between">
          <p className="text-2xl font-semibold text-gray-700 dark:text-white">
            Survey Questions
          </p>
        </div>
        <form onSubmit={addCategory}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter section name"
              className="flex-1 rounded-lg border p-2.5 outline-none transition-colors duration-200 dark:border-neutral-800 dark:bg-darkHoverBackground dark:text-white"
            />
            <div className="w-fit">
              <CustomButton
                type="submit"
                disabled={!newCategoryName.trim()}
                startIcon={<Plus size={16} />}
                className="w-fit rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Section
              </CustomButton>
            </div>
          </div>
        </form>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="overflow-hidden rounded-lg border bg-white dark:border-neutral-800 dark:bg-darkMainBackground"
            >
              {/* Category Header */}
              <div
                className={`flex items-center justify-between p-4 ${
                  category.isExpanded && "border-b dark:border-neutral-800"
                } `}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCategories((prev) =>
                        prev.map((c) =>
                          c.id === category.id
                            ? { ...c, isExpanded: !c.isExpanded }
                            : c
                        )
                      )
                    }
                    className="rounded-lg p-1 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {category.isExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>
                  {editingCategoryId === category.id ? (
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((c) =>
                            c.id === category.id
                              ? { ...c, name: e.target.value }
                              : c
                          )
                        )
                      }
                      onBlur={() => setEditingCategoryId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setEditingCategoryId(null);
                        }
                      }}
                      className="rounded-lg border p-2 outline-none dark:border-neutral-800 dark:bg-darkHoverBackground dark:text-white"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium dark:text-white">
                        {category.name}
                      </span>
                      <button
                        onClick={() => setEditingCategoryId(category.id)}
                        className="rounded-lg p-1 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          const confirmed = window.confirm(
                            "Are you sure you want to delete this section?"
                          );
                          if (confirmed) {
                            deleteSection(category.id);
                          }
                        }}
                        className="rounded-lg p-1 text-red-500 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-fit">
                  <CustomButton
                    onClick={() => addField(category.id)}
                    startIcon={<Plus size={16} />}
                    className="w-fit rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add New Question
                  </CustomButton>
                </div>
              </div>

              {/* Questions List with Drag and Drop */}
              {category.isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4">
                    <Reorder.Group
                      axis="y"
                      values={category.questions}
                      onReorder={(newOrder) =>
                        reorderQuestions(category.id, newOrder)
                      }
                      className="space-y-2"
                    >
                      {category.questions.map((field) => (
                        <Reorder.Item key={field.id} value={field}>
                          <QuestionItem
                            field={field}
                            categoryId={category.id}
                          />
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>

                    {category.questions.length === 0 && (
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        <AlertCircle className="mr-2" size={20} />
                        <span>No questions added yet</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-gray-500 dark:border-gray-700 dark:text-gray-400">
              <AlertCircle size={24} className="mb-2" />
              <span>No sections added yet</span>
            </div>
          )}
        </div>
      </div>
      {/* Field Properties Modal with Formik */}
      <AnimatePresence>
        {selectedField && (
          <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="w-full max-w-md rounded-md bg-white dark:border dark:border-gray-700 dark:bg-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={formik.handleSubmit}>
                <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-700">
                  <span className="font-satoshi text-lg font-medium text-gray-900 dark:text-white">
                    {selectedField.field.label
                      ? "Edit Question"
                      : "New Question"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (formik.dirty) {
                        const confirmed = window.confirm("Discard changes?");
                        if (!confirmed) {
                          return;
                        }
                      }
                      setSelectedField(null);
                      formik.resetForm();
                    }}
                    className="rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 p-5">
                  {/* Question Label */}
                  <div>
                    <label
                      htmlFor="questionLabel"
                      className="mb-2 block text-sm font-medium dark:text-gray-300"
                    >
                      Question Label *
                    </label>
                    <input
                      id="questionLabel"
                      type="text"
                      {...formik.getFieldProps("label")}
                      className="w-full rounded-lg border p-2 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    {formik.touched.label && formik.errors.label && (
                      <div className="mt-1 text-sm text-red-500">
                        {formik.errors.label}
                      </div>
                    )}
                  </div>

                  {/* Field Type */}
                  <div>
                    <label
                      htmlFor="fieldType"
                      className="mb-2 block text-sm font-medium dark:text-gray-300"
                    >
                      Field Type *
                    </label>
                    <select
                      id="fieldType"
                      {...formik.getFieldProps("type")}
                      className="w-full cursor-pointer rounded-lg border p-2 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="number">Number</option>
                      <option value="textarea">Text Area</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="radio">Radio</option>
                      <option value="date">Date</option>
                      <option value="file">File Upload</option>
                      <option value="multipleselect">Multiple Select</option>
                    </select>
                  </div>

                  {/* Options Section */}
                  {["select", "radio", "checkbox", "multipleselect"].includes(
                    formik.values.type
                  ) && (
                    <div>
                      <label
                        htmlFor="optionsInput"
                        className="mb-2 block text-sm font-medium dark:text-gray-300"
                      >
                        Options *
                      </label>
                      <div className="mb-3 flex gap-2">
                        <input
                          id="optionsInput"
                          type="text"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newOption.trim()) {
                              e.preventDefault();
                              formik.setFieldValue("options", [
                                ...(formik.values.options || []),
                                {
                                  id: generateUniqueId(),
                                  value: newOption.trim()
                                }
                              ]);
                              setNewOption("");
                            }
                          }}
                          placeholder="Enter an option"
                          className="flex-1 rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newOption.trim()) {
                              formik.setFieldValue("options", [
                                ...(formik.values.options || []),
                                {
                                  id: generateUniqueId(),
                                  value: newOption.trim()
                                }
                              ]);
                              setNewOption("");
                            }
                          }}
                          disabled={!newOption.trim()}
                          className="rounded-lg bg-blue-600 p-2 text-white transition-colors duration-200 hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      <div className="max-h-40 space-y-2 overflow-y-auto">
                        {formik.values.options?.map((option) => (
                          <div
                            key={option.id}
                            className="group flex items-center justify-between rounded-lg bg-gray-50 p-2 dark:bg-gray-700"
                          >
                            <span className="dark:text-white">
                              {option.value}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions =
                                  formik.values.options?.filter(
                                    (o) => o.id !== option.id
                                  );
                                formik.setFieldValue("options", newOptions);
                              }}
                              className="rounded-lg p-1 text-red-500 opacity-0 transition-all duration-200 hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-900/30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}

                        {formik.touched.options && formik.errors.options && (
                          <div className="mt-1 text-sm text-red-500">
                            {typeof formik.errors.options === "string"
                              ? formik.errors.options
                              : "Please add at least one option"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Required Field Toggle */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="required-field"
                      {...formik.getFieldProps("required")}
                      checked={formik.values.required}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                    />
                    <label
                      htmlFor="required-field"
                      className="text-sm dark:text-gray-300"
                    >
                      Required Field
                    </label>
                  </div>

                  {/* Action Buttons */}

                  <div className="flex w-full items-center justify-end gap-5 border-t border-gray-200 pt-2 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        if (formik.dirty) {
                          const confirmed = window.confirm("Discard changes?");
                          if (!confirmed) {
                            return;
                          }
                        }
                        setSelectedField(null);
                        formik.resetForm();
                      }}
                      className="rounded-md border border-gray-300 px-4 py-1.5 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                    <div className="w-fit">
                      <CustomButton
                        type="submit"
                        disabled={!formik.isValid || !formik.dirty}
                        className="w-fit rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Save Changes
                      </CustomButton>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(DynamicFormCreate);
