"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Framework = dynamic(
  () => import("../../components/framework/Framework"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const FrameworkPage = () => {
  return <Framework />;
};

export default FrameworkPage;
