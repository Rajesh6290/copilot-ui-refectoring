"use client";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  CheckCircle,
  ChevronRight,
  FileCheck,
  FileText,
  Home,
  Lock,
  MessageSquare,
  Search,
  Shield,
  Target,
  TrendingUp,
  Users,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface FeatureData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  overview: string;
  keyBenefits: string[];
  howItWorks: {
    step: number;
    title: string;
    description: string;
    details: string[];
  }[];
  results: {
    title: string;
    description: string;
    metrics?: string;
  }[];
  useCases: string[];
}

interface FeatureDetailProps {
  featureId: string;
}

const FeatureDetail = ({ featureId }: FeatureDetailProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const allFeatures: FeatureData[] = useMemo(
    () => [
      {
        id: "ai-application-governance",
        name: "AI Application Governance",
        tagline: "Complete lifecycle management for all your AI systems",
        description:
          "Comprehensive AI application lifecycle management from development to deployment with full visibility and control.",
        icon: Brain,
        gradient: "from-purple-500 to-indigo-600",
        overview:
          "Our AI Application Governance feature provides a centralized platform to manage, monitor, and govern all your AI systems throughout their entire lifecycle. From initial development to production deployment, you get complete visibility and control over every AI application in your organization.",
        keyBenefits: [
          "Centralized AI inventory with automatic discovery",
          "Real-time compliance monitoring and alerts",
          "Automated risk assessment and scoring",
          "Version control and change tracking",
          "Stakeholder collaboration and approval workflows",
          "Integration with development and deployment tools"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Register Your AI Applications",
            description:
              "Add your AI systems to the platform through our intuitive interface or API integration.",
            details: [
              "Manual registration with detailed forms",
              "Automated discovery from connected systems",
              "Bulk import from CSV or API",
              "Integration with CI/CD pipelines"
            ]
          },
          {
            step: 2,
            title: "Define Application Metadata",
            description:
              "Capture essential information about each AI system including purpose, data sources, and stakeholders.",
            details: [
              "Application purpose and use case",
              "Data sources and datasets",
              "Model and agent dependencies",
              "Owner and team assignments",
              "Lifecycle stage and deployment environment"
            ]
          },
          {
            step: 3,
            title: "Automated Assessment",
            description:
              "The platform automatically evaluates compliance, risk, and governance requirements.",
            details: [
              "Compliance framework mapping",
              "Risk level calculation",
              "Control requirement identification",
              "Gap analysis and recommendations"
            ]
          },
          {
            step: 4,
            title: "Continuous Monitoring",
            description:
              "Real-time tracking of changes, compliance status, and risk indicators.",
            details: [
              "Change detection and alerts",
              "Compliance score tracking",
              "Risk metric monitoring",
              "Automated reporting and notifications"
            ]
          }
        ],
        results: [
          {
            title: "Complete Visibility",
            description:
              "Get a comprehensive view of all AI systems across your organization in one centralized dashboard.",
            metrics: "100% visibility into AI application portfolio"
          },
          {
            title: "Faster Time to Compliance",
            description:
              "Automated assessments and recommendations reduce the time needed to achieve compliance.",
            metrics: "80% reduction in compliance preparation time"
          },
          {
            title: "Reduced Risk Exposure",
            description:
              "Proactive risk identification and mitigation prevent costly incidents and regulatory violations.",
            metrics: "60% decrease in compliance-related incidents"
          },
          {
            title: "Better Team Collaboration",
            description:
              "Centralized platform enables seamless collaboration between AI teams, compliance, and risk management.",
            metrics: "50% improvement in cross-team coordination"
          }
        ],
        useCases: [
          "Enterprise AI portfolio management",
          "Regulatory compliance for AI systems",
          "AI risk management and mitigation",
          "Vendor AI system oversight",
          "AI deployment governance"
        ]
      },
      {
        id: "compliance-management",
        name: "Compliance Management",
        tagline: "Stay compliant with global regulations effortlessly",
        description:
          "Automated framework mapping and continuous compliance monitoring for SOC2, ISO, GDPR, AI Act, and more.",
        icon: Shield,
        gradient: "from-blue-500 to-cyan-600",
        overview:
          "Our Compliance Management feature automates the complex process of maintaining compliance with multiple regulatory frameworks. Stay audit-ready 24/7 with continuous monitoring, automated evidence collection, and real-time compliance dashboards.",
        keyBenefits: [
          "Multi-framework support (50+ frameworks)",
          "Automated compliance mapping and gap analysis",
          "Real-time compliance score tracking",
          "Automated evidence collection and storage",
          "One-click audit report generation",
          "Continuous monitoring and alerting"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Select Applicable Frameworks",
            description:
              "Choose the regulatory frameworks that apply to your organization and AI systems.",
            details: [
              "Browse 50+ pre-configured frameworks",
              "Filter by region, industry, or AI-specific",
              "Select multiple frameworks simultaneously",
              "Custom framework creation available"
            ]
          },
          {
            step: 2,
            title: "Automated Requirement Mapping",
            description:
              "The platform automatically maps framework requirements to your AI systems and controls.",
            details: [
              "Intelligent requirement decomposition",
              "Control-to-requirement mapping",
              "Obligation identification",
              "Gap analysis and prioritization"
            ]
          },
          {
            step: 3,
            title: "Evidence Collection",
            description:
              "Collect and organize evidence for each compliance requirement automatically or manually.",
            details: [
              "Automated evidence gathering from systems",
              "Manual evidence upload and attachment",
              "Version control and audit trail",
              "Evidence validation and approval workflows"
            ]
          },
          {
            step: 4,
            title: "Continuous Compliance Monitoring",
            description:
              "Real-time monitoring ensures you stay compliant as systems and regulations change.",
            details: [
              "Real-time compliance score calculation",
              "Automated alerts for compliance drift",
              "Regular framework update notifications",
              "Dashboard with compliance status"
            ]
          }
        ],
        results: [
          {
            title: "Always Audit-Ready",
            description:
              "Generate comprehensive audit reports instantly with all required evidence and documentation.",
            metrics: "95% reduction in audit preparation time"
          },
          {
            title: "Multi-Framework Compliance",
            description:
              "Maintain compliance across multiple frameworks simultaneously without duplication of effort.",
            metrics: "Support for 50+ regulatory frameworks"
          },
          {
            title: "Proactive Compliance",
            description:
              "Continuous monitoring identifies compliance issues before they become violations.",
            metrics: "90% of issues detected and resolved proactively"
          },
          {
            title: "Cost Savings",
            description:
              "Automation reduces the need for expensive consultants and manual compliance work.",
            metrics: "70% reduction in compliance costs"
          }
        ],
        useCases: [
          "SOC2 compliance for AI systems",
          "GDPR data protection compliance",
          "ISO 27001 information security",
          "EU AI Act readiness",
          "Industry-specific regulatory compliance"
        ]
      },
      {
        id: "risk-management",
        name: "Risk Assessment & Management",
        tagline: "Identify and mitigate AI risks proactively",
        description:
          "Comprehensive risk identification, assessment, scoring, and mitigation for responsible AI deployment.",
        icon: AlertCircle,
        gradient: "from-red-500 to-orange-600",
        overview:
          "Our Risk Management feature provides a structured approach to identifying, assessing, and mitigating AI-related risks. From bias and fairness to security and operational risks, manage all aspects of AI risk in one integrated platform.",
        keyBenefits: [
          "Comprehensive AI risk taxonomy",
          "Automated risk identification and scoring",
          "Business impact analysis",
          "Risk mitigation tracking and workflows",
          "Incident management and response",
          "Risk reporting and dashboards"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Risk Identification",
            description:
              "Systematically identify potential risks associated with your AI systems.",
            details: [
              "Automated risk scanning based on AI characteristics",
              "Risk library with 200+ common AI risks",
              "Custom risk creation and categorization",
              "Integration with threat intelligence feeds"
            ]
          },
          {
            step: 2,
            title: "Risk Assessment & Scoring",
            description:
              "Evaluate the likelihood and impact of identified risks with quantitative scoring.",
            details: [
              "Likelihood and impact assessment",
              "Automated risk score calculation",
              "Business impact analysis",
              "Risk prioritization matrix",
              "Inherent vs residual risk tracking"
            ]
          },
          {
            step: 3,
            title: "Mitigation Planning",
            description:
              "Develop and implement strategies to reduce or eliminate identified risks.",
            details: [
              "Mitigation strategy recommendations",
              "Control assignment and implementation",
              "Action plan creation and tracking",
              "Resource allocation and budgeting",
              "Timeline and milestone management"
            ]
          },
          {
            step: 4,
            title: "Monitoring & Reporting",
            description:
              "Continuously monitor risk levels and track the effectiveness of mitigation efforts.",
            details: [
              "Real-time risk dashboard",
              "Risk trend analysis",
              "KRI (Key Risk Indicator) tracking",
              "Incident correlation and response",
              "Executive risk reporting"
            ]
          }
        ],
        results: [
          {
            title: "Proactive Risk Prevention",
            description:
              "Identify and address risks before they materialize into incidents or violations.",
            metrics: "75% of risks mitigated before impact"
          },
          {
            title: "Reduced Incident Frequency",
            description:
              "Systematic risk management significantly reduces the frequency and severity of AI incidents.",
            metrics: "65% reduction in AI-related incidents"
          },
          {
            title: "Better Risk Visibility",
            description:
              "Centralized risk register provides complete visibility into all AI risks across the organization.",
            metrics: "100% risk visibility and traceability"
          },
          {
            title: "Regulatory Confidence",
            description:
              "Demonstrate responsible AI practices and risk management to regulators and stakeholders.",
            metrics: "Meets regulatory risk management requirements"
          }
        ],
        useCases: [
          "AI bias and fairness risk assessment",
          "AI security vulnerability management",
          "Operational AI risk mitigation",
          "Third-party AI risk evaluation",
          "AI incident management and response"
        ]
      },
      {
        id: "ai-assistant",
        name: "AI-Powered Assistant",
        tagline: "Get instant compliance guidance 24/7",
        description:
          "Intelligent chat interface that understands regulations, policies, and best practices for instant answers.",
        icon: MessageSquare,
        gradient: "from-green-500 to-emerald-600",
        overview:
          "Our AI-Powered Assistant is your 24/7 compliance and governance expert. Ask questions in natural language and get instant, accurate answers based on regulatory frameworks, internal policies, and industry best practices.",
        keyBenefits: [
          "Natural language query interface",
          "Context-aware responses",
          "Multi-framework knowledge base",
          "Document analysis and Q&A",
          "Session history and follow-ups",
          "Multi-language support"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Ask Your Question",
            description:
              "Type your compliance or governance question in natural language.",
            details: [
              "Natural language understanding",
              "Support for technical and non-technical queries",
              "Context from previous conversations",
              "Follow-up question support"
            ]
          },
          {
            step: 2,
            title: "AI Processing",
            description:
              "The assistant analyzes your question and searches relevant frameworks, policies, and documents.",
            details: [
              "Semantic search across knowledge base",
              "Framework and regulation analysis",
              "Best practice recommendations",
              "Document content extraction"
            ]
          },
          {
            step: 3,
            title: "Receive Detailed Answer",
            description:
              "Get a comprehensive answer with references to specific requirements and recommendations.",
            details: [
              "Clear, actionable responses",
              "Citations to specific regulations",
              "Step-by-step guidance",
              "Related resources and documentation"
            ]
          },
          {
            step: 4,
            title: "Take Action",
            description:
              "Implement recommendations or save insights for future reference.",
            details: [
              "Export conversation history",
              "Save important responses",
              "Share with team members",
              "Create action items from recommendations"
            ]
          }
        ],
        results: [
          {
            title: "Instant Expertise",
            description:
              "Get expert-level compliance guidance without waiting for consultant availability.",
            metrics: "Immediate answers to 95% of queries"
          },
          {
            title: "Faster Decision Making",
            description:
              "Quick access to regulatory information accelerates compliance and governance decisions.",
            metrics: "80% faster compliance decision-making"
          },
          {
            title: "Consistent Guidance",
            description:
              "Ensure all team members receive consistent, accurate compliance information.",
            metrics: "100% consistency in compliance guidance"
          },
          {
            title: "Reduced Compliance Errors",
            description:
              "AI-powered guidance reduces misinterpretation of complex regulations.",
            metrics: "60% reduction in compliance interpretation errors"
          }
        ],
        useCases: [
          "Quick regulatory requirement lookups",
          "Compliance implementation guidance",
          "Policy interpretation and clarification",
          "Best practice recommendations",
          "Document analysis and summarization"
        ]
      },
      {
        id: "control-management",
        name: "Control Management",
        tagline: "Implement and track security controls",
        description:
          "Centralized control library with implementation tracking, evidence linking, and effectiveness monitoring.",
        icon: Lock,
        gradient: "from-indigo-500 to-purple-600",
        overview:
          "Our Control Management feature provides a comprehensive control library and tracking system. Implement, monitor, and verify security and governance controls across all your AI systems with automated testing and evidence collection.",
        keyBenefits: [
          "200+ pre-configured controls",
          "Control-to-framework mapping",
          "Implementation status tracking",
          "Automated control testing",
          "Evidence collection and linking",
          "Effectiveness monitoring"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Select Applicable Controls",
            description:
              "Choose controls from our library or create custom controls for your AI systems.",
            details: [
              "Browse 200+ pre-configured controls",
              "Filter by framework, category, or type",
              "Create custom organizational controls",
              "Control inheritance and templates"
            ]
          },
          {
            step: 2,
            title: "Assign and Implement",
            description:
              "Assign controls to AI systems and track implementation progress.",
            details: [
              "Assign owners and implementers",
              "Set implementation timelines",
              "Define implementation steps",
              "Track progress and milestones",
              "Document implementation details"
            ]
          },
          {
            step: 3,
            title: "Collect Evidence",
            description:
              "Gather and attach evidence that demonstrates control implementation and effectiveness.",
            details: [
              "Upload supporting documents",
              "Link to automated test results",
              "Capture screenshots and artifacts",
              "Version control for evidence",
              "Approval workflows for evidence validation"
            ]
          },
          {
            step: 4,
            title: "Monitor Effectiveness",
            description:
              "Continuously monitor control effectiveness with automated testing and reporting.",
            details: [
              "Automated control testing where applicable",
              "Effectiveness scoring and metrics",
              "Exception and deviation tracking",
              "Regular control reviews and updates",
              "Control effectiveness dashboards"
            ]
          }
        ],
        results: [
          {
            title: "Comprehensive Control Coverage",
            description:
              "Ensure all AI systems have appropriate security and governance controls in place.",
            metrics: "100% control coverage for critical systems"
          },
          {
            title: "Reduced Security Incidents",
            description:
              "Effective control implementation significantly reduces security and compliance incidents.",
            metrics: "70% reduction in control-related incidents"
          },
          {
            title: "Audit Confidence",
            description:
              "Organized evidence and control documentation make audits smooth and successful.",
            metrics: "90% faster audit completion"
          },
          {
            title: "Continuous Improvement",
            description:
              "Regular effectiveness monitoring enables continuous improvement of control implementation.",
            metrics: "Continuous optimization of control effectiveness"
          }
        ],
        useCases: [
          "Security control implementation",
          "Access control management",
          "Data protection controls",
          "AI model governance controls",
          "Operational control monitoring"
        ]
      },
      {
        id: "framework-library",
        name: "Regulatory Framework Library",
        tagline: "Access global AI regulations in one place",
        description:
          "Complete library of 50+ global AI and data regulations with requirements, obligations, and updates.",
        icon: FileText,
        gradient: "from-violet-500 to-purple-600",
        overview:
          "Our Regulatory Framework Library provides access to comprehensive, up-to-date information on global AI regulations. From GDPR to the EU AI Act, access detailed requirements, obligations, and implementation guidance for all major frameworks.",
        keyBenefits: [
          "50+ regulatory frameworks",
          "Regular updates and amendments",
          "Detailed requirement breakdown",
          "Multi-language support",
          "Custom framework creation",
          "Cross-framework mapping"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Browse Framework Library",
            description:
              "Explore our comprehensive library of global regulations and standards.",
            details: [
              "Search by region, industry, or keyword",
              "Filter by AI-specific or general frameworks",
              "View framework summaries and overviews",
              "Check latest updates and versions"
            ]
          },
          {
            step: 2,
            title: "Review Requirements",
            description:
              "Dive deep into specific framework requirements and obligations.",
            details: [
              "Structured requirement hierarchy",
              "Detailed obligation descriptions",
              "Implementation guidance and examples",
              "Related controls and best practices"
            ]
          },
          {
            step: 3,
            title: "Map to Your Systems",
            description:
              "Map framework requirements to your AI systems and existing controls.",
            details: [
              "Automated applicability assessment",
              "Control-to-requirement mapping",
              "Gap identification",
              "Priority-based implementation roadmap"
            ]
          },
          {
            step: 4,
            title: "Stay Updated",
            description:
              "Receive notifications about framework updates and new regulations.",
            details: [
              "Automatic framework version tracking",
              "Amendment and update notifications",
              "Impact analysis for changes",
              "Subscription to specific frameworks"
            ]
          }
        ],
        results: [
          {
            title: "Regulatory Knowledge",
            description:
              "Access comprehensive information on all relevant regulations in one place.",
            metrics: "50+ frameworks with 10,000+ requirements"
          },
          {
            title: "Always Current",
            description:
              "Stay updated with the latest regulatory changes and amendments automatically.",
            metrics: "Real-time framework updates and notifications"
          },
          {
            title: "Faster Compliance Planning",
            description:
              "Structured requirements and mapping accelerate compliance implementation.",
            metrics: "60% faster compliance planning and execution"
          },
          {
            title: "Multi-Jurisdiction Support",
            description:
              "Manage compliance across multiple jurisdictions and frameworks simultaneously.",
            metrics: "Global compliance coverage"
          }
        ],
        useCases: [
          "EU AI Act compliance planning",
          "GDPR data protection assessment",
          "ISO standard implementation",
          "Industry-specific regulation compliance",
          "Cross-border AI deployment"
        ]
      },
      {
        id: "self-assessment",
        name: "Self-Assessment Tools",
        tagline: "Evaluate your AI governance maturity",
        description:
          "Guided assessment workflows for AI system evaluation, maturity tracking, and readiness scoring.",
        icon: CheckCircle,
        gradient: "from-teal-500 to-cyan-600",
        overview:
          "Our Self-Assessment Tools provide guided questionnaires and evaluation frameworks to assess your AI governance maturity, identify gaps, and track improvement over time. Perfect for readiness assessments and continuous improvement initiatives.",
        keyBenefits: [
          "Pre-built assessment templates",
          "Custom assessment creation",
          "Maturity scoring and benchmarking",
          "Gap analysis and recommendations",
          "Progress tracking over time",
          "Shareable assessment reports"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Select Assessment Type",
            description:
              "Choose from pre-built assessments or create a custom evaluation.",
            details: [
              "AI governance maturity assessment",
              "Framework readiness evaluation",
              "Risk assessment questionnaire",
              "Trust center assessment",
              "Custom assessment builder"
            ]
          },
          {
            step: 2,
            title: "Complete Assessment",
            description:
              "Answer questions with guidance and context for each item.",
            details: [
              "Guided question flow",
              "Context and examples for each question",
              "Evidence upload capability",
              "Collaborative assessment mode",
              "Save and resume functionality"
            ]
          },
          {
            step: 3,
            title: "Review Results",
            description:
              "Get detailed results with maturity scores and gap identification.",
            details: [
              "Overall maturity score",
              "Category-level scores",
              "Gap analysis and findings",
              "Benchmark comparison",
              "Visual score dashboards"
            ]
          },
          {
            step: 4,
            title: "Create Action Plan",
            description:
              "Generate prioritized recommendations and action items based on assessment results.",
            details: [
              "Prioritized recommendations",
              "Action item generation",
              "Resource and effort estimates",
              "Timeline suggestions",
              "Track improvement over time"
            ]
          }
        ],
        results: [
          {
            title: "Clear Maturity Baseline",
            description:
              "Establish a clear understanding of your current AI governance maturity level.",
            metrics: "Quantified maturity scores across all domains"
          },
          {
            title: "Identified Improvement Areas",
            description:
              "Pinpoint specific gaps and weaknesses that need attention.",
            metrics: "Detailed gap analysis with recommendations"
          },
          {
            title: "Measurable Progress",
            description:
              "Track improvement over time with periodic reassessments.",
            metrics: "Visual progress tracking and trend analysis"
          },
          {
            title: "Stakeholder Communication",
            description:
              "Share assessment results and improvement plans with stakeholders effectively.",
            metrics: "Professional assessment reports and presentations"
          }
        ],
        useCases: [
          "AI governance maturity assessment",
          "Regulatory readiness evaluation",
          "Third-party AI assessment",
          "Trust center reporting",
          "Continuous improvement tracking"
        ]
      },
      {
        id: "team-collaboration",
        name: "Team Collaboration",
        tagline: "Collaborate seamlessly with role-based access",
        description:
          "Role-based access control with team workspaces, permissions, and activity tracking.",
        icon: Users,
        gradient: "from-blue-500 to-indigo-600",
        overview:
          "Our Team Collaboration features enable seamless coordination between AI teams, compliance, risk management, and leadership. With role-based access control and team workspaces, everyone gets the right access to the right information.",
        keyBenefits: [
          "Role-based access control",
          "Team and group management",
          "Activity tracking and audit logs",
          "Single sign-on integration",
          "Multi-tenant architecture",
          "Collaboration workflows"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Define Roles and Permissions",
            description:
              "Set up roles with specific permissions tailored to your organization.",
            details: [
              "Pre-configured role templates",
              "Custom role creation",
              "Granular permission settings",
              "Role hierarchy and inheritance",
              "Permission matrices"
            ]
          },
          {
            step: 2,
            title: "Create Teams and Groups",
            description:
              "Organize users into teams and groups for efficient collaboration.",
            details: [
              "Department-based teams",
              "Project-based groups",
              "Cross-functional teams",
              "Dynamic group membership",
              "Team workspaces"
            ]
          },
          {
            step: 3,
            title: "Assign Users and Resources",
            description:
              "Assign users to roles and grant access to specific resources.",
            details: [
              "User provisioning and onboarding",
              "Resource-level access control",
              "Temporary access grants",
              "Access request and approval workflows",
              "Automated access reviews"
            ]
          },
          {
            step: 4,
            title: "Monitor and Audit",
            description:
              "Track user activity and maintain comprehensive audit logs.",
            details: [
              "Real-time activity monitoring",
              "Comprehensive audit trails",
              "Access review and certification",
              "Anomaly detection",
              "Compliance reporting"
            ]
          }
        ],
        results: [
          {
            title: "Secure Access Control",
            description:
              "Ensure users only have access to information and functions they need.",
            metrics: "100% compliance with least privilege principle"
          },
          {
            title: "Improved Collaboration",
            description:
              "Teams can work together effectively while maintaining appropriate boundaries.",
            metrics: "50% improvement in cross-team collaboration"
          },
          {
            title: "Audit-Ready Logs",
            description:
              "Comprehensive activity logs support compliance audits and security investigations.",
            metrics: "Complete audit trail for all user activities"
          },
          {
            title: "Simplified Administration",
            description:
              "Role-based approach simplifies user management at scale.",
            metrics: "80% reduction in access management overhead"
          }
        ],
        useCases: [
          "Multi-department AI governance",
          "Project-based access control",
          "Vendor and consultant access",
          "Executive and board reporting",
          "Compliance team collaboration"
        ]
      },
      {
        id: "analytics-insights",
        name: "Analytics & Insights",
        tagline: "Make data-driven governance decisions",
        description:
          "Real-time dashboards and analytics provide complete visibility into AI governance posture.",
        icon: BarChart3,
        gradient: "from-pink-500 to-rose-600",
        overview:
          "Our Analytics & Insights feature transforms governance data into actionable intelligence. Real-time dashboards, trend analysis, and custom reports enable data-driven decision making and demonstrate governance effectiveness to stakeholders.",
        keyBenefits: [
          "Real-time dashboards",
          "Custom report builder",
          "Trend analysis and forecasting",
          "Compliance scorecards",
          "Risk heat maps",
          "Export and sharing capabilities"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Access Dashboards",
            description:
              "View pre-built dashboards for compliance, risk, and governance metrics.",
            details: [
              "Executive summary dashboard",
              "Compliance status dashboard",
              "Risk metrics dashboard",
              "Control effectiveness dashboard",
              "Activity and usage dashboard"
            ]
          },
          {
            step: 2,
            title: "Analyze Trends",
            description:
              "Identify patterns and trends in your governance data over time.",
            details: [
              "Historical trend analysis",
              "Comparative analytics",
              "Predictive insights",
              "Anomaly detection",
              "Correlation analysis"
            ]
          },
          {
            step: 3,
            title: "Create Custom Reports",
            description:
              "Build custom reports tailored to your specific needs and stakeholders.",
            details: [
              "Drag-and-drop report builder",
              "Custom metrics and KPIs",
              "Filtering and segmentation",
              "Multiple visualization types",
              "Scheduled report generation"
            ]
          },
          {
            step: 4,
            title: "Share and Export",
            description:
              "Share insights with stakeholders through exports and presentations.",
            details: [
              "PDF and Excel export",
              "Shareable dashboard links",
              "Presentation mode",
              "Email distribution",
              "API access for integrations"
            ]
          }
        ],
        results: [
          {
            title: "Complete Visibility",
            description:
              "Get a comprehensive view of your AI governance posture at a glance.",
            metrics: "Real-time visibility across all governance dimensions"
          },
          {
            title: "Data-Driven Decisions",
            description:
              "Make informed decisions based on accurate, up-to-date governance data.",
            metrics: "95% confidence in governance decisions"
          },
          {
            title: "Stakeholder Confidence",
            description:
              "Demonstrate governance effectiveness with professional reports and dashboards.",
            metrics: "Improved stakeholder trust and transparency"
          },
          {
            title: "Continuous Improvement",
            description:
              "Trend analysis enables identification of improvement opportunities.",
            metrics: "Measurable improvement in governance metrics"
          }
        ],
        useCases: [
          "Executive governance reporting",
          "Board presentations",
          "Compliance status communication",
          "Risk trend analysis",
          "Performance monitoring"
        ]
      },
      {
        id: "trust-center-report",
        name: "Trust Center Report",
        tagline: "Build stakeholder confidence with transparency",
        description:
          "Create comprehensive trust center reports that demonstrate your organization's commitment to responsible AI and data governance.",
        icon: Award,
        gradient: "from-emerald-500 to-teal-600",
        overview:
          "Our Trust Center Report feature enables you to create beautiful, comprehensive reports that showcase your organization's AI governance practices, security measures, and compliance status. Build trust with customers, partners, and regulators by transparently communicating your responsible AI commitments and achievements.",
        keyBenefits: [
          "Professional, branded trust center pages",
          "Automated content updates from platform data",
          "Compliance certifications showcase",
          "Security and privacy highlights",
          "Public and private report modes",
          "Customizable templates and themes"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Configure Trust Center",
            description:
              "Set up your trust center with company information, branding, and content preferences.",
            details: [
              "Add company logo and branding",
              "Select information to include",
              "Choose report template and theme",
              "Configure public/private sections",
              "Set update frequency"
            ]
          },
          {
            step: 2,
            title: "Curate Content",
            description:
              "Select and organize the governance information you want to share with stakeholders.",
            details: [
              "Compliance status and certifications",
              "Security measures and controls",
              "Privacy practices and policies",
              "AI governance framework",
              "Third-party audits and assessments",
              "Contact and support information"
            ]
          },
          {
            step: 3,
            title: "Review and Publish",
            description:
              "Review your trust center report and publish it for stakeholders to access.",
            details: [
              "Preview report before publishing",
              "Approve content and data accuracy",
              "Set access permissions",
              "Generate shareable link",
              "Schedule automatic updates"
            ]
          },
          {
            step: 4,
            title: "Share and Maintain",
            description:
              "Share your trust center with stakeholders and keep it updated automatically.",
            details: [
              "Distribute to customers and partners",
              "Embed on website or portal",
              "Automatic data synchronization",
              "Track visitor analytics",
              "Regular content reviews"
            ]
          }
        ],
        results: [
          {
            title: "Increased Stakeholder Trust",
            description:
              "Transparent communication of governance practices builds confidence and trust.",
            metrics: "85% improvement in stakeholder confidence scores"
          },
          {
            title: "Competitive Advantage",
            description:
              "Demonstrate governance maturity and differentiate from competitors.",
            metrics: "Faster deal cycles with governance-conscious customers"
          },
          {
            title: "Reduced Due Diligence Time",
            description:
              "Pre-answer common governance questions, accelerating vendor assessments.",
            metrics: "70% reduction in repetitive governance inquiries"
          },
          {
            title: "Always Current",
            description:
              "Automated updates ensure your trust center always reflects current status.",
            metrics: "Real-time synchronization with platform data"
          }
        ],
        useCases: [
          "Customer due diligence support",
          "RFP response acceleration",
          "Partner security assessments",
          "Regulatory transparency",
          "Public relations and marketing"
        ]
      },
      {
        id: "responsible-ai-report",
        name: "Responsible AI Report",
        tagline: "Demonstrate responsible AI practices",
        description:
          "Generate comprehensive Responsible AI reports that document ethics, fairness, transparency, and accountability across all AI systems.",
        icon: Target,
        gradient: "from-violet-500 to-purple-600",
        overview:
          "Our Responsible AI Report feature helps you document and communicate your organization's commitment to ethical, fair, and transparent AI development and deployment. Create detailed reports that address key responsible AI principles, demonstrate due diligence, and meet emerging AI ethics requirements.",
        keyBenefits: [
          "Comprehensive RAI assessment framework",
          "Automated evidence collection",
          "Ethics and fairness analysis",
          "Transparency and explainability tracking",
          "Bias detection and mitigation documentation",
          "Stakeholder-ready presentation"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Define RAI Framework",
            description:
              "Establish your responsible AI principles and assessment criteria.",
            details: [
              "Select RAI framework (IEEE, OECD, EU, custom)",
              "Define ethical principles and values",
              "Set fairness and bias thresholds",
              "Establish transparency requirements",
              "Configure accountability measures"
            ]
          },
          {
            step: 2,
            title: "Assess AI Systems",
            description:
              "Evaluate each AI system against responsible AI criteria and principles.",
            details: [
              "Automated RAI assessment workflows",
              "Ethics review checklists",
              "Fairness and bias testing",
              "Transparency scoring",
              "Accountability verification",
              "Human oversight evaluation"
            ]
          },
          {
            step: 3,
            title: "Document Findings",
            description:
              "Capture detailed assessment results, findings, and mitigation strategies.",
            details: [
              "RAI scores and ratings",
              "Identified ethical concerns",
              "Bias and fairness metrics",
              "Transparency measures",
              "Mitigation plans and actions",
              "Improvement tracking"
            ]
          },
          {
            step: 4,
            title: "Generate Report",
            description:
              "Create comprehensive, professional reports for different audiences.",
            details: [
              "Executive summary generation",
              "Detailed technical analysis",
              "Stakeholder-specific views",
              "Visual dashboards and charts",
              "Compliance mapping",
              "Export in multiple formats"
            ]
          }
        ],
        results: [
          {
            title: "Ethical AI Deployment",
            description:
              "Systematically identify and address ethical concerns before AI deployment.",
            metrics: "90% of ethical issues resolved in development"
          },
          {
            title: "Bias Reduction",
            description:
              "Proactive bias detection and mitigation improves AI fairness and outcomes.",
            metrics: "60% reduction in biased AI outcomes"
          },
          {
            title: "Regulatory Readiness",
            description:
              "Meet emerging AI ethics regulations and responsible AI requirements.",
            metrics: "Full compliance with AI Act responsible AI provisions"
          },
          {
            title: "Stakeholder Confidence",
            description:
              "Demonstrate commitment to responsible AI with documented evidence.",
            metrics: "Improved brand reputation and stakeholder trust"
          }
        ],
        useCases: [
          "AI ethics board reporting",
          "EU AI Act compliance documentation",
          "Customer responsible AI inquiries",
          "Internal governance reviews",
          "Public accountability reporting"
        ]
      },
      {
        id: "document-management",
        name: "Document Management",
        tagline: "Secure, centralized document repository",
        description:
          "Store, organize, and share governance documents securely with version control and permissions.",
        icon: FileCheck,
        gradient: "from-cyan-500 to-blue-600",
        overview:
          "Our Document Management feature provides a secure, centralized repository for all your AI governance documents. From policies and procedures to evidence and reports, everything is organized, versioned, and accessible with appropriate permissions.",
        keyBenefits: [
          "Secure document storage",
          "Version control and history",
          "Access permissions and sharing",
          "Document preview and annotation",
          "Search and organization",
          "Collaboration tools"
        ],
        howItWorks: [
          {
            step: 1,
            title: "Upload Documents",
            description:
              "Upload governance documents individually or in bulk to the platform.",
            details: [
              "Drag-and-drop upload",
              "Bulk upload from folders",
              "Email-to-document integration",
              "Automated document ingestion",
              "Multiple format support"
            ]
          },
          {
            step: 2,
            title: "Organize and Categorize",
            description:
              "Organize documents with folders, tags, and metadata for easy retrieval.",
            details: [
              "Folder hierarchy",
              "Custom tagging system",
              "Metadata assignment",
              "Document relationships",
              "Search indexing"
            ]
          },
          {
            step: 3,
            title: "Set Permissions",
            description:
              "Control who can view, edit, or share each document with granular permissions.",
            details: [
              "User and group permissions",
              "Read, write, and delete controls",
              "Share link generation",
              "Expiring access",
              "Download restrictions"
            ]
          },
          {
            step: 4,
            title: "Collaborate and Track",
            description:
              "Collaborate on documents with version control and activity tracking.",
            details: [
              "Version history",
              "Change tracking",
              "Comments and annotations",
              "Approval workflows",
              "Audit trail"
            ]
          }
        ],
        results: [
          {
            title: "Centralized Repository",
            description:
              "All governance documents in one secure, accessible location.",
            metrics: "100% document centralization and accessibility"
          },
          {
            title: "Better Organization",
            description:
              "Easy to find and retrieve documents with powerful search and organization.",
            metrics: "90% faster document retrieval"
          },
          {
            title: "Version Control",
            description:
              "Never lose document history with automatic versioning and change tracking.",
            metrics: "Complete document history and audit trail"
          },
          {
            title: "Secure Sharing",
            description:
              "Share documents securely with internal and external stakeholders.",
            metrics: "Controlled, auditable document sharing"
          }
        ],
        useCases: [
          "Policy and procedure management",
          "Evidence repository",
          "Audit documentation",
          "Report archiving",
          "Stakeholder document sharing"
        ]
      }
    ],
    []
  );

  const feature = useMemo(
    () => allFeatures.find((f) => f.id === featureId),
    [allFeatures, featureId]
  );

  if (!feature) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Feature not found
          </h1>
          <button
            onClick={() => router.push("/docs")}
            className="text-tertiary-600 hover:underline dark:text-tertiary-400"
          >
            Back to Documentation
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = allFeatures.findIndex((f) => f.id === featureId);
  const prevFeature = currentIndex > 0 ? allFeatures[currentIndex - 1] : null;
  const nextFeature =
    currentIndex < allFeatures.length - 1
      ? allFeatures[currentIndex + 1]
      : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${feature.gradient}`}
      >
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
              className="mb-4 text-5xl font-extrabold text-white sm:text-6xl lg:text-7xl"
            >
              {feature.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 text-xl text-white/90 sm:text-2xl"
            >
              {feature.tagline}
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
              {feature.description}
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
        <div className="absolute bottom-0 left-1/2 z-20 mx-auto max-w-5xl -translate-x-1/2 pb-4">
          <nav className="flex items-center space-x-2 text-sm">
            <motion.button
              onClick={() => router.push("/")}
              className="flex items-center gap-1 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              whileHover={{ scale: 1.05 }}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </motion.button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <motion.button
              onClick={() => router.push("/docs")}
              className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              whileHover={{ scale: 1.05 }}
            >
              Documentation
            </motion.button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              {feature.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Overview Section */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-12 dark:border-gray-800 dark:bg-gray-900 md:py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                Overview
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Everything you need to know about this feature
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 rounded-2xl bg-gray-50 p-6 dark:bg-gray-900 md:p-8"
            >
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                {feature.overview}
              </p>
            </motion.div>

            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Key Benefits
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {feature.keyBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
                  >
                    <p className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                      {benefit}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white px-4 py-12 dark:bg-gray-950 md:py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              How It Works
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Simple steps to get started
            </p>
          </motion.div>

          <div className="space-y-5">
            {feature.howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 md:p-6"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-lg font-bold text-white shadow-lg`}
                  >
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-gray-100 pt-4 dark:border-gray-700">
                  {step.details.map((detail, detailIndex) => (
                    <motion.div
                      key={detailIndex}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + detailIndex * 0.03 }}
                      className="flex items-start gap-2"
                    >
                      <div
                        className={`mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gradient-to-br ${feature.gradient}`}
                      />
                      <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {detail}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-12 dark:border-gray-800 dark:bg-gray-900 md:py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Expected Results
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Measurable outcomes you can achieve
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            {feature.results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
              >
                <div
                  className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5`}
                >
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">
                  {result.title}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {result.description}
                </p>
                {result.metrics && (
                  <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-900">
                    <p
                      className={`bg-gradient-to-r text-xs font-semibold ${feature.gradient} bg-clip-text text-transparent`}
                    >
                      {result.metrics}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-white px-4 py-12 dark:bg-gray-950 md:py-16">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Use Cases
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-world applications for your organization
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {feature.useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                whileHover={{ y: -2 }}
                className="rounded-xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {useCase}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-12 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            {prevFeature ? (
              <motion.button
                onClick={() => router.push(`/docs/${prevFeature.id}`)}
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 rounded-2xl bg-gray-50 p-4 transition-all hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Previous
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {prevFeature.name}
                  </p>
                </div>
              </motion.button>
            ) : (
              <div />
            )}

            <motion.button
              onClick={() => router.push("/docs")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl bg-gradient-to-r ${feature.gradient} px-6 py-3 font-semibold text-white shadow-lg transition-shadow hover:shadow-xl`}
            >
              All Features
            </motion.button>

            {nextFeature ? (
              <motion.button
                onClick={() => router.push(`/docs/${nextFeature.id}`)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 rounded-2xl bg-gray-50 p-4 transition-all hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Next
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {nextFeature.name}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            ) : (
              <div />
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FeatureDetail;
