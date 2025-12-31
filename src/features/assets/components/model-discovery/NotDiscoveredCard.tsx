import CustomButton from "@/shared/core/CustomButton";
import { AlertCircle, Database } from "lucide-react";
import React from "react";

const NotDiscoveredCard: React.FC<{
  selectedSource: string;
  onDiscover: () => void;
}> = React.memo(({ selectedSource, onDiscover }) => {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-600 dark:bg-gray-800/50">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-lg">
            <AlertCircle className="h-12 w-12 text-white" />
          </div>
        </div>

        <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
          Assets Not Discovered Yet
        </h3>

        <p className="mb-6 text-gray-600 dark:text-gray-300">
          {"You've"} selected{" "}
          <span className="font-semibold capitalize">{selectedSource}</span> but
          {` haven't discovered any assets yet. Click the button below to start the
          discovery process.`}
        </p>

        <CustomButton
          startIcon={<Database size={20} />}
          onClick={onDiscover}
          className="mx-auto"
        >
          Start Discovery
        </CustomButton>

        <div className="mt-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-4 dark:border-gray-600 dark:bg-gray-700/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 Discovery will scan {selectedSource} and import all available AI
            assets into your inventory.
          </p>
        </div>
      </div>
    </div>
  );
});

NotDiscoveredCard.displayName = "NotDiscoveredCard";
export default NotDiscoveredCard;
