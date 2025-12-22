"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const AuditDetails = dynamic(
  () => import("../../components/audits/AuditDetails"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const AuditDetailsPage = () => {
  return <AuditDetails />;
};

export default AuditDetailsPage;
