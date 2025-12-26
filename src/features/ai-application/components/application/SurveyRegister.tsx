"use client";
import useSwr from "@/shared/hooks/useSwr";
import { Share2 } from "lucide-react";
import { useState } from "react";
import Share from "../survey/Share";
import CustomTable from "@/shared/core/CustomTable";
import CustomButton from "@/shared/core/CustomButton";
import dynamic from "next/dynamic";
const SurveyResponse = dynamic(() => import("./SurveyResponse"), {
  ssr: false
});
const SurveyQuestionReview = dynamic(
  () => import("../survey/SurveyQuestionReview"),
  {
    ssr: false
  }
);
interface Survey extends Record<string, unknown> {
  survey_id: string;
  doc_id: string;
  survey_name: string;
  title: string;
  subject_type: string;
  created_by: string;
}
const SurveyRegister = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data, isValidating } = useSwr(
    `surveys?page=${page + 1}&limit=${pageSize}`
  );
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyId, setSurveyId] = useState<{
    surveyId: string;
    docId: string;
    surveyName: string;
  }>({ surveyId: "", docId: "", surveyName: "" });
  const [shareOpen, setShareOpen] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <>
      <SurveyQuestionReview
        open={open}
        setOpen={() => setOpen(!open)}
        surveyId={surveyId}
      />
      <SurveyResponse
        onClose={() => setSurveyOpen(!surveyOpen)}
        open={surveyOpen}
        surveyId={surveyId}
      />
      {/* <Share
        open={shareOpen}
        onClose={() => setShareOpen(!shareOpen)}
        item={surveyId}
      /> */}
      <Share open={shareOpen} onClose={() => setShareOpen(!shareOpen)} />
      <CustomTable<Survey>
        columns={[
          {
            field: "name",
            title: "Name",
            sortable: true,
            filterable: true,
            render: (row: Survey) => (
              <span className="font-medium capitalize">
                {row?.title ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "type",
            title: "Subject Type",
            sortable: true,
            filterable: true,
            render: (row: Survey) => (
              <span className="capitalize">
                {row?.subject_type ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "created_by",
            title: "Created",
            sortable: true,
            filterable: true,
            render: (row: Survey) => (
              <span className="capitalize">
                {row?.created_by ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "share",
            title: "Share",
            sortable: true,
            filterable: true,
            render: (row: Survey) => (
              <span className="flex w-full items-center justify-center capitalize">
                <Share2
                  onClick={() => {
                    setShareOpen(true);
                    setSurveyId({
                      surveyId: row.survey_id,
                      docId: row.doc_id,
                      surveyName: row.title
                    });
                  }}
                  size={20}
                  className="cursor-pointer text-tertiary"
                />
              </span>
            )
          },
          {
            field: "responses",
            title: "Responses",
            sortable: true,
            filterable: true,
            render: (row: Survey) => (
              <div className="flex w-full items-center justify-center">
                <div className="w-fit">
                  <CustomButton
                    onClick={() => {
                      setSurveyOpen(true);
                      setSurveyId({
                        surveyId: row.survey_id,
                        docId: row.doc_id,
                        surveyName: row.title
                      });
                    }}
                    className="w-fit !text-[0.7rem] !uppercase"
                  >
                    VIEW
                  </CustomButton>
                </div>
              </div>
            )
          }
        ]}
        data={data && data.surveys.length > 0 ? data.surveys : []}
        actions={[
          {
            icon: (row: Survey) => (
              <div className="flex w-full items-center justify-center">
                <div className="w-fit">
                  <CustomButton
                    onClick={() => {
                      setSurveyId({
                        surveyId: row.survey_id,
                        docId: row.doc_id,
                        surveyName: row.title
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
            onClick: (row: Survey) => {
              setSurveyId({
                surveyId: row.survey_id,
                docId: row.doc_id,
                surveyName: row.title
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
export default SurveyRegister;
