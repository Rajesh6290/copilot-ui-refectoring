import TrustCenterReportPage from "@/features/self-assessment/pages/trust-center-report/TrustCenterReportPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Trust Center Report | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <TrustCenterReportPage />
    </DefaultLayout>
  );
};

export default page;
