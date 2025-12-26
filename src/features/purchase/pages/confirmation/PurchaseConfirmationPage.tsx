"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ConfirmationPage = dynamic(
  () => import("../../components/confirmation/Confirmation"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const PurchaseConfirmationPage = () => {
  return <ConfirmationPage />;
};

export default PurchaseConfirmationPage;
