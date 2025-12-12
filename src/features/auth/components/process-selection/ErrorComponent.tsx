import Image from "next/image";
const ErrorComponent = ({
  errors,
  handleReset
}: {
  errors: string;
  handleReset: () => void;
}) => (
  <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4 py-4 sm:px-5 dark:bg-gray-900">
    <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 dark:bg-gray-800 dark:shadow-red-900/10">
      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        <div className="absolute inset-0 bg-white dark:bg-gray-800"></div>

        <div className="relative z-20">
          {/* Logo Section */}
          <div className="my-4 flex w-full items-center justify-center sm:my-6">
            <div className="relative">
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-white p-4 shadow-md sm:h-24 sm:w-24 sm:p-5 dark:bg-gray-800">
                <Image
                  src="/access-control.png"
                  alt="Logo"
                  width={80}
                  height={80}
                  className="relative z-10 object-contain drop-shadow-md"
                  priority
                />
              </div>
            </div>
          </div>

          <h1 className="mb-2 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-center text-2xl font-extrabold text-transparent sm:mb-3 sm:text-3xl dark:from-red-400 dark:to-red-300">
            Verification Failed
          </h1>

          <div className="mb-5 overflow-hidden rounded-xl bg-red-50 p-3 shadow-sm sm:mb-6 sm:p-4 dark:bg-red-900/20">
            <p className="mx-auto text-red-600 dark:text-red-400">
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-pulse sm:h-5 sm:w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="text-sm sm:text-base">{errors}</span>
              </span>
              <span className="mt-1 block text-xs text-red-500 sm:text-sm dark:text-red-400">
                Please try again or contact support for assistance.
              </span>
            </p>
          </div>

          <button
            onClick={handleReset}
            className="group mt-5 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-100 sm:mt-6 sm:px-6 dark:hover:shadow-blue-900/20"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:rotate-180 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Try Again</span>
            </div>
          </button>

          <p className="mt-3 text-center text-xs text-gray-500 sm:mt-4 dark:text-gray-400">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  </div>
);
export default ErrorComponent;
