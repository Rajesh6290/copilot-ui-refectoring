import { Check, Globe, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "./YearEnd2025";

const WhatIsSection = () => {
  const STANDARDS = [
    "ISO/IEC 42001",
    "NIST AI RMF",
    "EU AI Act",
    "Colorado AI Act",
    "OECD AI Principles",
    "UK/EU Data Protection"
  ];

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-12 md:gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          {/* Left Side: Content & Context */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              Platform Overview
            </div>
            <FadeIn>
              <h2 className="mb-4 text-2xl font-black leading-tight text-slate-900 sm:mb-6 sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">
                <span className="block text-nowrap">
                  The Operating System for
                </span>
                <span className="block bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  AI Governance
                </span>
              </h2>
              <p className="mb-6 text-sm font-medium leading-relaxed text-slate-600 sm:mb-8 sm:text-base">
                CognitiveView gives organisations a structured,
                standards-aligned way to evaluate, document, and monitor all
                their AI Applications and Agents. Move from manual spreadsheets
                to a dynamic, always-on TrustCenter.
              </p>
            </FadeIn>

            {/* Standards Badges - Interactive */}
            <FadeIn delay={0.1}>
              <div className="mb-6 rounded-xl border border-white bg-white/60 p-4 shadow-xl shadow-slate-200/50 backdrop-blur-sm sm:mb-8 sm:rounded-2xl sm:p-6 lg:mb-10">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 sm:mb-4 sm:text-sm">
                  <Globe size={14} className="text-indigo-500 sm:h-4 sm:w-4" />
                  <span className="xs:inline hidden">
                    Aligned With Global Standards
                  </span>
                  <span className="xs:hidden">Global Standards</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {STANDARDS?.map((s, i) => (
                    <motion.span
                      key={i}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="cursor-default rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-600 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-xs"
                    >
                      {s}
                    </motion.span>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Feature Grid - Full Space Usage */}
            <FadeIn delay={0.2}>
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900">
                  Everything you need to centralise:
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 sm:gap-5">
                  {[
                    "AI Application Register",
                    "Risk Posture Scoring",
                    "Data Privacy Documentation",
                    "Controls Mapping",
                    "AI Agent Inventory",
                    "Sub-Processor Visibility",
                    "Bias & Drift Signals",
                    "Audit-Ready Exports"
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 sm:h-6 sm:w-6">
                        <Check
                          size={12}
                          className="sm:h-3.5 sm:w-3.5"
                          strokeWidth={3}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-700 sm:text-sm">
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Side: High-End Dashboard Visual */}
          <FadeIn
            delay={0.3}
            className="relative flex min-h-[400px] items-center sm:min-h-[500px] md:min-h-[550px] lg:h-full lg:min-h-[600px]"
          >
            {/* Decorative Glows */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />

            <motion.div
              className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-0.5 shadow-2xl sm:rounded-3xl sm:p-1"
              initial={{ y: 20 }}
              animate={{ y: [0, -10, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 6, ease: "easeInOut" }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Dark UI Container */}
              <div className="rounded-[15px] bg-slate-900 p-3 sm:rounded-[20px] sm:p-4 md:p-6 lg:p-8">
                {/* Fake Header */}
                <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3 sm:mb-6 sm:pb-4 lg:mb-8 lg:pb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex gap-1 sm:gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500/80 sm:h-3 sm:w-3" />
                      <div className="h-2 w-2 rounded-full bg-amber-500/80 sm:h-3 sm:w-3" />
                      <div className="h-2 w-2 rounded-full bg-emerald-500/80 sm:h-3 sm:w-3" />
                    </div>
                    <div className="ml-1 h-4 w-px bg-slate-800 sm:ml-2 sm:h-6" />
                    <div className="hidden items-center gap-2 rounded-lg bg-slate-800 px-2 py-1 sm:flex sm:px-3 sm:py-2">
                      <ShieldCheck
                        size={12}
                        className="text-indigo-400 sm:h-3.5 sm:w-3.5"
                      />
                      <span className="font-mono text-[10px] text-slate-300 sm:text-xs">
                        trust.cognitiveview.com
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid gap-2 sm:gap-3 md:gap-4">
                  {/* Top Row Stats */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3 backdrop-blur sm:rounded-2xl sm:p-4 md:p-5">
                      <div className="mb-1 text-[10px] font-medium text-slate-400 sm:mb-2 sm:text-xs">
                        Trust Score
                      </div>
                      <div className="flex items-end gap-1 sm:gap-2">
                        <span className="text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl">
                          98
                        </span>
                        <span className="mb-0.5 text-[10px] font-medium text-emerald-400 sm:mb-1 sm:text-xs md:text-sm">
                          Excellent
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3 backdrop-blur sm:rounded-2xl sm:p-4 md:p-5">
                      <div className="mb-1 text-[10px] font-medium text-slate-400 sm:mb-2 sm:text-xs">
                        Active Models
                      </div>
                      <div className="flex items-end gap-1 sm:gap-2">
                        <span className="text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl">
                          12
                        </span>
                        <span className="mb-0.5 text-[10px] font-medium text-indigo-400 sm:mb-1 sm:text-xs md:text-sm">
                          +2 new
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status List */}
                  <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-3 sm:rounded-2xl sm:p-4 md:p-5">
                    <div className="mb-3 flex items-center justify-between sm:mb-4">
                      <span className="text-xs font-bold text-slate-300 sm:text-sm">
                        Live Monitoring
                      </span>
                      <span className="flex items-center gap-1 text-[9px] uppercase text-emerald-500 sm:text-[10px]">
                        <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500 sm:h-1.5 sm:w-1.5" />
                        Active
                      </span>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        {
                          label: "Fairness Check",
                          status: "PASS",
                          color: "text-emerald-400",
                          bg: "bg-emerald-500/10 border-emerald-500/20"
                        },
                        {
                          label: "PII Detection",
                          status: "SECURE",
                          color: "text-emerald-400",
                          bg: "bg-emerald-500/10 border-emerald-500/20"
                        },
                        {
                          label: "Hallucination Rate",
                          status: "0.2%",
                          color: "text-amber-400",
                          bg: "bg-amber-500/10 border-amber-500/20"
                        }
                      ].map((row, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded-lg border p-2 sm:p-3 ${row.bg}`}
                        >
                          <span className="text-[10px] font-medium text-slate-300 sm:text-xs">
                            {row.label}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-bold sm:text-xs ${row.color}`}
                          >
                            {row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating "Approved" Badge */}
                  <motion.div className="absolute right-2 top-2 rounded-lg border border-emerald-500/30 bg-slate-900/90 px-2 py-1.5 shadow-xl backdrop-blur-md sm:right-4 sm:top-3 sm:rounded-xl sm:px-3 sm:py-2 lg:right-8">
                    <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                      <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 sm:size-6 lg:size-7">
                        <ShieldCheck
                          size={12}
                          className="sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white sm:text-sm">
                          Audit-Ready
                        </div>
                        <div className="text-[10px] text-slate-400 sm:text-xs">
                          <span className="hidden sm:inline">
                            Generated 2m ago
                          </span>
                          <span className="sm:hidden">2m ago</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
export default WhatIsSection;
