"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Survey = dynamic(() => import("../../components/survey/Survey"), {
  ssr: false,
  loading: () => <Loader />
});
const SurveyPage = () => {
  return <Survey />;
};

export default SurveyPage;
