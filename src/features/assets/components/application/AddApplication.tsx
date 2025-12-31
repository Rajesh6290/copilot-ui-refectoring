import CustomButton from "@/shared/core/CustomButton";
import useMutation from "@/shared/hooks/useMutation";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogTitle } from "@mui/material";
import { Field, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { AlertCircle, CheckCircle2, Edit, Info, Plus, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";
import { NewApplicationValidationSchema } from "../../schema/application.schema";

const CustomMultiSelect = dynamic(
  () => import("@/shared/core/CustomMultiSelect"),
  {
    ssr: false
  }
);

interface ApplicationTemplate {
  id: string;
  name: string;
  ux_description: string;
  common_examples: string[];
  governance_rationale: string;
  ai_behaviors: string[];
  ux_note: string;
}

interface ApplicationFormValues {
  name: string;
  version: string;
  purpose: string;
  owner_name: string;
  use_case_type: string;
  department?: string;
  sensitivity?: string;
  compliance_status?: string[];
  risk_level?: string;
  deployment_context?: string;
  intended_users?: string;
  ai_behaviors?: string[];
  automation_level?: string;
  decision_binding?: boolean | undefined;
  human_oversight_required?: boolean | undefined;
  oversight_type?: string;
  oversight_role?: string;
}

// Existing options
const useCaseOptions = [
  { value: "transportation", label: "Transportation" },
  { value: "financial_services", label: "Financial Services" },
  { value: "healthcare_diagnostics", label: "Healthcare Diagnostics" },
  { value: "customer_support", label: "Customer Support" },
  { value: "speech_recognition_systems", label: "Speech Recognition Systems" },
  { value: "industrial_automation", label: "Industrial Automation" },
  { value: "marketing_and_advertising", label: "Marketing & Advertising" },
  { value: "ecommerce_and_retail", label: "E-commerce & Retail" },
  { value: "legal_document_review", label: "Legal Document Review" },
  { value: "agriculture", label: "Agriculture" },
  {
    value: "energy_management_and_utilities",
    label: "Energy Management & Utilities"
  },
  { value: "supply_chain_optimization", label: "Supply Chain Optimization" },
  {
    value: "fraud_detection_in_finance_and_security",
    label: "Fraud Detection in Finance & Security"
  },
  {
    value: "cybersecurity_and_threat_detection",
    label: "Cybersecurity & Threat Detection"
  },
  {
    value: "urban_planning_and_smart_infrastructure",
    label: "Urban Planning & Smart Infrastructure"
  },
  { value: "drug_discovery", label: "Drug Discovery" },
  { value: "education_and_edtech", label: "Education & EdTech" },
  {
    value: "retail_pricing_optimization",
    label: "Retail Pricing Optimization"
  },
  { value: "environmental_monitoring", label: "Environmental Monitoring" },
  { value: "mental_health_support", label: "Mental Health Support" },
  { value: "autonomous_drones", label: "Autonomous Drones" },
  {
    value: "fake_news_detection_in_media_and_journalism",
    label: "Fake News Detection in Media & Journalism"
  },
  {
    value: "insurance_claims_processing",
    label: "Insurance Claims Processing"
  },
  {
    value: "law_enforcement_and_public_safety",
    label: "Law Enforcement & Public Safety"
  },
  { value: "biometrics_system", label: "Biometrics System" },
  { value: "image_generation", label: "Image Generation" },
  { value: "robotics", label: "Robotics" },
  { value: "others", label: "Others" }
];

const complianceStatusOptions = [
  { value: "ccpa_compliant", label: "CCPA Compliant" },
  { value: "hipaa_compliant", label: "HIPAA Compliant" },
  { value: "iso_27001", label: "ISO 27001" },
  { value: "soc_2", label: "SOC 2" },
  { value: "not_assessed", label: "Not Assessed" },
  { value: "euro_ai", label: "EURO AI" },
  { value: "nist", label: "NIST" },
  { value: "internally_evaluated", label: "Internally Evaluated" }
];

// New TRACE-RAI options
const aiBehaviorOptions = [
  {
    value: "content_generation",
    label: "Content Generation",
    tooltip:
      "Creates new text, images, or other content (e.g., writing articles or generating summaries)."
  },
  {
    value: "classification",
    label: "Classification",
    tooltip:
      "Assigns inputs to predefined categories (e.g., spam vs. non-spam emails)."
  },
  {
    value: "recommendation",
    label: "Recommendation",
    tooltip:
      "Suggests items or actions based on user data (e.g., product or content recommendations)."
  },
  {
    value: "decision_support",
    label: "Decision Support",
    tooltip:
      "Provides insights to help humans make decisions (e.g., highlighting risks or options)."
  },
  {
    value: "autonomous_action",
    label: "Autonomous Action",
    tooltip:
      "Takes actions automatically without human intervention (e.g., auto-approving routine requests)."
  },
  {
    value: "chat",
    label: "Chat",
    tooltip:
      "Engages in conversational interaction with users (e.g., customer support chatbots)."
  },
  {
    value: "rag",
    label: "RAG",
    tooltip:
      "Retrieves relevant data and generates answers from it (e.g., answering questions from internal docs)."
  },
  {
    value: "scoring",
    label: "Scoring",
    tooltip:
      "Assigns a numeric score to an input (e.g., credit risk or lead scoring)."
  },
  {
    value: "prediction",
    label: "Prediction",
    tooltip:
      "Forecasts future outcomes based on data (e.g., demand or churn prediction)."
  },
  {
    value: "optimization",
    label: "Optimization",
    tooltip:
      "Finds the best solution under constraints (e.g., optimizing routes or resource allocation)."
  },
  {
    value: "surveillance",
    label: "Surveillance",
    tooltip:
      "Monitors behavior or activity over time (e.g., detecting unusual system activity)."
  },
  {
    value: "profiling",
    label: "Profiling",
    tooltip:
      "Builds profiles about individuals or groups (e.g., user behavior or preference profiles)."
  },
  {
    value: "biometric_processing",
    label: "Biometric Processing",
    tooltip:
      "Processes biometric data for analysis (e.g., facial or voice recognition)."
  },
  {
    value: "identity_verification",
    label: "Identity Verification",
    tooltip:
      "Confirms a person’s identity (e.g., verifying a user during login or onboarding)."
  },
  {
    value: "decision_automation",
    label: "Decision Automation",
    tooltip:
      "Automatically makes and executes decisions (e.g., instant loan approval or denial)."
  },
  {
    value: "user_declared",
    label: "User Declared",
    tooltip:
      "Behavior explicitly defined by the user (e.g., custom or self-reported AI usage)."
  }
];

// Application Templates Data
const APPLICATION_TEMPLATES = {
  cross_industry: [
    {
      id: "CONVERSATIONAL_AI_CHATBOT",
      name: "Conversational AI / Chatbot",
      ux_description:
        "Your AI interacts directly with users through natural-language conversations, answering questions or responding to prompts.",
      common_examples: [
        "Customer support bots",
        "HR assistants",
        "IT helpdesks"
      ],
      governance_rationale:
        "Users often trust chatbots as authoritative. Incorrect or biased responses can directly mislead users.",
      ai_behaviors: ["CHAT", "CONTENT_GENERATION"],
      ux_note:
        "Select CHAT when the AI interacts conversationally with users. Select CONTENT_GENERATION only if the system generates original text responses rather than retrieving or quoting existing content. This does not imply authoritative advice or automated decision-making."
    },
    {
      id: "KNOWLEDGE_RAG_ASSISTANT",
      name: "Knowledge / RAG Assistant",
      ux_description:
        "Your AI retrieves information from internal documents or databases before responding.",
      common_examples: [
        "Policy assistants",
        "Enterprise search copilots",
        "FAQ bots"
      ],
      governance_rationale:
        "Errors may come from outdated or sensitive source documents, not just the model.",
      ai_behaviors: ["CHAT", "RAG"],
      ux_note:
        "Select CHAT when the AI interacts conversationally with users. Select RAG only if the system retrieves documents or records before generating responses. Errors may originate from source content rather than the model itself."
    },
    {
      id: "CONTENT_GENERATION_TOOL",
      name: "Content Generation Tool",
      ux_description:
        "Your AI generates original text such as emails, reports, summaries, or marketing content.",
      common_examples: [
        "Email drafting tools",
        "Report generators",
        "Marketing copy tools"
      ],
      governance_rationale:
        "Generated content may be reused externally, creating accuracy, legal, or reputational risk.",
      ai_behaviors: ["CONTENT_GENERATION"],
      ux_note:
        "Select CONTENT_GENERATION when the AI creates original text such as emails, reports, or summaries. This does not imply publishing, external use, or automated dissemination unless explicitly declared elsewhere."
    },
    {
      id: "RECOMMENDATION_ENGINE",
      name: "Recommendation Engine",
      ux_description:
        "Your AI suggests products, content, or next-best actions but does not execute them automatically.",
      common_examples: [
        "Product recommendations",
        "Content suggestions",
        "Decision support tools"
      ],
      governance_rationale:
        "Recommendations still influence decisions and may introduce bias or unfair outcomes.",
      ai_behaviors: ["RECOMMENDATION", "SCORING"],
      ux_note:
        "Select RECOMMENDATION when the AI suggests products, content, or actions. Select SCORING only if items or users are ranked or assigned numeric scores. This does not imply automated execution or decision-making."
    },
    {
      id: "PREDICTIVE_ANALYTICS",
      name: "Predictive Analytics",
      ux_description:
        "Your AI forecasts future outcomes or trends using historical or real-time data.",
      common_examples: [
        "Demand forecasting",
        "Churn prediction",
        "Risk forecasting"
      ],
      governance_rationale:
        "Predictions can silently degrade over time and mislead decisions if not monitored.",
      ai_behaviors: ["PREDICTION"],
      ux_note:
        "Select PREDICTION when the AI forecasts future outcomes, trends, or likelihoods. This does not imply automated decisions or actions unless explicitly selected elsewhere."
    },
    {
      id: "CLASSIFICATION_SYSTEM",
      name: "Classification System",
      ux_description:
        "Your AI assigns labels or categories to inputs such as documents, transactions, or user activity.",
      common_examples: [
        "Spam detection",
        "Document tagging",
        "Content moderation"
      ],
      governance_rationale:
        "Incorrect labels can lead to unfair treatment or downstream decision errors.",
      ai_behaviors: ["CLASSIFICATION"],
      ux_note:
        "Select CLASSIFICATION when the AI assigns labels or categories to inputs. Labeling does not imply enforcement, removal, or automated action unless such behaviors are explicitly declared."
    },
    {
      id: "SCORING_RANKING_ENGINE",
      name: "Scoring / Ranking Engine",
      ux_description:
        "Your AI assigns numeric scores or ranks people, items, or events to indicate priority or risk.",
      common_examples: ["Credit scoring", "Candidate ranking", "Risk scoring"],
      governance_rationale:
        "Scores often directly influence approvals, rejections, or prioritization — even with human review.",
      ai_behaviors: ["SCORING"],
      ux_note:
        "Select SCORING when the AI assigns numeric scores or ranks items, people, or events. Scoring alone does not imply automated approval, rejection, or prioritization unless explicitly declared."
    },
    {
      id: "OPTIMIZATION_ENGINE",
      name: "Optimization Engine",
      ux_description:
        "Your AI optimizes objectives by balancing trade-offs under defined constraints.",
      common_examples: [
        "Pricing optimization",
        "Logistics optimization",
        "Resource allocation"
      ],
      governance_rationale:
        "Optimizing the wrong objective can cause systemic harm despite good model performance.",
      ai_behaviors: ["OPTIMIZATION"],
      ux_note:
        "Select OPTIMIZATION only if the AI actively optimizes objectives or trade-offs under defined constraints. Optimization does not imply automated execution of decisions unless explicitly selected elsewhere."
    },
    {
      id: "AUTONOMOUS_AI_AGENT",
      name: "Autonomous AI Agent",
      ux_description:
        "Your AI executes actions or calls tools automatically without human approval each time.",
      common_examples: ["Workflow automation agents", "Auto-remediation bots"],
      governance_rationale:
        "Autonomous actions increase operational, safety, and compliance risk if controls fail.",
      ai_behaviors: ["AUTONOMOUS_ACTION"],
      ux_note:
        "Select AUTONOMOUS_ACTION only if the AI executes actions or calls tools automatically without human approval each time. This represents a higher-risk capability and must be explicitly confirmed."
    },
    {
      id: "MONITORING_DETECTION_SYSTEM",
      name: "Monitoring / Detection System",
      ux_description:
        "Your AI continuously monitors activity and raises alerts or detects anomalies.",
      common_examples: [
        "Fraud monitoring",
        "Security monitoring",
        "Equipment monitoring"
      ],
      governance_rationale:
        "Continuous monitoring may introduce privacy, surveillance, or proportionality concerns.",
      ai_behaviors: ["SURVEILLANCE", "CLASSIFICATION"],
      ux_note:
        "Select SURVEILLANCE only if the AI continuously monitors activity or data streams over time. Select CLASSIFICATION when events or signals are labeled or flagged. Monitoring or alerting alone does not imply automated enforcement."
    },
    {
      id: "CUSTOM_BESPOKE_AI_SYSTEM",
      name: "Custom / Bespoke AI System",
      ux_description:
        "Your AI combines multiple or novel capabilities not covered above.",
      common_examples: ["Internal custom AI", "Experimental systems"],
      governance_rationale:
        "Mis-declaring behaviors here can hide high-risk capabilities and weaken governance.",
      ai_behaviors: ["USER_DECLARED"],
      ux_note:
        "Use this option only if your AI system combines multiple or novel capabilities not listed above. Behaviors must be explicitly declared to avoid under- or over-representing system capabilities."
    }
  ],
  industries: {
    "hr_and-workplace": [
      {
        id: "AI_RESUME_SCREENING",
        name: "AI Résumé Screening",
        ux_description:
          "Your AI screens résumés, ranks candidates, or automatically shortlists or rejects applicants based on predefined criteria.",
        common_examples: [
          "Resume parsing and ranking tools",
          "Automated candidate filtering systems"
        ],
        governance_rationale:
          "Hiring decisions directly affect people’s livelihoods. These systems are highly sensitive to bias, discrimination, and over-automation risks.",
        ai_behaviors: [
          "CLASSIFICATION",
          "SCORING",
          "PROFILING",
          "DECISION_AUTOMATION"
        ],
        ux_note:
          "Select DECISION_AUTOMATION only if the AI automatically shortlists, rejects, or advances candidates without human review. Select CLASSIFICATION or SCORING when the AI categorizes or ranks résumés. Select PROFILING when candidate attributes are used to build comparative profiles."
      },
      {
        id: "HIRING_RECOMMENDATION_AI",
        name: "Hiring Recommendation AI",
        ux_description:
          "Your AI suggests candidates to recruiters or hiring managers, but final decisions are made by humans.",
        common_examples: ["Top candidate suggestions", "Recruiter copilots"],
        governance_rationale:
          "Even recommendations can strongly influence hiring outcomes and introduce hidden bias.",
        ai_behaviors: ["RECOMMENDATION", "SCORING", "PROFILING"],
        ux_note:
          "Select RECOMMENDATION when the AI suggests candidates but humans make final decisions. Select SCORING or PROFILING if candidates are ranked, compared, or grouped using personal attributes. Do not select DECISION_AUTOMATION unless hiring actions are executed without human approval."
      },
      {
        id: "WORKFORCE_MONITORING_AI",
        name: "Workforce Monitoring AI",
        ux_description:
          "Your AI monitors employee behavior, activity, or productivity on an ongoing basis.",
        common_examples: [
          "Activity tracking tools",
          "Productivity monitoring systems"
        ],
        governance_rationale:
          "Continuous monitoring raises privacy, proportionality, and trust concerns for employees.",
        ai_behaviors: ["SURVEILLANCE", "PROFILING"],
        ux_note:
          "Select SURVEILLANCE only if employee monitoring is continuous or ongoing. Periodic analysis, reporting, or one-time reviews do not constitute surveillance. Select PROFILING when employee behavior or activity is analyzed over time to create individual or group profiles."
      },
      {
        id: "PERFORMANCE_ANALYTICS_AI",
        name: "Performance Analytics AI",
        ux_description:
          "Your AI analyzes employee data to identify trends, predict outcomes, or assess performance over time.",
        common_examples: [
          "Attrition risk analysis",
          "Performance forecasting tools"
        ],
        governance_rationale:
          "Performance analytics can indirectly influence promotions, terminations, or compensation decisions.",
        ai_behaviors: ["PREDICTION", "PROFILING"],
        ux_note:
          "Select PREDICTION when the AI forecasts outcomes such as attrition or performance trends. Select PROFILING when employee attributes or behaviors are used to create performance profiles. This does not imply automated employment decisions."
      }
    ],

    financial_service_and_insurance: [
      {
        id: "CREDIT_SCORING_AI",
        name: "Credit Scoring AI",
        ux_description:
          "Your AI calculates credit risk scores for individuals or businesses based on financial and behavioral data.",
        common_examples: [
          "Consumer credit scoring",
          "SME risk scoring",
          "Internal risk models"
        ],
        governance_rationale:
          "Credit scores strongly influence approvals, pricing, and access to financial services, raising fairness and explainability concerns.",
        ai_behaviors: ["SCORING", "PREDICTION"],
        ux_note:
          "Select SCORING when the AI produces a numeric credit or risk score. Select PREDICTION only if it estimates likelihood of default or future risk outcomes. This application does not imply automated approval or rejection unless DECISION_AUTOMATION is explicitly selected elsewhere."
      },
      {
        id: "LOAN_UNDERWRITING_AI",
        name: "Loan Underwriting AI",
        ux_description:
          "Your AI automatically approves, rejects, or routes loan applications based on predefined rules or models.",
        common_examples: [
          "Mortgage underwriting",
          "Personal loan approval systems"
        ],
        governance_rationale:
          "Automated underwriting directly affects financial outcomes and is typically considered high-risk due to over-automation and bias exposure.",
        ai_behaviors: ["SCORING", "DECISION_AUTOMATION"],
        ux_note:
          "Select DECISION_AUTOMATION only if the AI automatically approves, rejects, or routes applications without human approval. Select SCORING when the AI calculates risk or eligibility scores used as inputs to decisions."
      },
      {
        id: "FRAUD_DETECTION_SYSTEM",
        name: "Fraud Detection System",
        ux_description:
          "Your AI monitors transactions or behavior to detect anomalous or potentially fraudulent activity.",
        common_examples: [
          "Card fraud detection",
          "Transaction monitoring",
          "AML alerts"
        ],
        governance_rationale:
          "Continuous monitoring can lead to false positives that impact customers and requires strong oversight and auditability.",
        ai_behaviors: ["CLASSIFICATION", "SURVEILLANCE"],
        ux_note:
          "Select SURVEILLANCE only if the AI continuously monitors transactions or behavior over time. Select CLASSIFICATION when transactions or events are labeled as fraudulent or non-fraudulent. Alerting does not imply automated enforcement actions unless explicitly declared."
      },
      {
        id: "INSURANCE_PRICING_AI",
        name: "Insurance Pricing AI",
        ux_description:
          "Your AI calculates insurance premiums by optimizing risk, pricing, and profitability factors.",
        common_examples: [
          "Auto insurance pricing",
          "Health or property premium calculation"
        ],
        governance_rationale:
          "Pricing models can embed hidden bias and optimize objectives that disadvantage certain customer groups.",
        ai_behaviors: ["SCORING", "OPTIMIZATION"],
        ux_note:
          "Select SCORING when the AI calculates premiums or pricing factors. Select OPTIMIZATION only if the system actively optimizes pricing objectives. This application does not imply automated policy issuance or denial unless explicitly declared."
      },
      {
        id: "CLAIMS_PROCESSING_AI",
        name: "Claims Processing AI",
        ux_description:
          "Your AI automatically processes, approves, or denies insurance claims.",
        common_examples: [
          "Automated claims approval",
          "Fast-track claim systems"
        ],
        governance_rationale:
          "Automated claim decisions directly affect customer payouts and trust, making oversight and explainability critical.",
        ai_behaviors: ["DECISION_AUTOMATION"],
        ux_note:
          "Select DECISION_AUTOMATION only if the AI automatically approves or denies claims without human review. If claims are reviewed or overridden by humans, do not select decision automation."
      },
      {
        id: "FINANCIAL_ADVISORY_AI",
        name: "Financial Advisory AI",
        ux_description:
          "Your AI provides financial guidance or recommendations to customers or advisors.",
        common_examples: ["Robo-advisors", "Investment recommendation tools"],
        governance_rationale:
          "Financial recommendations can influence major life decisions and create suitability or conflict-of-interest risks.",
        ai_behaviors: ["RECOMMENDATION"],
        ux_note:
          "Select RECOMMENDATION when the AI provides financial guidance or suggested actions. This does not imply suitability determination or automated execution unless additional behaviors are explicitly selected."
      }
    ],

    healthcare_and_lifescience: [
      {
        id: "MEDICAL_TRIAGE_AI",
        name: "Medical Triage AI",
        ux_description:
          "Your AI prioritizes or categorizes patient cases based on urgency, risk, or predicted outcomes.",
        common_examples: [
          "Emergency department triage tools",
          "Symptom-checker prioritization systems"
        ],
        governance_rationale:
          "Triage decisions can affect timeliness of care and patient outcomes, making accuracy and bias critical.",
        ai_behaviors: ["CLASSIFICATION", "PREDICTION"],
        ux_note:
          "This application type is for guidance only. Select CLASSIFICATION if the AI categorizes urgency or priority, and PREDICTION only if it estimates risk, severity, or outcomes. Behaviors must reflect what the AI actually does, not how results are used operationally."
      },
      {
        id: "CLINICAL_DECISION_SUPPORT",
        name: "Clinical Decision Support",
        ux_description:
          "Your AI assists clinicians by providing recommendations, alerts, or suggested treatment options.",
        common_examples: [
          "Drug interaction alerts",
          "Treatment recommendation tools"
        ],
        governance_rationale:
          "Even advisory systems can strongly influence clinical judgment and must be reliable and explainable.",
        ai_behaviors: ["RECOMMENDATION", "PREDICTION"],
        ux_note:
          "Even when advisory, decision support systems can strongly influence care. Select RECOMMENDATION if the AI suggests actions or options, and PREDICTION only if it generates likelihoods or risk estimates. This does not imply automated clinical decision-making."
      },
      {
        id: "DIAGNOSTIC_AI",
        name: "Diagnostic AI",
        ux_description:
          "Your AI supports or performs diagnostic classification based on clinical data or images.",
        common_examples: [
          "Radiology image analysis",
          "Pathology classification tools"
        ],
        governance_rationale:
          "Diagnostic errors can directly impact patient safety and clinical outcomes.",
        ai_behaviors: ["CLASSIFICATION", "PREDICTION"],
        ux_note:
          "Diagnostic systems typically involve CLASSIFICATION. Select PREDICTION only if the AI generates confidence scores, probabilities, or likelihood estimates. Selecting this application type does not imply autonomous diagnosis or replacement of clinical judgment."
      },
      {
        id: "PATIENT_MONITORING_AI",
        name: "Patient Monitoring AI",
        ux_description:
          "Your AI continuously monitors patient data to detect changes, deterioration, or anomalies.",
        common_examples: [
          "ICU monitoring systems",
          "Remote patient monitoring platforms"
        ],
        governance_rationale:
          "Continuous monitoring raises safety, alert fatigue, and privacy considerations.",
        ai_behaviors: ["SURVEILLANCE"],
        ux_note:
          "Select SURVEILLANCE only if the AI continuously monitors patient data streams over time. One-off analysis, batch evaluation, or periodic reporting does not constitute surveillance. Monitoring alone does not imply automated decision-making."
      },
      {
        id: "MEDICAL_CODING_AI",
        name: "Medical Coding AI",
        ux_description:
          "Your AI assigns clinical or billing codes based on medical records or documentation.",
        common_examples: ["ICD coding automation", "Claims coding assistants"],
        governance_rationale:
          "Incorrect coding can lead to billing errors, compliance issues, or downstream care impacts.",
        ai_behaviors: ["CLASSIFICATION"],
        ux_note:
          "Coding systems typically involve CLASSIFICATION of records or text. This application does not imply clinical decision-making or automated billing execution unless such behaviors are explicitly selected elsewhere."
      }
    ],

    govt_and_public_sector_ai_app: [
      {
        id: "ELIGIBILITY_DETERMINATION_AI",
        name: "Eligibility Determination AI",
        ux_description:
          "Your AI determines whether individuals qualify for public benefits, services, or programs based on defined criteria.",
        common_examples: [
          "Welfare eligibility checks",
          "Housing assistance screening",
          "Student aid qualification"
        ],
        governance_rationale:
          "Automated eligibility decisions directly affect access to essential public services and raise fairness, transparency, and accountability concerns.",
        ai_behaviors: ["SCORING", "DECISION_AUTOMATION"],
        ux_note:
          "Select DECISION_AUTOMATION only if the AI automatically approves or denies eligibility without human review. Select SCORING when the AI calculates eligibility or priority scores used as inputs to decisions."
      },
      {
        id: "CITIZEN_SERVICE_CHATBOT",
        name: "Citizen Service Chatbot",
        ux_description:
          "Your AI answers questions from the public by providing information about government services, policies, or procedures.",
        common_examples: [
          "Government helpdesk bots",
          "Public information assistants"
        ],
        governance_rationale:
          "Citizens may rely on responses as authoritative; incorrect or misleading answers can undermine trust and access to services.",
        ai_behaviors: ["CHAT", "RAG"],
        ux_note:
          "Select CHAT when the AI responds conversationally to citizen queries. Select RAG only if the system retrieves documents, policies, or records to generate responses. This application does not imply policy interpretation or authoritative decision-making."
      },
      {
        id: "GOVERNMENT_RISK_PROFILING",
        name: "Government Risk Profiling",
        ux_description:
          "Your AI analyzes data to profile individuals or groups for risk, priority, or intervention purposes.",
        common_examples: [
          "Fraud risk profiling",
          "Compliance risk analysis",
          "Public safety risk assessment"
        ],
        governance_rationale:
          "Profiling can significantly impact civil rights and must be carefully governed to avoid discrimination or misuse.",
        ai_behaviors: ["PROFILING", "PREDICTION"],
        ux_note:
          "Select PROFILING when the AI creates individual or group profiles for risk, priority, or intervention purposes. Select PREDICTION only if the system estimates likelihoods or future outcomes. This does not imply enforcement or automated action unless explicitly declared."
      },
      {
        id: "PUBLIC_SURVEILLANCE_SYSTEM",
        name: "Public Surveillance System",
        ux_description:
          "Your AI monitors public spaces or activity to detect events, behaviors, or anomalies.",
        common_examples: [
          "CCTV analytics",
          "Crowd monitoring systems",
          "Traffic surveillance"
        ],
        governance_rationale:
          "Surveillance systems raise serious privacy, proportionality, and oversight concerns, especially when deployed at scale.",
        ai_behaviors: ["SURVEILLANCE"],
        ux_note:
          "Select SURVEILLANCE only if monitoring of public spaces or activity is continuous or ongoing. Event detection, alerting, or analysis alone does not imply automated enforcement unless explicitly declared."
      }
    ],

    "retial marketting and media ai application": [
      {
        id: "PERSONALIZATION_AI",
        name: "Personalization AI",
        ux_description:
          "Your AI tailors content, products, or offers to individual users based on their behavior, preferences, or inferred attributes.",
        common_examples: [
          "Personalized product recommendations",
          "Customized content feeds",
          "Targeted offers"
        ],
        governance_rationale:
          "Personalization relies on profiling individuals and can introduce bias, manipulation, or unfair treatment if not governed properly.",
        ai_behaviors: ["PROFILING", "RECOMMENDATION"],
        ux_note:
          "Select PROFILING when the AI analyzes user attributes or behavior to create individual profiles. Select RECOMMENDATION when the AI suggests content, products, or offers. This does not imply automated decisions beyond content presentation unless explicitly declared."
      },
      {
        id: "ADVERTISING_TARGETING_AI",
        name: "Advertising Targeting AI",
        ux_description:
          "Your AI optimizes which advertisements are shown to users based on predicted engagement or conversion.",
        common_examples: [
          "Programmatic ad targeting",
          "Audience segmentation tools"
        ],
        governance_rationale:
          "Ad targeting can exploit sensitive attributes or reinforce harmful stereotypes if optimization goals are not well governed.",
        ai_behaviors: ["PROFILING", "OPTIMIZATION"],
        ux_note:
          "Select PROFILING when users are grouped or segmented based on attributes or behavior. Select OPTIMIZATION only if the system actively optimizes targeting objectives such as engagement or conversion. This does not imply automated exclusion or enforcement unless explicitly declared."
      },
      {
        id: "CONTENT_MODERATION_AI",
        name: "Content Moderation AI",
        ux_description:
          "Your AI classifies, flags, or removes content based on defined policies or rules.",
        common_examples: [
          "Hate speech detection",
          "Spam filtering",
          "Policy enforcement systems"
        ],
        governance_rationale:
          "Incorrect moderation decisions can suppress legitimate expression or fail to remove harmful content.",
        ai_behaviors: ["CLASSIFICATION"],
        ux_note:
          "Select CLASSIFICATION when content is labeled, flagged, or categorized according to policy. Content removal or escalation does not imply autonomous enforcement unless explicitly selected elsewhere."
      },
      {
        id: "SEARCH_FEED_RANKING",
        name: "Search / Feed Ranking",
        ux_description:
          "Your AI ranks search results, product listings, or content feeds to determine what users see first.",
        common_examples: [
          "E-commerce search ranking",
          "Social media feeds",
          "News ranking algorithms"
        ],
        governance_rationale:
          "Ranking systems strongly shape visibility and influence user behavior, even without explicit automation.",
        ai_behaviors: ["SCORING", "OPTIMIZATION"],
        ux_note:
          "Select SCORING when items are assigned relevance or ranking scores. Select OPTIMIZATION only if the system actively optimizes ranking objectives. Ranking alone does not imply automated decision-making beyond ordering or display."
      }
    ],

    security_identity_and_trust: [
      {
        id: "BIOMETRIC_AUTHENTICATION",
        name: "Biometric Authentication",
        ux_description:
          "Your AI verifies a person’s identity using biometric characteristics such as face, voice, or other biological signals.",
        common_examples: [
          "Face recognition login",
          "Voice authentication for call centers",
          "Biometric access control"
        ],
        governance_rationale:
          "Biometric data is highly sensitive and difficult to revoke if compromised, raising significant privacy, accuracy, and misuse risks.",
        ai_behaviors: ["BIOMETRIC_PROCESSING", "IDENTITY_VERIFICATION"],
        ux_note:
          "Select BIOMETRIC_PROCESSING when the AI processes biometric signals such as facial images or voiceprints. Select IDENTITY_VERIFICATION when the system verifies or authenticates an individual’s identity. This application does not imply continuous monitoring or surveillance unless explicitly selected elsewhere."
      },
      {
        id: "IDENTITY_VERIFICATION_KYC",
        name: "Identity Verification / KYC",
        ux_description:
          "Your AI confirms an individual’s identity using documents, signals, or behavioral checks.",
        common_examples: [
          "Digital KYC onboarding",
          "Document verification",
          "Liveness detection"
        ],
        governance_rationale:
          "Identity verification errors can lead to fraud, exclusion, or regulatory breaches and require strong auditability.",
        ai_behaviors: ["IDENTITY_VERIFICATION"],
        ux_note:
          "Select IDENTITY_VERIFICATION when the AI verifies identity using documents, signals, or checks. This does not imply biometric processing or automated approval unless those behaviors are explicitly selected."
      },
      {
        id: "CYBER_THREAT_DETECTION",
        name: "Cyber Threat Detection",
        ux_description:
          "Your AI monitors systems or activity to detect potential security threats or anomalies.",
        common_examples: [
          "Intrusion detection systems",
          "Malware detection",
          "Security event monitoring"
        ],
        governance_rationale:
          "False positives can disrupt operations, while missed threats can cause serious security incidents.",
        ai_behaviors: ["CLASSIFICATION", "SURVEILLANCE"],
        ux_note:
          "Select SURVEILLANCE only if the AI continuously monitors systems or activity over time. Select CLASSIFICATION when events or signals are labeled as benign or malicious. Detection or alerting does not imply automated response or enforcement unless explicitly declared."
      }
    ],

    supply_chain_manufactoruing_and_energy: [
      {
        id: "DEMAND_FORECASTING_AI",
        name: "Demand Forecasting AI",
        ux_description:
          "Your AI predicts future demand for products, materials, or resources based on historical and real-time data.",
        common_examples: [
          "Sales forecasting",
          "Inventory demand planning",
          "Capacity forecasting"
        ],
        governance_rationale:
          "Inaccurate forecasts can cause shortages, waste, financial loss, or downstream operational disruption.",
        ai_behaviors: ["PREDICTION"],
        ux_note:
          "Select PREDICTION when the AI forecasts future demand, volumes, or usage. This application does not imply automated ordering, pricing, or operational execution unless additional behaviors are explicitly selected."
      },
      {
        id: "SUPPLY_CHAIN_OPTIMIZATION",
        name: "Supply Chain Optimization",
        ux_description:
          "Your AI optimizes logistics, routing, inventory levels, or supplier selection to improve efficiency or reduce cost.",
        common_examples: [
          "Route optimization",
          "Inventory balancing",
          "Supplier allocation"
        ],
        governance_rationale:
          "Optimization systems may prioritize cost or speed over resilience, fairness, or safety if objectives are misaligned.",
        ai_behaviors: ["OPTIMIZATION"],
        ux_note:
          "Select OPTIMIZATION only if the AI actively optimizes objectives such as cost, speed, or utilization. Optimization does not imply automated execution of logistics or procurement actions unless explicitly declared."
      },
      {
        id: "PREDICTIVE_MAINTENANCE",
        name: "Predictive Maintenance",
        ux_description:
          "Your AI predicts equipment failures or maintenance needs before breakdowns occur.",
        common_examples: [
          "Factory equipment monitoring",
          "Fleet maintenance prediction"
        ],
        governance_rationale:
          "Incorrect predictions can cause unexpected downtime or unnecessary maintenance, impacting safety and reliability.",
        ai_behaviors: ["PREDICTION"],
        ux_note:
          "Select PREDICTION when the AI forecasts likelihood or timing of equipment failure or maintenance needs. This does not imply automated shutdowns or maintenance actions unless explicitly selected elsewhere."
      },
      {
        id: "ENERGY_OPTIMIZATION_AI",
        name: "Energy Optimization AI",
        ux_description:
          "Your AI optimizes energy usage, load balancing, or consumption patterns across systems or facilities.",
        common_examples: [
          "Smart grid optimization",
          "Industrial energy management",
          "Demand response systems"
        ],
        governance_rationale:
          "Energy optimization errors can affect critical infrastructure, regulatory obligations, and environmental impact.",
        ai_behaviors: ["OPTIMIZATION"],
        ux_note:
          "Select OPTIMIZATION only if the AI actively optimizes energy usage, load, or consumption objectives. This application does not imply automated control of critical infrastructure unless such actions are explicitly declared."
      }
    ]
  }
};

const HOVER_TEXT = {
  deployment_context:
    "Where this AI application is currently deployed and used.",
  intended_users:
    "Who primarily uses this AI system — within the organization or outside it.",
  ai_behaviors: "What the AI system actually does when running in production.",
  automation_level:
    "How independently the AI operates, from advisory to highly automated.",
  decision_binding:
    "Does the AI's output directly trigger real-world actions without mandatory human approval?",
  human_oversight_required:
    "Is a human required to review or approve AI decisions?",
  oversight_type: "When and how human oversight is applied to AI decisions.",
  oversight_role:
    "Which role is accountable for overseeing AI behavior and decisions."
};

const Tooltip = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative ml-1 inline-block">
      <Info
        size={16}
        className="cursor-help text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute -left-2 top-6 z-50 w-64 rounded-md bg-gray-900 p-2 text-xs text-white shadow-lg">
          {text}
          <div className="absolute -top-1 left-2 h-2 w-2 rotate-45 transform bg-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const AddApplication = ({
  open,
  onClose,
  mutate,
  selectedApplication,
  isEditMode,
  setIsEditMode,
  setSelectedApplication
}: {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  selectedApplication: {
    doc_id?: string;
    name?: string;
    version?: string;
    purpose?: string;
    owner_name?: string;
    use_case_type?: string;
    department?: string;
    sensitivity?: string;
    compliance_status?: string[];
    risk_level?: string;
    deployment_context?: string;
    intended_users?: string;
    ai_behaviors?: string[];
    automation_level?: string;
    decision_binding?: boolean;
    human_oversight_required?: boolean;
    oversight_type?: string;
    oversight_role?: string;
  };
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  setSelectedApplication: (value: null) => void;
}) => {
  const { isLoading, mutation } = useMutation();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectionMode, setSelectionMode] = useState<
    "direct" | "template" | null
  >(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ApplicationTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleClose = () => {
    setCurrentStep(1);
    setIsEditMode(false);
    setSelectedApplication(null);
    setSelectionMode(null);
    setSelectedTemplate(null);
    setShowTemplateSelector(false);
    onClose();
  };

  // Validation for each step
  const validateStep = (
    step: number,
    values: ApplicationFormValues,
    errors: Record<string, string>
  ): boolean => {
    if (step === 1) {
      const step1Fields = [
        "name",
        "version",
        "owner_name",
        "use_case_type",
        "deployment_context",
        "intended_users",
        "purpose"
      ];
      const hasErrors = step1Fields.some((field) => errors[field]);
      const hasValues = step1Fields.every((field) => {
        const value = values[field as keyof ApplicationFormValues];
        return value !== "" && value !== undefined;
      });
      return !hasErrors && hasValues;
    } else if (step === 2) {
      const step2Fields = [
        "ai_behaviors",
        "automation_level",
        "decision_binding"
      ];
      const hasErrors = step2Fields.some((field) => errors[field]);
      const hasValues =
        values.ai_behaviors &&
        values.ai_behaviors.length > 0 &&
        values.automation_level &&
        values.decision_binding !== undefined;
      return !hasErrors && Boolean(hasValues);
    } else if (step === 3) {
      if (values.human_oversight_required === undefined) {
        return false;
      }
      if (values.human_oversight_required === true) {
        return (
          !errors["oversight_type"] &&
          !errors["oversight_role"] &&
          values.oversight_type !== "" &&
          values.oversight_role !== ""
        );
      }
      return true;
    }
    return false;
  };

  const getStepStatus = (
    step: number,
    activeStep: number,
    values: ApplicationFormValues,
    errors: Record<string, string>
  ): "complete" | "active" | "incomplete" => {
    if (step < activeStep) {
      return validateStep(step, values, errors) ? "complete" : "incomplete";
    }
    if (step === activeStep) {
      return "active";
    }
    return "incomplete";
  };

  const getInitialValues = (): ApplicationFormValues => {
    if (isEditMode && selectedApplication) {
      return {
        name: selectedApplication.name || "",
        version: selectedApplication.version || "1.0.0",
        purpose: selectedApplication.purpose || "",
        owner_name: selectedApplication.owner_name || "",
        use_case_type: selectedApplication.use_case_type || "",
        department: selectedApplication.department || "",
        sensitivity: selectedApplication.sensitivity || "",
        compliance_status: selectedApplication.compliance_status || [],
        risk_level: selectedApplication.risk_level || "",
        deployment_context: selectedApplication.deployment_context || "",
        intended_users: selectedApplication.intended_users || "",
        ai_behaviors: selectedApplication.ai_behaviors || [],
        automation_level: selectedApplication.automation_level || "",
        decision_binding: selectedApplication.decision_binding,
        human_oversight_required: selectedApplication.human_oversight_required,
        oversight_type: selectedApplication.oversight_type || "",
        oversight_role: selectedApplication.oversight_role || ""
      };
    }
    return {
      name: "",
      version: "1.0.0",
      purpose: "",
      owner_name: user?.fullName || "",
      use_case_type: "",
      department: "",
      sensitivity: "",
      compliance_status: [],
      risk_level: "",
      deployment_context: "",
      intended_users: "",
      ai_behaviors: [],
      automation_level: "",
      decision_binding: undefined,
      human_oversight_required: undefined,
      oversight_type: "",
      oversight_role: ""
    };
  };

  const handleSubmit = async (
    values: ApplicationFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ApplicationFormValues>
  ) => {
    // Prevent submission if not on the final step
    if (currentStep !== 3) {
      setSubmitting(false);
      return;
    }

    try {
      const endpoint = isEditMode
        ? `application?doc_id=${selectedApplication?.doc_id}`
        : "application";

      const payload = {
        name: values.name,
        version: values.version,
        purpose: values.purpose,
        owner_name: values.owner_name,
        use_case_type: values.use_case_type,
        owner_user_id: user?.id,
        department: values.department || undefined,
        sensitivity: values.sensitivity || undefined,
        compliance_status: values.compliance_status?.length
          ? values.compliance_status
          : undefined,
        risk_level: values.risk_level || undefined,
        deployment_context: values.deployment_context || undefined,
        intended_users: values.intended_users || undefined,
        ai_behaviors: values.ai_behaviors?.length
          ? values.ai_behaviors
          : undefined,
        automation_level: values.automation_level || undefined,
        decision_binding: values.decision_binding,
        human_oversight_required: values.human_oversight_required,
        oversight_type: values.oversight_type || undefined,
        oversight_role: values.oversight_role || undefined
      };

      const res = await mutation(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        isAlert: false,
        body: payload
      });

      if (res?.status === 201 || res?.status === 200) {
        mutate();
        handleClose();
        toast.success(
          isEditMode
            ? "Application updated successfully"
            : "Application created successfully"
        );
        if (!isEditMode) {
          resetForm();
        }
      } else {
        toast.error(
          isEditMode
            ? "Failed to update application"
            : "Failed to create application"
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className:
          "bg-white dark:bg-gray-900 rounded-lg max-h-[90vh] flex flex-col"
      }}
      onClose={handleClose}
    >
      <DialogTitle className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex-1">
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditMode ? "Edit Application" : "Create Application"}
          </span>
        </div>
        <button
          onClick={handleClose}
          className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </DialogTitle>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={NewApplicationValidationSchema}
        onSubmit={handleSubmit}
        validateOnMount={false}
        validateOnChange={true}
        enableReinitialize={true}
      >
        {({
          errors,
          touched,
          values,
          handleChange,
          handleBlur,
          isSubmitting,
          setFieldValue,
          submitForm
        }: FormikProps<ApplicationFormValues>) => {
          const canProceedToNext = validateStep(currentStep, values, errors);

          return (
            <Form
              className="flex min-h-0 w-full flex-1 flex-col"
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentStep < 3) {
                  e.preventDefault();
                  if (canProceedToNext) {
                    setCurrentStep(currentStep + 1);
                  }
                }
                if (e.key === "Enter" && currentStep === 3) {
                  const target = e.target as HTMLElement;
                  if (
                    target.tagName === "INPUT" ||
                    target.tagName === "SELECT" ||
                    target.tagName === "TEXTAREA"
                  ) {
                    e.preventDefault();
                  }
                }
              }}
            >
              {/* Enhanced Stepper - Fixed at top */}
              <div className="flex-shrink-0 px-6 py-6">
                <div className="mx-auto flex max-w-3xl items-center justify-between">
                  {/* Step 1 */}
                  <div className="flex flex-1 flex-col items-center">
                    <div className="relative flex items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          getStepStatus(1, currentStep, values, errors) ===
                          "complete"
                            ? "border-green-500 bg-green-500 shadow-lg shadow-green-500/50"
                            : getStepStatus(1, currentStep, values, errors) ===
                                "active"
                              ? "border-tertiary-500 bg-tertiary-500 shadow-lg shadow-tertiary-500/50"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                        }`}
                      >
                        {getStepStatus(1, currentStep, values, errors) ===
                        "complete" ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <span
                            className={`text-lg font-semibold ${
                              getStepStatus(1, currentStep, values, errors) ===
                              "active"
                                ? "text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            1
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-sm font-medium ${
                          currentStep === 1
                            ? "text-tertiary-600 dark:text-tertiary-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Core Info
                      </p>
                    </div>
                  </div>

                  {/* Connector 1-2 */}
                  <div className="relative -mt-6 flex-1">
                    <div
                      className={`h-1 w-full transition-all duration-500 ${
                        getStepStatus(1, currentStep, values, errors) ===
                        "complete"
                          ? "bg-gradient-to-r from-green-500 to-tertiary-500"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    ></div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-1 flex-col items-center">
                    <div className="relative flex items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          getStepStatus(2, currentStep, values, errors) ===
                          "complete"
                            ? "border-green-500 bg-green-500 shadow-lg shadow-green-500/50"
                            : getStepStatus(2, currentStep, values, errors) ===
                                "active"
                              ? "border-tertiary-500 bg-tertiary-500 shadow-lg shadow-tertiary-500/50"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                        }`}
                      >
                        {getStepStatus(2, currentStep, values, errors) ===
                        "complete" ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <span
                            className={`text-lg font-semibold ${
                              getStepStatus(2, currentStep, values, errors) ===
                              "active"
                                ? "text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            2
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-sm font-medium ${
                          currentStep === 2
                            ? "text-tertiary-600 dark:text-tertiary-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        AI Behavior
                      </p>
                    </div>
                  </div>

                  {/* Connector 2-3 */}
                  <div className="relative -mt-6 flex-1">
                    <div
                      className={`h-1 w-full transition-all duration-500 ${
                        getStepStatus(2, currentStep, values, errors) ===
                        "complete"
                          ? "bg-gradient-to-r from-tertiary-500 to-purple-500"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    ></div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-1 flex-col items-center">
                    <div className="relative flex items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          getStepStatus(3, currentStep, values, errors) ===
                          "complete"
                            ? "border-green-500 bg-green-500 shadow-lg shadow-green-500/50"
                            : getStepStatus(3, currentStep, values, errors) ===
                                "active"
                              ? "border-purple-500 bg-purple-500 shadow-lg shadow-purple-500/50"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                        }`}
                      >
                        {getStepStatus(3, currentStep, values, errors) ===
                        "complete" ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <span
                            className={`text-lg font-semibold ${
                              getStepStatus(3, currentStep, values, errors) ===
                              "active"
                                ? "text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            3
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-sm font-medium ${
                          currentStep === 3
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Oversight
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {/* STEP 1: CORE IDENTIFICATION */}
                {currentStep === 1 && (
                  <div className="animate-fadeIn space-y-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      Core Identification
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          AI Application Name{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.name}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-neutral-500">
                          E.g., Customer Support Chatbot, Credit Risk Prediction
                          Model
                        </p>
                        {touched.name && errors.name && (
                          <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Version (X.Y.Z format){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="version"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.version}
                          placeholder="1.0.0"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        {touched.version && errors.version && (
                          <p className="text-sm text-red-500">
                            {errors.version}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Application Owner{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="owner_name"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.owner_name}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        {touched.owner_name && errors.owner_name && (
                          <p className="text-sm text-red-500">
                            {errors.owner_name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Use Case Type <span className="text-red-500">*</span>
                        </span>
                        <select
                          name="use_case_type"
                          value={values.use_case_type}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">Select a use case</option>
                          {useCaseOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {touched.use_case_type && errors.use_case_type && (
                          <p className="text-sm text-red-500">
                            {errors.use_case_type}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          Deployment Context{" "}
                          <span className="text-red-500">*</span>
                          <Tooltip text={HOVER_TEXT.deployment_context} />
                        </label>
                        <select
                          name="deployment_context"
                          value={values.deployment_context}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">Select deployment context</option>
                          <option value="development">Development</option>
                          <option value="production">Production</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          Intended Users <span className="text-red-500">*</span>
                          <Tooltip text={HOVER_TEXT.intended_users} />
                        </span>
                        <select
                          name="intended_users"
                          value={values.intended_users}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="">Select intended users</option>
                          <option value="internal">Internal</option>
                          <option value="external">External</option>
                        </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Purpose <span className="text-red-500">*</span>
                        </span>
                        <textarea
                          name="purpose"
                          rows={3}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.purpose}
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {values.purpose?.length || 0}/500 characters
                        </div>
                        {touched.purpose && errors.purpose && (
                          <p className="text-sm text-red-500">
                            {errors.purpose}
                          </p>
                        )}
                      </div>

                      {isEditMode && (
                        <>
                          <div className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                              Department
                            </span>
                            <input
                              type="text"
                              name="department"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.department}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                              Sensitivity
                            </span>
                            <select
                              name="sensitivity"
                              value={values.sensitivity}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                              <option value="">Select Sensitivity</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                              Compliance Status
                            </span>
                            <Field
                              name="compliance_status"
                              component={CustomMultiSelect}
                              options={complianceStatusOptions}
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                              Risk Level
                            </span>
                            <select
                              name="risk_level"
                              value={values.risk_level}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                              <option value="">Select Risk Level</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: AI BEHAVIOR & AUTONOMY */}
                {currentStep === 2 && (
                  <div className="animate-fadeIn space-y-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      AI Behavior & Autonomy
                    </h3>

                    {/* Selection Mode Question - Only show if not already selected */}
                    {!selectionMode && (
                      <div className="space-y-6 py-4">
                        <h4 className="text-center text-xl font-light tracking-wide text-gray-700 dark:text-gray-300">
                          How would you like to start?
                        </h4>
                        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
                          {/* Option 1: Direct Selection */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectionMode("direct");
                              setShowTemplateSelector(false);
                            }}
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition-all duration-500 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-gray-800 dark:to-gray-900"></div>
                            <div className="relative z-10">
                              <div className="mb-4 flex justify-center">
                                <div className="rounded-full bg-gray-100 p-4 transition-all duration-500 group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-600">
                                  <svg
                                    className="h-8 w-8 text-gray-600 dark:text-gray-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <h5 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                Select Directly
                              </h5>
                              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                Choose specific AI behaviors manually
                              </p>
                            </div>
                            <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-gray-400 to-gray-600 transition-all duration-500 group-hover:w-full"></div>
                          </button>

                          {/* Option 2: Template Selection */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectionMode("template");
                              setShowTemplateSelector(true);
                            }}
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition-all duration-500 hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-gray-800 dark:to-gray-900"></div>
                            <div className="relative z-10">
                              <div className="mb-4 flex justify-center">
                                <div className="rounded-full bg-gray-100 p-4 transition-all duration-500 group-hover:bg-gray-200 dark:bg-gray-700 dark:group-hover:bg-gray-600">
                                  <svg
                                    className="h-8 w-8 text-gray-600 dark:text-gray-300"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                                    />
                                  </svg>
                                </div>
                              </div>
                              <h5 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                                Use Template
                              </h5>
                              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                Start with pre-configured templates
                              </p>
                            </div>
                            <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-gray-400 to-gray-600 transition-all duration-500 group-hover:w-full"></div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Template Selector - Show if template mode selected */}
                    {selectionMode === "template" &&
                      showTemplateSelector &&
                      !selectedTemplate && (
                        <div className="space-y-8">
                          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              Select an Application Template
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectionMode(null);
                                setShowTemplateSelector(false);
                              }}
                              className="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                              </svg>
                              Back
                            </button>
                          </div>

                          {/* Cross-Industry Templates */}
                          <div className="space-y-4">
                            <h5 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Cross-Industry
                            </h5>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {APPLICATION_TEMPLATES?.cross_industry?.map(
                                (template) => (
                                  <button
                                    key={template.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedTemplate(template);
                                      setFieldValue("ai_behaviors", [
                                        template.ai_behaviors[0]
                                      ]);
                                      setShowTemplateSelector(false);
                                    }}
                                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-gray-700"></div>
                                    <div className="relative z-10">
                                      <h6 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                                        {template.name}
                                      </h6>
                                      <p className="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                        {template.ux_description}
                                      </p>
                                      <div className="mb-2 flex flex-wrap gap-1.5">
                                        {template.ai_behaviors
                                          .slice(0, 3)
                                          .map((behavior) => (
                                            <span
                                              key={behavior}
                                              className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs uppercase text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                            >
                                              {behavior?.replace(/_/g, " ")}
                                            </span>
                                          ))}
                                        {template.ai_behaviors.length > 3 && (
                                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                            +{template.ai_behaviors.length - 3}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-500">
                                        {template.common_examples
                                          .slice(0, 2)
                                          .join(" • ")}
                                      </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-gray-400 to-gray-600 transition-all duration-300 group-hover:w-full dark:from-gray-500 dark:to-gray-300"></div>
                                  </button>
                                )
                              )}
                            </div>
                          </div>

                          {/* Industry-Specific Templates */}
                          {Object.entries(APPLICATION_TEMPLATES.industries).map(
                            ([industryKey, templates]: [
                              string,
                              ApplicationTemplate[]
                            ]) => (
                              <div key={industryKey} className="space-y-4">
                                <h5 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                  {industryKey.replace(/_/g, " ")}
                                </h5>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                  {templates.map(
                                    (template: ApplicationTemplate) => (
                                      <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedTemplate(template);
                                          setFieldValue("ai_behaviors", [
                                            template.ai_behaviors[0]
                                          ]);
                                          setShowTemplateSelector(false);
                                        }}
                                        className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-gray-700"></div>
                                        <div className="relative z-10">
                                          <h6 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                                            {template.name}
                                          </h6>
                                          <p className="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                            {template.ux_description}
                                          </p>
                                          <div className="mb-2 flex flex-wrap gap-1.5">
                                            {template.ai_behaviors
                                              .slice(0, 3)
                                              .map((behavior) => (
                                                <span
                                                  key={behavior}
                                                  className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs uppercase text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                >
                                                  {behavior?.replace(/_/g, " ")}
                                                </span>
                                              ))}
                                            {template.ai_behaviors.length >
                                              3 && (
                                              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                                +
                                                {template.ai_behaviors.length -
                                                  3}
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-500">
                                            {template.common_examples
                                              .slice(0, 2)
                                              .join(" • ")}
                                          </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-gray-400 to-gray-600 transition-all duration-300 group-hover:w-full dark:from-gray-500 dark:to-gray-300"></div>
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {/* Show selected template info and form */}
                    {selectionMode === "template" && selectedTemplate ? (
                      <div className="space-y-6">
                        {selectedTemplate && (
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                            {/* Header Section */}
                            <div className="border-b border-slate-100 bg-gradient-to-r from-tertiary-50 to-indigo-50 px-6 py-5">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary-500 to-indigo-600 shadow-lg">
                                    <CheckCircle2 className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                      {selectedTemplate.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                      Selected Template
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTemplate(null);
                                    setShowTemplateSelector(true);
                                    setFieldValue("ai_behaviors", []);
                                  }}
                                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                  Change Template
                                </button>
                              </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-4 px-6 py-5">
                              <div>
                                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                  <Info className="h-4 w-4" />
                                  Description
                                </h4>
                                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                                  {selectedTemplate.ux_description}
                                </p>
                              </div>

                              <div className="flex w-full items-center justify-between">
                                {/* AI Behaviors */}
                                <div>
                                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Suggested AI Behaviors
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedTemplate.ai_behaviors.map(
                                      (behavior: string) => {
                                        return (
                                          <span
                                            key={behavior}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-tertiary-200 bg-tertiary-50 px-3 py-1.5 text-sm font-medium text-tertiary-700 dark:border-tertiary-800 dark:bg-tertiary-900/30 dark:text-tertiary-300"
                                          >
                                            <div className="h-1.5 w-1.5 rounded-full bg-tertiary-500"></div>
                                            {behavior.replace(/_/g, " ")}
                                          </span>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>

                                {/* Common Examples */}
                                <div>
                                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    Common Examples
                                  </h4>
                                  <div className="space-y-2">
                                    {selectedTemplate.common_examples.map(
                                      (example: string, idx: number) => (
                                        <div
                                          key={idx}
                                          className="flex items-start gap-2"
                                        >
                                          <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400"></div>
                                          <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {example}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                  <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Selected AI Behaviors{" "}
                                    <span className="text-red-500">*</span>
                                    <Tooltip text={HOVER_TEXT.ai_behaviors} />
                                  </span>
                                  <Field
                                    name="ai_behaviors"
                                    component={CustomMultiSelect}
                                    options={aiBehaviorOptions}
                                    // disabled={!!selectedTemplate}
                                  />
                                  <p className="text-xs text-gray-500 dark:text-neutral-500">
                                    {selectedTemplate
                                      ? "Behaviors pre-selected from template. Hover over tags to see descriptions."
                                      : "Select all behaviors that apply to this AI application. Hover to see descriptions."}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Automation Level{" "}
                                    <span className="text-red-500">*</span>
                                    <Tooltip
                                      text={HOVER_TEXT.automation_level}
                                    />
                                  </span>
                                  <select
                                    name="automation_level"
                                    value={values.automation_level}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                  >
                                    <option value="">
                                      Select automation level
                                    </option>
                                    <option value="low">
                                      Low - Advisory only
                                    </option>
                                    <option value="medium">
                                      Medium - Semi-automated
                                    </option>
                                    <option value="high">
                                      High - Fully automated
                                    </option>
                                  </select>
                                </div>

                                <div className="space-y-2">
                                  <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Decision Binding{" "}
                                    <span className="text-red-500">*</span>
                                    <Tooltip
                                      text={HOVER_TEXT.decision_binding}
                                    />
                                  </span>
                                  <select
                                    name="decision_binding"
                                    value={
                                      values.decision_binding ? "yes" : "no"
                                    }
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                  >
                                    <option value="">
                                      Select decision binding
                                    </option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                  </select>
                                </div>
                              </div>

                              {/* UX Note */}
                              {selectedTemplate.ux_note && (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                                  <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <Info className="h-4 w-4" />
                                    Important Note
                                  </h4>
                                  <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-400">
                                    {selectedTemplate.ux_note}
                                  </p>
                                </div>
                              )}
                              {/* Governance Rationale */}
                              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
                                  <AlertCircle className="h-4 w-4" />
                                  Governance Rationale
                                </h4>
                                <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-400">
                                  {selectedTemplate.governance_rationale}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : selectionMode === "direct" ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex w-full items-center justify-between">
                            <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                              AI Behaviors{" "}
                              <span className="text-red-500">*</span>
                              <Tooltip text={HOVER_TEXT.ai_behaviors} />
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectionMode(null);
                                setShowTemplateSelector(false);
                              }}
                              className="flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                              </svg>
                              Back
                            </button>
                          </div>
                          <Field
                            name="ai_behaviors"
                            component={CustomMultiSelect}
                            options={aiBehaviorOptions}
                            disabled={!!selectedTemplate}
                          />
                          <p className="text-xs text-gray-500 dark:text-neutral-500">
                            {selectedTemplate
                              ? "Behaviors pre-selected from template. Hover over tags to see descriptions."
                              : "Select all behaviors that apply to this AI application. Hover to see descriptions."}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                            Automation Level{" "}
                            <span className="text-red-500">*</span>
                            <Tooltip text={HOVER_TEXT.automation_level} />
                          </span>
                          <select
                            name="automation_level"
                            value={values.automation_level}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="">Select automation level</option>
                            <option value="low">Low - Advisory only</option>
                            <option value="medium">
                              Medium - Semi-automated
                            </option>
                            <option value="high">High - Fully automated</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <span className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                            Decision Binding{" "}
                            <span className="text-red-500">*</span>
                            <Tooltip text={HOVER_TEXT.decision_binding} />
                          </span>
                          <div className="flex gap-4 pt-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="decision_binding"
                                value="true"
                                checked={values.decision_binding === true}
                                onChange={() =>
                                  setFieldValue("decision_binding", true)
                                }
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-200">
                                Yes
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="decision_binding"
                                value="false"
                                checked={values.decision_binding === false}
                                onChange={() =>
                                  setFieldValue("decision_binding", false)
                                }
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-200">
                                No
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* STEP 3: HUMAN OVERSIGHT */}
                {currentStep === 3 && (
                  <div className="animate-fadeIn space-y-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      Human Oversight
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          Human Oversight Required{" "}
                          <span className="text-red-500">*</span>
                          <Tooltip text={HOVER_TEXT.human_oversight_required} />
                        </label>
                        <div className="flex gap-4 pt-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="human_oversight_required"
                              value="true"
                              checked={values.human_oversight_required === true}
                              onChange={() =>
                                setFieldValue("human_oversight_required", true)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              Yes
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="human_oversight_required"
                              value="false"
                              checked={
                                values.human_oversight_required === false
                              }
                              onChange={() =>
                                setFieldValue("human_oversight_required", false)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              No
                            </span>
                          </label>
                        </div>
                      </div>

                      {values.human_oversight_required && (
                        <>
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                              Oversight Type{" "}
                              <span className="text-red-500">*</span>
                              <Tooltip text={HOVER_TEXT.oversight_type} />
                            </label>
                            <select
                              name="oversight_type"
                              value={values.oversight_type}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                              <option value="">Select oversight type</option>
                              <option value="pre_decision_approval">
                                Pre-Decision Approval
                              </option>
                              <option value="post_decision_review">
                                Post-Decision Review
                              </option>
                              <option value="exception_only_review">
                                Exception-Only Review
                              </option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                              Oversight Role{" "}
                              <span className="text-red-500">*</span>
                              <Tooltip text={HOVER_TEXT.oversight_role} />
                            </label>
                            <select
                              name="oversight_role"
                              value={values.oversight_role}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-tertiary-500 focus:outline-none focus:ring-1 focus:ring-tertiary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                              <option value="">Select oversight role</option>
                              <option value="risk_officer">Risk Officer</option>
                              <option value="compliance_reviewer">
                                Compliance Reviewer
                              </option>
                              <option value="product_owner">
                                Product Owner
                              </option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Footer with Buttons */}
              <div className="flex flex-shrink-0 justify-between space-x-3 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="rounded-md border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Previous
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-md border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  {currentStep < 3 ? (
                    <CustomButton
                      type="button"
                      onClick={() => {
                        if (canProceedToNext) {
                          setCurrentStep(currentStep + 1);
                        } else {
                          toast.error(
                            "Please fill in all required fields before continuing"
                          );
                        }
                      }}
                      disabled={!canProceedToNext}
                      className={`${!canProceedToNext ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      Continue
                    </CustomButton>
                  ) : (
                    <CustomButton
                      loading={isLoading || isSubmitting}
                      loadingText={isEditMode ? "Updating..." : "Creating..."}
                      type="button"
                      onClick={() => {
                        submitForm();
                      }}
                      startIcon={
                        isEditMode ? <Edit size={16} /> : <Plus size={16} />
                      }
                    >
                      {isEditMode ? "Update Application" : "Create Application"}
                    </CustomButton>
                  )}
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default AddApplication;
