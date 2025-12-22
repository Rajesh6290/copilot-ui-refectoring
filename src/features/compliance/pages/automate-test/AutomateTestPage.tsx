"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const AutomateTest = dynamic(
  () => import("../../components/automate-test/AutomateTest"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const AutomateTestPage = () => {
  return <AutomateTest />;
};

export default AutomateTestPage;
