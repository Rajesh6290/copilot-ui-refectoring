import SystemSettingPage from "@/features/system-settings/pages/system-settings/SystemSettingPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "System Settings | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <SystemSettingPage />
    </DefaultLayout>
  );
};

export default page;
