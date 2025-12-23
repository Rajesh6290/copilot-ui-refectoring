import { useEffect, useState } from "react";
import { CircleDisplayMode } from "./RiskRegister";

const AnimatedCircle: React.FC<{
  displayData: CircleDisplayMode;
  onClick: () => void;
  size?: number;
}> = ({ displayData, onClick, size = 200 }) => {
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [currentPercentage, setCurrentPercentage] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    setCurrentValue(0);
    setCurrentTotal(0);
    setCurrentPercentage(0);
    const timer = setTimeout(() => {
      setCurrentValue(displayData.value);
      setCurrentTotal(displayData.total);
      setCurrentPercentage(displayData.percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [displayData.value, displayData.total, displayData.percentage]);

  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = size * 0.1;
  const center = size / 2;
  const offset = circumference - (currentPercentage / 100) * circumference;

  // Get color scheme - ONLY 2 modes
  const getColorScheme = () => {
    if (displayData.mode === "mitigated") {
      return {
        gradient: {
          from: "#4ade80",
          via: "#22c55e",
          to: "#16a34a"
        },
        textColor: "text-green-500"
      };
    } else {
      return {
        gradient: {
          from: "#ef4444",
          via: "#dc2626",
          to: "#b91c1c"
        },
        textColor: "text-red-500"
      };
    }
  };

  const colorScheme = getColorScheme();

  return (
    <div
      tabIndex={0}
      role="button"
      className="group relative inline-block cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (onClick) {
            onClick();
          }
        }
      }}
    >
      {/* Hover glow effect */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${colorScheme.textColor} opacity-0 blur-xl filter transition-opacity duration-200 group-hover:opacity-20 ${isHovered ? "scale-110" : "scale-100"} `}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`-rotate-90 transform transition-transform duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
      >
        <defs>
          <linearGradient
            id={`progressGradient-${displayData.mode}`}
            gradientUnits="userSpaceOnUse"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={colorScheme.gradient.from} />
            {colorScheme.gradient.via && (
              <stop offset="50%" stopColor={colorScheme.gradient.via} />
            )}
            <stop offset="100%" stopColor={colorScheme.gradient.to} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          className="opacity-50"
        />

        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#progressGradient-${displayData.mode})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Centered text - Shows ratio format */}
      <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform">
        <span className={`text-2xl font-bold ${colorScheme.textColor}`}>
          {Math.round(currentValue)}/{Math.round(currentTotal)}
        </span>
        <span className="text-center text-sm text-gray-500 dark:text-white">
          {displayData.label}
        </span>
      </div>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 transform">
        <div className="flex space-x-1">
          <div
            className={`h-2 w-2 rounded-full ${displayData.mode === "mitigated" ? "bg-green-500" : "bg-gray-300"}`}
          ></div>
          <div
            className={`h-2 w-2 rounded-full ${displayData.mode === "not_mitigated" ? "bg-red-500" : "bg-gray-300"}`}
          ></div>
        </div>
      </div>
    </div>
  );
};
export default AnimatedCircle;
