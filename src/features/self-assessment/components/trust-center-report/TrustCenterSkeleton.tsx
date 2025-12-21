import {
  MailCheck,
  Earth,
  Phone,
  ChartNoAxesGantt,
  Archive,
  PackageSearch,
  Cpu,
  Building,
  RadioTower,
  TableOfContents,
  Rss
} from "lucide-react";
import React from "react";

const TrustCenterSkeleton = ({ helpOpen }: { helpOpen: boolean }) => {
  return (
    <div className="flex w-full animate-pulse items-start justify-center py-5">
      <div
        className={`shadow-1 flex h-fit w-full flex-col overflow-hidden rounded-lg bg-white dark:bg-darkSidebarBackground ${
          helpOpen ? "sm:w-full" : "sm:w-4/5"
        } `}
      >
        {/* Header Section Skeleton */}
        <div className="flex w-full flex-col gap-5 p-6">
          <div className="flex items-center gap-10">
            {/* Logo Skeleton */}
            <div className="size-20 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex flex-col gap-3">
              <div className="h-8 w-64 rounded-md bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex items-center gap-7">
                <span className="flex items-center gap-2">
                  <MailCheck
                    size={23}
                    className="text-gray-300 dark:text-gray-600"
                  />
                  <div className="h-5 w-40 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                </span>
                <span className="flex items-center gap-2">
                  <Earth
                    size={23}
                    className="text-gray-300 dark:text-gray-600"
                  />
                  <div className="h-5 w-40 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                </span>
                <span className="flex items-center gap-2">
                  <Phone
                    size={23}
                    className="text-gray-300 dark:text-gray-600"
                  />
                  <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                </span>
              </div>
            </div>
          </div>
          {/* Overview Text Skeleton */}
          <div className="h-16 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
        </div>

        <span className="h-0.5 w-full bg-neutral-100 dark:bg-darkHoverBackground"></span>

        {/* Tab Navigation Skeleton */}
        <div className="flex flex-col gap-5 p-6">
          <div className="sticky -top-2 z-50 flex w-full flex-wrap items-center gap-5 bg-white p-2 dark:bg-darkSidebarBackground">
            {[
              { name: "Overview", icon: <ChartNoAxesGantt size={20} /> },
              { name: "Resources", icon: <Archive size={20} /> },
              { name: "AI Product", icon: <PackageSearch size={20} /> },
              { name: "Sub Processor", icon: <Cpu size={20} /> },
              { name: "Applications", icon: <Building size={20} /> },
              { name: "Controls", icon: <RadioTower size={20} /> },
              { name: "FAQs", icon: <TableOfContents size={20} /> },
              { name: "Updates", icon: <Rss size={20} /> }
            ].map((item, index) => (
              <div
                key={index}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 tracking-wider ${index === 0 ? "bg-[#151D33] dark:bg-darkMainBackground" : ""}`}
              >
                {React.cloneElement(item.icon, {
                  className:
                    index === 0
                      ? "text-white"
                      : "text-gray-300 dark:text-gray-600"
                })}
                <div
                  className={`h-4 w-24 rounded-md ${index === 0 ? "bg-gray-400 dark:bg-gray-500" : "bg-gray-200 dark:bg-gray-700"}`}
                ></div>
              </div>
            ))}
          </div>

          {/* Resources Section Skeleton */}
          <div className="flex w-full flex-col gap-4 rounded-lg border dark:border-neutral-600">
            <span className="p-4 pb-0">
              <div className="h-6 w-28 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </span>
            <div className="flex w-full flex-col gap-5 p-4 pt-0">
              {Array(3)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex w-full items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-5 w-48 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                ))}
            </div>
          </div>

          {/* AI Product Section Skeleton */}
          <div className="flex w-full flex-col gap-4 rounded-lg border p-4 dark:border-neutral-600">
            <div className="h-6 w-28 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            {Array(2)
              .fill(null)
              .map((_, sectionIndex) => (
                <div key={sectionIndex} className="flex w-full flex-col gap-4">
                  <div className="flex w-full items-center justify-between">
                    <div className="h-6 w-48 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="rounded-lg border border-neutral-300 bg-tertiary/10 dark:border-neutral-600">
                    {Array(3)
                      .fill(null)
                      .map((_i, qIndex) => (
                        <div
                          key={qIndex}
                          className="border-b border-neutral-300 last:border-b-0 dark:border-neutral-600"
                        >
                          <div className="flex w-full cursor-pointer items-center justify-between p-4">
                            <div className="flex items-center">
                              <div className="mr-3 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                              <div className="h-5 w-64 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                            <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Sub Processor Section Skeleton */}
          <div className="flex w-full flex-col gap-4 rounded-lg border dark:border-neutral-600">
            <span className="p-4 pb-0">
              <div className="h-6 w-32 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            </span>
            {Array(3)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className={`flex w-full items-center justify-between border-b border-neutral-200 dark:border-neutral-600 ${index === 2 ? "border-b-0" : ""}`}
                >
                  <div className="flex items-center gap-6 p-3">
                    <div className="h-20 w-20 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-6 w-32 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                    <span className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-neutral-400 dark:bg-gray-400"></span>
                      <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                    </span>
                  </div>
                  <div className="mr-4 h-6 w-24 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
          </div>

          {/* Applications Section Skeleton */}
          <div className="flex w-full flex-col gap-4 rounded-lg border p-4 dark:border-neutral-600">
            <div className="h-6 w-32 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
              {Array(2)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="shadow-1 overflow-hidden rounded-lg border border-gray-100 bg-white backdrop-blur-sm dark:border-neutral-600 dark:bg-darkMainBackground"
                  >
                    <div className="relative p-6 pb-0">
                      <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="h-6 w-48 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                            <div className="mt-2 flex items-center">
                              <div className="mr-2 h-5 w-5 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                              <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                          </div>
                        </div>
                        <div className="h-12 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 p-3">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="p-3">
                          <div className="mb-4 flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                          </div>
                          <div className="space-y-4">
                            {Array(4)
                              .fill(null)
                              .map((_i, i) => (
                                <div key={i} className="flex items-start">
                                  <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                                  <div>
                                    <div className="h-3 w-16 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="mt-1 h-4 w-32 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Controls Section Skeleton */}
          <div className="flex w-full flex-col gap-4 rounded-lg border p-4 dark:border-neutral-600">
            <div className="h-6 w-28 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex h-fit w-full gap-5">
              <div className="flex w-[30%] flex-col gap-3">
                {Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`h-10 rounded-md ${i === 0 ? "bg-tertiary-100 dark:bg-tertiary-700" : "bg-gray-200 dark:bg-gray-700"}`}
                    ></div>
                  ))}
              </div>
              <div className="flex w-[70%] flex-col gap-5">
                <div className="h-6 w-48 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex w-full flex-col rounded-lg border border-neutral-200">
                  <div className="flex w-full items-center border-b border-neutral-200 p-4">
                    <div className="w-[90%] rounded-md bg-gray-200 dark:bg-gray-700"></div>
                    <div className="w-[10%] rounded-md bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  {Array(3)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="flex w-full items-center justify-between p-4"
                      >
                        <div className="flex w-full flex-col gap-2">
                          <div className="h-6 w-64 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                          <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* FAQs Section Skeleton */}
          <div className="flex w-full flex-col gap-4 rounded-lg border p-4 dark:border-neutral-600">
            <div className="h-6 w-28 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            <div className="rounded-lg border border-neutral-300 dark:border-neutral-600">
              {Array(4)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="border-b border-neutral-300 last:border-b-0 dark:border-neutral-600"
                  >
                    <div className="flex w-full cursor-pointer items-center justify-between p-4">
                      <div className="flex items-center">
                        <div className="mr-3 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-5 w-64 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Updates Section Skeleton */}
          <div className="flex w-full flex-col gap-4 rounded-lg border p-4 dark:border-neutral-600">
            <div className="h-6 w-28 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            <div className="rounded-lg border border-neutral-300 dark:border-neutral-600">
              {Array(3)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="border-b border-neutral-300 last:border-b-0 dark:border-neutral-600"
                  >
                    <div className="flex w-full cursor-pointer items-center justify-between p-4">
                      <div className="line-clamp-1 flex w-full items-center gap-5">
                        <div className="h-5 w-36 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-5 w-64 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TrustCenterSkeleton;
