import { motion } from "framer-motion";
import { Calendar, TrendingUp } from "lucide-react";

const States = ({
  data,
  startDate,
  endDate
}: {
  data: {
    created_at?: string;
    audit_window?: {
      start_date?: string;
      end_date?: string;
    };
    summary?: {
      completed_controls?: number;
      total_controls?: number;
      total_requirements?: number;
      overall_completion_percentage?: number;
    };
  };
  startDate?: Date | null;
  endDate?: Date | null;
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
  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full w-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground"
      >
        <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Calendar className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            Timeline
          </h2>
        </div>
        <div className="p-6">
          <div className="relative pl-2">
            <div className="absolute bottom-6 left-5 top-3 z-0 w-[2px] bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-8">
              <div className="relative z-10 pl-10">
                <div className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white bg-indigo-500 shadow-sm dark:border-slate-900" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Created
                  </p>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {formatDate(data?.created_at)}
                  </p>
                </div>
              </div>
              {startDate && (
                <div className="relative z-10 pl-10">
                  <div className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500 shadow-sm dark:border-slate-900" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Audit Begins
                    </p>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {formatDate(data?.audit_window?.start_date)}
                    </p>
                  </div>
                </div>
              )}
              {endDate && (
                <div className="relative z-10 pl-10">
                  <div className="absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white bg-slate-300 shadow-sm dark:border-slate-900 dark:bg-slate-700" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Audit Closes
                    </p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
                      {formatDate(data?.audit_window?.end_date)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full w-full overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl dark:border-neutral-800 dark:bg-darkSidebarBackground md:col-span-2"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 dark:border-slate-800">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            Audit Progress Overview
          </h2>
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {data?.summary?.completed_controls ?? 0} /{" "}
            {data?.summary?.total_controls ?? 0} Controls Complete
          </div>
        </div>
        <div className="p-8">
          <div className="mb-8 h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{
                width: `${data?.summary?.overall_completion_percentage ?? 0}%`
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {data?.summary?.completed_controls ?? 0}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-emerald-600/60 dark:text-emerald-400/60">
                Completed Controls
              </p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                {(data?.summary?.total_controls ?? 0) -
                  (data?.summary?.completed_controls ?? 0)}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-rose-600/60 dark:text-rose-400/60">
                Remaining Controls
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center dark:border-indigo-500/20 dark:bg-indigo-500/10">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {data?.summary?.total_requirements ?? 0}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-indigo-600/60 dark:text-indigo-400/60">
                Total Requirements
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                {Math.round(data?.summary?.overall_completion_percentage ?? 0)}%
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-600/60 dark:text-slate-400/60">
                Audit Progress
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default States;
