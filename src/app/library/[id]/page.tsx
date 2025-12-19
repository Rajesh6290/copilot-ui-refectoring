import ProjectsChatPage from "@/features/chat/pages/library/ProjectsChatPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Projects Chat | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <ProjectsChatPage />
    </DefaultLayout>
  );
};

export default page;
