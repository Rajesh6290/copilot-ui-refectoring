"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Roles = dynamic(() => import("../../components/roles/Roles"), {
  ssr: false,
  loading: () => <Loader />
});
const RolesPage = () => {
  return <Roles />;
};

export default RolesPage;
