"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ModelDetails = dynamic(
  () => import("../../components/model-discovery/ModelDetails"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ModelDetailsPage = () => {
  return <ModelDetails />;
};

export default ModelDetailsPage;
