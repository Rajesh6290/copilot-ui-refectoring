"use client";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  CheckCircle,
  FileCheck,
  FileText,
  Lock,
  MessageSquare,
  Search,
  Shield,
  Users,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  tagline: string;
}

const DocsOverview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const features: Feature[] = [
    {
      id: "ai-application-governance",
      name: "AI Application Governance",
      tagline: "Complete lifecycle management for all your AI systems",
      description:
        "Manage your entire AI application lifecycle with complete visibility and control. Track every AI system from development to deployment.",
      icon: Brain,
      gradient: "from-purple-500 to-indigo-600"
    },
    {
      id: "compliance-management",
      name: "Compliance Management",
      tagline: "Stay compliant with global regulations effortlessly",
      description:
        "Automated framework mapping ensures you meet SOC2, ISO, GDPR, and AI Act requirements with continuous monitoring.",
      icon: Shield,
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      id: "risk-management",
      name: "Risk Assessment & Management",
      tagline: "Identify and mitigate AI risks proactively",
      description:
        "Comprehensive risk management for responsible AI deployment. Identify, assess, and mitigate risks before they become problems.",
      icon: AlertCircle,
      gradient: "from-red-500 to-orange-600"
    },
    {
      id: "ai-assistant",
      name: "AI-Powered Assistant",
      tagline: "Get instant compliance guidance 24/7",
      description:
        "Your AI assistant understands regulations, policies, and best practices. Get instant answers to compliance questions.",
      icon: MessageSquare,
      gradient: "from-green-500 to-emerald-600"
    },
    {
      id: "control-management",
      name: "Control Management",
      tagline: "Implement and track security controls",
      description:
        "Ensure every control is documented, tested, and effective across all your AI systems with automated tracking.",
      icon: Lock,
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      id: "framework-library",
      name: "Regulatory Framework Library",
      tagline: "Access global AI regulations in one place",
      description:
        "Complete library of global AI and data regulations. Stay updated with the latest requirements and obligations.",
      icon: FileText,
      gradient: "from-violet-500 to-purple-600"
    },
    {
      id: "self-assessment",
      name: "Self-Assessment Tools",
      tagline: "Evaluate your AI governance maturity",
      description:
        "Guided assessments help you identify gaps and improve continuously. Evaluate readiness and maturity scores.",
      icon: CheckCircle,
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      id: "team-collaboration",
      name: "Team Collaboration",
      tagline: "Collaborate seamlessly with role-based access",
      description:
        "Everyone gets the right level of access to the right information. Role-based access control for all teams.",
      icon: Users,
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      id: "analytics-insights",
      name: "Analytics & Insights",
      tagline: "Make data-driven governance decisions",
      description:
        "Real-time dashboards give you complete visibility into your AI governance posture with powerful analytics.",
      icon: BarChart3,
      gradient: "from-pink-500 to-rose-600"
    },
    {
      id: "trust-center-report",
      name: "Trust Center Report",
      tagline: "Build stakeholder confidence with transparency",
      description:
        "Create comprehensive trust center reports that demonstrate your commitment to responsible AI and data governance.",
      icon: Shield,
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      id: "responsible-ai-report",
      name: "Responsible AI Report",
      tagline: "Demonstrate responsible AI practices",
      description:
        "Generate comprehensive reports documenting ethics, fairness, transparency, and accountability across AI systems.",
      icon: CheckCircle,
      gradient: "from-violet-500 to-purple-600"
    },
    {
      id: "document-management",
      name: "Document Management",
      tagline: "Secure, centralized document repository",
      description:
        "Store, organize, and share all your governance documents securely. Everything you need in one location.",
      icon: FileCheck,
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-tertiary-600 via-indigo-600 to-purple-700">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          />
        </div>

        {/* Header Content */}
        <div className="relative z-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 flex items-center justify-center gap-4 text-5xl font-semibold text-white sm:text-6xl"
            >
              <Shield className="h-16 w-16" />
              Feature Documentation
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 text-xl font-medium text-white/90"
            >
              Explore our comprehensive AI governance features. Click on any
              feature to learn how it works and the results it delivers.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto max-w-2xl"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="relative w-full rounded-2xl border-2 border-white/30 bg-white/10 py-4 pl-14 pr-14 text-white placeholder-white/60 backdrop-blur-xl transition-all focus:border-white/50 focus:bg-white/20 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-lg text-white/80"
            >
              Discover detailed documentation for each feature to understand its
              functionality, workflows, and real-world results.
            </motion.p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg
            className="w-full"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
              className="dark:fill-gray-950"
            />
          </svg>
        </div>
      </div>

      {/* Features Overview */}
      <section className="relative -mt-8 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "  All Features"}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Click on any feature to explore detailed information, workflows,
              and results
            </p>
          </motion.div>

          {features.filter(
            (feature) =>
              searchQuery === "" ||
              feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              feature.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              feature.tagline.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-md py-16 text-center"
            >
              <Search className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
              <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                No features found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                We {"couldn't"} find any features matching {`"${searchQuery}"`}.
                Try a different search term.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features
                .filter(
                  (feature) =>
                    searchQuery === "" ||
                    feature.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    feature.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    feature.tagline
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    onClick={() => router.push(`/docs/${feature.id}`)}
                    className="group cursor-pointer overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-neutral-800 dark:bg-darkSidebarBackground"
                  >
                    <div
                      className={`mb-6 inline-flex rounded-2xl bg-gradient-to-r ${feature.gradient} p-4`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                      {feature.name}
                    </h3>
                    <p className="mb-3 text-sm font-medium text-tertiary-600 dark:text-tertiary-400">
                      {feature.tagline}
                    </p>
                    <p className="mb-4 text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-2 text-tertiary-600 transition-all group-hover:gap-3 dark:text-tertiary-400">
                      <span className="text-sm font-semibold">Learn more</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full">
        <div className="absolute left-0 right-0 top-0 z-10">
          <svg
            className="w-full"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 55C840 50 960 40 1080 35C1200 30 1320 30 1380 30L1440 30V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0Z"
              className="fill-slate-50 dark:fill-gray-900"
            />
          </svg>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden bg-gradient-to-r from-tertiary-600 to-indigo-600 p-12 pt-32 text-center text-white shadow-2xl"
        >
          <Shield className="mx-auto mb-6 h-16 w-16" />
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Explore each feature in detail to understand how our platform can
            transform your AI governance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
              <Check className="mr-2 inline h-5 w-5" />
              10+ Core Features
            </div>
            <div className="rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
              <Check className="mr-2 inline h-5 w-5" />
              Step-by-Step Guides
            </div>
            <div className="rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
              <Check className="mr-2 inline h-5 w-5" />
              Real Results
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default DocsOverview;
