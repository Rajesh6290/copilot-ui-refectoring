"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ManagePolicy = dynamic(
  () => import("../../components/policies/ManagePolicy"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const PolicyPage = () => {
  return <ManagePolicy />;
};

export default PolicyPage;
