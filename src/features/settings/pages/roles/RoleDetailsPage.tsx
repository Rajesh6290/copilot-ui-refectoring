"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const RoleDetails = dynamic(
  () => import("../../components/roles/RoleDetails"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const RoleDetailsPage = () => {
  return <RoleDetails />;
};

export default RoleDetailsPage;
