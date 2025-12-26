"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const VerifyReport = dynamic(() => import("../components/VerifyReport"), {
  ssr: false,
  loading: () => <Loader />
});
const VerifyReportPage = () => {
  return <VerifyReport />;
};

export default VerifyReportPage;
