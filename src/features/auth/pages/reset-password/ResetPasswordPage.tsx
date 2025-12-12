import Loader from "@/shared/common/Loader";
import dynamic from "next/dynamic";
const ResetPassword = dynamic(
  () => import("../../components/reset-password/ResetPassword"),
  {
    ssr: false,
    loading: () => <Loader />
  }
);
const ResetPasswordPage = () => {
  return <ResetPassword />;
};

export default ResetPasswordPage;
