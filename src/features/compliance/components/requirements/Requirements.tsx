"use client";
import CustomTable from "@/shared/core/CustomTable";
import React, { useState } from "react";

interface RequirementData extends Record<string, unknown> {
  id: number;
  doc_id: number;
  requirement_name: string;
  description: string;
  category: string;
  framework: string;
  readiness_status: string;
  scope: string;
}
interface RequirementsProps {
  data: {
    requirements?: RequirementData[];
  };
}

const Requirements: React.FC<RequirementsProps> = ({ data }) => {
  const [tab, setTab] = useState<string>("Requirements");
  const requirementsColumns = [
    {
      field: "id",
      title: "ID",
      width: "80px"
    },
    {
      field: "requirement_name",
      title: "Requirement Name",
      minWidth: "300px"
    },
    {
      field: "requirement_description",
      title: "Requirement Description",
      minWidth: "300px",
      render: (row: RequirementData) => (
        <div className="flex w-full items-start justify-start text-wrap text-start">
          {row.description}
        </div>
      )
    },
    {
      field: "category",
      title: "Category"
    },
    {
      field: "framework",
      title: "Framework"
    }
  ];

  const tableOptions = {
    toolbar: false,
    search: false,
    pagination: true,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    sorting: true,
    export: false,
    responsive: true,
    padding: "normal" as const
  };

  return (
    <div className="flex size-full flex-col gap-2">
      <div className="flex flex-col gap-10">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 md:pl-5">
          {["Requirements"].map((item, index) => (
            <div
              tabIndex={0}
              role="button"
              key={index}
              onClick={() => setTab(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setTab(item);
                }
              }}
              className={`relative inline-flex cursor-pointer items-center whitespace-nowrap px-2 pb-2 align-baseline font-semibold text-gray-600 dark:text-gray-300 ${
                item === tab
                  ? "border-b-2 border-[#693EE0]"
                  : "border-b-2 border-transparent"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="w-full">
          {data && data.requirements && data.requirements.length > 0 ? (
            <CustomTable<RequirementData>
              columns={requirementsColumns}
              data={data?.requirements?.length > 0 ? data?.requirements : []}
              options={tableOptions}
              className="w-full"
              localization={{
                body: {
                  emptyDataSourceMessage: "No requirements found"
                },
                pagination: {
                  labelRowsSelect: "rows per page",
                  labelDisplayedRows: "{from}-{to} of {count}"
                }
              }}
            />
          ) : (
            <div className="flex w-full items-center justify-center p-8">
              <div className="max-w-2xl rounded-xl border border-tertiary-200 bg-gradient-to-br from-tertiary-50 to-indigo-50 p-8 shadow-lg dark:border-tertiary-700 dark:from-tertiary-900/30 dark:to-indigo-900/30">
                <div className="flex flex-col items-center gap-4 text-center">
                  {/* Icon */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-100 dark:bg-tertiary-800/50">
                    <svg
                      className="h-8 w-8 text-tertiary-600 dark:text-tertiary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    No Specific Requirement Linked
                  </h3>

                  {/* Message */}
                  <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    {` This control's primary purpose is to mitigate risk and is
                      not linked to a specific requirement.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requirements;
