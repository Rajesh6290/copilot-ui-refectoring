"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { CircularProgress } from "@mui/material";
import moment from "moment";
import { useState } from "react";
import { toast } from "sonner";
import SurveyQuestionReview from "../survey/SurveyQuestionReview";

interface SurveyLibrary extends Record<string, unknown> {
  survey_name: string;
  subject_type: string;
  created_at: string;
  survey_id: string;
  is_in_survey_collection: boolean;
  doc_id: string;
}

const SurveyLibrary = ({ applicationId }: { applicationId: string }) => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data, isValidating, mutate } = useSwr(
    `survey-templates?page=${page + 1}&limit=${pageSize}&status=published`
  );
  const [surveyId, setSurveyId] = useState<{
    surveyId: string;
    surveyName: string;
    docId: string;
  }>({
    surveyId: "",
    surveyName: "",
    docId: ""
  });
  const AddToSurveyRegister = ({ row }: { row: SurveyLibrary }) => {
    const { isLoading, mutation } = useMutation();
    const handleAdd = async () => {
      try {
        const res = await mutation(
          `survey/import/?survey_id=${row?.survey_id}&tenant_id=T-12345678&client_id=C-12345678&subject_id=${applicationId}`,
          {
            method: "POST",
            isAlert: false
          }
        );
        if (res?.status === 201) {
          mutate();
          toast.success("Survey added to register");
        } else {
          toast.error("Failed to add survey to register");
        }
      } catch (error) {
        toast.error(error instanceof Error);
      }
    };
    return isLoading ? (
      <CircularProgress size={15} />
    ) : (
      <div
        tabIndex={0}
        role="button"
        onClick={handleAdd}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (handleAdd) {
              handleAdd();
            }
          }
        }}
        className={`cursor-pointer rounded border px-4 py-2 font-semibold ${
          row?.is_in_survey_collection
            ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            : "text-gray-700 dark:text-white"
        }`}
      >
        {row?.is_in_survey_collection ? "Already Added" : "Add"}
      </div>
    );
  };
  return (
    <>
      <SurveyQuestionReview
        open={open}
        setOpen={() => setOpen(!open)}
        surveyId={surveyId}
      />
      <CustomTable<SurveyLibrary>
        columns={[
          {
            field: "name",
            title: "Name",
            sortable: true,
            filterable: true,
            render: (row: SurveyLibrary) => (
              <span className="font-medium capitalize">
                {row?.survey_name ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "type",
            title: "Subject Type",
            sortable: true,
            filterable: true,
            render: (row: SurveyLibrary) => (
              <span className="capitalize">
                {row?.subject_type ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "created_at",
            title: "Created At",
            sortable: true,
            filterable: true,
            render: (row: SurveyLibrary) => (
              <span className="capitalize">
                {moment(row?.created_at).format("ll") ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "add_to_register",
            title: "Add To Register",
            sortable: true,
            filterable: true,
            render: (row: SurveyLibrary) => (
              <div className="flex w-full items-center justify-center">
                <AddToSurveyRegister row={row} />
              </div>
            )
          }
        ]}
        data={data && data?.templates?.length > 0 ? data?.templates : []}
        actions={[
          {
            icon: (row: SurveyLibrary) => (
              <div className="flex w-full items-center justify-center">
                <div className="w-fit">
                  <CustomButton
                    onClick={() => {
                      setSurveyId({
                        surveyId: row.survey_id,
                        surveyName: row.survey_name,
                        docId: row.doc_id
                      });
                      setOpen(true);
                    }}
                    className="w-fit !text-[0.7rem] !uppercase"
                  >
                    VIEW
                  </CustomButton>
                </div>
              </div>
            ),
            tooltip: "View",
            onClick: (row: SurveyLibrary) => {
              setSurveyId({
                surveyId: row.survey_id,
                surveyName: row.survey_name,
                docId: row.doc_id
              });
              setOpen(true);
            }
          }
        ]}
        isLoading={isValidating}
        page={page}
        pageSize={pageSize}
        totalCount={data?.pagination?.total_records}
        onPageChange={setPage}
        onRowsPerPageChange={setPageSize}
        title="Survey Libray Details"
        selection={false}
        filtering={false}
        customToolbar={<></>}
        localization={{
          header: {
            actions: "Review"
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
    </>
  );
};
export default SurveyLibrary;
