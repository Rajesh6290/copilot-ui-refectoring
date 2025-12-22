"use client";
import { FileText, Search, X } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useMemo, useState } from "react";
const PolicyTemplateCard = dynamic(() => import("./PolicyTemplateCard"), {
  ssr: false
});

export interface PolicyTemplate {
  doc_id: string;
  id: string;
  name: string;
  description?: string;
  framework?: string[];
  citation?: string;
  category?: string;
  version?: string;
  effective_date?: string;
  readiness_status?: string;
  scope?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
}

const PolicyTemplateSelector: React.FC<{
  data: { data?: PolicyTemplate[] };
  selectedTemplate: PolicyTemplate | null;
  setSelectedTemplate: (template: PolicyTemplate | null) => void;
}> = ({ data, selectedTemplate, setSelectedTemplate }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPolicies = useMemo(() => {
    if (!data?.data) {
      return [];
    }
    if (!searchTerm.trim()) {
      return data.data;
    }

    const term = searchTerm.toLowerCase();
    return data?.data?.filter(
      (policy) =>
        policy.name.toLowerCase().includes(term) ||
        policy.description?.toLowerCase().includes(term) ||
        policy.tags?.some((tag) => tag.toLowerCase().includes(term))
    );
  }, [data?.data, searchTerm]);

  return (
    <div className="flex h-full flex-col px-2">
      <div className="border-gray-200 p-2 dark:border-neutral-600">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-tertiary-500 focus:ring-1 focus:ring-tertiary-500 dark:border-neutral-600 dark:bg-darkMainBackground dark:text-white dark:placeholder-gray-400"
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {filteredPolicies.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-2">
            {filteredPolicies.map((template) => (
              <PolicyTemplateCard
                key={template._id}
                template={template}
                isSelected={selectedTemplate?._id === template._id}
                onSelect={() => setSelectedTemplate(template)}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <FileText className="mb-2 text-gray-300" size={40} />
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No templates match your filters"
                : "No templates available"}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                }}
                className="mt-2 text-sm text-tertiary-500 hover:text-tertiary-600 dark:text-tertiary-400"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyTemplateSelector;
