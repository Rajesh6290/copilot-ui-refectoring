import ApplicationDetailsPage from "@/features/ai-application/pages/application/ApplicationDetailsPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Application Details | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <ApplicationDetailsPage />
    </DefaultLayout>
  );
};

export default page;
