"use client";

import {
  AlertTriangle,
  Building,
  Calendar,
  Shield,
  XCircle
} from "lucide-react";
import { useState } from "react";

interface ComplianceFailedItem {
  requirement_name: string;
  framework: string;
  description: string;
  clause: string;
  section: string;
  effective_date: string;
  publisher: string;
}

export interface ComplianceDashboardProps {
  data: {
    compliance_failed: ComplianceFailedItem[];
  };
}

const NewComplianceCard = ({ data }: ComplianceDashboardProps) => {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(
    null
  );

  // Group data by framework and get counts
  const frameworkGroups =
    data?.compliance_failed?.reduce(
      (acc, item) => {
        if (!acc[item.framework]) {
          acc[item.framework] = [];
        }
        acc[item.framework]!.push(item);
        return acc;
      },
      {} as Record<string, ComplianceFailedItem[]>
    ) || {};

  const frameworks = Object.keys(frameworkGroups);
  const totalIssues = data?.compliance_failed?.length || 0;

  // Set first framework as default if none selected and frameworks exist
  const activeFramework =
    selectedFramework || (frameworks.length > 0 ? frameworks[0] : null);

  // Filter data based on selected framework
  const filteredData = activeFramework
    ? frameworkGroups[activeFramework] || []
    : data?.compliance_failed || [];

  // Get framework metadata dynamically
  const getFrameworkMeta = (framework: string) => {
    const firstItem = frameworkGroups[framework]?.[0];
    return {
      version: "Latest", // You can extract version if available in your data
      publisher: firstItem?.publisher || "Unknown",
      effective: firstItem?.effective_date || "N/A"
    };
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-neutral-900 dark:bg-darkSidebarBackground">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-tertiary-500 to-purple-600 shadow-lg lg:flex">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">
              Compliance Gaps - Multi-Framework Overview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 lg:text-base">
              {totalIssues} Compliance Gaps Identified Across Frameworks
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-tertiary-600 dark:text-tertiary-400">
            {totalIssues}
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Gaps
          </div>
        </div>
      </div>
      {/* Framework Tabs */}
      {frameworks?.length > 0 && (
        <div className=" ">
          <div className="pb-0">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">
              Framework
            </h3>
            <div className="flex flex-wrap gap-2">
              {frameworks?.map((framework) => {
                const count = frameworkGroups[framework]?.length || 0;
                const isSelected = activeFramework === framework;

                return (
                  <button
                    key={framework}
                    onClick={() => setSelectedFramework(framework)}
                    className={`flex items-center space-x-2 rounded-lg p-2 text-sm font-medium transition-all duration-200 lg:px-4 lg:py-2 lg:text-base ${
                      isSelected
                        ? "border-2 border-tertiary-300 bg-tertiary-100 text-tertiary-800 shadow-md"
                        : "hover:bg-gray-150 border border-gray-200 bg-gray-100 text-gray-600"
                    }`}
                  >
                    {/* <span>{icon}</span> */}
                    <span>{framework}</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${
                        isSelected
                          ? "bg-tertiary-200 text-tertiary-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selected Framework Details */}
      {activeFramework && (
        <div className="py-3">
          <div className="rounded-xl border border-tertiary-200 bg-gradient-to-r from-tertiary-50 to-indigo-50 p-6">
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
              <div>
                <h2 className="flex items-center text-2xl font-semibold text-gray-900">
                  {activeFramework}
                  <span
                    className={`ml-3 text-nowrap rounded-full px-3 py-1 text-sm font-medium ${
                      filteredData.length > 0
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {filteredData.length} Gap
                    {filteredData.length !== 1 ? "s" : ""}
                  </span>
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Publisher:</div>
                  <div className="font-medium text-gray-900">
                    {getFrameworkMeta(activeFramework).publisher}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Release Date:</div>
                  <div className="font-medium text-gray-900">
                    {new Date(
                      getFrameworkMeta(activeFramework).effective
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Items */}
      <div className="py-3">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredData?.length > 0 ? (
            filteredData?.map((item, index) => {
              return (
                <div
                  key={index}
                  className="rounded-xl border-2 border-red-200 bg-red-50 p-6 transition-all duration-200 hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <XCircle className="size-7 text-red-500" />
                      <div className="flex items-center gap-4">
                        <div className="group relative">
                          <div className="relative flex items-center gap-2 rounded-xl bg-tertiary/10 px-4 py-2">
                            <span className="text-xs font-medium uppercase tracking-wide text-tertiary-700">
                              Clause :
                            </span>
                            <span className="text-sm font-bold text-tertiary-900">
                              {item.section}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                          Not Compliant
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="mb-2 font-semibold text-gray-900">
                      Requirement:
                    </h4>
                    <p className="text-sm leading-relaxed text-gray-800">
                      {item.requirement_name}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="mb-2 font-semibold text-gray-900">
                      Description:
                    </h4>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-red-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-4 text-sm text-gray-600 sm:flex-row sm:items-center">
                      <div className="flex items-center space-x-2 rounded-lg bg-red-100 px-3 py-2">
                        <Building className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{item.publisher}</span>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg bg-red-100 px-3 py-2">
                        <Calendar className="h-4 w-4 text-red-500" />
                        <span className="font-medium">
                          Release Date :{" "}
                          {new Date(item.effective_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                No Compliance Gaps
              </h3>
              <p className="text-gray-600">
                {activeFramework
                  ? `All requirements for ${activeFramework} are currently met.`
                  : "All obligations are up to date, with no compliance failure."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewComplianceCard;
