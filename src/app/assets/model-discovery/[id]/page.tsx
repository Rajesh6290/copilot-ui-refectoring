import ModelDetailsPage from "@/features/assets/pages/model-discovery/ModelDetailsPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Model Details | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <ModelDetailsPage />
    </DefaultLayout>
  );
};

export default page;
