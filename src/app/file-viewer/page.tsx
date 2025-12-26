"use client";
import Loader from "@/shared/common/Loader";
import DefaultLayout from "@/shared/layouts/default-layout";
import dynamic from "next/dynamic";
const FileViewer = dynamic(() => import("@/shared/core/FileViewer"), {
  ssr: false,
  loading: () => <Loader />
});
const page = () => {
  return (
    <DefaultLayout>
      <FileViewer />
    </DefaultLayout>
  );
};

export default page;
