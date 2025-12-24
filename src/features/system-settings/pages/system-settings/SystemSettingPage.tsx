"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const SystemSettings = dynamic(
  () => import("../../components/system-setting/SystemSettings"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const SystemSettingPage = () => {
  return <SystemSettings />;
};

export default SystemSettingPage;
