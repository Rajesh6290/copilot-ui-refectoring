"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const AuditRiskControl = dynamic(
  () => import("../../components/audits/AuditRiskControl"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const AuditRiskControlPage = () => {
  return <AuditRiskControl />;
};

export default AuditRiskControlPage;
