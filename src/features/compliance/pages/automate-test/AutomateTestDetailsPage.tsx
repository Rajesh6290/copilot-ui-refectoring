"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const AutomateTestDetails = dynamic(
  () => import("../../components/automate-test/AutomateTestDetails"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const AutomateTestDetailsPage = () => {
  return <AutomateTestDetails />;
};

export default AutomateTestDetailsPage;
