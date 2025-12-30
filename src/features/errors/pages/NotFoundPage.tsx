"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const NotFound = dynamic(() => import("../components/NotFound"), {
  ssr: false,
  loading: () => <Loader />
});
const NotFoundPage = () => {
  return <NotFound />;
};

export default NotFoundPage;
