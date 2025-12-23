"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const RiskManagement = dynamic(
  () => import("../../components/risk-management/RiskManagement"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const RiskManagementPage = () => {
  return <RiskManagement />;
};

export default RiskManagementPage;
