import ControlDetailsPage from "@/features/compliance/pages/controls/ControlDetailsPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Control Details | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <ControlDetailsPage />
    </DefaultLayout>
  );
};

export default page;
