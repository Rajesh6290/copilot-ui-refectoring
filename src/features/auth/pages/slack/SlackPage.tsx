import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const Slack = dynamic(() => import("../../components/slack/Slack"), {
  ssr: false,
  loading: () => <Loader />
});
const SlackPage = () => {
  return <Slack />;
};

export default SlackPage;
