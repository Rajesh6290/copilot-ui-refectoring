import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileX,
  ShieldCheck,
  Sparkles,
  X
} from "lucide-react";
import SectionHeader from "./SectionHeader";
import { FadeIn } from "./YearEnd2025";

const ProblemSection = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-12 sm:py-16 md:py-20 lg:py-24">
      {/* Background Decorators for "Buttery" Feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="The Challenge"
          title="Why AI Deals Get Stuck"
          description="Understanding the trust gap that slows down AI adoption and how to bridge it with transparency."
          tagColor="text-red-600"
          tagBg="bg-red-50"
          tagBorder="border-red-200"
          icon={Sparkles}
        />
        {/* --- CARD 2: THE BOTTLENECK (Orange) --- */}
        <FadeIn delay={0.2}>
          <div className="group relative my-6 overflow-hidden rounded-2xl border border-orange-200 bg-orange-50 shadow-xl shadow-orange-900/5 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-900/10 sm:my-8 sm:rounded-[2.5rem] lg:my-10">
            <div className="p-4 sm:p-6 md:p-8 lg:p-10">
              {/* Header */}
              <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-white text-orange-600 shadow-sm sm:h-12 sm:w-12 sm:rounded-2xl">
                  <AlertOctagon
                    size={20}
                    className="sm:h-6 sm:w-6"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-700 sm:text-sm">
                    The Bottleneck
                  </h4>
                  <p className="text-base font-bold text-orange-900 sm:text-lg">
                    Evidence Required
                  </p>
                </div>
              </div>

              <p className="mb-4 text-base font-medium leading-relaxed text-orange-900 sm:mb-6 sm:text-lg">
                You {"can't"} win modern AI deals without evidence.{" "}
                <span className="font-normal text-orange-700">
                  Procurement, security, and legal teams now require:
                </span>
              </p>

              <div className="mb-4 grid gap-1.5 sm:mb-6 sm:grid-cols-2 sm:gap-2 lg:grid-cols-4">
                {[
                  "Proof of fairness",
                  "Proof of reliability",
                  "Proof of safety",
                  "Proof of monitoring",
                  "Proof of governance",
                  "Proof of privacy",
                  "Proof of responsibility",
                  "Proof of transparency"
                ].map((proof, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className="shrink-0 text-orange-500 sm:h-4 sm:w-4"
                    />
                    <span className="text-xs font-medium text-orange-800 sm:text-sm">
                      {proof}
                    </span>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 rounded-lg bg-orange-200/50 px-3 py-1.5 text-xs font-bold text-orange-900 sm:px-4 sm:py-2 sm:text-sm">
                <FileX size={14} className="sm:h-4 sm:w-4" /> Static documents
                no longer work.
              </div>
            </div>
          </div>
        </FadeIn>
        {/* --- GRID LAYOUT --- */}
        <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-12">
          {/* --- LEFT COLUMN: THE PROBLEM (Friction) --- */}
          <FadeIn delay={0.1}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-900/5 sm:rounded-[2.5rem]">
              <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-red-500 to-orange-400 sm:h-1.5"></div>

              <div className="p-4 sm:p-6 md:p-8 lg:p-11">
                {/* Header */}
                <div className="mb-4 flex items-center gap-2 sm:mb-6 sm:gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-sm sm:h-12 sm:w-12 sm:rounded-2xl">
                    <AlertTriangle
                      size={20}
                      className="sm:h-6 sm:w-6"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 sm:text-sm">
                      The Problem
                    </h4>
                  </div>
                </div>

                {/* Main Headline */}
                <h2 className="mb-4 text-lg font-bold leading-snug text-slate-900 sm:mb-6 sm:text-xl lg:text-xl">
                  <span className="block sm:inline">
                    Buyers {"don't"} reject your AI because of performance.
                  </span>{" "}
                  <span className="block text-red-600 decoration-red-200 underline-offset-4">
                    They reject it because of trust.
                  </span>
                </h2>

                {/* Content Block: Deals slow down because... */}
                <div className="mb-6 space-y-3 sm:mb-8 sm:space-y-4">
                  <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
                    <strong>Deals slow down because:</strong>
                  </p>
                  <div className="grid gap-2 sm:gap-3">
                    {[
                      "Transparency is unclear",
                      "Data privacy posture is hidden",
                      "Security & legal can't assess risk",
                      "Governance documentation is scattered",
                      "Evidence is stuck in PDFs & spreadsheets",
                      "No single source of truth exists"
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 sm:gap-3">
                        <X
                          size={16}
                          className="mt-0.5 shrink-0 text-red-500 sm:mt-1 sm:h-4.5 sm:w-4.5"
                          strokeWidth={2.5}
                        />
                        <span className="text-sm font-medium text-slate-900 sm:text-base">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alert Box - Buyers often say... */}
                <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 sm:rounded-2xl sm:p-6">
                  <p className="mb-2 text-sm font-bold text-red-900 sm:mb-3 sm:text-base">
                    Even excellent AI gets stuck when trust is missing.
                  </p>
                  <div className="mb-3 space-y-1.5 sm:mb-4 sm:space-y-2">
                    <p className="text-xs font-medium text-red-800 sm:text-sm">
                      Buyers often say:
                    </p>
                    {[
                      '"We need more transparency."',
                      '"How is customer data handled?"',
                      '"Where is your governance documentation?"',
                      '"Security needs clarity on risks."',
                      '"We can\'t approve without evidence."'
                    ].map((quote, i) => (
                      <p
                        key={i}
                        className="border-l-2 border-red-300 pl-3 text-xs italic text-red-700 sm:pl-4 sm:text-sm"
                      >
                        {quote}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-red-900 sm:text-sm">
                    This causes{" "}
                    <span className="decoration-red-400 decoration-2 underline-offset-2">
                      6 to 12 month delays
                    </span>{" "}
                    or lost opportunities.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* --- RIGHT COLUMN: BOTTLENECK + SOLUTION --- */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* --- CARD 3: THE SOLUTION (TrustCenter) --- */}
            <FadeIn delay={0.3}>
              <div className="group relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl shadow-indigo-900/20 transition-all duration-500 hover:scale-[1.005] sm:rounded-[2.5rem] sm:hover:scale-[1.01]">
                {/* Decorative Gradients */}
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500 opacity-20 blur-[40px] transition-opacity group-hover:opacity-30 sm:-right-20 sm:-top-20 sm:h-64 sm:w-64 sm:blur-[80px]"></div>
                <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-blue-500 opacity-20 blur-[40px] sm:-left-20 sm:h-64 sm:w-64 sm:blur-[80px]"></div>

                <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
                  {/* Header */}
                  <div className="mb-6 flex items-center gap-2 sm:mb-8 sm:gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50 sm:h-12 sm:w-12 sm:rounded-2xl">
                      <ShieldCheck size={20} className="sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 sm:text-sm">
                        The Solution
                      </h4>
                      <p className="text-base font-semibold text-white sm:text-lg">
                        Dynamic TrustCenter
                      </p>
                    </div>
                  </div>

                  {/* Main Headline */}
                  <h2 className="mb-4 text-xl font-bold leading-snug sm:mb-6 sm:text-2xl lg:text-3xl">
                    <span className="block sm:inline">
                      {"Don't"} send PDFs.
                    </span>{" "}
                    <span className="block bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">
                      Send a Live Trust Link.
                    </span>
                  </h2>

                  <p className="mb-6 text-sm font-medium leading-relaxed text-indigo-100/80 sm:mb-8 sm:text-base lg:text-lg">
                    Provide procurement, security, and legal teams with a
                    real-time, living dashboard of your {"AI's"} integrity.
                  </p>

                  {/* Feature Grid */}
                  <div className="mb-6 grid gap-x-1.5 gap-y-2 sm:mb-8 sm:grid-cols-2 sm:gap-x-2 sm:gap-y-3 lg:mb-10 lg:gap-y-4">
                    {[
                      "Transparency disclosures",
                      "Governance oversight",
                      "Data privacy handling",
                      "AI Agent profiles",
                      "Risk posture indicators",
                      "Standards alignment",
                      "Model performance insights",
                      "Safety and bias evaluations",
                      "Lifecycle audit trails",
                      "Compliance Readiness Score"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 sm:gap-3">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400 sm:h-6 sm:w-6">
                          <Check
                            size={12}
                            className="sm:h-3.5 sm:w-3.5"
                            strokeWidth={3}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-200 sm:text-sm">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Results / ROI Box */}
                  <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-md sm:rounded-2xl sm:p-6">
                    <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-white sm:mb-4 sm:text-base">
                      <CheckCircle2
                        size={16}
                        className="text-green-400 sm:h-4.5 sm:w-4.5"
                      />
                      Immediate Impact
                    </h5>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 sm:pb-2">
                        <span className="text-xs text-indigo-200 sm:text-sm">
                          Procurement Friction
                        </span>
                        <span className="text-xs font-bold text-green-300 sm:text-sm">
                          ↓ 80% Reduced
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 sm:pb-2">
                        <span className="text-xs text-indigo-200 sm:text-sm">
                          Trust Building
                        </span>
                        <span className="text-xs font-bold text-green-300 sm:text-sm">
                          Instant
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-indigo-200 sm:text-sm">
                          Approval Status
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-white sm:text-sm">
                          {"Easy to Approve"}{" "}
                          <ArrowRight size={12} className="sm:h-3.5 sm:w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ProblemSection;
