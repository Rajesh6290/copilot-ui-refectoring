import Link from "next/link";

interface SidebarDropdownProps {
  items: {
    metadata?: { label?: string };
    label?: string;
  }[];
  checkActive: (route: string) => boolean;
  getRoute: (item: { metadata?: { label?: string }; label?: string }) => string;
}

const SidebarDropdown = ({
  items,
  checkActive,
  getRoute
}: SidebarDropdownProps) => {
  return (
    <ul className="mt-1 flex flex-col gap-1 pl-6">
      {items.map(
        (
          item: {
            metadata?: { label?: string };
            label?: string;
          },
          index: number
        ) => {
          const route = getRoute(item);
          const label = item.metadata?.label || item.label || "Item";
          const isActive = checkActive(route);

          return (
            <li key={index} className={isActive ? "active" : ""}>
              <Link
                href={route}
                className={`group dark:text-bodydark2 relative flex items-center gap-2.5 rounded-md px-4 py-1.5 font-medium text-gray-900 duration-300 ease-in-out ${
                  isActive
                    ? "dark:bg-darkMainBackground bg-neutral-200 text-gray-900 dark:text-white"
                    : "dark:hover:bg-darkMainBackground hover:bg-neutral-100"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        }
      )}
    </ul>
  );
};

export default SidebarDropdown;
