import SlackPage from "@/features/auth/pages/slack/SlackPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Slack Authentication | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <SlackPage />;
};

export default page;
