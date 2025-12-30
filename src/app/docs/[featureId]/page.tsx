import FeatureDetailPage from "@/features/docs/pages/feature-detail/FeatureDetailPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";

export const metadata: Metadata = MetaData(
  "Feature Documentation | Cognitiveview AI Governance Platform"
);

const page = () => {
  return <FeatureDetailPage />;
};

export default page;
