"use client";
import useMutation from "@/shared/hooks/useMutation";
import { useMyContext } from "@/shared/providers/AppProvider";
import Add from "@mui/icons-material/Add";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Delete,
  Edit3,
  Lightbulb,
  Menu,
  Save,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Section } from "./AIAssessment";
export interface IsAccesss {
  permission: {
    is_shown: boolean;
    actions: {
      update: boolean;
      create: boolean;
      delete: boolean;
      read: boolean;
    };
  };
}
export interface UpdateAiAssessmentProps {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  initialData?: Section[];
  isAccess?: IsAccesss;
}
const UpdateAiAssessment: React.FC<UpdateAiAssessmentProps> = ({
  open,
  onClose,
  mutate,
  initialData,
  isAccess
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [newQuestionId, setNewQuestionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const { isLoading, mutation } = useMutation();
  const questionsEndRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const { setMetaTitle } = useMyContext();

  useEffect(() => {
    if (initialData) {
      setSections(initialData);
      if (initialData.length > 0 && initialData[0]) {
        setActiveSection(initialData[0].section_id);
      }
    }
  }, [initialData]);

  useEffect(() => {
    const allSectionsHaveQuestions = sections.every(
      (section) => section.questions.length > 0
    );
    const allRequiredQuestionsAnswered = sections.every((section) =>
      section.questions.every(
        (question) =>
          !question.question_required ||
          (question.response &&
            question.response.length > 0 &&
            question.response[0])
      )
    );
    setIsValid(allSectionsHaveQuestions && allRequiredQuestionsAnswered);
    const totalQuestions = sections.reduce(
      (sum, section) => sum + section.questions.length,
      0
    );
    const answeredQuestions = sections.reduce(
      (sum, section) =>
        sum +
        section.questions.filter(
          (q) => q.response && q.response.length > 0 && q.response[0]
        ).length,
      0
    );
    setProgress(
      totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
    );
  }, [sections]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Skip scrolling on initial mount
    }

    if (newQuestionId && questionsEndRef.current) {
      questionsEndRef.current.scrollIntoView({ behavior: "smooth" });
      setNewQuestionId(null); // Reset after scrolling
    }
  }, [newQuestionId]);

  const handleResponseChange = (
    sectionIndex: number,
    questionIndex: number,
    value: string
  ): void => {
    const updatedSections = [...sections];
    if (updatedSections[sectionIndex]?.questions[questionIndex]) {
      updatedSections[sectionIndex].questions[questionIndex].response = [value];
      setSections(updatedSections);
    }
  };

  const handleMultipleChoiceChange = (
    sectionIndex: number,
    questionIndex: number,
    value: string
  ): void => {
    const updatedSections = [...sections];
    if (updatedSections[sectionIndex]?.questions[questionIndex]) {
      updatedSections[sectionIndex].questions[questionIndex].response = [value];
      setSections(updatedSections);
    }
  };

  const addNewQuestion = (sectionIndex: number): void => {
    const updatedSections = [...sections];
    const newQuestionIds = `q_${Date.now()}`;
    if (updatedSections[sectionIndex]) {
      updatedSections[sectionIndex].questions.push({
        question_id: newQuestionIds,
        question_type: "text",
        question_text: "",
        question_required: true,
        options: [],
        expected_answer: [],
        response: [""],
        subquestions: [],
        trigger_conditions: [],
        is_client_added: true
      });
      setSections(updatedSections);
      setNewQuestionId(newQuestionIds);
      setShowSidebar(false); // Close sidebar on mobile after adding question
    }
  };

  const addNewSection = (): void => {
    const newSectionId = `section_${Date.now()}`;
    setSections([
      ...sections,
      {
        section_id: newSectionId,
        section_title: "New Section",
        questions: [],
        is_client_added: true
      }
    ]);
    setActiveSection(newSectionId);
    setShowSidebar(false); // Close sidebar on mobile after adding section
  };

  const updateQuestionText = (
    sectionIndex: number,
    questionIndex: number,
    text: string
  ): void => {
    const updatedSections = [...sections];
    if (updatedSections[sectionIndex]?.questions[questionIndex]) {
      updatedSections[sectionIndex].questions[questionIndex].question_text =
        text;
      setSections(updatedSections);
    }
  };

  const updateSectionTitle = (sectionIndex: number, title: string): void => {
    const updatedSections = [...sections];
    if (updatedSections[sectionIndex]) {
      updatedSections[sectionIndex].section_title = title;
      setSections(updatedSections);
    }
  };

  const deleteQuestion = (
    sectionIndex: number,
    questionIndex: number
  ): void => {
    const updatedSections = [...sections];
    if (updatedSections[sectionIndex]) {
      updatedSections[sectionIndex].questions.splice(questionIndex, 1);
      setSections(updatedSections);
    }
  };

  const deleteSection = (sectionIndex: number): void => {
    const updatedSections = [...sections];
    const deletedSectionId = updatedSections[sectionIndex]?.section_id;
    updatedSections.splice(sectionIndex, 1);
    setSections(updatedSections);
    if (
      deletedSectionId === activeSection &&
      updatedSections.length > 0 &&
      updatedSections[0]
    ) {
      setActiveSection(updatedSections[0].section_id);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      const formattedSections: Section[] = sections.map((section) => ({
        section_id: section.section_id,
        section_title: section.section_title,
        questions: section.questions.map((question) => ({
          question_id: question.question_id,
          question_type: question.question_type,
          question_text: question.question_text,
          question_required: question.question_required,
          options: question.options || [],
          expected_answer: question.expected_answer || [],
          response: question.response || [],
          subquestions: question.subquestions,
          trigger_conditions: question.trigger_conditions,
          is_client_added: question.is_client_added || false
        })),
        is_client_added: section.is_client_added || false
      }));
      const res = await mutation(
        "survey-response?survey_id=SRVY-j9RO9xayW4ZxXuuK",
        {
          method: "PUT",
          isAlert: false,
          body: {
            sections: [...formattedSections]
          }
        }
      );
      if (res?.status === 201 || res?.status === 200) {
        setIsProcessing(false);
        mutate();
        onClose();
        toast.success("Assessment updated successfully");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const addOption = (sectionIndex: number, questionIndex: number): void => {
    const updatedSections = [...sections];
    const question = updatedSections[sectionIndex]?.questions[questionIndex];
    if (!question) {
      return;
    }

    const newOptionId = `00${(question.options?.length || 0) + 1}`;
    if (!question.options) {
      question.options = [];
    }
    question.options.push({
      option_id: newOptionId,
      option_value: `Option ${(question.options.length || 0) + 1}`
    });
    setSections(updatedSections);
  };

  const updateOptionValue = (
    sectionIndex: number,
    questionIndex: number,
    optionIndex: number,
    value: string
  ): void => {
    const updatedSections = [...sections];
    if (
      updatedSections[sectionIndex]?.questions[questionIndex]?.options?.[
        optionIndex
      ]
    ) {
      updatedSections[sectionIndex].questions[questionIndex].options![
        optionIndex
      ].option_value = value;
    }
    setSections(updatedSections);
  };

  const deleteOption = (
    sectionIndex: number,
    questionIndex: number,
    optionIndex: number
  ): void => {
    const updatedSections = [...sections];
    if (updatedSections[sectionIndex]?.questions[questionIndex]?.options) {
      updatedSections[sectionIndex].questions[questionIndex].options!.splice(
        optionIndex,
        1
      );
    }
    setSections(updatedSections);
  };

  const handleNextSection = () => {
    const currentIndex = sections.findIndex(
      (s) => s.section_id === activeSection
    );
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      if (nextSection) {
        setActiveSection(nextSection.section_id);
      }
    }
  };

  const handlePreviousSection = () => {
    const currentIndex = sections.findIndex(
      (s) => s.section_id === activeSection
    );
    if (currentIndex > 0) {
      const previousSection = sections[currentIndex - 1];
      if (previousSection) {
        setActiveSection(previousSection.section_id);
      }
    }
  };

  const activeSectionIndex = sections.findIndex(
    (s) => s.section_id === activeSection
  );

  const pageTransition = {
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const close = () => {
    onClose();
    setMetaTitle("AI Assessment | Cognitiveview");
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      fullScreen
      PaperProps={{ className: "dark:bg-gray-900" }}
    >
      <DialogTitle className="sticky top-0 z-20 flex items-center border-b border-gray-200 bg-white bg-opacity-90 px-3 py-3 backdrop-blur-xl backdrop-filter dark:border-gray-700 dark:bg-darkSidebarBackground dark:bg-opacity-90 sm:px-6 sm:py-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-6">
            <IconButton
              edge="start"
              onClick={close}
              className="rounded-full bg-white p-1.5 text-gray-700 shadow-md transition-all duration-200 hover:bg-gray-100 dark:bg-darkSidebarBackground dark:text-gray-200 dark:hover:bg-gray-600 sm:mr-5 sm:p-2"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </IconButton>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowSidebar(true)}
              className="rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:block">
              <h1 className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-lg font-bold text-transparent dark:from-indigo-400 dark:to-blue-300 sm:text-xl">
                AI Assessment Update
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                Update and customize your assessment
              </p>
            </div>

            {/* Mobile section indicator */}
            <div className="flex items-center sm:hidden">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Section {activeSectionIndex + 1} of {sections.length}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center">
              <div className="mr-1 h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 sm:mr-2 sm:h-2.5 sm:w-28">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-300 ease-in-out dark:from-indigo-500 dark:to-blue-400"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 sm:text-sm">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="relative">
              {isAccess?.permission?.is_shown && (
                <button
                  onClick={() => {
                    if (isAccess?.permission?.actions?.update) {
                      handleSubmit();
                    } else {
                      toast.error(
                        "You do not have permission to update the assessment."
                      );
                    }
                  }}
                  disabled={isProcessing || !isValid}
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                    isValid && isAccess?.permission?.actions?.update
                      ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 focus:ring-blue-500 dark:from-indigo-500 dark:to-blue-400"
                      : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  } ${isProcessing ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  {isProcessing || isLoading ? (
                    <>
                      <svg
                        className="mr-1 h-3 w-3 animate-spin sm:mr-2 sm:h-4 sm:w-4"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">
                        Update Assessment
                      </span>
                      <span className="sm:hidden">Update</span>
                    </>
                  )}
                </button>
              )}

              {!isValid &&
                sections.some((section) => section.questions.length === 0) && (
                  <div className="absolute -bottom-10 right-0 z-10 w-48 rounded-lg bg-red-50 p-2 text-xs text-red-600 shadow-lg dark:bg-red-900/20 dark:text-red-300 sm:w-64">
                    <div className="flex items-center">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      <span>All sections must have at least one question</span>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </DialogTitle>

      <DialogContent className="flex !p-0 dark:bg-gray-900">
        {isProcessing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex h-full w-full flex-col items-center justify-center py-16"
          >
            <div className="relative h-20 w-20 sm:h-28 sm:w-28">
              <div className="absolute h-full w-full animate-ping rounded-full bg-indigo-400 opacity-20"></div>
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 shadow-xl dark:from-indigo-500 dark:to-blue-400">
                <Check className="h-10 w-10 text-white sm:h-14 sm:w-14" />
              </div>
            </div>
            <h2 className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-xl font-bold text-transparent dark:from-indigo-400 dark:to-blue-300 sm:mt-8 sm:text-2xl">
              Processing your assessment...
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300 sm:text-base">
              {"We're saving your changes and updating the assessment."}
              <br />
              This will only take a moment.
            </p>
          </motion.div>
        ) : (
          <div className="flex h-full w-full flex-row">
            {/* Mobile Sidebar Overlay */}
            {showSidebar && (
              <div
                tabIndex={0}
                role="button"
                className="fixed inset-0 z-40 bg-black bg-opacity-50 sm:hidden"
                onClick={() => setShowSidebar(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowSidebar(false);
                  }
                }}
              />
            )}

            {/* Sidebar */}
            <div
              className={`${
                showSidebar ? "translate-x-0" : "-translate-x-full"
              } fixed inset-y-0 left-0 z-50 w-80 flex-shrink-0 transform overflow-y-auto border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out dark:border-gray-700 dark:bg-darkSidebarBackground sm:relative sm:w-72 sm:translate-x-0`}
            >
              <div className="sticky top-0 z-10 bg-white p-4 dark:bg-darkSidebarBackground">
                <div className="flex items-center justify-between sm:justify-start">
                  <h2 className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-sm font-semibold uppercase tracking-wider text-transparent dark:from-indigo-400 dark:to-blue-300">
                    Sections
                  </h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 sm:hidden"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative mb-4 mt-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                </div>
              </div>

              <div className="px-3 pb-4">
                <AnimatePresence>
                  {sections.map((section, index) => (
                    <motion.button
                      key={section.section_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => {
                        setActiveSection(section.section_id);
                        setShowSidebar(false);
                      }}
                      className={`group mb-1.5 flex w-full items-center justify-between rounded-xl p-3 text-left text-sm transition-all duration-200 ${
                        activeSection === section.section_id
                          ? "bg-gradient-to-r from-indigo-50 to-blue-50 shadow-sm dark:from-indigo-900/30 dark:to-blue-900/30 dark:text-blue-200 dark:shadow-gray-900/20"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-darkMainBackground"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                            activeSection === section.section_id
                              ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white dark:from-indigo-500 dark:to-blue-400"
                              : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-wrap font-medium">
                            {section.section_title}
                          </span>
                          {section.questions.length === 0 && (
                            <span className="text-xs text-red-500 dark:text-red-400">
                              No questions
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(index);
                        }}
                        className="ml-2 hidden rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 group-hover:block dark:hover:bg-gray-600 dark:hover:text-gray-200"
                      >
                        <Delete className="h-3.5 w-3.5" />
                      </button>
                    </motion.button>
                  ))}
                </AnimatePresence>
                {isAccess?.permission?.is_shown && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                      if (isAccess?.permission?.actions?.create) {
                        addNewSection();
                      } else {
                        toast.error(
                          "You do not have permission to add a new section."
                        );
                      }
                    }}
                    className="mt-4 flex w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-3 text-sm font-medium text-gray-600 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                  >
                    <Add className="mr-1 h-4 w-4" />
                    Add Section
                  </motion.button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 pb-20 dark:bg-darkMainBackground sm:pb-0">
              {activeSectionIndex !== -1 && (
                <motion.div
                  key={activeSection}
                  initial="out"
                  animate="in"
                  exit="out"
                  variants={pageTransition}
                  transition={{ duration: 0.3 }}
                  className="mx-auto max-w-6xl px-3 py-4 sm:px-8 sm:py-6"
                >
                  <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700 sm:mb-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                          <input
                            type="text"
                            value={
                              sections[activeSectionIndex]?.section_title || ""
                            }
                            onChange={(e) =>
                              updateSectionTitle(
                                activeSectionIndex,
                                e.target.value
                              )
                            }
                            disabled={!isAccess?.permission?.actions?.update}
                            className="w-full rounded-sm bg-transparent p-2 text-xl font-bold text-gray-800 ring ring-indigo-500 focus:outline-none dark:text-white dark:ring-indigo-400 sm:text-2xl"
                            placeholder="Section Title"
                          />
                        </div>
                        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                            Core questions stay the same, so results are always
                            comparable. You can quickly add any extra questions
                            you want on top.
                          </p>
                          {sections[activeSectionIndex] &&
                            sections[activeSectionIndex].questions.length ===
                              0 && (
                              <div className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-300 sm:ml-2">
                                <span className="flex items-center">
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  Section must have questions
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                      {isAccess?.permission?.is_shown && (
                        <button
                          onClick={() => {
                            if (isAccess?.permission?.actions?.create) {
                              addNewQuestion(activeSectionIndex);
                            } else {
                              toast.error(
                                "You do not have permission to add a new question."
                              );
                            }
                          }}
                          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg dark:from-indigo-500 dark:to-blue-400 sm:w-auto"
                        >
                          <Add className="mr-1 h-4 w-4" />
                          Add Question
                        </button>
                      )}
                    </div>
                  </div>

                  {sections[activeSectionIndex]?.questions &&
                  sections[activeSectionIndex].questions.length > 0 ? (
                    <div className="space-y-4 sm:space-y-6">
                      <AnimatePresence>
                        {sections[activeSectionIndex].questions.map(
                          (question, questionIndex) => (
                            <motion.div
                              key={question.question_id}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{
                                duration: 0.4,
                                type: "spring",
                                stiffness: 100,
                                damping: 15
                              }}
                              className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-darkSidebarBackground sm:p-6 ${
                                question.question_id === newQuestionId
                                  ? "ring-2 ring-indigo-500 dark:ring-indigo-400"
                                  : ""
                              }`}
                              ref={
                                question.question_id === newQuestionId
                                  ? questionsEndRef
                                  : null
                              }
                            >
                              <div className="mb-4">
                                {question.is_client_added ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center">
                                      <Edit3 className="mr-2 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                      <input
                                        type="text"
                                        placeholder="Enter your question..."
                                        value={question.question_text}
                                        onChange={(e) =>
                                          updateQuestionText(
                                            activeSectionIndex,
                                            questionIndex,
                                            e.target.value
                                          )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-darkMainBackground dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-lg"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteQuestion(
                                            activeSectionIndex,
                                            questionIndex
                                          )
                                        }
                                        className="inline-flex w-full items-center justify-center rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30 sm:ml-auto sm:w-auto"
                                      >
                                        <Delete className="mr-1 h-3.5 w-3.5" />
                                        Remove
                                      </button>
                                    </div>
                                    {question.question_type ===
                                      "multiple_choice" && (
                                      <div className="dark:bg-gray-750 rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-inner dark:border-gray-700 dark:shadow-gray-900/30">
                                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Answer Options
                                          </h4>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              addOption(
                                                activeSectionIndex,
                                                questionIndex
                                              )
                                            }
                                            className="inline-flex w-full items-center justify-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:w-auto"
                                          >
                                            <Add className="mr-1 h-3 w-3" />
                                            Add Option
                                          </button>
                                        </div>
                                        <AnimatePresence>
                                          {question.options?.map(
                                            (option, optionIndex) => (
                                              <motion.div
                                                key={option.option_id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="mb-2 flex items-center gap-2"
                                              >
                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-xs font-medium text-white shadow-sm dark:from-indigo-500 dark:to-blue-400">
                                                  {String.fromCharCode(
                                                    65 + optionIndex
                                                  )}
                                                </div>
                                                <input
                                                  type="text"
                                                  value={option.option_value}
                                                  onChange={(e) =>
                                                    updateOptionValue(
                                                      activeSectionIndex,
                                                      questionIndex,
                                                      optionIndex,
                                                      e.target.value
                                                    )
                                                  }
                                                  className="flex-1 rounded-lg border-0 bg-white px-3 py-2 shadow-sm transition-shadow focus:ring-2 focus:ring-indigo-500 dark:border dark:bg-gray-700 dark:text-white"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    deleteOption(
                                                      activeSectionIndex,
                                                      questionIndex,
                                                      optionIndex
                                                    )
                                                  }
                                                  className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                                                >
                                                  <Delete className="h-4 w-4" />
                                                </button>
                                              </motion.div>
                                            )
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1">
                                      <h3 className="text-base font-semibold text-gray-800 dark:text-white sm:text-lg">
                                        {question.question_text}
                                        {question.question_required && (
                                          <span className="ml-1 text-red-500">
                                            *
                                          </span>
                                        )}
                                      </h3>
                                      {question.question_type ===
                                        "multiple_choice" && (
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                                          Multiple choice •{" "}
                                          {question.options?.length || 0}{" "}
                                          options
                                        </div>
                                      )}
                                    </div>
                                    <div className="rounded-md bg-gradient-to-r from-indigo-50 to-blue-50 px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:bg-gradient-to-r dark:from-indigo-900/30 dark:to-blue-900/30 dark:text-indigo-300">
                                      {question.question_type === "text"
                                        ? "Text Response"
                                        : "Multiple Choice"}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4">
                                {question.question_type === "text" ? (
                                  <div>
                                    <textarea
                                      rows={3}
                                      placeholder="Type your answer here..."
                                      value={question.response?.[0] || ""}
                                      onChange={(e) =>
                                        handleResponseChange(
                                          activeSectionIndex,
                                          questionIndex,
                                          e.target.value
                                        )
                                      }
                                      className={`w-full resize-none rounded-lg border bg-white p-3 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-indigo-500 dark:border-neutral-600 dark:bg-darkMainBackground dark:text-white ${
                                        question.question_required &&
                                        (!question.response ||
                                          !question.response[0])
                                          ? "ring-2 ring-red-500 focus:ring-red-500"
                                          : ""
                                      }`}
                                    ></textarea>
                                    {question.question_required &&
                                      (!question.response ||
                                        !question.response[0]) && (
                                        <div className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                          <AlertCircle className="h-4 w-4" />
                                          <span>
                                            This question requires an answer
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <AnimatePresence>
                                      {question.options?.map((option) => (
                                        <motion.label
                                          key={option.option_id}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className={`dark:hover:bg-gray-750 flex cursor-pointer items-center rounded-lg border p-3 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 ${
                                            question.response?.[0] ===
                                            option.option_value
                                              ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-md dark:border-indigo-500 dark:bg-gradient-to-r dark:from-indigo-900/20 dark:to-blue-900/20"
                                              : "border-gray-200 bg-white dark:bg-gray-800"
                                          }`}
                                        >
                                          <div
                                            className={`h-5 w-5 flex-shrink-0 rounded-full border ${
                                              question.response?.[0] ===
                                              option.option_value
                                                ? "border-indigo-600 bg-indigo-600 ring-2 ring-indigo-600/25 dark:border-indigo-500 dark:bg-indigo-500"
                                                : "border-gray-300 dark:border-gray-600"
                                            } flex items-center justify-center`}
                                          >
                                            {question.response?.[0] ===
                                              option.option_value && (
                                              <div className="h-2 w-2 rounded-full bg-white"></div>
                                            )}
                                          </div>
                                          <input
                                            type="radio"
                                            name={`question_${question.question_id}`}
                                            value={option.option_value}
                                            checked={
                                              question.response?.[0] ===
                                              option.option_value
                                            }
                                            onChange={(e) =>
                                              handleMultipleChoiceChange(
                                                activeSectionIndex,
                                                questionIndex,
                                                e.target.value
                                              )
                                            }
                                            className="sr-only"
                                          />
                                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 sm:text-base">
                                            {option.option_value}
                                          </span>
                                        </motion.label>
                                      ))}
                                    </AnimatePresence>
                                    {question.question_required &&
                                      (!question.response ||
                                        !question.response[0]) && (
                                        <div className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                          <AlertCircle className="h-4 w-4" />
                                          <span>Please select an option</span>
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )
                        )}
                      </AnimatePresence>
                      <div ref={questionsEndRef} />
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white py-12 dark:border-gray-700 dark:bg-gray-800 sm:py-16"
                    >
                      <div className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 p-3 shadow-lg dark:from-indigo-500 dark:to-blue-400 sm:p-4">
                        <Lightbulb className="h-8 w-8 text-white sm:h-12 sm:w-12" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white sm:mt-6 sm:text-xl">
                        No questions yet
                      </h3>
                      <p className="mt-2 max-w-md text-center text-sm text-gray-500 dark:text-gray-400 sm:text-base">
                        Get started by adding your first question to this
                        section. Questions will appear here and can be
                        customized.
                      </p>
                      <button
                        onClick={() => addNewQuestion(activeSectionIndex)}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:from-indigo-700 hover:to-blue-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:from-indigo-500 dark:to-blue-400 sm:mt-6 sm:w-auto"
                      >
                        <Add className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Add Question
                      </button>
                    </motion.div>
                  )}

                  {/* Desktop Navigation Buttons */}
                  <div className="mt-6 hidden justify-between border-t border-gray-200 pt-6 dark:border-gray-700 sm:mt-8 sm:flex">
                    <button
                      onClick={handlePreviousSection}
                      disabled={activeSectionIndex === 0}
                      className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        activeSectionIndex === 0
                          ? "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          : "bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 focus:ring-blue-500 dark:from-indigo-500 dark:to-blue-400"
                      }`}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous Section
                    </button>
                    <button
                      onClick={handleNextSection}
                      disabled={activeSectionIndex === sections.length - 1}
                      className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        activeSectionIndex === sections.length - 1
                          ? "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          : "bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:from-indigo-700 hover:to-blue-600 focus:ring-blue-500 dark:from-indigo-500 dark:to-blue-400"
                      }`}
                    >
                      Next Section
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Sticky Navigation */}
        {!isProcessing && (
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-darkSidebarBackground sm:hidden">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handlePreviousSection}
                disabled={activeSectionIndex === 0}
                className={`inline-flex flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  activeSectionIndex === 0
                    ? "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    : "bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md hover:from-indigo-700 hover:to-blue-600 focus:ring-blue-500 dark:from-indigo-500 dark:to-blue-400"
                }`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </button>

              <div className="flex items-center rounded-full bg-gray-100 px-3 py-2 dark:bg-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {activeSectionIndex + 1} / {sections.length}
                </span>
              </div>

              <button
                onClick={handleNextSection}
                disabled={activeSectionIndex === sections.length - 1}
                className={`inline-flex flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  activeSectionIndex === sections.length - 1
                    ? "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    : "bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md hover:from-indigo-700 hover:to-blue-600 focus:ring-blue-500 dark:from-indigo-500 dark:to-blue-400"
                }`}
              >
                Next
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
export default UpdateAiAssessment;
