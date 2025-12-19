import LibraryPage from "@/features/chat/pages/library/LibraryPage";
import MetaData from "@/shared/core/MetaData";
import DefaultLayout from "@/shared/layouts/default-layout";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Library | Cognitiveview AI Governance Platform"
);
const page = () => {
  return (
    <DefaultLayout>
      <LibraryPage />
    </DefaultLayout>
  );
};

export default page;
