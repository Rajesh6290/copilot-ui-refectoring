import { useEffect, useState } from "react";
interface RiskLevel {
  label: string;
  gradient: {
    from: string;
    via?: string;
    to: string;
  };
  textColor: string;
}
const getRiskLevel = (score: number): RiskLevel => {
  if (score >= 50) {
    return {
      label: "Low",
      gradient: {
        from: "#4ade80",
        via: "#22c55e",
        to: "#16a34a"
      },
      textColor: "text-green-500"
    };
  }
  if (score <= 50) {
    return {
      label: "Medium",
      gradient: {
        from: "#fb923c",
        via: "#f97316",
        to: "#ea580c"
      },
      textColor: "text-orange-500"
    };
  }
  return {
    label: "High",
    gradient: {
      from: "#ef4444",
      via: "#dc2626",
      to: "#b91c1c"
    },
    textColor: "text-red-500"
  };
};
const AnimatedCircle: React.FC<{ value: number; size?: number }> = ({
  value,
  size = 200
}) => {
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    setCurrentValue(0);
    const timer = setTimeout(() => {
      setCurrentValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = size * 0.1;
  const center = size / 2;
  const offset = circumference - (currentValue / 100) * circumference;
  const riskLevel = getRiskLevel(value);

  return (
    <div
      className="group relative inline-block cursor-pointer py-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover glow effect */}
      <div
        className={`absolute inset-0 flex flex-col items-center gap-3 rounded-full bg-gradient-to-r ${riskLevel.textColor} opacity-0 blur-xl filter transition-opacity duration-200 group-hover:opacity-20 ${isHovered ? "scale-110" : "scale-100"} `}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`-rotate-90 transform transition-transform duration-500 ${isHovered ? "scale-105" : "scale-100"}`}
      >
        <defs>
          <linearGradient
            id={`progressGradient-${value}`}
            gradientUnits="userSpaceOnUse"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={riskLevel.gradient.from} />
            {riskLevel.gradient.via && (
              <stop offset="50%" stopColor={riskLevel.gradient.via} />
            )}
            <stop offset="100%" stopColor={riskLevel.gradient.to} />
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
          stroke={`url(#progressGradient-${value})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <p className="text-lg font-medium tracking-wider text-neutral-700 dark:text-gray-300">
        Compliance Status
      </p>
      {/* Centered text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center transition-transform">
        <span className={`text-3xl font-bold ${riskLevel.textColor}`}>
          {Math.round(currentValue)}%
        </span>
        <span className="text-sm text-gray-500 dark:text-white">Complaint</span>
      </div>
    </div>
  );
};
export default AnimatedCircle;
