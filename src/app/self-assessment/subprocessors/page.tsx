import SubProcessorsPage from "@/features/self-assessment/pages/subprocessors/SubProcessorsPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Sub Processors | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <SubProcessorsPage />
    </DefaultLayout>
  );
};

export default page;
