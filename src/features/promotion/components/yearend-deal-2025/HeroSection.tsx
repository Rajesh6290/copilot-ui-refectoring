import { motion } from "framer-motion";
import { ArrowRight, Check, Eye } from "lucide-react";
import { useState } from "react";
import TrustCenterModal from "./TrustCenterModal";
import BackgroundSlider from "./BackgroundSlider";
import { FadeIn } from "./YearEnd2025";

const Hero = () => {
  const [open, setOpen] = useState(false);
  const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2065&auto=format&fit=crop"
  ];

  return (
    <header className="relative flex min-h-screen items-center justify-center overflow-hidden pb-8 pt-16 sm:pb-12 sm:pt-20 lg:pb-16">
      {/* Background Slider & Overlays */}
      <BackgroundSlider
        images={HERO_IMAGES}
        duration={5000}
        overlayOpacity="bg-slate-950/60"
      />
      <TrustCenterModal isOpen={open} onClose={() => setOpen(false)} />
      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/60 via-indigo-950/20 to-slate-950" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950/60 to-slate-950" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <FadeIn>
            <motion.div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 px-3 py-1.5 backdrop-blur-sm sm:mb-5 sm:gap-3 sm:px-4 sm:py-2"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(99, 102, 241, 0.3)",
                  "0 0 40px rgba(34, 211, 238, 0.4)",
                  "0 0 20px rgba(99, 102, 241, 0.3)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-cyan-400 sm:h-2 sm:w-2"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 sm:text-sm">
                <span className="hidden sm:inline">
                  AI Governance Packages (2025)
                </span>
                <span className="sm:hidden">AI Governance 2025</span>
              </span>
              <div className="h-3 w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent sm:h-4" />
              <span className="text-xs font-medium text-indigo-300">
                Limited Time
              </span>
            </motion.div>
          </FadeIn>

          {/* Main Headline */}
          <FadeIn delay={0.2}>
            <h1 className="mx-auto mb-6 max-w-4xl text-3xl font-black leading-tight tracking-tight text-white sm:mb-8 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Prove Your AI is
              </motion.div>
              <motion.div
                className="mt-2 bg-gradient-to-r from-indigo-300 via-cyan-300 to-indigo-300 bg-[length:200%_auto] bg-clip-text pb-1 text-2xl text-transparent sm:mt-3 sm:pb-2 sm:text-3xl md:mt-4 md:text-4xl lg:mt-5 lg:text-5xl xl:text-6xl"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                Safe, Transparent & Responsible
              </motion.div>
            </h1>
          </FadeIn>

          {/* Subtext */}
          <FadeIn delay={0.4}>
            <motion.p
              className="mx-auto mb-6 max-w-3xl text-base font-medium leading-relaxed text-slate-300 sm:mb-8 sm:text-lg md:mb-10 md:max-w-4xl md:text-xl lg:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              Generate your{" "}
              <span className="font-bold text-cyan-300">free TrustCenter</span>{" "}
              with CognitiveView. The unified platform built for AI governance,
              risk, privacy, and compliance.
            </motion.p>
          </FadeIn>

          {/* Trust Badges */}
          <FadeIn delay={0.5}>
            <motion.div
              className="mb-6 flex flex-wrap justify-center gap-2 text-xs text-indigo-300 sm:mb-8 sm:gap-3 sm:text-sm md:mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/30 px-3 py-1 font-medium backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-1.5">
                <Check className="h-3 w-3 sm:h-4 sm:w-4" /> ISO 42001
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/30 px-3 py-1 font-medium backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-1.5">
                <Check className="h-3 w-3 sm:h-4 sm:w-4" /> EU AI Act
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/30 px-3 py-1 font-medium backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-1.5">
                <Check className="h-3 w-3 sm:h-4 sm:w-4" /> NIST AI RMF
              </div>
            </motion.div>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.6}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4 md:gap-5">
              <motion.button
                onClick={() => setOpen(true)}
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-3 text-base font-bold text-white shadow-2xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:ring-2 hover:ring-cyan-400/50 hover:ring-offset-2 hover:ring-offset-slate-900 sm:px-8 sm:py-4 sm:text-lg md:px-10 md:py-5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">Get TrustScore</span>
                  <span className="sm:hidden">TrustScore</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1 sm:size-5"
                  />
                </span>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>

              <motion.button
                onClick={() =>
                  window.open("https://trust.cognitiveview.com", "_blank")
                }
                className="group rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-bold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/10 sm:px-8 sm:py-4 sm:text-lg md:px-10 md:py-5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">
                    See a Live TrustCenter
                  </span>
                  <span className="sm:hidden">Live TrustCenter</span>
                  <Eye
                    size={16}
                    className="transition-transform group-hover:scale-110 sm:size-5"
                  />
                </span>
              </motion.button>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Bottom Gradient Fade to blend with next section */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-20 bg-gradient-to-t from-tertiary-500 to-transparent" />
    </header>
  );
};
export default Hero;
