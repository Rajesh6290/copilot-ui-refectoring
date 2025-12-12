"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const SignIn = dynamic(() => import("../../components/signin/SignIn"), {
  ssr: false,
  loading: () => <Loader />
});
const SignInPage = () => {
  return <SignIn />;
};

export default SignInPage;
