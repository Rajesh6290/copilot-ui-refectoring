import React, { useEffect, useRef, useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface Field {
  name: string;
  value: string[];
}

interface Form {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldValue: (field: string, value: string[]) => void;
  setFieldTouched: (field: string, value: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
}

interface CustomMultiSelectProps {
  field: Field;
  form: Form;
  options: Option[];
}

const CustomMultiSelect = ({
  field,
  form,
  options
}: CustomMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAbove, setShowAbove] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Enhanced dropdown positioning logic with viewport edge detection
  useEffect(() => {
    const calculatePosition = () => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const requiredSpace = 200; // Minimum space needed for dropdown

      // Check if we're near the bottom of the viewport
      const nearViewportBottom = spaceBelow < requiredSpace;

      // Check if there's more space above than below
      const moreSpaceAbove = spaceAbove > spaceBelow;

      // Show above if we're near the bottom of viewport OR if there's more space above and limited space below
      setShowAbove(nearViewportBottom || (moreSpaceAbove && spaceBelow < 300));
    };

    if (isOpen) {
      calculatePosition();

      // Force positioning check on window resize and scroll
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition);

      return () => {
        window.removeEventListener("resize", calculatePosition);
        window.removeEventListener("scroll", calculatePosition);
      };
    }

    // Return undefined for the else case to satisfy TypeScript
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const selectedTags = field.value || [];

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    setSearchTerm("");

    // Only mark as touched if there are no selections and we're closing the dropdown
    if (selectedTags.length === 0) {
      form.setFieldTouched(field.name, true);
    }
  };

  const toggleTag = (tagValue: string) => {
    const newSelectedTags = selectedTags.includes(tagValue)
      ? selectedTags.filter((value: string) => value !== tagValue)
      : [...selectedTags, tagValue];
    form.setFieldValue(field.name, newSelectedTags);

    // Always clear errors when toggling a tag
    // This ensures no errors show after user interaction
    if (form.errors[field.name]) {
      const newErrors = { ...form.errors };
      delete newErrors[field.name];
      form.setErrors(newErrors);
    }

    // Only mark field as touched if no selection was made
    // This prevents the error from showing immediately when opening the dropdown
    if (newSelectedTags.length === 0) {
      form.setFieldTouched(field.name, true);
    } else {
      form.setFieldTouched(field.name, false);
    }
  };

  const removeTag = (tagValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelectedTags = selectedTags.filter(
      (value: string) => value !== tagValue
    );
    form.setFieldValue(field.name, newSelectedTags);

    // Handle validation state differently based on whether tags remain
    if (newSelectedTags.length === 0) {
      // Only set touched if there are no tags left
      form.setFieldTouched(field.name, true);
    } else {
      // If we still have tags, make sure we don't have errors
      if (form.errors[field.name]) {
        const newErrors = { ...form.errors };
        delete newErrors[field.name];
        form.setErrors(newErrors);
      }
      // And make sure field isn't marked as touched
      form.setFieldTouched(field.name, false);
    }
  };

  const filteredOptions = options.filter((option: { label: string }) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Don't show errors at all when options are selected
  // This completely disables error display once a selection is made
  const hasError =
    selectedTags.length === 0 &&
    form.touched[field.name] &&
    form.errors[field.name];

  return (
    <div className="relative" ref={containerRef}>
      <div
        tabIndex={0}
        role="button"
        className={`min-h-10 w-full rounded-md border ${
          hasError
            ? "border-red-500"
            : "border-gray-300 dark:border-neutral-700"
        } flex cursor-pointer flex-wrap items-center gap-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-darkMainBackground dark:text-white`}
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleDropdown();
          }
        }}
      >
        {selectedTags.length === 0 ? (
          <span className="text-gray-500 dark:text-gray-400">
            Select options...
          </span>
        ) : (
          selectedTags.map((tagValue: string) => {
            const tagLabel =
              options.find(
                (option: { value: string }) => option.value === tagValue
              )?.label || tagValue;
            return (
              <div
                key={tagValue}
                className="flex items-center gap-1 rounded-md bg-tertiary-600 px-2 py-0.5 text-sm text-white"
              >
                {tagLabel}
                <button
                  type="button"
                  onClick={(e) => removeTag(tagValue, e)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            );
          })
        )}
        <svg
          className={`ml-auto h-4 w-4 text-gray-500 transition-transform dark:text-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 flex max-h-60 w-full flex-col overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg dark:border-neutral-700 dark:bg-darkSidebarBackground ${
            showAbove ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <div className="border-b border-gray-200 bg-white p-2 dark:border-neutral-700 dark:bg-darkSidebarBackground">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-darkMainBackground dark:text-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(
                (option: { label: string; value: string }) => (
                  <div
                    key={option.value}
                    tabIndex={0}
                    role="button"
                    className={`flex cursor-pointer items-center px-3 py-2 text-sm ${
                      selectedTags.includes(option.value)
                        ? "bg-indigo-100 dark:bg-indigo-900"
                        : "hover:bg-gray-100 dark:hover:bg-neutral-800"
                    }`}
                    onClick={() => toggleTag(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        toggleTag(option.value);
                      }
                    }}
                  >
                    <div
                      className={`mr-2 flex h-4 w-4 items-center justify-center rounded border ${
                        selectedTags.includes(option.value)
                          ? "border-indigo-600 bg-indigo-600"
                          : "border-gray-400 dark:border-neutral-600"
                      }`}
                    >
                      {selectedTags.includes(option.value) && (
                        <svg
                          className="h-3 w-3 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="uppercase dark:text-white">
                      {option.label}
                    </span>
                  </div>
                )
              )
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-neutral-400">
                No matching options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMultiSelect;
