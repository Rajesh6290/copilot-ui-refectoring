import { Calendar, Check, Key, Mail, Server } from "lucide-react";

const JiraSetupGuide = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-white/5"></div>
        <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-24 translate-y-24 rounded-full bg-white/5"></div>

        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
            <div className="text-3xl">🔧</div>
          </div>
          <div>
            <h3 className="mb-1 text-2xl font-bold text-white">
              Jira Integration Setup Guide
            </h3>
            <p className="text-blue-100">
              Follow these steps to configure your Jira integration seamlessly
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-sm font-bold text-white shadow-lg">
              1
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Access Atlassian Account Settings
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Go to{" "}
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-blue-50 px-2 py-1 font-semibold text-blue-600 hover:underline dark:bg-blue-900/30 dark:text-blue-400"
                >
                  id.atlassian.com/manage-profile/security/api-tokens
                </a>
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-bold text-white shadow-lg">
              2
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Create API Token
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Click{" "}
                <span className="rounded bg-gray-100 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {'"Create API token"'}
                </span>{" "}
                {
                  ' and give it a descriptive label like "CognitiveView Integration"'
                }
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg">
              3
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Copy Your API Token
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                {
                  " Save the generated API token securely. You'll need it for the configuration form."
                }
              </p>
              <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-3 dark:border-amber-700 dark:from-amber-900/20 dark:to-yellow-900/20">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">⚠️ Important:</span> This
                  token will only be shown once. Make sure to copy it
                  immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-sm font-bold text-white shadow-lg">
              4
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Gather Required Information
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                {" You'll need the following information for configuration:"}
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <span className="font-semibold text-blue-800 dark:text-blue-200">
                        Jira Base URL
                      </span>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your Jira instance URL (e.g.,
                        https://yourcompany.atlassian.net)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <span className="font-semibold text-green-800 dark:text-green-200">
                        Jira Email
                      </span>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Your Atlassian account email address
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-700 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div className="flex-1">
                      <span className="font-semibold text-purple-800 dark:text-purple-200">
                        API Token
                      </span>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        The API token you just created
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-4 dark:border-orange-700 dark:from-orange-900/20 dark:to-red-900/20">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <div className="flex-1">
                      <span className="font-semibold text-orange-800 dark:text-orange-200">
                        Default Project Key
                      </span>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {
                          ' The project key where issues will be created by default (e.g., "OPS")'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-sm font-bold text-white shadow-lg">
              5
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Configure in CognitiveView
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Enter all the gathered information in the{" "}
                <span className="rounded bg-gray-100 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Jira Integration form
                </span>{" "}
                {' above and click "Configure Jira"'}
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-sm font-bold text-white shadow-lg">
              6
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Test Your Connection
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Once configured, the system will test the connection and display
                the status.
              </p>
              <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <span className="font-semibold">✅ Success:</span> Your Jira
                  integration is now ready to create and manage issues!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h4 className="mb-1 text-lg font-bold">Integration Benefits</h4>
                <ul className="space-y-1 text-sm text-blue-100">
                  <li>• Automatically create Jira issues from CognitiveView</li>
                  <li>• Seamlessly track and manage tasks</li>
                  <li>• Maintain audit trails between systems</li>
                  <li>• Streamline workflow processes</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Need Help?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you encounter any issues during setup, check our documentation
              or contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default JiraSetupGuide;
