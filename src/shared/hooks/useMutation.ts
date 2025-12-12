import axios, { AxiosProgressEvent, AxiosRequestConfig } from "axios";
import { useCallback, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { datadogLogs } from "@datadog/browser-logs";
import { getFromLocalStorage, getLocalStorageItem } from "../utils";

interface IPInfo {
  ip: string;
}

export const getAccessToken = () => {
  return typeof window !== "undefined"
    ? typeof getFromLocalStorage("ACCESS_TOKEN") === "string"
      ? getFromLocalStorage("ACCESS_TOKEN")!
      : null
    : null;
};

type MutationOptions = {
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  isFormData?: boolean;
  baseUrl?: string;
  body?: unknown;
  isAlert?: boolean;
  onProgress?: (progress: number) => void;
  type?: string; // Optional type key
};

const getApiUrl = (path: string) => {
  const cleanPath = path.replace(/^\/+/, "");
  return `/api/cv/v1/${cleanPath}`;
};

const useMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Use a ref for ipAddress to avoid re-creating the callback when it changes
  const ipAddressRef = useRef<IPInfo | null>(
    getLocalStorageItem("IPINFO") as IPInfo | null
  );

  // Update the ref if ipAddress changes
  useEffect(() => {
    ipAddressRef.current = getLocalStorageItem("IPINFO") as IPInfo | null;
  }, []);

  // Track ongoing requests to prevent duplicate calls
  const pendingRequestsRef = useRef<Map<string, boolean>>(new Map());

  const mutation = useCallback(
    async (path: string, options?: MutationOptions) => {
      // Create a unique key for this request to track duplicates
      const requestKey = `${path}-${JSON.stringify(options?.body)}`;

      // Skip if this exact request is already in progress
      if (pendingRequestsRef.current.get(requestKey)) {
        return undefined;
      }

      // Mark this request as pending
      pendingRequestsRef.current.set(requestKey, true);
      setIsLoading(true);

      try {
        const token = getAccessToken();
        const method = options?.method || "POST";
        const body = options?.isFormData
          ? options.body
          : JSON.stringify(options?.body);
        const headers: Record<string, string> = options?.isFormData
          ? {}
          : { "Content-Type": "application/json" };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        if (options?.type) {
          headers["Type"] = options.type;
        }
        // Always use the current ref value
        headers["ipv4"] = ipAddressRef.current?.ip || "0.0.0.0";

        const config: AxiosRequestConfig = {
          url: getApiUrl(path),
          method,
          headers,
          data: body,
          timeout: 0,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (options?.onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              options.onProgress(progress);
            }
          }
        };

        const response = await axios(config);
        const results = response.data;
        const status = response.status;

        if (options?.isAlert) {
          if (results?.success) {
            toast.success(results?.message);
          } else {
            toast.error(results?.error?.message);
          }
        }

        return { results, status };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const res = error.response;

          datadogLogs.logger.error("MUTATION API Failed", {
            url: getApiUrl(path),
            method: options?.method || "POST",
            requestBody: options?.body,
            status: res?.status,
            statusText: res?.statusText,
            responseBody: res?.data
          });

          toast.error(
            error.response?.data?.message ||
              error.response?.data?.error ||
              "Something went wrong !!"
          );
        } else {
          datadogLogs.logger.error("Mutation Error (Unknown)", { error });

          toast.error("Something went wrong");
        }
        return undefined;
      } finally {
        // Clear this request from pending
        pendingRequestsRef.current.delete(requestKey);
        setIsLoading(false);
      }
    },
    [] // Empty dependency array is fine now since we use refs
  );

  return { mutation, isLoading };
};

export default useMutation;
