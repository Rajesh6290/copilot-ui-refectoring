import DynamicFrameworksPage from "@/features/compliance/pages/framework/DynamicFrameworksPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Framework Details | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <DynamicFrameworksPage />
    </DefaultLayout>
  );
};

export default page;
