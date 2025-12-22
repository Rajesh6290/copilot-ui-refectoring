import ControlPage from "@/features/compliance/pages/controls/ControlPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Controls | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <ControlPage />
    </DefaultLayout>
  );
};

export default page;
