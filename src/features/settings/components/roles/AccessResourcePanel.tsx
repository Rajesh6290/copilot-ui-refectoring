"use client";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  Shield,
  X
} from "lucide-react";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Badge, RoleFormValues } from "./AddNewRole";
import dynamic from "next/dynamic";
const PermissionCard = dynamic(() => import("./PermissionCard"), {
  ssr: false
});

const AccessResourcePanel = memo(
  ({ formik }: { formik: ReturnType<typeof useFormik<RoleFormValues>> }) => {
    const [activeSection, setActiveSection] = useState<number | null>(null);
    const [activeSubgroup, setActiveSubgroup] = useState<{
      sectionIndex: number;
      subgroupIndex: number;
    } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close mobile menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          sidebarRef.current &&
          !sidebarRef.current.contains(event.target as Node) &&
          isMobileMenuOpen
        ) {
          setIsMobileMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isMobileMenuOpen]);

    const handleSectionToggle = useCallback((index: number) => {
      setActiveSection((prev) => (prev === index ? null : index));
    }, []);

    const handleSubgroupSelect = useCallback(
      (sectionIndex: number, subgroupIndex: number) => {
        setActiveSubgroup((prev) =>
          prev?.sectionIndex === sectionIndex &&
          prev?.subgroupIndex === subgroupIndex
            ? null
            : { sectionIndex, subgroupIndex }
        );
        setIsMobileMenuOpen(false);
      },
      []
    );

    const hasAnyPermission = useCallback(
      (sectionIndex: number): boolean => {
        return (
          formik.values.featureGroups[sectionIndex]?.subgroups.some(
            (subgroup) => subgroup.permission !== "no_access"
          ) ?? false
        );
      },
      [formik.values.featureGroups]
    );

    const updateSectionIsShown = useCallback(
      (sectionIndex: number) => {
        const anyPermission = hasAnyPermission(sectionIndex);
        if (
          formik.values.featureGroups[sectionIndex]?.is_shown !== anyPermission
        ) {
          formik.setFieldValue(
            `featureGroups.${sectionIndex}.is_shown`,
            anyPermission,
            false
          );
        }
      },
      [formik, hasAnyPermission]
    );

    useEffect(() => {
      formik.values.featureGroups.forEach((_, sectionIndex) => {
        updateSectionIsShown(sectionIndex);
      });
    }, [formik.values.featureGroups, updateSectionIsShown]);

    const handlePermissionChange = useCallback(
      (
        sectionIndex: number,
        subgroupIndex: number,
        permission: "manager" | "contributor" | "viewer" | "no_access"
      ) => {
        formik.setFieldValue(
          `featureGroups.${sectionIndex}.subgroups.${subgroupIndex}.permission`,
          permission,
          true
        );
        updateSectionIsShown(sectionIndex);
      },
      [formik, updateSectionIsShown]
    );

    const isAllSelected = useCallback(
      (
        sectionIndex: number,
        permission: "manager" | "contributor" | "viewer" | "no_access"
      ): boolean => {
        return (
          formik.values.featureGroups[sectionIndex]?.subgroups.every(
            (subgroup) => subgroup.permission === permission
          ) ?? false
        );
      },
      [formik.values.featureGroups]
    );

    const handleSelectAll = useCallback(
      (
        sectionIndex: number,
        permission: "manager" | "contributor" | "viewer" | "no_access"
      ) =>
        (event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          event.stopPropagation();

          formik.setValues({
            ...formik.values,
            featureGroups: formik.values.featureGroups.map((section, idx) => {
              if (idx !== sectionIndex) {
                return section;
              }
              return {
                ...section,
                is_shown: permission !== "no_access",
                subgroups: section.subgroups.map((subgroup) => ({
                  ...subgroup,
                  permission
                }))
              };
            })
          });
        },
      [formik]
    );

    const formatLabel = useCallback((label: string) => {
      return (
        label
          ?.split(/[-_]/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") || "Unknown"
      );
    }, []);

    const filteredFeatureGroups = useMemo(() => {
      if (!searchTerm) {
        return formik.values.featureGroups;
      }

      return formik.values.featureGroups
        .map((section) => {
          const filteredSubgroups = section.subgroups.filter((subgroup) =>
            formatLabel(subgroup.label)
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );

          return {
            ...section,
            subgroups: filteredSubgroups
          };
        })
        .filter((section) => section.subgroups.length > 0);
    }, [formik.values.featureGroups, searchTerm, formatLabel]);

    return (
      <div className="relative flex h-full flex-col gap-4 lg:flex-row">
        {/* Mobile menu button */}
        <button
          className="mb-4 flex items-center gap-2 rounded-lg bg-tertiary-50 p-2 text-tertiary-600 dark:bg-tertiary-900/20 dark:text-tertiary-400 lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`}
          />
          <span className="font-medium">
            {activeSubgroup
              ? formatLabel(
                  formik.values.featureGroups[activeSubgroup.sectionIndex]
                    ?.subgroups[activeSubgroup.subgroupIndex]?.label || ""
                )
              : "Select Feature"}
          </span>
        </button>

        {/* Sidebar - Feature Groups List */}
        <div
          ref={sidebarRef}
          className={`overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 lg:w-1/4 lg:max-w-xs lg:flex-shrink-0 ${isMobileMenuOpen ? "absolute left-0 right-0 top-12 z-10 max-h-[80vh]" : "hidden lg:block"}`}
        >
          <div className="p-4">
            <div className="relative mb-4">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 p-2 pl-10 text-sm focus:border-tertiary-500 focus:ring-2 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Search features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>

            <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Feature Access
            </h2>

            {searchTerm && filteredFeatureGroups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500 dark:text-gray-400">
                <AlertCircle className="mb-2 h-10 w-10 opacity-50" />
                <p>No features found</p>
              </div>
            )}

            {filteredFeatureGroups.map((section, sectionIndex) => (
              <div key={`section-${sectionIndex}`} className="mb-2">
                <div
                  tabIndex={0}
                  role="button"
                  className={`flex cursor-pointer items-center justify-between rounded-md p-2 ${
                    activeSection === sectionIndex
                      ? "bg-tertiary-50 dark:bg-tertiary-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleSectionToggle(sectionIndex)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSectionToggle(sectionIndex);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={false}
                      animate={{
                        rotate: activeSection === sectionIndex ? 90 : 0
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </motion.div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatLabel(section.label)}
                    </span>
                  </div>
                  {section.is_shown && (
                    <Badge variant="primary">
                      {
                        section.subgroups.filter(
                          (subgroup) => subgroup.permission !== "no_access"
                        ).length
                      }
                    </Badge>
                  )}
                </div>
                {activeSection === sectionIndex && (
                  <div className="mt-1 space-y-1 pl-6">
                    {section.subgroups.map((subgroup, subgroupIndex) => (
                      <div
                        key={`subgroup-${sectionIndex}-${subgroupIndex}`}
                        tabIndex={0}
                        role="button"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSubgroupSelect(sectionIndex, subgroupIndex);
                          }
                        }}
                        className={`flex cursor-pointer items-center justify-between rounded-md p-2 text-sm ${
                          activeSubgroup?.sectionIndex === sectionIndex &&
                          activeSubgroup?.subgroupIndex === subgroupIndex
                            ? "bg-tertiary-100 text-tertiary-700 dark:bg-tertiary-900/30 dark:text-tertiary-300"
                            : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                        } ${subgroup.permission !== "no_access" ? "font-medium" : "font-normal"}`}
                        onClick={() =>
                          handleSubgroupSelect(sectionIndex, subgroupIndex)
                        }
                      >
                        <span>{formatLabel(subgroup.label)}</span>
                        {subgroup.permission !== "no_access" && (
                          <div className="flex h-2 w-2 rounded-full bg-tertiary-500" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          {activeSubgroup ? (
            <div className="h-full">
              {(() => {
                const { sectionIndex, subgroupIndex } = activeSubgroup;
                const subgroup =
                  formik.values.featureGroups[sectionIndex]?.subgroups[
                    subgroupIndex
                  ];
                const sectionName = formatLabel(
                  formik.values.featureGroups[sectionIndex]?.label || ""
                );

                if (!subgroup) {
                  return (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <AlertCircle className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                      <h2 className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">
                        Feature Not Found
                      </h2>
                      <p className="max-w-md text-sm text-gray-500 dark:text-gray-300">
                        Please select a valid feature from the sidebar.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="mb-4 flex flex-wrap items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                      <div className="mb-2 sm:mb-0">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {sectionName} /
                        </div>
                        <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                          {formatLabel(subgroup.label)}
                        </h2>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {subgroup.permission !== "no_access"
                              ? formatLabel(subgroup.permission)
                              : "No Access"}
                          </span>
                          {subgroup.permission !== "no_access" ? (
                            <Check className="h-4 w-4 text-tertiary-600" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex gap-2">
                          {[
                            {
                              label: "Select All Manager",
                              permission: "manager"
                            },
                            {
                              label: "Select All Contributor",
                              permission: "contributor"
                            },
                            {
                              label: "Select All Viewer",
                              permission: "viewer"
                            },
                            { label: "Deselect All", permission: "no_access" }
                          ].map(({ label, permission }) => (
                            <button
                              key={permission}
                              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                                isAllSelected(
                                  sectionIndex,
                                  permission as
                                    | "manager"
                                    | "contributor"
                                    | "viewer"
                                    | "no_access"
                                )
                                  ? "bg-tertiary-100 text-tertiary-700 dark:bg-tertiary-900/30 dark:text-tertiary-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                              onClick={handleSelectAll(
                                sectionIndex,
                                permission as
                                  | "manager"
                                  | "contributor"
                                  | "viewer"
                                  | "no_access"
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <PermissionCard
                        title="Manager"
                        description="Full control over the feature"
                        selected={subgroup.permission === "manager"}
                        onSelect={() =>
                          handlePermissionChange(
                            sectionIndex,
                            subgroupIndex,
                            "manager"
                          )
                        }
                        permissionType="manager"
                        permissions={["Create", "Read", "Update", "Delete"]}
                      />
                      <PermissionCard
                        title="Contributor"
                        description="Can contribute and edit content"
                        selected={subgroup.permission === "contributor"}
                        onSelect={() =>
                          handlePermissionChange(
                            sectionIndex,
                            subgroupIndex,
                            "contributor"
                          )
                        }
                        permissionType="contributor"
                        permissions={["Create", "Read", "Update"]}
                      />
                      <PermissionCard
                        title="Viewer"
                        description="Read-only access"
                        selected={subgroup.permission === "viewer"}
                        onSelect={() =>
                          handlePermissionChange(
                            sectionIndex,
                            subgroupIndex,
                            "viewer"
                          )
                        }
                        permissionType="viewer"
                        permissions={["Read"]}
                      />
                      <PermissionCard
                        title="No Access"
                        description="No access to this feature"
                        selected={subgroup.permission === "no_access"}
                        onSelect={() =>
                          handlePermissionChange(
                            sectionIndex,
                            subgroupIndex,
                            "no_access"
                          )
                        }
                        permissionType="no_access"
                        permissions={[]}
                      />
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <Shield className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
              <h2 className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">
                Select a feature to configure access
              </h2>
              <p className="max-w-md text-sm text-gray-500 dark:text-gray-300">
                Choose a feature group and a subgroup from the sidebar to manage
                its permissions.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);
AccessResourcePanel.displayName = "AccessResourcePanel";
export default AccessResourcePanel;
