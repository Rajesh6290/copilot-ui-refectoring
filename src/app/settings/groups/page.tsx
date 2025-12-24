import GroupsPage from "@/features/settings/pages/groups/GroupsPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Groups Management | Settings | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <GroupsPage />
    </DefaultLayout>
  );
};

export default page;
