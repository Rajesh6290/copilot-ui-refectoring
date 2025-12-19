import TrustCenterChecklistPage from "@/features/self-assessment/pages/trust-center-checklist/TrustCenterChecklistPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Trust Center Checklist | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <TrustCenterChecklistPage />
    </DefaultLayout>
  );
};

export default page;
