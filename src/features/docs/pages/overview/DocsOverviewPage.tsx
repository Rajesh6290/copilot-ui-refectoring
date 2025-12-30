"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";

const DocsOverview = dynamic(
  () => import("../../components/overview/DocsOverview"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);

const DocsOverviewPage = () => {
  return <DocsOverview />;
};

export default DocsOverviewPage;
