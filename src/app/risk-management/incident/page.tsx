import IncidentPage from "@/features/risk-management/pages/incident/IncidentPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Incident | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <IncidentPage />
    </DefaultLayout>
  );
};

export default page;
