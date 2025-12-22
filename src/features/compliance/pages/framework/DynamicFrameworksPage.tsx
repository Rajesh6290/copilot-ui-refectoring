"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const DynamicFrameworks = dynamic(
  () => import("../../components/framework/DynamicFrameworks"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const DynamicFrameworksPage = () => {
  return <DynamicFrameworks />;
};

export default DynamicFrameworksPage;
