import NotFoundPage from "@/features/errors/pages/NotFoundPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "404 | Page Not Found | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <NotFoundPage />;
};

export default page;
