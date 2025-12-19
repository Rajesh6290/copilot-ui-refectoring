"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const TrustCenterChecklist = dynamic(
  () => import("../../components/trust-center-checklist/TrustCenterChecklist"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const TrustCenterChecklistPage = () => {
  return <TrustCenterChecklist />;
};

export default TrustCenterChecklistPage;
