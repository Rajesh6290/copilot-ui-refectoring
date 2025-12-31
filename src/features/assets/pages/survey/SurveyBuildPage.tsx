"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const SurveyBuild = dynamic(
  () => import("../../components/survey-build/SurveyBuild"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const SurveyBuildPage = () => {
  return <SurveyBuild />;
};

export default SurveyBuildPage;
