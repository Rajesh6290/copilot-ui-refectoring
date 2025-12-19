import ForgotPassswordPage from "@/features/auth/pages/forgot-password/ForgotPassswordPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Forgot Password | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <ForgotPassswordPage />;
};

export default page;
