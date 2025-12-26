"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false
});

interface MetricCardProps {
  title: string;
  currentValue: number;
  data: number[];
  color?: string;
  className?: string;
}

const CardChart: React.FC<MetricCardProps> = ({
  title,
  currentValue,
  data,
  color = "#60A5FA",
  className = ""
}) => {
  const options = useMemo<ApexOptions>(
    () => ({
      chart: {
        type: "area",
        height: 100,
        sparkline: {
          enabled: true
        },
        toolbar: {
          show: false
        },
        background: "transparent",
        foreColor: "currentColor"
      },
      stroke: {
        curve: "smooth",
        width: 2,
        colors: [color]
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.8,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100],
          colorStops: [
            {
              offset: 0,
              color: color,
              opacity: 0.4
            },
            {
              offset: 100,
              color: color,
              opacity: 0
            }
          ]
        }
      },
      grid: {
        show: false
      },
      xaxis: {
        labels: {
          show: true
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        show: false
      },
      tooltip: {
        enabled: true,
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        marker: {
          show: false
        },
        style: {
          fontSize: "12px"
        },
        y: {
          formatter: (value) => `${value?.toFixed(2)}%`
        }
      },
      dataLabels: {
        enabled: false
      }
    }),
    [color]
  );

  const series = [
    {
      name: title,
      data: data
    }
  ];

  return (
    <div
      className={`w-full rounded-xl bg-white shadow-sm shadow-gray-100/50 transition-colors duration-200 dark:bg-darkSidebarBackground dark:shadow-gray-900/10 ${className}`}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex w-full flex-col gap-2 px-6 pt-6">
          <div className="text-4xl font-semibold text-gray-900 dark:text-gray-100">
            {currentValue?.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </div>
        </div>

        <div className="mt-2 h-fit">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={80}
          />
        </div>
      </div>
    </div>
  );
};
export default CardChart;
