import ProcessSelectionPage from "@/features/auth/pages/process-selection/ProcessSelectionPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Tenant Selection Process Management | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <ProcessSelectionPage />;
};

export default page;
