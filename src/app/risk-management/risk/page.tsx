import RiskManagementPage from "@/features/risk-management/pages/risk-management/RiskManagementPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Risk Management | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <RiskManagementPage />
    </DefaultLayout>
  );
};

export default page;
