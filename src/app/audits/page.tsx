import AuditPage from "@/features/compliance/pages/audits/AuditPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Audits | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <AuditPage />
    </DefaultLayout>
  );
};

export default page;
