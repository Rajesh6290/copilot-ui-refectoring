"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ManageFaqUpdates = dynamic(
  () => import("../../components/faq-updates/ManageFaqUpdates"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ManageFaqUpdatePage = () => {
  return <ManageFaqUpdates />;
};

export default ManageFaqUpdatePage;
