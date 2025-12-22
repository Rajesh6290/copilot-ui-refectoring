import AutomateTestDetailsPage from "@/features/compliance/pages/automate-test/AutomateTestDetailsPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Automate Test Details | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <AutomateTestDetailsPage />
    </DefaultLayout>
  );
};

export default page;
