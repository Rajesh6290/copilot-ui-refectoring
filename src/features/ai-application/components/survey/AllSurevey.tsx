"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useSwr from "@/shared/hooks/useSwr";
import { Edit2 } from "lucide-react";
import moment from "moment";
import dynamic from "next/dynamic";
import { useRouter } from "nextjs-toploader/app";
import { Dispatch, SetStateAction, useState } from "react";
const NewSurveyForm = dynamic(() => import("./NewSurveyForm"), {
  ssr: false
});
const SurveyQuestionReview = dynamic(() => import("./SurveyQuestionReview"), {
  ssr: false
});

interface Surevey extends Record<string, unknown> {
  doc_id: string;
  title: string;
  subject_type: string;
  created_at: string;
}

const AllSurevey = ({
  isCreateFormOpen,
  setIsCreateFormOpen
}: {
  isCreateFormOpen: boolean;
  setIsCreateFormOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data, isValidating, mutate } = useSwr(
    `surveys?page=${page + 1}&limit=${pageSize}`
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
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="h-fit w-full">
      <NewSurveyForm
        open={isCreateFormOpen}
        close={() => setIsCreateFormOpen(!isCreateFormOpen)}
        mutate={mutate}
      />
      <SurveyQuestionReview
        open={open}
        setOpen={() => setOpen(!open)}
        surveyId={surveyId}
      />
      <CustomTable<Surevey>
        columns={[
          {
            field: "name",
            title: "Name",
            sortable: true,
            filterable: true,
            render: (row: Surevey) => (
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
            render: (row: Surevey) => (
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
            render: (row: Surevey) => (
              <span className="capitalize">
                {moment(row?.created_at).format("ll") ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "view",
            title: "View",
            sortable: true,
            filterable: true,
            render: (row: Surevey) => (
              <div className="flex w-full items-center justify-center">
                <div className="w-fit">
                  <CustomButton
                    onClick={() => {
                      setSurveyId({
                        surveyId: row.doc_id,
                        surveyName: row.title,
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
            )
          }
        ]}
        data={data && data?.surveys?.length > 0 ? data?.surveys : []}
        actions={[
          {
            icon: <Edit2 className="h-5 w-5 text-green-600" />,
            tooltip: "Edit",
            onClick: (row: Surevey) =>
              router.push(
                `/ai-application/survey/build/${row.doc_id}?_name=${row.title}`
              )
          }
        ]}
        isLoading={isValidating}
        page={page}
        pageSize={pageSize}
        totalCount={data?.pagination?.total_records}
        onPageChange={setPage}
        onRowsPerPageChange={setPageSize}
        title="Survey Details"
        selection={false}
        filtering={false}
        customToolbar={<></>}
        localization={{
          header: {
            actions: "Modify"
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
  );
};

export default AllSurevey;
