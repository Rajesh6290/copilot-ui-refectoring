"use client";
import ErrorPage from "@/features/errors/pages/ErrorPage";
import MetaData from "@/shared/core/MetaData";
import { Metadata } from "next";
export const metadata: Metadata = MetaData(
  "500 | Internal Server Error | Cognitiveview AI Governance Platform"
);
const page = ({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return <ErrorPage error={error} reset={reset} />;
};

export default page;
