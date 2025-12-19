import AIAssessmentPage from "@/features/self-assessment/pages/ai-assessments/AIAssessmentPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "AI Assessments | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <AIAssessmentPage />
    </DefaultLayout>
  );
};

export default page;
