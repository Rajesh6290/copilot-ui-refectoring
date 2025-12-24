"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const UserManagement = dynamic(
  () => import("../../components/user-manage/UserManagement"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const UserManagementPage = () => {
  return <UserManagement />;
};

export default UserManagementPage;
