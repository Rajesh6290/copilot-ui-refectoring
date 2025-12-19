import { ArrowLeft, Check, Code, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const APIDetailsCard = ({ onBack }: { onBack: () => void }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  const apiSteps = [
    {
      step: 1,
      title: "Access API Key",
      subtitle: "Go to the System Settings",
      description: "Under System Settings, Find sub-menu of 'API'"
    },
    {
      step: 2,
      title: "Generate API Key",
      subtitle: "This key is required for authenticating all API requests",
      notes: [
        "Never expose your API key publicly or in frontend code",
        "Store it securely using environment variables or a secrets manager",
        "Rotate keys regularly",
        "Revoke unused or compromised keys",
        "Monitor API usage for anomalies"
      ]
    },
    {
      step: 3,
      title: "Prepare Evaluation Metrics",
      description:
        "Use the Evaluation provider of your choice and prepare the metrics for submission."
    },
    {
      step: 4,
      title: "Visit the Developer Portal",
      link: "developers.cognitiveview.com",
      description: "This is your hub for API documentation and sample requests."
    },
    {
      step: 5,
      title: "Locate the POST Request for Metric Ingestion",
      description:
        'Find the endpoint labeled "Submit" under the Metrics API section.'
    },
    {
      step: 6,
      title: "Submit a POST Request",
      subtitle: "Send a POST request to provide us with your metrics",
      endpoint: "https://production-apimanager.azure-api.net/cv/v1/metrics",
      notes: [
        "Please make sure the 'Request Body' matches the structure accepted by our API",
        "After uploading the Evaluation Metrics the score card generation might take 2-3 minutes, Please be patient",
        "The Example given below contains a subset of the supported metrics for a given platform. Please refer to the documentation for full list of supported metrics."
      ],
      requestBody: `{
  "metric_metadata": {
    "application_name": "your ai application name",
    "version": "1.0.0",
    "resource_name": "your ai resource name",
    "resource_id": "resource_id-123",
    "provider": "deepeval",
    "use_case": "transportation"
  },
  "metric_data": {
    "resource_id": "R-756_123456",
    "resource_name": "chat-completion",
    "deepeval": {
      "AnswerRelevancyMetric": 85,
      "ContextualPrecisionMetric": 92,
      "ContextualRecallMetric": 78,
      "ContextualRelevancyMetric": 88,
      "ConversationCompletenessMetric": 95,
      "ConversationRelevancyMetric": 82,
      "FactualCorrectnessMetric": 87,
      "FaithfulnessMetric": 90,
      "KnowledgeRetentionMetric": 87,
      "RoleAdherenceMetric": 93,
      "TaskCompletionMetric": 89,
      "ToolCorrectnessMetric": 91
    }
  }
}`
    },
    {
      step: 7,
      title: "Wait for the Responsible AI Scorecard Generation",
      description:
        "After successful submission, please wait 2–3 minutes while we evaluate your metrics and generate your detailed scorecard."
    },
    {
      step: 8,
      title: "Successful Response",
      subtitle:
        "If successful, you'll receive a response with HTTP Status Code: 201 Created",
      response: `{
  "message": "Metrics ingested, and evaluation completed.",
  "report_id": "report_id-1234"
}`
    },
    {
      step: 10,
      title: "Congratulations! 🎉",
      subtitle:
        "You completed the process for generating your Responsible AI Report",
      description:
        "It will be available in the 'Responsible AI Report' tab. If you face any difficulties, please refer the documentation on developer.cognitiveview.com.",
      reportEndpoint: "https://developer.cognitiveview.com",
      reportDescription:
        "Access your complete Responsible AI Report and find your report_id in the dashboard."
    }
  ];

  const faqs = [
    {
      question: "What evaluation frameworks are supported?",
      answer:
        "Currently, we support: DeepEval, Opik, Evidently, and Moonshot. Each has different metric expectations. You can choose the provider relevant to your setup."
    },
    {
      question: "Can I upload evaluation results via CSV?",
      answer:
        "Yes. In the UI, you may also upload metric results via a CSV for each supported framework. However, API ingestion is ideal for automation."
    },
    {
      question: "What happens if a metric is missing or invalid?",
      answer:
        "Invalid metrics are ignored, and you'll be notified in the response. The evaluation completes based on the valid fields submitted."
    },
    {
      question: "Can I test the API before going live?",
      answer:
        "Yes! Contact support for a sandbox environment or use your API key in test mode."
    },
    {
      question: "What if I lose my report_id?",
      answer:
        "If your ingestion and generation process is complete then the Report is visible in the 'Responsible AI Report' tab. There you will find the 'report_id'."
    }
  ];

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-4 mx-auto my-6 w-full max-w-5xl duration-500">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-tertiary-50 to-indigo-50 shadow-lg dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-tertiary-400/20 to-indigo-500/20 blur-3xl"></div>
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
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-tertiary-500 to-indigo-600 shadow-lg">
              <Code className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
              CognitiveView Metrics API Guide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Securely and seamlessly submit your evaluation metrics using
              frameworks like DeepEval, Opik, Evidently, or Moonshot
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {apiSteps.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tertiary-500 to-indigo-600 text-sm font-bold text-white shadow-md">
                    {item.step}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="rounded-lg border border-gray-200/50 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/70">
                      <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
                        {item.title}
                      </h3>

                      {item.subtitle && (
                        <p className="mb-2 text-sm italic text-gray-600 dark:text-gray-400">
                          {item.subtitle}
                        </p>
                      )}

                      {item.description && (
                        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      )}

                      {item.notes && (
                        <ul className="mb-3 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {item.notes.map((note, noteIndex) => (
                            <li key={noteIndex}>{note}</li>
                          ))}
                        </ul>
                      )}

                      {item.link && (
                        <div className="space-y-2">
                          <a
                            href={`https://${item.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-medium text-tertiary-600 hover:text-tertiary-800 dark:text-tertiary-400 dark:hover:text-tertiary-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {item.link}
                          </a>
                        </div>
                      )}

                      {item.endpoint && (
                        <div className="space-y-2">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Endpoint:
                            </span>
                            <button
                              onClick={() =>
                                handleCopy(item.endpoint, `endpoint-${index}`)
                              }
                              className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              {copiedSection === `endpoint-${index}` ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                          <div className="font-mono overflow-x-auto rounded-lg bg-gray-100 p-3 text-sm dark:bg-gray-800">
                            <code className="text-tertiary-600 dark:text-tertiary-400">
                              POST {item.endpoint}
                            </code>
                          </div>
                        </div>
                      )}

                      {item.requestBody && (
                        <div className="mt-3 space-y-2">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Example Request Body (DeepEval):
                            </span>
                            <button
                              onClick={() =>
                                handleCopy(
                                  item.requestBody!,
                                  `request-${index}`
                                )
                              }
                              className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              {copiedSection === `request-${index}` ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                          <div className="font-mono max-h-80 overflow-x-auto overflow-y-auto rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
                            <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                              {item.requestBody}
                            </pre>
                          </div>
                        </div>
                      )}

                      {item.response && (
                        <div className="mt-3 space-y-2">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Expected Response:
                            </span>
                            <button
                              onClick={() =>
                                handleCopy(item.response!, `response-${index}`)
                              }
                              className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              {copiedSection === `response-${index}` ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                          <div className="font-mono rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950/30">
                            <pre className="whitespace-pre-wrap text-green-800 dark:text-green-200">
                              {item.response}
                            </pre>
                          </div>
                        </div>
                      )}

                      {item.reportEndpoint && (
                        <div className="mt-3 space-y-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Report Endpoint:
                          </span>
                          <a
                            href={item.reportEndpoint}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-medium text-tertiary-600 hover:text-tertiary-800 dark:text-tertiary-400 dark:hover:text-tertiary-300"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Get Report API Documentation
                          </a>
                          {item.reportDescription && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.reportDescription}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < apiSteps.length - 1 && (
                  <div className="absolute left-4 top-8 h-6 w-0.5 bg-gradient-to-b from-tertiary-300 to-indigo-300 dark:from-tertiary-600 dark:to-indigo-600"></div>
                )}
              </div>
            ))}
          </div>

          {/* FAQs Section */}
          <div className="mt-12">
            <h3 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200/50 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/70"
                >
                  <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                    Q{index + 1}: {faq.question}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="rounded-lg border border-tertiary-200 bg-tertiary-50 p-4 dark:border-tertiary-800 dark:bg-tertiary-950/30">
              <p className="text-sm text-tertiary-800 dark:text-tertiary-200">
                💡 <strong>Need Help?</strong> Visit our{" "}
                <a
                  href="https://developers.cognitiveview.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  developer documentation
                </a>{" "}
                for more detailed examples and troubleshooting guides.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default APIDetailsCard;
