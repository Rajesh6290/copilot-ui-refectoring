import FreeTrialPage from "@/features/purchase/pages/free-trial/FreeTrialPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Free Trial  | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <FreeTrialPage />;
};

export default page;
