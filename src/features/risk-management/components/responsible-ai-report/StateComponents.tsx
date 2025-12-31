"use client";

import Empty from "@/shared/core/Empty";

export const SkeletonLoader: React.FC = () => (
  <div className="flex h-fit w-full flex-col gap-6">
    {/* Header Card Skeleton */}
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-gray-800 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex items-center gap-5">
                {/* App Icon */}
                <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700 sm:h-16 sm:w-16" />

                <div className="flex flex-col gap-2">
                  {/* Title */}
                  <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700" />

                  {/* Buttons */}
                  <div className="hidden gap-3 sm:flex">
                    <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700" />
                    <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900 sm:p-4"
                >
                  <div className="mb-2 flex items-center space-x-2">
                    <div className="h-4 w-4 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                  </div>
                  <div className="h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Progress Card */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-gray-900 sm:w-80 sm:p-8">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                <div className="h-8 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
                <div className="h-8 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
              </div>
            </div>
            <div className="h-4 w-full animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>

    {/* Responsible Index Card Skeleton */}
    <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-neutral-800 dark:bg-gray-800 sm:p-8">
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Left Side */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700" />
            <div className="space-y-2">
              <div className="h-6 w-64 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-48 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>

          <div className="h-6 w-72 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-20 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Right Side - Circular Progress */}
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-6 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-5 w-5 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-6 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="space-y-3">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        <div className="space-y-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <div className="mt-2 h-2 w-2 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Pillar Performance Skeleton */}
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-neutral-800 dark:bg-gray-800 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700" />
          <div className="space-y-2">
            <div className="h-6 w-64 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
        <div className="h-8 w-40 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Radar Chart */}
        <div className="flex w-full items-center justify-center lg:w-2/5">
          <div className="h-96 w-96 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Pillar List */}
        <div className="w-full space-y-4 lg:w-3/5">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-neutral-800"
            >
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="h-5 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-2 flex-1 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="h-8 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Gap Map Visualization Skeleton */}
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-gray-800">
      <div className="mb-6 flex items-center space-x-3">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700" />
        <div className="space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>
      <div className="h-96 w-full animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700" />
    </div>

    {/* Risk Details Card Skeleton */}
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700" />
          <div className="h-6 w-48 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-gray-200 p-6 dark:border-neutral-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="h-6 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
            <div className="h-12 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>

    {/* Compliance Card Skeleton */}
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-gray-800">
      <div className="mb-6 flex items-center space-x-3">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700" />
        <div className="h-6 w-56 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-gray-200 p-4 dark:border-neutral-800"
          >
            <div className="mb-3 h-5 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Actions Card Skeleton */}
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-neutral-800 dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-300 dark:bg-gray-700" />
          <div className="h-6 w-64 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 dark:border-neutral-800"
          >
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
            </div>
            <div className="h-8 w-24 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const NoDataState: React.FC = () => (
  <div className="flex h-[calc(100dvh-250px)] w-full items-center justify-center">
    <Empty
      title=" No AI Responsible Report Data Available"
      subTitle="Generate your RAI report by running a Trace in Chat+ or going to the Trace RAI page."
      pathName="Go"
      link="/risk-management/trace-rai"
    />
  </div>
);

export const LoadingState: React.FC = () => (
  <div className="p-4">
    <SkeletonLoader />
  </div>
);
