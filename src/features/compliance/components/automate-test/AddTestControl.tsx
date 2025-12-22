"use client";
import useMutation from "@/shared/hooks/useMutation";
import useSwr from "@/shared/hooks/useSwr";
import { Dialog } from "@mui/material";
import { AlertCircle, Check, Plus, Trash2, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
const DeveloperPortal = dynamic(() => import("./DeveloperPortal"), {
  ssr: false
});
interface Control {
  id: string;
  name: string;
  category: string;
  control_type: string;
  severity_level: string;
  tags: string[];
  requirement_ids: string[];
  doc_id: string;
}

interface AddTestControlProps {
  open: boolean;
  onClose: () => void;
  testId: string;
  applicationId: string;
  existingControlIds: string[];
  mutate: () => void;
}
const ControlItem = React.memo(
  ({
    control,
    isSelected,
    isAdded,
    onToggle
  }: {
    control: Control;
    isSelected: boolean;
    isAdded: boolean;
    onToggle: (id: string) => void;
  }) => {
    return (
      <button
        onClick={() => onToggle(control.doc_id)}
        className={`w-full rounded-lg px-4 py-3 text-left transition-all duration-200 ${
          isSelected
            ? "scale-[1.02] bg-gradient-to-r from-tertiary-500 to-tertiary-500 text-white shadow-lg"
            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4
                className={`truncate text-sm font-semibold ${isSelected ? "text-white" : "text-gray-900 dark:text-white"}`}
              >
                {control.name}
              </h4>
            </div>
            <p
              className={`truncate text-xs ${isSelected ? "text-tertiary-100" : "text-gray-500 dark:text-gray-400"}`}
            >
              {control.id}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
              >
                {control.category}
              </span>
            </div>
          </div>
          {isSelected && (
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
          )}
          {isAdded && (
            <p
              className={`rounded-md px-2 py-1 text-xs font-medium ${isSelected ? "bg-white/20 text-white" : "bg-tertiary text-white"}`}
            >
              Added
            </p>
          )}
        </div>
      </button>
    );
  }
);

ControlItem.displayName = "ControlItem";
const AddTestControl: React.FC<AddTestControlProps> = ({
  open,
  onClose,
  testId,
  applicationId,
  existingControlIds,
  mutate
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedControls, setSelectedControls] = useState<Set<string>>(
    new Set()
  );
  const [openDeveloperMode, setOpenDeveloperMode] = useState<boolean>(false);

  // FIX: Local state ensures UI updates instantly when you Add/Remove
  const [currentAddedIds, setCurrentAddedIds] = useState<string[]>([]);

  useEffect(() => {
    setCurrentAddedIds(existingControlIds || []);
  }, [existingControlIds, open]);

  const { data: allControls = [], isValidating: loading } = useSwr(
    open && applicationId
      ? `control/filter?application_id=${applicationId}`
      : null
  );

  const { mutation, isLoading: processing } = useMutation();

  const filteredControls = useMemo(() => {
    if (!searchTerm) {
      return allControls;
    }
    const term = searchTerm.toLowerCase();
    return allControls?.filter(
      (c: Control) =>
        c.name.toLowerCase().includes(term) ||
        c.id.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
    );
  }, [allControls, searchTerm]);

  const selectedControlsData = useMemo(() => {
    // Use allControls to ensure we have data even if search changes
    const source = allControls.length > 0 ? allControls : filteredControls;
    return source.filter((c: Control) => selectedControls.has(c.doc_id));
  }, [allControls, filteredControls, selectedControls]);

  // Logic to split selection into "To Add" and "To Remove"
  const { controlsToAdd, controlsToRemove } = useMemo(() => {
    const toAdd: Control[] = [];
    const toRemove: Control[] = [];

    selectedControlsData.forEach((c: Control) => {
      if (currentAddedIds.includes(c.doc_id)) {
        toRemove.push(c);
      } else {
        toAdd.push(c);
      }
    });

    return { controlsToAdd: toAdd, controlsToRemove: toRemove };
  }, [selectedControlsData, currentAddedIds]);

  const toggleControl = useCallback((controlId: string) => {
    setSelectedControls((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(controlId)) {
        newSet.delete(controlId);
      } else {
        newSet.add(controlId);
      }
      return newSet;
    });
  }, []);

  // --- Handlers ---

  const handleAdd = async () => {
    if (controlsToAdd.length === 0) {
      return;
    }

    try {
      const newIds = controlsToAdd.map((c) => c.doc_id);
      const finalIds = [...currentAddedIds, ...newIds];

      const res = await mutation(`test?test_id=${testId}`, {
        method: "PUT",
        isAlert: false,
        body: { control_ids: finalIds }
      });

      if (res?.status === 200 || res?.status === 201) {
        setOpenDeveloperMode(true);
        toast.success(`${controlsToAdd.length} control(s) added successfully!`);

        // Update Local State Instantly
        setCurrentAddedIds(finalIds);

        // Deselect the items we just added
        setSelectedControls((prev) => {
          const next = new Set(prev);
          newIds.forEach((id) => next.delete(id));
          return next;
        });

        mutate();
      }
    } catch {
      toast.error("Failed to add controls");
    }
  };

  const handleRemove = async () => {
    if (controlsToRemove.length === 0) {
      return;
    }

    const result = await Swal.fire({
      title: "Remove Controls?",
      text: `Are you sure you want to remove ${controlsToRemove.length} control(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Remove",
      didOpen: () => {
        const container = document.querySelector(
          ".swal2-container"
        ) as HTMLElement;
        if (container) {
          container.style.zIndex = "9999";
        }
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const idsToRemove = controlsToRemove.map((c) => c.doc_id);
      const finalIds = currentAddedIds.filter(
        (id) => !idsToRemove.includes(id)
      );

      const res = await mutation(`test?test_id=${testId}`, {
        method: "PUT",
        isAlert: false,
        body: { control_ids: finalIds }
      });

      if (res?.status === 200 || res?.status === 201) {
        toast.success(`${controlsToRemove.length} control(s) removed!`);

        // Update Local State Instantly
        setCurrentAddedIds(finalIds);

        // Deselect the items we just removed
        setSelectedControls((prev) => {
          const next = new Set(prev);
          idsToRemove.forEach((id) => next.delete(id));
          return next;
        });

        mutate();
      }
    } catch {
      toast.error("Failed to remove controls");
    }
  };

  const handleClose = useCallback(() => {
    setSearchTerm("");
    setSelectedControls(new Set());
    onClose();
    setOpenDeveloperMode(false);
  }, [onClose]);

  const selectAll = useCallback(() => {
    const allIds = filteredControls.map((c: Control) => c.doc_id);
    setSelectedControls(new Set(allIds));
  }, [filteredControls]);

  const deselectAll = useCallback(() => {
    setSelectedControls(new Set());
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900 rounded-xl shadow-2xl"
      }}
    >
      <div className="flex h-[700px] flex-col">
        {/* Header - Original Gradient */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-tertiary-50 to-tertiary-50 px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {openDeveloperMode
                ? "Select Evaluation Provider"
                : " Add Control to Test"}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {openDeveloperMode
                ? "Select the evaluation provider, follow the next steps, and send the request body."
                : "Select and add security controls to your test."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 transition-all hover:rotate-90 hover:bg-white hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {openDeveloperMode ? (
          <div className="p-5">
            <DeveloperPortal id={testId as string} />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* LEFT PANEL */}
            <div className="flex w-2/5 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="space-y-3 border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search controls by name, ID, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-tertiary-500 focus:outline-none focus:ring-2 focus:ring-tertiary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {filteredControls.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAll}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Deselect All
                    </button>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Available Controls ({filteredControls.length}) | Selected (
                  {selectedControls.size})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <svg
                      className="h-12 w-12 animate-spin text-tertiary-500"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Loading controls...
                    </p>
                  </div>
                ) : filteredControls.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                    <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                      <AlertCircle className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                      {allControls?.length === 0
                        ? "No Controls Available"
                        : "No Results Found"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No controls match your search.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-3">
                    {filteredControls?.map((control: Control) => {
                      const isSelected = selectedControls.has(control.doc_id);
                      // Use LOCAL state for immediate UI updates
                      const isAdded = currentAddedIds.includes(control.doc_id);

                      return (
                        <ControlItem
                          key={control.doc_id}
                          control={control}
                          isSelected={isSelected}
                          isAdded={isAdded}
                          onToggle={toggleControl}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex w-3/5 flex-col bg-white dark:bg-gray-900">
              {selectedControlsData.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="px-8 text-center">
                    <div className="mb-6 inline-block rounded-full bg-gradient-to-br from-tertiary-100 to-tertiary-100 p-6 dark:from-tertiary-900/30 dark:to-tertiary-900/30">
                      <Plus className="h-16 w-16 text-tertiary-500 dark:text-tertiary-400" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                      Select Controls
                    </h3>
                    <p className="mx-auto max-w-sm text-sm text-gray-500 dark:text-gray-400">
                      Choose one or more controls from the list to view details
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* Right Header with Compact Action Buttons */}
                  <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Selected Controls ({selectedControlsData.length})
                      </h3>

                      <div className="flex gap-2">
                        {controlsToAdd.length > 0 && (
                          <button
                            onClick={handleAdd}
                            disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-tertiary-600 to-tertiary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:from-tertiary-700 hover:to-tertiary-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processing ? (
                              "..."
                            ) : (
                              <Plus className="h-3.5 w-3.5" />
                            )}
                            Add {controlsToAdd.length}
                          </button>
                        )}

                        {controlsToRemove.length > 0 && (
                          <button
                            onClick={handleRemove}
                            disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processing ? (
                              "..."
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Remove {controlsToRemove.length}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Body - Original Card Design */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {selectedControlsData.map((control: Control) => {
                        const isAdded = currentAddedIds.includes(
                          control.doc_id
                        );
                        return (
                          <div
                            key={control.doc_id}
                            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">
                                    {control.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {control.id}
                                  </p>
                                </div>
                                {isAdded && (
                                  <span className="rounded-md bg-tertiary px-2 py-1 text-xs font-medium text-white">
                                    Already Added
                                  </span>
                                )}
                              </div>
                              <div>
                                <h5 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  Domain
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {control.category}
                                </p>
                              </div>
                              <div>
                                <h5 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  Frameworks
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                    {control.control_type}
                                  </span>
                                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                    {control.severity_level}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <h5 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                  Related sections
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {control.tags.map(
                                    (tag: string, i: number) => (
                                      <span
                                        key={i}
                                        className="rounded-md bg-tertiary-50 px-2 py-0.5 text-xs text-tertiary-700 dark:bg-tertiary-900/30 dark:text-tertiary-300"
                                      >
                                        {tag}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default AddTestControl;
