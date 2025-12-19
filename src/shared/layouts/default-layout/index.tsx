"use client";
import CustomNavigation from "@/shared/common/CustomNavigation";
import HelpArea from "@/shared/common/HelpArea";
import usePermission from "@/shared/hooks/usePermission";
import { useMyContext } from "@/shared/providers/AppProvider";
import { useAuth } from "@clerk/nextjs";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Swal from "sweetalert2";
import UnifiedHelpButton from "./UnifiedHelpButton";

import dynamic from "next/dynamic";
import UseProtectedRoutes from "@/shared/hooks/useProtectedRoute";
const Navbar = dynamic(() => import("./Navbar"), {
  ssr: false
});
const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false
});
const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, userId } = useAuth();
  const { user, isUserLoading } = usePermission();
  const router = useRouter();
  const {
    fullScreen,
    setFullScreen,
    helpOpen,
    setHelpOpen,
    helpOpenMax,
    setHelpOpenMax,
    metaTitle
  } = useMyContext();
  const name = usePathname();
  const params = useParams();
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    if (!isUserLoading && user?.user_id) {
      if (user?.subscription_status?.is_subscription_ended) {
        signOut();
        Swal.fire("Info", user?.subscription_status?.status_message, "warning");
      }
    }
  }, [isUserLoading, user, signOut]);

  useEffect(() => {
    if (!isUserLoading && user?.user_id) {
      if (user?.resources?.landing_page?.trust_center_generate) {
        router.push("/self-assessment/generate-trust-center");
      }
    }
  }, [isUserLoading, user]);

  useEffect(() => {
    if (!isUserLoading && user?.user_id) {
      if (user?.resources?.landing_page?.trust_center_view) {
        router.push("/self-assessment/trust-center");
      }
    }
  }, [isUserLoading, user]);

  useEffect(() => {
    if (!isUserLoading && user?.user_id) {
      if (user?.resources?.landing_page?.rai_view) {
        router.push("/self-assessment/responsible-ai");
      }
    }
  }, [isUserLoading, user]);
  useEffect(() => {
    document.title =
      metaTitle ||
      "Cognitiveview | AI-Driven Compliance & Conduct Risk Automation";

    function setMeta(
      attrType: "name" | "property",
      attr: string,
      content: string
    ) {
      let element = document.head.querySelector(`meta[${attrType}="${attr}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrType, attr);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    }

    // Set meta tags
    setMeta(
      "name",
      "description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "property",
      "og:title",
      metaTitle ||
        "Cognitive View: AI-Driven Compliance & Conduct Risk Automation"
    );
    setMeta(
      "property",
      "og:description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "property",
      "og:image",
      "https://app.cognitiveview.com/images/sideBarLogo.png"
    );
    setMeta("property", "og:url", "https://app.cognitiveview.com");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta(
      "name",
      "twitter:title",
      "Cognitive View: AI-Driven Compliance & Conduct Risk Automation"
    );
    setMeta(
      "name",
      "twitter:description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "name",
      "twitter:image",
      "https://app.cognitiveview.com/images/sideBarLogo.png"
    );
  }, [metaTitle]);

  return (
    <>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex size-full">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          fullWidth={fullScreen}
        />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div
          className={`relative flex flex-1 flex-col transition-all duration-300 ease-in-out ${
            fullScreen ? "w-full" : "w-[70%]"
          } `}
        >
          {/* <!-- ===== Header Start ===== --> */}
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            fullWidth={fullScreen}
            setFullWidth={() => setFullScreen((prev) => !prev)}
          />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main className="flex w-full overflow-hidden">
            {/* Unified Help Button */}
            {![
              "/",
              "/auth/verify",
              `/c/${params["id"]}`,
              "/auth/forgot-password",
              "/auth/signin",
              "/report-verify",
              "/self-assessment/generate-trust-center"
            ]?.includes(name) && (
              <UnifiedHelpButton
                setHelpOpen={setHelpOpen as Dispatch<SetStateAction<boolean>>}
                setHelpOpenMax={
                  setHelpOpenMax as Dispatch<SetStateAction<boolean>>
                }
                helpOpen={helpOpen as boolean}
                setSessionId={setSessionId as Dispatch<SetStateAction<string>>}
                userId={userId as string}
              />
            )}

            {/* Main Content */}
            <div
              className={`mx-auto h-[calc(100dvh-61px)] overflow-y-auto p-2 transition-all duration-500 ease-in-out ${
                helpOpen && !helpOpenMax
                  ? "w-4/5"
                  : helpOpen && helpOpenMax
                    ? "w-2/3"
                    : "w-full"
              } `}
            >
              {![
                "/",
                "/self-assessment/responsible-ai",
                `/c/${params["id"]}`
              ]?.includes(name) && <CustomNavigation />}
              {children}
            </div>

            {/* Help Panel (Right Side) */}
            {helpOpen && (
              <div
                className={`relative z-999999 h-[calc(100dvh-61px)] overflow-hidden p-2 transition-all duration-500 ease-in-out ${
                  helpOpen && !helpOpenMax
                    ? "w-1/5 translate-x-0 opacity-100"
                    : helpOpen && helpOpenMax
                      ? "w-1/3 translate-x-0 opacity-100"
                      : "w-0 -translate-x-full opacity-0"
                } `}
              >
                <HelpArea
                  setHelpOpenMax={
                    setHelpOpenMax as Dispatch<SetStateAction<boolean>>
                  }
                  helpOpenMax={helpOpenMax as boolean}
                  setHelpOpen={setHelpOpen as Dispatch<SetStateAction<boolean>>}
                  sessionId={sessionId}
                />
              </div>
            )}
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
};

export default UseProtectedRoutes(DefaultLayout);
// export default DefaultLayout;
