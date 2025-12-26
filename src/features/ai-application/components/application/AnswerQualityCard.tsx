"use client";
import { IconButton, Tooltip } from "@mui/material";
import { ApexOptions } from "apexcharts";
import { Info } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts with no SSR to avoid hydration issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const MetricItem = ({
  label,
  value,
  info
}: {
  label: string;
  value: number;
  info: string;
}) => (
  <div className="gap-` flex flex-col">
    <div className="text-nowrap font-satoshi text-2xl font-medium text-gray-900 dark:text-white">
      {isNaN(Number(value)) ? 0 : Number(value).toFixed(0)}%
    </div>
    <div className="flex items-center gap-1">
      <div className="text-nowrap font-satoshi text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </div>
      <div className="flex items-center gap-1">
        <Tooltip
          title={
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm font-semibold">Accepted Range</div>
              <div className="text-xs">{info}</div>
            </div>
          }
          arrow
        >
          <IconButton>
            <Info className="h-4 w-4 cursor-pointer text-gray-400" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  </div>
);
const AnswerQualityCard = ({
  categories,
  seriesData,
  item
}: {
  categories: string[];
  seriesData: { name: string; data: number[] }[];
  item: {
    biased_content: number[];
    detect_pii: number[];
    is_declined: number[];
    is_context_relevant: number[];
    negative_content: number[];
    toxic_content: number[];
  };
}) => {
  function calculateAverage(arr: number[]) {
    const sum = arr?.reduce((acc, num) => acc + num * 100, 0);
    const average = sum / arr?.length;

    return average;
  }
  const series = seriesData;
  const chartOptions: ApexOptions = {
    chart: {
      type: "line" as const,
      height: 350,
      toolbar: {
        show: false
      }
    },
    colors: ["#7C3AED", "#06B6D4", "#EF4444", "#10B981", "#F59E0B", "#3B82F6"],
    stroke: {
      curve: "smooth",
      width: 2
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "inherit"
        }
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 10,
      labels: {
        formatter: (value) => `${value?.toFixed(0)}%`,
        style: {
          fontSize: "12px",
          fontFamily: "inherit"
        }
      }
    },
    legend: {
      position: "top",
      horizontalAlign: "right"
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4
    },
    markers: {
      size: 4
    }
  };

  return (
    <div className="w-full rounded-xl bg-white p-6 shadow dark:bg-darkSidebarBackground">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="font-satoshi text-xl font-semibold text-gray-900 dark:text-white">
            Answer quality
          </h2>
          <button className="text-sm text-blue-600 hover:underline focus:outline-none">
            Learn more
          </button>
        </div>
        <p className="mt-1 text-sm font-medium text-neutral-500">
          {`Answer quality metrics calculate the faithfulness and answer
          relevance of the model's output with context.`}
        </p>
      </div>

      <div className="flex h-full w-full items-center gap-10">
        <div className="flex w-[10%] items-center justify-between">
          <div className="space-y-3">
            <MetricItem
              label="Biased Content"
              value={calculateAverage(item?.biased_content)}
              info="<=2%"
            />
            <MetricItem
              label="Detect PII"
              value={calculateAverage(item?.detect_pii)}
              info="<=10%"
            />
            <MetricItem
              label="Context Relevance"
              value={calculateAverage(item?.is_context_relevant)}
              info=">=95%"
            />
            <MetricItem
              label="Is Declined"
              value={calculateAverage(item?.is_declined)}
              info="<=2%"
            />
            <MetricItem
              label="Negative Content"
              value={calculateAverage(item?.negative_content)}
              info="<=2%"
            />
            <MetricItem
              label="Toxic Content"
              value={calculateAverage(item?.toxic_content)}
              info="<=50%"
            />
            <div className="text-nowrap text-base font-medium text-gray-700 dark:text-white">
              6 Controls Indicators
            </div>
          </div>
        </div>

        <div className="mt-4 h-[25rem] w-[90%]">
          <Chart
            options={chartOptions}
            series={series}
            type="line"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default AnswerQualityCard;
