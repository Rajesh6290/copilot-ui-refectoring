const ChatSkeleton = () => {
  return (
    <div className="flex w-full items-start justify-center transition-all duration-300">
      <div className="flex w-full flex-col gap-5 pt-5 lg:w-3/4 2xl:w-3/5">
        {/* Chat Message Skeleton */}
        {[1, 2, 3].map((index) => (
          <div key={index} className="animate-pulse space-y-4">
            {/* User Query Skeleton */}
            <div className="flex justify-end">
              <div className="max-w-sm space-y-2 rounded-lg bg-gray-200 p-3 dark:bg-gray-700">
                <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
                <div className="h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-600"></div>
              </div>
            </div>

            {/* AI Response Skeleton */}
            <div className="flex justify-start">
              <div className="max-w-lg space-y-3 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                <div className="h-4 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
                <div className="h-4 w-5/6 rounded bg-gray-300 dark:bg-gray-600"></div>
                <div className="h-4 w-4/6 rounded bg-gray-300 dark:bg-gray-600"></div>
                <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Input Box Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 dark:bg-gray-900">
          <div className="mx-auto max-w-3xl">
            <div className="flex animate-pulse items-center space-x-3 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <div className="h-10 flex-1 rounded bg-gray-300 dark:bg-gray-600"></div>
              <div className="h-10 w-10 rounded bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;
