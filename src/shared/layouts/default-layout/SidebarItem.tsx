import useSwr from "@/shared/hooks/useSwr";
import ICON from "@/shared/icons";
import { useMyContext } from "@/shared/providers/AppProvider";
import { useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition
} from "react";
import SidebarDropdown from "./SidebarDropdown";

interface Permission {
  is_shown: boolean;
  permission_set: string;
  actions: { create: boolean; read: boolean; update: boolean; delete: boolean };
}

interface Metadata {
  reference: string;
  resource_type: string;
  label: string;
  icon: string;
  route: string;
}

interface SubFeature {
  sub_feature_name: string;
  resource_id: string;
  buttons: {
    label: string;
    action: string;
    style: string;
  }[];
  tabs: {
    label: string;
    route: string;
  }[];
  sub_features: SubFeature[];
  metadata: Metadata;
  permission: Permission;
}

export interface MenuItem {
  feature_name?: string;
  sub_feature_name?: string;
  resource_id: string;
  buttons?: {
    label: string;
    action: string;
    style: string;
  }[];
  tabs?: {
    label: string;
    route: string;
  }[];
  sub_features?: SubFeature[];
  metadata: Metadata;
  permission: Permission;

  // Legacy
  id?: number;
  name?: string;
  route?: string;
  path?: string;
  label?: string;
  icon?: string;
  reference?: string;
  children?: MenuItem[];
}

interface SidebarItemProps {
  item: MenuItem;
  pageName: string;
  setPageName: (name: string) => void;
}

const SidebarItem = memo(
  ({ item, pageName, setPageName }: SidebarItemProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const { setMetaTitle, setHelpOpen } = useMyContext();
    const [isPending, startTransition] = useTransition();
    const [isAnimating, setIsAnimating] = useState(false);
    const { isLoaded } = useUser();

    const { data, isValidating } = useSwr(
      isLoaded ? "conversation/sessions" : ""
    );
    const manualRoute = useMemo(() => {
      if (
        !isValidating &&
        data?.sessions?.length > 0 &&
        pathname === "/" &&
        data.sessions.some(
          (s: { updated_at: string }) =>
            new Date(s.updated_at).toDateString() === new Date().toDateString()
        )
      ) {
        return `/c/${data.sessions[0].session_id}`;
      }
      return "/";
    }, [data, isValidating, pathname]);

    const getLabel = useCallback((it: MenuItem) => {
      return it.metadata?.label || it.label || it.name || "Menu Item";
    }, []);

    const getRoute = useCallback(
      (it: MenuItem): string => {
        const routee = it.metadata?.route || it.route || it.path || "#";
        if (routee === "/" && manualRoute !== "/") {
          return manualRoute;
        }
        return routee;
      },
      [manualRoute]
    );

    const getIcon = useCallback(
      (it: MenuItem) => it.metadata?.icon || it.icon || "default",
      []
    );

    const getChildren = useCallback((it: MenuItem): MenuItem[] => {
      return (
        it.sub_features?.filter((sf) => sf.permission?.is_shown !== false) ||
        it.children ||
        []
      );
    }, []);

    const shouldShow = useCallback(
      (it: MenuItem) => it.permission?.is_shown !== false,
      []
    );

    const itemData = useMemo(
      () => ({
        label: getLabel(item),
        route: getRoute(item),
        icon: getIcon(item),
        children: getChildren(item),
        shouldShow: shouldShow(item)
      }),
      [item, getLabel, getRoute, getIcon, getChildren, shouldShow]
    );

    const checkActive = useCallback(
      (checkRoute: string): boolean => {
        if (!checkRoute || checkRoute === "#" || checkRoute === "/") {
          return false;
        }

        let routeToCheck = checkRoute.trim();
        if (routeToCheck === "/" && manualRoute !== "/") {
          routeToCheck = manualRoute;
        }

        const [routePath] = routeToCheck.split("?");
        const [currentPath] = pathname.split("?");

        if (!routePath || !currentPath) {
          return false;
        }

        if (routePath === currentPath) {
          return true;
        }

        if (routePath.includes("[") && routePath.includes("]")) {
          const pattern = routePath
            .replace(/\/$/, "")
            .replace(/\[.*?\]/g, "[^/]+");
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(currentPath);
        }

        if (
          routePath !== "/" &&
          currentPath.startsWith(routePath) &&
          (currentPath.length === routePath.length ||
            currentPath[routePath.length] === "/")
        ) {
          return true;
        }

        return false;
      },
      [pathname, manualRoute]
    );

    const selfActive = checkActive(itemData.route);
    const hasActiveChild = useMemo(
      () => itemData.children.some((child) => checkActive(getRoute(child))),
      [itemData.children, checkActive, getRoute]
    );

    const isActive = selfActive || hasActiveChild;
    const isOpen = pageName === itemData.label.toLowerCase() || hasActiveChild;

    useEffect(() => {
      if (hasActiveChild && pageName !== itemData.label.toLowerCase()) {
        setPageName(itemData.label.toLowerCase());
      }
    }, [hasActiveChild, pageName, itemData.label, setPageName]);

    const handleNavigation = useCallback(() => {
      if (isAnimating || isPending) {
        return;
      }

      startTransition(() => {
        requestAnimationFrame(() => {
          setMetaTitle(`${itemData.label} | Cognitiveview`);
          setPageName("");
          setHelpOpen?.(false);
          if (itemData.route && itemData.route !== "#") {
            router.push(itemData.route);
          }
        });
      });
    }, [
      itemData,
      setMetaTitle,
      setPageName,
      setHelpOpen,
      router,
      isAnimating,
      isPending
    ]);

    const handleItemClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (isAnimating || isPending) {
          return;
        }

        if (itemData.children.length > 0) {
          setIsAnimating(true);
          startTransition(() => {
            const normalized = itemData.label.toLowerCase();
            setPageName(pageName === normalized ? "" : normalized);
            setHelpOpen?.(false);
            setTimeout(() => setIsAnimating(false), 250);
          });
        } else {
          handleNavigation();
        }
      },
      [
        itemData,
        pageName,
        setPageName,
        setHelpOpen,
        handleNavigation,
        isAnimating,
        isPending
      ]
    );

    const hasChildren = itemData.children.length > 0;

    const dropdownVariants = {
      hidden: { height: 0, opacity: 0 },
      visible: { height: "auto", opacity: 1 }
    };

    const baseClasses = `group relative flex cursor-pointer items-center gap-2.5 rounded-md px-4 py-2 font-medium text-gray-800 duration-200 ease-in-out hover:bg-neutral-200 dark:text-bodydark1 dark:hover:bg-meta-4 ${
      isActive ? "bg-neutral-200 dark:bg-darkMainBackground" : ""
    } ${isPending ? "opacity-70 pointer-events-none" : ""}`;

    if (!itemData.shouldShow) {
      return null;
    }

    return (
      <li className={isActive ? "active" : ""}>
        <button
          onClick={handleItemClick}
          className={`${baseClasses} w-full text-left`}
          type="button"
          disabled={isPending || isAnimating}
        >
          {itemData.icon && ICON[itemData.icon as keyof typeof ICON]}
          <span className="flex-1 font-[family-name:var(--font-geist-sans)]">
            {itemData.label}
          </span>
          {hasChildren && (
            <svg
              className={`ml-auto fill-current transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
              />
            </svg>
          )}
        </button>

        <AnimatePresence mode="wait">
          {hasChildren && isOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={dropdownVariants}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <SidebarDropdown
                items={itemData.children}
                checkActive={checkActive}
                getRoute={(items) => getRoute(items as MenuItem)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </li>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;
