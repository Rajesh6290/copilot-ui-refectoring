"use client";
import { CircularProgress } from "@mui/material";
import {
  Field,
  FieldArray,
  Form,
  Formik,
  FormikTouched,
  FormikErrors
} from "formik";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader,
  Save
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import * as Yup from "yup";
import { useUser } from "@clerk/nextjs";
import usePermission from "@/shared/hooks/usePermission";
import useSwr from "@/shared/hooks/useSwr";
import useMutation from "@/shared/hooks/useMutation";

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
  option_value: string;
  option_id?: string;
}

interface Question {
  question_type: FieldType;
  question_text: string;
  question_required: boolean;
  question_id?: string;
  options?: Option[];
  placeholder?: string;
  description?: string;
  response?: string[];
}

interface Section {
  section_name?: string;
  section_title: string;
  section_id?: string;
  questions: Question[];
}

interface SurveyData {
  title?: string;
  survey_name?: string;
  description?: string;
  domain?: string;
  subject_type?: string;
  sections: Section[];
}

interface FormValues {
  [key: string]: string | string[] | File | undefined;
}

interface FixedBottomButtonsProps {
  draftLoading: boolean;
  isLoading: boolean;
  handleSaveDraft: (values: FormValues) => void;
  values: FormValues;
}

interface QuestionInputProps {
  question: Question;
  touched: FormikTouched<FormValues>;
  errors: FormikErrors<FormValues>;
  setFieldValue: (field: string, value: unknown) => void;
  values: FormValues;
}

interface SectionProps {
  section: Section;
  expandedSections: string[];
  toggleSection: (sectionName: string) => void;
  touched: FormikTouched<FormValues>;
  errors: FormikErrors<FormValues>;
  setFieldValue: (field: string, value: unknown) => void;
  values: FormValues;
}

const buildValidationSchema = (sections: Section[]) => {
  const schema: Record<
    string,
    | Yup.StringSchema
    | Yup.NumberSchema
    | Yup.DateSchema
    | Yup.ArraySchema<string[], Yup.AnyObject>
  > = {};

  sections?.forEach((section) => {
    section?.questions?.forEach((question) => {
      if (question?.question_required) {
        let fieldSchema:
          | Yup.StringSchema
          | Yup.NumberSchema
          | Yup.DateSchema
          | Yup.ArraySchema<string[], Yup.AnyObject>;
        switch (question?.question_type) {
          case "email":
            fieldSchema = Yup.string()
              .email("Please enter a valid email address")
              .required("This field is required");
            break;
          case "phone":
            fieldSchema = Yup.string()
              .matches(
                /^[0-9]{10}$/,
                "Please enter a valid 10-digit phone number"
              )
              .required("This field is required");
            break;
          case "number":
            fieldSchema = Yup.number().required("This field is required");
            break;
          case "date":
            fieldSchema = Yup.date().required("This field is required");
            break;
          case "checkbox":
          case "multipleselect":
            fieldSchema = Yup.array()
              .min(1, "Select at least one option")
              .required("This field is required");
            break;
          default:
            fieldSchema = Yup.string().required("This field is required");
        }
        schema[question.question_text] = fieldSchema;
      }
    });
  });

  return Yup.object().shape(schema);
};
const FixedBottomButtons = React.memo(
  ({
    draftLoading,
    isLoading,
    handleSaveDraft,
    values
  }: FixedBottomButtonsProps) => (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-darkSidebarBackground">
      <div className="mx-auto flex max-w-3xl justify-between gap-4">
        <button
          type="button"
          onClick={() => handleSaveDraft(values)}
          disabled={draftLoading}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-100 px-6 py-3 text-gray-800 transition-colors hover:bg-gray-200"
        >
          {draftLoading ? (
            <CircularProgress size={15} />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Save Draft
        </button>
        <button
          type="submit"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-tertiary-500 px-6 py-3 text-white transition-colors hover:bg-tertiary-600"
        >
          {isLoading ? (
            <CircularProgress size={15} />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          Submit
        </button>
      </div>
    </div>
  )
);
FixedBottomButtons.displayName = "FixedBottomButtons";
const QuestionInput = React.memo(
  ({
    question,
    touched,
    errors,
    setFieldValue,
    values
  }: QuestionInputProps) => {
    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          setFieldValue(question.question_text, e.target.files[0]);
        }
      },
      [setFieldValue, question.question_text]
    );

    return (
      <div className="space-y-2">
        <label className="block text-lg font-medium capitalize text-gray-900 dark:text-white">
          {question.question_text}
          {question.question_required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>

        {question.question_type === "text" ||
        question.question_type === "email" ||
        question.question_type === "phone" ||
        question.question_type === "number" ? (
          <Field
            type={question.question_type}
            name={question.question_text}
            placeholder={question.placeholder}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 dark:border-neutral-600"
          />
        ) : question.question_type === "textarea" ? (
          <Field
            as="textarea"
            name={question.question_text}
            placeholder={question.placeholder}
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 dark:border-neutral-600"
          />
        ) : question.question_type === "date" ? (
          <Field
            type="date"
            name={question.question_text}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 dark:border-neutral-600"
          />
        ) : question.question_type === "select" ? (
          <Field
            as="select"
            name={question.question_text}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 dark:border-neutral-600"
          >
            <option value="">Select an option</option>
            {question.options?.map((option: Option) => (
              <option key={option.option_value} value={option.option_value}>
                {option.option_value}
              </option>
            ))}
          </Field>
        ) : question.question_type === "radio" ? (
          <div className="space-y-3">
            {question.options?.map((option: Option) => (
              <label
                key={option.option_value}
                className="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition-colors dark:border-neutral-600"
              >
                <Field
                  type="radio"
                  name={question.question_text}
                  value={option.option_value}
                  className="h-4 w-4 border-gray-300 text-red-600 outline-none dark:border-neutral-600"
                />
                <span className="ml-3 text-gray-700 dark:text-white">
                  {option.option_value}
                </span>
              </label>
            ))}
          </div>
        ) : question.question_type === "checkbox" ? (
          <div className="space-y-3">
            {question.options?.map((option: Option) => (
              <label
                key={option.option_value}
                className="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition-colors dark:border-neutral-600"
              >
                <Field
                  type="checkbox"
                  name={question.question_text}
                  value={option.option_value}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 outline-none dark:border-neutral-600"
                />
                <span className="ml-3 text-gray-700">
                  {option.option_value}
                </span>
              </label>
            ))}
          </div>
        ) : question.question_type === "multipleselect" ? (
          <FieldArray
            name={question.question_text}
            render={(arrayHelpers) => (
              <div className="space-y-3">
                {question.options?.map((option: Option) => (
                  <label
                    key={option.option_value}
                    className="flex cursor-pointer items-center rounded-lg border border-gray-200 p-3 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(values[question.question_text]) &&
                        (values[question.question_text] as string[])?.includes(
                          option.option_value
                        )
                      }
                      onChange={(e) => {
                        const currentValue = values[question.question_text];
                        if (!Array.isArray(currentValue)) {
                          return;
                        }

                        if (e.target.checked) {
                          arrayHelpers.push(option.option_value);
                        } else {
                          const idx = (currentValue as string[]).indexOf(
                            option.option_value
                          );
                          if (idx !== -1) {
                            arrayHelpers.remove(idx);
                          }
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 dark:border-neutral-600"
                    />
                    <span className="ml-3 text-gray-700 dark:text-white">
                      {option.option_value}
                    </span>
                  </label>
                ))}
              </div>
            )}
          />
        ) : question.question_type === "file" ? (
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2"
          />
        ) : null}

        {touched[question.question_text] && errors[question.question_text] && (
          <div className="mt-1 flex items-center text-sm text-red-600">
            <AlertCircle className="mr-1 h-4 w-4" />
            <span>{"Required"}</span>
          </div>
        )}
      </div>
    );
  }
);
QuestionInput.displayName = "QuestionInput";
const Section = React.memo(
  ({
    section,
    expandedSections,
    toggleSection,
    touched,
    errors,
    setFieldValue,
    values
  }: SectionProps) => (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-darkMainBackground">
      <button
        type="button"
        onClick={() => toggleSection(section.section_title)}
        className="flex w-full items-center justify-between bg-tertiary px-6 py-4 transition-all duration-300"
      >
        <div className="text-left">
          <h2 className="text-xl font-semibold text-white">
            {section.section_title}
          </h2>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-white transition-transform duration-200 ${
            expandedSections.includes(section.section_title) ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ${
          expandedSections.includes(section.section_title)
            ? "max-h-fit opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="border-t border-gray-200 p-6 dark:border-neutral-800">
          <div className="space-y-6">
            {section.questions.map((question: Question) => (
              <QuestionInput
                key={question.question_text}
                question={question}
                touched={touched}
                errors={errors}
                setFieldValue={setFieldValue}
                values={values}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
);
Section.displayName = "Section";

const SurveyView: React.FC = () => {
  const param = useParams();
  const paramId = param["id"] as string;
  const survey_id = useSearchParams().get("survey_id");
  const { user } = useUser();
  const { user: currentUser } = usePermission();
  const { data, isValidating, mutate } = useSwr(
    `survey?doc_id=${paramId}&survey_status=published`
  ) as { data: SurveyData; isValidating: boolean; mutate: () => void };
  const {
    data: draftedResponse,
    isValidating: draftedValidation,
    mutate: draftMutate
  } = useSwr(`survey-response?survey_id=${survey_id}`);
  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);
  const { isLoading: draftLoading, mutation: draftMutation } = useMutation();
  const { isLoading, mutation } = useMutation();

  useEffect(() => {
    if (data?.sections && data.sections[0]?.section_title) {
      setExpandedSections([data.sections[0].section_title]); // Open the first section by default
    }
  }, [data]);

  const toggleSection = useCallback((sectionName: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionName) ? [] : [sectionName]
    );
  }, []);

  const initialValues = useMemo((): FormValues => {
    const values: FormValues = {};

    data?.sections?.forEach((section: Section) => {
      section.questions.forEach((question: Question) => {
        if (
          question.question_type === "checkbox" ||
          question.question_type === "multipleselect"
        ) {
          values[question.question_text] = [];
        } else {
          values[question.question_text] = "";
        }
      });
    });

    if (draftedResponse && draftedResponse?.sections) {
      draftedResponse?.sections?.forEach((section: Section) => {
        section.questions.forEach((question: Question) => {
          if (question.response) {
            values[question.question_text] = question.response[0] || "";
          }
        });
      });
    }

    return values;
  }, [data, draftedResponse]);

  const validationSchema = useMemo(
    () => buildValidationSchema(data?.sections),
    [data?.sections]
  );

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      try {
        const sections = data?.sections.map((section: Section) => ({
          section_title: section.section_title,
          section_id: section.section_id,
          questions: section.questions.map((question: Question) => ({
            question_id: question.question_id,
            question_type: question.question_type,
            question_text: question.question_text,
            question_required: question.question_required,
            options: question.options?.map((option: Option) => ({
              option_value: option.option_value,
              option_id: option.option_id
            })),
            expected_answer: [],
            response: Array.isArray(values[question.question_text])
              ? []
              : [String(values[question.question_text] || "")]
          }))
        }));

        const res = await mutation(`survey-response?survey_id=${survey_id}`, {
          method: "PUT",
          isAlert: false,
          body: {
            survey_id: survey_id,
            user_id: currentUser?.user_id,
            user_name: user?.fullName,
            survey_name: data?.survey_name,
            domain: data?.domain,
            subject_type: data?.subject_type,
            sections,
            response_status: "submitted"
          }
        });

        if (res?.status === 201) {
          toast.success("Survey submitted successfully");
          mutate();
          draftMutate();
        } else if (res?.status === 200) {
          toast.success("Survey submitted successfully");
          mutate();
          draftMutate();
        } else {
          toast.error("Failed to submit survey");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    },
    [
      data,
      mutation,
      mutate,
      draftMutate,
      currentUser?.user_id,
      user?.fullName,
      survey_id
    ]
  );

  const handleSaveDraft = useCallback(
    async (values: FormValues) => {
      try {
        const sections = data?.sections.map((section: Section) => ({
          section_title: section.section_title,
          section_id: section.section_id,
          questions: section.questions.map((question: Question) => ({
            question_id: question.question_id,
            question_type: question.question_type,
            question_text: question.question_text,
            question_required: question.question_required,
            options: question.options?.map((option: Option) => ({
              option_value: option.option_value,
              option_id: option.option_id
            })),
            expected_answer: [],
            response: Array.isArray(values[question.question_text])
              ? (values[question.question_text] as string[])
              : [String(values[question.question_text] || "")]
          }))
        }));

        const res = await draftMutation(
          `survey-response?survey_id=${survey_id}`,
          {
            method: "PUT",
            isAlert: false,
            body: {
              survey_id: survey_id,
              user_id: currentUser?.user_id,
              user_name: user?.fullName,
              survey_name: data?.survey_name,
              domain: data?.domain,
              subject_type: data?.subject_type,
              sections,
              response_status: "draft"
            }
          }
        );

        if (res?.status === 201) {
          toast.success("Draft saved successfully");
          mutate();
          draftMutate();
        } else if (res?.status === 200) {
          toast.success("Survey submitted successfully");
          mutate();
          draftMutate();
        } else {
          toast.error("Failed to save draft");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "An error occurred"
        );
      }
    },
    [
      data,
      draftMutation,
      mutate,
      draftMutate,
      currentUser?.user_id,
      user?.fullName,
      survey_id
    ]
  );

  if (isValidating || !data || draftedValidation) {
    return <Loader />;
  }

  return (
    <div className="relative h-fit min-h-dvh w-full overflow-y-auto bg-white dark:bg-darkSidebarBackground">
      <div className="fixed left-0 top-0 h-32 w-32 -translate-x-16 -translate-y-16 rotate-45 transform bg-red-500 opacity-20 dark:opacity-50"></div>
      <div className="fixed bottom-0 right-0 h-48 w-48 translate-x-24 translate-y-24 rotate-45 transform bg-blue-500 opacity-20 dark:opacity-50"></div>

      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold capitalize text-gray-900 dark:text-white">
              {data?.title}
            </h1>
            {data?.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {data?.description}
              </p>
            )}
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, touched, errors }) => (
              <Form className="space-y-6">
                {data?.sections?.map((section: Section) => (
                  <Section
                    key={section.section_title}
                    section={section}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                    touched={touched}
                    errors={errors}
                    setFieldValue={setFieldValue}
                    values={values}
                  />
                ))}

                <FixedBottomButtons
                  draftLoading={draftLoading}
                  isLoading={isLoading}
                  handleSaveDraft={handleSaveDraft}
                  values={values}
                />
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default SurveyView;
