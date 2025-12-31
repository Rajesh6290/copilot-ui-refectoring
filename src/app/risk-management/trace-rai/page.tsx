import TraceRAIPage from "@/features/risk-management/pages/trace-rai/TraceRAIPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Trace Responsible AI Report | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <TraceRAIPage />
    </DefaultLayout>
  );
};

export default page;
