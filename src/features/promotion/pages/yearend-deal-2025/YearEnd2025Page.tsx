"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const YearEnd2025 = dynamic(
  () => import("../../components/yearend-deal-2025/YearEnd2025"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const YearEnd2025Page = () => {
  return <YearEnd2025 />;
};

export default YearEnd2025Page;
