const CompanyFormSkeleton = () => {
  return (
    <div className="shadow-1 flex w-full animate-pulse flex-col overflow-y-auto rounded-xl bg-white p-5 dark:bg-darkSidebarBackground">
      {/* Logo Section Skeleton */}
      <div className="mb-6 flex items-center gap-10">
        <div className="relative h-24 w-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>

        <div className="flex flex-col gap-2">
          <div className="h-9 w-32 rounded-md bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-48 rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Form Fields Skeleton */}
      <div className="space-y-6">
        <div className="grid w-full grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Company Name Field Skeleton */}
          <div>
            <div className="mb-2 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-12 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Company Website Field Skeleton */}
          <div>
            <div className="mb-2 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-12 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Company Email Field Skeleton */}
          <div>
            <div className="mb-2 h-4 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-12 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>

        {/* Company Description Field Skeleton */}
        <div>
          <div className="mb-2 h-4 w-36 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-32 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>

      {/* Form Controls Skeleton */}
      <div className="flex w-full items-center gap-5 pt-5">
        <div className="h-10 w-24 rounded-md bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-10 w-24 rounded-md bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );
};
export default CompanyFormSkeleton;
