import { useState } from "react";
import { useCopyToClipboard } from "./SlackIntegration";
import { Check, Copy } from "lucide-react";

const SetupGuide = () => {
  const [host] = useState(
    typeof window !== "undefined" ? window.location.host : ""
  );
  const redirectUri = `https://${host}/auth/slack/callback`;
  const { copied, copyToClipboard } = useCopyToClipboard();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="relative overflow-hidden bg-gradient-to-r from-tertiary-600 via-indigo-600 to-purple-600 px-8 py-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-white/5"></div>
        <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-24 translate-y-24 rounded-full bg-white/5"></div>

        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
            <div className="text-3xl">🔧</div>
          </div>
          <div>
            <h3 className="mb-1 text-2xl font-bold text-white">
              Quick Setup Guide
            </h3>
            <p className="text-tertiary-100">
              Follow these steps to configure your Slack integration seamlessly
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-tertiary-500 to-indigo-500 text-sm font-bold text-white shadow-lg">
              1
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Create a Slack App
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Visit{" "}
                <a
                  href="https://api.slack.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-tertiary-50 px-2 py-1 font-semibold text-tertiary-600 hover:underline dark:bg-tertiary-900/30 dark:text-tertiary-400"
                >
                  {"api.slack.com/apps"}
                </a>{" "}
                → choose{" "}
                <span className="rounded bg-gray-100 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {"From scratch"}
                </span>
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
                {'Go to "OAuth & Permissions"'}
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Navigate to the{" "}
                <span className="rounded bg-gray-100 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {'"OAuth & Permissions"'}
                </span>{" "}
                section in your app settings
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
                Add Redirect URI
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                {"Copy this URL to your Slack app's redirect URIs:"}
              </p>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-tertiary-50 p-4 dark:border-gray-600 dark:from-gray-800 dark:to-gray-700">
                <code className="font-mono flex-1 break-all text-sm text-gray-700 dark:text-gray-300">
                  {redirectUri}
                </code>
                <button
                  onClick={() =>
                    copyToClipboard(
                      "https://qa-frontend.cognitiveview.com/auth/slack/callback"
                    )
                  }
                  className="flex items-center gap-2 rounded-lg bg-tertiary-500 px-3 py-2 text-white shadow-md transition-colors hover:bg-tertiary-600"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {copied ? "Copied!" : "Copy"}
                  </span>
                </button>
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
                Add Bot Token Scopes
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                {"Add these required permissions to your bot:"}
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="flex items-center gap-3">
                    <code className="font-mono rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-800 dark:text-green-200">
                      {"chat:write"}
                    </code>
                    <span className="text-sm text-green-700 dark:text-green-300">
                      {"– to send messages"}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-tertiary-200 bg-gradient-to-r from-tertiary-50 to-indigo-50 p-4 dark:border-tertiary-700 dark:from-tertiary-900/20 dark:to-indigo-900/20">
                  <div className="flex items-center gap-3">
                    <code className="font-mono rounded-lg bg-tertiary-100 px-3 py-1 text-sm font-semibold text-tertiary-800 dark:bg-tertiary-800 dark:text-tertiary-200">
                      {"channels:join"}
                    </code>
                    <span className="text-sm text-tertiary-700 dark:text-tertiary-300">
                      {"– to join public channels"}
                    </span>
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
                Install the App
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Click{" "}
                <span className="rounded bg-gray-100 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {'"Install to Workspace"'}
                </span>{" "}
                and approve all requested permissions
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
                Copy Credentials
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                {" From your app's"}{" "}
                <span className="rounded bg-gray-100 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {'"Basic Information"'}
                </span>{" "}
                page, copy the{" "}
                <span className="font-semibold text-tertiary-600 dark:text-tertiary-400">
                  Client ID
                </span>{" "}
                and{" "}
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  Client Secret
                </span>
              </p>
            </div>
          </div>

          {/* Step 7 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-green-500 text-sm font-bold text-white shadow-lg">
              7
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Configure in CognitiveView
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Paste your credentials into the{" "}
                <span className="rounded bg-gray-100 px-2 py-1 font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Slack Integration form
                </span>{" "}
                above
              </p>
            </div>
          </div>

          {/* Step 8 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-sm font-bold text-white shadow-lg">
              8
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Authorize Slack
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Click{" "}
                <span className="rounded bg-tertiary-50 px-2 py-1 font-semibold text-tertiary-600 dark:bg-tertiary-900/30 dark:text-tertiary-400">
                  {'"Authorize Slack"'}
                </span>{" "}
                and complete the OAuth process in the popup window
              </p>
            </div>
          </div>

          {/* Step 9 */}
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-sm font-bold text-white shadow-lg">
              9
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                Add Channels
              </h4>
              <p className="mb-3 text-gray-600 dark:text-gray-400">
                Go to the{" "}
                <span className="rounded bg-green-50 px-2 py-1 font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  {'"Channels"'}
                </span>{" "}
                section in CognitiveView and{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  add public channels
                </span>{" "}
                to receive notifications
              </p>
              <div className="mt-3 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-3 dark:border-amber-700 dark:from-amber-900/20 dark:to-yellow-900/20">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">💡 {"Pro Tip:"}</span>{" "}
                  {
                    "No need to manually invite the bot to channels it will automatically join when configured!"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h4 className="mb-1 text-lg font-bold">{"You're All Set! 🎉"}</h4>
              <p className="text-green-100">
                {
                  "Once completed, your Slack workspace will be ready to receive notifications from CognitiveView."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SetupGuide;
