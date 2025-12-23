import { useEffect, useState } from "react";
import { RiskData } from "./Overview";

interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  riskLevel: number;
  animationDelay: number;
}
interface DynamicHeatmapProps {
  riskData: RiskData;
  title: string;
  isAnimating: boolean;
}
const DynamicHeatmap: React.FC<DynamicHeatmapProps> = ({
  riskData,
  title,
  isAnimating
}) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [showAnimation, setShowAnimation] = useState<boolean>(true);

  useEffect(() => {
    if (!riskData) {
      return;
    }

    const matrix: HeatmapCell[] = [];
    const size = riskData.matrix_size;

    // Calculate center-outward animation order
    const getCellDistance = (x: number, y: number) => {
      const centerX = Math.floor(size / 2);
      const centerY = Math.floor(size / 2);
      return Math.abs(x - centerX) + Math.abs(y - centerY);
    };

    // Build heatmap data from API response - reverse Y to fix orientation
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const distance = getCellDistance(x, y);
        const value = riskData.risk_count_matrix[size - 1 - y]?.[x] ?? 0; // Reverse Y index
        const riskLevel =
          riskData.classified_risk_matrix[size - 1 - y]?.[x] ?? 0; // Reverse Y index

        matrix.push({
          x,
          y,
          value,
          riskLevel,
          animationDelay: distance * 0.1
        });
      }
    }

    setHeatmapData(matrix);

    // Handle animation timing
    if (isAnimating) {
      setShowAnimation(true);
      const maxDistance = Math.floor(size / 2) * 2;
      setTimeout(
        () => {
          setShowAnimation(false);
        },
        maxDistance * 100 + 500
      );
    } else {
      setShowAnimation(false);
    }
  }, [riskData, isAnimating]);

  // Get cell color based on risk level and value - purely from API data
  const getCellColor = (riskLevel: number, value: number): string => {
    // Dynamic color mapping based on API classified_risk_matrix values
    const riskColors: { [key: number]: string } = {
      0: "#53BD6F", // Green - Low Risk
      1: "#FFBE0F", // Amber - Medium Risk
      2: "#F06C6C" // Red - High Risk
    };

    const fadedColors: { [key: number]: string } = {
      0: "#E8F5EA", // Faded Green
      1: "#FFF5D6", // Faded Amber
      2: "#FDEAEA" // Faded Red
    };

    // If no risk count, show faded color based on risk classification
    if (value === 0) {
      return fadedColors[riskLevel] || "#f5f5f5"; // Default gray if unknown level
    }

    // If has risk count, show full color based on risk classification
    return riskColors[riskLevel] || "#d1d5db"; // Default gray if unknown level
  };

  if (!riskData) {
    return (
      <div className="shadow-1 relative h-48 w-full overflow-hidden rounded-xl bg-white p-5 drop-shadow-1">
        <p className="absolute left-5 top-3 text-sm font-medium text-gray-800 md:text-lg">
          {title}
        </p>
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const size = riskData.matrix_size;
  const cellSize = size === 3 ? 100 : 80;
  const padding = size === 3 ? 120 : 100;
  const svgWidth = size * cellSize + padding * 2;
  const svgHeight = size * cellSize + padding * 2;

  return (
    <div className="shadow-1 relative h-fit w-full overflow-hidden rounded-xl bg-white p-5 drop-shadow-1">
      <p className="absolute left-5 top-3 z-10 text-sm font-medium text-gray-800 md:text-lg">
        {title}
      </p>

      <div className="flex h-full items-center justify-center">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="h-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-full"
          // style={{ backgroundColor: "#fafafa" }}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          {riskData.likelihood_labels.map((label, index) => (
            <text
              key={`likelihood-${index}`}
              x={padding + index * cellSize + cellSize / 2}
              y={svgHeight - 75}
              textAnchor="middle"
              className="fill-gray-700 text-xs font-medium"
            >
              <tspan className="sm:hidden">
                {size === 3
                  ? label.split(" ")[0]
                  : label.length > 8
                    ? label.split(" ")[0]
                    : label}
              </tspan>
              <tspan className="hidden sm:inline">
                {size === 3 ? label.split(" ")[0] : label}
              </tspan>
            </text>
          ))}
          {riskData.impact_labels
            .slice()
            .reverse()
            .map((label, index) => (
              <text
                key={`impact-${index}`}
                x={35}
                y={padding + index * cellSize + cellSize / 2 + 40}
                textAnchor="middle"
                className="fill-gray-700 text-xs font-medium"
                transform={`rotate(-90, 35, ${padding + index * cellSize + cellSize / 2 + 4})`}
              >
                {/* Simple labels for 3x3, Detailed for 5x5 */}
                <tspan className="sm:hidden">
                  {size === 3
                    ? label.split(" ")[0]
                    : label.length > 8
                      ? label.split(" ")[0]
                      : label}
                </tspan>
                <tspan className="hidden sm:inline">
                  {size === 3 ? label.split(" ")[0] : label}
                </tspan>
              </text>
            ))}

          {/* Axis labels */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 8}
            textAnchor="middle"
            className="fill-gray-800 text-xs font-semibold sm:text-sm lg:text-base"
          >
            Likelihood
          </text>

          <text
            x={12}
            y={svgHeight / 2}
            textAnchor="middle"
            className="fill-gray-800 text-xs font-semibold sm:text-sm lg:text-base"
            transform={`rotate(-90, 12, ${svgHeight / 2})`}
          >
            Impact
          </text>

          {/* Heatmap cells */}
          {heatmapData.map((cell) => (
            <g key={`cell-${cell.x}-${cell.y}`}>
              <rect
                x={padding + cell.x * cellSize + 1}
                y={padding + cell.y * cellSize + 1}
                width={cellSize - 2}
                height={cellSize - 2}
                fill={getCellColor(cell.riskLevel, cell.value)}
                stroke="#ffffff"
                strokeWidth="2"
                rx="4"
                style={{
                  filter:
                    cell.value > 0
                      ? "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                      : "none",
                  opacity: showAnimation ? 0 : 1,
                  animation: showAnimation
                    ? `fadeIn 0.6s ease-out ${cell.animationDelay}s forwards`
                    : "none"
                }}
              />

              {/* Risk count display */}
              {cell.value > 0 && (
                <text
                  x={padding + cell.x * cellSize + cellSize / 2}
                  y={padding + cell.y * cellSize + cellSize / 2 + 8}
                  textAnchor="middle"
                  className={`fill-gray-800 font-bold ${
                    size === 3 ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
                  }`}
                  style={{
                    textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    opacity: showAnimation ? 0 : 1,
                    animation: showAnimation
                      ? `fadeIn 0.4s ease-out ${cell.animationDelay + 0.2}s forwards`
                      : "none"
                  }}
                >
                  {cell.value}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* CSS Animation styles */}
      <style>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
export default DynamicHeatmap;
