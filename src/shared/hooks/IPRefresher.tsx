"use client";
import { useCallback, useEffect, useRef } from "react";
import { setLocalStorageItem } from "../utils";
import { toast } from "sonner";

export default function IPRefresher() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchIPDetails = useCallback(async () => {
    try {
      const res = await fetch("https://ipinfo.io/json");
      if (!res.ok) {
        throw new Error("Failed to fetch IP info");
      }

      const data = await res.json();
      setLocalStorageItem("IPINFO", data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unknown error occurred while fetching IP info."
      );
    }
  }, []);

  useEffect(() => {
    fetchIPDetails();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Refresh IP info every 10 minutes
    intervalRef.current = setInterval(fetchIPDetails, 10 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchIPDetails]);

  return null;
}
