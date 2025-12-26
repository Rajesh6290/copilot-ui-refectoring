"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const TermsAndConditions = dynamic(
  () => import("@/shared/core/TermsAndConditions"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);

const page = () => {
  return <TermsAndConditions />;
};

export default page;
