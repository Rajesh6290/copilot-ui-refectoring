"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Knowledge = dynamic(
  () => import("../../components/knowledge/Knowledge"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const KnowledgePage = () => {
  return <Knowledge />;
};

export default KnowledgePage;
