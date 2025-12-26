"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const FreeTrial = dynamic(
  () => import("../../components/free-trial/FreeTrial"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const FreeTrialPage = () => {
  return <FreeTrial />;
};

export default FreeTrialPage;
