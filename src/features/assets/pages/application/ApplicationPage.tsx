"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Application = dynamic(
  () => import("../../components/application/Application"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ApplicationPage = () => {
  return <Application />;
};

export default ApplicationPage;
