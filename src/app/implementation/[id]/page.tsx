import DynamicImplementationPage from "@/features/compliance/pages/implementation/DynamicImplementationPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Run Details | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <DynamicImplementationPage />
    </DefaultLayout>
  );
};

export default page;
