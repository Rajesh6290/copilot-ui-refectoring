import { ArrowLeft, Bot, Settings } from "lucide-react";
import { useState } from "react";

const CustomMetricsFrameworkSelectionComponent = ({
  onFrameworkSelect,
  onBack
}: {
  onFrameworkSelect: (framework: string) => void;
  onBack: () => void;
}) => {
  const frameworks = [
    {
      id: "opik",
      name: "Opik",
      description:
        "AI evaluation framework for monitoring and improving AI applications",
      icon: "activity"
    },
    {
      id: "evidently",
      name: "Evidently",
      description:
        "ML model monitoring and testing framework for data and ML model quality",
      icon: "bar-chart"
    },
    {
      id: "deepeval",
      name: "DeepEval",
      description:
        "Unit testing framework specifically designed for LLM applications",
      icon: "check-circle"
    },
    {
      id: "aif360",
      name: "Fair360",
      description:
        "Comprehensive fairness evaluation framework for AI applications",
      icon: "shield"
    },
    {
      id: "deepteam",
      name: "Deepteam",
      description:
        "Advanced team collaboration framework for AI model evaluation",
      icon: "users"
    }
  ];

  const [selectedFramework, setSelectedFramework] = useState<string | null>(
    null
  );

  const handleFrameworkSelect = (framework: { id: string }) => {
    setSelectedFramework(framework.id);
  };

  const handleProceed = (framework: { id: string }) => {
    onFrameworkSelect(framework.id);
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "activity":
        return (
          <svg
            className="h-6 w-6 text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        );
      case "bar-chart":
        return (
          <svg
            className="h-6 w-6 text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        );
      case "check-circle":
        return (
          <svg
            className="h-6 w-6 text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "shield":
        return (
          <svg
            className="h-6 w-6 text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      default:
        return <Bot className="h-6 w-6 text-tertiary" />;
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-4 mx-auto my-6 w-full max-w-4xl duration-500">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-tertiary-50 to-tertiary-50 shadow-lg dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-indigo-400/20 to-tertiary-500/20 blur-3xl delay-1000"></div>
          <div className="bg-grid-pattern absolute inset-0 opacity-[0.02]"></div>
        </div>
        <div className="absolute left-3 top-3 z-10">
          <button
            onClick={onBack}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="relative p-8 pt-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-tertiary">
              Choose ML Evaluation Framework
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select your preferred evaluation framework to configure custom
              metrics
            </p>
          </div>

          <div className="space-y-4">
            {frameworks.map((framework) => (
              <div
                key={framework.id}
                tabIndex={0}
                role="button"
                onClick={() => handleFrameworkSelect(framework)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleFrameworkSelect(framework);
                  }
                }}
                className={`group relative cursor-pointer rounded-lg border p-6 transition-all duration-300 ${
                  selectedFramework === framework.id
                    ? "border-tertiary-500 shadow-md"
                    : "border-gray-200 hover:border-tertiary-500 dark:border-neutral-800"
                }`}
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-tertiary-500/5 to-tertiary-500/5 transition-all duration-300 group-hover:from-tertiary-500/10 group-hover:to-tertiary-500/10"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-tertiary-200">
                    {getIcon(framework.icon)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {framework.name}
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {framework.description}
                        </p>
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        {selectedFramework === framework.id ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-tertiary">
                            <svg
                              className="h-4 w-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300 transition-colors group-hover:border-gray-400 dark:border-gray-600"></div>
                        )}
                      </div>
                    </div>

                    {selectedFramework === framework.id && (
                      <div className="animate-in fade-in-50 slide-in-from-top-2 mt-4 duration-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProceed(framework);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg bg-tertiary-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-tertiary dark:text-gray-900"
                        >
                          <Settings className="h-4 w-4" />
                          Configure {framework.name} Metrics
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click on a framework to select it and configure custom metrics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomMetricsFrameworkSelectionComponent;
