import { create } from "zustand";
import { datadogLogs } from "@datadog/browser-logs";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setLocalStorageItem
} from "../utils";
import { UserPermissionPayload } from "../types/user";
type AuthState = {
  isUserLoading: boolean;
  user: Partial<UserPermissionPayload> | null;
  lastFetchTime: number | null;
  setUser: (user: Partial<UserPermissionPayload>) => void;
  logout: () => void;
  getUser: (force?: boolean) => Promise<void>;
};
const getApiUrl = (path: string) => {
  const cleanPath = path.replace(/^\/+/, "");
  return `/api/cv/v1/${cleanPath}`;
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

const usePermission = create<AuthState>((set, get) => ({
  isUserLoading: true,
  user: null,
  lastFetchTime: null,

  setUser: (user) => {
    set({ user, lastFetchTime: Date.now() });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      removeFromLocalStorage("ACCESS_TOKEN");
    }
    set({ user: null, lastFetchTime: null });
  },

  getUser: async (force = false) => {
    const { user, lastFetchTime } = get();
    const accessToken = getFromLocalStorage("ACCESS_TOKEN");

    if (!accessToken) {
      set({ user: null, isUserLoading: false, lastFetchTime: null });
      return;
    }

    // Return cached user if available and not forced refresh
    if (
      !force &&
      user &&
      lastFetchTime &&
      Date.now() - lastFetchTime < CACHE_DURATION
    ) {
      set({ isUserLoading: false });
      return;
    }

    // Only set loading if we don't have cached user data
    if (!user) {
      set({ isUserLoading: true });
    }
    try {
      const res = await fetch(getApiUrl("auth-user"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        const responseBody = await res
          .clone()
          .json()
          .catch(() => "Invalid JSON");

        datadogLogs.logger.error("Auth Request Failed", {
          url: getApiUrl("auth-user"),
          method: "GET",
          status: res.status,
          statusText: res.statusText,
          responseBody
        });
      }

      if (res?.status === 401) {
        if (typeof window !== "undefined") {
          removeFromLocalStorage("ACCESS_TOKEN");
        }
        set({ user: null, isUserLoading: false, lastFetchTime: null });
        // Only redirect if not already on auth pages to prevent loops
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth/") &&
          !window.location.pathname.includes("/sign")
        ) {
          window.location.href = "/auth/signin";
        }
        return;
      }
      if (res?.status === 404) {
        if (typeof window !== "undefined") {
          removeFromLocalStorage("ACCESS_TOKEN");
        }
        set({ user: null, isUserLoading: false, lastFetchTime: null });
        // Only redirect if not already on auth pages to prevent loops
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/auth/") &&
          !window.location.pathname.includes("/sign")
        ) {
          window.location.href = "/auth/signin";
        }
        return;
      }

      if (res?.status === 200) {
        const response = (await res.json()) || null;
        set({
          user: response ?? {},
          isUserLoading: false,
          lastFetchTime: Date.now()
        });
        setLocalStorageItem("DATETIMEFORMAT", response?.data_time);
        return;
      }
    } catch {
      set({ user: null, isUserLoading: false, lastFetchTime: null });
    }
  }
}));

export default usePermission;
