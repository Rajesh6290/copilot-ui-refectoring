import { ChevronDown, ChevronUp } from "lucide-react";
import ControlContent from "./ControlContent";

const ControlMobileView = ({
  data,
  expandedCategory,
  toggleCategory
}: {
  data: {
    category: string;
    controls: { name: string; description: string; readiness_status: string }[];
  }[];
  expandedCategory: string | null;
  toggleCategory: (category: string) => void;
}) => (
  <div className="flex flex-col gap-4 lg:hidden">
    {data?.map(
      (
        category: {
          category: string;
          controls: {
            name: string;
            description: string;
            readiness_status: string;
          }[];
        },
        index: number
      ) => (
        <div key={index} className="overflow-hidden rounded-lg border">
          <div
            tabIndex={0}
            role="button"
            onClick={() => toggleCategory(category.category)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toggleCategory(category.category);
              }
            }}
            className="flex cursor-pointer items-center justify-between bg-gray-50 p-4"
          >
            <p className="font-medium text-gray-800">{category.category}</p>
            {expandedCategory === category.category ? (
              <ChevronUp className="text-gray-600" size={20} />
            ) : (
              <ChevronDown className="text-gray-600" size={20} />
            )}
          </div>
          {expandedCategory === category.category && (
            <div className="p-4">
              <ControlContent controls={category.controls} />
            </div>
          )}
        </div>
      )
    )}
  </div>
);
export default ControlMobileView;
