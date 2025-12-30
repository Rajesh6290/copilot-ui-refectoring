"use client";
import { datadogRum } from "@datadog/browser-rum";
import { useEffect } from "react";
let isDatadogInitialized = false;

export default function DatadogInit() {
  useEffect(() => {
    if (isDatadogInitialized) {
      return;
    }
    const applicationId = process.env["NEXT_PUBLIC_DATADOG_CLIENT_TOKEN"];
    const clientToken = process.env["NEXT_PUBLIC_DATADOG_APPLICATION_ID"];

    if (!applicationId || !clientToken) {
      return;
    }

    try {
      if (datadogRum.getInternalContext()) {
        isDatadogInitialized = true;
        return;
      }

      datadogRum.init({
        applicationId,
        clientToken,
        site: "datadoghq.com",
        service: "frontend",
        env:
          process.env.NODE_ENV === "development" ? "development" : "production",
        sessionSampleRate: 20,
        sessionReplaySampleRate: 5,
        trackBfcacheViews: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: "mask-user-input"
      });

      isDatadogInitialized = true;
    } catch {
      isDatadogInitialized = true;
    }
  }, []);

  return null;
}
