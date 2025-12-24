import UserManagementPage from "@/features/settings/pages/user-manage/UserManagementPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "User Management | Settings | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <UserManagementPage />
    </DefaultLayout>
  );
};

export default page;
