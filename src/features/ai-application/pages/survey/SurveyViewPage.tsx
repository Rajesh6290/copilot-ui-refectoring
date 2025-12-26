"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const SurveyView = dynamic(() => import("../../components/survey/SurveyView"), {
  ssr: false,
  loading: () => <Loader />
});
const SurveyViewPage = () => {
  return <SurveyView />;
};

export default SurveyViewPage;
