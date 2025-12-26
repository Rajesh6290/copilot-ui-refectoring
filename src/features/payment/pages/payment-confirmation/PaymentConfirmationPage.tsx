"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const PaymentConfirmation = dynamic(
  () => import("../../components/payment-confirmation/PaymentConfirmation"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const PaymentConfirmationPage = () => {
  return <PaymentConfirmation />;
};

export default PaymentConfirmationPage;
