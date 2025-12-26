import ModelDiscoveryPage from "@/features/ai-application/pages/model-discovery/ModelDiscoveryPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Auto Discovery | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <ModelDiscoveryPage />
    </DefaultLayout>
  );
};

export default page;
