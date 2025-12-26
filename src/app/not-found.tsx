// app/not-found.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mousePosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<
    { x: number; y: number; size: number; delay: number; duration: number }[]
  >([]);
  const [scrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [greeting, setGreeting] = useState("");

  // Get current time and set appropriate greeting
  useEffect(() => {
    const getCurrentGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        return "Good Morning";
      } else if (hour >= 12 && hour < 18) {
        return "Good Afternoon";
      } else {
        return "Good Evening";
      }
    };

    setGreeting(getCurrentGreeting());

    // Apply system preference for dark/light mode
    // No need for toggle button - will automatically follow system settings
    if (typeof window !== "undefined") {
      // Create a media query to detect system preference
      const darkModeMediaQuery = window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

      // Function to update the class based on the media query
      const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      };

      // Set the initial state
      updateTheme(darkModeMediaQuery);

      // Listen for changes in the system preference
      darkModeMediaQuery.addEventListener("change", updateTheme);

      // Clean up event listener
      return () =>
        darkModeMediaQuery.removeEventListener("change", updateTheme);
    }

    return undefined;
  }, []);

  // Generate random stars for the background
  useEffect(() => {
    const generateStars = () => {
      const starsArray = [];
      for (let i = 0; i < 150; i++) {
        starsArray.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 0.5,
          delay: Math.random() * 5,
          duration: Math.random() * 2 + 2
        });
      }
      setStars(starsArray);
    };

    generateStars();

    // Delay setting isLoaded to true to ensure animations start after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants with improved smoothness
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 1,
        ease: "easeOut"
      }
    })
  };

  const astronautVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        delay: 0.3
      }
    },
    float: {
      y: [0, -20, 0],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1]
      }
    }
  };

  const meteorVariants = {
    initial: {
      x: "120%",
      y: "-120%",
      opacity: 0
    },
    animate: {
      x: "-120%",
      y: "120%",
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 15
      }
    }
  };

  const calculateParallax = (depth: number) => {
    const x = (mousePosition.x - window.innerWidth / 2) / depth;
    const y = (mousePosition.y - window.innerHeight / 2) / depth;
    return { x, y };
  };

  // Apply scroll race effect (elements moving at different speeds while scrolling)
  const scrollRaceEffect = (speed: number) => {
    return { y: scrollY * speed };
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-blue-50 to-indigo-100 text-gray-800 transition-colors duration-500 dark:bg-gradient-to-b dark:from-black dark:via-indigo-950 dark:to-purple-900 dark:text-white"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Enhanced starry background with smoother animations - only visible in dark mode */}
      <div className="absolute inset-0 hidden overflow-hidden dark:block">
        {/* Deep space nebula effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.15)_0%,transparent_70%)] opacity-80"></div>

        {stars.map((star, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background:
                index % 5 === 0
                  ? "linear-gradient(to right, #f9fafb, #a5b4fc)"
                  : index % 7 === 0
                    ? "linear-gradient(to right, #f9fafb, #f0abfc)"
                    : "#f9fafb",
              boxShadow: index % 3 === 0 ? "0 0 4px #f9fafb" : "none"
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, index % 10 === 0 ? 1.5 : 1, 1]
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Animated meteor shower */}
        <AnimatePresence>
          {isLoaded && (
            <>
              <motion.div
                className="absolute h-20 w-1 bg-gradient-to-b from-transparent via-white to-transparent blur-sm"
                style={{
                  top: "10%",
                  right: "20%",
                  transform: "rotate(-45deg)"
                }}
                variants={meteorVariants}
                initial="initial"
                animate="animate"
                transition={{
                  delay: 3
                }}
              />
              <motion.div
                className="absolute h-32 w-1 bg-gradient-to-b from-transparent via-white to-transparent blur-sm"
                style={{
                  top: "30%",
                  right: "40%",
                  transform: "rotate(-45deg)"
                }}
                variants={meteorVariants}
                initial="initial"
                animate="animate"
                transition={{
                  delay: 8
                }}
              />
              <motion.div
                className="absolute h-14 w-0.5 bg-gradient-to-b from-transparent via-white to-transparent blur-sm"
                style={{
                  top: "15%",
                  left: "30%",
                  transform: "rotate(-45deg)"
                }}
                variants={meteorVariants}
                initial="initial"
                animate="animate"
                transition={{
                  delay: 12
                }}
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Light mode gentle gradient background */}
      <div className="absolute inset-0 overflow-hidden dark:hidden">
        <motion.div
          className="absolute h-24 w-64 rounded-full bg-white opacity-60 blur-xl"
          animate={{
            x: [0, 5, 0],
            y: [0, -3, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            top: "15%",
            left: "10%"
          }}
        />
        <motion.div
          className="absolute h-20 w-48 rounded-full bg-blue-100 opacity-50 blur-xl"
          animate={{
            x: [0, -10, 0],
            y: [0, 5, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            top: "30%",
            right: "15%"
          }}
        />
        <motion.div
          className="absolute h-16 w-56 rounded-full bg-indigo-100 opacity-40 blur-xl"
          animate={{
            x: [0, 10, 0],
            y: [0, 7, 0]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            bottom: "20%",
            left: "25%"
          }}
        />
      </div>

      {/* Parallax scrolling planets - visible in both modes with different styling */}
      <motion.div
        className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 opacity-30 blur-sm dark:from-orange-300 dark:via-red-500 dark:to-rose-700 dark:opacity-50"
        style={{
          ...scrollRaceEffect(-0.1),
          top: "15%",
          left: "10%",
          x: calculateParallax(15).x,
          y: calculateParallax(15).y
        }}
      />

      <motion.div
        className="absolute h-36 w-36 rounded-full bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 opacity-20 blur-sm dark:from-blue-300 dark:via-teal-500 dark:to-emerald-700 dark:opacity-40"
        style={{
          ...scrollRaceEffect(0.15),
          bottom: "20%",
          right: "10%",
          x: calculateParallax(8).x,
          y: calculateParallax(8).y
        }}
      />

      {/* Main content container with enhanced parallax effect */}
      <motion.div
        className="relative z-10 max-w-3xl px-6 text-center"
        style={{
          x: calculateParallax(40).x,
          y: calculateParallax(40).y + scrollRaceEffect(0.05).y
        }}
      >
        {/* Cosmic dust ring around 404 */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-indigo-100 opacity-50 dark:border-purple-500/30 dark:opacity-70"
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ opacity: 0.7, scale: 1.2, rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-100 opacity-40 dark:border-indigo-500/20 dark:opacity-50"
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ opacity: 0.5, scale: 1.4, rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* 404 Title with enhanced gradient */}
        <motion.h1
          className="relative z-10 mb-6 text-6xl font-bold sm:text-7xl md:text-8xl lg:text-9xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 dark:drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]">
            404
          </span>
        </motion.h1>

        {/* Time-based greeting with enhanced animation */}
        <motion.h2
          className="mb-4 bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-2xl font-semibold text-transparent dark:from-white dark:to-slate-300 sm:text-3xl md:text-4xl"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={textVariants}
        >
          {greeting}, Explorer!
        </motion.h2>

        {/* Additional helpful information */}
        <motion.div
          className="mx-auto mb-12 max-w-lg"
          custom={2.5}
          initial="hidden"
          animate="visible"
          variants={textVariants}
        >
          <div className="rounded-lg border border-indigo-100 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-purple-500/20 dark:bg-white/10">
            <h4 className="mb-3 text-lg font-medium text-indigo-800 dark:text-white">
              What might have happened:
            </h4>
            <ul className="space-y-2 text-left text-indigo-700 dark:text-slate-300">
              <li className="flex items-start">
                <span className="mr-2 text-indigo-500 dark:text-purple-400">
                  •
                </span>
                <span>The URL might have been mistyped</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-indigo-500 dark:text-purple-400">
                  •
                </span>
                <span>The page may have been moved or deleted</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-indigo-500 dark:text-purple-400">
                  •
                </span>
                <span>You might not have permission to view this page</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Enhanced floating astronaut */}
        <motion.div
          className="relative mx-auto mb-16 h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64"
          initial="hidden"
          animate={["visible", "float"]}
          variants={astronautVariants}
        >
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full drop-shadow-[0_0_10px_rgba(79,70,229,0.2)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
          >
            {/* Astronaut body */}
            <motion.ellipse
              cx="100"
              cy="110"
              rx="40"
              ry="50"
              fill="#e0e7ff"
              stroke="#818cf8"
              strokeWidth="2"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Helmet */}
            <motion.circle
              cx="100"
              cy="70"
              r="30"
              fill="#312e81"
              stroke="#818cf8"
              strokeWidth="2"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Helmet glass */}
            <motion.ellipse
              cx="100"
              cy="70"
              rx="22"
              ry="20"
              fill="#000"
              stroke="#4f46e5"
              strokeWidth="1"
              animate={{
                opacity: [0.9, 0.7, 0.9],
                filter: ["blur(0px)", "blur(1px)", "blur(0px)"]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Helmet reflection */}
            <motion.ellipse
              cx="95"
              cy="65"
              rx="10"
              ry="8"
              fill="#a5b4fc"
              fillOpacity="0.5"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Stars reflection in helmet */}
            <motion.circle cx="90" cy="62" r="2" fill="white" opacity="0.8" />
            <motion.circle
              cx="105"
              cy="68"
              r="1.5"
              fill="white"
              opacity="0.6"
            />
            <motion.circle cx="100" cy="75" r="1" fill="white" opacity="0.7" />

            {/* Backpack */}
            <motion.rect
              x="70"
              y="90"
              width="60"
              height="45"
              rx="10"
              fill="#4338ca"
              stroke="#818cf8"
              strokeWidth="1.5"
              animate={{ y: [90, 92, 90] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Arms */}
            <motion.path
              d="M60,100 Q50,110 55,140"
              fill="transparent"
              stroke="#e0e7ff"
              strokeWidth="10"
              strokeLinecap="round"
              animate={{
                d: [
                  "M60,100 Q50,110 55,140",
                  "M60,100 Q48,115 55,140",
                  "M60,100 Q50,110 55,140"
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.path
              d="M140,100 Q150,110 145,140"
              fill="transparent"
              stroke="#e0e7ff"
              strokeWidth="10"
              strokeLinecap="round"
              animate={{
                d: [
                  "M140,100 Q150,110 145,140",
                  "M140,100 Q152,115 145,140",
                  "M140,100 Q150,110 145,140"
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />

            {/* Legs */}
            <motion.path
              d="M80,160 Q80,180 75,190"
              fill="transparent"
              stroke="#e0e7ff"
              strokeWidth="12"
              strokeLinecap="round"
              animate={{
                d: [
                  "M80,160 Q80,180 75,190",
                  "M80,160 Q82,182 75,190",
                  "M80,160 Q80,180 75,190"
                ]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.path
              d="M120,160 Q120,180 125,190"
              fill="transparent"
              stroke="#e0e7ff"
              strokeWidth="12"
              strokeLinecap="round"
              animate={{
                d: [
                  "M120,160 Q120,180 125,190",
                  "M120,160 Q118,182 125,190",
                  "M120,160 Q120,180 125,190"
                ]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />

            {/* Oxygen tube */}
            <motion.path
              d="M80,80 C70,85 65,95 70,110"
              fill="transparent"
              stroke="#a5b4fc"
              strokeWidth="2"
              strokeDasharray="2 1"
              animate={{
                d: [
                  "M80,80 C70,85 65,95 70,110",
                  "M80,80 C68,87 63,97 70,110",
                  "M80,80 C70,85 65,95 70,110"
                ]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Floating disconnected cable */}
            <motion.path
              d="M130,140 C140,130 150,140 145,150 C140,160 150,170 155,165"
              fill="transparent"
              stroke="#a5b4fc"
              strokeWidth="2"
              strokeDasharray="3 1"
              animate={{
                d: [
                  "M130,140 C140,130 150,140 145,150 C140,160 150,170 155,165",
                  "M130,140 C145,135 155,145 145,155 C140,165 155,170 160,165",
                  "M130,140 C140,130 150,140 145,150 C140,160 150,170 155,165"
                ]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </motion.div>

        {/* Navigation options */}
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={textVariants}
        >
          {/* Home button */}
          <motion.div initial="initial" whileHover="hover" className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-75 blur-md dark:from-violet-600 dark:to-indigo-600"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <Link
              href="/"
              className="relative inline-block rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-base font-medium text-white shadow-lg dark:from-violet-600 dark:to-indigo-600 sm:px-8 sm:text-lg"
            >
              Return to Homepage
            </Link>
          </motion.div>

          {/* Go back button */}
          <motion.div initial="initial" whileHover="hover" className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 opacity-75 blur-md"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            <button
              onClick={() => window.history.back()}
              className="relative inline-block rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-base font-medium text-white shadow-lg sm:px-8 sm:text-lg"
            >
              Go Back
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Additional cosmic elements with scroll race effect */}
      <motion.div
        className="absolute h-1 w-40 rotate-45 bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-40 blur-sm dark:via-purple-500 dark:opacity-70"
        style={{
          top: "15%",
          left: "5%",
          ...scrollRaceEffect(-0.2)
        }}
      />

      <motion.div
        className="absolute h-1 w-56 -rotate-45 bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-40 blur-sm dark:via-indigo-500 dark:opacity-70"
        style={{
          bottom: "10%",
          right: "5%",
          ...scrollRaceEffect(0.2)
        }}
      />

      {/* Small planets */}
      <motion.div
        className="absolute h-6 w-6 rounded-full bg-gradient-to-br from-amber-100 to-amber-300 opacity-40 dark:from-amber-200 dark:to-amber-500 dark:opacity-90"
        style={{
          top: "40%",
          left: "15%",
          x: calculateParallax(5).x,
          y: calculateParallax(5).y + scrollRaceEffect(-0.3).y
        }}
        animate={{
          boxShadow: [
            "0 0 5px rgba(251, 191, 36, 0.4)",
            "0 0 10px rgba(251, 191, 36, 0.4)",
            "0 0 5px rgba(251, 191, 36, 0.4)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-300 opacity-30 dark:from-emerald-300 dark:to-emerald-600 dark:opacity-80"
        style={{
          bottom: "30%",
          right: "25%",
          x: calculateParallax(8).x,
          y: calculateParallax(8).y + scrollRaceEffect(0.4).y
        }}
        animate={{
          boxShadow: [
            "0 0 5px rgba(16, 185, 129, 0.4)",
            "0 0 10px rgba(16, 185, 129, 0.4)",
            "0 0 5px rgba(16, 185, 129, 0.4)"
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
