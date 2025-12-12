import SignInPage from "@/features/auth/pages/signin/SignInPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Sign In | Cognitiveview AI Governance Platform"
);
const page = () => {
  return <SignInPage />;
};

export default page;
