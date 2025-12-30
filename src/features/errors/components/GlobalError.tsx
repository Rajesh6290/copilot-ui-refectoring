"use client";

const GlobalError = ({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <div className="h-dvh w-full">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url(https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.3.45/css/materialdesignicons.min.css);
            @import url('https://cdn.jsdelivr.net/npm/tailwindcss@3.3.0/dist/tailwind.min.css');
          `
        }}
      />
      <div className="min-w-screen relative flex min-h-screen items-center overflow-hidden bg-purple-50 p-5 lg:p-20">
        <div className="relative min-h-full min-w-full flex-1 items-center rounded-3xl bg-white p-10 text-center text-gray-800 shadow-xl md:flex md:text-left lg:p-20">
          <div className="w-full md:w-1/2">
            <div className="mb-10 lg:mb-20">
              <div className="mb-8 text-6xl font-black text-purple-600">
                CRITICAL ERROR
              </div>
            </div>
            <div className="mb-10 font-light text-gray-600 md:mb-20">
              <h1 className="mb-10 text-3xl font-black uppercase text-purple-600 lg:text-5xl">
                Something Went Wrong!
              </h1>
              <p className="font-medium text-gray-700">
                A critical error has occurred in the application.
              </p>
              <p className="font-medium text-gray-700">
                Our team has been notified and is working on a fix.
              </p>
              {process.env.NODE_ENV === "development" && (
                <div className="mt-6 rounded-lg bg-red-50 p-4 text-left">
                  <p className="text-sm font-semibold text-red-800">
                    Development Error:
                  </p>
                  <p className="mt-2 break-words text-sm text-red-600">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="mt-2 text-xs text-red-500">
                      Error Digest: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mb-20 flex flex-col gap-4 md:mb-0 md:flex-row md:gap-6">
              <button
                type="button"
                onClick={() => reset()}
                className="transform text-lg font-semibold text-purple-600 outline-none transition-all hover:scale-110 hover:text-purple-700 focus:outline-none"
              >
                <i className="mdi mdi-refresh mr-2"></i>Try Again
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="transform text-lg font-semibold text-gray-600 outline-none transition-all hover:scale-110 hover:text-gray-700 focus:outline-none"
              >
                <i className="mdi mdi-home mr-2"></i>Go Home
              </button>
            </div>
          </div>
          <div className="w-full text-center md:w-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 500 400"
              className="mx-auto w-full max-w-lg lg:max-w-full"
            >
              {/* Background */}
              <rect fill="#fff" width="500" height="400" />

              {/* Ground shadow */}
              <ellipse
                cx="250"
                cy="380"
                rx="220"
                ry="25"
                fill="#e9d5ff"
                opacity="0.4"
              />

              {/* Main broken computer/system */}
              <rect
                x="120"
                y="180"
                width="260"
                height="180"
                rx="12"
                fill="#7c3aed"
              />
              <rect
                x="120"
                y="180"
                width="260"
                height="40"
                rx="12"
                fill="#6d28d9"
              />
              <rect
                x="135"
                y="195"
                width="230"
                height="10"
                rx="5"
                fill="#a78bfa"
                opacity="0.5"
              />

              {/* Screen with error */}
              <rect
                x="145"
                y="235"
                width="210"
                height="110"
                rx="8"
                fill="#1e1b4b"
              />

              {/* Error skull/danger symbol */}
              <g transform="translate(250, 270)">
                {/* Skull */}
                <ellipse cx="0" cy="0" rx="30" ry="35" fill="#fbbf24" />
                <ellipse cx="0" cy="5" rx="25" ry="28" fill="#f59e0b" />
                {/* Eyes */}
                <ellipse cx="-10" cy="-5" rx="6" ry="10" fill="#1e1b4b" />
                <ellipse cx="10" cy="-5" rx="6" ry="10" fill="#1e1b4b" />
                {/* Nose */}
                <path d="M -4,8 L 0,15 L 4,8 Z" fill="#1e1b4b" />
                {/* Mouth */}
                <rect x="-12" y="18" width="5" height="8" fill="#1e1b4b" />
                <rect x="-4" y="18" width="5" height="8" fill="#1e1b4b" />
                <rect x="4" y="18" width="5" height="8" fill="#1e1b4b" />
              </g>

              {/* Crack lines on screen */}
              <line
                x1="200"
                y1="240"
                x2="280"
                y2="320"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0.8"
              />
              <line
                x1="250"
                y1="235"
                x2="250"
                y2="345"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0.8"
              />
              <line
                x1="300"
                y1="250"
                x2="220"
                y2="330"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0.8"
              />
              <line
                x1="160"
                y1="270"
                x2="200"
                y2="310"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0.6"
              />
              <line
                x1="300"
                y1="280"
                x2="340"
                y2="320"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0.6"
              />

              {/* Danger lights */}
              <circle cx="145" cy="200" r="6" fill="#ef4444" opacity="0.9">
                <animate
                  attributeName="opacity"
                  values="0.9;0.3;0.9"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="165" cy="200" r="6" fill="#f97316" opacity="0.7" />
              <circle cx="185" cy="200" r="6" fill="#fbbf24" opacity="0.7" />

              {/* Lightning bolts - system crash */}
              <g transform="translate(80, 200)">
                <path
                  d="M 0,0 L 8,-20 L 3,-20 L 10,-40 L -5,-15 L 0,-15 Z"
                  fill="#fbbf24"
                  opacity="0.9"
                >
                  <animate
                    attributeName="opacity"
                    values="0.9;0.4;0.9"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              <g transform="translate(400, 220)">
                <path
                  d="M 0,0 L 8,-20 L 3,-20 L 10,-40 L -5,-15 L 0,-15 Z"
                  fill="#fbbf24"
                  opacity="0.9"
                >
                  <animate
                    attributeName="opacity"
                    values="0.4;0.9;0.4"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Smoke/steam coming out */}
              <g opacity="0.6">
                <ellipse cx="200" cy="165" rx="15" ry="10" fill="#94a3b8">
                  <animate
                    attributeName="cy"
                    values="165;150;165"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.2;0.6"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </ellipse>
                <ellipse cx="220" cy="170" rx="18" ry="12" fill="#94a3b8">
                  <animate
                    attributeName="cy"
                    values="170;155;170"
                    dur="3.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.2;0.6"
                    dur="3.5s"
                    repeatCount="indefinite"
                  />
                </ellipse>
                <ellipse cx="240" cy="168" rx="16" ry="11" fill="#94a3b8">
                  <animate
                    attributeName="cy"
                    values="168;153;168"
                    dur="3.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.2;0.6"
                    dur="3.2s"
                    repeatCount="indefinite"
                  />
                </ellipse>
              </g>

              {/* Error code display */}
              <text
                x="250"
                y="120"
                fontSize="48"
                fontWeight="bold"
                fill="#7c3aed"
                textAnchor="middle"
                fontFamily="monospace"
              >
                ERROR
              </text>

              {/* Floating error particles */}
              <circle cx="90" cy="280" r="4" fill="#c084fc" opacity="0.7">
                <animate
                  attributeName="cy"
                  values="280;270;280"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="410" cy="300" r="5" fill="#c084fc" opacity="0.6">
                <animate
                  attributeName="cy"
                  values="300;290;300"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="100" cy="250" r="3" fill="#a78bfa" opacity="0.8">
                <animate
                  attributeName="cy"
                  values="250;240;250"
                  dur="2.2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="420" cy="260" r="4" fill="#a78bfa" opacity="0.7">
                <animate
                  attributeName="cy"
                  values="260;250;260"
                  dur="2.8s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Warning symbols floating */}
              <g transform="translate(60, 320)" opacity="0.7">
                <path d="M 0,-10 L 8,8 L -8,8 Z" fill="#fbbf24" />
                <text
                  x="0"
                  y="6"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#78350f"
                  textAnchor="middle"
                >
                  !
                </text>
                <animate
                  attributeName="opacity"
                  values="0.7;0.3;0.7"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </g>

              <g transform="translate(440, 340)" opacity="0.6">
                <path d="M 0,-10 L 8,8 L -8,8 Z" fill="#fbbf24" />
                <text
                  x="0"
                  y="6"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#78350f"
                  textAnchor="middle"
                >
                  !
                </text>
                <animate
                  attributeName="opacity"
                  values="0.6;0.3;0.6"
                  dur="2.3s"
                  repeatCount="indefinite"
                />
              </g>

              {/* Clouds */}
              <g opacity="0.3">
                <ellipse cx="400" cy="80" rx="30" ry="18" fill="#e9d5ff" />
                <ellipse cx="380" cy="86" rx="22" ry="14" fill="#e9d5ff" />
                <ellipse cx="420" cy="86" rx="20" ry="13" fill="#e9d5ff" />
              </g>
            </svg>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-64 right-20 h-96 w-64 -rotate-45 transform rounded-full bg-purple-100 bg-opacity-30 md:-top-96 md:right-32 md:h-full md:w-96"></div>
        <div className="pointer-events-none absolute -bottom-96 right-64 h-full w-96 -rotate-45 transform rounded-full bg-purple-200 bg-opacity-20"></div>
      </div>
    </div>
  );
};
export default GlobalError;
