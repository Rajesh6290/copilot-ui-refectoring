"use client";

import { ArrowLeft, ChevronRight, FileText, Layout } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import usePermission from "../hooks/usePermission";
import ICON from "../icons";
import CustomButton from "../core/CustomButton";

type MenuNode = {
  feature_group_name?: string;
  feature_name?: string;
  tab_name?: string;
  sub_feature_name?: string;
  button_name?: string;
  metadata?: {
    label?: string;
    route?: string;
    reference?: string;
    queryKey?: string;
    icon?: string;
  };
  features?: MenuNode[];
  tabs?: MenuNode[];
  sub_features?: MenuNode[];
  sub_tabs?: MenuNode[];
  buttons?: MenuNode[];
};

type BreadcrumbItem = {
  label: string;
  route: string;
  isClickable: boolean;
  icon?: string;
  node?: MenuNode;
  siblings?: MenuNode[];
  isFromTab?: boolean;
};

const CustomNavigationTab = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = usePermission();
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[-_]/g, " ")
      .replace(/\+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const getDestination = useCallback(
    (node: MenuNode) => {
      if (node.tab_name) {
        const newParams = new URLSearchParams(searchParams.toString());

        let key = node.metadata?.queryKey;
        if (!key) {
          for (const k of Array.from(searchParams.keys())) {
            if (k.toLowerCase().includes("tab") || k === "_name") {
              key = k;
              break;
            }
          }
        }
        key = key || "_name";
        newParams.set(key, node.tab_name);

        return `${pathname}?${newParams.toString()}`;
      }

      return node.metadata?.route || "#";
    },
    [pathname, searchParams]
  );

  const breadcrumbs = useMemo(() => {
    const menu = (user?.resources?.UI || []) as MenuNode[];
    const queryName = searchParams.get("_name");
    const decodedName = queryName ? decodeURIComponent(queryName) : null;

    const formatSegment = (text: string): string => {
      const upperText = text.toUpperCase();
      const hasResourcePrefix = /^(DOC|INC|APP|TEST|RISK)-/i.test(upperText);
      const isGenericId =
        /^[0-9a-fA-F-]{12,}$/.test(text) ||
        (/[0-9]/.test(text) && text.length > 8);
      const isLikelyId = hasResourcePrefix || isGenericId;

      if (decodedName && isLikelyId) {
        return decodedName;
      }

      if (hasResourcePrefix) {
        return upperText;
      }
      if (isLikelyId) {
        return "Details";
      }

      return text
        .replace(/[-_]/g, " ")
        .replace(/([A-Z])/g, " $1")
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    let bestMatchChain: MenuNode[] = [];
    let longestRouteLength = -1;
    let chainWithSiblings: { node: MenuNode; siblings: MenuNode[] }[] = [];

    const traverse = (
      nodes: MenuNode[],
      currentChain: MenuNode[],
      siblingsChain: { node: MenuNode; siblings: MenuNode[] }[]
    ) => {
      for (const node of nodes) {
        const nodeRoute = node.metadata?.route;
        const nextChain = [...currentChain, node];
        const nextSiblingsChain = [...siblingsChain, { node, siblings: nodes }];

        if (nodeRoute && nodeRoute !== "/" && pathname.startsWith(nodeRoute)) {
          if (nodeRoute.length > longestRouteLength) {
            longestRouteLength = nodeRoute.length;
            bestMatchChain = nextChain;
            chainWithSiblings = nextSiblingsChain;
          }
        } else if (nodeRoute === "/" && pathname === "/") {
          if (nodeRoute.length > longestRouteLength) {
            longestRouteLength = nodeRoute.length;
            bestMatchChain = nextChain;
            chainWithSiblings = nextSiblingsChain;
          }
        }

        const children = [
          ...(node.features || []),
          ...(node.tabs || []),
          ...(node.sub_features || []),
          ...(node.sub_tabs || [])
        ];
        if (children.length > 0) {
          traverse(children, nextChain, nextSiblingsChain);
        }
      }
    };

    traverse(menu, [], []);

    const result: BreadcrumbItem[] = [];

    if (bestMatchChain.length > 0) {
      bestMatchChain.forEach((node, idx) => {
        const label =
          node.metadata?.label ||
          node.feature_group_name ||
          node.feature_name ||
          node.tab_name ||
          "Unknown";

        const isDuplicate =
          result.length > 0 && result[result.length - 1]?.label === label;

        if (!isDuplicate) {
          result.push({
            label: label,
            route: node.metadata?.route || "#",
            isClickable: !!node.metadata?.route,
            ...(node.metadata?.icon && { icon: node.metadata.icon }),
            node: node,
            siblings: chainWithSiblings[idx]?.siblings || [],
            isFromTab: false
          });
        }
      });

      const lastNode = bestMatchChain[bestMatchChain.length - 1];
      const lastNodeRoute = lastNode?.metadata?.route || "";

      if (pathname.length > lastNodeRoute.length) {
        const remainingPath = pathname.slice(lastNodeRoute.length);
        const segments = remainingPath.split("/").filter(Boolean);

        let currentPath = lastNodeRoute;
        segments.forEach((seg) => {
          currentPath += `/${seg}`;
          result.push({
            label: formatSegment(seg),
            route: currentPath,
            isClickable: false,
            isFromTab: false
          });
        });
      }

      const children = [
        ...(lastNode?.tabs || []),
        ...(lastNode?.sub_tabs || [])
      ];

      let tabFound = false;
      searchParams.forEach((value, key) => {
        if (tabFound || key === "_name") {
          return;
        }
        const normalizedValue = normalize(value);
        const matchedChild = children.find((child) => {
          const childName = child.tab_name || "";
          const childLabel = child.metadata?.label || "";
          const childRef = child.metadata?.reference || "";

          return (
            normalize(childName) === normalizedValue ||
            normalize(childLabel) === normalizedValue ||
            normalize(childRef) === normalizedValue
          );
        });

        if (matchedChild) {
          result.push({
            label:
              matchedChild.metadata?.label || matchedChild.tab_name || value,
            route: "#",
            isClickable: false,
            ...(matchedChild.metadata?.icon && {
              icon: matchedChild.metadata.icon
            }),
            node: matchedChild,
            siblings: children.filter((c) => c !== matchedChild),
            isFromTab: true
          });
          tabFound = true;
        } else if (key.toLowerCase().includes("tab")) {
          result.push({
            label: formatSegment(value),
            route: "#",
            isClickable: false,
            isFromTab: true
          });
          tabFound = true;
        }
      });
    } else {
      const segments = pathname.split("/").filter(Boolean);
      let accPath = "";
      segments.forEach((seg) => {
        accPath += `/${seg}`;
        result.push({
          label: formatSegment(seg),
          route: accPath,
          isClickable: true,
          isFromTab: false
        });
      });
    }

    return result;
  }, [pathname, searchParams, user?.resources?.UI]);

  const getChildrenItems = (node?: MenuNode, isTab?: boolean): MenuNode[] => {
    if (!node) {
      return [];
    }
    if (isTab) {
      return [...(node.sub_tabs || [])].filter(
        (child) => child.metadata?.route || child.tab_name
      );
    }
    return [
      ...(node.features || []),
      ...(node.tabs || []),
      ...(node.sub_features || [])
    ].filter((child) => child.metadata?.route || child.tab_name);
  };
  const getFilteredChildren = (item: BreadcrumbItem, index: number) => {
    const rawChildren = getChildrenItems(item.node, item.isFromTab);
    const nextBreadcrumb = breadcrumbs[index + 1];

    return rawChildren.filter((child) => {
      const childRoute = child.metadata?.route;

      if (child.tab_name) {
        return false;
      }
      if (childRoute && childRoute === pathname) {
        return false;
      }

      if (nextBreadcrumb) {
        if (childRoute && childRoute === nextBreadcrumb.route) {
          return false;
        }

        const childLabel =
          child.tab_name || child.metadata?.label || child.feature_name;
        if (
          childLabel &&
          normalize(childLabel) === normalize(nextBreadcrumb.label)
        ) {
          return false;
        }
      }

      return true;
    });
  };

  const renderIcon = (
    iconName?: string,
    className?: string,
    isTab?: boolean
  ) => {
    if (iconName) {
      const IconComponent = ICON[iconName as keyof typeof ICON];
      if (IconComponent) {
        if (typeof IconComponent === "function") {
          const Component = IconComponent as React.ComponentType<{
            className?: string;
            size?: number;
          }>;
          return <Component {...(className ? { className } : {})} size={16} />;
        } else {
          return IconComponent;
        }
      }
    }
    if (isTab) {
      return <FileText className={className} size={16} />;
    }
    return <Layout className={className} size={16} />;
  };

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className="hidden w-full items-center justify-between pr-3 sm:flex">
      <nav className="flex items-center space-x-1 text-sm text-gray-600">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isHash = item.route === "#";

          const validChildren = getFilteredChildren(item, index);

          const hasDropdown = validChildren.length > 0 && !isLast;

          const isOpen = openDropdown === index;

          return (
            <span
              key={`${item.route}-${index}`}
              className="relative flex items-center"
              ref={(el) => {
                dropdownRefs.current[index] = el;
              }}
            >
              {index !== 0 && (
                <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-gray-400" />
              )}

              <div className="relative">
                {hasDropdown ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDropdown(isOpen ? null : index);
                    }}
                    className={`text-tertiary-600 flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all hover:bg-gray-50 ${
                      isOpen ? "bg-tertiary-50 ring-tertiary-500 ring-2" : ""
                    }`}
                  >
                    {item.label}
                    <ChevronRight className="h-3 w-3 rotate-90 text-gray-500" />
                  </button>
                ) : isLast || !item.isClickable || isHash ? (
                  <span className="text-tertiary px-3 py-1.5 font-semibold capitalize">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.route}
                    className="text-tertiary-600 rounded-md px-3 py-1.5 font-medium transition-all hover:bg-gray-50 hover:underline"
                  >
                    {item.label}
                  </Link>
                )}

                {isOpen && hasDropdown && (
                  <div className="animate-in fade-in slide-in-from-top-1 absolute top-full left-0 z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-xl duration-150">
                    {validChildren.length > 0 && (
                      <div className="border-b border-gray-100 p-2">
                        <div className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                          Navigate to
                        </div>
                        <div className="space-y-0.5">
                          {validChildren.map((child, idx) => {
                            const childLabel =
                              child.metadata?.label ||
                              child.feature_name ||
                              "Unknown";
                            const childIcon = child.metadata?.icon;
                            const destinationUrl = getDestination(child);

                            return (
                              <Link
                                key={idx}
                                href={destinationUrl}
                                onClick={() => setOpenDropdown(null)}
                                className="group hover:bg-tertiary-50 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-gray-700 transition-all"
                              >
                                <div className="bg-tertiary-50 group-hover:bg-tertiary-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors">
                                  {renderIcon(
                                    childIcon,
                                    "text-tertiary-600",
                                    false
                                  )}
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col">
                                  <span className="truncate leading-tight font-medium text-gray-900">
                                    {childLabel}
                                  </span>
                                  {child.metadata?.route && (
                                    <span className="truncate text-xs text-gray-400">
                                      {child.metadata.route
                                        .split("/")
                                        .filter(Boolean)
                                        .pop()}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-100 px-3 py-2 text-center">
                      <span className="text-[10px] text-gray-400">
                        Click anywhere to close
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </span>
          );
        })}
      </nav>

      {!["/self-assessment/generate-trust-center"].includes(pathname) && (
        <div className="w-fit">
          <CustomButton
            onClick={() => router.back()}
            startIcon={<ArrowLeft size={15} />}
            className="w-fit !px-3 !py-1.5 !text-[0.7rem]"
          >
            Back
          </CustomButton>
        </div>
      )}
    </div>
  );
};

export default CustomNavigationTab;
