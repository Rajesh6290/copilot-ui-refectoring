"use client";
import { isValid, parse } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useMenuItems from "../hooks/useMenuItems";
import { Feature, FeatureGroup, SubFeature } from "../types/user";
import { FlattenedMenuItem, Button, Tab } from "../types/menu";

export const BASE_URL = process.env["NEXT_PUBLIC_SERVER_URL"];

//? SET To LocalStorage
export const saveToLocalStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};
export const setLocalStorageItem = (key: string, value: unknown): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
//? GET From LocalStorage
export const getFromLocalStorage = (key: string) => {
  return typeof window !== "undefined"
    ? (localStorage.getItem(key) ?? null)
    : null;
};
export const getLocalStorageItem = (key: string): unknown | null => {
  if (typeof window !== "undefined") {
    const storedItem = localStorage.getItem(key);
    if (storedItem) {
      return JSON.parse(storedItem);
    }
  }
  return null;
};
//? Remove from LocalStorage
export const removeFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};
export const getinitialQuery = () => {
  return typeof window !== "undefined"
    ? typeof getFromLocalStorage("initialQuery") === "string"
      ? getFromLocalStorage("initialQuery")!
      : null
    : null;
};

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onnomatch:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}
export function generateRandomColor(opacity = 0.5) {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
export const useCurrentMenuItem = () => {
  const { menuItems: menu } = useMenuItems() || {};
  const pathname = usePathname() || "";

  // Ensure menu is an array
  const safeMenu = Array.isArray(menu) ? menu : [];

  // Normalize pathname (remove trailing slash for consistency)
  const normalizedPathname = pathname.replace(/\/$/, "") || "/";

  // Flatten menu items and include sub-features
  const allMenuItems: FlattenedMenuItem[] = safeMenu.flatMap(
    (featureGroup: FeatureGroup) =>
      (featureGroup?.features || []).flatMap((feature: Feature) => {
        const items: FlattenedMenuItem[] = [];

        // Add the main feature
        items.push({
          feature_name: feature.feature_name || "",
          resource_id: feature.resource_id || "",
          metadata: feature.metadata || {},
          permission: feature.permission || {},
          route: (feature.metadata?.route as string) || "",
          label: (feature.metadata?.label as string) || "",
          type: "feature",
          buttons: (feature.buttons || []) as Button[],
          tabs: (feature.tabs || []) as Tab[]
        });

        // Add sub-features if they exist
        (feature.sub_features || []).forEach((subFeature: SubFeature) => {
          items.push({
            sub_feature_name: subFeature.sub_feature_name || "",
            resource_id: subFeature.resource_id || "",
            metadata: subFeature.metadata || {},
            permission: subFeature.permission || {},
            route: (subFeature.metadata?.route as string) || "",
            label: `${(feature.metadata?.label as string) || ""} - ${(subFeature.metadata?.label as string) || ""}`,
            parentLabel: (feature.metadata?.label as string) || "",
            type: "sub_feature",
            buttons: (subFeature.buttons || []) as Button[],
            tabs: (subFeature.tabs || []) as Tab[]
          });
        });

        return items;
      })
  );

  // Filter out items that are not shown or don't have read permission
  const visibleMenuItems = allMenuItems.filter(
    (item: FlattenedMenuItem) =>
      item?.permission?.is_shown && item?.permission?.actions?.read
  );

  // Sort by route length (longer first)
  visibleMenuItems.sort(
    (a: FlattenedMenuItem, b: FlattenedMenuItem) =>
      (b.route?.length || 0) - (a.route?.length || 0)
  );

  // Find the best match
  const matchedItem = visibleMenuItems.find((item: FlattenedMenuItem) => {
    if (!item.route || item.route === "#" || item.route === "") {
      return false;
    }

    const normalizedRoute = item.route.replace(/\/$/, "") || "/";
    if (normalizedRoute === "/") {
      return normalizedPathname === "/";
    }
    if (normalizedPathname === normalizedRoute) {
      return true;
    }

    return normalizedPathname.startsWith(normalizedRoute + "/");
  });

  return matchedItem || null;
};

export const useResponsiveBreakpoints = () => {
  const [breakpoints, setBreakpoints] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    checkBreakpoints();
    window.addEventListener("resize", checkBreakpoints);
    return () => window.removeEventListener("resize", checkBreakpoints);
  }, []);

  return breakpoints;
};

export interface DateTimeSettings {
  timezone?: string;
  date_format?: string; // Still supported if needed elsewhere
}

export const formatDateTime = (
  dateInput: string | Date | number | null | undefined,
  settings?: DateTimeSettings
): string => {
  if (dateInput === null || dateInput === undefined) {
    return "";
  }

  try {
    const timezone = settings?.timezone || "UTC";

    let dateObj: Date;

    if (typeof dateInput === "string") {
      if (dateInput.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        dateObj = new Date(dateInput);
      } else if (dateInput.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        dateObj = parse(dateInput, "yyyy-MM-dd HH:mm:ss", new Date());
      } else {
        dateObj = new Date(dateInput);
      }
    } else if (typeof dateInput === "number") {
      dateObj = new Date(dateInput);
    } else {
      dateObj = dateInput;
    }

    if (!isValid(dateObj)) {
      return "";
    }

    // Convert to timezone and return ISO string
    const zonedDate = toZonedTime(dateObj, timezone);
    return zonedDate.toISOString();
  } catch {
    return "";
  }
};
