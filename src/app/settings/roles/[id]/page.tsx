import RoleDetailsPage from "@/features/settings/pages/roles/RoleDetailsPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Role Details | Settings | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <RoleDetailsPage />
    </DefaultLayout>
  );
};

export default page;
