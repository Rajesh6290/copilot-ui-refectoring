import PlatfromPurchasePage from "@/features/purchase/pages/purchase-cognitiveview-starter/PlatformPurchasePage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Platform Purchase  | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <PlatfromPurchasePage />;
};

export default page;
