import ResponsibleAIReportPage from "@/features/risk-management/pages/responsible-ai-report/ResponsibleAIReportPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Responsible AI Report | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <ResponsibleAIReportPage />
    </DefaultLayout>
  );
};

export default page;
