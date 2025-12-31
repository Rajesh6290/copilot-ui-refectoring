import ApplicationPage from "@/features/assets/pages/application/ApplicationPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "AI Application | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <ApplicationPage />
    </DefaultLayout>
  );
};

export default page;
