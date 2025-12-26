import PurchaseConfirmationPage from "@/features/purchase/pages/confirmation/PurchaseConfirmationPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Purchase Confirmation  | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <PurchaseConfirmationPage />;
};

export default page;
