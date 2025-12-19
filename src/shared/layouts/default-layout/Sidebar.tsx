"use client";
import useLocalStorage from "@/shared/hooks/useLocalStorage";
import useMenuItems from "@/shared/hooks/useMenuItems";
import usePermission from "@/shared/hooks/usePermission";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";
import MenuLoader from "./MenuLoader";
import SidebarItem, { MenuItem } from "./SidebarItem";
import ClickOutside from "@/shared/common/ClickOutside";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  fullWidth: boolean;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, fullWidth }: SidebarProps) => {
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");
  const { resolvedTheme } = useTheme();
  const { isUserLoading, menuItems } = useMenuItems();
  const { user } = usePermission();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      const activeElement = document.querySelector("li.active");
      if (activeElement) {
        const aside = activeElement.closest("aside");
        if (aside) {
          const scrollable = aside.querySelector("div.overflow-y-auto");
          if (scrollable) {
            activeElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest"
            });
          }
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <aside
        className={`dark:bg-darkSidebarBackground hidden h-full flex-col border-r border-neutral-100 bg-white transition-all duration-300 ease-in-out lg:flex dark:border-[#272727] ${
          fullWidth
            ? "w-0 -translate-x-full opacity-0"
            : "w-72.5 translate-x-0 opacity-100"
        }`}
      >
        <div className="dark:bg-darkSidebarBackground z-999999 bg-white px-6 py-2">
          {user?.company_logo_url &&
          user?.company_logo_url?.length > 0 &&
          user?.company_logo_url !== "-1" ? (
            <button onClick={() => router.push("/")} className="w-full">
              <img
                src={user?.company_logo_url}
                alt="sidebar logo"
                className="h-16 w-full cursor-pointer object-contain"
              />
            </button>
          ) : (
            <button onClick={() => router.push("/")} className="w-full">
              <img
                src={
                  resolvedTheme === "dark"
                    ? "/sideBarLogoDark.svg"
                    : "/sideBarLogo.svg"
                }
                alt="sidebar logo"
                className="h-fit w-full cursor-pointer object-contain"
              />
            </button>
          )}
        </div>

        <div className="z-99999 flex h-[94%] flex-col overflow-y-auto duration-300 ease-linear">
          {isUserLoading ? (
            <MenuLoader />
          ) : (
            <nav
              className={`z-10 px-4 lg:px-4 ${
                user?.company_logo_url && user?.company_logo_url?.length > 0
                  ? "py-0"
                  : "py-4"
              }`}
            >
              {menuItems?.map(
                (
                  group: {
                    permission: { is_shown: boolean };
                    metadata: { label: string };
                    features: {
                      permission: { is_shown: boolean };
                    }[];
                  },
                  groupIndex: number
                ) =>
                  group?.permission?.is_shown ? (
                    <div key={groupIndex}>
                      <h3 className="text-bodydark2 mb-2 ml-4 text-sm font-semibold">
                        {group?.metadata?.label}
                      </h3>
                      <ul className="mb-2 flex flex-col gap-1">
                        {group?.features?.map(
                          (
                            menuItem: {
                              permission: { is_shown: boolean };
                            },
                            menuIndex: number
                          ) =>
                            menuItem?.permission?.is_shown ? (
                              <SidebarItem
                                key={menuIndex}
                                item={menuItem as MenuItem}
                                pageName={pageName}
                                setPageName={setPageName}
                              />
                            ) : null
                        )}
                      </ul>
                    </div>
                  ) : null
              )}
            </nav>
          )}
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-998 bg-black transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-50" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setSidebarOpen(false);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close sidebar"
      />

      <ClickOutside onClick={() => setSidebarOpen(false)}>
        <aside
          className={`dark:bg-darkSidebarBackground fixed top-0 left-0 z-999 flex h-full w-72.5 flex-col overflow-y-hidden border-r border-neutral-100 bg-white transition-transform duration-300 ease-in-out lg:hidden dark:border-[#272727] ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="dark:bg-darkSidebarBackground z-50 mt-16 bg-white px-6 py-3">
            {user?.company_logo_url &&
            user?.company_logo_url?.length > 0 &&
            user?.company_logo_url !== "-1" ? (
              <button onClick={() => router.push("/")} className="w-full">
                <img
                  src={user?.company_logo_url}
                  alt="sidebar logo"
                  className="h-20 w-full cursor-pointer object-contain"
                />
              </button>
            ) : (
              <button onClick={() => router.push("/")} className="w-full">
                <img
                  src={
                    resolvedTheme === "dark"
                      ? "/sideBarLogoDark.svg"
                      : "/sideBarLogo.svg"
                  }
                  alt="sidebar logo"
                  className="h-fit w-full cursor-pointer object-contain"
                />
              </button>
            )}
          </div>

          <div className="z-10 -mt-8 flex flex-col overflow-y-auto duration-300 ease-linear">
            <nav className="mt-5 px-4 py-4 lg:px-4">
              {menuItems?.map(
                (
                  group: {
                    permission: { is_shown: boolean };
                    metadata: { label: string };
                    features: {
                      permission: { is_shown: boolean };
                    }[];
                  },
                  groupIndex: number
                ) =>
                  group?.permission?.is_shown ? (
                    <div key={groupIndex}>
                      <h3 className="text-bodydark2 mb-4 ml-4 font-[family-name:var(--font-geist-mono)] text-sm font-semibold">
                        {group?.metadata?.label}
                      </h3>
                      <ul className="mb-6 flex flex-col gap-1.5">
                        {group?.features?.map(
                          (
                            menuItem: {
                              permission: { is_shown: boolean };
                            },
                            menuIndex: number
                          ) =>
                            menuItem?.permission?.is_shown ? (
                              <SidebarItem
                                key={menuIndex}
                                item={menuItem as MenuItem}
                                pageName={pageName}
                                setPageName={setPageName}
                              />
                            ) : null
                        )}
                      </ul>
                    </div>
                  ) : null
              )}
            </nav>
          </div>
        </aside>
      </ClickOutside>
    </>
  );
};

export default Sidebar;
