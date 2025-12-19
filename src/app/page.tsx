import HomeChatPage from "@/features/chat/pages/home/HomeChatPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Welcome to Chat+ | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <HomeChatPage />
    </DefaultLayout>
  );
};

export default page;
