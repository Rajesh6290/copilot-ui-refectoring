"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ProcessSelection = dynamic(
  () => import("../../components/process-selection/ProcessSelection"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ProcessSelectionPage = () => {
  return <ProcessSelection />;
};

export default ProcessSelectionPage;
