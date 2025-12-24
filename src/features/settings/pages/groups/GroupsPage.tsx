"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Groups = dynamic(() => import("../../components/groups/Groups"), {
  ssr: false,
  loading: () => <Loader />
});
const GroupsPage = () => {
  return <Groups />;
};

export default GroupsPage;
