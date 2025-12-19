"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const CompanyInfo = dynamic(
  () => import("../../components/company-info/CompanyInfo"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const CompanyInfoPage = () => {
  return <CompanyInfo />;
};

export default CompanyInfoPage;
