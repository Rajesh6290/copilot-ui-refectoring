import { Check } from "lucide-react";
import { memo } from "react";

const PermissionCard = memo(
  ({
    title,
    description,
    selected,
    onSelect,
    permissionType,
    permissions
  }: {
    title: string;
    description: string;
    selected: boolean;
    onSelect: () => void;
    permissionType: "manager" | "contributor" | "viewer" | "no_access";
    permissions: string[];
  }) => {
    const permissionStyles = {
      manager:
        "border-tertiary-600 bg-tertiary-50 text-tertiary-700 dark:border-tertiary-500 dark:bg-tertiary-900/20 dark:text-tertiary-300",
      contributor:
        "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-300",
      viewer:
        "border-green-600 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-900/20 dark:text-green-300",
      no_access:
        "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
    };

    return (
      <div
        tabIndex={0}
        role="button"
        className={`cursor-pointer rounded-lg border p-4 transition-all ${
          selected
            ? permissionStyles[permissionType]
            : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        }`}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (onSelect) {
              onSelect();
            }
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
              {description}
            </p>
            {permissions.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1">
                {permissions.map((perm, index) => (
                  <li
                    key={index}
                    className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                  >
                    {perm}
                  </li>
                ))}
              </ul>
            )}
            {permissions.length === 0 && permissionType === "no_access" && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-300">
                No permissions granted
              </p>
            )}
          </div>
          {selected && (
            <Check className="h-5 w-5 text-tertiary-600 dark:text-tertiary-400" />
          )}
        </div>
      </div>
    );
  }
);
PermissionCard.displayName = "PermissionCard";
export default PermissionCard;
