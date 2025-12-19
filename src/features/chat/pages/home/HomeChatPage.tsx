"use client";
import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Homechat = dynamic(() => import("../../components/home/HomeChat"), {
  ssr: false,
  loading: () => <Loader />
});
const HomeChatPage = () => {
  return <Homechat />;
};

export default HomeChatPage;
