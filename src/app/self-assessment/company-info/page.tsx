import CompanyInfoPage from "@/features/self-assessment/pages/company-info/CompanyInfoPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Company Info | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <CompanyInfoPage />
    </DefaultLayout>
  );
};

export default page;
