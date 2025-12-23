import KnowledgePage from "@/features/compliance/pages/knowledge/KnowledgePage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Knowledge | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <KnowledgePage />
    </DefaultLayout>
  );
};

export default page;
