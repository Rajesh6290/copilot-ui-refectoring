"use client";
import useSwr from "@/shared/hooks/useSwr";
import { useState } from "react";
import dynamic from "next/dynamic";
const Empty = dynamic(() => import("@/shared/core/Empty"), {
  ssr: false
});
const FrameworkCard = dynamic(() => import("./FrameworkCard"), {
  ssr: false
});
const CustomPagination = dynamic(
  () => import("@/shared/core/CustomPagination"),
  {
    ssr: false
  }
);

const CardSkeleton = () => {
  return (
    <div className="shadow-1 flex h-fit w-full animate-pulse flex-col gap-4 rounded-lg bg-white p-4 drop-shadow-1 dark:bg-darkSidebarBackground dark:shadow-none dark:drop-shadow-none">
      {/* Header Section */}
      <div className="flex w-full items-center gap-3">
        <div className="h-16 w-16 rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="flex w-full flex-col gap-2">
          <div className="h-5 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-4 w-48 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-5 w-20 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>

      {/* Progress Chart Skeleton */}
      <div className="h-24 w-full rounded-lg bg-gray-300 dark:bg-gray-700"></div>

      {/* Compliance Badge Skeleton */}
      <div className="mb-10 flex w-full items-center justify-center">
        <div className="h-10 w-36 rounded-full bg-gray-300 dark:bg-gray-700"></div>
      </div>

      {/* Stats Section Skeleton */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex flex-col gap-2">
            <div className="h-6 w-16 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex flex-col gap-2">
            <div className="h-6 w-12 rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-36 rounded bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
const SkeletonLoader = () => {
  return (
    <div className="flex w-full flex-col gap-5 overflow-y-auto pt-3">
      <div className="flex w-full items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"></div>
      </div>
      <div className="grid h-full w-full grid-cols-1 items-center gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <CardSkeleton key={item} />
        ))}
      </div>
      <div className="mt-4 flex w-full items-center justify-center gap-2">
        <div className="h-10 w-10 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-10 w-10 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-10 w-10 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-10 w-10 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-10 w-10 animate-pulse rounded-md bg-gray-300 dark:bg-gray-700"></div>
      </div>
    </div>
  );
};

const Framework = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { data, isValidating } = useSwr(
    `frameworks?page=${currentPage}&limit=${limit}`
  );

  if (isValidating) {
    return <SkeletonLoader />;
  }

  return (
    <div className="flex w-full flex-col gap-5 overflow-y-auto pt-3">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-700 dark:text-white">
          Framework
        </h1>
      </div>

      {/* Empty State */}
      {!data?.frameworks || data?.frameworks?.length === 0 ? (
        <div className="flex h-[calc(100dvh-200px)] w-full items-center justify-center">
          <div className="w-fit">
            <Empty
              title="No Frameworks Found"
              subTitle="There are currently no frameworks available to display."
            />
          </div>
        </div>
      ) : (
        <>
          <div className="grid h-full w-full grid-cols-1 items-center gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data?.frameworks
              ?.map(
                (
                  item: {
                    id: string;
                    name: string;
                    description: string;
                    logo_url: string;
                    requirement_stats: {
                      in_scope_requirements: number;
                      ready_requirements: number;
                    };
                    short_name: string;
                    version: string;
                    jurisdiction: string;
                    badge_url: string;
                    doc_id: string;
                  },
                  index: number
                ) => <FrameworkCard key={index} item={item} />
              )
              .reverse()}
          </div>

          {/* Pagination Component */}
          {data?.pagination && data && data?.frameworks?.length > 0 && (
            <div className="mt-4 w-full">
              <CustomPagination
                pagination={data?.pagination}
                setPageNumber={setCurrentPage}
                pageNumber={currentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Framework;
