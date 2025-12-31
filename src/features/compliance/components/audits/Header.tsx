"use client";
import { Award, Calendar, Clock, Shield, Users } from "lucide-react";
import { StatusBadge } from "./AuditDetails";

const Header = ({
  data,
  startDate,
  endDate
}: {
  data: {
    title?: string;
    description?: string;
    status?: string;
    assessment_type?: string;
    invited_auditors?: Array<unknown>;
    audit_window?: {
      start_date?: string;
      end_date?: string;
    };
  };
  startDate: Date | null;
  endDate: Date | null;
}) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) {
      return "N/A";
    }
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Invalid Date"
        : date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          });
    } catch {
      return "Invalid Date";
    }
  };
  const today = new Date();
  const daysUntilStart =
    startDate && !isNaN(startDate.getTime())
      ? Math.ceil(
          (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

  const totalDuration =
    startDate &&
    endDate &&
    !isNaN(startDate.getTime()) &&
    !isNaN(endDate.getTime())
      ? Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;
  return (
    <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground">
      <div className="px-8 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {data?.title || "Untitled Audit"}
                </h1>
                <StatusBadge status={data?.status || "draft"} />
              </div>
              <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
                {data?.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
            <Clock className="h-5 w-5 text-amber-500" />
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                {daysUntilStart !== null && daysUntilStart > 0
                  ? "Starts In :"
                  : "Started :"}
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {daysUntilStart !== null && daysUntilStart > 0
                  ? `${daysUntilStart} days`
                  : formatDate(data?.audit_window?.start_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
            <Calendar className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                Duration :
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {totalDuration !== null ? `${totalDuration} days` : "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
            <Award className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                Type :
              </p>
              <p className="font-bold capitalize text-slate-900 dark:text-white">
                {data?.assessment_type || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
            <Users className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">
                Auditors :
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {data?.invited_auditors?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
