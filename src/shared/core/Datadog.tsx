"use client";

import { datadogRum } from "@datadog/browser-rum";

datadogRum.init({
  applicationId: process.env["NEXT_PUBLIC_DATADOG_CLIENT_TOKEN"] as string,
  clientToken: process.env["NEXT_PUBLIC_DATADOG_APPLICATION_ID"] as string,
  site: "datadoghq.com",
  service: "frontend",
  env: process.env.NODE_ENV === "development" ? "development" : "production",
  sessionSampleRate: 20,
  sessionReplaySampleRate: 5,
  trackBfcacheViews: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: "mask-user-input"
});

export default function DatadogInit() {
  return null;
}
