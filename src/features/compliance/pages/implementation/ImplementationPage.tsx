"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Implementation = dynamic(
  () => import("../../components/implementation/Implementation"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ImplementationPage = () => {
  return <Implementation />;
};

export default ImplementationPage;
