"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const AIAssessment = dynamic(
  () => import("../../components/ai-assessments/AIAssessment"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const AIAssessmentPage = () => {
  return <AIAssessment />;
};

export default AIAssessmentPage;
