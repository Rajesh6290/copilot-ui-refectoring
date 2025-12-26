import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bot,
  Briefcase,
  FileCheck,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  Scale,
  Server,
  Sparkles
} from "lucide-react";
import SectionHeader from "./SectionHeader";
import { FadeIn } from "./YearEnd2025";

const PlatformCapabilities = () => {
  // Enhanced Data: 12 Items total for a perfect 4x3 grid
  const ENHANCED_CAPABILITIES = [
    {
      title: "AI Agent Register",
      desc: "Track autonomous agents, tools, permissions, and their operational boundaries.",
      icon: Bot,
      image:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2065&auto=format&fit=crop"
    },
    {
      title: "Data Privacy Mapping",
      desc: "Automated mapping of PII, data lineage, and cross-border transfer risks.",
      icon: Lock,
      image:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop"
    },
    {
      title: "Risk Posture Scoring",
      desc: "Real-time quantification of AI risk across the organisation with live heatmaps.",
      icon: Activity,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Standards Alignment",
      desc: "Instant alignment with ISO 42001, NIST AI RMF, EU AI Act, and more.",
      icon: Layers,
      image:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Sub-Processor Visibility",
      desc: "Map your AI supply chain, 3rd party risks, and vendor dependencies.",
      icon: Server,
      image:
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Policies & SOPs",
      desc: "A complete library of governance templates, policies, and standard procedures.",
      icon: FileText,
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Responsible AI Training",
      desc: "Interactive modules to upskill employees on safe and ethical AI use.",
      icon: GraduationCap,
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Bias & Drift Signals",
      desc: "Continuous monitoring for fairness, accuracy drift, and model degradation.",
      icon: Scale,
      image:
        "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=2074&auto=format&fit=crop"
    },
    {
      title: "Audit-Ready Exports",
      desc: "One-click generation of comprehensive compliance evidence packs.",
      icon: FileCheck,
      image:
        "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Vendor Risk Management",
      desc: "Assess and monitor the security and compliance of your AI software vendors.",
      icon: Briefcase,
      image:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2064&auto=format&fit=crop"
    },
    {
      title: "Incident Response",
      desc: "Log, track, and resolve AI-related incidents, failures, or safety breaches.",
      icon: AlertTriangle,
      image:
        "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <section className="bg-slate-50 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Platform Overview"
          title="Complete AI Governance Capabilities"
          description="Everything you need to manage the full AI lifecycle, centralised into one unified TrustCenter."
          tagColor="text-indigo-600"
          icon={Sparkles}
        />{" "}
        {/* Card Grid - Responsive Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {ENHANCED_CAPABILITIES.map((cap, i) => (
            <FadeIn key={i} delay={i * 0.05} className="h-full">
              <motion.div
                className="group relative h-[280px] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 sm:h-[320px] sm:rounded-3xl md:h-[340px] lg:h-[360px]"
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={cap.image}
                    alt={cap.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-60 sm:group-hover:scale-110"
                  />
                  {/* Gradient Overlay - Stronger at bottom for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20 opacity-90 transition-opacity duration-300 group-hover:opacity-100 sm:via-slate-950/60 sm:to-transparent" />

                  {/* Color Tint on Hover */}
                  <div className="absolute inset-0 bg-indigo-900/0 transition-colors duration-500 group-hover:bg-indigo-900/20" />
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 lg:p-6">
                  {/* Floating Icon with Glassmorphism */}
                  <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:border-indigo-400/50 group-hover:bg-indigo-600/80 sm:right-4 sm:top-4 sm:h-11 sm:w-11 sm:rounded-2xl lg:right-5 lg:top-5 lg:h-12 lg:w-12">
                    <cap.icon
                      size={18}
                      className="transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5 lg:h-5.5 lg:w-5.5"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="translate-y-1 transform transition-transform duration-300 group-hover:translate-y-0 sm:translate-y-2">
                    <h4 className="mb-1.5 text-lg font-bold leading-tight text-white group-hover:text-cyan-50 sm:mb-2 sm:text-xl lg:text-xl">
                      {cap.title}
                    </h4>
                    <p className="line-clamp-3 text-xs font-medium leading-relaxed text-slate-300 opacity-90 group-hover:opacity-100 sm:text-sm lg:text-sm">
                      {cap.desc}
                    </p>

                    {/* Decorative Line */}
                    <div className="mt-3 h-0.5 w-8 rounded-full bg-indigo-500 transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-cyan-400 sm:mt-4 sm:h-1 sm:w-10 lg:w-12" />
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
export default PlatformCapabilities;
