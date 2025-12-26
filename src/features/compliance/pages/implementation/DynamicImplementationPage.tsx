"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const DynamicImplementation = dynamic(
  () => import("../../components/implementation/DyanmaicImplimentation"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const DynamicImplementationPage = () => {
  return <DynamicImplementation />;
};

export default DynamicImplementationPage;
