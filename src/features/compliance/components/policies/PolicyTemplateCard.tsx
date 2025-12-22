import { useMyContext } from "@/shared/providers/AppProvider";
import { useResponsiveBreakpoints } from "@/shared/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { PolicyTemplate } from "./PolicyTemplateSelector";

const PolicyTemplateCard = ({
  template,
  isSelected,
  onSelect
}: {
  template: PolicyTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const { isMobile } = useResponsiveBreakpoints();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showAllTags, setShowAllTags] = useState<boolean>(false);
  const [showAllFrameworks, setShowAllFrameworks] = useState<boolean>(false);
  const { setMetaTitle } = useMyContext();
  // Calculate visibility limits
  const visibleTagsLimit = isMobile ? 2 : 3;
  const visibleFrameworkLimit = 3;

  // Decide which tags to show
  const visibleTags = useMemo(() => {
    if (!template.tags) {
      return [];
    }
    return showAllTags
      ? template.tags
      : template.tags.slice(0, visibleTagsLimit);
  }, [template.tags, showAllTags, visibleTagsLimit]);

  // Decide which frameworks to show
  const visibleFrameworks = useMemo(() => {
    if (!template.framework) {
      return [];
    }
    return showAllFrameworks
      ? template.framework
      : template.framework.slice(0, visibleFrameworkLimit);
  }, [template.framework, showAllFrameworks, visibleFrameworkLimit]);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md ${
        isSelected
          ? "border-tertiary-400 bg-tertiary-50 dark:border-tertiary-500 dark:bg-tertiary-900/20"
          : "border-gray-200 bg-white hover:border-tertiary-200 dark:border-neutral-600 dark:bg-darkMainBackground dark:hover:border-tertiary-800"
      }`}
      initial={{ height: "auto" }}
      animate={{ height: "auto" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className={isMobile ? "max-w-[75%]" : ""}>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {template.name}
            </h3>

            {isMobile && template.description && (
              <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                {template.description}
              </p>
            )}
          </div>
        </div>

        {template.tags && template.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center">
              <Tag
                size={14}
                className="mr-1 text-gray-500 dark:text-gray-400"
              />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Tags
              </p>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {visibleTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > visibleTagsLimit && !showAllTags && (
                <button
                  onClick={() => setShowAllTags(true)}
                  className="inline-flex items-center rounded-full bg-tertiary-100 px-2 py-0.5 text-xs text-tertiary-700 transition-colors hover:bg-tertiary-200 dark:bg-tertiary-900/30 dark:text-tertiary-300 dark:hover:bg-tertiary-800/40"
                >
                  +{template.tags.length - visibleTagsLimit} more
                </button>
              )}
              {showAllTags && template.tags.length > visibleTagsLimit && (
                <button
                  onClick={() => setShowAllTags(false)}
                  className="inline-flex items-center rounded-full bg-tertiary-100 px-2 py-0.5 text-xs text-tertiary-700 transition-colors hover:bg-tertiary-200 dark:bg-tertiary-900/30 dark:text-tertiary-300 dark:hover:bg-tertiary-800/40"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-hidden"
            >
              <div className="space-y-3">
                {template.description && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </h4>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {template.description}
                    </p>
                  </div>
                )}

                {template?.framework && template.framework.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Framework
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {visibleFrameworks.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-tertiary-50 px-2 py-0.5 text-xs text-tertiary-700 transition-colors hover:bg-tertiary-100 dark:bg-tertiary-900/30 dark:text-tertiary-300 dark:hover:bg-tertiary-800/40"
                        >
                          {item}
                        </span>
                      ))}
                      {template.framework.length > visibleFrameworkLimit &&
                        !showAllFrameworks && (
                          <button
                            onClick={() => setShowAllFrameworks(true)}
                            className="inline-flex items-center rounded-full bg-tertiary-100 px-2 py-0.5 text-xs text-tertiary-700 transition-colors hover:bg-tertiary-200 dark:bg-tertiary-900/30 dark:text-tertiary-300 dark:hover:bg-tertiary-800/40"
                          >
                            +{template.framework.length - visibleFrameworkLimit}{" "}
                            more
                          </button>
                        )}
                      {showAllFrameworks &&
                        template.framework.length > visibleFrameworkLimit && (
                          <button
                            onClick={() => setShowAllFrameworks(false)}
                            className="inline-flex items-center rounded-full bg-tertiary-100 px-2 py-0.5 text-xs text-tertiary-700 transition-colors hover:bg-tertiary-200 dark:bg-tertiary-900/30 dark:text-tertiary-300 dark:hover:bg-tertiary-800/40"
                          >
                            Show less
                          </button>
                        )}
                    </div>
                  </div>
                )}

                {template.category && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </h4>
                    <span className="mt-1 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {template.category}
                    </span>
                  </div>
                )}

                {template.version && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Version
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {template.version}
                      </span>
                      {template.effective_date && (
                        <span className="text-xs text-gray-500">
                          Effective:{" "}
                          {new Date(
                            template.effective_date
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons at the bottom */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {showDetails ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Details
              </>
            )}
          </button>
          <button
            onClick={() => {
              onSelect();
              setMetaTitle(template.name);
            }}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isSelected
                ? "bg-tertiary-700 text-white hover:bg-tertiary-800 dark:bg-tertiary-600 dark:hover:bg-tertiary-700"
                : "bg-tertiary-600 text-white hover:bg-tertiary-700 dark:bg-tertiary-500 dark:hover:bg-tertiary-600"
            }`}
          >
            {isSelected ? "Selected" : "Select"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
export default PolicyTemplateCard;
