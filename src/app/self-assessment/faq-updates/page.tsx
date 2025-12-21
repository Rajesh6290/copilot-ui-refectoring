import ManageFaqUpdatePage from "@/features/self-assessment/pages/faq-updates/ManageFaqUpdatePage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "FAQ Updates | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <ManageFaqUpdatePage />
    </DefaultLayout>
  );
};

export default page;
