import ImplementationPage from "@/features/compliance/pages/implementation/ImplementationPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Implementation | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <ImplementationPage />
    </DefaultLayout>
  );
};

export default page;
