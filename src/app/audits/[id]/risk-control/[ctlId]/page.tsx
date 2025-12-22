import AuditRiskControlPage from "@/features/compliance/pages/audits/AuditRiskControlPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Audits Risk Control | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <AuditRiskControlPage />
    </DefaultLayout>
  );
};

export default page;
