import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileCheck,
  Lock,
  Scale,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import SectionHeader from "./SectionHeader";
import { motion } from "framer-motion";

const TrustCenterSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50, damping: 20 }
    }
  };
  const gridItems = [
    {
      title: "Purpose of AI Apps",
      items: ["What it does", "Problems solved", "Known risks"],
      gradient: "from-blue-500 to-cyan-500",
      bgAccent: "bg-blue-600",
      iconColor: "text-blue-500",
      icon: Database
    },
    {
      title: "Handling Customer Data",
      items: [
        "Uses customer data?",
        "How data is protected",
        "Data separation"
      ],
      gradient: "from-indigo-500 to-tertiary-500",
      bgAccent: "bg-indigo-600",
      iconColor: "text-indigo-500",
      icon: Lock
    },
    {
      title: "AI Transparency & Fairness",
      items: ["Models used", "Model origin", "Bias checks"],
      gradient: "from-violet-500 to-fuchsia-500",
      bgAccent: "bg-violet-600",
      iconColor: "text-violet-500",
      icon: Scale
    },
    {
      title: "Security & Reliability",
      items: ["Misuse protection", "Backup & continuity", "System safeguards"],
      gradient: "from-cyan-500 to-teal-500",
      bgAccent: "bg-cyan-600",
      iconColor: "text-cyan-500",
      icon: ShieldCheck
    },
    {
      title: "Human Oversight",
      items: [
        "Challenge decisions",
        "Human vs AI visibility",
        "Explainability"
      ],
      gradient: "from-emerald-500 to-green-500",
      bgAccent: "bg-emerald-600",
      iconColor: "text-emerald-500",
      icon: Users
    },
    {
      title: "Accuracy & Monitoring",
      items: [
        "Reliability checks",
        "Performance monitoring",
        "Testing frequency"
      ],
      gradient: "from-orange-500 to-red-500",
      bgAccent: "bg-orange-600",
      iconColor: "text-orange-500",
      icon: Activity
    }
  ];
  const coverageItems = [
    {
      title: "Responsible AI & Governance",
      icon: BrainCircuit,
      items: [
        "Responsible AI policies",
        "Governance & oversight",
        "Responsible AI commitments",
        "Legal alignment",
        "Ethical disclosures",
        "AI usage clarity"
      ],
      gradient: "from-indigo-500 to-indigo-200",
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
      dotColor: "bg-indigo-400"
    },
    {
      title: "Safety, Data Privacy & Transparency",
      icon: ShieldCheck,
      items: [
        "Safety disclosures",
        "Data privacy handling",
        "Transparency summaries",
        "Security measures",
        "Data protection practices",
        "Privacy impact assessments"
      ],
      gradient: "from-emerald-500 to-emerald-200",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
      dotColor: "bg-emerald-400"
    },
    {
      title: "Risk, Bias, Drift & Monitoring",
      icon: Activity,
      items: [
        "Bias & risk posture",
        "Continuous monitoring",
        "AI lifecycle tracking",
        "Feedback loops",
        "Periodic reviews",
        "Continuous updates"
      ],
      gradient: "from-orange-500 to-orange-200",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
      dotColor: "bg-orange-400"
    },
    {
      title: "Standards, Compliance & Evidence",
      icon: FileCheck,
      items: [
        "ISO 42001, EU AI Act",
        "Global standards compliance",
        "Audit-ready evidence",
        "Compliance records",
        "Evidence collection",
        "Export capabilities"
      ],
      gradient: "from-tertiary-500 to-tertiary-200",
      bgLight: "bg-tertiary-50",
      textColor: "text-tertiary-600",
      dotColor: "bg-tertiary-400"
    }
  ];
  return (
    <section
      id="trustcenter"
      className="relative overflow-hidden border-t bg-slate-50 py-12 sm:py-16 md:py-20 lg:py-24"
    >
      {/* Background Decoration (Subtle Grid) */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#4f46e5 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="TrustCenter Preview"
          title="One TrustCenter Replaces Everything"
          description="Publish live evidence of safety, governance, and compliance instantly credible with buyers."
          tagColor="text-indigo-600"
          className="mb-12 sm:mb-16 lg:mb-20"
          icon={Sparkles}
        />

        {/* Key Elements Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 grid gap-4 sm:mb-16 sm:grid-cols-2 sm:gap-6 lg:mb-24 lg:grid-cols-3 lg:gap-8"
        >
          {gridItems.map((card, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.005 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:ring-indigo-100 sm:rounded-2xl sm:p-6 lg:p-8"
            >
              {/* Gradient Top Line on Hover */}
              <div
                className={`absolute left-0 top-0 h-1 w-full scale-x-0 bg-gradient-to-r ${card.gradient} transition-transform duration-500 ease-out group-hover:scale-x-100`}
              />

              <div>
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg sm:mb-6 sm:h-12 sm:w-12 sm:rounded-xl ${card.bgAccent} text-white shadow-md transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110`}
                >
                  <card.icon size={20} className="sm:h-6 sm:w-6" />
                </div>

                <h4 className="mb-3 text-lg font-bold text-slate-900 group-hover:text-indigo-900 sm:mb-4 sm:text-xl">
                  {card.title}
                </h4>

                <ul className="space-y-2 sm:space-y-3">
                  {card.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-600 sm:gap-3 sm:text-sm"
                    >
                      <CheckCircle2
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${card.iconColor}`}
                      />
                      <span className="transition-colors group-hover:text-slate-900">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Comprehensive TrustCenter Features Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 sm:rounded-3xl"
        >
          {/* Decorative Gradient Background behind content */}
          <div className="absolute left-0 right-0 top-0 h-full w-full bg-gradient-to-b from-slate-50 to-white opacity-50" />

          <div className="relative p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="mb-8 text-center sm:mb-10 lg:mb-12">
              <h3 className="mb-2 text-xl font-bold text-slate-900 sm:mb-3 sm:text-2xl lg:text-3xl">
                Complete TrustCenter Coverage
              </h3>
              <p className="text-sm text-slate-500 sm:text-base">
                Your unified transparency and governance platform
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              {coverageItems.map((section, idx) => (
                <div
                  key={idx}
                  className="relative pl-3 transition-all hover:translate-x-1 sm:pl-4"
                >
                  {/* Left Accent Bar */}
                  <div
                    className={`absolute left-0 top-1 h-full w-0.5 rounded-full bg-gradient-to-b sm:w-1 ${section.gradient} opacity-30`}
                  />

                  <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 sm:mb-4 sm:gap-3 sm:text-lg">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-md sm:h-8 sm:w-8 sm:rounded-lg ${section.bgLight}`}
                    >
                      <section.icon
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${section.textColor}`}
                      />
                    </span>
                    <span className="text-sm sm:text-base lg:text-lg">
                      {section.title}
                    </span>
                  </h4>

                  <ul className="grid grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-2">
                    {section.items.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="flex items-center gap-1.5 text-xs text-slate-600 sm:gap-2 sm:text-sm"
                      >
                        <div
                          className={`h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5 ${section.dotColor}`}
                        />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default TrustCenterSection;
