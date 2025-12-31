"use client";
import Empty from "@/shared/core/Empty";
import useSwr from "@/shared/hooks/useSwr";
import CloseIcon from "@mui/icons-material/Close";
import { DialogContent, DialogTitle } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import { Field, FieldArray, Form, Formik, FormikErrors } from "formik";
import { AlertCircle } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import * as Yup from "yup";
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
}

interface Question {
  question_type: FieldType;
  question_text: string;
  question_required: boolean;
  options?: Option[];
  placeholder?: string;
  description?: string;
}

interface Section {
  section_name: string;
  questions: Question[];
}

interface SurveySection {
  section_title: string;
  questions: {
    question_type: string;
    question_text: string;
    question_required: boolean;
    options?: {
      option_value: string;
    }[];
    placeholder?: string;
    description?: string;
  }[];
}

interface QuestionInputProps {
  question: Question;
  touched: Record<string, boolean | undefined>;
  errors: FormikErrors<Record<string, unknown>>;
  setFieldValue: (field: string, value: unknown) => void;
  values: { [key: string]: unknown };
}

interface SectionProps {
  section: Section;
  touched: Record<string, boolean | undefined>;
  errors: FormikErrors<Record<string, unknown>>;
  setFieldValue: (field: string, value: unknown) => void;
  values: { [key: string]: unknown };
}

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
            disabled
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 dark:border-neutral-600"
          />
        ) : question.question_type === "textarea" ? (
          <Field
            as="textarea"
            name={question.question_text}
            placeholder={question.placeholder}
            disabled
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 dark:border-neutral-600"
          />
        ) : question.question_type === "date" ? (
          <Field
            type="date"
            name={question.question_text}
            disabled
            className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-transparent focus:ring-2 dark:border-neutral-600"
          />
        ) : question.question_type === "select" ? (
          <Field
            as="select"
            name={question.question_text}
            disabled
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
                  disabled
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
                  disabled
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
                        (values[question.question_text] as string[]).includes(
                          option.option_value
                        )
                      }
                      disabled
                      onChange={(e) => {
                        if (e.target.checked) {
                          arrayHelpers.push(option.option_value);
                        } else {
                          const idx = Array.isArray(
                            values[question.question_text]
                          )
                            ? (
                                values[question.question_text] as string[]
                              ).indexOf(option.option_value)
                            : -1;
                          if (idx > -1) {
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
            disabled
            className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-transparent focus:ring-2"
          />
        ) : null}

        {touched[question.question_text] === true &&
          errors[question.question_text] && (
            <div className="mt-1 flex items-center text-sm text-red-600">
              <AlertCircle className="mr-1 h-4 w-4" />
              <span>Required</span>
            </div>
          )}
      </div>
    );
  }
);
QuestionInput.displayName = "QuestionInput";
const Section = React.memo(
  ({ section, touched, errors, setFieldValue, values }: SectionProps) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {section.section_name}
      </h2>
      <div className="space-y-6">
        {section.questions.map(
          (question: {
            question_type: FieldType;
            question_text: string;
            question_required: boolean;
            options?: Option[];
            placeholder?: string;
            description?: string;
          }) => (
            <QuestionInput
              key={question.question_text}
              question={question}
              touched={touched}
              errors={errors}
              setFieldValue={setFieldValue}
              values={values}
            />
          )
        )}
      </div>
    </div>
  )
);
Section.displayName = "Section";

const buildValidationSchema = (sections: Section[]) => {
  const schema: Record<string, Yup.AnySchema> = {};

  sections?.forEach((section) => {
    section?.questions?.forEach((question) => {
      if (question?.question_required) {
        let fieldSchema;
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
const SurveyQuestionReview = ({
  surveyId,
  open,
  setOpen
}: {
  surveyId: { surveyId: string; docId: string; surveyName: string };
  open: boolean;
  setOpen: () => void;
}) => {
  const { data, isValidating } = useSwr(
    surveyId?.docId ? `survey?doc_id=${surveyId.docId}` : null
  );
  const [selectedSection, setSelectedSection] = React.useState<string | null>(
    null
  );
  const router = useRouter();
  useEffect(() => {
    if (data?.sections) {
      setSelectedSection(data?.sections[0]?.section_title); // Select the first section by default
    }
  }, [data]);

  const initialValues = useMemo(() => {
    const values: Record<string, unknown> = {};

    data?.sections?.forEach(
      (section: {
        section_title: string;
        questions: {
          question_type: string;
          question_text: string;
          question_required: boolean;
          options?: {
            option_value: string;
          }[];
          placeholder?: string;
          description?: string;
        }[];
      }) => {
        section.questions.forEach(
          (question: {
            question_type: string;
            question_text: string;
            question_required: boolean;
            options?: {
              option_value: string;
            }[];
            placeholder?: string;
            description?: string;
          }) => {
            if (
              question.question_type === "checkbox" ||
              question.question_type === "multipleselect"
            ) {
              values[question.question_text] = [];
            } else {
              values[question.question_text] = "";
            }
          }
        );
      }
    );

    return values;
  }, [data]);

  const validationSchema = React.useMemo(
    () => buildValidationSchema(data?.sections),
    [data?.sections]
  );

  const handleSubmit = () => {};

  return (
    <Dialog
      open={open}
      onClose={setOpen}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        style: {
          height: "90vh",
          maxHeight: "90vh",
          borderRadius: 5,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }
      }}
    >
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
        className="border-gray-200 bg-white dark:border-neutral-700 dark:bg-darkMainBackground"
      >
        <div className="flex flex-col gap-0">
          <p className="font-satoshi text-2xl font-semibold text-gray-800 dark:text-white">
            {" "}
            {data?.title}
          </p>
          <p className="font-satoshi text-base font-medium text-gray-600 dark:text-gray-400">
            {" "}
            {data?.description}
          </p>
        </div>
        <IconButton
          edge="end"
          onClick={setOpen}
          aria-label="close"
          className="dark:!text-white"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent
        sx={{
          flex: 1,
          overflow: "hidden",
          padding: 0,
          display: "flex",
          flexDirection: "column"
        }}
        className="border-t dark:border-neutral-700"
      >
        {isValidating ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          </div>
        ) : data?.sections?.length > 0 ? (
          <div className="flex flex-1 overflow-hidden dark:bg-darkMainBackground">
            {/* Left Sidebar - Fixed */}
            <div className="w-1/3 overflow-y-auto border-r border-gray-200 bg-gray-50 dark:border-neutral-700 dark:bg-darkMainBackground">
              <div className="sticky top-0 p-4">
                <div className="space-y-2">
                  {data?.sections?.map((section: SurveySection) => (
                    <button
                      key={section.section_title}
                      onClick={() => setSelectedSection(section.section_title)}
                      className={`w-full rounded-lg p-4 text-left ${
                        selectedSection === section.section_title
                          ? "bg-tertiary-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {section.section_title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Scrollable */}
            <div className="w-2/3 overflow-y-auto">
              <div className="p-6">
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, setFieldValue, touched, errors }) => (
                    <Form className="space-y-6">
                      {data?.sections
                        ?.filter(
                          (section: SurveySection) =>
                            section.section_title === selectedSection
                        )
                        .map((section: SurveySection) => (
                          <Section
                            key={section.section_title}
                            section={{
                              section_name: section.section_title,
                              questions: section.questions.map((q) => ({
                                ...q,
                                question_type: q.question_type as FieldType
                              }))
                            }}
                            touched={touched}
                            errors={errors}
                            setFieldValue={setFieldValue}
                            values={values}
                          />
                        ))}
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex size-full items-center justify-center">
            <div className="w-fit">
              <Empty
                title="No Preview  Yet"
                subTitle="It looks like there are no survey sections and questions available. Stay tuned for future updates."
                pathName="Please Complete the Survey Draft !"
                link="#"
                onClick={() =>
                  router.push(
                    `/assets/survey/build/${surveyId?.docId}?_name=${data?.title}`
                  )
                }
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
export default SurveyQuestionReview;
