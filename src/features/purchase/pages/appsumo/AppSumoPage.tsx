"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const AppSumo = dynamic(() => import("../../components/appsumo/AppSumo"), {
  ssr: false,
  loading: () => <Loader />
});
const AppSumoPage = () => {
  return <AppSumo />;
};

export default AppSumoPage;
