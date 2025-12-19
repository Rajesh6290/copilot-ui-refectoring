import ResetPasswordPage from "@/features/auth/pages/reset-password/ResetPasswordPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Reset Password | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <ResetPasswordPage />;
};

export default page;
