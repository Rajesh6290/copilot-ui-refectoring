import VerifyReportPage from "@/features/report-verify/pages/VerifyReportPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Report Verify | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <VerifyReportPage />;
};

export default page;
