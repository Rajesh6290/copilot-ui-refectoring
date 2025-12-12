import Image from "next/image";
const Verification = ({ currentStep }: { currentStep: number }) => (
  <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4 py-4 sm:px-5 dark:bg-gray-900">
    <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 dark:bg-gray-800 dark:shadow-blue-900/10">
      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        <div className="absolute inset-0 bg-white dark:bg-gray-800"></div>

        <div className="relative z-20">
          {/* Logo Section */}
          <div className="my-4 flex w-full items-center justify-center sm:my-6">
            <div className="relative">
              <div className="animate-ping-slow absolute inset-0 -m-3 rounded-full border-2 border-blue-300 opacity-40 sm:-m-4 dark:border-blue-500"></div>
              <div className="animate-ping-slow animation-delay-1000 absolute inset-0 -m-6 rounded-full border-2 border-blue-200 opacity-30 sm:-m-8 dark:border-blue-600"></div>

              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-white p-4 shadow-md transition-all duration-300 hover:shadow-blue-100 sm:h-24 sm:w-24 sm:p-5 dark:bg-gray-800 dark:hover:shadow-blue-900/20">
                <div className="animate-pulse-slow absolute inset-0 rounded-full bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 opacity-50 dark:from-blue-900/20 dark:via-blue-800/20 dark:to-blue-900/20"></div>
                <Image
                  src="/access-control.svg"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="relative z-10 object-contain drop-shadow-md transition-all duration-700 ease-in-out hover:scale-110"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-center text-2xl font-extrabold text-transparent transition-all duration-300 hover:from-blue-600 hover:to-blue-500 sm:mb-3 sm:text-3xl dark:from-blue-400 dark:to-blue-300">
            Verifying Access
          </h1>

          {/* Status message */}
          <div className="mb-5 overflow-hidden rounded-xl bg-blue-50 p-3 shadow-sm sm:mb-6 sm:p-4 dark:bg-blue-900/20">
            <p className="mx-auto text-blue-700 dark:text-blue-300">
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm sm:text-base">
                  Verifying your credentials...
                </span>
              </span>
              <span className="mt-1 block text-xs text-blue-600 sm:text-sm dark:text-blue-300">
                {"Setting up secure access to your account's resources."}
              </span>
            </p>
          </div>

          {/* Progress indicator */}
          <div className="space-y-4 sm:space-y-5">
            {/* Animated progress bar */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-in-out"
                style={{
                  width: `${currentStep * 25}%`,
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)"
                }}
              ></div>

              <div className="animate-shine absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-75"></div>
            </div>

            {/* Steps visualization */}
            <div className="flex justify-between px-1 sm:px-2">
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${currentStep >= 1 ? "bg-blue-500 dark:bg-blue-400" : "bg-gray-300 dark:bg-gray-600"} ${currentStep === 1 ? "animate-pulse" : ""}`}
                ></div>
                <span
                  className={`text-xs ${currentStep === 1 ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Connecting
                </span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${currentStep >= 2 ? "bg-blue-500 dark:bg-blue-400" : "bg-gray-300 dark:bg-gray-600"} ${currentStep === 2 ? "animate-pulse" : ""}`}
                ></div>
                <span
                  className={`text-xs ${currentStep === 2 ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Authenticating
                </span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${currentStep >= 3 ? "bg-blue-500 dark:bg-blue-400" : "bg-gray-300 dark:bg-gray-600"} ${currentStep === 3 ? "animate-pulse" : ""}`}
                ></div>
                <span
                  className={`text-xs ${currentStep === 3 ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Authorizing
                </span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${currentStep >= 4 ? "bg-blue-500 dark:bg-blue-400" : "bg-gray-300 dark:bg-gray-600"} ${currentStep === 4 ? "animate-pulse" : ""}`}
                ></div>
                <span
                  className={`text-xs ${currentStep === 4 ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  Redirecting
                </span>
              </div>
            </div>

            {/* Security badges */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-6">
              <div
                className={`flex items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-sm transition-all duration-300 sm:px-3 ${currentStep >= 1 ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
              >
                <svg
                  className={`mr-1 h-3 w-3 ${currentStep >= 1 ? "text-green-500 dark:text-green-400" : "text-gray-400 dark:text-gray-500"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Secure Connection
              </div>
              <div
                className={`flex items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-sm transition-all duration-300 sm:px-3 ${currentStep >= 2 ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
              >
                <svg
                  className={`mr-1 h-3 w-3 ${currentStep >= 2 ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Encrypted Data
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-center space-x-2 sm:mt-6">
            <div className="flex animate-pulse items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 sm:px-3 sm:py-1.5 dark:bg-blue-900/20 dark:text-blue-400">
              <svg
                className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verification in progress...
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-gray-500 sm:mt-4 dark:text-gray-400">
            Please wait while we secure your session
          </p>
        </div>
      </div>
    </div>

    <div className="absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t from-blue-50/20 to-transparent sm:h-16 dark:from-blue-900/10"></div>
  </div>
);
export default Verification;
