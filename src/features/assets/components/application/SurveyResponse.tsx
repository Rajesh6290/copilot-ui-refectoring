"use client";
import CustomTable from "@/shared/core/CustomTable";
import useSwr from "@/shared/hooks/useSwr";
import CloseIcon from "@mui/icons-material/Close";
import { DialogContent, DialogTitle } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import { Field, FieldArray, Form, Formik } from "formik";
import { AlertCircle, ChevronRight, Eye } from "lucide-react";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  section_title?: string;
  questions: Question[];
}

interface UserData {
  survey_id: string;
  user_id: string;
  doc_id: string;
}

interface DraftedResponse {
  sections: {
    questions: {
      response: string[];
      question_text: string;
    }[];
  }[];
}

interface SurveyRow extends Record<string, unknown> {
  survey_id: string;
  survey_name: string;
  user_name: string;
  response_status: string;
  user_id: string;
  doc_id: string;
}

interface FormikProps {
  values: Record<string, string | string[] | File>;
  setFieldValue: (field: string, value: string | string[] | File) => void;
  touched: Record<string, boolean | undefined>;
  errors: Record<string, string | undefined>;
}

interface QuestionInputProps extends FormikProps {
  question: Question;
}

interface SectionProps extends FormikProps {
  section: Section;
}
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
        if (e.target.files && e.target.files[0]) {
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
                      checked={(
                        values[question.question_text] as string[]
                      )?.includes(option.option_value)}
                      disabled
                      onChange={(e) => {
                        if (e.target.checked) {
                          arrayHelpers.push(option.option_value);
                        } else {
                          const currentValue = values[
                            question.question_text
                          ] as string[];
                          const idx = currentValue?.indexOf(
                            option.option_value
                          );
                          if (idx !== undefined && idx !== -1) {
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
  ({ section, touched, errors, setFieldValue, values }: SectionProps) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {section.section_name}
      </h2>
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
  )
);
Section.displayName = "Section";
const ViewResponseQuestions = ({
  userData,
  open,
  setOpen
}: {
  userData: UserData;
  open: boolean;
  setOpen: () => void;
}) => {
  const { data, isValidating } = useSwr(
    userData?.doc_id
      ? `survey?doc_id=${userData?.doc_id}&survey_status=published`
      : null
  );
  const { data: draftedResponse } = useSwr(
    userData?.survey_id
      ? `survey-response?survey_id=${userData?.survey_id}`
      : null
  );
  const [selectedSection, setSelectedSection] = React.useState<string | null>(
    null
  );

  // Set the first section when data is available
  useEffect(() => {
    if (data?.sections && !selectedSection) {
      setSelectedSection(data?.sections[0]?.section_title); // Select the first section by default
    }
  }, [data, selectedSection]);

  // Compute initialValues when data and draftedResponse are available
  const initialValues = useMemo(() => {
    if (!data || !data.sections) {
      return {};
    } // Return empty object if data isn't ready

    const values: Record<string, string | string[] | File> = {};
    data.sections.forEach((section: Section) => {
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
      draftedResponse?.sections?.forEach(
        (section: DraftedResponse["sections"][0]) => {
          section.questions.forEach(
            (question: DraftedResponse["sections"][0]["questions"][0]) => {
              if (question.response) {
                values[question.question_text] = question.response[0] || "";
              }
            }
          );
        }
      );
    }

    return values;
  }, [data, draftedResponse]);

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
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }
      }}
    >
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          borderBottom: "1px solid #e0e0e0",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div className="flex flex-col gap-0">
          <p className="font-satoshi text-2xl font-semibold text-gray-800">
            {" "}
            {data?.survey_name}
          </p>
          <p className="font-satoshi text-base font-medium text-gray-600">
            {" "}
            {data?.survey_description}
          </p>
        </div>
        <IconButton edge="end" onClick={setOpen} aria-label="close">
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
      >
        {isValidating ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Fixed */}
            <div className="w-1/3 overflow-y-auto border-r border-gray-200 bg-gray-50">
              <div className="sticky top-0 p-4">
                <div className="space-y-2">
                  {data?.sections?.map((section: Section) => (
                    <button
                      key={section.section_name}
                      onClick={() => setSelectedSection(section.section_name)}
                      className={`w-full rounded-lg p-4 text-left ${
                        selectedSection === section.section_name
                          ? "bg-tertiary-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {section.section_name}
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
                  enableReinitialize={true}
                >
                  {({ values, setFieldValue, touched, errors }) => (
                    <Form className="space-y-6">
                      {data?.sections
                        ?.filter(
                          (section: Section) =>
                            section.section_name === selectedSection
                        )
                        .map((section: Section) => (
                          <Section
                            key={section.section_name}
                            section={section}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

const SurveyResponse = ({
  open,
  onClose,
  surveyId
}: {
  open: boolean;
  onClose: () => void;
  surveyId: {
    surveyId: string;
    docId: string;
    surveyName: string;
  };
}) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data, isValidating } = useSwr(
    surveyId?.docId
      ? `survey-responses?page=${page + 1}&limit=${pageSize}&survey_id=${surveyId.docId}`
      : null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserdata] = useState<UserData | undefined>(undefined);

  return (
    <Dialog fullScreen open={open}>
      <div className="flex w-full items-center justify-between bg-tertiary p-3">
        <ViewResponseQuestions
          open={isOpen}
          setOpen={() => setIsOpen(!isOpen)}
          userData={userData!}
        />
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-gray-100">
            Survey Response
          </span>
          <ChevronRight className="h-4 w-4 text-gray-200" />
          <span className="text-gray-200 dark:text-gray-400">
            {surveyId?.surveyName}
          </span>
        </div>
        <IconButton onClick={onClose}>
          <CloseIcon className="text-white" />
        </IconButton>
      </div>
      <div className="size-full overflow-y-auto p-3">
        <CustomTable<SurveyRow>
          columns={[
            {
              field: "survey_id",
              title: "Survey ID",
              sortable: true,
              filterable: true,
              render: (row: SurveyRow) => (
                <span className="font-medium capitalize">
                  {row?.survey_id ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "name",
              title: "Name",
              sortable: true,
              filterable: true,
              render: (row: SurveyRow) => (
                <span className="font-medium capitalize">
                  {row?.survey_name ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "respondent",
              title: "Respondent",
              sortable: true,
              filterable: true,
              render: (row: SurveyRow) => (
                <span className="font-medium capitalize">
                  {row?.user_name ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "status",
              title: "Status",
              sortable: true,
              filterable: true,
              render: (row: SurveyRow) => (
                <span className="font-medium capitalize">
                  {row?.response_status ?? "0"}
                </span>
              )
            }
          ]}
          data={data && data?.responses?.length > 0 ? data?.responses : []}
          actions={[
            {
              icon: (row: SurveyRow) => (
                <Eye
                  onClick={() => {
                    setUserdata({
                      survey_id: row?.survey_id,
                      user_id: row?.user_id,
                      doc_id: row?.doc_id
                    });
                    setIsOpen(true);
                  }}
                  className="h-5 w-5 text-blue-600"
                />
              ),
              tooltip: "View",
              onClick: () => {}
            }
          ]}
          isLoading={isValidating}
          page={page}
          pageSize={pageSize}
          totalCount={data?.pagination?.total_records}
          onPageChange={setPage}
          onRowsPerPageChange={setPageSize}
          title="Survey Responses"
          selection={false}
          filtering={false}
          customToolbar={<></>}
          localization={{
            header: {
              actions: "View"
            }
          }}
          options={{
            toolbar: false,
            search: false,
            filtering: true,
            sorting: true,
            pagination: true
          }}
          className="flex-1"
        />
      </div>
    </Dialog>
  );
};
export default SurveyResponse;
