"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ModelDiscovery = dynamic(
  () => import("../../components/model-discovery/ModelDiscovery"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ModelDiscoveryPage = () => {
  return <ModelDiscovery />;
};

export default ModelDiscoveryPage;
