"use client";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { GoogleAnalytics } from "@next/third-parties/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import usePermission from "@/shared/hooks/usePermission";
import ThemeProvider from "@/shared/providers/ThemeProvider";
import { AppProvider } from "@/shared/providers/AppProvider";
import Loader from "@/shared/common/Loader";
import DatadogInit from "@/shared/core/Datadog";

const IPRefresher = lazy(() => import("@/shared/hooks/IPRefresher"));

const WrapperLayouts = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { getUser } = usePermission();
  const pathname = usePathname();
  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  useEffect(() => {
    if (mounted) {
      // For auth pages, don't fetch user data
      if (pathname?.includes("/auth/")) {
        setLoading(false);
        return;
      }

      // For protected pages, get user data once
      const fetchData = async () => {
        try {
          await getUser();
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [mounted, pathname]); // Simplified dependencies

  const getTheme = () => {
    if (typeof window !== "undefined") {
      if (document.documentElement.classList.contains("dark")) {
        return "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  const currentTheme = getTheme();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "campaign.cognitiveview.com"
    ) {
      router.push("/yearend-deal-2025");
    }
  }, []);

  return (
    <>
      {process.env["NEXT_PUBLIC_GOOGLE_ANALYTICS_ID"] &&
        process.env.NODE_ENV === "production" && (
          <GoogleAnalytics
            gaId={process.env["NEXT_PUBLIC_GOOGLE_ANALYTICS_ID"]}
          />
        )}

      <ThemeProvider>
        <AppProvider>
          <div className="h-dvh dark:bg-darkMainBackground dark:text-bodydark">
            {!mounted ? (
              <div className="flex size-full items-center justify-center">
                <Loader />
              </div>
            ) : (
              <>
                <div className="fixed left-0 top-0 z-9999">
                  <NextTopLoader color="#6160b0" />
                  <Toaster
                    position="top-center"
                    closeButton
                    duration={4000}
                    theme={currentTheme === "dark" ? "dark" : "light"}
                  />
                </div>

                <Suspense fallback={<Loader />}>
                  <DatadogInit />
                  {loading ? <Loader /> : children}
                </Suspense>
                <Suspense fallback={null}>
                  <IPRefresher />
                </Suspense>
              </>
            )}
          </div>
        </AppProvider>
      </ThemeProvider>

      {process.env.NODE_ENV === "development" && mounted && (
        <TailwindIndicator />
      )}
    </>
  );
};

export default WrapperLayouts;
function TailwindIndicator() {
  return (
    <div className="font-mono fixed bottom-1 left-1 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 p-3 text-xs text-white">
      <div className="block sm:hidden">xs</div>
      <div className="hidden sm:block md:hidden">sm</div>
      <div className="hidden md:block lg:hidden">md</div>
      <div className="hidden lg:block xl:hidden">lg</div>
      <div className="hidden xl:block 2xl:hidden">xl</div>
      <div className="hidden 2xl:block">2xl</div>
    </div>
  );
}
