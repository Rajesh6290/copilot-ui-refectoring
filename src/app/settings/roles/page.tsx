import RolesPage from "@/features/settings/pages/roles/RolesPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Roles Management | Settings | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <RolesPage />
    </DefaultLayout>
  );
};

export default page;
