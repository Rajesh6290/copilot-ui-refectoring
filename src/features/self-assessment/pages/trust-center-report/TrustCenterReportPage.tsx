"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const TrustCenterReport = dynamic(
  () => import("../../components/trust-center-report/TrustCenterReport"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const TrustCenterReportPage = () => {
  return <TrustCenterReport />;
};

export default TrustCenterReportPage;
