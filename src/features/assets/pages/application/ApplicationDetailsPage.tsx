"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ApplicationDetails = dynamic(
  () => import("../../components/application/ApplicationDetails"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ApplicationDetailsPage = () => {
  return <ApplicationDetails />;
};

export default ApplicationDetailsPage;
