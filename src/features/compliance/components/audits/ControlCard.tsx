import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  Control,
  Framework,
  IsAccess,
  Requirement,
  StatusBadge
} from "./AuditDetails";

const ControlCard = ({
  control,
  expandedControl,
  setExpandedControl,
  mutate,
  id,
  currentMenuAccessButton,
  setFindingData,
  framework,
  requirement,
  setDrawerOpen,
  setFindingOpen,
  type
}: {
  control: Control;
  expandedControl: string | null;
  setExpandedControl: React.Dispatch<React.SetStateAction<string | null>>;
  mutate: () => void;
  id: string;
  type: string;
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
  requirement: Requirement;
  setFindingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isLoading, mutation } = useMutation();
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);

  const router = useRouter();
  // Safe date formatter
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

  const toggleControl = (idd: string) => {
    setExpandedControl(expandedControl === idd ? null : idd);
  };
  const handleUpdateControl = async (updatedControl: Control) => {
    try {
      const result = await Swal.fire({
        title: "Mark Control as Complete?",
        text: `Are you sure you want to mark "${updatedControl.name}" as complete?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, mark complete",
        cancelButtonText: "Cancel"
      });

      if (result.isConfirmed) {
        // Handle control_doc_ids as an array with Promise.all for concurrent calls
        const controlDocIds = Array.isArray(updatedControl.control_doc_ids)
          ? updatedControl.control_doc_ids
          : [updatedControl.control_doc_ids];

        const promises = controlDocIds.map((controlDocId) =>
          mutation(
            `audits/control-mapping?audit_id=${id}&control_doc_id=${controlDocId}&status=complete`,
            {
              method: "PATCH",
              isAlert: false
            }
          )
        );

        const responses = await Promise.all(promises);

        // Check if all requests were successful
        const allSuccessful = responses.every((res) => res?.status === 200);

        if (allSuccessful) {
          toast.success("Status updated successfully for all controls.");
          setSelectedControl(null);
          mutate();
        } else {
          toast.error("Some controls could not be updated. Please try again.");
        }
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while updating the control."
      );
    }
  };
  return (
    <motion.div
      layout
      key={control.control_id}
      className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-neutral-900 dark:bg-darkSidebarBackground"
    >
      <motion.div
        layout="position"
        onClick={() => toggleControl(control.control_id)}
        className="flex w-full cursor-pointer items-center justify-between p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`h-3 w-3 text-slate-300 transition-transform duration-300 ${
              expandedControl === control.control_id
                ? "rotate-90 text-indigo-500"
                : ""
            } dark:text-slate-600`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400 dark:text-white">
                {control.control_id}
              </span>
              <h6 className="text-sm font-bold text-slate-900 dark:text-white">
                {control.name}
              </h6>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs">
              <span className="rounded bg-purple-50 px-1.5 py-0.5 font-semibold text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                {control.category}
              </span>
              <span className="capitalize text-slate-400 dark:text-white">
                {control.control_type}
              </span>
              {control.evidence_count > 0 && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {control.evidence_count} Evidence
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {currentMenuAccessButton?.buttons?.[0]?.permission?.is_shown &&
            type !== "Risk Control" && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (
                    currentMenuAccessButton?.buttons?.[0]?.permission?.actions
                      ?.create
                  ) {
                    setFindingData({
                      finding_type: "audit",
                      ...(framework.framework_doc_id && {
                        framework_id: framework.framework_doc_id
                      }),
                      ...(requirement.requirement_doc_id && {
                        requirement_id: requirement.requirement_doc_id
                      }),
                      ...(control.control_doc_ids?.[0] && {
                        control_id: control.control_doc_ids[0]
                      })
                    });
                    setFindingOpen(true);
                  } else {
                    toast.error(
                      "You do not have permission to perform this action."
                    );
                  }
                }}
                className="w-fit text-nowrap rounded-full border border-tertiary px-3 py-1.5 text-xs font-medium text-tertiary duration-200 hover:bg-tertiary hover:text-white"
              >
                Add Finding
              </button>
            )}

          {control?.findings_count > 0 &&
            currentMenuAccessButton?.buttons?.[1]?.permission?.is_shown &&
            type !== "Risk Control" && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (
                    currentMenuAccessButton?.buttons?.[0]?.permission?.actions
                      ?.read
                  ) {
                    setFindingData({
                      finding_type: "audit",
                      ...(framework.framework_doc_id && {
                        framework_id: framework.framework_doc_id
                      }),
                      ...(requirement.requirement_doc_id && {
                        requirement_id: requirement.requirement_doc_id
                      }),
                      ...(control.control_doc_ids?.[0] && {
                        control_id: control.control_doc_ids[0]
                      })
                    });
                    setDrawerOpen(true);
                  } else {
                    toast.error(
                      "You do not have permission to perform this action."
                    );
                  }
                }}
                className="w-fit text-nowrap rounded-full border border-tertiary px-3 py-1.5 text-xs font-medium text-tertiary duration-200 hover:bg-tertiary hover:text-white"
              >
                View Findings ({control?.findings_count})
              </button>
            )}
          {currentMenuAccessButton?.buttons?.[2]?.permission?.is_shown && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (
                  currentMenuAccessButton?.buttons?.[2]?.permission?.actions
                    ?.read
                ) {
                  router.push(
                    type === "Risk Control"
                      ? `/compliance/audits/${id}/risk-control/${control?.control_id}?_name=${control?.name}`
                      : `/compliance/controls/${control?.control_doc_ids?.[0]}?_name=${control?.name}`
                  );
                } else {
                  toast.error(
                    "You do not have permission to perform this action."
                  );
                }
              }}
              className="w-fit text-nowrap rounded-full border border-tertiary px-3 py-1.5 text-xs font-medium text-tertiary duration-200 hover:bg-tertiary hover:text-white"
            >
              Go to control
            </button>
          )}

          <StatusBadge status={control.audit_status || "not_complete"} />
          {control?.actual_status === "complete" &&
            control?.audit_status !== "complete" &&
            currentMenuAccessButton?.buttons?.[3]?.permission?.is_shown && (
              <div className="w-fit">
                <CustomButton
                  loading={
                    selectedControl?.control_id === control.control_id &&
                    isLoading
                  }
                  loadingText="Updating..."
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedControl(control);
                    handleUpdateControl(control);
                  }}
                  disabled={
                    !currentMenuAccessButton?.buttons?.[3]?.permission?.actions
                      ?.update
                  }
                  className="w-fit !text-[0.7rem]"
                >
                  Mark as complete
                </CustomButton>
              </div>
            )}
        </div>
      </motion.div>

      {expandedControl === control.control_id && (
        <motion.div className="border-t border-slate-100 dark:border-neutral-900 dark:bg-darkSidebarBackground">
          <div className="p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Description
            </p>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {control.description || "No description."}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-darkMainBackground">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Control Implementation Status
                </p>
                <p className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
                  {control.actual_status.replace("_", " ")}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-darkMainBackground">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Evidence Count
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {control.evidence_count}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Last Updated: {formatDate(control.last_updated)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ControlCard;
