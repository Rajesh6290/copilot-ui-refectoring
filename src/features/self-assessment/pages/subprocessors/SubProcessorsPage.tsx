"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const SubProcessors = dynamic(
  () => import("../../components/subprocessors/SubProcessors"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const SubProcessorsPage = () => {
  return <SubProcessors />;
};

export default SubProcessorsPage;
