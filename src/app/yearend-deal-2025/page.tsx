import YearEnd2025Page from "@/features/promotion/pages/yearend-deal-2025/YearEnd2025Page";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Year End Deal 2025 | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <YearEnd2025Page />;
};

export default page;
