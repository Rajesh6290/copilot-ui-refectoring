import { useAuth } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import { Account } from "./ProcessSelection";

const AccountSelection = ({
  multiAccount,
  accounts,
  filteredAccounts,
  searchQuery,
  accountLoading,
  handleSearch,
  handleSetToAccount,
  handleReset
}: {
  multiAccount: boolean;
  accounts: Account[];
  filteredAccounts: Account[];
  searchQuery: string;
  accountLoading: string | null;
  handleSearch: (query: string) => void;
  handleSetToAccount: (partnershipId: string) => void;
  handleReset: () => void;
}) => {
  const { signOut } = useAuth();
  if (multiAccount && accounts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:py-8">
        <motion.div
          className="mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="mb-6 text-center sm:mb-8">
            <motion.div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-xl sm:mb-6 sm:h-20 sm:w-20"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <svg
                className="h-8 w-8 text-white sm:h-10 sm:w-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </motion.div>

            <motion.h1
              className="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              No Accounts Available
            </motion.h1>
          </div>

          <motion.div
            className="overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-xl backdrop-blur-md dark:border-gray-700/20 dark:bg-gray-800/70"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="p-6 text-center sm:p-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 sm:mb-6 sm:h-20 sm:w-20">
                <svg
                  className="h-8 w-8 text-amber-600 dark:text-amber-400 sm:h-10 sm:w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>

              <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-2xl">
                Account Access Required
              </h2>
              <p className="mb-6 text-base text-gray-600 dark:text-gray-400 sm:mb-8 sm:text-lg">
                You have not been associated with any account yet. Please
                contact your administrator to get access to an account.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <motion.button
                  onClick={() => window.location.reload()}
                  className="group relative overflow-hidden rounded-xl bg-tertiary-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-tertiary-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-tertiary-500 focus:ring-offset-2 sm:px-8 sm:py-4"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Refresh Page</span>
                </motion.button>

                <motion.button
                  onClick={() => signOut()}
                  className="group rounded-xl border-2 border-gray-200 bg-white/80 px-6 py-3 font-semibold text-gray-700 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 hover:bg-white hover:shadow-lg dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800 sm:px-8 sm:py-4"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Out
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Side - Information Panel */}
        <motion.div
          className="w-full border-b border-white/20 bg-white/70 shadow-xl backdrop-blur-md dark:border-gray-700/20 dark:bg-gray-800/70 lg:w-2/5 lg:border-b-0 lg:border-r xl:w-1/3"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex h-full flex-col p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="mb-6 lg:mb-10">
              <motion.div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-tertiary-600 shadow-lg sm:mb-6 sm:h-14 sm:w-14 lg:mb-8 lg:h-16 lg:w-16"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <svg
                  className="h-6 w-6 text-white sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </motion.div>

              <motion.h1
                className="mb-3 text-2xl font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-3xl lg:mb-6 lg:text-4xl xl:text-5xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                Select Your Client
              </motion.h1>

              <motion.p
                className="mb-4 text-sm font-medium italic text-gray-600 dark:text-gray-400 sm:mb-6 sm:text-base lg:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                Choose a client from the list to access your personalized
                dashboard and manage your workspace efficiently.
              </motion.p>

              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 shadow-sm dark:bg-green-900/20 sm:gap-3 sm:px-6 sm:py-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                <motion.div
                  className="h-2.5 w-2.5 rounded-full bg-green-500 sm:h-3 sm:w-3"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-medium text-green-700 dark:text-green-300 sm:text-base">
                  {accounts.length} client{accounts.length > 1 ? "s" : ""}{" "}
                  available
                </span>
              </motion.div>
            </div>

            {/* Search Section */}
            <motion.div
              className="mb-6 lg:mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <span className="mb-3 block text-xs font-semibold text-gray-700 dark:text-gray-300 sm:mb-4 sm:text-sm">
                Search clients
              </span>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                  <svg
                    className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, ID, or tenant..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-white/80 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 shadow-lg ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-300 focus:shadow-xl focus:ring-2 focus:ring-tertiary-500 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400 dark:ring-gray-600 dark:focus:ring-tertiary-400 sm:py-4 sm:pl-12 sm:pr-4 sm:text-base"
                />
                {searchQuery && (
                  <motion.button
                    onClick={() => handleSearch("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 sm:pr-4"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                )}
              </div>

              {searchQuery && (
                <motion.div
                  className="mt-2 text-xs text-gray-600 dark:text-gray-400 sm:mt-3 sm:text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {filteredAccounts.length === 0 ? (
                    <span>No clients found matching {`"${searchQuery}"`}</span>
                  ) : (
                    <span>
                      {filteredAccounts.length} client
                      {filteredAccounts.length > 1 ? "s" : ""} found
                    </span>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Additional Actions */}
            <motion.div
              className="mt-auto hidden lg:block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              <div className="space-y-3 sm:space-y-4">
                <motion.button
                  onClick={handleReset}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-gray-300 hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-700 sm:gap-3 sm:px-6 sm:py-4 sm:text-base"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </motion.button>

                <motion.button
                  onClick={() => signOut()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100/80 px-4 py-3 text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-gray-200/80 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-600/80 dark:text-gray-300 dark:hover:bg-gray-500/80 sm:gap-3 sm:px-6 sm:py-4 sm:text-base"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Accounts List (Desktop) */}
        <motion.div
          className="hidden w-3/5 flex-col lg:flex xl:w-2/3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b border-white/20 bg-white/60 px-6 py-6 backdrop-blur-md dark:border-gray-700/20 dark:bg-gray-800/60 lg:px-8 lg:py-8">
              <motion.h2
                className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Choose an account
              </motion.h2>
              <motion.p
                className="mt-2 text-sm text-gray-600 dark:text-gray-400 lg:text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Select a client to continue to your personalized dashboard
              </motion.p>
            </div>

            {/* Accounts List */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white/30 to-white/10 backdrop-blur-sm dark:from-gray-900/30 dark:to-gray-900/10">
              {filteredAccounts.length === 0 && searchQuery ? (
                <motion.div
                  className="flex h-full items-center justify-center p-8 text-center lg:p-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-700 lg:mb-6 lg:h-20 lg:w-20">
                      <svg
                        className="h-8 w-8 text-gray-400 lg:h-10 lg:w-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white lg:mb-3 lg:text-xl">
                      No clients found
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 lg:text-base">
                      Try adjusting your search terms or clear the search to see
                      all clients.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="p-6 lg:p-8">
                  <div className="mx-auto max-w-md space-y-3 lg:space-y-4">
                    <AnimatePresence>
                      {filteredAccounts.map((account, index) => {
                        const isLoading =
                          accountLoading === account?.partnership_id;
                        const validUpto = account?.valid_upto
                          ? new Date(account.valid_upto).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              }
                            )
                          : "N/A";

                        return (
                          <motion.div
                            key={account?.partnership_id ?? `account-${index}`}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                            transition={{
                              delay: index * 0.1,
                              duration: 0.6,
                              ease: [0.4, 0, 0.2, 1]
                            }}
                            className={`group relative overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-5 shadow-xl backdrop-blur-md transition-all duration-500 dark:border-gray-700/40 dark:bg-gray-800/80 lg:p-6 ${
                              isLoading ||
                              accountLoading !== null ||
                              !account?.partnership_id
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:border-tertiary-300/60 hover:bg-white/90 hover:shadow-2xl dark:hover:border-tertiary-600/60 dark:hover:bg-gray-800/90"
                            }`}
                            onClick={() =>
                              !isLoading &&
                              !accountLoading &&
                              account?.partnership_id &&
                              handleSetToAccount(account.partnership_id)
                            }
                            whileTap={
                              !isLoading &&
                              !accountLoading &&
                              account?.partnership_id
                                ? {
                                    scale: 0.98
                                  }
                                : {}
                            }
                          >
                            <div className="relative z-10 flex items-center space-x-4 lg:space-x-5">
                              {/* Avatar */}
                              <div className="relative flex-shrink-0">
                                <motion.div
                                  className="flex h-14 w-14 items-center justify-center rounded-xl bg-tertiary-600 text-white shadow-lg lg:h-16 lg:w-16"
                                  whileHover={{
                                    rotate: [0, -3, 3, 0],
                                    scale: 1.05,
                                    transition: { duration: 0.3 }
                                  }}
                                >
                                  <span className="text-lg font-bold lg:text-xl">
                                    {account?.client_name
                                      ?.charAt?.(0)
                                      ?.toUpperCase() ?? "D"}
                                  </span>
                                </motion.div>

                                {!isLoading && (
                                  <motion.div
                                    className="border-3 absolute -bottom-1 -right-1 size-3 rounded-full border-white bg-green-500 shadow-lg dark:border-gray-800"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      delay: 0.4 + index * 0.1,
                                      type: "spring",
                                      stiffness: 300
                                    }}
                                  >
                                    <motion.div className="h-full w-full rounded-full bg-green-400" />
                                  </motion.div>
                                )}
                              </div>

                              {/* Account Info */}
                              <div className="min-w-0 flex-1">
                                <motion.h3
                                  className="truncate text-base font-bold text-gray-900 dark:text-white lg:text-lg"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 + index * 0.1 }}
                                >
                                  {account?.client_name ?? "Developers"}
                                </motion.h3>

                                <motion.p
                                  className="truncate text-xs font-medium text-gray-600 dark:text-gray-400 lg:text-sm"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                  ID: {account?.client_id ?? "N/A"}
                                </motion.p>

                                <motion.div
                                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 dark:bg-green-900/30 lg:mt-3 lg:gap-2 lg:px-3 lg:py-1.5"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                  <motion.div
                                    className="size-1.5 rounded-full bg-green-500 lg:size-2"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      delay: index * 0.3
                                    }}
                                  />
                                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                                    Valid until {validUpto}
                                  </span>
                                </motion.div>
                              </div>

                              {/* Loading State or Arrow */}
                              <div className="flex items-center">
                                {isLoading ? (
                                  <div className="flex items-center space-x-2 lg:space-x-3">
                                    <LoadingSpinner size="small" />
                                    <span className="hidden text-sm font-medium text-tertiary-600 dark:text-tertiary-400 lg:inline">
                                      Connecting...
                                    </span>
                                  </div>
                                ) : (
                                  <motion.div
                                    className="rounded-full bg-tertiary-50 p-2.5 opacity-0 transition-all duration-300 group-hover:bg-tertiary-100 group-hover:opacity-100 dark:bg-tertiary-900/30 dark:group-hover:bg-tertiary-900/50 lg:p-3"
                                    whileHover={{
                                      scale: 1.1,
                                      rotate: [0, 5, 0],
                                      transition: { duration: 0.2 }
                                    }}
                                  >
                                    <svg
                                      className="h-4 w-4 text-tertiary-600 dark:text-tertiary-400 lg:h-5 lg:w-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mobile View */}
        <motion.div
          className="flex w-full flex-col lg:hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        >
          <div className="p-4 sm:p-6">
            {/* Mobile Header */}
            <motion.div
              className="mb-6 text-center sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-600 shadow-xl sm:mb-6 sm:h-16 sm:w-16"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.4,
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <svg
                  className="h-7 w-7 text-white sm:h-8 sm:w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </motion.div>

              <motion.h2
                className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Choose an account
              </motion.h2>
              <motion.p
                className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Tap on any client to continue to your dashboard
              </motion.p>
            </motion.div>

            {/* Mobile Search */}
            <motion.div
              className="mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                  <svg
                    className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-white/80 py-3 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 shadow-lg ring-1 ring-gray-200 backdrop-blur-sm transition-all duration-300 focus:shadow-xl focus:ring-2 focus:ring-tertiary-500 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400 dark:ring-gray-600 dark:focus:ring-tertiary-400 sm:py-4 sm:pl-12 sm:pr-4 sm:text-base"
                />
              </div>
            </motion.div>

            {/* Mobile Accounts List */}
            <div className="space-y-3 sm:space-y-4">
              <AnimatePresence>
                {filteredAccounts.map((account, index) => {
                  const isLoading = accountLoading === account?.partnership_id;
                  const validUpto = account?.valid_upto
                    ? new Date(account.valid_upto).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })
                    : "N/A";

                  return (
                    <motion.div
                      key={account?.partnership_id ?? `mobile-account-${index}`}
                      initial={{ opacity: 0, x: -30, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -30, scale: 0.95 }}
                      transition={{
                        delay: index * 0.1,
                        duration: 0.6,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      className={`group relative overflow-hidden rounded-xl border border-white/40 bg-white/80 p-4 shadow-xl backdrop-blur-md transition-all duration-500 dark:border-gray-700/40 dark:bg-gray-800/80 sm:p-5 ${
                        isLoading ||
                        accountLoading !== null ||
                        !account?.partnership_id
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:scale-[1.01] hover:border-tertiary-300/60 hover:bg-white/90 hover:shadow-2xl dark:hover:border-tertiary-600/60 dark:hover:bg-gray-800/90"
                      }`}
                      onClick={() =>
                        !isLoading &&
                        !accountLoading &&
                        account?.partnership_id &&
                        handleSetToAccount(account.partnership_id)
                      }
                      whileTap={
                        !isLoading && !accountLoading && account?.partnership_id
                          ? { scale: 0.98, transition: { duration: 0.1 } }
                          : {}
                      }
                    >
                      <div className="relative z-10 flex items-center space-x-3 sm:space-x-4">
                        {/* Mobile Avatar */}
                        <div className="relative flex-shrink-0">
                          <motion.div
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-600 text-white shadow-lg sm:h-14 sm:w-14"
                            whileHover={{
                              scale: 1.05,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <span className="text-base font-bold sm:text-lg">
                              {account?.client_name
                                ?.charAt?.(0)
                                ?.toUpperCase() ?? "D"}
                            </span>
                          </motion.div>
                          {!isLoading && (
                            <motion.div
                              className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 shadow-sm dark:border-gray-800 sm:h-4 sm:w-4"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                delay: 0.3 + index * 0.1,
                                type: "spring"
                              }}
                            />
                          )}
                        </div>

                        {/* Mobile Account Info */}
                        <div className="min-w-0 flex-1">
                          <motion.h3
                            className="truncate text-sm font-bold text-gray-900 dark:text-white sm:text-base"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                          >
                            {account?.client_name ?? "Developers"}
                          </motion.h3>
                          <motion.p
                            className="truncate text-xs text-gray-600 dark:text-gray-400 sm:text-sm"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            {account?.client_id ?? "N/A"}
                          </motion.p>
                          <motion.div
                            className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 dark:bg-green-900/30 sm:mt-2 sm:gap-2 sm:px-2.5"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">
                              Until {validUpto}
                            </span>
                          </motion.div>
                        </div>

                        {/* Mobile Loading/Arrow */}
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <LoadingSpinner size="small" />
                          </div>
                        ) : (
                          <motion.div
                            className="rounded-full bg-tertiary-50 p-2 opacity-70 transition-all duration-300 group-hover:bg-tertiary-100 group-hover:opacity-100 dark:bg-tertiary-900/30 dark:group-hover:bg-tertiary-900/50"
                            whileHover={{
                              scale: 1.1,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <svg
                              className="h-4 w-4 text-tertiary-600 dark:text-tertiary-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Mobile Actions */}
            <motion.div
              className="mt-6 flex gap-3 sm:mt-8 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-3 py-3 text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-gray-300 hover:bg-white hover:shadow-xl dark:border-gray-600 dark:bg-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-700 sm:px-4 sm:py-4"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </motion.button>

              <motion.button
                onClick={() => signOut()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100/80 px-3 py-3 text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-gray-200/80 hover:shadow-xl dark:bg-gray-600/80 dark:text-gray-300 dark:hover:bg-gray-500/80 sm:px-4 sm:py-4"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountSelection;
