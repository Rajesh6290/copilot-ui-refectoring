"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const FeatureDetail = dynamic(
  () => import("../../components/feature-detail/FeatureDetail"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);

const FeatureDetailPage = () => {
  const params = useParams();
  const featureId = params["featureId"] as string;

  return <FeatureDetail featureId={featureId} />;
};

export default FeatureDetailPage;
