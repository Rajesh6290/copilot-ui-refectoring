"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ProjectChats = dynamic(
  () => import("../../components/project/ProjectChats"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ProjectsChatPage = () => {
  return <ProjectChats />;
};

export default ProjectsChatPage;
