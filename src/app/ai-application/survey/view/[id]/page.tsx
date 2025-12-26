import SurveyViewPage from "@/features/ai-application/pages/survey/SurveyViewPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Survey View | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <SurveyViewPage />;
};

export default page;
