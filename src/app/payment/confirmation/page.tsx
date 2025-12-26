import PaymentConfirmationPage from "@/features/payment/pages/payment-confirmation/PaymentConfirmationPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Payment Confirmation | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <PaymentConfirmationPage />;
};

export default page;
