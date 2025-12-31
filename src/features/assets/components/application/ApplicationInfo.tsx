"use client";
import React, { SVGProps, useState } from "react";
import {
  ArrowRight,
  Bot,
  ChevronDown,
  ChevronUp,
  Cpu,
  GitBranch,
  X,
  Database,
  Brain,
  FileText,
  Activity,
  Shield,
  Zap
} from "lucide-react";

interface ApplicationInfoProps {
  handleAddModel: () => void;
  handleAddAgent: () => void;
}

const ApplicationInfo: React.FC<ApplicationInfoProps> = ({
  handleAddModel,
  handleAddAgent
}) => {
  const [showApplicationGuideDialog, setShowApplicationGuideDialog] =
    useState(false);
  const [expandedGuideCards, setExpandedGuideCards] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleGuideCardExpansion = (cardType: string) => {
    setExpandedGuideCards((prev) => ({
      ...prev,
      [cardType]: !prev[cardType]
    }));
  };

  const modelExamples = [
    {
      title: "Model Type [Generative]",
      type: "AI Application Type",
      model: "Llama 3.1",
      dataset: "Company Internal Documentation (RAG)",
      purpose: "Generates Answers / Summaries",
      flow: "[Model] ---> [Dataset]",
      icon: FileText,
      iconColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50",
      darkBg:
        "dark:bg-gradient-to-br dark:from-blue-900/40 dark:via-cyan-900/30 dark:to-blue-900/30",
      borderColor: "border-blue-300 dark:border-blue-600",
      badgeColor: "bg-yellow-400 text-yellow-900",
      textAccent: "text-blue-700 dark:text-blue-300"
    },
    {
      title: "Model Type [Generative]",
      type: "AI Application Type",
      model: "Llama 3.1",
      dataset: "none (you can skip dataset and save)",
      purpose: "Generate concise policy summaries from prompts",
      flow: "[Models]",
      icon: Brain,
      iconColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50",
      darkBg:
        "dark:bg-gradient-to-br dark:from-blue-900/40 dark:via-cyan-900/30 dark:to-blue-900/30",
      borderColor: "border-blue-300 dark:border-blue-600",
      badgeColor: "bg-yellow-400 text-yellow-900",
      textAccent: "text-blue-700 dark:text-blue-300"
    },
    {
      title: "Model Type [Predictive]",
      type: "AI Application Type",
      model: "XGBoost Classifier",
      dataset: "Loan Applicant Historical Data",
      purpose: "Predicts Default Probability",
      flow: "[Model] ---> [Dataset]",
      icon: Activity,
      iconColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50",
      darkBg:
        "dark:bg-gradient-to-br dark:from-blue-900/40 dark:via-cyan-900/30 dark:to-blue-900/30",
      borderColor: "border-blue-300 dark:border-blue-600",
      badgeColor: "bg-yellow-400 text-yellow-900",
      textAccent: "text-blue-700 dark:text-blue-300"
    }
  ];

  const agentExamples = [
    {
      title: "Model Type [Generative]",
      type: "AI Application Type",
      agent: "Policy Assistant Agent",
      model: "GPT-4",
      dataset: "AI Policy Documents & Regulations (RAG)",
      function: "Policy Guidance",
      flow: "[Agent] ---> [Model] ---> [Dataset]",
      icon: Shield,
      iconColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50",
      darkBg:
        "dark:bg-gradient-to-br dark:from-blue-900/40 dark:via-cyan-900/30 dark:to-blue-900/30",
      borderColor: "border-blue-300 dark:border-blue-600",
      badgeColor: "bg-yellow-400 text-yellow-900",
      textAccent: "text-blue-700 dark:text-blue-300"
    },
    {
      title: "Model Type [Generative]",
      type: "AI Application Type",
      agent: "Creative Writing Assistant",
      model: "GPT-4",
      dataset: "none (you can skip dataset and save)",
      purpose: "Help users draft stories and creative content",
      flow: "[Agent] ---> [Models]",
      icon: Zap,
      iconColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50",
      darkBg:
        "dark:bg-gradient-to-br dark:from-blue-900/40 dark:via-cyan-900/30 dark:to-blue-900/30",
      borderColor: "border-blue-300 dark:border-blue-600",
      badgeColor: "bg-yellow-400 text-yellow-900",
      textAccent: "text-blue-700 dark:text-blue-300"
    },
    {
      title: "Model Type [Predictive]",
      type: "AI Application Type",
      agent: "Early Disease Detection Agent",
      model: "Random Forest Classifier",
      dataset: "Patient Medical Records (training)",
      function: "Predicts Risk of Diabetes",
      flow: "[Agent] ---> [Model] ---> [Dataset]",
      icon: Activity,
      iconColor: "bg-gradient-to-br from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50",
      darkBg:
        "dark:bg-gradient-to-br dark:from-blue-900/40 dark:via-cyan-900/30 dark:to-blue-900/30",
      borderColor: "border-blue-300 dark:border-blue-600",
      badgeColor: "bg-yellow-400 text-yellow-900",
      textAccent: "text-blue-700 dark:text-blue-300"
    }
  ];

  const ExampleCard = ({
    example,
    index
  }: {
    example: {
      title: string;
      agent?: string;
      model: string;
      dataset: string;
      purpose?: string;
      function?: string;
      flow: string;
      icon: React.ComponentType<SVGProps<SVGSVGElement>>;
      iconColor: string;
      bgColor: string;
      darkBg: string;
      borderColor: string;
      textAccent: string;
    };
    index: number;
  }) => {
    const IconComponent = example.icon;

    return (
      <div
        className={`rounded-xl border-2 sm:rounded-2xl ${example.borderColor} ${example.bgColor} ${example.darkBg} transform p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-xl sm:p-6`}
        style={{
          animationDelay: `${index * 100}ms`,
          animation: "fadeInUp 0.4s ease-out forwards"
        }}
      >
        <div className="mb-3 flex items-start justify-between sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div
              className={`${example.iconColor} rounded-lg p-2 shadow-lg sm:rounded-xl sm:p-3`}
            >
              <IconComponent className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div>
              <h4
                className={`font-bold ${example.textAccent} mb-1 text-sm sm:mb-2 sm:text-base`}
              >
                {example.title}
              </h4>
            </div>
          </div>
        </div>
        <div className="space-y-2 text-xs sm:space-y-3 sm:text-sm">
          {example.agent && (
            <div className="flex items-start space-x-2">
              <span className="min-w-14 font-bold text-gray-800 dark:text-gray-200 sm:min-w-16">
                Agent:
              </span>
              <span className="break-words font-medium text-gray-700 dark:text-gray-300">
                {example.agent}
              </span>
            </div>
          )}
          <div className="flex items-start space-x-2">
            <span className="min-w-14 font-bold text-gray-800 dark:text-gray-200 sm:min-w-16">
              Model:
            </span>
            <span className="break-words font-medium text-gray-700 dark:text-gray-300">
              {example.model}
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="min-w-14 font-bold text-gray-800 dark:text-gray-200 sm:min-w-16">
              Dataset:
            </span>
            <span className="break-words font-medium text-gray-700 dark:text-gray-300">
              {example.dataset}
            </span>
          </div>
          {example.purpose && (
            <div className="flex items-start space-x-2">
              <span className="min-w-14 font-bold text-gray-800 dark:text-gray-200 sm:min-w-16">
                Purpose:
              </span>
              <span className="break-words font-medium text-gray-700 dark:text-gray-300">
                {example.purpose}
              </span>
            </div>
          )}
          {example.function && (
            <div className="flex items-start space-x-2">
              <span className="min-w-14 font-bold text-gray-800 dark:text-gray-200 sm:min-w-16">
                Function:
              </span>
              <span className="break-words font-medium text-gray-700 dark:text-gray-300">
                {example.function}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 border-t-2 border-gray-300/60 pt-3 dark:border-gray-600/60 sm:mt-5 sm:pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 sm:text-sm">
              Flow:
            </span>
          </div>
          <div className="rounded-lg border border-gray-300/50 bg-white/90 px-3 py-2 shadow-inner backdrop-blur-sm dark:border-gray-600/50 dark:bg-gray-800/90 sm:rounded-xl sm:px-4 sm:py-3">
            <code className="font-mono break-all text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
              {example.flow}
            </code>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6 sm:mb-8">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 2000px;
            transform: translateY(0);
          }
        }

        .slide-down {
          animation: slideDown 0.4s ease-out forwards;
        }
      `}</style>

      <div className="flex flex-col gap-4 rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-blue-600/30 dark:from-blue-900/20 dark:to-indigo-900/20 sm:gap-6 sm:rounded-2xl sm:p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex flex-1 items-start space-x-3 sm:space-x-6">
          <div className="flex aspect-square h-12 min-h-12 w-12 min-w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg sm:h-14 sm:min-h-14 sm:w-14 sm:min-w-14 sm:rounded-2xl">
            <Bot className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h4 className="mb-2 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-lg font-bold text-transparent dark:from-white dark:to-blue-300 sm:mb-3 sm:text-xl md:text-2xl">
              What is an application?
            </h4>
            <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 sm:text-sm">
              {` An AI application is a system that combines agents, models, and
              datasets to create an automated solution that helps a business.
              This helps you store all the key information about your AI
              application, whether it's Generative, Predictive, or Agentic, in
              one place.`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowApplicationGuideDialog(true)}
          className="inline-flex w-full shrink-0 items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-95 sm:rounded-xl sm:px-6 sm:py-3 sm:text-sm md:w-auto"
        >
          <span>Know More</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
        </button>
      </div>

      {showApplicationGuideDialog && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4">
          <div
            tabIndex={0}
            role="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowApplicationGuideDialog(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowApplicationGuideDialog(false);
              }
            }}
          />

          <div className="relative flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900 sm:max-h-[90vh] sm:rounded-xl">
            <div className="shrink-0 border-b border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6 sm:py-4">
              <div className="flex items-start justify-between gap-3 sm:items-center">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl md:text-2xl">
                    Understanding AI Applications
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    {`Use the AI Application feature to record and self-assess
                    your solution's Generative, Predictive, or Agentic
                    capabilities by its models, datasets, and agents in one
                    place.`}
                  </p>
                </div>
                <button
                  onClick={() => setShowApplicationGuideDialog(false)}
                  className="shrink-0 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 sm:p-2"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-6 sm:space-y-8">
                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-lg dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20 sm:rounded-xl sm:p-6">
                  <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                    <div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3">
                      <div className="shrink-0 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5 sm:p-2">
                        <Cpu className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                          Linking Models to the AI Application
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                          Model → Dataset
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGuideCardExpansion("path2")}
                      className="shrink-0 rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-all hover:scale-110 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 sm:p-2"
                    >
                      {expandedGuideCards["path2"] ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>

                  <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-4">
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={handleAddModel}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (handleAddModel) {
                            handleAddModel();
                          }
                        }
                      }}
                      className="flex cursor-pointer items-center space-x-1.5 rounded-lg bg-white px-2.5 py-1.5 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 sm:space-x-2 sm:px-3 sm:py-2"
                    >
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500 sm:h-3 sm:w-3"></div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                        Model
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4" />
                    <div className="flex items-center space-x-1.5 rounded-lg bg-white px-2.5 py-1.5 shadow-sm dark:bg-gray-800 sm:space-x-2 sm:px-3 sm:py-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-orange-500 sm:h-3 sm:w-3"></div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                        Dataset
                      </span>
                    </div>
                  </div>

                  {expandedGuideCards["path2"] && (
                    <div className="slide-down space-y-4 sm:space-y-6">
                      <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800 sm:p-4">
                        <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white sm:mb-3 sm:text-base">
                          How it works:
                        </h4>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 sm:h-2 sm:w-2"></div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                                Step 1: Model Details
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-xs">
                                {` You can provide details of the model, such as
                                name, provider, version, intended purpose, and
                                domain of use. (e.g., "OpenAI GPT-4o — v1.2,
                                used for summarization tasks")`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 sm:h-2 sm:w-2"></div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                                Step 2: Dataset
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-xs">
                                {`Adding a dataset is optional. If available, you
                                can link dataset details to the model for
                                training, evaluation, validation, or RAG. If no
                                dataset information is available, you may skip
                                this step. (e.g., "Healthcare QA Dataset v3,
                                annotated patient cases")`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500 sm:h-2 sm:w-2"></div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                                Step 3: Review & Save
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-xs">
                                You can review the model and dataset (if added)
                                information and save the configuration.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-blue-200/50 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-4 shadow-sm dark:border-blue-700/50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 sm:rounded-xl sm:p-6">
                        <h4 className="mb-4 flex items-center space-x-2 text-base font-bold text-gray-900 dark:text-white sm:mb-6 sm:space-x-3 sm:text-lg">
                          <Database className="h-4 w-4 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />
                          <span>Examples</span>
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {modelExamples.map((example, index) => (
                            <ExampleCard
                              key={index}
                              example={example}
                              index={index}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-lg dark:border-gray-700 dark:from-green-900/20 dark:to-emerald-900/20 sm:rounded-xl sm:p-6">
                  <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                    <div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3">
                      <div className="shrink-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-1.5 sm:p-2">
                        <GitBranch className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                          Linking Agents, Models, and Datasets to the AI
                          Application
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                          Agent → Model → Dataset
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleGuideCardExpansion("path1")}
                      className="shrink-0 rounded-lg bg-green-100 p-1.5 text-green-600 transition-all hover:scale-110 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 sm:p-2"
                    >
                      {expandedGuideCards["path1"] ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>

                  <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-4">
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={handleAddAgent}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (handleAddAgent) {
                            handleAddAgent();
                          }
                        }
                      }}
                      className="flex cursor-pointer items-center space-x-1.5 rounded-lg bg-white px-2.5 py-1.5 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 sm:space-x-2 sm:px-3 sm:py-2"
                    >
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500 sm:h-3 sm:w-3"></div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                        Agent
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4" />
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={handleAddModel}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (handleAddModel) {
                            handleAddModel();
                          }
                        }
                      }}
                      className="flex cursor-pointer items-center space-x-1.5 rounded-lg bg-white px-2.5 py-1.5 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 sm:space-x-2 sm:px-3 sm:py-2"
                    >
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500 sm:h-3 sm:w-3"></div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                        Model
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 sm:h-4 sm:w-4" />
                    <div className="flex items-center space-x-1.5 rounded-lg bg-white px-2.5 py-1.5 shadow-sm dark:bg-gray-800 sm:space-x-2 sm:px-3 sm:py-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-orange-500 sm:h-3 sm:w-3"></div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                        Dataset
                      </span>
                    </div>
                  </div>

                  {expandedGuideCards["path1"] && (
                    <div className="slide-down space-y-4 sm:space-y-6">
                      <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800 sm:p-4">
                        <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white sm:mb-3 sm:text-base">
                          How it works:
                        </h4>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500 sm:h-2 sm:w-2"></div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                                Step 1: Agent Details
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-xs">
                                {`You can provide details of the agent, such as
                                name, purpose, decision-making scope, and
                                capabilities. (e.g., "Customer Support Agent –
                                handles Level 1 queries, supports escalation
                                flow")`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 sm:h-2 sm:w-2"></div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                                Step 2: Model Details
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-xs">
                                {`You can link a model to the agent, specifying
                                which AI models power the agent. This is also
                                optional. You can simply register the agent
                                without model if you do not have information
                                about it. (e.g., "GPT-4o mini for reasoning and
                                Q&A")`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 sm:h-2 sm:w-2"></div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                                Step 3: Dataset
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-xs">
                                You may add datasets linked with the model for
                                context, fine-tuning, or compliance monitoring.
                                This is optional.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500 sm:h-2 sm:w-2"></div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                                Step 4: Review & Save
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-xs">
                                You can review the agent, model, and dataset as
                                needed configuration and save the setup.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-green-200/50 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 p-4 shadow-sm dark:border-green-700/50 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-green-900/30 sm:rounded-xl sm:p-6">
                        <h4 className="mb-4 flex items-center space-x-2 text-base font-bold text-gray-900 dark:text-white sm:mb-6 sm:space-x-3 sm:text-lg">
                          <GitBranch className="h-4 w-4 text-green-600 dark:text-green-400 sm:h-5 sm:w-5" />
                          <span>Examples</span>
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {agentExamples.map((example, index) => (
                            <ExampleCard
                              key={index}
                              example={example}
                              index={index}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationInfo;
