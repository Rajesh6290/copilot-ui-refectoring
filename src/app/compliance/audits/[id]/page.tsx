import AuditDetailsPage from "@/features/compliance/pages/audits/AuditDetailsPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Audits Details | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <AuditDetailsPage />
    </DefaultLayout>
  );
};

export default page;
