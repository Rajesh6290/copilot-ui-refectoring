import SelectionPage from "@/features/purchase/pages/selection/SelectionPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Purchase Confirmation  | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <SelectionPage />;
};

export default page;
