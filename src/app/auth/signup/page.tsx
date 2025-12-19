import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Cognitiveview | AI Governance Platform"
};

const page = () => {
  return (
    <div className="flex h-dvh w-full items-center justify-center">
      <SignUp />
    </div>
  );
};

export default page;
