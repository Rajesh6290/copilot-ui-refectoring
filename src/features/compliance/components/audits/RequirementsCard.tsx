import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import React from "react";
import { Framework, IsAccess, Requirement, StatusBadge } from "./AuditDetails";
import ControlCard from "./ControlCard";

const RequirementsCard = ({
  requirement,
  expandedRequirement,
  setExpandedRequirement,
  expandedControl,
  setExpandedControl,
  mutate,
  id,
  currentMenuAccessButton,
  setFindingData,
  framework,
  setFindingOpen,
  setDrawerOpen
}: {
  requirement: Requirement;
  expandedRequirement: string | null;
  setExpandedRequirement: React.Dispatch<React.SetStateAction<string | null>>;
  expandedControl: string | null;
  setExpandedControl: React.Dispatch<React.SetStateAction<string | null>>;
  mutate: () => void;
  id: string;
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
  framework: Framework;
  setFindingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const toggleRequirement = (ide: string) => {
    setExpandedRequirement(expandedRequirement === ide ? null : ide);
    setExpandedControl(null);
  };

  return (
    <motion.div
      layout
      key={requirement.requirement_id}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-neutral-900 dark:bg-darkSidebarBackground"
    >
      <motion.button
        layout="position"
        onClick={() => toggleRequirement(requirement.requirement_id)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <div className="flex items-center gap-3">
          <ChevronRight
            className={`h-4 w-4 text-slate-300 transition-transform duration-300 ${
              expandedRequirement === requirement.requirement_id
                ? "rotate-90 text-indigo-500"
                : ""
            } dark:text-slate-600`}
          />
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-400 dark:text-white">
                {requirement.requirement_id}
              </span>
              <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                {requirement.section}
              </span>
            </div>
            <h5 className="font-bold text-slate-900 dark:text-white">
              {requirement.requirement_name}
            </h5>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{requirement.controls_count} Controls</span>
              <span>•</span>
              <span>
                {Math.round(requirement.controls_completion_percentage ?? 0)}%
                Complete
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={requirement.audit_status || "not_complete"} />
      </motion.button>
      {expandedRequirement === requirement.requirement_id && (
        <motion.div className="border-t border-slate-100 bg-slate-50/50 dark:border-neutral-900 dark:bg-darkSidebarBackground">
          <div className="space-y-4 p-5">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                Description
              </p>
              <p className="rounded-xl border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-neutral-800 dark:bg-darkSidebarBackground dark:text-slate-300">
                {requirement.description || "No description available."}
              </p>
            </div>

            {requirement.controls?.length > 0 && (
              <div className="flex w-full flex-col gap-5">
                {requirement?.controls?.filter(
                  (ctl) => ctl?.sub_type === "Compliance Control"
                )?.length > 0 && (
                  <div className="rounded-xl bg-white p-5 shadow dark:border dark:border-neutral-900 dark:bg-darkSidebarBackground">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                      Organizational level controls (
                      {
                        requirement?.controls?.filter(
                          (ctl) => ctl?.sub_type === "Compliance Control"
                        ).length
                      }
                      )
                    </p>
                    <div className="space-y-2">
                      {requirement?.controls
                        ?.filter(
                          (ctl) => ctl?.sub_type === "Compliance Control"
                        )
                        ?.map((control) => (
                          <ControlCard
                            key={control?.control_id}
                            control={control}
                            expandedControl={expandedControl}
                            setExpandedControl={setExpandedControl}
                            requirement={requirement}
                            mutate={mutate}
                            id={id}
                            currentMenuAccessButton={currentMenuAccessButton}
                            setFindingData={setFindingData}
                            framework={framework}
                            setFindingOpen={setFindingOpen}
                            setDrawerOpen={setDrawerOpen}
                            type="Compliance Control"
                          />
                        ))}
                    </div>
                  </div>
                )}
                {requirement?.controls?.filter(
                  (ctl) => ctl?.sub_type === "Risk Control"
                )?.length > 0 && (
                  <div className="rounded-xl bg-white p-5 shadow dark:border dark:border-neutral-900 dark:bg-darkSidebarBackground">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                      Application level controls (
                      {
                        requirement?.controls?.filter(
                          (ctl) => ctl?.sub_type === "Risk Control"
                        ).length
                      }
                      )
                    </p>
                    <div className="space-y-2">
                      {requirement?.controls
                        ?.filter((ctl) => ctl?.sub_type === "Risk Control")
                        ?.map((control) => (
                          <ControlCard
                            key={control?.control_id}
                            control={control}
                            expandedControl={expandedControl}
                            setExpandedControl={setExpandedControl}
                            requirement={requirement}
                            mutate={mutate}
                            id={id}
                            currentMenuAccessButton={currentMenuAccessButton}
                            setFindingData={setFindingData}
                            framework={framework}
                            setFindingOpen={setFindingOpen}
                            setDrawerOpen={setDrawerOpen}
                            type="Risk Control"
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RequirementsCard;
