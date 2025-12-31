"use client";
import CustomButton from "@/shared/core/CustomButton";
import CustomTable from "@/shared/core/CustomTable";
import useSwr from "@/shared/hooks/useSwr";
import {
  Activity,
  AlertCircle,
  Eye,
  FileText,
  Lock,
  Plus,
  Shield,
  Users
} from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import React from "react";

// Type Definitions
interface Application extends Record<string, unknown> {
  application_doc_id: string;
  application_name: string;
  purpose: string;
  ai_application_type: string | null;
  is_active: boolean;
  risk_level: string | null;
  control_doc_id: string;
}

interface ControlData extends Record<string, unknown> {
  control_name: string;
  description: string;
  category: string;
  enforcement_type: string;
  severity_level: string;
  control_id: string;
  applications: Application[];
}

interface SwrResponse {
  data: ControlData | undefined;
  isValidating: boolean;
  mutate: () => void;
}
const CustomToolbar = () => {
  return (
    <div className="= flex w-full items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Associated Applications
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          AI applications linked to this control
        </p>
      </div>
    </div>
  );
};
const AuditRiskControl: React.FC = () => {
  const params = useParams();
  const { data, isValidating }: SwrResponse = useSwr(
    `control/aggregate/${params["ctlId"]}`
  );
  const router = useRouter();

  const getSeverityColor = (severity: string): string => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel?.toLowerCase()) {
      case "high":
        return "bg-red-500 dark:bg-red-600";
      case "medium":
        return "bg-yellow-500 dark:bg-yellow-600";
      case "low":
        return "bg-green-500 dark:bg-green-600";
      default:
        return "bg-gray-400 dark:bg-gray-600";
    }
  };

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="min-h-screen animate-pulse bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Skeleton */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-14 w-14 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex-1">
            <div className="mb-2 h-8 w-1/3 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>
        </div>

        {/* Control Information Card Skeleton */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6 dark:from-gray-700 dark:to-gray-600">
            <div className="mb-3 h-7 w-3/4 rounded bg-gray-400 dark:bg-gray-600"></div>
            <div className="h-4 w-full rounded bg-gray-400 dark:bg-gray-600"></div>
            <div className="mt-2 h-4 w-2/3 rounded bg-gray-400 dark:bg-gray-600"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-6 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Applications Table Skeleton */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="mb-2 h-6 w-1/4 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-600"></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="px-6 py-4">
                      <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-700"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[1, 2, 3].map((row) => (
                  <tr key={row}>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-5 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-600"></div>
                        <div className="h-3 w-40 rounded bg-gray-200 dark:bg-gray-600"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-24 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-16 rounded bg-gray-300 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-4 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  if (isValidating && !data) {
    return <SkeletonLoader />;
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500 dark:text-red-400" />
          <p className="text-gray-600 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-fit w-full flex-col gap-6 px-3 pt-6">
      {/* Header Section */}
      <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground">
        <div className="border-b border-slate-100 px-8 py-6 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
              <Shield className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {data.control_name}
              </h1>
              <p className="text-slate-700 dark:text-slate-300">
                {data.description}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-3xl border border-slate-50 bg-white/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Category
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                {data.category}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-50 bg-white/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Enforcement
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                {data.enforcement_type}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-50 bg-white/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Severity
                </span>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getSeverityColor(data.severity_level)}`}
                >
                  {data.severity_level?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-50 bg-white/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Applications
                </span>
              </div>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                {data.applications?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!data.applications || data.applications.length === 0 ? (
        <div className="py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400 dark:text-slate-600" />
          <p className="text-slate-600 dark:text-slate-400">
            No applications associated with this control
          </p>
        </div>
      ) : (
        <CustomTable<Application>
          data={data.applications}
          columns={[
            {
              field: "application_name",
              title: "Application",
              sortable: true,
              filterable: true,
              render: (row: Application) => (
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {row.application_name}
                  </div>
                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {row.purpose}
                  </div>
                </div>
              )
            },
            {
              field: "ai_application_type",
              title: "AI Type",
              sortable: true,
              filterable: true,
              render: (row: Application) =>
                row.ai_application_type ? (
                  <span className="inline-flex items-center text-nowrap rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {row.ai_application_type}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    Not specified
                  </span>
                )
            },
            {
              field: "risk_level",
              title: "Risk Level",
              sortable: true,
              filterable: true,
              render: (row: Application) =>
                row.risk_level ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getRiskLevelColor(row.risk_level)}`}
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {row.risk_level}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    Not assessed
                  </span>
                )
            },
            {
              field: "is_active",
              title: "Status",
              sortable: true,
              filterable: true,
              render: (row: Application) =>
                row.is_active ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Inactive
                  </span>
                )
            },
            {
              field: "actions",
              title: "Actions",
              sortable: false,
              filterable: false,
              render: (row: Application) => (
                <div className="flex w-full items-center justify-center gap-2">
                  <div className="w-fit">
                    <CustomButton
                      className="w-fit !text-nowrap !text-[0.7rem]"
                      startIcon={<Eye className="h-3 w-3" />}
                      onClick={() =>
                        router?.push(
                          `/compliance/controls/${row?.control_doc_id}?_name=${row?.application_name}&Main-Tab=details`
                        )
                      }
                    >
                      Control Details
                    </CustomButton>
                  </div>
                  <div className="w-fit">
                    <CustomButton
                      className="w-fit !text-nowrap !text-[0.7rem]"
                      startIcon={<FileText className="h-3 w-3" />}
                      onClick={() =>
                        router?.push(
                          `/compliance/controls/${row?.control_doc_id}?_name=${row?.application_name}&Main-Tab=evidence`
                        )
                      }
                    >
                      View Evidence
                    </CustomButton>
                  </div>
                  <div className="w-fit">
                    <CustomButton
                      className="w-fit !text-nowrap !text-[0.7rem]"
                      startIcon={<Plus className="h-3 w-3" />}
                      onClick={() =>
                        router?.push(
                          `/compliance/controls/${row?.control_doc_id}?_name=${row?.application_name}&Main-Tab=findings&openAdd=true&referedFrom=risk-control`
                        )
                      }
                    >
                      Add Finding
                    </CustomButton>
                  </div>
                </div>
              )
            }
          ]}
          isLoading={isValidating}
          title=""
          selection={false}
          filtering={false}
          customToolbar={<CustomToolbar />}
          options={{
            toolbar: false,
            search: false,
            filtering: true,
            sorting: true,
            pagination: false
          }}
          localization={{
            body: {
              emptyDataSourceMessage:
                "You haven't created any audits yet. Use the 'Add New Audit' button to set one up."
            }
          }}
          className="flex-1"
        />
      )}
    </div>
  );
};

export default AuditRiskControl;
