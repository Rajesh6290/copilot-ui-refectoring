"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ControlDetails = dynamic(
  () => import("../../components/controls/ControlDetails"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ControlDetailsPage = () => {
  return <ControlDetails />;
};

export default ControlDetailsPage;
