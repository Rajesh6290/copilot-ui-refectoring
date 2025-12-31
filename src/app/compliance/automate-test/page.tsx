import AutomateTestPage from "@/features/compliance/pages/automate-test/AutomateTestPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Automate Test | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <AutomateTestPage />
    </DefaultLayout>
  );
};

export default page;
