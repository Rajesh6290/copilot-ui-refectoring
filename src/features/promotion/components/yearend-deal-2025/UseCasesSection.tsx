import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  BrainCircuit,
  Briefcase,
  FileText,
  Fingerprint,
  Globe,
  GraduationCap,
  Landmark,
  Layers,
  LayoutDashboard,
  Network,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Truck,
  Users,
  Zap
} from "lucide-react";
import SectionHeader from "./SectionHeader";
interface UseCase {
  label: string;
  description: string;
  icon: React.ElementType;
  image: string;
}
const UseCaseCard = ({ data, index }: { data: UseCase; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group relative h-64 w-full overflow-hidden rounded-xl bg-slate-900 shadow-md transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 sm:h-72 sm:rounded-2xl md:h-80"
    >
      {/* Background Image */}
      <div className="absolute inset-0 h-full w-full">
        <img
          src={data.image}
          alt={data.label}
          className="h-full w-full object-cover opacity-60 transition-transform duration-700 ease-in-out group-hover:opacity-50"
        />
        {/* Gradient Overlay: Dark at bottom for text, lighter at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 lg:p-6">
        <div className="relative z-10 transition-transform duration-500 ease-out">
          {/* Icon Badge */}
          <div className="mb-3 inline-flex items-center justify-center rounded-md bg-indigo-600/20 p-2 text-indigo-400 backdrop-blur-md transition-colors duration-500 group-hover:bg-indigo-600 group-hover:text-white sm:mb-4 sm:rounded-lg sm:p-3">
            <data.icon size={20} className="sm:h-6 sm:w-6" strokeWidth={2} />
          </div>

          {/* Title */}
          <h4 className="mb-1.5 text-lg font-bold text-white sm:mb-2 sm:text-xl">
            {data.label}
          </h4>

          {/* Description (Hidden until hover) */}
          <p className="line-clamp-3 text-xs font-medium leading-relaxed text-slate-300 transition-all delay-100 duration-500 group-hover:line-clamp-none sm:text-sm">
            {data.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
const UseCasesSection = () => {
  const USE_CASES: UseCase[] = [
    {
      label: "AI Agents (Auto)",
      icon: Bot,
      // FIXED: Working image of a futuristic robot/AI
      image:
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
      description:
        "Autonomous agents that execute complex workflows without human intervention."
    },
    {
      label: "Multi-Agent Systems",
      icon: Network,
      // FIXED: Working image of network connections/nodes
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      description:
        "Orchestrate teams of specialized agents to solve multifaceted business problems."
    },
    {
      label: "Customer Support AI",
      icon: Users,
      image:
        "https://images.unsplash.com/photo-1525186402429-b4ff38bedbec?auto=format&fit=crop&q=80&w=800",
      description:
        "24/7 intelligent support that resolves tickets and personalizes user interactions."
    },
    {
      label: "Document Processing",
      icon: FileText,
      // FIXED: Working image of documents/paperwork
      image:
        "https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=800",
      description:
        "Extract, classify, and validate data from invoices, contracts, and forms instantly."
    },
    {
      label: "Compliance Assistants",
      icon: ShieldCheck,
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
      description:
        "Automated monitoring to ensure your operations meet regulatory standards."
    },
    {
      label: "Internal Automation",
      icon: Layers,
      image:
        "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&q=80&w=800",
      description:
        "Streamline internal processes and reduce manual overhead with intelligent workflows."
    },
    {
      label: "Generative AI",
      icon: Zap,
      image:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
      description:
        "Create content, code, and designs at scale using state-of-the-art LLMs."
    },
    {
      label: "Predictive Models",
      icon: Activity,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
      description:
        "Forecast trends and behaviors to make data-driven decisions ahead of time."
    },
    {
      label: "Recommendation Engines",
      icon: BrainCircuit,
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
      description:
        "Boost engagement with hyper-personalized product and content suggestions."
    },
    {
      label: "Conversational Assistants",
      icon: Users,
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
      description:
        "Natural language interfaces that allow users to talk directly to your data."
    },
    {
      label: "Finance & Fraud",
      icon: Landmark,
      // FIXED: Working image of financial charts/trading
      image:
        "https://images.unsplash.com/photo-1611974765219-03f255db71df?auto=format&fit=crop&q=80&w=800",
      description:
        "Detect anomalies and prevent financial fraud in real-time with pattern recognition."
    },
    {
      label: "HR & Talent AI",
      icon: Briefcase,
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800",
      description:
        "Optimize recruitment, onboarding, and employee retention strategies."
    },
    {
      label: "Supply Chain AI",
      icon: Truck,
      image:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
      description:
        "Predict inventory needs and optimize logistics routes for maximum efficiency."
    },
    {
      label: "Public Sector AI",
      icon: Globe,
      image:
        "https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&q=80&w=800",
      description:
        "Secure and scalable AI solutions tailored for government and public services."
    },
    {
      label: "Healthcare & Life Sciences",
      icon: Stethoscope,
      image:
        "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=800",
      description:
        "Accelerate research and improve patient outcomes with medical data analysis."
    },
    {
      label: "Education & Training",
      icon: GraduationCap,
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
      description:
        "Personalized learning paths and automated grading systems for education."
    },
    {
      label: "Decision Support",
      icon: LayoutDashboard,
      // FIXED: Working image of analytics dashboard
      image:
        "https://images.unsplash.com/photo-1551135049-8a33b5883817?auto=format&fit=crop&q=80&w=800",
      description:
        "Synthesize vast amounts of data into actionable executive insights."
    },
    {
      label: "Risk Scoring Algorithms",
      icon: Fingerprint,
      // FIXED: Changed to Security/Lock image (Was duplicate of #9)
      image:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
      description:
        "Evaluate credit, insurance, and operational risks with high precision."
    },
    {
      label: "Marketing & Sales AI",
      icon: Zap,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
      description:
        "Generate campaigns, analyze customer segments, personalize outreach and optimize conversion funnels."
    },
    {
      label: "Data Analytics & Visualization",
      icon: Activity,
      image:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
      description:
        "Turn raw data into dashboards, charts and insights to drive strategic decisions."
    }
  ];
  return (
    <section className="relative overflow-hidden border-t border-slate-100 bg-slate-50 py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          tag="Industries & Applications"
          title="AI Solutions for Every Goal"
          description="From autonomous agents to predictive analytics, we provide the infrastructure to scale AI across your entire organization."
          tagColor="text-indigo-600"
          tagBorder="border-cyan-500/20"
          className="mb-12 sm:mb-16 lg:mb-20"
          tagBg="bg-indigo-500/10"
          icon={Sparkles}
        />

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {USE_CASES.map((uc, i) => (
            <UseCaseCard key={i} data={uc} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default UseCasesSection;
