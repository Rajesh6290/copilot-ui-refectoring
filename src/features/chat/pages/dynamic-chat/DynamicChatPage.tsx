"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const DynamicChat = dynamic(() => import("../../components/chat/DynamicChat"), {
  ssr: false,
  loading: () => <Loader />
});
const DynamicChatPage = () => {
  return <DynamicChat />;
};

export default DynamicChatPage;
