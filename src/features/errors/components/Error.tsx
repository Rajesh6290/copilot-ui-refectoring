"use client";

const Error = ({
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
      `
        }}
      />
      <div className="min-w-screen relative flex min-h-screen items-center overflow-hidden bg-red-50 p-5 lg:p-20">
        <div className="relative min-h-full min-w-full flex-1 items-center rounded-3xl bg-white p-10 text-center text-gray-800 shadow-xl md:flex md:text-left lg:p-20">
          <div className="w-full md:w-1/2">
            <div className="mb-10 lg:mb-20">
              <img
                src="/sideBarLogoDark.svg"
                alt="logo"
                className="mb-8 h-fit w-72 object-center"
              />
            </div>
            <div className="mb-10 font-light text-gray-600 md:mb-20">
              <h1 className="mb-10 text-3xl font-black uppercase text-red-600 lg:text-5xl">
                Internal Server Error!
              </h1>
              <p className="font-medium text-gray-700">
                Oops! Something went wrong on our end.
              </p>
              <p className="font-medium text-gray-700">
                {"We're working to fix the issue. Please try again later."}
              </p>
              {process.env.NODE_ENV === "development" && (
                <p className="mt-4 font-medium text-red-500">
                  Error: {error.message}
                </p>
              )}
            </div>
            <div className="mb-20 flex flex-col gap-4 md:mb-0 md:flex-row md:gap-6">
              <button
                type="button"
                onClick={() => reset()}
                className="transform text-lg font-semibold text-red-600 outline-none transition-all hover:scale-110 hover:text-red-700 focus:outline-none"
              >
                <i className="mdi mdi-refresh mr-2"></i>Try Again
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="transform text-lg font-semibold text-gray-600 outline-none transition-all hover:scale-110 hover:text-gray-700 focus:outline-none"
              >
                <i className="mdi mdi-arrow-left mr-2"></i>Go Back
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

              {/* Ground */}
              <ellipse
                cx="250"
                cy="380"
                rx="200"
                ry="20"
                fill="#fecaca"
                opacity="0.3"
              />

              {/* Server Stack - Bottom */}
              <rect
                x="150"
                y="280"
                width="200"
                height="60"
                rx="8"
                fill="#dc2626"
              />
              <rect
                x="150"
                y="280"
                width="200"
                height="15"
                rx="8"
                fill="#b91c1c"
              />
              <circle cx="170" cy="310" r="5" fill="#fca5a5" />
              <circle cx="185" cy="310" r="5" fill="#fca5a5" />
              <circle cx="200" cy="310" r="5" fill="#ef4444" />
              <rect
                x="220"
                y="305"
                width="110"
                height="3"
                rx="1.5"
                fill="#7f1d1d"
                opacity="0.3"
              />
              <rect
                x="220"
                y="313"
                width="90"
                height="3"
                rx="1.5"
                fill="#7f1d1d"
                opacity="0.3"
              />
              <rect
                x="220"
                y="321"
                width="80"
                height="3"
                rx="1.5"
                fill="#7f1d1d"
                opacity="0.3"
              />

              {/* Server Stack - Middle */}
              <rect
                x="150"
                y="210"
                width="200"
                height="60"
                rx="8"
                fill="#dc2626"
              />
              <rect
                x="150"
                y="210"
                width="200"
                height="15"
                rx="8"
                fill="#b91c1c"
              />
              <circle cx="170" cy="240" r="5" fill="#fca5a5" />
              <circle cx="185" cy="240" r="5" fill="#fca5a5" />
              <circle cx="200" cy="240" r="5" fill="#ef4444" />
              <rect
                x="220"
                y="235"
                width="110"
                height="3"
                rx="1.5"
                fill="#7f1d1d"
                opacity="0.3"
              />
              <rect
                x="220"
                y="243"
                width="85"
                height="3"
                rx="1.5"
                fill="#7f1d1d"
                opacity="0.3"
              />
              <rect
                x="220"
                y="251"
                width="95"
                height="3"
                rx="1.5"
                fill="#7f1d1d"
                opacity="0.3"
              />

              {/* Server Stack - Top */}
              <rect
                x="150"
                y="140"
                width="200"
                height="60"
                rx="8"
                fill="#dc2626"
              />
              <rect
                x="150"
                y="140"
                width="200"
                height="15"
                rx="8"
                fill="#b91c1c"
              />
              <circle cx="170" cy="170" r="5" fill="#ef4444" />
              <circle cx="185" cy="170" r="5" fill="#fca5a5" />
              <circle cx="200" cy="170" r="5" fill="#fca5a5" />
              <rect
                x="220"
                y="165"
                width="110"
                height="3"
                rx="1.5"
                fill="#7f1d1d"
                opacity="0.3"
              />
              <rect
                x="220"
                y="173"
                width="70"
                height="3"
                rx="1.5"
                fill="#7f1d1d"
                opacity="0.3"
              />
              <rect
                x="220"
                y="181"
                width="100"
                height="3"
                rx="1.5"
                fill="#7f1d1d"
                opacity="0.3"
              />

              {/* Error Symbol - Large "500" */}
              <text
                x="250"
                y="100"
                fontSize="72"
                fontWeight="bold"
                fill="#dc2626"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
              >
                500
              </text>

              {/* Warning Triangle */}
              <g transform="translate(380, 180)">
                <path d="M 0,-30 L 26,20 L -26,20 Z" fill="#fbbf24" />
                <path
                  d="M 0,-30 L 26,20 L -26,20 Z"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y="15"
                  fontSize="28"
                  fontWeight="bold"
                  fill="#78350f"
                  textAnchor="middle"
                >
                  !
                </text>
              </g>

              {/* Spark/Error effects */}
              <circle cx="140" cy="150" r="3" fill="#fca5a5" opacity="0.8" />
              <circle cx="360" cy="160" r="4" fill="#fca5a5" opacity="0.6" />
              <circle cx="130" cy="220" r="2" fill="#ef4444" opacity="0.7" />
              <circle cx="370" cy="240" r="3" fill="#ef4444" opacity="0.8" />
              <circle cx="145" cy="290" r="2" fill="#fca5a5" opacity="0.6" />

              {/* Broken connection lines */}
              <line
                x1="250"
                y1="130"
                x2="240"
                y2="140"
                stroke="#dc2626"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.5"
              />
              <line
                x1="250"
                y1="130"
                x2="260"
                y2="140"
                stroke="#dc2626"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.5"
              />
              <circle cx="250" cy="128" r="4" fill="#dc2626" />

              {/* Small clouds */}
              <g opacity="0.3">
                <ellipse cx="80" cy="80" rx="25" ry="15" fill="#e5e7eb" />
                <ellipse cx="65" cy="85" rx="20" ry="12" fill="#e5e7eb" />
                <ellipse cx="95" cy="85" rx="18" ry="12" fill="#e5e7eb" />
              </g>

              <g opacity="0.3">
                <ellipse cx="420" cy="100" rx="30" ry="18" fill="#e5e7eb" />
                <ellipse cx="400" cy="106" rx="22" ry="14" fill="#e5e7eb" />
                <ellipse cx="440" cy="106" rx="20" ry="13" fill="#e5e7eb" />
              </g>
            </svg>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-64 right-20 h-96 w-64 -rotate-45 transform rounded-full bg-red-100 bg-opacity-30 md:-top-96 md:right-32 md:h-full md:w-96"></div>
        <div className="pointer-events-none absolute -bottom-96 right-64 h-full w-96 -rotate-45 transform rounded-full bg-red-200 bg-opacity-20"></div>
      </div>
    </div>
  );
};
export default Error;
