import { AnimatePresence, motion } from "framer-motion";
import { ServiceCredential } from "./SystemConnection";

const IntegrationList: React.FC<{
  services: ServiceCredential[];
  onCardClick: (service: ServiceCredential) => void;
  onDelete: (serviceName: string, e: React.MouseEvent) => void;
  showDeleteConfirm: string | null;
  setShowDeleteConfirm: (name: string | null) => void;
  isLoading: boolean;
  handleDeleteConfirm: () => void;
}> = ({
  services,
  onCardClick,
  onDelete,
  showDeleteConfirm,
  setShowDeleteConfirm,
  isLoading,
  handleDeleteConfirm
}) => {
  return (
    <>
      <div className="min-h-fit">
        <div className="w-full p-4 sm:p-6">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">
              Integration Hub
            </h1>
            <p className="max-w-3xl text-sm text-slate-500 dark:text-gray-400 sm:text-base">
              Connect your essential services and extend your {"platform's"}{" "}
              capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 2xl:grid-cols-3">
            {services.map((service: ServiceCredential) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onCardClick(service)}
                className={`cursor-pointer overflow-hidden rounded-lg border-l-4 shadow-sm transition-all hover:shadow-md ${
                  service.configured
                    ? "border-tertiary-500 bg-white bg-gradient-to-r from-tertiary-50 to-white dark:bg-gray-800"
                    : "border-gray-300 bg-white hover:border-gray-400 dark:bg-gray-800"
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="mb-4 flex items-start justify-between sm:mb-6">
                    <div className="flex items-start">
                      <div
                        className={`rounded-md border p-2 sm:p-3 ${
                          service.configured
                            ? "border-tertiary-200 bg-tertiary-100 dark:bg-gray-700"
                            : "border-gray-100 bg-gray-50 dark:bg-gray-700"
                        }`}
                      >
                        <img
                          src={service.img}
                          alt={service.name}
                          className="h-8 w-8 object-contain sm:h-10 sm:w-10"
                        />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <h2 className="text-base font-semibold capitalize text-gray-900 dark:text-white sm:text-lg">
                          {service.name}
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          service.configured
                            ? "bg-tertiary-100 text-tertiary-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {service.configured ? "Connected" : "Not Connected"}
                      </span>
                      {service.configured && (
                        <button
                          onClick={(e) => onDelete(service.name, e)}
                          className="z-10 rounded-full p-1 text-red-500 transition-colors hover:bg-red-50"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400 sm:mb-6">
                    {service.desc}
                  </p>

                  <div className="flex items-center text-xs text-gray-500">
                    <div className="flex -space-x-1">
                      {service.fields.slice(0, 3).map((f, i) => (
                        <div
                          key={i}
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-xs font-bold ${
                            f.value !== "N/A"
                              ? "bg-tertiary-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                      {service.fields.length > 3 && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-300 text-xs">
                          +{service.fields.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="ml-2">
                      {service.fields.filter((f) => f.value !== "N/A").length}/
                      {service.fields.length} configured
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div
            tabIndex={0}
            role="button"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
            onClick={() => setShowDeleteConfirm(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowDeleteConfirm(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Delete Integration
              </h3>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete{" "}
                <strong className="capitalize">{showDeleteConfirm}</strong>?
                This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="rounded-md border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                  className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default IntegrationList;
