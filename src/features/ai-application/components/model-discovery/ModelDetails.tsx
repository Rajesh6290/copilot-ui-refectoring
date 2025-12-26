"use client";
import useSwr from "@/shared/hooks/useSwr";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  GitBranch,
  Info,
  Package,
  Shield,
  TrendingUp
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

// TypeScript Interfaces
interface BusinessImpact {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: "High" | "Medium" | "Low";
  example: string;
  explanation: string | null;
}

interface Risk {
  id: string;
  risk_name: string;
  score: number;
  details: string;
  risk_level: "High" | "Medium" | "Low";
  business_impacts: BusinessImpact[];
}

// Skeleton Loaders
const HeaderSkeleton = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
    <div className="mb-4 flex flex-col items-start gap-4 sm:mb-5 sm:flex-row sm:items-start">
      <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 sm:h-14 sm:w-14" />
      <div className="w-full flex-1">
        <div className="mb-2 h-6 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700 sm:h-8" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800 sm:p-4"
        >
          <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  </div>
);

const MetricsSkeleton = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5">
    <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-5"
        >
          <div className="mb-3 flex flex-col items-center">
            <div className="mb-3 h-12 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="mb-2 h-10 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RiskCardSkeleton = () => (
  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
    <div className="bg-gray-50 p-4 dark:bg-gray-800 sm:p-5">
      <div className="mb-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="w-full flex-1">
          <div className="mb-2 h-6 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  </div>
);

const ModelDetails = () => {
  const [selectedRiskName, setSelectedRiskName] = useState<string>("ALL");

  const { id } = useParams();
  const asset_type = useSearchParams()?.get("asset_type");

  const { data: modelData, isValidating } = useSwr(
    `show_asset_with_risks?doc_id=${id}&asset_type=${asset_type}`
  );

  const getRiskColor = (level: string): string => {
    const levelUpper = level.toUpperCase();
    switch (levelUpper) {
      case "HIGH":
        return "text-red-800 bg-red-50 border-red-300 dark:text-red-200 dark:bg-red-950 dark:border-red-800";
      case "MEDIUM":
        return "text-amber-800 bg-amber-50 border-amber-300 dark:text-amber-200 dark:bg-amber-950 dark:border-amber-800";
      case "LOW":
        return "text-green-800 bg-green-50 border-green-300 dark:text-green-200 dark:bg-green-950 dark:border-green-800";
      default:
        return "text-gray-700 bg-gray-50 border-gray-300 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700";
    }
  };

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("non-compliant") ||
      statusLower.includes("failed")
    ) {
      return "text-red-800 bg-red-50 border-red-300 dark:text-red-200 dark:bg-red-950 dark:border-red-800";
    }
    if (statusLower.includes("compliant") || statusLower.includes("approved")) {
      return "text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-200 dark:bg-emerald-950 dark:border-emerald-800";
    }
    if (statusLower.includes("pending") || statusLower.includes("review")) {
      return "text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-200 dark:bg-amber-950 dark:border-amber-800";
    }
    return "text-tertiary-700 bg-tertiary-50 border-tertiary-300 dark:text-tertiary-300 dark:bg-tertiary-950 dark:border-tertiary-800";
  };

  const getRiskIconBg = (level: string): string => {
    const levelUpper = level.toUpperCase();
    switch (levelUpper) {
      case "HIGH":
        return "bg-red-600 dark:bg-red-700";
      case "MEDIUM":
        return "bg-amber-500 dark:bg-amber-600";
      case "LOW":
        return "bg-green-500 dark:bg-green-600";
      default:
        return "bg-gray-600 dark:bg-gray-700";
    }
  };

  const metrics = useMemo(() => {
    if (!modelData?.risks) {
      return {
        totalRisks: 0,
        highRisks: 0,
        mediumRisks: 0,
        lowRisks: 0,
        totalImpacts: 0,
        highImpacts: 0,
        mediumImpacts: 0,
        lowImpacts: 0,
        averageScore: 0
      };
    }

    const filteredRisks = modelData.risks.filter(
      (risk: Risk) =>
        selectedRiskName === "ALL" || risk.risk_name === selectedRiskName
    );

    const hasRisks = filteredRisks.length > 0;

    // Calculate business impact counts by severity
    let highImpacts = 0;
    let mediumImpacts = 0;
    let lowImpacts = 0;

    filteredRisks.forEach((risk: Risk) => {
      if (risk.business_impacts && Array.isArray(risk.business_impacts)) {
        risk.business_impacts.forEach((impact: BusinessImpact) => {
          const severity = impact.severity?.toUpperCase();
          if (severity === "HIGH") {
            highImpacts++;
          } else if (severity === "MEDIUM") {
            mediumImpacts++;
          } else if (severity === "LOW") {
            lowImpacts++;
          }
        });
      }
    });

    const totalImpacts = highImpacts + mediumImpacts + lowImpacts;

    return {
      totalRisks: filteredRisks.length,
      highRisks: filteredRisks.filter((r: Risk) => r.risk_level === "High")
        .length,
      mediumRisks: filteredRisks.filter((r: Risk) => r.risk_level === "Medium")
        .length,
      lowRisks: filteredRisks.filter((r: Risk) => r.risk_level === "Low")
        .length,
      totalImpacts,
      highImpacts,
      mediumImpacts,
      lowImpacts,
      averageScore: hasRisks
        ? filteredRisks.reduce((acc: number, r: Risk) => acc + r.score, 0) /
          filteredRisks.length
        : 0
    };
  }, [modelData, selectedRiskName]);

  const filteredRisks = useMemo(() => {
    if (!modelData?.risks) {
      return [];
    }
    return modelData.risks.filter(
      (risk: Risk) =>
        selectedRiskName === "ALL" || risk.risk_name === selectedRiskName
    );
  }, [modelData, selectedRiskName]);

  if (isValidating || !modelData) {
    return (
      <div className="min-h-screen w-full bg-gray-100 p-3 dark:bg-gray-950 sm:p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
          <HeaderSkeleton />
          <MetricsSkeleton />
          {[...Array(3)].map((_, i) => (
            <RiskCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-fit w-full sm:p-4">
      <div className="w-full space-y-4 sm:space-y-5">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6"
        >
          <div className="mb-4 flex flex-col items-start gap-3 sm:mb-5 sm:flex-row sm:items-start sm:gap-4">
            <div className="rounded-lg bg-tertiary-600 p-2 shadow-md dark:bg-tertiary-700 sm:p-3">
              <Package className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div className="w-full flex-1">
              <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:text-2xl">
                  {modelData.name}
                </h1>
                <span className="w-fit rounded-md bg-tertiary-100 px-3 py-1 text-xs font-semibold text-tertiary-700 dark:bg-tertiary-900 dark:text-tertiary-200">
                  MODEL INFO
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                Complete AI Model Governance & Risk Assessment Report
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 sm:p-4">
              <div className="mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-tertiary-500 dark:text-tertiary-400" />
                <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                  Current Status
                </p>
              </div>
              <p
                className={`inline-block rounded-md border px-2 py-1 text-xs font-semibold capitalize sm:px-3 sm:py-1.5 ${getStatusColor(modelData.status)}`}
              >
                {modelData?.status?.replace(/_/g, " ")}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 sm:p-4">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-tertiary-500 dark:text-tertiary-400" />
                <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                  Compliance Status
                </p>
              </div>
              <p
                className={`inline-block rounded-md border px-2 py-1 text-xs font-semibold sm:px-3 sm:py-1.5 ${getStatusColor(modelData.compliance_status)}`}
              >
                {modelData.compliance_status === "N/A"
                  ? "Not Compliant"
                  : modelData.compliance_status}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 sm:p-4">
              <div className="mb-2 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-tertiary-500 dark:text-tertiary-400" />
                <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                  Model Version
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {modelData.version}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 sm:p-4">
              <div className="mb-2 flex items-center gap-2">
                <Package className="h-4 w-4 text-tertiary-500 dark:text-tertiary-400" />
                <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                  Provider
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {modelData.provider}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Summary Metrics - 2 Cards with Same Design */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-tertiary-600 dark:text-tertiary-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                Key Risk Metrics Summary
              </h2>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                Filter by Risk:
              </span>
              <select
                value={selectedRiskName}
                onChange={(e) => setSelectedRiskName(e.target.value)}
                className="rounded-lg border border-tertiary-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 transition-all focus:border-tertiary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500 dark:border-tertiary-700 dark:bg-gray-800 dark:text-white sm:px-4"
              >
                <option value="ALL">All Risks</option>
                {modelData.risks.map((risk: Risk) => (
                  <option key={risk.id} value={risk.risk_name}>
                    {risk.risk_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Total Risks Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-white p-4 dark:border-red-800 dark:from-red-950 dark:to-gray-900 sm:p-5"
            >
              <div className="mb-3 flex flex-col items-center text-center">
                <div className="mb-3 rounded-lg bg-red-600 p-2 shadow-md dark:bg-red-700 sm:p-3">
                  <AlertCircle className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-200 sm:text-3xl">
                  {metrics.totalRisks}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  Total Risks Found
                </p>
              </div>
              <div className="mb-2 flex justify-between text-xs font-semibold">
                <span className="text-red-700 dark:text-red-200">
                  High: {metrics.highRisks}
                </span>
                <span className="text-amber-700 dark:text-amber-200">
                  Medium: {metrics.mediumRisks}
                </span>
                <span className="text-green-700 dark:text-green-200">
                  Low: {metrics.lowRisks}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metrics.averageScore * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700"
                />
              </div>
              <p className="mt-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                {(metrics.averageScore * 100).toFixed(0)}% Avg Risk Score
              </p>
            </motion.div>

            {/* Business Impact Card - Same Design */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 dark:border-blue-800 dark:from-blue-950 dark:to-gray-900 sm:p-5"
            >
              <div className="mb-3 flex flex-col items-center text-center">
                <div className="mb-3 rounded-lg bg-blue-600 p-2 shadow-md dark:bg-blue-700 sm:p-3">
                  <TrendingUp className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-200 sm:text-3xl">
                  {metrics.totalImpacts}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase text-gray-700 dark:text-gray-300">
                  Business Impacts
                </p>
              </div>
              <div className="mb-2 flex justify-between text-xs font-semibold">
                <span className="text-red-700 dark:text-red-200">
                  High: {metrics.highImpacts}
                </span>
                <span className="text-amber-700 dark:text-amber-200">
                  Medium: {metrics.mediumImpacts}
                </span>
                <span className="text-green-700 dark:text-green-200">
                  Low: {metrics.lowImpacts}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${metrics.totalImpacts > 0 ? (metrics.totalImpacts / (metrics.totalRisks * 3)) * 100 : 0}%`
                  }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
                />
              </div>
              <p className="mt-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                Identified Impact Areas
              </p>
            </motion.div>
          </div>
        </div>

        {/* Risk Cards - Direct Business Impact Display */}
        {filteredRisks.map((risk: Risk, index: number) => (
          <motion.div
            key={risk.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900"
          >
            {/* Risk Header */}
            <div
              className={`p-4 sm:p-5 ${
                risk.risk_level === "High"
                  ? "bg-red-50 dark:bg-red-950"
                  : risk.risk_level === "Medium"
                    ? "bg-amber-50 dark:bg-amber-950"
                    : "bg-green-50 dark:bg-green-950"
              }`}
            >
              <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div
                  className={`rounded-lg p-2 shadow-md sm:p-2.5 ${getRiskIconBg(risk.risk_level)}`}
                >
                  <AlertCircle className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                </div>
                <div className="w-full flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-5">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                      {risk.risk_name}
                    </h2>
                    <span
                      className={`w-fit rounded-md border px-2 py-1 text-xs font-semibold uppercase shadow-sm sm:px-4 sm:py-1.5 ${getRiskColor(risk.risk_level)}`}
                    >
                      {risk.risk_level}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-700 dark:text-gray-300 sm:text-sm">
                {risk.details}
              </p>
            </div>

            {/* Business Impact Section - Always Visible */}
            <div className="bg-gray-50 p-4 dark:bg-gray-800 sm:p-5">
              <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                  Business Impact Analysis
                </h3>
              </div>

              {risk.business_impacts && risk.business_impacts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {risk.business_impacts.map((impact: BusinessImpact) => (
                    <motion.div
                      key={impact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-4"
                    >
                      <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                          {impact.name}
                        </h4>
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-semibold uppercase ${getRiskColor(impact.severity)}`}
                        >
                          {impact.severity}
                        </span>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="rounded border border-blue-200 bg-blue-50 p-2 dark:border-blue-700 dark:bg-blue-950 sm:p-3">
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                            Category: {impact.category}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-900 dark:text-gray-200">
                            Description:
                          </p>
                          <p className="text-xs text-gray-700 dark:text-gray-400 sm:text-sm">
                            {impact.description}
                          </p>
                        </div>

                        {impact.explanation && (
                          <div className="rounded border-l-4 border-purple-600 bg-purple-50 p-2 dark:border-purple-700 dark:bg-purple-950 sm:p-3">
                            <p className="mb-1 text-xs font-semibold text-purple-900 dark:text-purple-200">
                              Why This Matters:
                            </p>
                            <p className="text-xs text-gray-700 dark:text-gray-400 sm:text-sm">
                              {impact.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900 sm:p-8">
                  <div className="mx-auto mb-3 w-fit rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                    <TrendingUp className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    No business impacts recorded for this risk.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* No Results Message */}
        {filteredRisks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-12"
          >
            <div className="mx-auto mb-4 w-fit rounded-full bg-gray-100 p-3 dark:bg-gray-800 sm:p-4">
              <AlertCircle className="h-6 w-6 text-gray-400 dark:text-gray-600 sm:h-8 sm:w-8" />
            </div>
            <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              No Risks Found
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              No risks match the selected filter. Try selecting a different risk
              type.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ModelDetails;
