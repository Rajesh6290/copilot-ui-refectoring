import DynamicChatPage from "@/features/chat/pages/dynamic-chat/DynamicChatPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Chat | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <DynamicChatPage />
    </DefaultLayout>
  );
};

export default page;
