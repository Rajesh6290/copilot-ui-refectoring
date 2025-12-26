"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Selection = dynamic(
  () => import("../../components/selection/Selection"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const SelectionPage = () => {
  return <Selection />;
};

export default SelectionPage;
