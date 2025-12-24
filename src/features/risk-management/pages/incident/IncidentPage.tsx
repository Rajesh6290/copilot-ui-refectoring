"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Incident = dynamic(() => import("../../components/incident/Incident"), {
  ssr: false,
  loading: () => <Loader />
});
const IncidentPage = () => {
  return <Incident />;
};

export default IncidentPage;
