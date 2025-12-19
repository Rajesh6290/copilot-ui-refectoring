interface ConnectionStatusProps {
  type: "connecting" | "validating" | "error" | "reconnecting";
  message?: string;
}

const ConnectionStatus = ({ type, message }: ConnectionStatusProps) => {
  const getStatusConfig = () => {
    switch (type) {
      case "connecting":
        return {
          title: "Connecting to Chat",
          description: "Establishing secure connection...",
          icon: (
            <div className="flex space-x-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
            </div>
          ),
          bgColor: "bg-blue-50 dark:bg-blue-950",
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-700 dark:text-blue-300"
        };
      case "validating":
        return {
          title: "Validating Session",
          description: "Verifying your authentication...",
          icon: (
            <svg
              className="h-5 w-5 animate-spin text-orange-500"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          ),
          bgColor: "bg-orange-50 dark:bg-orange-950",
          borderColor: "border-orange-200 dark:border-orange-800",
          textColor: "text-orange-700 dark:text-orange-300"
        };
      case "error":
        return {
          title: "Connection Error",
          description:
            message ||
            "Unable to establish connection. Please refresh and try again.",
          icon: (
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          ),
          bgColor: "bg-red-50 dark:bg-red-950",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-700 dark:text-red-300"
        };
      case "reconnecting":
        return {
          title: "Reconnecting...",
          description: "Attempting to restore connection...",
          icon: (
            <svg
              className="h-5 w-5 animate-pulse text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ),
          bgColor: "bg-yellow-50 dark:bg-yellow-950",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          textColor: "text-yellow-700 dark:text-yellow-300"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex h-dvh items-center justify-center p-4">
      <div
        className={`w-full max-w-sm ${config.bgColor} ${config.borderColor} rounded-lg border p-6`}
      >
        <div className="mb-4 flex items-center space-x-3">
          {config.icon}
          <h3 className={`font-semibold ${config.textColor}`}>
            {config.title}
          </h3>
        </div>

        <p className={`text-sm ${config.textColor} mb-4 opacity-90`}>
          {config.description}
        </p>

        {type === "error" && (
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Refresh Page
          </button>
        )}

        {type !== "error" && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="h-1 w-1 animate-pulse rounded-full bg-current"></div>
            <span>This may take a few moments</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
