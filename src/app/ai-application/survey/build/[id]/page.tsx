import SurveyBuildPage from "@/features/ai-application/pages/survey/SurveyBuildPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Survey Builder | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <SurveyBuildPage />
    </DefaultLayout>
  );
};

export default page;
