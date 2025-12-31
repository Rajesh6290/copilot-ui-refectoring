"use client";
import { Settings } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import React, { useCallback } from "react";

const NotConnectedCard: React.FC = React.memo(() => {
  const router = useRouter();

  const handleNavigation = useCallback(() => {
    router.push("/system-settings?system-settings-tab=settings-connection");
  }, [router]);

  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
      <div className="max-w-md overflow-hidden rounded-[32px] border border-gray-100 bg-white transition-all duration-500 dark:border-gray-700 dark:bg-gray-800">
        <div className="relative p-8">
          <div className="absolute right-0 top-0 -mr-12 -mt-12 h-48 w-48 rounded-full bg-tertiary-50 opacity-30 dark:bg-tertiary-900/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                AI Asset Discovery
              </h2>
              <span className="rounded-full bg-tertiary-100 px-3 py-1 text-xs font-medium text-tertiary-700 dark:bg-tertiary-900/50 dark:text-tertiary-300">
                Not Connected
              </span>
            </div>
            <div className="py-8">
              <div className="mb-8 flex justify-center">
                <div className="relative h-40 w-40">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-400 to-tertiary-500 shadow-lg">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="mb-2 text-center text-lg font-medium text-gray-800 dark:text-white">
                No Platform Connected
              </h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {`No asset sources are configured. Please go to System Settings
                and connect your asset sources under "Connection" before
                discovering assets.`}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 bg-gray-50 px-8 py-5 dark:border-gray-700 dark:bg-gray-800/70">
          <button
            onClick={handleNavigation}
            className="w-full transform rounded-full bg-gradient-to-r from-tertiary-500 to-tertiary-600 px-4 py-3.5 font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-tertiary-600 hover:to-tertiary-700 hover:shadow-lg"
          >
            Go to System Settings
          </button>
        </div>
      </div>
    </div>
  );
});

NotConnectedCard.displayName = "NotConnectedCard";
export default NotConnectedCard;
