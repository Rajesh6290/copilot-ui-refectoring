import DocsOverviewPage from "@/features/docs/pages/overview/DocsOverviewPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";

export const metadata: Metadata = MetaData(
  "Documentation | Cognitiveview AI Governance Platform"
);

const page = () => {
  return <DocsOverviewPage />;
};

export default page;
