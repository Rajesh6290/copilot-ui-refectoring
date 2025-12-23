"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ResponsibleAIReport = dynamic(
  () => import("../../components/responsible-ai-report/ResposibleAiReport"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ResponsibleAIReportPage = () => {
  return <ResponsibleAIReport />;
};

export default ResponsibleAIReportPage;
