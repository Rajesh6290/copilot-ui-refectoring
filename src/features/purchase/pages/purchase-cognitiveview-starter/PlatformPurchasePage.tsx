"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const PlatformPurchase = dynamic(
  () =>
    import("../../components/purchase-cognitiveview-starter/PlatformPurchase"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const PlatfromPurchasePage = () => {
  return <PlatformPurchase />;
};

export default PlatfromPurchasePage;
