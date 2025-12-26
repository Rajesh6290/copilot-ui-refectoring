"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const Footer = dynamic(() => import("./Footer"), {
  ssr: false
});
const CTASection = dynamic(() => import("./CTASection"), {
  ssr: false
});
const PackagesSection = dynamic(() => import("./PackagesSection"), {
  ssr: false
});
const UseCasesSection = dynamic(() => import("./UseCasesSection"), {
  ssr: false
});
const TrustCenterSection = dynamic(() => import("./TrustCenterSection"), {
  ssr: false
});
const ProblemSection = dynamic(() => import("./ProblemSection"), {
  ssr: false
});
const PlatformCapabilities = dynamic(() => import("./PlatformCapabilities"), {
  ssr: false
});
const WhatIsSection = dynamic(() => import("./WhatIsSection"), {
  ssr: false
});
const Hero = dynamic(() => import("./HeroSection"), {
  ssr: false
});
const Navbar = dynamic(() => import("./Navbar"), {
  ssr: false
});
export const FadeIn = ({
  children,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const ScrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const check = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", check);
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-500"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-cyan-400"
      style={{ scaleX }}
    />
  );
};

// --- App Entry ---

const YearEnd2025 = () => {
  useEffect(() => {
    document.title = "Campaign 2025 | AI Governance | CognitiveView";

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
      "Campaign 2025 | AI Governance | CognitiveView"
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
    setMeta("property", "og:url", "https://cognitiveview.com");

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
  }, []);
  return (
    <div className="font-sans bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      <ScrollProgress />
      <Navbar scrollToSection={ScrollToSection} />
      <Hero />
      <WhatIsSection />
      <PlatformCapabilities />
      <ProblemSection />
      <TrustCenterSection />
      <UseCasesSection />
      <PackagesSection />
      <CTASection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default YearEnd2025;
