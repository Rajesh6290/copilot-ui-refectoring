import { motion } from "framer-motion";
import { Award, ChevronRight, Info, Layers } from "lucide-react";
import { useState } from "react";
import { Framework, FrameworkStatusBadge, IsAccess } from "./AuditDetails";
import RequirementsCard from "./RequirementsCard";

const FrameworkCard = ({
  framework,
  currentMenuAccessButton,
  setFindingData,
  setFindingOpen,
  setDrawerOpen,
  id,
  mutate
}: {
  framework: Framework;
  currentMenuAccessButton: IsAccess | null;
  setFindingData: React.Dispatch<
    React.SetStateAction<{
      application_id?: string;
      finding_type: string;
      framework_id?: string;
      control_id?: string;
      test_id?: string;
      test_run_id?: string;
      result_id?: string;
      requirement_id?: string;
    }>
  >;
  setFindingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  mutate: () => void;
}) => {
  const [expandedControl, setExpandedControl] = useState<string | null>(null);
  const [expandedFramework, setExpandedFramework] = useState<string | null>(
    null
  );
  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(
    null
  );

  // Accordion Toggles
  const toggleFramework = (ids: string) => {
    setExpandedFramework(expandedFramework === ids ? null : ids);
    setExpandedRequirement(null);
    setExpandedControl(null);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm hover:shadow-md dark:border-neutral-800 dark:bg-darkSidebarBackground">
      <button
        onClick={() => toggleFramework(framework.framework_id)}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
      >
        <div className="flex items-center gap-5">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
              expandedFramework === framework.framework_id
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                : "bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
            }`}
          >
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {framework.name}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {framework.short_name}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="text-slate-500 dark:text-slate-400">
                {framework.publisher}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="text-slate-500 dark:text-slate-400">
                {framework.requirements.length} Requirements
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {Math.round(framework.requirements_completion_percentage ?? 0)}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Complete
            </div>
          </div>
          <FrameworkStatusBadge
            status={framework.audit_status || "not_complete"}
          />
          <ChevronRight
            className={`text-slate-400 transition-transform duration-300 ${
              expandedFramework === framework.framework_id ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>
      {expandedFramework === framework.framework_id && (
        <motion.div className="border-t border-slate-100 bg-slate-50/50 dark:border-neutral-800 dark:bg-darkSidebarBackground">
          <div className="p-6">
            <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-neutral-900 dark:bg-darkSidebarBackground">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Info className="h-3 w-3" /> Description
              </p>
              <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                {framework.description || "No description available."}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                <Layers className="h-4 w-4" />
                Requirements ({framework.requirements.length})
              </h4>

              {framework.requirements.map((requirement) => (
                <RequirementsCard
                  key={requirement?.requirement_id}
                  currentMenuAccessButton={currentMenuAccessButton}
                  framework={framework}
                  requirement={requirement}
                  setFindingData={setFindingData}
                  setFindingOpen={setFindingOpen}
                  setDrawerOpen={setDrawerOpen}
                  id={id}
                  mutate={mutate}
                  expandedRequirement={expandedRequirement}
                  setExpandedRequirement={setExpandedRequirement}
                  expandedControl={expandedControl}
                  setExpandedControl={setExpandedControl}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FrameworkCard;
