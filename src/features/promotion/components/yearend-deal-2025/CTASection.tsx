import { Award, Check, Shield, TrendingUp } from "lucide-react";
import { useCallback, useState, useEffect, useRef } from "react";
import TrustCenterModal from "./TrustCenterModal";
import SectionHeader from "./SectionHeader";
import { FadeIn } from "./YearEnd2025";

interface Node {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  phase: number;
  speed: number;
  radius: number;
}

const CTASection = () => {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const nodesRef = useRef<Node[]>([]);

  const handleBookDemo = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const width = 1000;
    const height = 800;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(
      "https://calendly.com/dilip-cognitiveview/30-minute-introductory",
      "BookDemo | CognitiveView",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=yes`
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // 1. Setup Nodes with Random Floating Properties
      const nodeCount = 80; // Slightly reduced count for cleaner look
      const nodes: Node[] = [];

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          // Base position
          baseX: Math.random() * canvas.width,
          baseY: Math.random() * canvas.height,
          // Current position
          x: 0,
          y: 0,
          // Floating physics
          phase: Math.random() * Math.PI * 2, // Random starting point in wave
          speed: 0.0005 + Math.random() * 0.001, // How fast it floats
          radius: 20 + Math.random() * 40 // How far it drifts
        });
      }

      nodesRef.current = nodes;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // 2. Animation Loop (Automatic Floating)
    const animate = () => {
      if (!ctx || !canvas) {
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const time = Date.now();

      // Update positions
      nodes.forEach((node) => {
        // Calculate new position using Sine/Cosine waves based on time
        // This creates the infinite "floating" effect without mouse input
        node.x =
          node.baseX + Math.cos(time * node.speed + node.phase) * node.radius;
        node.y =
          node.baseY + Math.sin(time * node.speed + node.phase) * node.radius;
      });

      // Draw connections
      nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
          if (i >= j) {
            return;
          }

          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Connect nodes that drift close to each other
          if (distance < 130) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);

            const opacity = (1 - distance / 130) * 0.4;
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99, 102, 241, 0.6)";
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section
      id="cta"
      className="relative overflow-hidden py-16 sm:py-20 md:py-24 lg:py-32"
    >
      <TrustCenterModal isOpen={open} onClose={() => setOpen(false)} />

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-cyan-50/40" />

      {/* Floating Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.6, pointerEvents: "none" }}
      />

      {/* Decorative Orbs */}
      <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-3xl" />
      <div
        className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-cyan-200/40 to-blue-200/40 blur-3xl"
        style={{ animationDelay: "1s" }}
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-xs px-4 sm:max-w-2xl sm:px-6 md:max-w-4xl lg:max-w-6xl lg:px-8">
        <SectionHeader
          tag="Trusted by 500+ Organizations"
          title="Start Your AI Governance Journey Today"
          description="Build trust, ensure compliance, and demonstrate responsible AI practices with our comprehensive TrustCenter platform."
          tagColor="text-indigo-600"
          tagBg="bg-indigo-100"
          tagBorder="border-indigo-200"
          titleColor="bg-gradient-to-r from-slate-900 via-indigo-900 to-cyan-900 bg-clip-text text-transparent"
          descriptionColor="text-slate-600"
          className="mb-8 sm:mb-10 lg:mb-12"
          icon={Shield}
        />

        <FadeIn>
          <div className="mb-8 grid gap-4 sm:mb-10 sm:grid-cols-2 sm:gap-5 lg:mb-12 lg:grid-cols-3 lg:gap-6">
            <div className="group relative overflow-hidden rounded-2xl bg-white/80 p-6 shadow-lg shadow-indigo-100/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/60 sm:rounded-3xl sm:p-7 lg:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-100/50 to-transparent blur-2xl transition-all duration-300 group-hover:scale-150" />
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/40 sm:mb-5 sm:h-16 sm:w-16">
                <Check className="h-7 w-7 text-white sm:h-8 sm:w-8" />
              </div>
              <h3 className="relative mb-2 text-lg font-bold text-slate-900 sm:text-xl">
                Instant TrustScore
              </h3>
              <p className="relative text-sm font-medium leading-relaxed text-slate-600">
                Get your AI trust rating in minutes. Benchmark against industry
                standards and track improvements.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/80 p-6 shadow-lg shadow-indigo-100/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/60 sm:rounded-3xl sm:p-7 lg:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-100/50 to-transparent blur-2xl transition-all duration-300 group-hover:scale-150" />
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-cyan-500/40 sm:mb-5 sm:h-16 sm:w-16">
                <Award className="h-7 w-7 text-white sm:h-8 sm:w-8" />
              </div>
              <h3 className="relative mb-2 text-lg font-bold text-slate-900 sm:text-xl">
                Compliance Ready
              </h3>
              <p className="relative text-sm font-medium leading-relaxed text-slate-600">
                Align with ISO 42001, EU AI Act, and NIST AI RMF. Pre-built
                templates and automated assessments.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white/80 p-6 shadow-lg shadow-indigo-100/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/60 sm:col-span-2 sm:rounded-3xl sm:p-7 lg:col-span-1 lg:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-purple-100/50 to-transparent blur-2xl transition-all duration-300 group-hover:scale-150" />
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-purple-500/40 sm:mb-5 sm:h-16 sm:w-16">
                <TrendingUp className="h-7 w-7 text-white sm:h-8 sm:w-8" />
              </div>
              <h3 className="relative mb-2 text-lg font-bold text-slate-900 sm:text-xl">
                Build Trust
              </h3>
              <p className="relative text-sm font-medium leading-relaxed text-slate-600">
                Share your TrustCenter with stakeholders. Transparent
                documentation builds confidence.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-5">
            <button
              onClick={() => setOpen(true)}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40 sm:px-10 sm:py-5 sm:text-lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Your Free TrustScore
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-indigo-700 to-indigo-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
            <button
              onClick={handleBookDemo}
              className="group relative overflow-hidden rounded-full border-2 border-indigo-300 bg-white/50 px-8 py-4 text-base font-bold text-indigo-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-indigo-400 hover:bg-white/80 hover:shadow-lg hover:shadow-indigo-200/50 sm:px-10 sm:py-5 sm:text-lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Book a Demo
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default CTASection;
