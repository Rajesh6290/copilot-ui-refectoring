import { ExternalLink, Settings, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
const FrameworkSelectionComponent = dynamic(
  () => import("./FrameworkSelectionComponent"),
  {
    ssr: false
  }
);
const CustomMetricsFrameworkSelectionComponent = dynamic(
  () => import("./CustomMetricsFrameworkSelectionComponent"),
  {
    ssr: false
  }
);
const CustomMetricsFormComponent = dynamic(
  () => import("./CustomMetricsFormComponent"),
  {
    ssr: false
  }
);
const CSVUploadFormComponent = dynamic(
  () => import("./CSVUploadFormComponent"),
  {
    ssr: false
  }
);
const APIDetailsCard = dynamic(() => import("./APIDetailsCard"), {
  ssr: false
});
const ArtifactCard = () => {
  const [showFrameworkSelection, setShowFrameworkSelection] = useState(false);
  const [
    showCustomMetricsFrameworkSelection,
    setShowCustomMetricsFrameworkSelection
  ] = useState(false);
  const [showCSVUploadForm, setShowCSVUploadForm] = useState(false);
  const [showCustomMetricsForm, setShowCustomMetricsForm] = useState(false);
  const [showAPIDetails, setShowAPIDetails] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");

  const handleOptionClick = (option: string) => {
    if (option === "api-gateway") {
      setShowAPIDetails(true);
    } else if (option === "form-upload") {
      setShowFrameworkSelection(true);
    } else if (option === "custom-metrics") {
      setShowCustomMetricsFrameworkSelection(true);
    }
  };

  const handleFrameworkSelect = (framework: string) => {
    setSelectedProvider(framework);
    setShowFrameworkSelection(false);
    setShowCSVUploadForm(true);
  };

  const handleCustomMetricsFrameworkSelect = (framework: string) => {
    setSelectedProvider(framework);
    setShowCustomMetricsFrameworkSelection(false);
    setShowCustomMetricsForm(true);
  };

  const handleBackToOptions = () => {
    setShowFrameworkSelection(false);
    setShowCSVUploadForm(false);
    setShowCustomMetricsForm(false);
    setShowCustomMetricsFrameworkSelection(false);
    setShowAPIDetails(false);
  };

  const handleBackToFramework = () => {
    setShowCSVUploadForm(false);
    setShowFrameworkSelection(true);
  };

  const handleBackToCustomMetricsFramework = () => {
    setShowCustomMetricsForm(false);
    setShowCustomMetricsFrameworkSelection(true);
  };

  const handleFormSubmit = () => {
    setFormSubmitted(true);
    setShowCSVUploadForm(false);
    setShowCustomMetricsForm(false);
  };

  if (formSubmitted) {
    return (
      <div className="animate-in fade-in-50 slide-in-from-bottom-4 mx-auto my-6 w-full max-w-3xl duration-500">
        <div className="relative overflow-hidden rounded-2xl border border-tertiary-200/50 bg-gradient-to-br from-tertiary-50 via-tertiary-50 to-tertiary-50 shadow-xl backdrop-blur-sm dark:border-tertiary-800/50 dark:from-tertiary-950/30 dark:via-tertiary-950/30 dark:to-tertiary-950/30">
          <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>
          <div className="relative p-8">
            <div className="flex-1">
              <h3 className="mb-2 bg-gradient-to-r from-tertiary-600 to-tertiary-600 bg-clip-text text-2xl font-bold text-transparent dark:from-tertiary-400 dark:to-tertiary-400">
                Data Submitted Successfully!
              </h3>
              <p className="text-base leading-relaxed text-tertiary-700 dark:text-tertiary-300">
                {
                  'Your Responsible AI Score is ready. You can view it from the left panel under "Responsible AI Report".'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAPIDetails) {
    return <APIDetailsCard onBack={handleBackToOptions} />;
  }

  if (showCSVUploadForm) {
    return (
      <CSVUploadFormComponent
        onFormSubmit={handleFormSubmit}
        onCancel={handleBackToFramework}
        selectedProvider={selectedProvider}
      />
    );
  }

  if (showCustomMetricsForm) {
    return (
      <CustomMetricsFormComponent
        onFormSubmit={handleFormSubmit}
        onCancel={handleBackToCustomMetricsFramework}
        selectedProvider={selectedProvider}
      />
    );
  }

  if (showFrameworkSelection) {
    return (
      <FrameworkSelectionComponent
        onFrameworkSelect={handleFrameworkSelect}
        onBack={handleBackToOptions}
      />
    );
  }

  if (showCustomMetricsFrameworkSelection) {
    return (
      <CustomMetricsFrameworkSelectionComponent
        onFrameworkSelect={handleCustomMetricsFrameworkSelect}
        onBack={handleBackToOptions}
      />
    );
  }

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-6 mx-auto my-8 w-full max-w-4xl duration-700">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-tertiary-50 to-tertiary-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-indigo-400/20 to-tertiary-500/20 blur-3xl delay-1000"></div>
          <div className="bg-grid-pattern absolute inset-0 opacity-[0.02]"></div>
        </div>

        <div className="relative p-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* CSV Upload Option */}
            <div
              tabIndex={0}
              role="button"
              onClick={() => handleOptionClick("form-upload")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOptionClick("form-upload");
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-tertiary-200/50 bg-white/70 p-6 backdrop-blur-sm hover:border-tertiary-400 hover:shadow-xl dark:border-tertiary-700/50 dark:bg-gray-800/70 dark:hover:border-tertiary-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-tertiary-500/5 to-tertiary-500/5 transition-all duration-300 group-hover:from-tertiary-500/10 group-hover:to-tertiary-500/10"></div>
              <div className="relative flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tertiary-500 to-tertiary-500 shadow-lg">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-tertiary-600 dark:text-white dark:group-hover:text-tertiary-400">
                    CSV Upload
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Drag & drop your CSV files here to generate the Responsible
                    AI score
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Metrics Option */}
            <div
              tabIndex={0}
              role="button"
              onClick={() => handleOptionClick("custom-metrics")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOptionClick("custom-metrics");
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-tertiary-200/50 bg-white/70 p-6 backdrop-blur-sm hover:border-tertiary-400 hover:shadow-xl dark:border-tertiary-700/50 dark:bg-gray-800/70 dark:hover:border-tertiary-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-tertiary-500/5 to-tertiary-500/5 transition-all duration-300 group-hover:from-tertiary-500/10 group-hover:to-tertiary-500/10"></div>
              <div className="relative flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tertiary-500 to-tertiary-500 shadow-lg">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-tertiary-600 dark:text-white dark:group-hover:text-tertiary-400">
                    Custom Metrics
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Select your own evaluation metrics and manually enter their
                    values to tailor the RAI score.
                  </p>
                </div>
              </div>
            </div>
            {/* API Gateway Option */}
            <div
              tabIndex={0}
              role="button"
              onClick={() => handleOptionClick("api-gateway")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOptionClick("api-gateway");
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-tertiary-200/50 bg-white/70 p-6 backdrop-blur-sm hover:border-tertiary-400 hover:shadow-xl dark:border-tertiary-700/50 dark:bg-gray-800/70 dark:hover:border-tertiary-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-tertiary-500/5 to-tertiary-500/5 transition-all duration-300 group-hover:from-tertiary-500/10 group-hover:to-tertiary-500/10"></div>
              <div className="relative flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tertiary-500 to-tertiary-500 shadow-lg">
                  <ExternalLink className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-tertiary-600 dark:text-white dark:group-hover:text-tertiary-400">
                    API
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Connect directly to our API to generate the Responsible AI
                    score
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtifactCard;
