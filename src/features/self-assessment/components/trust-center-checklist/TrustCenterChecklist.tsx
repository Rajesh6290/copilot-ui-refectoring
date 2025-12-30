"use client";

import CustomButton from "@/shared/core/CustomButton";
import useSwr from "@/shared/hooks/useSwr";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Circle,
  Info,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { FC, useMemo, useState } from "react";

// --- TypeScript Interfaces ---

interface ChecklistItem {
  title: string;
  status: boolean;
  required: boolean;
  route?: string;
}

interface Section {
  title: string;
  items: Record<string, ChecklistItem>;
  route?: string;
}

interface Step {
  title: string;
  description: string;
  status: "complete" | "in_progress" | "not_started";
  percentage: number;
  items?: Record<string, ChecklistItem>;
  sections?: Record<string, Section>;
}

interface AiReadinessReport {
  global_progress: number;
  current_step: number;
  steps: Record<string, Step>;
  next_actions: string[];
}

// Normalized item for the UI grid
interface ProcessedTask extends ChecklistItem {
  id: string;
  group?: string;
}

// --- Sub-Components ---

interface CircularGaugeProps {
  completed: number;
  total: number;
  percentage: number;
}

const CircularGauge: FC<CircularGaugeProps> = ({
  completed,
  total,
  percentage
}) => {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          className="text-slate-100 dark:text-white/5"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "circOut" }}
          style={{ strokeDasharray: circumference }}
          className="text-emerald-500 dark:text-emerald-400"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline">
          <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
            {completed}
          </span>
          <span className="text-lg font-bold text-slate-400">/{total}</span>
        </div>
        <span className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white">
          Tasks Done
        </span>
      </div>
    </div>
  );
};

interface TaskCardProps {
  item: ProcessedTask;
}

const TaskCard: FC<TaskCardProps> = ({ item }) => {
  const router = useRouter();

  return (
    <button
      onClick={() =>
        item.route && item.route !== "#" && router.push(item.route)
      }
      className={`group relative flex h-full w-full items-start gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
        item.status
          ? "border-emerald-100 bg-emerald-50/40 dark:border-emerald-500/10 dark:bg-emerald-500/5"
          : "border-slate-200 bg-white hover:border-tertiary-500/40 hover:shadow-xl hover:shadow-tertiary-500/5 dark:border-white/5 dark:bg-white/5"
      }`}
    >
      <div
        className={`mt-1 shrink-0 ${item.status ? "text-emerald-500" : "text-slate-300 dark:text-slate-700"}`}
      >
        {item.status ? <CheckCircle2 size={22} /> : <Circle size={22} />}
      </div>

      <div className="min-w-0 flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="mr-2 truncate text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white">
              {item.group || "Verification"}
            </span>
            <h4
              className={`truncate text-sm font-bold ${item.status ? "text-emerald-900 dark:text-emerald-300" : "text-slate-800 dark:text-slate-200"}`}
            >
              {item.title}
            </h4>
          </div>
          <div className="flex items-center gap-5">
            {item.status && (
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                Completed
              </span>
            )}
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 transition-colors group-hover:text-tertiary-600 dark:text-white">
              <span>Configure Task</span>
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

// --- Main Component ---

const TrustCenterChecklist: FC = () => {
  const router = useRouter();
  const { data, isValidating } = useSwr("ai-readiness-checklist");
  const [activeKey, setActiveKey] = useState<string>("step_1");
  const report = data?.ai_readiness_report as AiReadinessReport | undefined;

  const stats = useMemo(() => {
    if (!report) {
      return { completed: 0, total: 0 };
    }
    let total = 0;
    let completed = 0;
    (Object.values(report.steps) as Step[]).forEach((s) => {
      const stepItems = s.sections
        ? (Object.values(s.sections) as Section[]).flatMap(
            (sec) => Object.values(sec.items) as ChecklistItem[]
          )
        : (Object.values(s.items || {}) as ChecklistItem[]);
      total += stepItems.length;
      completed += stepItems.filter((i) => i.status).length;
    });
    return { completed, total };
  }, [report]);

  const activeStepTasks = useMemo((): ProcessedTask[] => {
    if (!report || !report.steps[activeKey]) {
      return [];
    }
    const step = report.steps[activeKey];
    const tasks: ProcessedTask[] = [];

    if (step.sections) {
      (Object.entries(step.sections) as [string, Section][]).forEach(
        ([_, section]) => {
          (Object.entries(section.items) as [string, ChecklistItem][]).forEach(
            ([id, item]) => {
              tasks.push({
                ...item,
                id,
                group: section.title,
                ...(section.route && { route: section.route })
              });
            }
          );
        }
      );
    } else if (step.items) {
      (Object.entries(step.items) as [string, ChecklistItem][]).forEach(
        ([id, item]) => {
          tasks.push({ ...item, id });
        }
      );
    }
    return tasks;
  }, [report, activeKey]);

  const sortedSteps = useMemo(() => {
    if (!report) {
      return [];
    }
    return Object.entries(report.steps).sort(([a], [b]) =>
      a.localeCompare(b)
    ) as [string, Step][];
  }, [report]);

  // --- RENDER LOGIC ---

  if (isValidating || !data) {
    return (
      <div className="h-[calc(100vh-110px)] w-full px-3 pt-3">
        <div className="flex size-full overflow-hidden rounded-2xl bg-white dark:bg-darkSidebarBackground">
          {/* SIDEBAR SKELETON */}
          <aside className="flex h-screen w-80 shrink-0 flex-col overflow-hidden">
            <div className="border-b border-slate-50 p-8 text-center dark:border-white/5">
              <div className="mb-8 flex items-center gap-3 text-left">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="flex-grow space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              {/* Circular Gauge Skeleton */}
              <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
                <div className="h-40 w-40 animate-pulse rounded-full border-[10px] border-slate-200 dark:border-slate-800" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>

            {/* Priority Actions Skeleton */}
            <div className="border-b border-slate-50 p-4 dark:border-white/5">
              <div className="mb-3 h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            </div>

            {/* Navigation Skeleton */}
            <nav className="flex-grow space-y-1 overflow-y-auto p-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </nav>
          </aside>

          {/* MAIN PANEL SKELETON */}
          <div className="flex min-w-0 flex-grow flex-col overflow-hidden">
            {/* Header Bar Skeleton */}
            <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between px-10">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="flex items-center gap-6">
                <div className="h-8 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
            </header>

            {/* Content Body Skeleton */}
            <main className="flex-grow overflow-y-auto p-10">
              <div className="w-full">
                <div className="mb-12 flex flex-col items-start justify-between gap-10 xl:flex-row">
                  <div className="max-w-4xl flex-grow space-y-4">
                    <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-6 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-6 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  </div>

                  <div className="h-40 w-full animate-pulse rounded-[2rem] bg-slate-100 dark:bg-slate-800 xl:max-w-md" />
                </div>

                {/* Task Grid Skeleton */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6 dark:border-white/5">
                    <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-1 gap-5 pb-20 md:grid-cols-2 2xl:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className="h-36 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const activeStep = report!.steps[activeKey];

  return (
    <div className="h-[calc(100vh-110px)] w-full px-3 pt-3">
      <div className="flex size-full overflow-hidden rounded-2xl bg-white dark:bg-darkSidebarBackground">
        {/* SIDEBAR - STICKY */}
        <aside className="flex h-screen w-80 shrink-0 flex-col overflow-hidden">
          <div className="border-b border-slate-50 p-8 text-center dark:border-white/5">
            <div className="mb-8 flex items-center gap-3 text-left">
              <div className="rounded-lg bg-tertiary-600 p-2 text-white shadow-lg shadow-tertiary-600/20">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase leading-none tracking-widest text-slate-900 dark:text-white">
                  Milestones
                </h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                  Live Audit Path
                </p>
              </div>
            </div>

            <CircularGauge
              completed={stats.completed}
              total={stats.total}
              percentage={report!.global_progress}
            />
          </div>

          {/* Next Actions - Priority Based */}
          {report!.next_actions && report!.next_actions.length > 0 && (
            <div className="border-b border-slate-50 p-4 dark:border-white/5">
              <h3 className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-white">
                Priority Actions
              </h3>
              <div className="space-y-2">
                {report!.next_actions.map((action, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider opacity-70">
                        Action Required
                      </span>
                      <span className="text-[10px] font-bold">#{idx + 1}</span>
                    </div>
                    <p className="text-[11px] font-bold leading-tight">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <nav className="custom-scrollbar flex-grow space-y-1 overflow-y-auto p-4">
            {sortedSteps.map(([key, step], idx) => (
              <button
                key={key}
                onClick={() => setActiveKey(key)}
                className={`flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300 ${
                  activeKey === key
                    ? "border border-tertiary-100 bg-tertiary-50 dark:border-tertiary-500/20 dark:bg-tertiary-500/10"
                    : "border border-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex flex-col items-start gap-1.5">
                  <span className="mb-0.5 text-[9px] font-black uppercase text-slate-600 dark:text-white">
                    Step 0{idx + 1}
                  </span>
                  <span
                    className={`text-left text-xs font-black tracking-tight ${activeKey === key ? "text-tertiary-600 dark:text-tertiary-400" : "text-slate-600 dark:text-white"}`}
                  >
                    {step.title}
                  </span>
                  {step.status === "in_progress" && (
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                      Action Required
                    </span>
                  )}
                  {step.status === "not_started" && (
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-500/20 dark:text-slate-400">
                      Pending
                    </span>
                  )}
                </div>
                {step.status === "complete" ? (
                  <CheckCircle2 className="text-emerald-500" size={18} />
                ) : (
                  <ChevronRight
                    className={`text-slate-300 transition-transform ${activeKey === key ? "translate-x-1" : ""}`}
                    size={16}
                  />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN PANEL */}
        <div className="flex min-w-0 flex-grow flex-col overflow-hidden">
          {/* Header Bar - STICKY */}
          <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-between px-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-800 dark:text-white">
                Trust Center Readiness Checklist
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden items-center gap-2 rounded-full border border-tertiary-100 bg-tertiary-50 px-4 py-2 dark:border-tertiary-500/20 dark:bg-tertiary-500/10 lg:flex">
                <TrendingUp
                  size={14}
                  className="text-tertiary-600 dark:text-tertiary-400"
                />
                <span className="text-[11px] font-black text-tertiary-700 dark:text-white">
                  {report!.global_progress}% Complete
                </span>
              </div>
              <CustomButton
                onClick={() =>
                  router.push("/self-assessment/trust-center-report")
                }
              >
                Full Report
              </CustomButton>
            </div>
          </header>

          {/* Content Body - SCROLLABLE */}
          <main className="flex-grow overflow-y-auto p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="w-full"
              >
                <div className="mb-12 flex flex-col items-start justify-between gap-10 xl:flex-row">
                  <div className="max-w-4xl">
                    <h1 className="mb-4 text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                      {activeStep?.title}
                    </h1>
                    <p className="text-xl font-medium italic leading-relaxed text-slate-500 dark:text-slate-400">
                      {activeStep?.description}
                    </p>
                  </div>

                  <div className="w-full rounded-[2rem] border border-tertiary-100 bg-tertiary-50/50 p-6 shadow-sm dark:border-tertiary-500/10 dark:bg-tertiary-500/5 xl:max-w-md">
                    <div className="mb-3 flex items-center gap-2 text-tertiary-600">
                      <Info size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Expert Insight
                      </span>
                    </div>
                    <p className="text-xs font-bold italic leading-relaxed text-slate-600 dark:text-white">
                      {
                        "This section ensures your AI governance is transparent to stakeholders, reducing compliance friction."
                      }
                    </p>
                  </div>
                </div>

                {/* Task Grid - Now fully utilizing width */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6 dark:border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white">
                      Action Items Matrix
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                      <span className="text-slate-600 dark:text-white">
                        Module Health:
                      </span>
                      <span className="text-tertiary-600">
                        {activeStep?.percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 pb-20">
                    {activeStepTasks.map((task) => (
                      <TaskCard key={task.id} item={task} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TrustCenterChecklist;
