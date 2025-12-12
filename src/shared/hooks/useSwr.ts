import useSWR, { SWRConfiguration } from "swr";
import { datadogLogs } from "@datadog/browser-logs";
import { getFromLocalStorage } from "../utils";
const useSwr = (path: string | null, options?: SWRConfiguration) => {
  const accessToken = getFromLocalStorage("ACCESS_TOKEN");
  const getApiUrl = (val: string) => {
    const cleanval = val.replace(/^\/+/, "");
    return `/api/cv/v1/${cleanval}`;
  };
  const fetcher = async (url: string) => {
    const headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization?: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Content-Type"?: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Range?: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Content-Length"?: string;
    } = {};

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    headers["Content-Type"] = "application/json";
    headers["Range"] = "1";
    headers["Content-Length"] = "1";

    const res = await fetch(url, {
      method: "GET",
      headers
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: "Invalid JSON response" };
    }

    // 🔥 Log ONLY FAILED RESPONSES — inside SWR hook
    if (!res.ok) {
      datadogLogs.logger.error("SWR API Failed", {
        url,
        status: res.status,
        statusText: res.statusText,
        responseBody: data
      });
    }

    return { data, res };
  };

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    path ? [getApiUrl(path)] : null,
    fetcher,
    {
      ...options,
      revalidateOnFocus: false
    }
  );

  return {
    data: data?.data,
    error,
    isValidating,
    isLoading,
    mutate,
    pagination: data?.data?.pagination
  };
};

export default useSwr;
