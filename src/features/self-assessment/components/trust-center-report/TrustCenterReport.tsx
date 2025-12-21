"use client";
import CustomFilePreview from "@/shared/common/CustomFilePreview";
import MarkdownRenderer from "@/shared/common/MarkdownRenderer";
import CustomButton from "@/shared/core/CustomButton";
import useSwr from "@/shared/hooks/useSwr";
import { useMyContext } from "@/shared/providers/AppProvider";
import { useCurrentMenuItem } from "@/shared/utils";
import { Tooltip } from "@mui/material";
import {
  Archive,
  Building,
  ChartNoAxesGantt,
  Cpu,
  Earth,
  MailCheck,
  PackageSearch,
  Phone,
  RadioTower,
  Rss,
  TableOfContents
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaFileCircleCheck, FaFileLines } from "react-icons/fa6";
import { LuExternalLink } from "react-icons/lu";
import AccordionItem from "./AccordionItem";
import ApplicationView from "./ApplicationView";
import ControlDesktopView from "./ControlDesktopView";
import ControlMobileView from "./ControlMobileView";
import PublishDialog from "./PublishDialog";
import TrustCenterSkeleton from "./TrustCenterSkeleton";
import UpdateAccordionItem from "./UpdateAccordionItem";

const TrustCenterReport = () => {
  const [tab, setTab] = useState<string>("Overview");
  const { data, isValidating } = useSwr("trust-center");
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [controlTab, setControlTab] = useState<string>("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const { helpOpen } = useMyContext();
  const currentAccess = useCurrentMenuItem();
  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };
  const [openFile, setOpenFile] = useState<boolean>(false);
  const [fileData, setFileData] = useState<{ url?: string; name?: string }>({});
  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };
  const TABS = [
    {
      name: "Overview",
      icon: <ChartNoAxesGantt size={20} />
    },
    {
      name: "Resources",
      icon: <Archive size={20} />
    },
    {
      name: "AI Assessment",
      icon: <PackageSearch size={20} />
    },
    {
      name: "AI Applications",
      icon: <Building size={20} />
    },
    {
      name: "Sub Processor",
      icon: <Cpu size={20} />
    },
    ...(data?.controls_by_category?.length > 0
      ? [
          {
            name: "Controls",
            icon: <RadioTower size={20} />
          }
        ]
      : []),
    {
      name: "FAQs",
      icon: <TableOfContents size={20} />
    },
    {
      name: "Updates",
      icon: <Rss size={20} />
    }
  ];

  useEffect(() => {
    if (data?.controls_by_category?.length > 0) {
      setControlTab(data?.controls_by_category[0]?.category);
    } else {
      setControlTab("");
    }
  }, [data?.controls_by_category]);

  return (
    <div className="flex w-full items-start justify-center py-5">
      <CustomFilePreview
        fileUrl={fileData?.url || ""}
        fileName={fileData?.name || ""}
        isOpen={openFile}
        onClose={() => setOpenFile(false)}
      />
      <PublishDialog
        open={open}
        onClose={() => setOpen(false)}
        isAccess={
          currentAccess as {
            buttons: {
              permission: {
                is_shown: boolean;
                actions: {
                  create: boolean;
                  update: boolean;
                  delete: boolean;
                  read: boolean;
                };
              };
            }[];
          }
        }
      />
      {isValidating ? (
        <TrustCenterSkeleton helpOpen={helpOpen as boolean} />
      ) : (
        <div
          className={`shadow-1 relative flex h-fit w-full flex-col rounded-lg bg-white dark:bg-darkSidebarBackground ${
            helpOpen ? "lg:w-full" : "lg:w-[90%]"
          } `}
        >
          {currentAccess?.buttons?.[0]?.permission?.is_shown && (
            <div className="absolute right-3 top-3 w-fit">
              <CustomButton
                onClick={() => setOpen(true)}
                className="!uppercase"
                disabled={
                  !currentAccess?.buttons?.[0]?.permission?.actions?.create
                }
              >
                Share
              </CustomButton>
            </div>
          )}
          <div id="Overview" className="flex w-full flex-col gap-5 p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <img
                src={data?.org_logo_url || "/placeholder-logo.png"}
                alt="Organization Logo"
                className="h-fit w-32 object-contain lg:h-28"
              />
              <div className="flex w-full flex-col gap-3">
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
                  <h1 className="text-xl font-semibold tracking-wider text-gray-800 dark:text-white sm:text-2xl">
                    {data?.org_name || "Not Provided"}
                  </h1>
                  <span className="hidden h-5 w-0.5 rounded-md bg-gray-800 sm:block"></span>
                  <h1 className="text-xl font-semibold tracking-wider text-gray-800 dark:text-white sm:text-2xl">
                    Trust Center
                  </h1>
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-7">
                  <span className="flex items-center gap-2">
                    <MailCheck size={20} className="text-tertiary" />
                    <p className="text-sm font-medium tracking-wider text-gray-900 dark:text-white">
                      {data?.org_email || "Not Provided"}
                    </p>
                  </span>
                  <span className="flex items-center gap-2">
                    <Earth size={20} className="text-tertiary" />
                    {data?.org_website ? (
                      <a
                        href={
                          data.org_website.startsWith("http")
                            ? data.org_website
                            : `https://${data.org_website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium tracking-wider text-gray-900 hover:text-tertiary hover:underline dark:text-white"
                      >
                        {data.org_website}
                      </a>
                    ) : (
                      <p className="text-sm font-medium tracking-wider text-gray-900 dark:text-white">
                        Not Provided
                      </p>
                    )}
                  </span>
                  {data?.org_phone?.length > 0 && (
                    <span className="flex items-center gap-2">
                      <Phone size={20} className="text-tertiary" />
                      <p className="text-sm font-medium tracking-wider text-gray-900 dark:text-white">
                        {data.org_phone}
                      </p>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-sm tracking-wider text-gray-700 dark:text-gray-400 sm:font-medium">
              {/* {(data?.overview || "Not Provided")
                .split("\n\n")<MarkdownRenderer content={data?.overview} />
                .map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))} */}
              <MarkdownRenderer content={data?.overview} />
            </div>
          </div>
          <span className="h-0.5 w-full bg-neutral-100 dark:bg-darkHoverBackground"></span>
          <div className="flex flex-col gap-5 sm:p-6">
            <div className="sticky -top-2 z-50 flex w-full items-center gap-5 overflow-x-auto bg-white p-2 dark:bg-darkSidebarBackground sm:flex-wrap">
              {TABS?.map((item) => {
                const isActive = tab === item?.name;
                return (
                  <div
                    key={item?.name}
                    tabIndex={0}
                    role="button"
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 tracking-wider ${isActive ? "bg-[#151D33] dark:bg-darkMainBackground" : ""}`}
                    onClick={() => {
                      setTab(item?.name);
                      window.location.hash = `#${item?.name}`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setTab(item?.name);
                        window.location.hash = `#${item?.name}`;
                      }
                    }}
                  >
                    {React.cloneElement(item?.icon, {
                      className: isActive ? "text-white" : "text-tertiary"
                    })}
                    <p
                      className={`text-nowrap font-[family-name:var(--font-geist-mono)] text-sm font-medium tracking-wider ${isActive ? "text-white" : "text-gray-900 dark:text-white"}`}
                    >
                      {item?.name}
                    </p>
                  </div>
                );
              })}
            </div>
            <div
              id="Resources"
              className="flex w-full scroll-mt-16 flex-col gap-4 rounded-lg border dark:border-neutral-600"
            >
              <span className="p-4 pb-0">
                {" "}
                <p className="w-fit border-b-2 border-tertiary px-2 font-[family-name:var(--font-geist-mono)] text-base font-medium tracking-wider text-black-2 dark:text-white">
                  Resources
                </p>
              </span>
              <div className="flex w-full flex-col gap-5 p-4 pt-0">
                {data?.policy_documents?.length > 0 ||
                data?.knowledge_documents?.length > 0 ? (
                  <>
                    {data?.policy_documents?.map(
                      (
                        item: {
                          name: string;
                          doc_url: string;
                        },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="flex w-full items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <FaFileCircleCheck className="text-2xl text-tertiary" />
                            <p className="font-medium capitalize text-gray-800 dark:text-white">
                              {item?.name?.replace(/\.[^/.]+$/, "")}
                            </p>
                          </div>
                          <Tooltip title="View Document" arrow placement="top">
                            <div
                              // onClick={() => window.open(item?.doc_url, "_blank")}
                              tabIndex={0}
                              role="button"
                              onClick={() => {
                                setFileData({
                                  url: item?.doc_url,
                                  name: item?.name
                                });
                                setOpenFile(true);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setFileData({
                                    url: item?.doc_url,
                                    name: item?.name
                                  });
                                  setOpenFile(true);
                                }
                              }}
                              className="cursor-pointer"
                            >
                              <LuExternalLink className="text-2xl text-tertiary" />
                            </div>
                          </Tooltip>
                        </div>
                      )
                    )}
                    {data?.knowledge_documents?.map(
                      (
                        item: {
                          file_name: string;
                          name: string;
                          doc_url: string;
                        },
                        index: number
                      ) => (
                        <div
                          key={index}
                          className="flex w-full items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <FaFileLines className="text-2xl text-violet-600" />
                            <p className="font-medium capitalize text-gray-800 dark:text-white">
                              {item?.file_name?.replace(/\.[^/.]+$/, "")}
                            </p>
                          </div>
                          <Tooltip title="View Document" arrow placement="top">
                            <div
                              // onClick={() =>
                              //   window.open(item?.doc_url, "_blank")
                              // }
                              tabIndex={0}
                              role="button"
                              onClick={() => {
                                setFileData({
                                  url: item?.doc_url,
                                  name: item?.name
                                });
                                setOpenFile(true);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setFileData({
                                    url: item?.doc_url,
                                    name: item?.name
                                  });
                                  setOpenFile(true);
                                }
                              }}
                              className="cursor-pointer"
                            >
                              <LuExternalLink className="text-2xl text-tertiary" />
                            </div>
                          </Tooltip>
                        </div>
                      )
                    )}
                  </>
                ) : (
                  <p className="font-medium text-gray-700 dark:text-gray-400">
                    No resources available yet. Check back soon for updates.
                  </p>
                )}
              </div>
            </div>
            <div
              id="AI Assessment"
              className="flex w-full scroll-mt-16 flex-col gap-4 rounded-lg border p-4 dark:border-neutral-600"
            >
              <p className="w-fit border-b-2 border-tertiary px-2 font-[family-name:var(--font-geist-mono)] text-base font-medium tracking-wider text-black-2 dark:text-white">
                AI Assessment
              </p>
              {data?.survey_responses?.length > 0 &&
              data?.survey_responses?.[0]?.sections?.length > 0 ? (
                data?.survey_responses?.[0]?.sections?.map(
                  (
                    item: {
                      section_title: string;
                      questions: {
                        question_id: string;
                        question_text: string;
                        response: string[];
                      }[];
                    },
                    index: number
                  ) => (
                    <div key={index} className="flex w-full flex-col gap-4">
                      {/* Section Title */}
                      <div className="flex w-full items-center justify-between">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item?.section_title}
                        </p>
                      </div>
                      {/* Accordion Container with Light Blue Background */}
                      <div className="rounded-lg border border-neutral-300 bg-tertiary/10 dark:border-neutral-600">
                        {item?.questions?.map(
                          (question: {
                            question_id: string;
                            question_text: string;
                            response: string[];
                          }) => (
                            <AccordionItem
                              key={question?.question_id}
                              id={question?.question_id}
                              question={question?.question_text}
                              answer={
                                question?.response[0] || "No response provided."
                              }
                              isCompleted={question?.response[0] ? true : false}
                              isOpen={openItemId === question?.question_id} // Pass isOpen based on the openItemId
                              toggle={() => toggleItem(question?.question_id)} // Pass toggle function
                            />
                          )
                        )}
                      </div>
                    </div>
                  )
                )
              ) : (
                <p className="font-medium text-gray-700 dark:text-gray-400">
                  No ai product available yet. Check back soon for updates.
                </p>
              )}
            </div>
            <div
              id="AI Applications"
              className="flex w-full scroll-mt-16 flex-col gap-4 rounded-lg border p-4 dark:border-neutral-600"
            >
              <p className="w-fit border-b-2 border-tertiary px-2 font-[family-name:var(--font-geist-mono)] text-base font-medium tracking-wider text-black-2 dark:text-white">
                Applications
              </p>
              <div className="mt-2">
                {Array.isArray(data?.applications) &&
                data?.applications?.length > 0 ? (
                  <ApplicationView applications={data.applications} />
                ) : (
                  <p className="font-medium text-gray-700 dark:text-gray-400">
                    No applications available yet. Check back soon for updates.
                  </p>
                )}
              </div>
            </div>
            <div
              id="Sub Processor"
              className="flex w-full scroll-mt-16 flex-col gap-4 rounded-lg border p-2 dark:border-neutral-600"
            >
              <span className="p-2 pb-0">
                {" "}
                <p className="w-fit border-b-2 border-tertiary px-2 font-[family-name:var(--font-geist-mono)] text-base font-medium tracking-wider text-black-2 dark:text-white">
                  Sub Processor
                </p>
              </span>
              {data?.sub_processor?.length > 0 ? (
                data?.sub_processor?.map(
                  (item: {
                    name: string;
                    img: string;
                    purpose: string;
                    location: string;
                    trust_center_url: string | null;
                  }) => (
                    <div
                      key={item?.name} // Ensure name is unique, otherwise use item.id if available
                      className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow duration-200 ease-in-out hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 sm:flex-row"
                    >
                      {/* Image Section */}
                      <div className="flex flex-shrink-0 items-center justify-center bg-neutral-50 p-2 dark:bg-darkSidebarBackground sm:w-32">
                        <Image
                          alt={item?.name || "Sub-processor logo"} // Provide default alt text
                          src={item?.img || "/placeholder-logo.png"} // Provide a fallback image
                          width={80} // Slightly smaller image size
                          height={80}
                          priority={false} // Only set priority=true for above-the-fold images usually
                          className="object-contain" // Consider more nuanced dark mode handling if needed
                        />
                      </div>

                      {/* Content Section */}
                      <div className="flex flex-grow flex-col justify-center p-4 sm:p-5">
                        <div className="flex flex-col justify-between sm:flex-row sm:items-start">
                          {/* Name and Purpose */}
                          <div className="mb-2 sm:mb-0">
                            <p className="text-xl font-semibold text-neutral-800 dark:text-white">
                              {item?.name}
                            </p>
                            <span className="mt-1 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                              {/* Consider an icon for purpose if applicable */}
                              <span className="block size-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500"></span>
                              <span>{item?.purpose}</span>
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex flex-shrink-0 items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300 sm:ml-4">
                            {/* Optional: Icon */}
                            {/* <MapPinIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" /> */}
                            <div className="flex items-center gap-3">
                              <span>{item?.location}</span>
                              {item?.trust_center_url !== null &&
                                item?.trust_center_url?.length > 0 && (
                                  <Tooltip
                                    title="View Trust Center"
                                    arrow
                                    placement="top"
                                  >
                                    <div
                                      tabIndex={0}
                                      role="button"
                                      onClick={() => {
                                        if (item?.trust_center_url) {
                                          window.open(
                                            item.trust_center_url,
                                            "_blank"
                                          );
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" &&
                                          item?.trust_center_url
                                        ) {
                                          window.open(
                                            item.trust_center_url,
                                            "_blank"
                                          );
                                        }
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <LuExternalLink className="text-2xl text-tertiary" />
                                    </div>
                                  </Tooltip>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )
              ) : (
                <p className="pb-2 pl-2 font-medium text-gray-700 dark:text-gray-400">
                  No sub processor available yet. Check back soon for updates.
                </p>
              )}
            </div>

            <div
              id="FAQs"
              className="flex w-full scroll-mt-16 flex-col gap-4 rounded-lg border p-4 dark:border-neutral-600"
            >
              <p className="w-fit border-b-2 border-tertiary px-2 font-[family-name:var(--font-geist-mono)] text-base font-medium tracking-wider text-black-2 dark:text-white">
                FAQs
              </p>
              <div
                className={
                  data?.faqs?.length > 0
                    ? "rounded-lg border border-neutral-300 dark:border-neutral-600"
                    : ""
                }
              >
                {data?.faqs?.length > 0 ? (
                  data?.faqs?.map(
                    (
                      item: {
                        id: string;
                        question: string;
                        answer: string;
                      },
                      index: number
                    ) => (
                      <AccordionItem
                        key={index + 1}
                        id={item?.id}
                        question={item?.question}
                        answer={item?.answer}
                        isCompleted={true}
                        isOpen={openItemId === item?.id} // Pass isOpen based on the openItemId
                        toggle={() => toggleItem(item?.id)} // Pass toggle function
                      />
                    )
                  )
                ) : (
                  <p className="font-medium text-gray-700 dark:text-gray-400">
                    No faqs available yet. Check back soon for updates.
                  </p>
                )}
              </div>
            </div>
            <div
              id="Updates"
              className="flex w-full scroll-mt-16 flex-col gap-4 rounded-lg border p-4 dark:border-neutral-600"
            >
              <p className="w-fit border-b-2 border-tertiary px-2 font-[family-name:var(--font-geist-mono)] text-base font-medium tracking-wider text-black-2 dark:text-white">
                Updates
              </p>
              <div
                className={
                  data?.updates?.length > 0
                    ? "rounded-lg border border-neutral-300 dark:border-neutral-600"
                    : ""
                }
              >
                {data?.updates?.length > 0 ? (
                  data?.updates?.map(
                    (
                      item: {
                        id: string;
                        updated_date: string;
                        change_description: string;
                        impact: string;
                      },
                      index: number
                    ) => (
                      <UpdateAccordionItem
                        key={index + 1}
                        date={item?.updated_date}
                        question={item?.change_description}
                        answer={item?.impact}
                        isOpen={openItemId === item?.id} // Pass isOpen based on the openItemId
                        toggle={() => toggleItem(item?.id)} // Pass toggle function
                      />
                    )
                  )
                ) : (
                  <p className="font-medium text-gray-700 dark:text-gray-400">
                    No updates available yet. Check back soon for updates.
                  </p>
                )}
              </div>
            </div>
            {data?.controls_by_category?.length > 0 && (
              <div
                id="Controls"
                className="flex w-full scroll-mt-16 flex-col gap-4 rounded-lg border p-4 dark:border-neutral-600"
              >
                <p className="w-fit border-b-2 border-tertiary px-2 font-[family-name:var(--font-geist-mono)] text-base font-medium tracking-wider text-black-2 dark:text-white">
                  Controls
                </p>
                <div className="w-full">
                  <ControlDesktopView
                    data={data?.controls_by_category}
                    tab={controlTab}
                    setTab={setControlTab}
                  />
                  <ControlMobileView
                    data={data?.controls_by_category}
                    expandedCategory={expandedCategory}
                    toggleCategory={toggleCategory}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustCenterReport;
