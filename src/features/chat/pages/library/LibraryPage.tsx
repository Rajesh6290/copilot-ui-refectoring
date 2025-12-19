"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Library = dynamic(() => import("../../components/library/Library"), {
  ssr: false,
  loading: () => <Loader />
});
const LibraryPage = () => {
  return <Library />;
};

export default LibraryPage;
