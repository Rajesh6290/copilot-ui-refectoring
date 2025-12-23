"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const TraceRAI = dynamic(() => import("../../components/trace-rai/TraceAI"), {
  ssr: false,
  loading: () => <Loader />
});
const TraceRAIPage = () => {
  return <TraceRAI />;
};

export default TraceRAIPage;
