"use client";
import CustomTable from "@/shared/core/CustomTable";
import useSwr from "@/shared/hooks/useSwr";
import { generateRandomColor } from "@/shared/utils";
import moment from "moment";
import { useState } from "react";
import AnswerQualityCard from "./AnswerQualityCard";
import CardChart from "./CardChart";
interface TableRow extends Record<string, unknown> {
  name: string;
  description: string;
}
const Graph = () => {
  const { data, isValidating } = useSwr("graph-data?client_id=rwe");
  const [isLatest, setIsLatest] = useState<boolean>(false);
  function calculateAverage(arr: number[]) {
    const sum = arr?.reduce((acc, num) => acc + num * 100, 0);
    const average = sum / arr?.length;

    return average;
  }
  return isValidating ? (
    <div className="flex h-[80vh] w-full items-center justify-center">
      {" "}
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  ) : (
    <div className="flex size-full flex-col gap-5 overflow-y-auto lg:p-4">
      <p className="font-satoshi text-xl font-semibold text-gray-700 dark:text-white">
        Generative AI quality
      </p>
      <p className="w-full font-satoshi text-sm font-medium text-neutral-400">
        The Generative AI quality evaluation calculates a variety of metrics
        based on the prompt template task type. Some metrics compare model
        output to reference output you provide. Other metrics analyze model
        input and output and do not require reference output.
      </p>

      <div className="relative mt-10 grid w-full grid-cols-1 items-center gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="absolute -top-8 right-0">
          <label className="inline-flex cursor-pointer items-center gap-5">
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Average
            </span>
            <input
              onChange={() => setIsLatest(!isLatest)}
              checked={isLatest}
              type="checkbox"
              value=""
              className="peer sr-only"
            />
            <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-tertiary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-tertiary-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-tertiary-600 dark:peer-focus:ring-tertiary-800 rtl:peer-checked:after:-translate-x-full"></div>
            <span className="-ml-1 text-sm font-medium text-gray-900 dark:text-gray-300">
              Latest
            </span>
          </label>
        </div>
        <CardChart
          title="Response Alignment Score"
          currentValue={Number(data?.response_alignment_score)}
          data={[0, 0]}
          color={generateRandomColor()}
        />

        <CardChart
          title="Detect PII"
          currentValue={
            isLatest
              ? data?.metrics?.detect_pii[
                  data?.metrics?.detect_pii?.length - 1
                ] * 100 || 0
              : calculateAverage(data?.metrics?.detect_pii) || 0
          }
          data={data?.metrics?.detect_pii?.map((value: number) => {
            return value * 100;
          })}
          color={generateRandomColor()}
        />
        <CardChart
          title="Response Declined"
          currentValue={
            isLatest
              ? data?.metrics?.is_declined[
                  data?.metrics?.is_declined?.length - 1
                ] * 100 || 0
              : calculateAverage(data?.metrics?.is_declined) || 0
          }
          data={data?.metrics?.is_declined?.map((value: number) => {
            return value * 100;
          })}
          color={generateRandomColor()}
        />
        <CardChart
          title="Context Relevance"
          currentValue={
            isLatest
              ? data?.metrics?.is_context_relevant[
                  data?.metrics?.is_context_relevant?.length - 1
                ] * 100 || 0
              : calculateAverage(data?.metrics?.is_context_relevant) || 0
          }
          data={data?.metrics?.is_context_relevant?.map((value: number) => {
            return value * 100;
          })}
          color={generateRandomColor()}
        />

        <CardChart
          title="Biased Content"
          currentValue={
            isLatest
              ? data?.metrics?.biased_content[
                  data?.metrics?.biased_content?.length - 1
                ] * 100 || 0
              : (calculateAverage(data?.metrics?.biased_content) as number) || 0
          }
          data={data?.metrics?.biased_content?.map((value: number) => {
            return value * 100;
          })}
          color={generateRandomColor()}
        />
        <CardChart
          title="Toxic Content"
          currentValue={
            isLatest
              ? data?.metrics?.toxic_content[
                  data?.metrics?.toxic_content?.length - 1
                ] * 100 || 0
              : calculateAverage(data?.metrics?.toxic_content) || 0
          }
          data={data?.metrics?.toxic_content?.map((value: number) => {
            return value * 100;
          })}
          color={generateRandomColor()}
        />

        <CardChart
          title="Negative Content"
          currentValue={
            isLatest
              ? data?.metrics?.negative_content[
                  data?.metrics?.negative_content?.length - 1
                ] * 100 || 0
              : calculateAverage(data?.metrics?.negative_content) || 0
          }
          data={data?.metrics?.negative_content?.map((value: number) => {
            return value * 100;
          })}
          color={generateRandomColor()}
        />
      </div>
      <div className="h-fit w-full p-1">
        <AnswerQualityCard
          seriesData={[
            {
              name: "Biased Content",
              data: data?.metrics?.biased_content?.map((value: number) => {
                return value * 100;
              })
            },
            {
              name: "Detect PII",
              data: data?.metrics?.detect_pii?.map((value: number) => {
                return value * 100;
              })
            },
            {
              name: "Declined",
              data: data?.metrics?.is_declined?.map((value: number) => {
                return value * 100;
              })
            },
            {
              name: "Context Relevance",
              data: data?.metrics?.is_context_relevant?.map((value: number) => {
                return value * 100;
              })
            },
            {
              name: "Negative Content",
              data: data?.metrics?.negative_content?.map((value: number) => {
                return value * 100;
              })
            },
            {
              name: "Toxic Content",
              data: data?.metrics?.toxic_content?.map((value: number) => {
                return value * 100;
              })
            }
          ]}
          categories={data?.timestamps?.map((time: string) => {
            return moment(time).format("ll");
          })}
          item={data?.metrics}
        />
      </div>
      <div className="h-fit w-full px-1 py-5">
        <CustomTable<TableRow>
          columns={[
            {
              field: "name",
              title: "Name",
              sortable: true,
              filterable: true,
              render: (row: TableRow) => (
                <span className="font-medium capitalize">
                  {row?.name ?? "Not Provided"}
                </span>
              )
            },
            {
              field: "description",
              title: "Description",
              sortable: true,
              filterable: true,
              render: (row: TableRow) => (
                <span className="flex w-full items-center justify-start text-left font-medium capitalize">
                  {row?.description ?? "Not Provided"}
                </span>
              )
            }
          ]}
          data={data?.table_content || []}
          isLoading={isValidating}
          title="Control Indicators Description"
          selection={false}
          filtering={false}
          options={{
            toolbar: false,
            search: false,
            filtering: false,
            sorting: false,
            pagination: false
          }}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default Graph;
