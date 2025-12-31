import SurveyPage from "@/features/assets/pages/survey/SurveyPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Survey | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <SurveyPage />
    </DefaultLayout>
  );
};

export default page;
