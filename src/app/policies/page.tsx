import PolicyPage from "@/features/compliance/pages/policies/PolicyPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "AI Policies Management | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <PolicyPage />
    </DefaultLayout>
  );
};

export default page;
