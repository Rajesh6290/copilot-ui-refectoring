"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Control = dynamic(() => import("../../components/controls/Controls"), {
  ssr: false,
  loading: () => <Loader />
});
const ControlPage = () => {
  return <Control />;
};

export default ControlPage;
