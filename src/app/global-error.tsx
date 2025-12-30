"use client";
import GlobalErrorPage from "@/features/errors/pages/GlobalErrorPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "Internal Server Error | Cognitiveview AI Governance Platform"
);
const page = ({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return <GlobalErrorPage error={error} reset={reset} />;
};

export default page;
