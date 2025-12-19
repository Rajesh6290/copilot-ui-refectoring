"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ForgotPassword = dynamic(
  () => import("../../components/forgot-password/ForgotPassword"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ForgotPassswordPage = () => {
  return <ForgotPassword />;
};

export default ForgotPassswordPage;
