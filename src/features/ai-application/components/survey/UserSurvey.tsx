"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useSwr from "@/shared/hooks/useSwr";
import moment from "moment";
import { useRouter } from "nextjs-toploader/app";
interface Survey extends Record<string, unknown> {
  doc_id: string;
  survey_id: string;
  title: string;
  subject_type: string;
  updated_at: string;
  survey_status: string;
}
const UserSurvey = () => {
  const { data, isValidating } = useSwr("user-surveys");
  const router = useRouter();
  return (
    <div className="w-full pt-3">
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
            field: "created_at",
            title: "Shared Date",
            sortable: true,
            filterable: true,
            render: (row: Survey) => (
              <span className="capitalize">
                {moment(row?.updated_at).format("lll") ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "status",
            title: "Status",
            sortable: true,
            filterable: true,
            render: (row: Survey) => (
              <span className="capitalize">
                {row?.survey_status ?? "Not Provided"}
              </span>
            )
          },
          {
            field: "view",
            title: "View",
            sortable: true,
            filterable: true,
            render: (row: Survey) => (
              <div className="flex w-full items-center justify-center">
                <div className="w-fit">
                  <CustomButton
                    onClick={() =>
                      router.push(
                        `/ai-application/survey/view/${row?.doc_id}?survey_id=${row?.survey_id}&_name=${row?.title}`
                      )
                    }
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
        isLoading={isValidating}
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
          pagination: false
        }}
        className="flex-1"
      />
    </div>
  );
};

export default UserSurvey;
