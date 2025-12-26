import {
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  FileCheck,
  Shield,
  Sparkles,
  Stethoscope,
  Zap
} from "lucide-react";
import BackgroundSlider from "./BackgroundSlider";
import SectionHeader from "./SectionHeader";
import { FadeIn } from "./YearEnd2025";

const PackagesSection = () => {
  const handleContactSales = (packageTitle: string) => {
    const productName = packageTitle;
    // const productId =
    //   packageId || packageTitle.replace(/\s+/g, "-").toLowerCase();

    const subject = `Enquiry for ${productName}`;
    const body = `Hello, I'm interested in ${productName} .

I would like to learn more about this solution and discuss pricing options.

Name: "provide your name"
Email: "provide your email"

Thank you for your time.`;

    const mailtoLink = `mailto:sales@cognitiveview.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(mailtoLink, "_blank");
  };
  const PACKAGE_BG_IMAGES = [
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=2070", // Gradient waves
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2070", // Soft blur office
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2070", // Blue abstract geometry
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070", // Corporate background
    "https://images.unsplash.com/photo-1579546929662-711aa81148cf?auto=format&fit=crop&q=80&w=2070", // Minimal pastel gradient
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070", // Futuristic tech
    "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=2070", // Dark premium gradient
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=2070", // Colorful abstract waves
    "https://images.unsplash.com/photo-1586075010999-9bc9e4c15331?auto=format&fit=crop&q=80&w=2070", // Clean white gradient
    "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=2070" // Creative abstract texture
  ];
  const PACKAGES = [
    {
      title: "AI Compliance Evidence Pack",
      subtitle: "Done-For-You Service",
      desc: "A turnkey service producing complete governance documentation, risk mapping, metrics, and an audit-ready compliance report.",
      features: [
        "Governance Documentation",
        "Risk Mapping",
        "Audit-Ready Report"
      ],
      highlight: false,
      type: "Sales-Led",
      icon: FileCheck,
      gradient: "from-blue-500/10 to-indigo-500/10",
      accentColor: "blue"
    },
    {
      title: "AI Vendor Risk Assessment",
      subtitle: "Vendor Evaluation",
      desc: "A structured evaluation of up to 10 AI vendors with aligned risks, controls, and integrated register entries.",
      features: ["Up to 10 Vendors", "Aligned Controls", "Integrated Register"],
      highlight: false,
      type: "Sales-Led",
      icon: Shield,
      gradient: "from-purple-500/10 to-pink-500/10",
      accentColor: "purple"
    },
    {
      title: "AI Governance Readiness Certificate",
      subtitle: "Year-End Edition",
      desc: "A rapid maturity assessment with a heatmap, roadmap, and official readiness certificate.",
      features: [
        "Maturity Heatmap",
        "Strategic Roadmap",
        "Readiness Certificate"
      ],
      highlight: false,
      type: "Sales-Led",
      icon: Award,
      gradient: "from-amber-500/10 to-orange-500/10",
      accentColor: "amber"
    },
    {
      title: "Enterprise License",
      subtitle: "2025 Bill / 2026 Start",
      desc: "Secure enterprise pricing now, gain limited 2025 access, and begin rollout in January 2026.",
      features: ["Lock 2025 Pricing", "Early Access", "Full Rollout Jan '26"],
      highlight: false,
      type: "Sales-Led",
      icon: Briefcase,
      gradient: "from-emerald-500/10 to-teal-500/10",
      accentColor: "emerald"
    }
  ];

  const getAccentClasses = (color: string) => {
    const classes = {
      blue: {
        border: "hover:border-blue-500/50",
        shadow: "hover:shadow-blue-500/10",
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        glow: "bg-blue-500/10 group-hover:bg-blue-500/20",
        checkmark: "text-blue-400"
      },
      purple: {
        border: "hover:border-purple-500/50",
        shadow: "hover:shadow-purple-500/10",
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        glow: "bg-purple-500/10 group-hover:bg-purple-500/20",
        checkmark: "text-purple-400"
      },
      amber: {
        border: "hover:border-amber-500/50",
        shadow: "hover:shadow-amber-500/10",
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        glow: "bg-amber-500/10 group-hover:bg-amber-500/20",
        checkmark: "text-amber-400"
      },
      emerald: {
        border: "hover:border-emerald-500/50",
        shadow: "hover:shadow-emerald-500/10",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        glow: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
        checkmark: "text-emerald-400"
      }
    };
    return classes[color as keyof typeof classes] || classes.blue;
  };

  return (
    <section
      id="packages"
      className="relative overflow-hidden bg-slate-900 py-12 sm:py-16 md:py-20 lg:py-24"
    >
      <BackgroundSlider
        images={PACKAGE_BG_IMAGES}
        duration={5000}
        overlayOpacity="bg-slate-950/90"
        effect="fade-zoom"
      />

      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500/10 blur-3xl delay-1000" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Year-End 2025 Offers"
          title="Packages & Pricing"
          description="Choose your path to audit readiness."
          tagColor="text-cyan-400"
          tagBg="bg-cyan-500/10"
          icon={Sparkles}
          tagBorder="border-cyan-500/20"
          titleColor="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
          descriptionColor="text-slate-400"
        />

        {/* Self-Service Bundle (Featured) */}
        <FadeIn className="mb-8 sm:mb-10 lg:mb-12">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 shadow-2xl transition-all duration-700 hover:scale-[1.02] hover:shadow-indigo-500/30 sm:rounded-3xl">
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 blur transition-opacity duration-700 group-hover:opacity-20 sm:rounded-3xl" />

            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

            <div className="relative flex flex-col lg:flex-row">
              <div className="p-6 sm:p-8 lg:w-2/3 lg:p-10">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 sm:mb-4 sm:gap-2 sm:px-4 sm:py-2">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75"></span>
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500 sm:h-2 sm:w-2"></span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-700 sm:text-xs">
                    Sales-Led
                  </span>
                </div>

                <h3 className="mb-1.5 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-700 bg-clip-text text-xl font-bold text-transparent transition-all duration-300 group-hover:from-indigo-900 group-hover:via-purple-900 group-hover:to-indigo-900 sm:mb-2 sm:text-2xl lg:text-3xl">
                  AI Governance Starter Bundle
                </h3>
                <p className="mb-6 text-base text-slate-600 sm:mb-8 sm:text-lg">
                  The fastest way to get audit-ready. Includes TrustCenter
                  Starter, Policy Pack, and 1-Hour Expert Onboarding.
                </p>

                <div className="mb-6 grid gap-2.5 sm:mb-8 sm:grid-cols-2 sm:gap-3 lg:gap-4">
                  {[
                    "AI Application Register (10)",
                    "Responsible AI Self-Assessment",
                    "Policy Pack (Starter Edition)",
                    "SOP Templates (Starter Edition)",
                    "Responsible AI Training for Employees (Lite)",
                    "TrustCenter Starter Edition",
                    "AI Audit & Executive Evidence Pack (PDF)",
                    "1-Hour Guided Onboarding"
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="group/item flex items-center gap-2 text-xs font-semibold text-slate-700 transition-all duration-300 hover:translate-x-1 sm:gap-3 sm:text-sm"
                    >
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-emerald-500 transition-transform duration-300 group-hover/item:scale-110 sm:h-4.5 sm:w-4.5"
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() =>
                    handleContactSales("AI Governance Starter Bundle")
                  }
                  className="group/btn relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-indigo-600/50 sm:w-auto sm:rounded-xl sm:px-8 sm:py-4 sm:text-base"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Contact Sales
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 translate-y-full bg-gradient-to-r from-indigo-700 to-purple-700 transition-transform duration-500 group-hover/btn:translate-y-0" />
                  <div className="absolute inset-0 opacity-0 blur-xl transition-opacity duration-500 group-hover/btn:opacity-100">
                    <div className="h-full w-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                  </div>
                </button>
              </div>

              <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white sm:p-8 lg:w-1/3 lg:p-10">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <div className="absolute -right-10 -top-10 h-32 w-32 animate-pulse rounded-full bg-indigo-500/30 blur-3xl sm:-right-20 sm:-top-20 sm:h-64 sm:w-64" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 animate-pulse rounded-full bg-purple-500/30 blur-3xl delay-1000 sm:-bottom-20 sm:-left-20 sm:h-64 sm:w-64" />

                <div className="relative z-10">
                  <h4 className="mb-4 flex items-center gap-2 border-b border-white/20 pb-3 text-lg font-bold sm:mb-6 sm:pb-4 sm:text-xl">
                    <Zap className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
                    Rapid Results
                  </h4>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="group/stat rounded-lg bg-white/5 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10 sm:rounded-xl sm:p-4">
                      <div className="mb-1 bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl lg:text-4xl">
                        14 Days
                      </div>
                      <div className="text-xs text-indigo-200 sm:text-sm">
                        to Become Audit-Ready
                      </div>
                    </div>
                    <div className="group/stat rounded-lg bg-white/5 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10 sm:rounded-xl sm:p-4">
                      <div className="mb-1 bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl lg:text-4xl">
                        100%
                      </div>
                      <div className="text-xs text-indigo-200 sm:text-sm">
                        Digital Delivery
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Sales-Led Packages */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:mb-10 sm:grid-cols-2 sm:gap-6 lg:mb-12 lg:grid-cols-3 lg:gap-8">
          {PACKAGES.map((pkg, i) => {
            const Icon = pkg.icon;
            const accentClasses = getAccentClasses(pkg.accentColor);

            return (
              <FadeIn key={i} delay={i * 0.15} className="h-full">
                <div
                  className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 backdrop-blur-xl transition-all duration-500 hover:border-white/30 ${accentClasses.shadow} hover:scale-[1.03] hover:shadow-2xl sm:rounded-2xl sm:p-6 lg:p-8`}
                >
                  {/* Animated gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${pkg.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  {/* Glow effect */}
                  <div
                    className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${accentClasses.glow} blur-2xl transition-all duration-500 sm:-right-12 sm:-top-12 sm:h-32 sm:w-32`}
                  />

                  <div className="relative z-10 flex h-full flex-col">
                    <div
                      className={`mb-3 inline-flex w-fit items-center gap-1.5 rounded-full ${accentClasses.bg} px-2.5 py-1 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 sm:mb-4 sm:gap-2 sm:px-3 sm:py-1.5`}
                    >
                      <Icon
                        className={`h-3 w-3 ${accentClasses.text} sm:h-3.5 sm:w-3.5`}
                      />
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${accentClasses.text} sm:text-xs`}
                      >
                        {pkg.type}
                      </span>
                    </div>

                    <h3 className="mb-1 text-lg font-bold text-white transition-all duration-300 group-hover:text-white sm:text-xl">
                      {pkg.title}
                    </h3>
                    <div className="mb-3 text-xs font-semibold text-slate-300 sm:mb-4 sm:text-sm">
                      {pkg.subtitle}
                    </div>
                    <p className="mb-4 flex-grow text-xs leading-relaxed text-slate-400 sm:mb-6 sm:text-sm">
                      {pkg.desc}
                    </p>

                    <ul className="mb-6 space-y-2 sm:mb-8 sm:space-y-3">
                      {pkg.features.map((f, idx) => (
                        <li
                          key={idx}
                          className="group/feature flex items-start gap-2 text-xs text-slate-300 transition-all duration-300 hover:translate-x-1 sm:gap-3 sm:text-sm"
                        >
                          <CheckCircle2
                            className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${accentClasses.checkmark} transition-transform duration-300 group-hover/feature:scale-110 sm:h-4 sm:w-4`}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleContactSales(pkg.title)}
                      className="group/btn relative mt-auto w-full overflow-hidden rounded-lg border border-white/20 bg-white/5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:border-white/40 hover:bg-white hover:text-slate-900 hover:shadow-lg sm:rounded-xl sm:py-3 sm:text-base"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Contact Sales
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </span>
                    </button>
                  </div>
                </div>
              </FadeIn>
            );
          })}

          {/* Healthcare Package */}
          <FadeIn delay={0.6} className="h-full sm:col-span-2 lg:col-span-2">
            <div className="group relative h-full overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-900/60 to-emerald-950/60 p-4 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:border-teal-500/60 hover:shadow-2xl hover:shadow-teal-500/20 sm:rounded-2xl sm:p-6 lg:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-teal-500/20 blur-3xl transition-all duration-500 group-hover:bg-teal-500/30 sm:-right-12 sm:-top-12 sm:h-32 sm:w-32" />
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-emerald-500/20 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/30 sm:-bottom-12 sm:-left-12 sm:h-32 sm:w-32" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-1 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 sm:mb-4 sm:gap-2 sm:px-3 sm:py-1.5">
                  <Stethoscope className="h-3 w-3 text-teal-400 sm:h-3.5 sm:w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 sm:text-xs">
                    Sales-Led
                  </span>
                </div>

                <h3 className="mb-1.5 text-lg font-bold text-white sm:mb-2 sm:text-xl">
                  Healthcare HAIGS-CL Kickstart
                </h3>
                <div className="mb-3 text-xs font-semibold text-slate-300 sm:mb-4 sm:text-sm">
                  Healthcare Focused
                </div>
                <p className="mb-4 flex-grow text-xs leading-relaxed text-slate-300 sm:mb-6 sm:text-sm">
                  A comprehensive program designed specifically for healthcare
                  organizations to establish robust AI governance frameworks
                  aligned with HAIGS-CL standards. This initiative helps
                  healthcare AI teams implement transparent governance
                  structures, develop sophisticated clinical risk scoring
                  methodologies, ensure regulatory compliance, and build
                  trustworthy AI systems that meet the unique demands of
                  healthcare environments while maintaining patient safety and
                  data protection standards.
                </p>

                <div className="flex w-full flex-col items-start gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <ul className="space-y-2 sm:space-y-3">
                    {[
                      "HAIGS-CL Alignment",
                      "Clinical Risk Scoring",
                      "Healthcare Compliance"
                    ].map((f, idx) => (
                      <li
                        key={idx}
                        className="group/feature flex items-start gap-2 text-xs text-slate-300 transition-all duration-300 hover:translate-x-1 sm:gap-3 sm:text-sm"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400 transition-transform duration-300 group-hover/feature:scale-110 sm:h-4 sm:w-4" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() =>
                      window.open("https://haigs.cognitiveview.com/", "_blank")
                    }
                    className="group/btn relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-600/30 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-teal-600/50 sm:rounded-xl sm:px-6 sm:py-3 sm:text-base lg:w-auto lg:px-8"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      View Healthcare Solution
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 translate-y-full bg-gradient-to-r from-teal-700 to-emerald-700 transition-transform duration-500 group-hover/btn:translate-y-0" />
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
