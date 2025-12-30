"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const GlobalError = dynamic(() => import("../components/GlobalError"), {
  ssr: false,
  loading: () => <Loader />
});
const GlobalErrorPage = ({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return <GlobalError error={error} reset={reset} />;
};

export default GlobalErrorPage;
