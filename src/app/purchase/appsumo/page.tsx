import AppSumoPage from "@/features/purchase/pages/appsumo/AppSumoPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "AppSumo  | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <AppSumoPage />;
};

export default page;
