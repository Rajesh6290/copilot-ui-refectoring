"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const AuditManagement = dynamic(
  () => import("../../components/audits/AuditManagement"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const AuditPage = () => {
  return <AuditManagement />;
};

export default AuditPage;
