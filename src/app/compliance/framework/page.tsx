import FrameworkPage from "@/features/compliance/pages/framework/FrameworkPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Frameworks | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <FrameworkPage />
    </DefaultLayout>
  );
};

export default page;
