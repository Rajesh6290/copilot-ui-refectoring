"use client";
import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { useMyContext } from "@/shared/providers/AppProvider";
import { useCurrentMenuItem } from "@/shared/utils";
import { IconButton, Tooltip } from "@mui/material";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AccordionItem, { IsAccess } from "./AccordionItem";
import UpdateAiAssessment, { IsAccesss } from "./UpdateAiAssessment";

export interface Option {
  option_id: string;
  option_value: string;
}

export interface Question {
  question_id: string;
  question_type: "text" | "multiple_choice";
  question_text: string;
  question_required: boolean;
  options?: Option[];
  expected_answer?: string[];
  response?: string[];
  subquestions: unknown[];
  trigger_conditions: unknown[];
  is_client_added?: boolean;
}

export interface Section {
  section_id: string;
  section_title: string;
  questions: Question[];
  is_client_added?: boolean;
}
const AIAssessmentSkeleton = () => {
  return (
    <div className="w-full animate-pulse px-4 pt-6">
      <div className="mb-6 flex w-full items-center justify-between">
        <div className="h-7 w-64 rounded-md bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-10 w-28 rounded-md bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="mb-8 flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="h-6 w-48 rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-300 bg-tertiary/5 dark:border-neutral-600">
          <div className="border-b border-neutral-300 p-4 dark:border-neutral-600">
            <div className="flex items-center">
              <div className="mr-3 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-5 w-3/4 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
          <div className="border-b border-neutral-300 p-4 dark:border-neutral-600">
            <div className="flex items-center">
              <div className="mr-3 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-5 w-2/3 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center">
              <div className="mr-3 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-5 w-4/5 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="h-6 w-56 rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-300 bg-tertiary/5 dark:border-neutral-600">
          <div className="border-b border-neutral-300 p-4 dark:border-neutral-600">
            <div className="flex items-center">
              <div className="mr-3 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-5 w-4/5 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
          <div className="border-b border-neutral-300 p-4 dark:border-neutral-600">
            <div className="flex items-center">
              <div className="mr-3 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-5 w-1/2 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center">
              <div className="mr-3 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-5 w-3/4 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const AIAssessment = () => {
  const { data, mutate, isValidating } = useSwr(
    "survey-response?survey_id=SRVY-j9RO9xayW4ZxXuuK"
  );
  const [open, setOpen] = useState<boolean>(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };
  const currentAccess = useCurrentMenuItem();
  const { isLoading, mutation } = useMutation();
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const { setMetaTitle } = useMyContext();
  const handleResponseUpdate = async (
    questionId: string,
    newResponse: string
  ) => {
    try {
      const updatedSections = data.sections.map((section: Section) => ({
        ...section,
        questions: section.questions.map((question: Question) =>
          question.question_id === questionId
            ? {
                ...question,
                response: newResponse.length === 0 ? [] : [newResponse]
              }
            : question
        )
      }));

      const res = await mutation(
        "survey-response?survey_id=SRVY-j9RO9xayW4ZxXuuK",
        {
          method: "PUT",
          isAlert: false,
          body: {
            sections: updatedSections
          }
        }
      );

      if (res?.status === 201 || res?.status === 200) {
        mutate();
        // toast.success("Response updated successfully");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };
  useEffect(() => {
    if (data) {
      setIsInitialLoading(false); // Set to false once data is fetched
    }
  }, [data]);
  return (
    <div className="w-full px-2 pt-3 sm:px-4 sm:pt-6">
      <UpdateAiAssessment
        mutate={mutate}
        onClose={() => setOpen(false)}
        open={open}
        initialData={data?.sections || []}
        isAccess={currentAccess?.buttons?.[0] as IsAccesss}
      />
      {isInitialLoading && !data && isValidating ? (
        <AIAssessmentSkeleton />
      ) : (
        <div className="flex w-full flex-col gap-6">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                AI Assessments
              </p>
              <p className="text-base text-gray-500 dark:text-gray-400">
                Your answers may be shared with customers or investors to
                support procurement or compliance reviews.
              </p>
            </div>
            <div className="hidden w-fit sm:block">
              <CustomButton
                disabled={!currentAccess?.permission?.actions?.update}
                onClick={() => {
                  setOpen(true);
                  setMetaTitle("Customize Assessments | Cognitiveview");
                }}
                className="w-fit text-nowrap"
              >
                Customize Assessments
              </CustomButton>
            </div>
            <div className="block w-fit sm:hidden">
              <Tooltip title="Customize Assessments" arrow placement="left">
                <IconButton
                  className="!rounded-md !bg-tertiary"
                  onClick={() => {
                    setOpen(true);
                    setMetaTitle("Customize Assessments | Cognitiveview");
                  }}
                >
                  <Pencil className="h-5 w-5 text-white" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          {data?.sections?.map((item: Section, index: number) => (
            <div key={index} className="flex w-full flex-col gap-4">
              <div className="flex w-full items-center justify-between">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item?.section_title}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-300 bg-tertiary/5 dark:border-neutral-600">
                {item?.questions?.map((question: Question) => (
                  <AccordionItem
                    key={question?.question_id}
                    id={question?.question_id}
                    question={question?.question_text}
                    answer={question?.response?.[0] || ""}
                    isCompleted={question?.response?.[0] ? true : false}
                    isOpen={openItemId === question?.question_id}
                    toggle={() => toggleItem(question?.question_id)}
                    onUpdateResponse={handleResponseUpdate}
                    isLoading={isLoading}
                    isAccess={currentAccess?.buttons?.[0] as IsAccess}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAssessment;
