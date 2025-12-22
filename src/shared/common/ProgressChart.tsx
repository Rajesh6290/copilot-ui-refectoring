"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false
});

const ProgressChart = ({
  value = 0,
  size
}: {
  value: number;
  size?: number;
}) => {
  const [options, setOptions] = useState<ApexOptions>({
    chart: {
      type: "radialBar",
      offsetY: 0
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: "16px",
            offsetY: 120
          },
          value: {
            offsetY: 76,
            fontSize: "22px",
            formatter: () => ""
          }
        }
      }
    },
    stroke: {
      dashArray: 4
    },
    labels: [""]
  });

  useEffect(() => {
    let color = "#22c55e";
    if (value === 0) {
      color = "#dc2626";
    } else if (value > 0 && value <= 50) {
      color = "#f59e0b";
    }

    setOptions((prevOptions) => ({
      ...prevOptions,
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          shadeIntensity: 0.15,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 65, 91],
          colorStops: [
            { offset: 0, color: color, opacity: 1 },
            { offset: 100, color: color, opacity: 1 }
          ]
        }
      }
    }));
  }, [value]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute flex flex-col items-center gap-1">
        <p
          className={`text-2xl font-semibold ${
            value === 0
              ? "text-red-500"
              : value <= 50
                ? "text-amber-500"
                : "text-green-500"
          }`}
        >
          {value}%
        </p>
        <p className="text-xs font-semibold text-gray-600 dark:text-white">
          Complaint
        </p>
      </div>
      <ReactApexChart
        options={options}
        series={[value]}
        type="radialBar"
        height={size || 300}
      />
    </div>
  );
};

export default ProgressChart;
