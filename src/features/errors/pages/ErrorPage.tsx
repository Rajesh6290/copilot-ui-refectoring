"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Error = dynamic(() => import("../components/Error"), {
  ssr: false,
  loading: () => <Loader />
});
const ErrorPage = ({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return <Error error={error} reset={reset} />;
};

export default ErrorPage;
